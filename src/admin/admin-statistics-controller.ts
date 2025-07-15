import { Request, Response } from 'express'
import prisma from '../utils/prisma'

export class AdminStatisticsController {
  constructor() {
    this.getTopStores = this.getTopStores.bind(this)
    this.getTopProducts = this.getTopProducts.bind(this)
    this.getOrdersOverTime = this.getOrdersOverTime.bind(this)
    this.getTotalStatistics = this.getTotalStatistics.bind(this)
  }

  /**
   * En çok sipariş veren mağazalar (TOP 5)
   */
  async getTopStores(req: Request, res: Response) {
    try {
      const { period = '1_year' } = req.query // 1_month, 3_months, 1_year

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

      const topStores = await prisma.order.groupBy({
        by: ['user_id'],
        where: {
          created_at: {
            gte: startDate
          },
          status: {
            not: 'CANCELED'
          }
        },
        _count: {
          id: true
        },
        _sum: {
          total_price: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 5
      })

      // Mağaza bilgilerini getir
      const storeData = await Promise.all(
        topStores.map(async (store) => {
          const user = await prisma.user.findUnique({
            where: { userId: store.user_id },
            include: {
              Store: true
            }
          })

          return {
            store_id: user?.Store?.store_id || null,
            store_name: user?.Store?.kurum_adi || 'Bilinmeyen Mağaza',
            user_name: `${user?.name || ''} ${user?.surname || ''}`.trim(),
            order_count: store._count.id,
            total_amount: Number(store._sum.total_price || 0),
            period
          }
        })
      )

      return res.status(200).json({
        success: true,
        data: {
          stores: storeData,
          period,
          total_stores: storeData.length
        }
      })

    } catch (error: any) {
      console.error('En çok sipariş veren mağazalar getirilirken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'İstatistikler alınırken bir hata oluştu'
      })
    }
  }

  /**
   * En çok sipariş edilen ürünler (TOP 5)
   */
  async getTopProducts(req: Request, res: Response) {
    try {
      const { period = '1_year' } = req.query // 1_month, 3_months, 1_year

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
        take: 5
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
      console.error('En çok sipariş edilen ürünler getirilirken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'İstatistikler alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Zaman bazlı sipariş grafiği (metrekare bazında)
   */
  async getOrdersOverTime(req: Request, res: Response) {
    try {
      const { period = '1_year', groupBy = 'month' } = req.query // month, week, day

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

      // SQL sorgusu için format belirleme
      let dateFormat: string
      switch (groupBy) {
        case 'day':
          dateFormat = 'YYYY-MM-DD'
          break
        case 'week':
          dateFormat = 'YYYY-"W"WW'
          break
        case 'month':
        default:
          dateFormat = 'YYYY-MM'
          break
      }

      // Önce siparişleri grupla
      const ordersByPeriod = await prisma.order.findMany({
        where: {
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

      ordersByPeriod.forEach(order => {
        let timePeriod: string
        const orderDate = new Date(order.created_at)
        
        switch (groupBy) {
          case 'day':
            timePeriod = orderDate.toISOString().split('T')[0] // YYYY-MM-DD
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
        
        // Sepet itemlarından alan hesapla
        if (order.cart?.cart_items) {
          order.cart.cart_items.forEach(item => {
            groupedData[timePeriod].total_area_m2 += Number(item.area_m2) * item.quantity
          })
        }
      })

      // Array'e çevir ve sırala
      const timeBasedOrders = Object.values(groupedData).sort((a, b) => 
        a.time_period.localeCompare(b.time_period)
      )

      return res.status(200).json({
        success: true,
        data: {
          chart_data: timeBasedOrders,
          period,
          group_by: groupBy,
          start_date: startDate,
          end_date: now
        }
      })

    } catch (error: any) {
      console.error('Zaman bazlı sipariş verileri getirilirken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'İstatistikler alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Toplam istatistikler
   */
  async getTotalStatistics(req: Request, res: Response) {
    try {
      const { period = '1_year' } = req.query // 1_month, 3_months, 1_year

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
        totalAreaResult
      ] = await Promise.all([
        // Toplam sipariş sayısı
        prisma.order.count({
          where: {
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
              created_at: {
                gte: startDate
              },
              status: {
                not: 'CANCELED'
              }
            }
          }
        }),

        // Toplam metrekare (sepet itemlarından)
        prisma.$queryRaw`
          SELECT COALESCE(SUM(ci.area_m2 * ci.quantity), 0)::float as total_area_m2
          FROM "Order" o
          INNER JOIN carts c ON o.cart_id = c.id
          INNER JOIN cart_items ci ON c.id = ci.cart_id
          WHERE o.created_at >= ${startDate}
            AND o.status != 'CANCELED'
        `
      ])

      const totalAreaData = totalAreaResult as any[]
      const totalArea = totalAreaData[0]?.total_area_m2 || 0

      return res.status(200).json({
        success: true,
        data: {
          total_orders: totalOrdersResult,
          total_amount: Number(totalAmountResult._sum.total_price || 0),
          total_product_quantity: totalQuantityResult._sum.quantity || 0,
          total_area_m2: totalArea,
          period,
          start_date: startDate,
          end_date: now
        }
      })

    } catch (error: any) {
      console.error('Toplam istatistikler getirilirken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'İstatistikler alınırken bir hata oluştu'
      })
    }
  }
}

export const adminStatisticsController = new AdminStatisticsController() 