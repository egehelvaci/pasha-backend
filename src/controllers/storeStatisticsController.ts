import { Request, Response } from 'express'
import prisma from '../utils/prisma'
import { roundCurrency, addCurrency } from '../utils/number-utils'
import { OrderStatus } from '../../generated/prisma'

export class StoreStatisticsController {
  constructor() {
    this.getMyStoreStats = this.getMyStoreStats.bind(this)
    this.getMyOrdersOverTime = this.getMyOrdersOverTime.bind(this)
    this.getMyTopProducts = this.getMyTopProducts.bind(this)
    this.getMyTotalStats = this.getMyTotalStats.bind(this)
    this.getMyStoreBalance = this.getMyStoreBalance.bind(this)
    this.getMyUserStatistics = this.getMyUserStatistics.bind(this)
  }

  /**
   * Mağaza bakiye bilgilerini getir
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
   * Mağazanın genel istatistikleri - DÜZELTILMIŞ (Sadece onaylanmış siparişler)
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

      // Sadece onaylanmış siparişler için where clause
      const confirmedOrdersWhere = {
        user_id: userId,
        created_at: {
          gte: startDate
        },
        status: {
          in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED] // Sadece onaylanmış siparişler
        }
      }

      // Mağazanın siparişlerini getir
      const [
        totalConfirmedOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        shippedOrders,
        totalAmount,
        totalProducts,
        recentOrders
      ] = await Promise.all([
        // Toplam onaylanmış sipariş sayısı (istatistikler için)
        prisma.order.count({
          where: confirmedOrdersWhere
        }),

        // Bekleyen siparişler (ayrı gösterim için)
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

        // Kargoya verilen siparişler
        prisma.order.count({
          where: {
            user_id: userId,
            status: 'SHIPPED'
          }
        }),

        // Toplam tutar (sadece onaylanmış siparişlerden)
        prisma.order.aggregate({
          _sum: {
            total_price: true
          },
          where: confirmedOrdersWhere
        }),

        // Toplam ürün adedi (sadece onaylanmış siparişlerden)
        prisma.orderItem.aggregate({
          _sum: {
            quantity: true
          },
          where: {
            order: confirmedOrdersWhere
          }
        }),

        // Son 5 sipariş (tüm durumlar)
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

      console.log('Kullanıcı İstatistik Raporu (Sadece Onaylanmış Siparişler):')
      console.log('- Kullanıcı ID:', userId)
      console.log('- Zaman aralığı:', startDate, 'dan', now, 'a kadar')
      console.log('- Dahil edilen durumlar: CONFIRMED, SHIPPED, DELIVERED')
      console.log('- Toplam onaylanmış sipariş sayısı:', totalConfirmedOrders)
      console.log('- Toplam tutar:', Number(totalAmount._sum?.total_price || 0))

      return res.status(200).json({
        success: true,
        data: {
          period,
          start_date: startDate,
          end_date: now,
          orders: {
            total_confirmed: totalConfirmedOrders, // Sadece onaylanmış siparişler
            pending: pendingOrders,
            confirmed: confirmedOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders
          },
          financial: {
            total_amount: Number(totalAmount._sum?.total_price || 0) // Sadece onaylanmış siparişlerden
          },
          products: {
            total_quantity: totalProducts._sum?.quantity || 0 // Sadece onaylanmış siparişlerden
          },
          recent_orders: recentOrders.map(order => ({
            id: order.id,
            total_price: Number(order.total_price),
            status: order.status,
            created_at: order.created_at,
            total_items: order.items.reduce((sum, item) => sum + item.quantity, 0)
          })),
          // Debug bilgileri
          debug: {
            included_statuses: ['CONFIRMED', 'SHIPPED', 'DELIVERED'],
            excluded_statuses: ['PENDING', 'CANCELED']
          }
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
   * Mağazanın ürün bazlı istatistikleri - DÜZELTILMIŞ
   */
  async getMyTopProducts(req: Request, res: Response) {
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

      const topProducts = await prisma.orderItem.groupBy({
        by: ['product_id'],
        where: {
          order: {
            user_id: userId,
            created_at: {
              gte: startDate
            },
            status: {
              in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED] // Sadece onaylanmış siparişler
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
        take: 10
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
          start_date: startDate,
          end_date: now,
          total_products: productData.length,
          included_statuses: ['CONFIRMED', 'SHIPPED', 'DELIVERED']
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
   * Mağazanın zaman bazlı sipariş grafiği - DÜZELTILMIŞ
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

      const ordersWithItems = await prisma.order.findMany({
        where: {
          user_id: userId,
          created_at: {
            gte: startDate
          },
          status: {
            in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED] // Sadece onaylanmış siparişler
          }
        },
        include: {
          items: true
        }
      })

      // Manuel gruplandırma
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
        
        // OrderItem'lardan alan hesapla
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
          end_date: now,
          included_statuses: ['CONFIRMED', 'SHIPPED', 'DELIVERED']
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
   * Mağazanın toplam istatistikleri - DÜZELTILMIŞ (Sadece onaylanmış siparişler)
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

      // Sadece onaylanmış siparişler için where clause
      const whereClause = {
        user_id: userId,
        created_at: {
          gte: startDate
        },
        status: {
          in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED]
        }
      }

      const [
        totalOrdersResult,
        totalAmountFromOrders,
        totalAmountFromOrderItems,
        totalQuantityResult,
        orderItemsForArea,
        userInfo
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

        // OrderItem tablosundan toplam tutar (doğrulama için)
        prisma.orderItem.aggregate({
          _sum: {
            total_price: true
          },
          where: {
            order: whereClause
          }
        }),

        // Toplam ürün adedi
        prisma.orderItem.aggregate({
          _sum: {
            quantity: true
          },
          where: {
            order: whereClause
          }
        }),

        // Metrekare hesaplama için OrderItem'lar
        prisma.orderItem.findMany({
          where: {
            order: whereClause,
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
        }),

        // Kullanıcı ve mağaza bilgisi
        prisma.user.findUnique({
          where: { userId },
          include: {
            Store: true
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

      console.log('Kullanıcı Toplam İstatistik Raporu (Sadece Onaylanmış Siparişler):')
      console.log('- Kullanıcı ID:', userId)
      console.log('- Zaman aralığı:', startDate, 'dan', now, 'a kadar')
      console.log('- Dahil edilen durumlar: CONFIRMED, SHIPPED, DELIVERED')
      console.log('- Toplam sipariş sayısı:', totalOrdersResult)
      console.log('- Order tablosundan toplam tutar:', totalAmount)
      console.log('- OrderItem tablosundan toplam tutar:', totalAmountFromItems)
      console.log('- Hesaplanan toplam metrekare:', totalAreaM2)

      return res.status(200).json({
        success: true,
        data: {
          store_info: {
            store_name: userInfo?.Store?.kurum_adi || 'Bilinmeyen Mağaza',
            store_id: userInfo?.Store?.store_id || null
          },
          totals: {
            total_orders: totalOrdersResult,
            total_amount: totalAmount,
            total_amount_from_items: totalAmountFromItems,
            total_product_quantity: totalQuantityResult._sum?.quantity || 0,
            total_area_m2: Math.round(totalAreaM2 * 100) / 100,
            period,
            start_date: startDate,
            end_date: now
          },
          debug: {
            included_statuses: ['CONFIRMED', 'SHIPPED', 'DELIVERED'],
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

  /**
   * Kullanıcının kendi istatistikleri - DÜZELTILMIŞ (Sadece onaylanmış siparişler için ciro)
   */
  async getMyUserStatistics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      // Zaman aralığını belirle
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
        case '6_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
          break
        case '1_year':
        default:
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          break
      }

      // Kullanıcı bilgilerini getir
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

      // Paralel veri toplama işlemleri
      const [
        orderStatistics,
        topProductsData,
        topCollectionsData,
        monthlyOrdersData,
        orderItemsForArea
      ] = await Promise.all([
        // Temel sipariş istatistikleri (tüm durumları göster ama tutarları sadece onaylanmışlardan al)
        prisma.order.groupBy({
          by: ['status'],
          where: {
            user_id: userId,
            created_at: {
              gte: startDate
            }
          },
          _count: {
            id: true
          },
          _sum: {
            total_price: true
          }
        }),

        // En çok sipariş verilen ürünler (Top 10) - Sadece onaylanmış siparişlerden
        prisma.orderItem.groupBy({
          by: ['product_id'],
          where: {
            order: {
              user_id: userId,
              created_at: {
                gte: startDate
              },
              status: {
                in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED] // Sadece onaylanmış siparişler
              }
            }
          },
          _sum: {
            quantity: true,
            total_price: true
          },
          _count: {
            id: true
          },
          orderBy: {
            _sum: {
              quantity: 'desc'
            }
          },
          take: 10
        }),

        // En çok sipariş verilen koleksiyonlar (Top 5) - Sadece onaylanmış siparişlerden
        prisma.$queryRaw`
          SELECT 
            p.collection_id,
            c.name as collection_name,
            c.code as collection_code,
            SUM(oi.quantity)::int as total_quantity,
            SUM(oi.total_price)::float as total_amount,
            COUNT(DISTINCT o.id)::int as order_count
          FROM "OrderItem" oi
          INNER JOIN "Order" o ON oi.order_id = o.id
          INNER JOIN "Product" p ON oi.product_id = p.product_id
          INNER JOIN "Collection" c ON p.collection_id = c.collection_id
          WHERE o.user_id = ${userId}
            AND o.created_at >= ${startDate}
            AND o.status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED')
          GROUP BY p.collection_id, c.name, c.code
          ORDER BY total_quantity DESC
          LIMIT 5
        `,

        // Aylık sipariş dağılımı (Son 12 ay) - Sadece onaylanmış siparişlerden
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', o.created_at) as month,
            COUNT(o.id)::int as order_count,
            SUM(o.total_price)::float as total_amount
          FROM "Order" o
          WHERE o.user_id = ${userId}
            AND o.created_at >= ${startDate}
            AND o.status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED')
          GROUP BY DATE_TRUNC('month', o.created_at)
          ORDER BY month DESC
          LIMIT 12
        `,

        // Metrekare hesaplama için OrderItem'lar - Sadece onaylanmış siparişlerden
        prisma.orderItem.findMany({
          where: {
            order: {
              user_id: userId,
              created_at: {
                gte: startDate
              },
              status: {
                in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED]
              }
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

      // Sipariş istatistiklerini hesapla
      let totalOrders = 0
      let totalAmountAllOrders = 0 // Tüm siparişler
      let confirmedOrdersAmount = 0 // Sadece onaylanmış siparişler
      let pendingOrders = 0
      let confirmedOrders = 0
      let shippedOrders = 0
      let deliveredOrders = 0
      let canceledOrders = 0

      orderStatistics.forEach(stat => {
        totalOrders += stat._count.id
        totalAmountAllOrders += Number(stat._sum.total_price || 0)
        
        switch (stat.status) {
          case 'PENDING':
            pendingOrders = stat._count.id
            break
          case 'CONFIRMED':
            confirmedOrders = stat._count.id
            confirmedOrdersAmount += Number(stat._sum.total_price || 0)
            break
          case 'SHIPPED':
            shippedOrders = stat._count.id
            confirmedOrdersAmount += Number(stat._sum.total_price || 0)
            break
          case 'DELIVERED':
            deliveredOrders = stat._count.id
            confirmedOrdersAmount += Number(stat._sum.total_price || 0)
            break
          case 'CANCELED':
            canceledOrders = stat._count.id
            break
        }
      })

      // Top ürünler için detay bilgileri getir
      const topProducts = await Promise.all(
        topProductsData.map(async (item) => {
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
            total_amount: roundCurrency(Number(item._sum.total_price || 0)),
            order_count: item._count.id || 0
          }
        })
      )

      // Metrekare hesaplama
      let totalAreaM2 = 0
      orderItemsForArea.forEach(item => {
        if (item.width && item.height) {
          const areaM2 = (Number(item.width) * Number(item.height) * item.quantity) / 10000
          totalAreaM2 += areaM2
        }
      })

      // Aylık verileri formatla
      const monthlyOrders = (monthlyOrdersData as any[]).map(month => ({
        month: month.month,
        order_count: month.order_count || 0,
        total_amount: roundCurrency(month.total_amount || 0)
      }))

      // Top koleksiyonları formatla
      const topCollections = (topCollectionsData as any[]).map(collection => ({
        collection_id: collection.collection_id,
        collection_name: collection.collection_name,
        collection_code: collection.collection_code,
        total_quantity: collection.total_quantity || 0,
        total_amount: roundCurrency(collection.total_amount || 0),
        order_count: collection.order_count || 0
      }))

      console.log('Kullanıcı Detaylı İstatistik Raporu:')
      console.log('- Kullanıcı ID:', userId)
      console.log('- Zaman aralığı:', startDate, 'dan', now, 'a kadar')
      console.log('- Tüm siparişlerden toplam tutar:', totalAmountAllOrders)
      console.log('- Sadece onaylanmış siparişlerden tutar:', confirmedOrdersAmount)
      console.log('- Hesaplanan toplam metrekare:', totalAreaM2)

      return res.status(200).json({
        success: true,
        data: {
          user_info: {
            user_id: user.userId,
            name: `${user.name} ${user.surname}`,
            email: user.email,
            store_name: user.Store?.kurum_adi || 'Mağaza Bilgisi Yok',
            store_id: user.store_id
          },
          order_statistics: {
            total_orders: totalOrders, // Tüm siparişler
            total_amount: roundCurrency(confirmedOrdersAmount), // Sadece onaylanmış siparişlerden
            total_amount_all_orders: roundCurrency(totalAmountAllOrders), // Karşılaştırma için
            total_area_m2: roundCurrency(totalAreaM2),
            pending_orders: pendingOrders,
            confirmed_orders: confirmedOrders,
            shipped_orders: shippedOrders,
            delivered_orders: deliveredOrders,
            canceled_orders: canceledOrders,
            completed_orders: confirmedOrders + shippedOrders + deliveredOrders
          },
          top_products: topProducts,
          top_collections: topCollections,
          monthly_orders: monthlyOrders,
          period_info: {
            period: period as string,
            start_date: startDate,
            end_date: now
          },
          debug: {
            calculation_note: 'Toplam tutar ve metrekare sadece onaylanmış siparişlerden (CONFIRMED, SHIPPED, DELIVERED) hesaplanır',
            included_statuses_for_amount: ['CONFIRMED', 'SHIPPED', 'DELIVERED'],
            area_calculated_items: orderItemsForArea.length
          }
        }
      })

    } catch (error: any) {
      console.error('Kullanıcı istatistikleri getirilirken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'İstatistikler alınırken bir hata oluştu'
      })
    }
  }
}

export const storeStatisticsController = new StoreStatisticsController() 
