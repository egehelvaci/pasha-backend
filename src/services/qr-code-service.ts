import crypto from 'crypto'
import prisma from '../utils/prisma'

export class QRCodeService {
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
          }
        }
      })

      if (!order) {
        throw new Error('Sipariş bulunamadı')
      }

      if (order.status !== 'PENDING') {
        throw new Error('Sadece bekleyen siparişler için QR kod oluşturulabilir')
      }

      const qrCodes = []

      // Her sipariş öğesi için QR kod oluştur
      for (const item of order.items) {
        // Her ürün adedi için ayrı QR kod oluştur
        for (let i = 0; i < item.quantity; i++) {
          const qrCode = this.generateUniqueQRCode()
          
          const createdQRCode = await prisma.qRCode.create({
            data: {
              order_id: orderId,
              product_id: item.product_id,
              order_item_id: item.id,
              qr_code: qrCode,
              quantity: 1 // Her QR kod bir adet için
            }
          })

          qrCodes.push(createdQRCode)
        }
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

      if (qrRecord.is_scanned) {
        throw new Error('Bu QR kod daha önce okunmuş')
      }

      // QR kodu okundu olarak işaretle
      await prisma.qRCode.update({
        where: { id: qrRecord.id },
        data: {
          is_scanned: true,
          scanned_at: new Date()
        }
      })

      // Siparişteki tüm QR kodların okunup okunmadığını kontrol et
      const allQRCodes = await prisma.qRCode.findMany({
        where: { order_id: qrRecord.order_id }
      })

      const scannedCount = allQRCodes.filter(qr => qr.is_scanned).length
      const totalCount = allQRCodes.length

      // Tüm QR kodlar okunduysa siparişi teslim edildi olarak işaretle
      if (scannedCount === totalCount) {
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
          is_scanned: qrRecord.is_scanned,
          scanned_at: qrRecord.scanned_at,
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
          scannedCount,
          totalCount,
          isOrderCompleted: scannedCount === totalCount,
          completionPercentage: Math.round((scannedCount / totalCount) * 100)
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

          if (qrRecord.is_scanned) {
            errors.push({ qrCode, error: 'Bu QR kod daha önce okunmuş' })
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

          // QR kodu okundu olarak işaretle
          await prisma.qRCode.update({
            where: { id: qrRecord.id },
            data: {
              is_scanned: true,
              scanned_at: new Date()
            }
          })

          results.push({
            qrCode,
            id: qrRecord.id,
            productName: qrRecord.product.name,
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

        const scannedCount = allQRCodes.filter(qr => qr.is_scanned).length
        const totalCount = allQRCodes.length

        deliveryInfo = {
          scannedCount,
          totalCount,
          isOrderCompleted: scannedCount === totalCount,
          completionPercentage: Math.round((scannedCount / totalCount) * 100)
        }

        // Tüm QR kodlar okunduysa siparişi teslim edildi olarak işaretle
        if (scannedCount === totalCount) {
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
      
      const totalQRCodes = await prisma.qRCode.count({ where })
      const scannedQRCodes = await prisma.qRCode.count({ 
        where: { ...where, is_scanned: true } 
      })

      return {
        total: totalQRCodes,
        scanned: scannedQRCodes,
        pending: totalQRCodes - scannedQRCodes,
        completionRate: totalQRCodes > 0 ? Math.round((scannedQRCodes / totalQRCodes) * 100) : 0
      }
    } catch (error: any) {
      throw new Error(`QR kod istatistikleri alınırken hata: ${error.message}`)
    }
  }
}

export const qrCodeService = new QRCodeService() 