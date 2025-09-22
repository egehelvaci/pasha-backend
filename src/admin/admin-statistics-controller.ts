import { Request, Response } from 'express'
import prisma from '../utils/prisma'
import { OrderStatus } from '../../generated/prisma'

export class AdminStatisticsController {
  constructor() {
    this.getTopStores = this.getTopStores.bind(this)
    this.getTopProducts = this.getTopProducts.bind(this)
    this.getOrdersOverTime = this.getOrdersOverTime.bind(this)
    this.getTotalStatistics = this.getTotalStatistics.bind(this)
  }

  /**
   * En çok sipariş veren mağazalar (TOP 5) - ADMİN SİPARİŞLERİ VE NORMAL SİPARİŞLER DAHİL
   */
  async getTopStores(req: Request, res: Response) {
    try {
      const { period = '1_year' } = req.query

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
            in: [OrderStatus.DELIVERED] // Teslim edilmiş siparişler
          },
          // Admin siparişleri (admin_cart_id dolu) VE normal siparişler (cart_id dolu) dahil
          OR: [
            { admin_cart_id: { not: null } }, // Admin siparişleri
            { cart_id: { not: null } }        // Normal siparişler
          ]
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
   * En çok sipariş edilen ürünler (TOP 5) - ADMİN SİPARİŞLERİ VE NORMAL SİPARİŞLER DAHİL
   */
  async getTopProducts(req: Request, res: Response) {
    try {
      const { period = '1_year' } = req.query

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
              in: [OrderStatus.DELIVERED] // Teslim edilmiş siparişler
            },
            // Admin siparişleri (admin_cart_id dolu) VE normal siparişler (cart_id dolu) dahil
            OR: [
              { admin_cart_id: { not: null } }, // Admin siparişleri
              { cart_id: { not: null } }        // Normal siparişler
            ]
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
   * Zaman bazlı sipariş grafiği - ADMİN SİPARİŞLERİ VE NORMAL SİPARİŞLER DAHİL
   */
  async getOrdersOverTime(req: Request, res: Response) {
    try {
      const { period = '1_year', groupBy = 'month' } = req.query

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

      const ordersWithItems = await prisma.order.findMany({
        where: {
          created_at: {
            gte: startDate
          },
          status: {
            in: [OrderStatus.DELIVERED] // Sadece teslim edilmiş siparişler
          },
          // Admin siparişleri (admin_cart_id dolu) VE normal siparişler (cart_id dolu) dahil
          OR: [
            { admin_cart_id: { not: null } }, // Admin siparişleri
            { cart_id: { not: null } }        // Normal siparişler
          ]
        },
        include: {
          items: true
        }
      })

      const groupedData: Record<string, {
        time_period: string,
        order_count: number,
        total_amount: number,
        total_area_m2: number
      }> = {}

      ordersWithItems.forEach(order => {
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
        
        if (order.items) {
          order.items.forEach(item => {
            if (item.width && item.height) {
              const areaM2 = (Number(item.width) * Number(item.height) * item.quantity) / 10000
              groupedData[timePeriod].total_area_m2 += areaM2
            }
          })
        }
      })

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
   * Toplam istatistikler - ADMİN SİPARİŞLERİ VE NORMAL SİPARİŞLER DAHİL
   */
  async getTotalStatistics(req: Request, res: Response) {
    try {
      const { period = '1_year' } = req.query

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

      // Teslim edilmiş siparişler - Hem admin siparişleri hem normal siparişler dahil
      const whereClause = {
        created_at: {
          gte: startDate
        },
        status: {
          in: [OrderStatus.DELIVERED]
        },
        // Admin siparişleri (admin_cart_id dolu) VE normal siparişler (cart_id dolu) dahil
        OR: [
          { admin_cart_id: { not: null } }, // Admin siparişleri
          { cart_id: { not: null } }        // Normal siparişler
        ]
      }

      const [
        totalOrdersResult,
        totalAmountFromOrders,
        totalAmountFromOrderItems,
        totalQuantityResult,
        orderItemsForArea
      ] = await Promise.all([
        // Toplam sipariş sayısı
        prisma.order.count({
          where: whereClause
        }),

        // Order tablosundan toplam tutar
        prisma.order.aggregate({
          _sum: {
            total_price: true
          },
          where: whereClause
        }),

        // OrderItem tablosundan toplam tutar
        prisma.orderItem.aggregate({
          _sum: {
            total_price: true
          },
          where: {
            order: {
              created_at: {
                gte: startDate
              },
              status: {
                in: [OrderStatus.DELIVERED]
              },
              // Admin siparişleri (admin_cart_id dolu) VE normal siparişler (cart_id dolu) dahil
              OR: [
                { admin_cart_id: { not: null } }, // Admin siparişleri
                { cart_id: { not: null } }        // Normal siparişler
              ]
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
                in: [OrderStatus.DELIVERED]
              },
              // Admin siparişleri (admin_cart_id dolu) VE normal siparişler (cart_id dolu) dahil
              OR: [
                { admin_cart_id: { not: null } }, // Admin siparişleri
                { cart_id: { not: null } }        // Normal siparişler
              ]
            }
          }
        }),

        // Metrekare hesaplama için OrderItem'lar
        prisma.orderItem.findMany({
          where: {
            order: {
              created_at: {
                gte: startDate
              },
              status: {
                in: [OrderStatus.DELIVERED]
              },
              // Admin siparişleri (admin_cart_id dolu) VE normal siparişler (cart_id dolu) dahil
              OR: [
                { admin_cart_id: { not: null } }, // Admin siparişleri
                { cart_id: { not: null } }        // Normal siparişler
              ]
            },
            AND: [
              { width: { not: null } },
              { height: { not: null } }
            ]
          },
          select: {
            width: true,
            height: true,
            quantity: true
          }
        })
      ])

      // Metrekare hesaplama
      let totalAreaM2 = 0
      orderItemsForArea.forEach(item => {
        if (item.width && item.height) {
          const areaM2 = (Number(item.width) * Number(item.height) * item.quantity) / 10000
          totalAreaM2 += areaM2
        }
      })

      const totalAmount = Number(totalAmountFromOrders._sum?.total_price || 0)
      const totalAmountFromItems = Number(totalAmountFromOrderItems._sum?.total_price || 0)

      // Admin ve normal siparişlerin ayrı sayılarını hesapla
      const adminOrdersCount = await prisma.order.count({
        where: {
          ...whereClause,
          admin_cart_id: { not: null }
        }
      })

      const normalOrdersCount = await prisma.order.count({
        where: {
          ...whereClause,
          cart_id: { not: null }
        }
      })

      console.log('İstatistik Raporu (Admin ve Normal Siparişler Dahil):')
      console.log('- Zaman aralığı:', startDate, 'dan', now, 'a kadar')
      console.log('- Dahil edilen durumlar: DELIVERED')
      console.log('- Toplam sipariş sayısı:', totalOrdersResult)
      console.log('  * Admin siparişleri:', adminOrdersCount)
      console.log('  * Normal siparişler:', normalOrdersCount)
      console.log('- Order tablosundan toplam tutar:', totalAmount)
      console.log('- OrderItem tablosundan toplam tutar:', totalAmountFromItems)
      console.log('- Hesaplanan toplam metrekare:', totalAreaM2)

      return res.status(200).json({
        success: true,
        data: {
          total_orders: totalOrdersResult,
          admin_orders: adminOrdersCount,
          normal_orders: normalOrdersCount,
          total_amount: totalAmount,
          total_amount_from_items: totalAmountFromItems,
          total_product_quantity: totalQuantityResult._sum?.quantity || 0,
          total_area_m2: Math.round(totalAreaM2 * 100) / 100,
          period,
          start_date: startDate,
          end_date: now,
          included_statuses: ['DELIVERED'],
          order_types_included: ['ADMIN_ORDERS', 'NORMAL_ORDERS'],
          debug: {
            area_calculated_items: orderItemsForArea.length,
            amount_difference: Math.abs(totalAmount - totalAmountFromItems)
          }
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
