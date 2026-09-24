import { Request, Response } from 'express'
import { OrderStatus } from '../../generated/prisma'
import { addCurrency, roundCurrency } from '../utils/number-utils'
import prisma from '../utils/prisma'

export class StoreStatisticsController {
  constructor() {
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
          tckn: store.tckn,
          telefon: store.telefon,
          eposta: store.eposta,
          store_type: store.store_type,
          adres: null // Adres sistemi artık store-based olarak değişti
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
                in: [OrderStatus.DELIVERED] // Sadece teslim edilmiş siparişler
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

        // En çok sipariş verilen koleksiyonlar (Top 5) - Sadece teslim edilmiş siparişlerden
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
            AND o.status IN ('DELIVERED')
          GROUP BY p.collection_id, c.name, c.code
          ORDER BY total_quantity DESC
          LIMIT 5
        `,

        // Aylık sipariş dağılımı (Son 12 ay) - Sadece teslim edilmiş siparişlerden
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', o.created_at) as month,
            COUNT(o.id)::int as order_count,
            SUM(o.total_price)::float as total_amount
          FROM "Order" o
          WHERE o.user_id = ${userId}
            AND o.created_at >= ${startDate}
            AND o.status IN ('DELIVERED')
          GROUP BY DATE_TRUNC('month', o.created_at)
          ORDER BY month DESC
          LIMIT 12
        `,

        // Metrekare hesaplama için OrderItem'lar - Sadece teslim edilmiş siparişlerden
        prisma.orderItem.findMany({
          where: {
            order: {
              user_id: userId,
              created_at: {
                gte: startDate
              },
              status: {
                in: [OrderStatus.DELIVERED]
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
            break
          case 'SHIPPED':
            shippedOrders = stat._count.id
            break
          case 'DELIVERED':
            // total_amount yalnızca teslim edilmiş (DELIVERED) siparişlerden hesaplanır
            // (endpoint'in diğer metrikleri ve debug notu ile tutarlı)
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
      console.log('- Sadece teslim edilmiş siparişlerden tutar:', confirmedOrdersAmount)
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
            calculation_note: 'Toplam tutar ve metrekare sadece teslim edilmiş siparişlerden (DELIVERED) hesaplanır',
            included_statuses_for_amount: ['DELIVERED'],
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
