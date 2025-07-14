import crypto from 'crypto'
import prisma from '../utils/prisma'
import { UploadService } from '../utils/upload-service'

const QRCode = require('qrcode');

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

    // Siparişe ait QR kod kaydını bul (sipariş başına tek QR kod)
    const qrRecord = await prisma.qRCode.findUnique({
      where: {
        order_id: orderId
      },
      select: {
        id: true,
        qr_code: true,
        required_scans: true,
        qrCodeImageUrl: true
      }
    })

    if (!qrRecord) {
      throw new Error('Bu sipariş için QR kod bulunamadı.');
    }

    if (qrRecord.qrCodeImageUrl) {
      return {
        success: true,
        message: 'Bu sipariş için QR kod görseli zaten mevcut.',
        processedCount: 0,
        generatedImages: []
      }
    }

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

      return {
        success: true,
        message: 'QR kod görseli başarıyla oluşturuldu ve yüklendi.',
        processedCount: 1,
        generatedImages: [{ 
          qr_code: qrRecord.qr_code, 
          imageUrl: imageUrl,
          required_scans: qrRecord.required_scans 
        }]
      }
    } catch (error) {
      console.error(`QR kod ${qrRecord.qr_code} için görsel oluşturulurken veya yüklenirken hata oluştu:`, error)
      throw new Error(`QR kod görseli oluşturulurken hata oluştu: ${error}`)
    }
  }

  /**
   * Sipariş için QR kod oluştur - Her sipariş için tek QR kod
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

      // Eğer mevcut QR kod varsa, yeniden oluşturma
      if (order.qr_codes) {
        console.log(`✅ Sipariş ${orderId} için QR kod zaten mevcut: ${order.qr_codes.qr_code}`)
        return {
          success: true,
          qrCode: order.qr_codes,
          message: 'Sipariş için QR kod zaten mevcut'
        }
      }

      // Sipariş için tek QR kod oluştur
      const qrCodeString = this.generateUniqueQRCode()
      
      console.log(`🚀 Sipariş ${orderId} için QR kod oluşturuluyor: ${qrCodeString}`)
      
      const createdQRCode = await prisma.qRCode.create({
        data: {
          order_id: orderId,
          qr_code: qrCodeString,
          required_scans: 2, // İlk okutma: SHIPPED, ikinci okutma: DELIVERED
          scan_count: 0 // Henüz taranmadı
        }
      })

      console.log(`✅ QR kod oluşturuldu: ${createdQRCode.qr_code}, Required Scans: ${createdQRCode.required_scans}`)

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
        qrCode: createdQRCode,
        message: 'Sipariş için QR kod başarıyla oluşturuldu'
      }
    } catch (error: any) {
      console.error('QR kod oluşturma hatası:', error)
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
        
        // En spesifik eşleşme: tam boyut + saçak durumu
        let variations = await prisma.productvariations.findMany({
          where: {
            product_id: item.product_id,
            width: item.width ? Math.round(Number(item.width)) : undefined,
            height: item.height ? Math.round(Number(item.height)) : undefined,
            has_fringe: item.has_fringe || false
          }
        })

        console.log(`📊 Spesifik eşleşme (${item.width}x${item.height}, saçak:${item.has_fringe}): ${variations.length} varyasyon`)

        // Saçak durumu esnek eşleşme
        if (variations.length === 0) {
          variations = await prisma.productvariations.findMany({
            where: {
              product_id: item.product_id,
              width: item.width ? Math.round(Number(item.width)) : undefined,
              height: item.height ? Math.round(Number(item.height)) : undefined,
              has_fringe: !(item.has_fringe || false)
            }
          })
        }

        // Stok güncelle
        if (variations.length > 0) {
          const variation = variations[0]
          const newStock = Math.max(0, variation.stock_quantity - item.quantity)
          
          await prisma.productvariations.update({
            where: { id: variation.id },
            data: { stock_quantity: newStock }
          })
          
          console.log(`📦 Stok güncellendi: ${variation.stock_quantity} → ${newStock}`)
        } else {
          console.log(`⚠️ Uygun varyasyon bulunamadı: ${item.product_id}`)
        }
      }

      return { success: true }
    } catch (error: any) {
      throw new Error(`Stok düşürme hatası: ${error.message}`)
    }
  }

  /**
   * QR kod okut ve sipariş durumunu güncelle
   * 1. okutma: SHIPPED (Teslimatta)
   * 2. okutma: DELIVERED (Tamamlandı)
   */
  async scanQRCode(qrCode: string, adminUserId: string) {
    try {
      // QR kod parametresi kontrolü
      if (!qrCode || typeof qrCode !== 'string') {
        throw new Error('Geçersiz QR kod formatı')
      }

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

      // Sipariş durumunu belirle
      let newOrderStatus = qrRecord.order.status
      if (newScanCount === 1) {
        newOrderStatus = 'SHIPPED' // İlk okutma: Teslimatta
      } else if (newScanCount >= 2) {
        newOrderStatus = 'DELIVERED' // İkinci okutma: Tamamlandı
      }

      // QR kod ve sipariş durumunu güncelle
      await prisma.$transaction([
        prisma.qRCode.update({
          where: { id: qrRecord.id },
          data: {
            scan_count: newScanCount,
            is_scanned: isCompleted,
            last_scan_at: new Date(),
            scanned_at: isCompleted ? new Date() : qrRecord.scanned_at
          }
        }),
        prisma.order.update({
          where: { id: qrRecord.order_id },
          data: {
            status: newOrderStatus,
            updated_at: new Date()
          }
        })
      ])

      // Mesaj belirleme
      let message = ''
      if (newScanCount === 1) {
        message = 'QR kod okundu, sipariş teslimatta durumuna geçti'
      } else if (newScanCount >= 2) {
        message = 'QR kod okundu, sipariş tamamlandı!'
      }

      return {
        success: true,
        message,
        qrCode: {
          id: qrRecord.id,
          qr_code: qrRecord.qr_code,
          is_scanned: isCompleted,
          scan_count: newScanCount,
          required_scans: qrRecord.required_scans,
          scanned_at: isCompleted ? new Date() : qrRecord.scanned_at,
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
          scan_count: newScanCount,
          required_scans: qrRecord.required_scans,
          is_completed: isCompleted,
          order_status: newOrderStatus
        }
      }
    } catch (error: any) {
      throw new Error(`QR kod okuma hatası: ${error.message}`)
    }
  }

  /**
   * Sipariş için QR kod bilgisini getir
   */
  async getQRCodesForOrder(orderId: string) {
    try {
      const qrCode = await prisma.qRCode.findUnique({
        where: { order_id: orderId },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      })

      if (!qrCode) {
        throw new Error('Bu sipariş için QR kod bulunamadı')
      }

      return {
        success: true,
        qrCode,
        scanInfo: {
          scan_count: qrCode.scan_count,
          required_scans: qrCode.required_scans,
          is_completed: qrCode.is_scanned,
          progress_percentage: Math.round((qrCode.scan_count / qrCode.required_scans) * 100)
        }
      }
    } catch (error: any) {
      throw new Error(`QR kod bilgisi alınamadı: ${error.message}`)
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
      
      // QR kodları durumuna göre grupla
      const notScannedQRCodes = allQRCodes.filter(qr => qr.scan_count === 0)
      const shippedQRCodes = allQRCodes.filter(qr => qr.scan_count === 1)
      const deliveredQRCodes = allQRCodes.filter(qr => qr.scan_count >= 2)

      return {
        total: totalQRCodes,
        not_scanned: notScannedQRCodes.length,
        shipped: shippedQRCodes.length, // 1 kere okunmuş
        delivered: deliveredQRCodes.length, // 2 kere okunmuş
        completion_rate: totalQRCodes > 0 ? Math.round((deliveredQRCodes.length / totalQRCodes) * 100) : 0
      }
    } catch (error: any) {
      throw new Error(`İstatistik hatası: ${error.message}`)
    }
  }
}

export const qrCodeService = new QRCodeService() 