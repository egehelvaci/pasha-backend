import { Request, Response } from 'express'
import prisma from '../utils/prisma'
import { qrCodeService } from '../services/qr-code-service'

export class AdminOrderController {
  constructor() {
    this.getAllOrders = this.getAllOrders.bind(this)
    this.getOrderById = this.getOrderById.bind(this)
    this.confirmOrder = this.confirmOrder.bind(this)
    this.scanQRCode = this.scanQRCode.bind(this)
    this.getOrderQRCodes = this.getOrderQRCodes.bind(this)
    this.getOrderStats = this.getOrderStats.bind(this)
    this.updateOrderStatus = this.updateOrderStatus.bind(this)
  }

  /**
   * Tüm siparişleri listele (admin için)
   */
  async getAllOrders(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const status = req.query.status as string
      const skip = (page - 1) * limit

      const where: any = {}
      if (status) {
        where.status = status
      }

      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          where,
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
              select: {
                id: true,
                is_scanned: true,
                created_at: true
              }
            }
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit
        }),
        prisma.order.count({ where })
      ])

      // Her sipariş için QR kod istatistiklerini hesapla
      const ordersWithStats = orders.map(order => ({
        ...order,
        qr_stats: {
          total: order.qr_codes.length,
          scanned: order.qr_codes.filter(qr => qr.is_scanned).length,
          pending: order.qr_codes.filter(qr => !qr.is_scanned).length
        }
      }))

      return res.status(200).json({
        success: true,
        data: {
          orders: ordersWithStats,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNext: page * limit < totalCount,
            hasPrev: page > 1
          }
        }
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Siparişler alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Belirli bir siparişin detaylarını getir
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
              product: true
            },
            orderBy: { created_at: 'asc' }
          }
        }
      })

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Sipariş bulunamadı'
        })
      }

      // QR kod istatistikleri
      const qrStats = {
        total: order.qr_codes.length,
        scanned: order.qr_codes.filter(qr => qr.is_scanned).length,
        pending: order.qr_codes.filter(qr => !qr.is_scanned).length,
        completionPercentage: order.qr_codes.length > 0 
          ? Math.round((order.qr_codes.filter(qr => qr.is_scanned).length / order.qr_codes.length) * 100) 
          : 0
      }

      return res.status(200).json({
        success: true,
        data: {
          ...order,
          qr_stats: qrStats
        }
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Sipariş bilgileri alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Siparişi onayla - QR kodları oluştur ve stokları düşür
   */
  async confirmOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params
      const adminUserId = req.user?.userId

      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          message: 'Yetkisiz erişim'
        })
      }

      // Sipariş durumu kontrolü
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true
        }
      })

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Sipariş bulunamadı'
        })
      }

      if (order.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Sadece bekleyen siparişler onaylanabilir'
        })
      }

      // QR kodları oluştur ve siparişi onayla
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
          qr_codes: true
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Sipariş başarıyla onaylandı',
        data: {
          order: updatedOrder,
          qrCodes: qrResult.qrCodes,
          totalQRCodes: qrResult.totalQRCodes
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
   * QR kod okut
   */
  async scanQRCode(req: Request, res: Response) {
    try {
      const { qrCode } = req.body
      const adminUserId = req.user?.userId

      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          message: 'Yetkisiz erişim'
        })
      }

      if (!qrCode) {
        return res.status(400).json({
          success: false,
          message: 'QR kod zorunludur'
        })
      }

      const result = await qrCodeService.scanQRCode(qrCode, adminUserId)

      return res.status(200).json({
        success: true,
        message: result.isOrderCompleted 
          ? 'QR kod okundu ve sipariş teslim edildi!' 
          : 'QR kod başarıyla okundu',
        data: result
      })
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'QR kod okutulurken bir hata oluştu'
      })
    }
  }

  /**
   * Sipariş için QR kodlarını listele
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
      return res.status(500).json({
        success: false,
        message: error.message || 'QR kodları alınırken bir hata oluştu'
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
        deliveredOrders,
        canceledOrders,
        qrStats
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'CONFIRMED' } }),
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
            delivered: deliveredOrders,
            canceled: canceledOrders
          },
          qrCodes: qrStats
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
          message: 'Sipariş durumu zorunludur'
        })
      }

      const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELED']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz sipariş durumu'
        })
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status,
          updated_at: new Date()
        },
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
        message: 'Sipariş durumu güncellendi',
        data: order
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Sipariş durumu güncellenirken bir hata oluştu'
      })
    }
  }
}

export const adminOrderController = new AdminOrderController() 