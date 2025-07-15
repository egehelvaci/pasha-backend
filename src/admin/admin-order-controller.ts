import { Request, Response } from 'express'
import { qrCodeService } from '../services/qr-code-service'
import prisma from '../utils/prisma'

export class AdminOrderController {
  constructor() {
    this.getAllOrders = this.getAllOrders.bind(this)
    this.getOrderById = this.getOrderById.bind(this)
    this.confirmOrder = this.confirmOrder.bind(this)
    this.scanQRCode = this.scanQRCode.bind(this)
    this.getOrderQRCodes = this.getOrderQRCodes.bind(this)
    this.getOrderStats = this.getOrderStats.bind(this)
    this.updateOrderStatus = this.updateOrderStatus.bind(this)
    this.generateQRCodes = this.generateQRCodes.bind(this)
    this.generateQRCodeImages = this.generateQRCodeImages.bind(this)
  }

  /**
   * Tüm siparişleri listele
   */
  async getAllOrders(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        userId,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      
      // Filtreleme koşulları
      const where: any = {}
      if (status) where.status = status
      if (userId) where.user_id = userId

      // Sıralama
      const orderBy: any = {}
      orderBy[sortBy as string] = sortOrder

      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: {
              include: {
                Store: true,
                userType: true
              }
            },
            items: {
              include: {
                product: true
              }
            },
            qr_codes: {
              include: {
                order_item: {
                  include: {
                    product: true
                  }
                },
                product: true
              }
            }
          },
          orderBy,
          skip,
          take: Number(limit)
        }),
        prisma.order.count({ where })
      ])

      const totalPages = Math.ceil(totalCount / Number(limit))

      // Orders'ta cut_type'ları rectangle'dan standart'a dönüştür
      const processedOrders = orders.map(order => ({
        ...order,
        items: order.items.map(item => ({
          ...item,
          cut_type: item.cut_type === 'rectangle' ? 'standart' : item.cut_type
        }))
      }))

      return res.status(200).json({
        success: true,
        data: {
          orders: processedOrders,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalCount,
            totalPages,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1
          }
        }
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Siparişler listelenirken bir hata oluştu'
      })
    }
  }

  /**
   * Belirli bir siparişi getir
   */
  async getOrderById(req: Request, res: Response) {
    try {
      const { orderId } = req.params

      const order = await prisma.order.findUnique({
        where: { id: orderId },
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
          },
          qr_codes: {
            include: {
              order_item: {
                include: {
                  product: true
                }
              },
              product: true
            }
          }
        }
      })

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Sipariş bulunamadı'
        })
      }

      // Order'da cut_type'ları rectangle'dan standart'a dönüştür
      const processedOrder = {
        ...order,
        items: order.items.map(item => ({
          ...item,
          cut_type: item.cut_type === 'rectangle' ? 'standart' : item.cut_type
        }))
      }

      return res.status(200).json({
        success: true,
        data: processedOrder
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Sipariş getirilirken bir hata oluştu'
      })
    }
  }

  /**
   * Siparişi onayla ve QR kod oluştur
   */
  async confirmOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params

      // Siparişin varlığını kontrol et
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            include: {
              Store: true
            }
          }
        }
      })

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Sipariş bulunamadı'
        })
      }

      // Sipariş durumu kontrolü
      if (order.status === 'CANCELED') {
        return res.status(400).json({
          success: false,
          message: 'İptal edilmiş siparişler onaylanamaz'
        })
      }

      // QR kodlar oluştur ve siparişi onayla
      const qrResult = await qrCodeService.generateQRCodesForOrder(orderId)
      
      // Stokları düşür
      await qrCodeService.reduceStockForOrder(orderId)

      // Güncellenmiş sipariş bilgilerini al
      const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            include: {
              Store: true
            }
          },
          items: {
            include: {
              product: true
            }
          },
          qr_codes: {
            include: {
              order_item: {
                include: {
                  product: true
                }
              },
              product: true
            }
          }
        }
      })

      // UpdatedOrder'da cut_type'ları rectangle'dan standart'a dönüştür
      const processedUpdatedOrder = {
        ...updatedOrder,
        items: updatedOrder?.items.map(item => ({
          ...item,
          cut_type: item.cut_type === 'rectangle' ? 'standart' : item.cut_type
        })) || []
      }

      return res.status(200).json({
        success: true,
        message: `Sipariş başarıyla onaylandı ve ${qrResult.totalQRCodes} QR kod oluşturuldu`,
        data: {
          order: processedUpdatedOrder,
          qrCodes: qrResult.qrCodes,
          qrCodeStats: {
            totalGenerated: qrResult.totalQRCodes,
            itemBreakdown: qrResult.itemBreakdown
          }
        }
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Sipariş onaylanırken bir hata oluştu'
      })
    }
  }

  /**
   * QR kod okut - Authentication gerektirmez (mobil uygulama için)
   */
  async scanQRCode(req: Request, res: Response) {
    try {
      // QR kod hem body'den hem de query parameter'dan alınabilir
      let { qrCode } = req.body
      if (!qrCode) {
        qrCode = req.query.qrCode
      }
      
      const adminUserId = req.user?.userId || 'mobile-app' // Mobil uygulama için varsayılan değer

      // QR kod validasyonu
      if (!qrCode) {
        const missingQrHtml = `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>QR Kod Gerekli</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
                color: #333;
              }
              .container {
                text-align: center;
                background: rgba(255, 255, 255, 0.9);
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                max-width: 400px;
              }
              .warning-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="warning-icon">⚠️</div>
              <div class="message">
                <strong>QR Kod Gerekli!</strong><br>
                Lütfen geçerli bir QR kod taratın.
              </div>
            </div>
          </body>
          </html>
        `
        return res.status(400).send(missingQrHtml)
      }

      // Eğer qrCode array olarak gelirse, ilk elemanını al
      if (Array.isArray(qrCode)) {
        qrCode = qrCode[0]
      }

      // qrCode'un string olduğundan emin ol
      if (typeof qrCode !== 'string') {
        const invalidFormatHtml = `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Geçersiz Format</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
                color: #333;
              }
              .container {
                text-align: center;
                background: rgba(255, 255, 255, 0.9);
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                max-width: 400px;
              }
              .warning-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="warning-icon">⚠️</div>
              <div class="message">
                <strong>Geçersiz QR Kod Formatı!</strong><br>
                Lütfen doğru formatta bir QR kod taratın.
              </div>
            </div>
          </body>
          </html>
        `
        return res.status(400).send(invalidFormatHtml)
      }

      // QR kod formatını kontrol et (PASHA- içermeli veya scan-qr URL'si olmalı)
      if (!qrCode.includes('PASHA-') && !qrCode.includes('/api/admin/scan-qr')) {
        const invalidQrHtml = `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Geçersiz QR Kod</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
                color: #333;
              }
              .container {
                text-align: center;
                background: rgba(255, 255, 255, 0.9);
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                max-width: 400px;
              }
              .warning-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="warning-icon">🚫</div>
              <div class="message">
                <strong>Tanınmayan QR Kod!</strong><br>
                Bu QR kod Pasha sistemine ait değil.
              </div>
            </div>
          </body>
          </html>
        `
        return res.status(400).send(invalidQrHtml)
      }

      const result = await qrCodeService.scanQRCode(qrCode, adminUserId)

      // QR kod tarama başarılı - basit HTML response döndür
      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>QR Kod Tarama Sonucu</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 2rem;
              border-radius: 15px;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              max-width: 400px;
            }
            .success-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            .message {
              font-size: 1.2rem;
              margin-bottom: 1rem;
              line-height: 1.4;
            }
            .status {
              font-size: 0.9rem;
              opacity: 0.8;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <div class="message">
              <strong>QR Kod Başarıyla Okundu!</strong><br>
              ${result.message}
            </div>
            <div class="status">
              Tarama Durumu: ${result.deliveryInfo.completed_qr_codes}/${result.deliveryInfo.total_qr_codes}
            </div>
          </div>
        </body>
        </html>
      `

      return res.status(200).send(htmlResponse)
    } catch (error: any) {
      console.error('QR kod tarama hatası:', error)
      
      // Hata durumunda da HTML response döndür
      const errorHtmlResponse = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>QR Kod Tarama Hatası</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 2rem;
              border-radius: 15px;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              max-width: 400px;
            }
            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            .message {
              font-size: 1.2rem;
              margin-bottom: 1rem;
              line-height: 1.4;
            }
            .error-detail {
              font-size: 0.9rem;
              opacity: 0.8;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">❌</div>
            <div class="message">
              <strong>QR Kod Tarama Hatası!</strong><br>
              ${error.message || 'QR kod okutulurken bir hata oluştu'}
            </div>
            <div class="error-detail">
              Lütfen geçerli bir QR kod ile tekrar deneyin.
            </div>
          </div>
        </body>
        </html>
      `
      
      return res.status(400).send(errorHtmlResponse)
    }
  }

  /**
   * Sipariş için QR kod bilgilerini getir
   */
  async getOrderQRCodes(req: Request, res: Response) {
    try {
      const { orderId } = req.params

      const result = await qrCodeService.getQRCodesForOrder(orderId)

      return res.status(200).json({
        success: true,
        data: result
      })
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || 'QR kod bilgileri alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Sipariş istatistikleri
   */
  async getOrderStats(req: Request, res: Response) {
    try {
      const [
        totalOrders,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        canceledOrders,
        qrStats
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'CONFIRMED' } }),
        prisma.order.count({ where: { status: 'SHIPPED' } }),
        prisma.order.count({ where: { status: 'DELIVERED' } }),
        prisma.order.count({ where: { status: 'CANCELED' } }),
        qrCodeService.getQRCodeStats()
      ])

      return res.status(200).json({
        success: true,
        data: {
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            confirmed: confirmedOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders,
            canceled: canceledOrders
          },
          qr_codes: qrStats
        }
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'İstatistikler alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Sipariş durumunu güncelle
   */
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params
      const { status } = req.body

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Durum bilgisi zorunludur'
        })
      }

      // Geçerli durumlar kontrolü
      const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELED']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz durum bilgisi'
        })
      }

      // Mevcut siparişi kontrol et
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            include: {
              Store: true
            }
          }
        }
      })

      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message: 'Sipariş bulunamadı'
        })
      }

      let qrResult = null

      // CONFIRMED durumuna geçerken QR kod oluştur
      if (status === 'CONFIRMED' && existingOrder.status !== 'CONFIRMED') {
        try {
          qrResult = await qrCodeService.generateQRCodesForOrder(orderId)
          await qrCodeService.reduceStockForOrder(orderId)
          console.log(`✅ Sipariş ${orderId} CONFIRMED olarak güncellendi - QR kod oluşturuldu`)
        } catch (qrError) {
          console.error('QR kod oluşturma hatası:', qrError)
          // QR kod hatası durumunda bile sipariş durumunu güncelle
        }
      }

      // İptal durumunda açık hesap bakiyesini ve fiyat listesi limitini geri ekle
      // NOT: Sadece PENDING durumdaki siparişler iptal edilebilir
      if (status === 'CANCELED' && existingOrder.status !== 'CANCELED') {
        // PENDING durumu dışındaki siparişlerin iptal edilmesini engelle
        if (existingOrder.status !== 'PENDING') {
          return res.status(400).json({
            success: false,
            message: `${existingOrder.status} durumundaki siparişler iptal edilemez. Sadece PENDING durumdaki siparişler iptal edilebilir.`
          })
        }
        const store = existingOrder.user.Store
        const orderTotal = Number(existingOrder.total_price)
        
        // 1. Bakiye ve açık hesap limitini iade et (sınırsız olmayan mağazalar için)
        if (store && !store.limitsiz_acik_hesap) {
          // Önce bakiyeye iade et, sonra açık hesap limitine
          const currentBalance = Number(store.bakiye || 0)
          const currentOpenAccountLimit = Number(store.acik_hesap_tutari || 0)
          
          await prisma.store.update({
            where: { store_id: store.store_id },
            data: { 
              bakiye: currentBalance + orderTotal,
              // Açık hesap limiti değişmez, sadece bakiye artırılır
            }
          })
        }

        // 2. Fiyat listesi limitini iade et
        if (store) {
          // Mağazanın fiyat listesini bul
          const storePriceList = await prisma.storePriceList.findFirst({
            where: { store_id: store.store_id },
            include: { PriceList: true }
          })
          
          if (storePriceList && storePriceList.PriceList && storePriceList.PriceList.limit_amount) {
            const currentLimit = Number(storePriceList.PriceList.limit_amount)
            const newLimit = currentLimit + orderTotal
            
            await prisma.priceList.update({
              where: { price_list_id: storePriceList.PriceList.price_list_id },
              data: { limit_amount: newLimit }
            })
            
            console.log(`💰 Fiyat listesi limiti iade edildi: ${currentLimit} → ${newLimit} TL`)
          }
        }
      }

      // Sipariş durumunu güncelle
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: status,
          updated_at: new Date()
        },
        include: {
          user: {
            include: {
              Store: true,
              userType: true
            }
          },
          items: {
            include: {
              product: true
            }
          }
        }
      })

      // Response mesajını belirle
      let message = 'Sipariş durumu güncellendi'
      if (status === 'CONFIRMED' && qrResult) {
        message = 'Sipariş durumu güncellendi ve QR kod oluşturuldu'
      } else if (status === 'CANCELED' && existingOrder.status !== 'CANCELED') {
        const store = existingOrder.user.Store
        const orderTotal = Number(existingOrder.total_price)
        
        if (store && !store.limitsiz_acik_hesap) {
          message = `Sipariş iptal edildi. ${orderTotal} TL açık hesap bakiyesi ve fiyat listesi limiti geri eklendi.`
        } else {
          message = `Sipariş iptal edildi. ${orderTotal} TL fiyat listesi limiti geri eklendi.`
        }
      }

      // Order'da cut_type'ları rectangle'dan standart'a dönüştür
      const processedOrderForStatus = {
        ...order,
        items: order.items.map(item => ({
          ...item,
          cut_type: item.cut_type === 'rectangle' ? 'standart' : item.cut_type
        }))
      }

      const response: any = {
        success: true,
        message,
        data: processedOrderForStatus
      }

      // QR kod bilgilerini ekle
      if (qrResult) {
        response.qrCodes = qrResult.qrCodes
        response.qrCodeStats = {
          totalGenerated: qrResult.totalQRCodes,
          itemBreakdown: qrResult.itemBreakdown
        }
      }

      return res.status(200).json(response)
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Sipariş durumu güncellenirken bir hata oluştu'
      })
    }
  }

  async generateQRCodes(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const result = await qrCodeService.generateQRCodesForOrder(orderId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async generateQRCodeImages(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const result = await qrCodeService.generateQRCodeImagesForOrder(orderId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: 'QR kod görselleri oluşturulurken bir hata oluştu.', error: error.message });
    }
  }
}

export const adminOrderController = new AdminOrderController() 