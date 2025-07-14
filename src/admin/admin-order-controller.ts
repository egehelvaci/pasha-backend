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
            }
          },
          orderBy,
          skip,
          take: Number(limit)
        }),
        prisma.order.count({ where })
      ])

      const totalPages = Math.ceil(totalCount / Number(limit))

      return res.status(200).json({
        success: true,
        data: {
          orders,
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
          }
        }
      })

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Sipariş bulunamadı'
        })
      }

      return res.status(200).json({
        success: true,
        data: order
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

      // QR kod oluştur ve siparişi onayla
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
          }
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Sipariş başarıyla onaylandı ve QR kod oluşturuldu',
        data: {
          order: updatedOrder,
          qrCode: qrResult.qrCode
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
      let { qrCode } = req.body
      const adminUserId = req.user?.userId || 'mobile-app' // Mobil uygulama için varsayılan değer

      // QR kod validasyonu
      if (!qrCode) {
        return res.status(400).json({
          success: false,
          message: 'QR kod zorunludur',
          error_code: 'MISSING_QR_CODE'
        })
      }

      // Eğer qrCode array olarak gelirse, ilk elemanını al
      if (Array.isArray(qrCode)) {
        qrCode = qrCode[0]
      }

      // qrCode'un string olduğundan emin ol
      if (typeof qrCode !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'QR kod string formatında olmalıdır',
          error_code: 'INVALID_QR_FORMAT'
        })
      }

      // QR kod formatını kontrol et (PASHA- ile başlamalı)
      if (!qrCode.startsWith('PASHA-')) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz QR kod formatı. QR kod PASHA- ile başlamalıdır.',
          error_code: 'INVALID_QR_FORMAT'
        })
      }

      const result = await qrCodeService.scanQRCode(qrCode, adminUserId)

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          qr_code: result.qrCode,
          order: result.order,
          delivery_info: result.deliveryInfo
        }
      })
    } catch (error: any) {
      console.error('QR kod tarama hatası:', error)
      
      return res.status(400).json({
        success: false,
        message: error.message || 'QR kod okutulurken bir hata oluştu',
        error_code: 'QR_SCAN_ERROR'
      })
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

      // İptal durumunda açık hesap bakiyesini geri ekle
      if (status === 'CANCELED' && existingOrder.status !== 'CANCELED') {
        const store = existingOrder.user.Store
        if (store && !store.limitsiz_acik_hesap) {
          const newBalance = Number(store.acik_hesap_tutari) + Number(existingOrder.total_price)
          await prisma.store.update({
            where: { store_id: store.store_id },
            data: { acik_hesap_tutari: newBalance }
          })
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
        if (store && !store.limitsiz_acik_hesap) {
          message = `Sipariş iptal edildi ve ${existingOrder.total_price} TL açık hesap bakiyesi geri eklendi`
        } else {
          message = 'Sipariş iptal edildi'
        }
      }

      const response: any = {
        success: true,
        message,
        data: order
      }

      // QR kod bilgilerini ekle
      if (qrResult) {
        response.qrCode = qrResult.qrCode
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