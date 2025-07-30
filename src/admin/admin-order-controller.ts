import { Request, Response } from 'express'
import { OrderService } from '../order-service'
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
    this.createOrderForStore = this.createOrderForStore.bind(this)
    this.processAdminOrder = this.processAdminOrder.bind(this)
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
      
      // ESKI MANTIK: Stokları düşür - ARTIK YAPILMAYACAK
      // await qrCodeService.reduceStockForOrder(orderId)

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

      // Eğer tüm QR kodlar tamamlandıysa ve employee ataması gerekiyorsa
      if (result.deliveryInfo?.needs_employee_assignment && result.formUrl) {
        // Employee form sayfasını aç
        const redirectHtml = `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Employee Atama</title>
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
              .btn {
                display: inline-block;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                margin-top: 1rem;
                transition: all 0.3s ease;
              }
              .btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success-icon">✅</div>
              <div class="message">
                <strong>Sipariş Tamamlandı!</strong><br>
                Tüm QR kodlar okutuldu. Employee ataması için form açılacak.
              </div>
              <a href="${result.formUrl}" class="btn" target="_blank">
                Employee Seçim Formunu Aç
              </a>
            </div>
            <script>
              // 3 saniye sonra otomatik olarak form sayfasını aç
              setTimeout(() => {
                window.open('${result.formUrl}', '_blank');
              }, 2000);
            </script>
          </body>
          </html>
        `
        return res.status(200).send(redirectHtml)
      }

      // Normal QR kod tarama başarılı - basit HTML response döndür
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
          // ESKI MANTIK: Stok düşür - ARTIK YAPILMAYACAK
          // await qrCodeService.reduceStockForOrder(orderId)
          console.log(`✅ Sipariş ${orderId} CONFIRMED olarak güncellendi - QR kod oluşturuldu`)
        } catch (qrError) {
          console.error('QR kod oluşturma hatası:', qrError)
          // QR kod hatası durumunda bile sipariş durumunu güncelle
        }
      }

      // İptal durumunda açık hesap bakiyesini, fiyat listesi limitini geri ekle ve stokları geri ekle
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
        
        // 1. Bakiyeye iade et - Admin siparişleri için özel işlem
        if (store) {
          const currentBalance = Number(store.bakiye || 0)
          
          // Admin siparişleri için: Doğrudan bakiyeye iade et (açık hesap kontrolü yok)
          // Normal siparişler için: Sadece sınırsız olmayan mağazalar için iade et
          const isAdminOrder = existingOrder.cart_id && existingOrder.cart_id > 0 // Admin sepet ID'si varsa admin siparişi
          
          if (isAdminOrder || !store.limitsiz_acik_hesap) {
            await prisma.store.update({
              where: { store_id: store.store_id },
              data: { 
                bakiye: currentBalance + orderTotal,
                // Açık hesap limiti değişmez
              }
            })

            console.log(`💰 ${isAdminOrder ? 'ADMİN SİPARİŞİ' : 'Normal Sipariş'} İptal iadesi yapıldı:`)
            console.log(`  - Önceki bakiye: ${currentBalance} TL`)
            console.log(`  - İade tutarı: ${orderTotal} TL`)
            console.log(`  - Yeni bakiye: ${currentBalance + orderTotal} TL`)
            console.log(`  - Açık hesap limiti değişmez`)
          }
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

        // 3. YENİ EKLENDİ: Stokları geri ekle
        try {
          await qrCodeService.restoreStockForOrder(orderId)
          console.log(`📦 Sipariş ${orderId} iptal edildi - Stok geri eklendi`)
        } catch (stockError) {
          console.error('❌ Stok geri ekleme hatası:', stockError)
          // Stok hatası logs olarak tutulacak ama işlem devam edecek
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
        const isAdminOrder = existingOrder.cart_id && existingOrder.cart_id > 0 // Admin sepet ID'si varsa admin siparişi
        
        if (isAdminOrder) {
          message = `Admin siparişi iptal edildi. ${orderTotal} TL mağaza bakiyesi iade edildi. Fiyat listesi limiti ve stoklar geri eklendi.`
        } else if (store && !store.limitsiz_acik_hesap) {
          message = `Sipariş iptal edildi. ${orderTotal} TL açık hesap bakiyesi ve fiyat listesi limiti geri eklendi. Stoklar geri eklendi.`
        } else {
          message = `Sipariş iptal edildi. ${orderTotal} TL fiyat listesi limiti geri eklendi. Stoklar geri eklendi.`
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

  /**
   * Admin için yeni sipariş oluşturma
   * Mağaza ID ve kullanıcı ID alır, o kullanıcı için sipariş oluşturur
   */
  async createOrderForStore(req: Request, res: Response) {
    try {
      const { store_id, user_id } = req.body

      // Zorunlu alanları kontrol et
      if (!store_id || !user_id) {
        return res.status(400).json({
          success: false,
          message: 'store_id ve user_id alanları zorunludur'
        })
      }

      // Kullanıcı ve mağaza bilgilerini kontrol et
      const user = await prisma.user.findUnique({
        where: { userId: user_id },
        include: {
          Store: true,
          userType: true
        }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        })
      }

      // Kullanıcının belirtilen mağazaya ait olup olmadığını kontrol et
      if (user.store_id !== store_id) {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcı belirtilen mağazaya ait değil'
        })
      }

      if (!user.Store) {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcının mağaza bilgisi bulunamadı'
        })
      }

      // Mağaza aktiflik kontrolü
      if (!user.Store.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Mağaza aktif değil'
        })
      }

      // Kullanıcı adres bilgisi kontrolü
      if (!user.adres) {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcının adres bilgisi bulunamadı'
        })
      }

      // Mağazaya atanmış fiyat listesini al
      const storePriceList = await prisma.storePriceList.findFirst({
        where: { store_id: store_id },
        include: {
          PriceList: {
            include: {
              PriceListDetail: {
                include: {
                  Collection: {
                    include: {
                      products: {
                        include: {
                          productrules: {
                            include: {
                              productsizeoptions: true,
                              productrulecuttypes: {
                                include: {
                                  cuttypes: true
                                }
                              }
                            }
                          },
                          productvariations: true
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

      if (!storePriceList) {
        return res.status(400).json({
          success: false,
          message: 'Mağazaya atanmış fiyat listesi bulunamadı'
        })
      }

      // Fiyat listesi aktiflik kontrolü
      if (!storePriceList.PriceList.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Mağazaya atanmış fiyat listesi aktif değil'
        })
      }

      // Tüm ürünleri fiyat listesi ile birlikte hazırla
      const productsWithPricing = []

      for (const priceDetail of storePriceList.PriceList.PriceListDetail) {
        const collection = priceDetail.Collection
        const price = Number(priceDetail.price_per_square_meter)

        for (const product of collection.products) {
                     // Ürün kural bilgilerini işle
           let sizeOptions: any[] = []
           let cutTypes: any[] = []
           let canHaveFringe = false

          if (product.productrules) {
            canHaveFringe = product.productrules.can_have_fringe
            
            // Boyut seçeneklerini ekle
            sizeOptions = product.productrules.productsizeoptions?.map(so => {
              const stockForSize = product.productvariations?.find(v => 
                v.width === so.width && v.height === so.height
              )
              
              return {
                id: so.id,
                width: so.width,
                height: so.height,
                is_optional_height: so.is_optional_height || false,
                stockQuantity: stockForSize ? stockForSize.stock_quantity : 0,
                stockAreaM2: stockForSize ? Number(stockForSize.stock_area_m2 || 0) : 0
              }
            }) || []

            // Kesim tiplerini ekle
            cutTypes = product.productrules.productrulecuttypes?.map(ct => ({
              id: ct.cuttypes.id,
              name: ct.cuttypes.name
            })) || []
          }

          productsWithPricing.push({
            productId: product.productId,
            name: product.name,
            description: product.description,
            productImage: product.productImage,
            collectionId: product.collectionId,
            collectionName: collection.name,
            pricing: {
              price: price,
              currency: storePriceList.PriceList.currency || "TRY",
              priceListName: storePriceList.PriceList.name
            },
            canHaveFringe: canHaveFringe,
            sizeOptions: sizeOptions,
            cutTypes: cutTypes,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
          })
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Admin sipariş oluşturma bilgileri hazırlandı',
        data: {
          user: {
            userId: user.userId,
            name: user.name,
            surname: user.surname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            adres: user.adres,
            userType: user.userType.name
          },
          store: {
            store_id: user.Store.store_id,
            kurum_adi: user.Store.kurum_adi,
            vergi_numarasi: user.Store.vergi_numarasi,
            vergi_dairesi: user.Store.vergi_dairesi,
            telefon: user.Store.telefon,
            eposta: user.Store.eposta,
            bakiye: user.Store.bakiye || 0,
            acik_hesap_tutari: user.Store.acik_hesap_tutari || 0,
            limitsiz_acik_hesap: user.Store.limitsiz_acik_hesap || false
          },
          priceList: {
            price_list_id: storePriceList.PriceList.price_list_id,
            name: storePriceList.PriceList.name,
            description: storePriceList.PriceList.description,
            currency: storePriceList.PriceList.currency,
            limit_amount: storePriceList.PriceList.limit_amount
          },
          products: productsWithPricing,
          totalProducts: productsWithPricing.length,
          availableCollections: [...new Set(productsWithPricing.map(p => p.collectionName))]
        }
      })

    } catch (error: any) {
      console.error('Admin sipariş oluşturma hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Admin sipariş oluşturulurken bir hata oluştu'
      })
    }
  }

  /**
   * Admin için sipariş oluştur (asıl sipariş oluşturma)
   */
  async processAdminOrder(req: Request, res: Response) {
    try {
      const { store_id, user_id, items, notes } = req.body

      // Zorunlu alanları kontrol et
      if (!store_id || !user_id || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'store_id, user_id ve items alanları zorunludur'
        })
      }

      // Items validasyonu
      for (const item of items) {
        if (!item.product_id || !item.quantity || !item.width || !item.height) {
          return res.status(400).json({
            success: false,
            message: 'Her sipariş öğesi için product_id, quantity, width ve height zorunludur'
          })
        }

        if (item.quantity <= 0 || item.width <= 0 || item.height <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Quantity, width ve height değerleri pozitif olmalıdır'
          })
        }
      }

      // OrderService'i kullanarak admin siparişi oluştur
      const orderService = new OrderService()
      const result = await orderService.createAdminOrder({
        user_id,
        store_id,
        notes,
        items: items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          width: item.width,
          height: item.height,
          has_fringe: item.has_fringe || false,
          cut_type: item.cut_type || 'standart',
          notes: item.notes
        }))
      })

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        })
      }

      return res.status(201).json({
        success: true,
        message: result.message,
        data: {
          order: result.order
        }
      })

    } catch (error: any) {
      console.error('Admin sipariş işleme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Admin siparişi işlenirken bir hata oluştu'
      })
    }
  }
}

export const adminOrderController = new AdminOrderController() 