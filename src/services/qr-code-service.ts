import crypto from 'crypto'
import prisma from '../utils/prisma'
import { UploadService } from '../utils/upload-service'
import { EmployeeAssignmentService } from './employee-assignment-service'
import { notificationService } from './notification-service'

const employeeAssignmentService = new EmployeeAssignmentService()

const QRCode = require('qrcode');

export class QRCodeService {
  /**
   * QR kod görsel oluşturma işlemini çalıştır
   */
  async generateQRCodeImagesForOrderQueued(orderId: string): Promise<boolean> {
    try {
      await this.generateQRCodeImagesForOrder(orderId);
      return true;
    } catch (error) {
      console.error('QR kod oluşturma hatası:', error);
      return false;
    }
  }

  /**
   * Mağaza türüne göre QR kod içeriği formatını belirle
   */
  private async getQRContentByStoreType(orderId: string, orderItemId: string) {
    // Sipariş ve mağaza bilgilerini al
    const orderData = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            Store: {
              select: {
                store_type: true,
                kurum_adi: true,
                telefon: true,
                adres: true
              }
            }
          }
        },
        items: {
          where: { id: orderItemId },
          include: {
            product: {
              include: {
                collection: true
              }
            }
          }
        }
      }
    });

    if (!orderData || !orderData.items[0]) {
      throw new Error('Sipariş veya ürün bilgisi bulunamadı');
    }

    const store = orderData.user.Store;
    const item = orderData.items[0];
    const storeType = store?.store_type || 'KARGO';

    // Mağaza türüne göre farklı formatlar
    switch (storeType) {
      case 'KARGO':
      case 'AMBAR':
        // Kargo ve Ambar: adres, telefon ve ürün bilgileri
        return {
          siparis_id: orderId,
          item_id: orderItemId,
          magaza_adi: store?.kurum_adi || '',
          telefon: store?.telefon || '',
          adres: store?.adres || '',
          urun_adi: item.product.name,
          koleksiyon: item.product.collection.name,
          miktar: item.quantity,
          ebat: `${item.width}x${item.height}`,
          kesim_turu: item.cut_type || 'rectangle',
          tarih: orderData.created_at.toISOString().split('T')[0]
        };

      case 'SERVIS':
      case 'KENDI_ALAN':
        // Servis ve Kendi Alan: müşteri adı, ürün adı, ebat, kesim türü
        return {
          siparis_id: orderId,
          item_id: orderItemId,
          musteri_adi: `${orderData.user.name} ${orderData.user.surname}`,
          urun_adi: item.product.name,
          koleksiyon: item.product.collection.name,
          miktar: item.quantity,
          ebat: `${item.width}x${item.height}`,
          kesim_turu: item.cut_type || 'rectangle',
          saçak: item.has_fringe ? 'Var' : 'Yok',
          tarih: orderData.created_at.toISOString().split('T')[0]
        };

      default:
        // Varsayılan format (KARGO gibi)
        return {
          siparis_id: orderId,
          item_id: orderItemId,
          magaza_adi: store?.kurum_adi || '',
          telefon: store?.telefon || '',
          adres: store?.adres || '',
          urun_adi: item.product.name,
          koleksiyon: item.product.collection.name,
          miktar: item.quantity,
          ebat: `${item.width}x${item.height}`,
          kesim_turu: item.cut_type || 'rectangle',
          tarih: orderData.created_at.toISOString().split('T')[0]
        };
    }
  }

  /**
   * Sipariş için QR kod görselleri oluşturur, Tebi'ye yükler ve DB'yi günceller (asıl işlem)
   * Item bazlı sistem için güncellendi
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

    // Siparişe ait QR kodları bul
    const qrRecords = await prisma.qRCode.findMany({
      where: {
        order_id: orderId
      },
      select: {
        id: true,
        qr_code: true,
        qrCodeImageUrl: true
      }
    })

    if (qrRecords.length === 0) {
      throw new Error('Bu sipariş için QR kod bulunamadı.');
    }

    // Zaten görseli olan QR kodları filtrele
    const qrCodesNeedingImages = qrRecords.filter(qr => !qr.qrCodeImageUrl)

    if (qrCodesNeedingImages.length === 0) {
      return {
        success: true,
        message: 'Bu sipariş için tüm QR kod görselleri zaten mevcut.',
        processedCount: 0,
        generatedImages: []
      }
    }

    let successCount = 0
    const generatedImages = []

    // Her QR kod için görsel oluştur
    for (const qrRecord of qrCodesNeedingImages) {
      try {
        // QR kod verisinden PNG formatında bir buffer oluştur
        const qrImageBuffer = await QRCode.toBuffer(qrRecord.qr_code, {
          type: 'png',
          width: 300,
          margin: 1,
          errorCorrectionLevel: 'H'
        })

        // Dosyayı Tebi'ye yükle
        const fileName = `${qrRecord.qr_code}.png`
        const imageUrl = await uploadService.uploadFile(
          qrImageBuffer,
          'image/png',
          fileName,
          'qr_codes' // QR kodları için özel klasör
        )

        // Veritabanındaki kaydı güncelle
        await prisma.qRCode.update({
          where: { id: qrRecord.id },
          data: { qrCodeImageUrl: imageUrl }
        })

        generatedImages.push({ 
          qr_code: qrRecord.qr_code, 
          imageUrl: imageUrl
        })
        successCount++
      } catch (error) {
        console.error(`QR kod ${qrRecord.qr_code} için görsel oluşturulurken veya yüklenirken hata oluştu:`, error)
      }
    }

    return {
      success: true,
      message: `${successCount} QR kod görseli başarıyla oluşturuldu ve yüklendi.`,
      processedCount: successCount,
      generatedImages: generatedImages
    }
  }

  /**
   * Sipariş için item bazlı QR kodlar oluştur - Her farklı ürün tipi için 1 QR kod
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

      // Eğer mevcut QR kodlar varsa, bunları kontrol et
      if (order.qr_codes && order.qr_codes.length > 0) {
        console.log(`✅ Sipariş ${orderId} için ${order.qr_codes.length} QR kod zaten mevcut`)
        return {
          success: true,
          qrCodes: order.qr_codes,
          message: `Sipariş için ${order.qr_codes.length} QR kod zaten mevcut`
        }
      }

      const createdQRCodes = []

      // Her sipariş item'ı için 1 QR kod oluştur (quantity'den bağımsız)
      for (const item of order.items) {
        console.log(`🚀 Item ${item.id} için 1 adet QR kod oluşturuluyor (Ürün: ${item.product_id}, Miktar: ${item.quantity})`)
        
        const qrCodeString = this.generateUniqueQRCode()
        
        // Backend URL'ini al
        const backendUrl = process.env.PUBLIC_URL || 'https://pasha-backend-production.up.railway.app'
        
        // QR kod URL'ini oluştur (backend'e yönlendirecek)
        const qrCodeUrl = `${backendUrl}/api/admin/scan-qr?qrCode=${qrCodeString}`
        
        const createdQRCode = await prisma.qRCode.create({
          data: {
            order_id: orderId,
            order_item_id: item.id,
            product_id: item.product_id,
            qr_code: qrCodeUrl, // Backend URL'ini içeren QR kod
            is_scanned: false,
            scan_count: 0,
            required_scans: item.quantity // Item'ın quantity'si kadar okutulması gerekiyor
          }
        })

        createdQRCodes.push(createdQRCode)
        console.log(`✅ QR kod oluşturuldu: ${createdQRCode.qr_code}`)
      }

      console.log(`✅ Toplam ${createdQRCodes.length} QR kod oluşturuldu (${order.items.length} farklı ürün tipi için)`)

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
        qrCodes: createdQRCodes,
        message: `Sipariş için ${createdQRCodes.length} QR kod başarıyla oluşturuldu (${order.items.length} farklı ürün tipi)`,
        totalQRCodes: createdQRCodes.length,
        itemBreakdown: order.items.map(item => ({
          itemId: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          qrCodesGenerated: 1 // Her item için 1 QR kod
        }))
      }
    } catch (error: any) {
      console.error('QR kod oluşturma hatası:', error)
      throw new Error(`QR kod oluşturma hatası: ${error.message}`)
    }
  }

  /**
   * Sipariş için stokları düşür - Opsiyonel yükseklik kuralları destekli
   */
  async reduceStockForOrder(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  productrules: {
                    include: {
                      productsizeoptions: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!order) {
        throw new Error('Sipariş bulunamadı')
      }

      // Her sipariş öğesi için stok düşür
      for (const item of order.items) {
        console.log(`🔍 Stok düşürme: ${item.product_id} - ${item.width}x${item.height} - Saçak: ${item.has_fringe} - Adet: ${item.quantity}`)
        
        const itemWidth = item.width ? Math.round(Number(item.width)) : 0
        const itemHeight = item.height ? Math.round(Number(item.height)) : 0
        const itemHasFringe = item.has_fringe || false

        // Kullanılacak varyasyon boyutunu belirle (opsiyonel yükseklik kuralları dahil)
        let targetWidth = itemWidth
        let targetHeight = itemHeight

        // Ürün kuralını kontrol et
        if (item.product.rule_id && item.product.productrules) {
          const sizeOptions = item.product.productrules.productsizeoptions
          
          // Bu genişlik için opsiyonel yükseklik seçeneği var mı?
          const widthOption = sizeOptions.find(opt => opt.width === itemWidth)
          
          if (widthOption && widthOption.is_optional_height) {
            // Opsiyonel yükseklik kuralı var - maksimum yükseklik değerini kullan
            targetHeight = widthOption.height
            console.log(`📏 Opsiyonel yükseklik kuralı: ${itemWidth}x${itemHeight} → ${targetWidth}x${targetHeight} varyasyonu kullanılacak`)
          }
        }

        // En spesifik eşleşme: tam boyut + saçak durumu
        let variations = await prisma.productvariations.findMany({
          where: {
            product_id: item.product_id,
            width: targetWidth,
            height: targetHeight,
            has_fringe: itemHasFringe
          }
        })

        console.log(`📊 Spesifik eşleşme (${targetWidth}x${targetHeight}, saçak:${itemHasFringe}): ${variations.length} varyasyon`)

        // Saçak durumu esnek eşleşme
        if (variations.length === 0) {
          variations = await prisma.productvariations.findMany({
            where: {
              product_id: item.product_id,
              width: targetWidth,
              height: targetHeight,
              has_fringe: !itemHasFringe
            }
          })
          console.log(`📊 Esnek saçak eşleşme (${targetWidth}x${targetHeight}, saçak:${!itemHasFringe}): ${variations.length} varyasyon`)
        }

        // Stok düşürme - opsiyonel yükseklik vs hazır kesim
        if (variations.length > 0) {
          const variation = variations[0]
          
          // Ürünün opsiyonel yükseklik olup olmadığını kontrol et
          const sizeOptions = item.product.productrules?.productsizeoptions || []
          
          const isOptionalHeight = sizeOptions.some((so: any) => 
            so.width === variation.width && so.is_optional_height
          )
          
          let updateData: any = {}
          
          if (isOptionalHeight) {
            // Opsiyonel yükseklik: Sadece m² düşür
            const actualPieceAreaM2 = (itemWidth * itemHeight) / 10000;
            const usedAreaM2 = item.quantity * actualPieceAreaM2;
            const currentAreaM2 = Number(variation.stock_area_m2 || 0);
            const newAreaM2 = Math.max(0, currentAreaM2 - usedAreaM2);
            
            updateData.stock_area_m2 = newAreaM2;
            console.log(`📦 Opsiyonel yükseklik stok güncellendi: ${currentAreaM2} → ${newAreaM2}m² (Kullanılan: ${usedAreaM2}m²)`)
          } else {
            // Hazır kesim: Sadece adet düşür
            const newStock = Math.max(0, variation.stock_quantity - item.quantity)
            updateData.stock_quantity = newStock;
            console.log(`📦 Hazır kesim stok güncellendi: ${variation.stock_quantity} → ${newStock} adet`)
          }
          
          await prisma.productvariations.update({
            where: { id: variation.id },
            data: updateData
          })
          
        } else {
          console.log(`⚠️ Uygun varyasyon bulunamadı: ${item.product_id} - ${targetWidth}x${targetHeight}`)
        }
      }

      return { success: true }
    } catch (error: any) {
      throw new Error(`Stok düşürme hatası: ${error.message}`)
    }
  }

  /**
   * QR kod okut ve sipariş durumunu güncelle - Yeni mantık
   * İlk okutma: Tüm QR kodlar okutulduğunda çalışan seçimi ve READY durumu
   * İkinci okutma: Tekrar tüm QR kodlar okutulduğunda DELIVERED durumu
   */
  async scanQRCode(qrCode: string, adminUserId: string, selectedEmployeeId?: string) {
    try {
      // QR kod parametresi kontrolü
      if (!qrCode || typeof qrCode !== 'string') {
        throw new Error('Geçersiz QR kod formatı')
      }

      // Eğer gelen değer PASHA- ile başlıyorsa, bu QR kod ID'si
      // Eğer URL formatındaysa, query parameter'dan ID'yi çıkar
      let qrCodeId = qrCode
      if (qrCode.includes('/api/admin/scan-qr?qrCode=')) {
        const urlParts = qrCode.split('qrCode=')
        if (urlParts.length > 1) {
          qrCodeId = urlParts[1]
        }
      }

      // QR kod formatını kontrol et
      if (!qrCodeId.startsWith('PASHA-')) {
        throw new Error('Geçersiz QR kod formatı. QR kod PASHA- ile başlamalıdır.')
      }

      // QR kod kontrolü - artık URL formatında saklanan QR kodları arayalım
      const qrRecord = await prisma.qRCode.findFirst({
        where: { 
          OR: [
            { qr_code: qrCode }, // Tam URL eşleşmesi
            { qr_code: { contains: qrCodeId } } // QR kod ID'si içeren URL
          ]
        },
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
                      collection: true
                    }
                  }
                }
              }
            }
          },
          order_item: {
            include: {
              product: true
            }
          },
          product: true
        }
      })

      if (!qrRecord) {
        throw new Error('Geçersiz QR kod')
      }

      // Siparişteki tüm QR kodları kontrol et
      const allQRCodes = await prisma.qRCode.findMany({
        where: { order_id: qrRecord.order_id }
      })

      // Mevcut durumu değerlendir
      const currentOrder = qrRecord.order
      let newOrderStatus = currentOrder.status
      let message = 'QR kod okutuldu'

      // İlk okutma durumu - CONFIRMED -> READY
      if (currentOrder.status === 'CONFIRMED') {
        // İlk scan için QR kodu güncelle
        if (!qrRecord.first_scan_employee_id) {
          // Eğer selectedEmployeeId varsa onu kullan, yoksa adminUserId kullan
          const employeeId = selectedEmployeeId || adminUserId
          
          await prisma.qRCode.update({
            where: { id: qrRecord.id },
            data: {
              first_scan_employee_id: employeeId,
              first_scan_at: new Date(),
              is_scanned: false // Henüz tamamlanmadı, sadece ilk okutma yapıldı
            }
          })

          // Tüm QR kodların ilk okutması tamamlandı mı kontrol et
          const firstScannedQRs = await prisma.qRCode.findMany({
            where: { 
              order_id: qrRecord.order_id,
              first_scan_employee_id: { not: null }
            }
          })

          if (firstScannedQRs.length === allQRCodes.length) {
            // Tüm QR kodlar ilk kez okutuldu - çalışan seçimi gerekiyor
            newOrderStatus = 'READY'
            message = 'Tüm QR kodlar ilk kez okutuldu! Çalışan seçimi yapın.'
            
            await prisma.order.update({
              where: { id: qrRecord.order_id },
              data: {
                status: 'READY',
                updated_at: new Date()
              }
            })

            // Sipariş hazır bildirimi gönder
            try {
              await notificationService.notifyOrderReady(
                qrRecord.order_id,
                currentOrder.user_id,
                qrRecord.order_id
              );
              console.log('✅ Sipariş hazır bildirimi gönderildi');
            } catch (notificationError) {
              console.error('❌ Sipariş hazır bildirim hatası:', notificationError);
              // Bildirim hatası ana işlemi etkilemesin
            }

            // Çalışan seçimi gerekiyor
            return {
              success: true,
              message,
              requiresEmployeeSelection: true,
              employees: (await employeeAssignmentService.getAllEmployees()).employees,
              orderId: qrRecord.order_id,
              orderDetails: {
                total_price: currentOrder.total_price,
                total_area_m2: currentOrder.items.reduce((sum, item) => sum + (Number(item.width) * Number(item.height) * item.quantity / 10000), 0),
                total_items: currentOrder.items.reduce((sum, item) => sum + item.quantity, 0)
              }
            }
          } else {
            message = `İlk okutma yapıldı (${firstScannedQRs.length}/${allQRCodes.length} QR kod)`
          }
        } else {
          message = 'Bu QR kod zaten ilk kez okutulmuş'
        }
      }
      
      // İkinci okutma durumu - READY -> DELIVERED
      else if (currentOrder.status === 'READY') {
        // İkinci scan için QR kodu güncelle
        if (qrRecord.first_scan_employee_id && !qrRecord.second_scan_employee_id) {
          await prisma.qRCode.update({
            where: { id: qrRecord.id },
            data: {
              second_scan_employee_id: adminUserId,
              second_scan_at: new Date(),
              is_scanned: true, // İkinci okutma ile tamamlandı
              scanned_at: new Date()
            }
          })

          // Tüm QR kodların ikinci okutması tamamlandı mı kontrol et
          const secondScannedQRs = await prisma.qRCode.findMany({
            where: { 
              order_id: qrRecord.order_id,
              second_scan_employee_id: { not: null }
            }
          })

          if (secondScannedQRs.length === allQRCodes.length) {
            // Tüm QR kodlar ikinci kez okutuldu - sipariş teslim edildi
            newOrderStatus = 'DELIVERED'
            message = 'Tüm QR kodlar ikinci kez okutuldu! Sipariş teslim edildi.'
            
            await prisma.order.update({
              where: { id: qrRecord.order_id },
              data: {
                status: 'DELIVERED',
                updated_at: new Date()
              }
            })

            // Artık çalışan seçimi gerekmiyor - direkt teslim edildi durumu
            return {
              success: true,
              message,
              requiresEmployeeSelection: false,
              orderStatus: 'DELIVERED',
              orderId: qrRecord.order_id,
              orderDetails: {
                total_price: currentOrder.total_price,
                total_area_m2: currentOrder.items.reduce((sum, item) => sum + (Number(item.width) * Number(item.height) * item.quantity / 10000), 0),
                total_items: currentOrder.items.reduce((sum, item) => sum + item.quantity, 0)
              }
            }
          } else {
            message = `İkinci okutma yapıldı (${secondScannedQRs.length}/${allQRCodes.length} QR kod)`
          }
        } else if (!qrRecord.first_scan_employee_id) {
          throw new Error('Bu QR kod henüz ilk kez okutulmamış')
        } else {
          message = 'Bu QR kod zaten ikinci kez okutulmuş'
        }
      }
      
      else {
        throw new Error(`Bu sipariş durumunda QR kod okutma yapılamaz: ${currentOrder.status}`)
      }

      // Güncel QR kod bilgilerini al
      const updatedQRRecord = await prisma.qRCode.findUnique({
        where: { id: qrRecord.id }
      })

      // Güncel sipariş durumunu kontrol et
      const firstScannedCount = await prisma.qRCode.count({
        where: { 
          order_id: qrRecord.order_id,
          first_scan_employee_id: { not: null }
        }
      })

      const secondScannedCount = await prisma.qRCode.count({
        where: { 
          order_id: qrRecord.order_id,
          second_scan_employee_id: { not: null }
        }
      })

      return {
        success: true,
        message,
        qrCode: {
          id: qrRecord.id,
          qr_code: qrRecord.qr_code,
          first_scan_employee_id: updatedQRRecord?.first_scan_employee_id || null,
          first_scan_at: updatedQRRecord?.first_scan_at || null,
          second_scan_employee_id: updatedQRRecord?.second_scan_employee_id || null,
          second_scan_at: updatedQRRecord?.second_scan_at || null,
          is_completed: updatedQRRecord?.is_scanned || false,
          created_at: qrRecord.created_at
        },
        order: {
          id: qrRecord.order.id,
          status: newOrderStatus,
          total_price: qrRecord.order.total_price,
          customer: {
            name: qrRecord.order.user.name,
            email: qrRecord.order.user.email,
            store: qrRecord.order.user.Store,
            userType: qrRecord.order.user.userType
          },
          created_at: qrRecord.order.created_at,
          updated_at: new Date()
        },
        deliveryInfo: {
          first_scan_completed: firstScannedCount,
          second_scan_completed: secondScannedCount,
          total_qr_codes: allQRCodes.length,
          order_status: newOrderStatus,
          first_scan_percentage: Math.round((firstScannedCount / allQRCodes.length) * 100),
          second_scan_percentage: Math.round((secondScannedCount / allQRCodes.length) * 100)
        }
      }
    } catch (error: any) {
      throw new Error(`QR kod okuma hatası: ${error.message}`)
    }
  }

  /**
   * Çalışan seçimi sonrası istatistikleri güncelle - Artık sadece hazırlama için
   */
  async assignEmployeeToOrder(orderId: string, employeeId: string, assignmentType: 'prepare') {
    try {
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

      // Artık sadece hazırlama için çalışan ataması yapılacak
      if (assignmentType === 'prepare') {
        // QR kodlarındaki first_scan_employee_id'yi güncelle
        await prisma.qRCode.updateMany({
          where: { order_id: orderId },
          data: {
            first_scan_employee_id: employeeId
          }
        })
      }

      return { success: true }
    } catch (error: any) {
      throw new Error(`Employee atama hatası: ${error.message}`)
    }
  }

  /**
   * Sipariş için QR kod bilgisini getir - Item bazlı sistem
   */
  async getQRCodesForOrder(orderId: string) {
    try {
      const qrCodes = await prisma.qRCode.findMany({
        where: { order_id: orderId },
        include: {
          order_item: {
            include: {
              product: true
            }
          },
          product: true
        },
        orderBy: {
          created_at: 'asc'
        }
      })

      if (qrCodes.length === 0) {
        throw new Error('Bu sipariş için QR kod bulunamadı')
      }

      const scannedCount = qrCodes.filter(qr => qr.is_scanned).length
      const totalCount = qrCodes.length

      return {
        success: true,
        qrCodes: qrCodes,
        scanInfo: {
          scanned_count: scannedCount,
          total_count: totalCount,
          is_completed: scannedCount === totalCount,
          progress_percentage: Math.round((scannedCount / totalCount) * 100)
        }
      }
    } catch (error: any) {
      throw new Error(`QR kod bilgisi alınamadı: ${error.message}`)
    }
  }

  /**
   * Benzersiz QR kod üret
   */
  private generateUniqueQRCode(): string {
    const timestamp = Date.now()
    const randomBytes = crypto.randomBytes(8).toString('hex').toUpperCase()
    return `PASHA-${timestamp}-${randomBytes}`
  }

  /**
   * QR kod istatistikleri - Item bazlı sistem
   */
  async getQRCodeStats(orderId?: string) {
    try {
      const where = orderId ? { order_id: orderId } : {}
      
      const allQRCodes = await prisma.qRCode.findMany({ where })
      const totalQRCodes = allQRCodes.length
      
      // QR kodları durumuna göre grupla
      const scannedQRCodes = allQRCodes.filter(qr => qr.is_scanned)
      const pendingQRCodes = allQRCodes.filter(qr => !qr.is_scanned)

      // Sipariş bazlı istatistikler
      if (orderId) {
        return {
          total: totalQRCodes,
          scanned: scannedQRCodes.length,
          pending: pendingQRCodes.length,
          completion_rate: totalQRCodes > 0 ? Math.round((scannedQRCodes.length / totalQRCodes) * 100) : 0
        }
      }

      // Genel istatistikler - sipariş bazında
      const orders = await prisma.order.findMany({
        include: {
          qr_codes: true
        }
      })

      const orderStats = orders.map(order => {
        const qrCodes = order.qr_codes
        const scanned = qrCodes.filter(qr => qr.is_scanned).length
        const total = qrCodes.length
        
        return {
          order_id: order.id,
          status: order.status,
          total_qr_codes: total,
          scanned_qr_codes: scanned,
          is_completed: total > 0 && scanned === total
        }
      })

      const completedOrders = orderStats.filter(o => o.is_completed).length
      const totalOrdersWithQR = orderStats.filter(o => o.total_qr_codes > 0).length

      return {
        total_qr_codes: totalQRCodes,
        scanned_qr_codes: scannedQRCodes.length,
        pending_qr_codes: pendingQRCodes.length,
        total_orders_with_qr: totalOrdersWithQR,
        completed_orders: completedOrders,
        order_completion_rate: totalOrdersWithQR > 0 ? Math.round((completedOrders / totalOrdersWithQR) * 100) : 0,
        qr_scan_rate: totalQRCodes > 0 ? Math.round((scannedQRCodes.length / totalQRCodes) * 100) : 0
      }
    } catch (error: any) {
      throw new Error(`İstatistik hatası: ${error.message}`)
    }
  }

  /**
   * Sipariş iptal edildiğinde stokları geri ekle - Opsiyonel yükseklik kuralları destekli
   */
  async restoreStockForOrder(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  productrules: {
                    include: {
                      productsizeoptions: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!order) {
        throw new Error('Sipariş bulunamadı')
      }

      // Her sipariş öğesi için stok geri ekle
      for (const item of order.items) {
        console.log(`🔄 Stok geri ekleme: ${item.product_id} - ${item.width}x${item.height} - Saçak: ${item.has_fringe} - Adet: ${item.quantity}`)
        
        const itemWidth = item.width ? Math.round(Number(item.width)) : 0
        const itemHeight = item.height ? Math.round(Number(item.height)) : 0
        const itemHasFringe = item.has_fringe || false

        // Kullanılacak varyasyon boyutunu belirle (opsiyonel yükseklik kuralları dahil)
        let targetWidth = itemWidth
        let targetHeight = itemHeight

        // Ürün kuralını kontrol et
        if (item.product.rule_id && item.product.productrules) {
          const sizeOptions = item.product.productrules.productsizeoptions
          
          // Bu genişlik için opsiyonel yükseklik seçeneği var mı?
          const widthOption = sizeOptions.find(opt => opt.width === itemWidth)
          
          if (widthOption && widthOption.is_optional_height) {
            // Opsiyonel yükseklik kuralı var - maksimum yükseklik değerini kullan
            targetHeight = widthOption.height
            console.log(`📏 Opsiyonel yükseklik kuralı: ${itemWidth}x${itemHeight} → ${targetWidth}x${targetHeight} varyasyonu kullanılacak`)
          }
        }

        // Varyasyonu bul - önce tam eşleşme arayın
        let variations = await prisma.productvariations.findMany({
          where: {
            product_id: item.product_id,
            width: targetWidth,
            height: targetHeight,
            has_fringe: itemHasFringe
          }
        })

        // Tam eşleşme bulamazsak alternatif saçak değeri ile ara
        if (variations.length === 0) {
          variations = await prisma.productvariations.findMany({
            where: {
              product_id: item.product_id,
              width: targetWidth,
              height: targetHeight,
              has_fringe: !itemHasFringe
            }
          })
        }

        // Stok geri ekleme - opsiyonel yükseklik vs hazır kesim
        if (variations.length > 0) {
          const variation = variations[0]
          
          // Ürünün opsiyonel yükseklik olup olmadığını kontrol et
          const sizeOptions = item.product.productrules?.productsizeoptions || []
          
          const isOptionalHeight = sizeOptions.some((so: any) => 
            so.width === variation.width && so.is_optional_height
          )
          
          let updateData: any = {}
          
          if (isOptionalHeight) {
            // Opsiyonel yükseklik: Sadece m² geri ekle
            const actualPieceAreaM2 = (itemWidth * itemHeight) / 10000;
            const restoredAreaM2 = item.quantity * actualPieceAreaM2;
            const currentAreaM2 = Number(variation.stock_area_m2 || 0);
            const newAreaM2 = currentAreaM2 + restoredAreaM2;
            
            updateData.stock_area_m2 = newAreaM2;
            console.log(`📦 Opsiyonel yükseklik stok geri eklendi: ${currentAreaM2} → ${newAreaM2}m² (Geri eklenen: ${restoredAreaM2}m²)`)
          } else {
            // Hazır kesim: Sadece adet geri ekle
            const newStock = variation.stock_quantity + item.quantity
            updateData.stock_quantity = newStock;
            console.log(`📦 Hazır kesim stok geri eklendi: ${variation.stock_quantity} → ${newStock} adet`)
          }
          
          await prisma.productvariations.update({
            where: { id: variation.id },
            data: updateData
          })
          
        } else {
          console.log(`⚠️ Uygun varyasyon bulunamadı: ${item.product_id} - ${targetWidth}x${targetHeight}`)
        }
      }

      return { success: true }
    } catch (error: any) {
      throw new Error(`Stok geri ekleme hatası: ${error.message}`)
    }
  }
}

export const qrCodeService = new QRCodeService() 