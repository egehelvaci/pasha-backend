import { Request, Response } from 'express'
import prisma from '../utils/prisma'
import { roundCurrency, addCurrency } from '../utils/number-utils'

export class StoreStatisticsController {
  constructor() {
    this.getMyStoreStats = this.getMyStoreStats.bind(this)
    this.getMyOrdersOverTime = this.getMyOrdersOverTime.bind(this)
    this.getMyTopProducts = this.getMyTopProducts.bind(this)
    this.getMyTotalStats = this.getMyTotalStats.bind(this)
    this.getMyStoreBalance = this.getMyStoreBalance.bind(this)
  }

  /**
   * Kullanıcının mağazasının bakiye bilgilerini getir
   * 
   * @route GET /api/my-statistics/balance
   * @access Authenticated (Giriş yapmış kullanıcılar)
   * @description Kullanıcının bağlı olduğu mağazanın tüm bakiye bilgilerini döner
   * 
   * @returns {Object} response
   * @returns {boolean} response.success - İşlem başarı durumu
   * @returns {Object} response.data - Mağaza ve bakiye bilgileri
   * @returns {Object} response.data.store_info - Mağaza temel bilgileri
   * @returns {string} response.data.store_info.store_id - Mağaza ID'si
   * @returns {string} response.data.store_info.kurum_adi - Mağaza adı
   * @returns {string} response.data.store_info.vergi_numarasi - Vergi numarası
   * @returns {string} response.data.store_info.telefon - Telefon numarası
   * @returns {string} response.data.store_info.eposta - E-posta adresi
   * @returns {string} response.data.store_info.adres - Adres bilgisi
   * @returns {Object} response.data.balance_info - Bakiye bilgileri
   * @returns {number} response.data.balance_info.bakiye - Mevcut bakiye (TL)
   * @returns {number} response.data.balance_info.acik_hesap_tutari - Açık hesap limiti (TL)
   * @returns {number} response.data.balance_info.toplam_kullanilabilir - Toplam kullanılabilir tutar (TL)
   * @returns {number} response.data.balance_info.maksimum_taksit - Maksimum taksit sayısı
   * @returns {boolean} response.data.balance_info.limitsiz_acik_hesap - Sınırsız açık hesap durumu
   * @returns {string} response.data.balance_info.currency - Para birimi (TRY)
   * 
   * @example
   * // GET /api/my-statistics/balance
   * // Authorization: Bearer <token>
   * // Response:
   * {
   *   "success": true,
   *   "data": {
   *     "store_info": {
   *       "store_id": "abc-123-def",
   *       "kurum_adi": "ABC Mağaza",
   *       "vergi_numarasi": "1234567890",
   *       "telefon": "0212 555 0123",
   *       "eposta": "info@abc.com",
   *       "adres": "İstanbul"
   *     },
   *     "balance_info": {
   *       "bakiye": 15000.00,
   *       "acik_hesap_tutari": 10000.00,
   *       "toplam_kullanilabilir": 25000.00,
   *       "maksimum_taksit": 12,
   *       "limitsiz_acik_hesap": false,
   *       "currency": "TRY"
   *     }
   *   }
   * }
   */
  async getMyStoreBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      // Kullanıcının mağaza bilgilerini getir
      const user = await prisma.user.findUnique({
        where: { userId },
        include: {
          Store: true
        }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        })
      }

      if (!user.Store) {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcı bir mağazaya bağlı değil'
        })
      }

      const store = user.Store

      // Bakiye bilgilerini hazırla
      const bakiye = roundCurrency(Number(store.bakiye || 0))
      const acikHesapTutari = roundCurrency(Number(store.acik_hesap_tutari || 0))
      const toplamKullanilabilir = addCurrency(bakiye, acikHesapTutari)
      const maksimumTaksit = store.maksimum_taksit || 1
      const limitsizAcikHesap = store.limitsiz_acik_hesap || false

      return res.status(200).json({
        success: true,
        data: {
          store_info: {
            store_id: store.store_id,
            kurum_adi: store.kurum_adi,
            vergi_numarasi: store.vergi_numarasi,
            telefon: store.telefon,
            eposta: store.eposta,
            adres: store.adres
          },
          balance_info: {
            bakiye: bakiye,
            acik_hesap_tutari: acikHesapTutari,
            toplam_kullanilabilir: toplamKullanilabilir,
            maksimum_taksit: maksimumTaksit,
            limitsiz_acik_hesap: limitsizAcikHesap,
            currency: 'TRY'
          }
        }
      })

    } catch (error: any) {
      console.error('Mağaza bakiye bilgileri getirilirken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Bakiye bilgileri alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Mağazanın genel istatistikleri
   */
  async getMyStoreStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId
      const { period = '1_year' } = req.query

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      // Zaman aralığını belirle
      let startDate: Date
      const now = new Date()
      
      switch (period) {
        case '1_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          break
        case '3_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          break
        case '1_year':
        default:
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          break
      }

      // Mağazanın siparişlerini getir
      const [
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        totalAmount,
        totalProducts,
        recentOrders
      ] = await Promise.all([
        // Toplam sipariş sayısı
        prisma.order.count({
          where: {
            user_id: userId,
            created_at: {
              gte: startDate
            },
            status: {
              not: 'CANCELED'
            }
          }
        }),

        // Bekleyen siparişler
        prisma.order.count({
          where: {
            user_id: userId,
            status: 'PENDING'
          }
        }),

        // Onaylanan siparişler
        prisma.order.count({
          where: {
            user_id: userId,
            status: 'CONFIRMED'
          }
        }),

        // Teslim edilen siparişler
        prisma.order.count({
          where: {
            user_id: userId,
            status: 'DELIVERED'
          }
        }),

        // Toplam tutar
        prisma.order.aggregate({
          _sum: {
            total_price: true
          },
          where: {
            user_id: userId,
            created_at: {
              gte: startDate
            },
            status: {
              not: 'CANCELED'
            }
          }
        }),

        // Toplam ürün adedi
        prisma.orderItem.aggregate({
          _sum: {
            quantity: true
          },
          where: {
            order: {
              user_id: userId,
              created_at: {
                gte: startDate
              },
              status: {
                not: 'CANCELED'
              }
            }
          }
        }),

        // Son 5 sipariş
        prisma.order.findMany({
          where: {
            user_id: userId
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 5,
          select: {
            id: true,
            total_price: true,
            status: true,
            created_at: true,
            items: {
              select: {
                quantity: true
              }
            }
          }
        })
      ])

      return res.status(200).json({
        success: true,
        data: {
          period,
          start_date: startDate,
          end_date: now,
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            confirmed: confirmedOrders,
            delivered: deliveredOrders
          },
          financial: {
            total_amount: Number(totalAmount._sum.total_price || 0)
          },
          products: {
            total_quantity: totalProducts._sum.quantity || 0
          },
          recent_orders: recentOrders.map(order => ({
            id: order.id,
            total_price: Number(order.total_price),
            status: order.status,
            created_at: order.created_at,
            total_items: order.items.reduce((sum, item) => sum + item.quantity, 0)
          }))
        }
      })

    } catch (error: any) {
      console.error('Mağaza istatistikleri getirilirken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'İstatistikler alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Mağazanın zaman bazlı sipariş grafiği
   */
  async getMyOrdersOverTime(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId
      const { period = '1_year', groupBy = 'month' } = req.query

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      // Zaman aralığını belirle
      let startDate: Date
      const now = new Date()
      
      switch (period) {
        case '1_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          break
        case '3_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          break
        case '1_year':
        default:
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          break
      }

      // Mağazanın siparişlerini getir
      const orders = await prisma.order.findMany({
        where: {
          user_id: userId,
          created_at: {
            gte: startDate
          },
          status: {
            not: 'CANCELED'
          }
        },
        include: {
          cart: {
            include: {
              cart_items: true
            }
          }
        }
      })

      // Manuel gruplandırma
      const groupedData: Record<string, {
        time_period: string,
        order_count: number,
        total_amount: number,
        total_area_m2: number
      }> = {}

      orders.forEach(order => {
        let timePeriod: string
        const orderDate = new Date(order.created_at)
        
        switch (groupBy) {
          case 'day':
            timePeriod = orderDate.toISOString().split('T')[0]
            break
          case 'week':
            const year = orderDate.getFullYear()
            const week = Math.ceil((orderDate.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
            timePeriod = `${year}-W${week.toString().padStart(2, '0')}`
            break
          case 'month':
          default:
            timePeriod = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`
            break
        }

        if (!groupedData[timePeriod]) {
          groupedData[timePeriod] = {
            time_period: timePeriod,
            order_count: 0,
            total_amount: 0,
            total_area_m2: 0
          }
        }

        groupedData[timePeriod].order_count += 1
        groupedData[timePeriod].total_amount += Number(order.total_price)
        
        if (order.cart?.cart_items) {
          order.cart.cart_items.forEach(item => {
            groupedData[timePeriod].total_area_m2 += Number(item.area_m2) * item.quantity
          })
        }
      })

      const chartData = Object.values(groupedData).sort((a, b) => 
        a.time_period.localeCompare(b.time_period)
      )

      return res.status(200).json({
        success: true,
        data: {
          chart_data: chartData,
          period,
          group_by: groupBy,
          start_date: startDate,
          end_date: now
        }
      })

    } catch (error: any) {
      console.error('Mağaza zaman bazlı verileri getirilirken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'İstatistikler alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Mağazanın en çok sipariş ettiği ürünler
   */
  async getMyTopProducts(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId
      const { period = '1_year', limit = 5 } = req.query

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      // Zaman aralığını belirle
      let startDate: Date
      const now = new Date()
      
      switch (period) {
        case '1_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          break
        case '3_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          break
        case '1_year':
        default:
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          break
      }

      const topProducts = await prisma.orderItem.groupBy({
        by: ['product_id'],
        where: {
          order: {
            user_id: userId,
            created_at: {
              gte: startDate
            },
            status: {
              not: 'CANCELED'
            }
          }
        },
        _sum: {
          quantity: true,
          total_price: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: Number(limit)
      })

      // Ürün bilgilerini getir
      const productData = await Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { productId: item.product_id },
            include: {
              collection: true
            }
          })

          return {
            product_id: item.product_id,
            product_name: product?.name || 'Bilinmeyen Ürün',
            collection_name: product?.collection?.name || 'Bilinmeyen Koleksiyon',
            product_image: product?.productImage || null,
            total_quantity: item._sum.quantity || 0,
            total_amount: Number(item._sum.total_price || 0),
            period
          }
        })
      )

      return res.status(200).json({
        success: true,
        data: {
          products: productData,
          period,
          total_products: productData.length
        }
      })

    } catch (error: any) {
      console.error('Mağaza top ürünleri getirilirken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'İstatistikler alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Mağazanın toplam istatistikleri
   */
  async getMyTotalStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId
      const { period = '1_year' } = req.query

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      // Zaman aralığını belirle
      let startDate: Date
      const now = new Date()
      
      switch (period) {
        case '1_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          break
        case '3_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          break
        case '1_year':
        default:
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          break
      }

      const [
        totalOrdersResult,
        totalAmountResult,
        totalQuantityResult,
        totalAreaResult,
        userInfo
      ] = await Promise.all([
        // Toplam sipariş sayısı
        prisma.order.count({
          where: {
            user_id: userId,
            created_at: {
              gte: startDate
            },
            status: {
              not: 'CANCELED'
            }
          }
        }),

        // Toplam tutar
        prisma.order.aggregate({
          _sum: {
            total_price: true
          },
          where: {
            user_id: userId,
            created_at: {
              gte: startDate
            },
            status: {
              not: 'CANCELED'
            }
          }
        }),

        // Toplam ürün adedi
        prisma.orderItem.aggregate({
          _sum: {
            quantity: true
          },
          where: {
            order: {
              user_id: userId,
              created_at: {
                gte: startDate
              },
              status: {
                not: 'CANCELED'
              }
            }
          }
        }),

        // Toplam metrekare
        prisma.$queryRaw`
          SELECT COALESCE(SUM(ci.area_m2 * ci.quantity), 0)::float as total_area_m2
          FROM "Order" o
          INNER JOIN carts c ON o.cart_id = c.id
          INNER JOIN cart_items ci ON c.id = ci.cart_id
          WHERE o.user_id = ${userId}
            AND o.created_at >= ${startDate}
            AND o.status != 'CANCELED'
        `,

        // Kullanıcı ve mağaza bilgisi
        prisma.user.findUnique({
          where: { userId },
          include: {
            Store: true
          }
        })
      ])

      const totalAreaData = totalAreaResult as any[]
      const totalArea = totalAreaData[0]?.total_area_m2 || 0

      return res.status(200).json({
        success: true,
        data: {
          store_info: {
            store_name: userInfo?.Store?.kurum_adi || 'Bilinmeyen Mağaza',
            store_id: userInfo?.Store?.store_id || null
          },
          totals: {
            total_orders: totalOrdersResult,
            total_amount: Number(totalAmountResult._sum.total_price || 0),
            total_product_quantity: totalQuantityResult._sum.quantity || 0,
            total_area_m2: totalArea
          },
          period,
          start_date: startDate,
          end_date: now
        }
      })

    } catch (error: any) {
      console.error('Mağaza toplam istatistikleri getirilirken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'İstatistikler alınırken bir hata oluştu'
      })
    }
  }
}

export const storeStatisticsController = new StoreStatisticsController() 