import { Request, Response } from 'express'
import prisma from '../utils/prisma'
import { qrCodeService } from '../services/qr-code-service'

export class AdminOrderController {
  constructor() {
    this.getAllOrders = this.getAllOrders.bind(this)
    this.getOrderById = this.getOrderById.bind(this)
    this.confirmOrder = this.confirmOrder.bind(this)
    this.scanQRCode = this.scanQRCode.bind(this)
    this.scanMultipleQRCodes = this.scanMultipleQRCodes.bind(this)
    this.getOrderQRCodes = this.getOrderQRCodes.bind(this)
    this.getOrderStats = this.getOrderStats.bind(this)
    this.updateOrderStatus = this.updateOrderStatus.bind(this)
  }

  /**
   * Tüm siparişleri detaylarıyla birlikte listele (admin için)
   */
  async getAllOrders(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const status = req.query.status as string
      const search = req.query.search as string // Mağaza adı veya kullanıcı adı ile arama
      const skip = (page - 1) * limit

      const where: any = {}
      if (status) {
        where.status = status
      }

      // Arama filtresi
      if (search) {
        where.OR = [
          {
            user: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              surname: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              email: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            store_name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      }

      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                surname: true,
                email: true,
                Store: {
                  select: {
                    store_id: true,
                    kurum_adi: true,
                    vergi_numarasi: true,
                    vergi_dairesi: true,
                    telefon: true,
                    eposta: true,
                    adres: true,
                    acik_hesap_tutari: true,
                    limitsiz_acik_hesap: true
                  }
                }
              }
            },
            items: {
              include: {
                product: {
                  select: {
                    productId: true,
                    name: true,
                    productImage: true,
                    collection: {
                      select: {
                        collectionId: true,
                        name: true
                      }
                    }
                  }
                }
              }
            },
            cart: {
              select: {
                id: true,
                created_at: true,
                updated_at: true
              }
            },
            qr_codes: {
              select: {
                id: true,
                qr_code: true,
                quantity: true,
                is_scanned: true,
                scanned_at: true,
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

      // Her sipariş için detaylı istatistikler hesapla
      const ordersWithDetails = orders.map((order: any) => {
        const totalItems = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
        const totalArea = order.items.reduce((sum: number, item: any) => {
          const area = item.width && item.height ? (Number(item.width) * Number(item.height)) / 10000 : 0
          return sum + (area * item.quantity)
        }, 0)

        return {
          ...order,
          order_summary: {
            total_items: totalItems,
            total_area_m2: Number(totalArea.toFixed(2)),
            items_with_fringe: order.items.filter((item: any) => item.has_fringe).length,
            unique_products: order.items.length
          },
          qr_stats: {
            total: order.qr_codes.length,
            scanned: order.qr_codes.filter((qr: any) => qr.is_scanned).length,
            pending: order.qr_codes.filter((qr: any) => !qr.is_scanned).length,
            scanned_percentage: order.qr_codes.length > 0 
              ? Math.round((order.qr_codes.filter((qr: any) => qr.is_scanned).length / order.qr_codes.length) * 100)
              : 0
          },
          customer_info: {
            name: `${order.user.name} ${order.user.surname}`,
            email: order.user.email,
            phone: order.user.Store?.telefon || order.store_phone,
            store_name: order.user.Store?.kurum_adi || order.store_name,
            store_tax_number: order.user.Store?.vergi_numarasi || order.store_tax_number,
            store_address: order.user.Store?.adres || order.delivery_address
          },
          financial_info: {
            total_price: Number(order.total_price),
            store_balance: order.user.Store?.acik_hesap_tutari ? Number(order.user.Store.acik_hesap_tutari) : null,
            unlimited_account: order.user.Store?.limitsiz_acik_hesap || false
          }
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          orders: ordersWithDetails,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNext: page * limit < totalCount,
            hasPrev: page > 1
          },
          filters: {
            status: status || 'all',
            search: search || null
          }
        }
      })
    } catch (error: any) {
      console.error('Admin getAllOrders error:', error)
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
        message: result.deliveryInfo.isOrderCompleted 
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
   * Birden çok QR kod okut
   */
  async scanMultipleQRCodes(req: Request, res: Response) {
    try {
      const { qrCodes } = req.body
      const adminUserId = req.user?.userId

      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          message: 'Yetkisiz erişim'
        })
      }

      if (!qrCodes || !Array.isArray(qrCodes) || qrCodes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'QR kodlar dizisi zorunludur ve boş olamaz'
        })
      }

      // Maksimum 50 QR kod limiti
      if (qrCodes.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Bir seferde maksimum 50 QR kod okutabilirsiniz'
        })
      }

      const result = await qrCodeService.scanMultipleQRCodes(qrCodes, adminUserId)

      let message = `${result.summary.successfullyScanned} QR kod başarıyla okundu`
      
      if (result.summary.failed > 0) {
        message += `, ${result.summary.failed} QR kod başarısız`
      }
      
      if (result.summary.isOrderCompleted) {
        message += ' ve sipariş teslim edildi!'
      }

      return res.status(200).json({
        success: true,
        message,
        data: result
      })
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'QR kodlar okutulurken bir hata oluştu'
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

      // Mevcut siparişi kontrol et
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          qr_codes: true,
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

      // Sipariş iptal ediliyorsa açık hesap bakiyesini geri ekle
      if (status === 'CANCELED' && existingOrder.status !== 'CANCELED') {
        try {
          const store = existingOrder.user.Store
          if (store && !store.limitsiz_acik_hesap) {
            // Açık hesap tutarını geri ekle
            await prisma.store.update({
              where: { store_id: store.store_id },
              data: {
                acik_hesap_tutari: {
                  increment: Number(existingOrder.total_price)
                }
              }
            })
            
            console.log(`💰 Sipariş ${orderId} iptal edildi - ${existingOrder.total_price} TL açık hesaba geri eklendi`)
          }
        } catch (balanceError: any) {
          console.error('Açık hesap bakiyesi geri ekleme hatası:', balanceError.message)
          // Hata olsa da sipariş iptal işlemini devam ettir
        }
      }

      // Eğer CONFIRMED yapılıyorsa ve QR kodlar yoksa, QR kodları oluştur
      let qrResult = null
      if (status === 'CONFIRMED' && existingOrder.qr_codes.length === 0) {
        try {
          // QR kodları oluştur
          qrResult = await qrCodeService.generateQRCodesForOrder(orderId)
          
          // Stokları düşür
          await qrCodeService.reduceStockForOrder(orderId)
          
          console.log(`✅ Sipariş ${orderId} CONFIRMED olarak güncellendi - ${qrResult.totalQRCodes} QR kod oluşturuldu`)
        } catch (qrError: any) {
          console.error('QR kod oluşturma hatası:', qrError.message)
          // QR kod hatası olsa da durum güncellemesini devam ettir
        }
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
          },
          qr_codes: true
        }
      })

      // Response mesajını belirle
      let message = 'Sipariş durumu güncellendi'
      if (status === 'CONFIRMED' && qrResult) {
        message = `Sipariş durumu güncellendi ve ${qrResult.totalQRCodes} QR kod oluşturuldu`
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
        response.qrCodes = {
          totalQRCodes: qrResult.totalQRCodes,
          created: true
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
}

export const adminOrderController = new AdminOrderController() 