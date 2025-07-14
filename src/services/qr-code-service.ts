import crypto from 'crypto'
import prisma from '../utils/prisma'
import { UploadService } from '../utils/upload-service'
import * as QRCode from 'qrcode'

export class QRCodeService {
  /**
   * Sipariş için QR kod görselleri oluşturur, Tebi'ye yükler ve DB'yi günceller
   */
  async generateQRCodeImagesForOrder(orderId: string) {
    const uploadService = new UploadService()

    // Siparişin durumunu kontrol et
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true }
    });

    if (!order) {
      throw new Error('Sipariş bulunamadı.');
    }

    if (order.status !== 'CONFIRMED') {
      throw new Error(`QR kod görselleri sadece 'ONAYLANMIŞ' (CONFIRMED) siparişler için oluşturulabilir. Bu siparişin durumu: ${order.status}`);
    }

    // 1. Siparişe ait, henüz görseli oluşturulmamış QR kodlarını bul
    const qrRecords = await prisma.qRCode.findMany({
      where: {
        order_id: orderId,
        qrCodeImageUrl: null // Henüz görseli olmayanlar
      },
      select: {
        id: true,
        qr_code: true,
        required_scans: true
      }
    })

    if (qrRecords.length === 0) {
      return {
        success: true,
        message: 'Bu sipariş için oluşturulacak yeni QR kod görseli bulunmamaktadır.',
        processedCount: 0,
        generatedImages: []
      }
    }

    let processedCount = 0
    const generatedImages: { qr_code: string, imageUrl: string, required_scans: number }[] = [];

    // 2. Her bir QR kod için görsel oluştur ve yükle
    for (const record of qrRecords) {
      try {
        // QR kod verisinden PNG formatında bir buffer oluştur
        const qrImageBuffer = await QRCode.toBuffer(record.qr_code, {
          type: 'png',
          width: 300,
          margin: 1,
          errorCorrectionLevel: 'H'
        })

        // Dosyayı Tebi'ye yükle
        const fileName = `${record.qr_code}.png`
        const imageUrl = await uploadService.uploadFile(
          qrImageBuffer,
          'image/png',
          fileName
        )

        // Veritabanındaki kaydı güncelle
        await prisma.qRCode.update({
          where: { id: record.id },
          data: { qrCodeImageUrl: imageUrl }
        })

        processedCount++
        generatedImages.push({ 
          qr_code: record.qr_code, 
          imageUrl: imageUrl,
          required_scans: record.required_scans 
        });
      } catch (error) {
        console.error(`QR kod ${record.qr_code} için görsel oluşturulurken veya yüklenirken hata oluştu:`, error)
        // Hata durumunda bile diğerlerini denemeye devam et
      }
    }

    return {
      success: true,
      message: `${processedCount} adet QR kod görseli başarıyla oluşturuldu ve yüklendi.`,
      processedCount,
      generatedImages
    }
  }

  /**
   * Sipariş için QR kodları oluştur
   * Her ürün çeşidi için ayrı QR kod oluşturulur
   */
  async generateQRCodesForOrder(orderId: string) {
    try {
      // Siparişin mevcut olup olmadığını kontrol et
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          },
          qr_codes: true
        }
      })

      if (!order) {
        throw new Error('Sipariş bulunamadı')
      }

      // Eğer mevcut QR kodlar varsa, yeni sisteme uygun olup olmadığını kontrol et
      if (order.qr_codes.length > 0) {
        console.log(`🔍 Mevcut QR kodlar kontrol ediliyor. QR sayısı: ${order.qr_codes.length}, Item sayısı: ${order.items.length}`)
        
        // Yeni sistem kontrolü: 
        // 1. QR kod sayısı item sayısına eşit olmalı
        // 2. Her QR kodun required_scans değeri o item'ın quantity'sine eşit olmalı
        const isCorrectQRCount = order.qr_codes.length === order.items.length
        console.log(`📊 QR kod sayısı doğru mu: ${isCorrectQRCount}`)
        
        let isNewSystemCorrect = true
        if (isCorrectQRCount) {
          // Her QR kodun required_scans değerini kontrol et
          for (const qr of order.qr_codes) {
            const relatedItem = order.items.find(item => item.id === qr.order_item_id)
            if (!relatedItem || qr.required_scans !== relatedItem.quantity) {
              console.log(`❌ QR ${qr.qr_code} - Required: ${qr.required_scans}, Item Quantity: ${relatedItem?.quantity}`)
              isNewSystemCorrect = false
              break
            } else {
              console.log(`✅ QR ${qr.qr_code} - Required: ${qr.required_scans}, Item Quantity: ${relatedItem.quantity}`)
            }
          }
        }

        console.log(`🎯 Yeni sistem kontrolü sonucu - QR sayısı doğru: ${isCorrectQRCount}, Sistem doğru: ${isNewSystemCorrect}`)
        
        if (!isCorrectQRCount || !isNewSystemCorrect) {
          // Eski sistem veya yanlış konfigürasyon - temizle
          console.log(`🗑️ Eski/hatalı sistem tespit edildi, QR kodlar temizleniyor...`)
          await prisma.qRCode.deleteMany({
            where: { order_id: orderId }
          })
          console.log(`🗑️ Sipariş ${orderId} için eski/hatalı QR kodlar silindi. Item sayısı: ${order.items.length}, QR sayısı: ${order.qr_codes.length}`)
        } else {
          // Zaten yeni sistemde - tekrar oluşturma
          console.log(`✅ Sipariş ${orderId} zaten yeni QR kod sisteminde`)
          return {
            success: true,
            qrCodes: order.qr_codes,
            totalQRCodes: order.qr_codes.length
          }
        }
      }

      const qrCodes = []

      console.log(`🚀 Yeni sistem ile QR kod oluşturuluyor. Item sayısı: ${order.items.length}`)
      
      // Her sipariş öğesi için tek QR kod oluştur
      for (const item of order.items) {
        const qrCode = this.generateUniqueQRCode()
        
        console.log(`📦 Item ID: ${item.id}, Quantity: ${item.quantity}, Required Scans: ${item.quantity}`)
        
        const createdQRCode = await prisma.qRCode.create({
          data: {
            order_id: orderId,
            product_id: item.product_id,
            order_item_id: item.id,
            qr_code: qrCode,
            required_scans: item.quantity, // Bu item için gerekli tarama sayısı
            scan_count: 0 // Henüz taranmadı
          }
        })

        console.log(`✅ QR kod oluşturuldu: ${createdQRCode.qr_code}, Required Scans: ${createdQRCode.required_scans}`)
        qrCodes.push(createdQRCode)
      }

      // Siparişi onaylandı olarak işaretle
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'CONFIRMED',
          updated_at: new Date()
        }
      })

      return {
        success: true,
        qrCodes,
        totalQRCodes: qrCodes.length
      }
    } catch (error: any) {
      throw new Error(`QR kod oluşturma hatası: ${error.message}`)
    }
  }

  /**
   * Sipariş için stokları düşür
   */
  async reduceStockForOrder(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true
        }
      })

      if (!order) {
        throw new Error('Sipariş bulunamadı')
      }

      // Her sipariş öğesi için stok düşür
      for (const item of order.items) {
        console.log(`🔍 Stok düşürme: ${item.product_id} - ${item.width}x${item.height} - Saçak: ${item.has_fringe} - Adet: ${item.quantity}`)
        
        // 1. En spesifik eşleşme: tam boyut + saçak durumu
        let variations = await prisma.productvariations.findMany({
          where: {
            product_id: item.product_id,
            width: item.width ? Math.round(Number(item.width)) : undefined,
            height: item.height ? Math.round(Number(item.height)) : undefined,
            has_fringe: item.has_fringe || false
          }
        })

        console.log(`📊 Spesifik eşleşme (${item.width}x${item.height}, saçak:${item.has_fringe}): ${variations.length} varyasyon`)

        // 2. Saçak durumu esnek eşleşme: tam boyut + farklı saçak durumu
        if (variations.length === 0) {
          variations = await prisma.productvariations.findMany({
            where: {
              product_id: item.product_id,
              width: item.width ? Math.round(Number(item.width)) : undefined,
              height: item.height ? Math.round(Number(item.height)) : undefined,
              has_fringe: !(item.has_fringe || false) // Tersini dene
            }
          })
          
          if (variations.length > 0) {
            console.log(`📊 Saçak esnek eşleşme (${item.width}x${item.height}, saçak:${!(item.has_fringe || false)}): ${variations.length} varyasyon`)
          }
        }

        // 3. Saçak durumunu tamamen yok say: sadece boyut eşleşmesi
        if (variations.length === 0) {
          variations = await prisma.productvariations.findMany({
            where: {
              product_id: item.product_id,
              width: item.width ? Math.round(Number(item.width)) : undefined,
              height: item.height ? Math.round(Number(item.height)) : undefined
            }
          })
          
          if (variations.length > 0) {
            console.log(`📊 Boyut eşleşme (${item.width}x${item.height}, saçak görmezden): ${variations.length} varyasyon`)
          }
        }

        // 4. En esnek eşleşme: sadece ürün ID'si (tüm varyasyonlar)
        if (variations.length === 0) {
          variations = await prisma.productvariations.findMany({
            where: {
              product_id: item.product_id
            }
          })
          
          if (variations.length > 0) {
            console.log(`📊 Ürün ID eşleşme (tüm varyasyonlar): ${variations.length} varyasyon`)
            console.log(`⚠️  UYARI: ${item.product_id} için spesifik boyut bulunamadı, tüm varyasyonlar kullanılacak`)
          }
        }

        if (variations.length > 0) {
          // Toplam stok kontrolü (tüm eşleşen varyasyonlardan)
          const totalStock = variations.reduce((sum, v) => sum + v.stock_quantity, 0)
          
          if (totalStock < item.quantity) {
            throw new Error(`${item.product_id} ürünü için yeterli stok yok. Mevcut toplam stok: ${totalStock}, İstenen: ${item.quantity}`)
          }

          // Stok düşürme - önce en yüksek stoklu varyasyondan başla
          const sortedVariations = variations.sort((a, b) => b.stock_quantity - a.stock_quantity)
          let remainingQuantity = item.quantity

          for (const variation of sortedVariations) {
            if (remainingQuantity <= 0) break

            const quantityToReduce = Math.min(variation.stock_quantity, remainingQuantity)
            
            if (quantityToReduce > 0) {
              await prisma.productvariations.update({
                where: { id: variation.id },
                data: {
                  stock_quantity: variation.stock_quantity - quantityToReduce
                }
              })

              console.log(`✅ ${item.product_id} - Varyasyon ${variation.id}: ${quantityToReduce} adet düşürüldü (${variation.width}x${variation.height}, saçak:${variation.has_fringe}). Kalan: ${variation.stock_quantity - quantityToReduce}`)
              
              remainingQuantity -= quantityToReduce
            }
          }

          console.log(`🎯 ${item.product_id} toplam ${item.quantity} adet stok düşürüldü`)
        } else {
          console.warn(`❌ ${item.product_id} ürünü için hiçbir varyasyon bulunamadı`)
          // Hata vermek yerine uyarı ver ve devam et
          console.warn(`⚠️  Stok düşürme atlandı: ${item.product_id} - ${item.width}x${item.height}`)
        }
      }

      return { success: true }
    } catch (error: any) {
      throw new Error(`Stok düşürme hatası: ${error.message}`)
    }
  }

  /**
   * QR kod okut ve teslim durumunu güncelle
   * QR koddan ürünün tüm detayları okunabilir
   */
  async scanQRCode(qrCode: string, adminUserId: string) {
    try {
      // QR kod kontrolü - ürünün tüm detayları ile birlikte
      const qrRecord = await prisma.qRCode.findUnique({
        where: { qr_code: qrCode },
        include: {
          order: {
            include: {
              user: {
                include: {
                  Store: true,
                  userType: true
                }
              },
              items: {
                include: {
                  product: {
                    include: {
                      collection: true,
                      productvariations: true
                    }
                  }
                }
              }
            }
          },
                      product: {
              include: {
                collection: true,
                productvariations: {
                  include: {
                    cuttypes: true
                  }
                },
                productrules: {
                  include: {
                    productrulecuttypes: {
                      include: {
                        cuttypes: true
                      }
                    }
                  }
                }
              }
            },
          order_item: {
            include: {
              product: {
                include: {
                  collection: true,
                  productrules: {
                    include: {
                      productrulecuttypes: {
                        include: {
                          cuttypes: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!qrRecord) {
        throw new Error('Geçersiz QR kod')
      }

      // QR kodun tamamlanıp tamamlanmadığını kontrol et
      if (qrRecord.scan_count >= qrRecord.required_scans) {
        throw new Error(`Bu QR kod zaten tamamlanmış (${qrRecord.scan_count}/${qrRecord.required_scans} tarama)`)
      }

      // Tarama sayısını artır
      const newScanCount = qrRecord.scan_count + 1
      const isCompleted = newScanCount >= qrRecord.required_scans

      await prisma.qRCode.update({
        where: { id: qrRecord.id },
        data: {
          scan_count: newScanCount,
          is_scanned: isCompleted,
          scanned_at: isCompleted ? new Date() : qrRecord.scanned_at
        }
      })

      // Siparişteki tüm QR kodların tamamlanıp tamamlanmadığını kontrol et
      const allQRCodes = await prisma.qRCode.findMany({
        where: { order_id: qrRecord.order_id }
      })

      // QR kodlar üzerinde güncellenmiş scan_count değerlerini kullanarak hesapla
      const updatedQRCodes = allQRCodes.map(qr => {
        if (qr.id === qrRecord.id) {
          return { ...qr, scan_count: newScanCount, is_scanned: isCompleted }
        }
        return qr
      })

      const completedQRCodes = updatedQRCodes.filter(qr => qr.scan_count >= qr.required_scans)
      const totalQRCodes = updatedQRCodes.length

      // Tüm QR kodlar gerekli sayıda tarandıysa siparişi teslim edildi olarak işaretle
      if (completedQRCodes.length === totalQRCodes) {
        await prisma.order.update({
          where: { id: qrRecord.order_id },
          data: {
            status: 'DELIVERED',
            updated_at: new Date()
          }
        })
      }

      // İlgili ürün varyasyonunu bul (boyut ve saçak durumuna göre)
      const relevantVariation = qrRecord.product.productvariations.find(v => 
        v.width === Math.round(Number(qrRecord.order_item?.width)) &&
        v.height === Math.round(Number(qrRecord.order_item?.height)) &&
        v.has_fringe === (qrRecord.order_item?.has_fringe || false)
      )

      // Ürün detaylarını hazırla - kesim türü ve kural bilgileri dahil
      const productDetails = {
        id: qrRecord.product.productId,
        name: qrRecord.product.name,
        description: qrRecord.product.description,
        image: qrRecord.product.productImage,
        collection: qrRecord.product.collection,
        productRules: qrRecord.product.productrules ? {
          name: qrRecord.product.productrules.name,
          description: qrRecord.product.productrules.description,
          can_have_fringe: qrRecord.product.productrules.can_have_fringe,
          availableCutTypes: qrRecord.product.productrules.productrulecuttypes.map(prc => ({
            id: prc.cuttypes.id,
            name: prc.cuttypes.name
          }))
        } : null,
        orderItemDetails: {
          quantity: qrRecord.order_item?.quantity,
          width: qrRecord.order_item?.width,
          height: qrRecord.order_item?.height,
          has_fringe: qrRecord.order_item?.has_fringe,
          cut_type: qrRecord.order_item?.cut_type,
          unit_price: qrRecord.order_item?.unit_price,
          total_price: qrRecord.order_item?.total_price,
          // Aktual kesim türü bilgisi (varyasyondan)
          actualCutType: relevantVariation?.cuttypes ? {
            id: relevantVariation.cuttypes.id,
            name: relevantVariation.cuttypes.name
          } : null,
          // Stok bilgisi
          stockInfo: relevantVariation ? {
            current_stock: relevantVariation.stock_quantity,
            variation_id: relevantVariation.id
          } : null
        }
      }

      return {
        success: true,
        qrCode: {
          id: qrRecord.id,
          qr_code: qrRecord.qr_code,
          is_scanned: isCompleted,
          scan_count: newScanCount,
          required_scans: qrRecord.required_scans,
          scanned_at: isCompleted ? new Date() : qrRecord.scanned_at,
          created_at: qrRecord.created_at
        },
        productDetails,
        order: {
          id: qrRecord.order.id,
          status: qrRecord.order.status,
          total_price: qrRecord.order.total_price,
          customer: {
            name: qrRecord.order.user.name,
            email: qrRecord.order.user.email,
            store: qrRecord.order.user.Store,
            userType: qrRecord.order.user.userType
          },
          created_at: qrRecord.order.created_at,
          updated_at: qrRecord.order.updated_at
        },
        deliveryInfo: {
          completedQRCodes: completedQRCodes.length,
          totalQRCodes: totalQRCodes,
          isOrderCompleted: completedQRCodes.length === totalQRCodes,
          completionPercentage: Math.round((completedQRCodes.length / totalQRCodes) * 100),
          currentQRProgress: {
            scan_count: newScanCount,
            required_scans: qrRecord.required_scans,
            is_completed: isCompleted
          }
        }
      }
    } catch (error: any) {
      throw new Error(`QR kod okuma hatası: ${error.message}`)
    }
  }

  /**
   * Birden çok QR kod okut ve teslim durumunu güncelle
   * Tüm QR kodlar başarıyla okunursa sipariş durumu DELIVERED olur
   */
  async scanMultipleQRCodes(qrCodes: string[], adminUserId: string) {
    try {
      const results = []
      const errors = []
      let orderToCheck: string | null = null
      
      // Her QR kod için işlem yap
      for (const qrCode of qrCodes) {
        try {
          // QR kod kontrolü
          const qrRecord = await prisma.qRCode.findUnique({
            where: { qr_code: qrCode },
            include: {
              order: {
                include: {
                  user: {
                    include: {
                      Store: true,
                      userType: true
                    }
                  }
                }
              },
              product: true,
              order_item: true
            }
          })

          if (!qrRecord) {
            errors.push({ qrCode, error: 'Geçersiz QR kod' })
            continue
          }

          // QR kodun tamamlanıp tamamlanmadığını kontrol et
          if (qrRecord.scan_count >= qrRecord.required_scans) {
            errors.push({ qrCode, error: `Bu QR kod zaten tamamlanmış (${qrRecord.scan_count}/${qrRecord.required_scans} tarama)` })
            continue
          }

          // İlk QR koddan sipariş ID'sini al
          if (!orderToCheck) {
            orderToCheck = qrRecord.order_id
          }

          // Tüm QR kodların aynı siparişe ait olduğunu kontrol et
          if (qrRecord.order_id !== orderToCheck) {
            errors.push({ qrCode, error: 'QR kodlar farklı siparişlere ait' })
            continue
          }

          // Tarama sayısını artır
          const newScanCount = qrRecord.scan_count + 1
          const isCompleted = newScanCount >= qrRecord.required_scans

          await prisma.qRCode.update({
            where: { id: qrRecord.id },
            data: {
              scan_count: newScanCount,
              is_scanned: isCompleted,
              scanned_at: isCompleted ? new Date() : qrRecord.scanned_at
            }
          })

          results.push({
            qrCode,
            id: qrRecord.id,
            productName: qrRecord.product.name,
            scan_count: newScanCount,
            required_scans: qrRecord.required_scans,
            is_completed: isCompleted,
            scanned_at: new Date()
          })

        } catch (error: any) {
          errors.push({ qrCode, error: error.message })
        }
      }

      // Eğer hiç başarılı QR kod yoksa hata döndür
      if (results.length === 0) {
        throw new Error('Hiçbir QR kod başarıyla okunamadı')
      }

      // Siparişteki tüm QR kodların durumunu kontrol et
      let orderInfo = null
      let deliveryInfo = null
      
      if (orderToCheck) {
        const allQRCodes = await prisma.qRCode.findMany({
          where: { order_id: orderToCheck }
        })

        const completedQRCodes = allQRCodes.filter(qr => qr.scan_count >= qr.required_scans)
        const totalQRCodes = allQRCodes.length

        deliveryInfo = {
          completedQRCodes: completedQRCodes.length,
          totalQRCodes: totalQRCodes,
          isOrderCompleted: completedQRCodes.length === totalQRCodes,
          completionPercentage: Math.round((completedQRCodes.length / totalQRCodes) * 100)
        }

        // Tüm QR kodlar gerekli sayıda tarandıysa siparişi teslim edildi olarak işaretle
        if (completedQRCodes.length === totalQRCodes) {
          await prisma.order.update({
            where: { id: orderToCheck },
            data: {
              status: 'DELIVERED',
              updated_at: new Date()
            }
          })

          // Güncellenmiş sipariş bilgilerini al
          const updatedOrder = await prisma.order.findUnique({
            where: { id: orderToCheck },
            include: {
              user: {
                include: {
                  Store: true,
                  userType: true
                }
              }
            }
          })

          orderInfo = {
            id: updatedOrder!.id,
            status: updatedOrder!.status,
            total_price: updatedOrder!.total_price,
            customer: {
              name: updatedOrder!.user.name,
              email: updatedOrder!.user.email,
              store: updatedOrder!.user.Store,
              userType: updatedOrder!.user.userType
            },
            updated_at: updatedOrder!.updated_at
          }
        }
      }

      return {
        success: true,
        results,
        errors,
        deliveryInfo,
        orderInfo,
        summary: {
          totalSubmitted: qrCodes.length,
          successfullyScanned: results.length,
          failed: errors.length,
          isOrderCompleted: deliveryInfo?.isOrderCompleted || false
        }
      }
    } catch (error: any) {
      throw new Error(`Çoklu QR kod okuma hatası: ${error.message}`)
    }
  }

  /**
   * Sipariş için QR kodları listele
   */
  async getQRCodesForOrder(orderId: string) {
    try {
      const qrCodes = await prisma.qRCode.findMany({
        where: { order_id: orderId },
        include: {
          product: true,
          order_item: true
        },
        orderBy: { created_at: 'asc' }
      })

      const scannedCount = qrCodes.filter(qr => qr.is_scanned).length
      const totalCount = qrCodes.length

      return {
        qrCodes,
        scannedCount,
        totalCount,
        completionPercentage: totalCount > 0 ? Math.round((scannedCount / totalCount) * 100) : 0
      }
    } catch (error: any) {
      throw new Error(`QR kod listesi alınırken hata: ${error.message}`)
    }
  }

  /**
   * Benzersiz QR kod oluştur
   */
  private generateUniqueQRCode(): string {
    const timestamp = Date.now()
    const randomBytes = crypto.randomBytes(8).toString('hex')
    return `PASHA-${timestamp}-${randomBytes}`.toUpperCase()
  }

  /**
   * QR kod istatistikleri
   */
  async getQRCodeStats(orderId?: string) {
    try {
      const where = orderId ? { order_id: orderId } : {}
      
      const allQRCodes = await prisma.qRCode.findMany({ where })
      const totalQRCodes = allQRCodes.length
      
      // QR kodları tamamlanma durumuna göre grupla
      const completedQRCodes = allQRCodes.filter(qr => qr.scan_count >= qr.required_scans)
      const partiallyScannedQRCodes = allQRCodes.filter(qr => qr.scan_count > 0 && qr.scan_count < qr.required_scans)
      const notScannedQRCodes = allQRCodes.filter(qr => qr.scan_count === 0)

      // Toplam tarama bilgileri
      const totalScans = allQRCodes.reduce((sum, qr) => sum + qr.scan_count, 0)
      const totalRequiredScans = allQRCodes.reduce((sum, qr) => sum + qr.required_scans, 0)

      return {
        total: totalQRCodes,
        completed: completedQRCodes.length,
        partiallyScanned: partiallyScannedQRCodes.length,
        notScanned: notScannedQRCodes.length,
        completionRate: totalQRCodes > 0 ? Math.round((completedQRCodes.length / totalQRCodes) * 100) : 0,
        scanProgress: {
          totalScans,
          totalRequiredScans,
          scanPercentage: totalRequiredScans > 0 ? Math.round((totalScans / totalRequiredScans) * 100) : 0
        }
      }
    } catch (error: any) {
      throw new Error(`QR kod istatistikleri alınırken hata: ${error.message}`)
    }
  }
}

export const qrCodeService = new QRCodeService() 