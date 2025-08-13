import { Request, Response } from 'express'
import prisma from './utils/prisma'

export class EmployeeStatsController {
  constructor() {
    this.getEmployeeStats = this.getEmployeeStats.bind(this)
    this.getAllEmployeeStats = this.getAllEmployeeStats.bind(this)
  }

  /**
   * Belirli bir çalışanın istatistiklerini getir
   */
  async getEmployeeStats(req: Request, res: Response) {
    try {
      const { employeeId } = req.params
      const { startDate, endDate } = req.query

      // Tarih filtreleri
      let dateFilter: any = {}
      if (startDate) {
        dateFilter.completedAt = {
          gte: new Date(startDate as string)
        }
      }
      if (endDate) {
        dateFilter.completedAt = {
          ...dateFilter.completedAt,
          lte: new Date(endDate as string)
        }
      }

      // Çalışan bilgilerini al
      const employee = await prisma.user.findUnique({
        where: { userId: employeeId },
        select: {
          userId: true,
          name: true,
          surname: true,
          email: true
        }
      })

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Çalışan bulunamadı'
        })
      }

      // İstatistikleri hesapla
      const stats = await prisma.employeeOrderStats.findMany({
        where: {
          employeeId: employeeId,
          ...dateFilter
        },
        include: {
          order: {
            select: {
              id: true,
              status: true,
              total_price: true,
              created_at: true,
              user: {
                select: {
                  name: true,
                  surname: true,
                  Store: {
                    select: {
                      kurum_adi: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          completedAt: 'desc'
        }
      })

      // Toplamları hesapla
      const totalStats = {
        // Genel istatistikler
        totalOrders: stats.length,
        totalAmount: stats.reduce((sum, stat) => sum + Number(stat.totalAmount), 0),
        totalAreaM2: stats.reduce((sum, stat) => sum + Number(stat.totalAreaM2), 0),
        totalItems: stats.reduce((sum, stat) => sum + stat.totalItems, 0),
        
        // Sipariş durumu bazlı istatistikler
        completedOrders: stats.filter(s => s.orderStatus === 'DELIVERED').length, // Tamamlanan siparişler
        preparedOrders: stats.filter(s => s.orderStatus === 'READY').length,      // Sadece hazırlanan siparişler
        deliveredOrders: stats.filter(s => s.orderStatus === 'DELIVERED').length, // Teslim edilen siparişler
        
        // Alan bazlı istatistikler (m²)
        totalPreparedAreaM2: stats
          .filter(s => s.preparedAreaM2)
          .reduce((sum, stat) => sum + Number(stat.preparedAreaM2 || 0), 0),
        
        totalDeliveredAreaM2: stats
          .filter(s => s.deliveredAreaM2)
          .reduce((sum, stat) => sum + Number(stat.deliveredAreaM2 || 0), 0),
        
        // Ortalama değerler
        averageOrderValue: stats.length > 0 ? stats.reduce((sum, stat) => sum + Number(stat.totalAmount), 0) / stats.length : 0,
        averageAreaPerOrder: stats.length > 0 ? stats.reduce((sum, stat) => sum + Number(stat.totalAreaM2), 0) / stats.length : 0,
        averageItemsPerOrder: stats.length > 0 ? stats.reduce((sum, stat) => sum + stat.totalItems, 0) / stats.length : 0,
        
        // Performans oranları
        preparationRate: stats.length > 0 ? (stats.filter(s => s.preparedAreaM2).length / stats.length * 100) : 0,
        deliveryRate: stats.length > 0 ? (stats.filter(s => s.deliveredAreaM2).length / stats.length * 100) : 0,
        completionRate: stats.length > 0 ? (stats.filter(s => s.orderStatus === 'DELIVERED').length / stats.length * 100) : 0
      }

      // Günlük performans analizi
      const dailyStats = this.groupStatsByDate(stats)

      return res.status(200).json({
        success: true,
        data: {
          employee: {
            userId: employee.userId,
            name: employee.name,
            surname: employee.surname,
            email: employee.email,
            fullName: `${employee.name} ${employee.surname}`
          },
          summary: totalStats,
          dailyPerformance: dailyStats,
          orderHistory: stats.map(stat => ({
            orderId: stat.orderId,
            orderStatus: stat.orderStatus,
            totalAmount: Number(stat.totalAmount),
            totalAreaM2: Number(stat.totalAreaM2),
            totalItems: stat.totalItems,
            completedAt: stat.completedAt,
            customer: stat.order.user ? {
              name: `${stat.order.user.name} ${stat.order.user.surname}`,
              store: stat.order.user.Store?.kurum_adi
            } : null
          })),
          dateRange: {
            startDate: startDate || null,
            endDate: endDate || null
          }
        }
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Çalışan istatistikleri alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Tüm çalışanların istatistiklerini getir (özet)
   */
  async getAllEmployeeStats(req: Request, res: Response) {
    try {
      const { startDate, endDate, limit = 50, orderBy = 'totalAreaM2' } = req.query

      // Tarih filtreleri
      let dateFilter: any = {}
      if (startDate) {
        dateFilter.completedAt = {
          gte: new Date(startDate as string)
        }
      }
      if (endDate) {
        dateFilter.completedAt = {
          ...dateFilter.completedAt,
          lte: new Date(endDate as string)
        }
      }

      // Çalışan bazında istatistikleri topla
      const employeeStats = await prisma.employeeOrderStats.groupBy({
        by: ['employeeId'],
        where: dateFilter,
        _count: {
          orderId: true
        },
        _sum: {
          totalAmount: true,
          totalAreaM2: true,
          totalItems: true,
          preparedAreaM2: true,
          deliveredAreaM2: true
        }
      })

      // Her çalışan için detaylı sipariş durumu istatistikleri
      const employeeOrderCounts = await Promise.all(
        employeeStats.map(async (stat) => {
          const [readyCount, deliveredCount] = await Promise.all([
            prisma.employeeOrderStats.count({
              where: { 
                employeeId: stat.employeeId,
                orderStatus: 'READY',
                ...dateFilter
              }
            }),
            prisma.employeeOrderStats.count({
              where: { 
                employeeId: stat.employeeId,
                orderStatus: 'DELIVERED',
                ...dateFilter
              }
            })
          ])
          
          return {
            employeeId: stat.employeeId,
            readyOrders: readyCount,
            deliveredOrders: deliveredCount
          }
        })
      )

      // Çalışan bilgilerini ekle
      const employeeStatsWithDetails = await Promise.all(
        employeeStats.map(async (stat) => {
          const employee = await prisma.user.findUnique({
            where: { userId: stat.employeeId },
            select: {
              userId: true,
              name: true,
              surname: true,
              email: true
            }
          })

          // Son sipariş tarihini bul
          const lastOrder = await prisma.employeeOrderStats.findFirst({
            where: { 
              employeeId: stat.employeeId,
              ...dateFilter
            },
            orderBy: { completedAt: 'desc' },
            select: { completedAt: true }
          })

          // Bu çalışanın sipariş durumu istatistikleri
          const orderCounts = employeeOrderCounts.find(oc => oc.employeeId === stat.employeeId) || {
            readyOrders: 0,
            deliveredOrders: 0
          }

          return {
            employee: employee ? {
              userId: employee.userId,
              name: employee.name,
              surname: employee.surname,
              fullName: `${employee.name} ${employee.surname}`,
              email: employee.email
            } : null,
            stats: {
              // Genel istatistikler
              totalOrders: stat._count.orderId,
              totalAmount: Number(stat._sum.totalAmount || 0),
              totalAreaM2: Number(stat._sum.totalAreaM2 || 0),
              totalItems: stat._sum.totalItems || 0,
              
              // Sipariş durumu bazlı
              preparedOrders: orderCounts.readyOrders,        // Hazırladığı siparişler
              deliveredOrders: orderCounts.deliveredOrders,   // Teslim ettiği siparişler
              completedOrders: orderCounts.deliveredOrders,   // Tamamladığı siparişler (delivered ile aynı)
              
              // Alan bazlı (m²)
              totalPreparedAreaM2: Number(stat._sum.preparedAreaM2 || 0),  // Hazırladığı m²
              totalDeliveredAreaM2: Number(stat._sum.deliveredAreaM2 || 0), // Teslim ettiği m²
              
              // Tarih ve ortalamalar
              lastOrderDate: lastOrder?.completedAt || null,
              averageOrderValue: stat._count.orderId > 0 
                ? Number(stat._sum.totalAmount || 0) / stat._count.orderId 
                : 0,
              averageAreaPerOrder: stat._count.orderId > 0 
                ? Number(stat._sum.totalAreaM2 || 0) / stat._count.orderId 
                : 0,
              
              // Performans oranları
              preparationRate: stat._count.orderId > 0 
                ? (orderCounts.readyOrders / stat._count.orderId * 100) 
                : 0,
              deliveryRate: stat._count.orderId > 0 
                ? (orderCounts.deliveredOrders / stat._count.orderId * 100) 
                : 0,
              completionRate: stat._count.orderId > 0 
                ? (orderCounts.deliveredOrders / stat._count.orderId * 100) 
                : 0
            }
          }
        })
      )

      // Çalışanı bulunamayanları filtrele
      const validStats = employeeStatsWithDetails.filter(stat => stat.employee !== null)

      // Sıralama
      const sortedStats = validStats.sort((a, b) => {
        switch (orderBy) {
          case 'totalAmount':
            return b.stats.totalAmount - a.stats.totalAmount
          case 'totalOrders':
            return b.stats.totalOrders - a.stats.totalOrders
          case 'totalAreaM2':
          default:
            return b.stats.totalAreaM2 - a.stats.totalAreaM2
        }
      })

      // Limit uygula
      const limitedStats = sortedStats.slice(0, Number(limit))

      // Genel istatistikler
      const overallStats = {
        totalEmployees: validStats.length,
        totalOrders: validStats.reduce((sum, stat) => sum + stat.stats.totalOrders, 0),
        totalAmount: validStats.reduce((sum, stat) => sum + stat.stats.totalAmount, 0),
        totalAreaM2: validStats.reduce((sum, stat) => sum + stat.stats.totalAreaM2, 0),
        totalItems: validStats.reduce((sum, stat) => sum + stat.stats.totalItems, 0),
        
        // Sipariş durumu bazlı toplamlar
        totalPreparedOrders: validStats.reduce((sum, stat) => sum + stat.stats.preparedOrders, 0),
        totalDeliveredOrders: validStats.reduce((sum, stat) => sum + stat.stats.deliveredOrders, 0),
        totalCompletedOrders: validStats.reduce((sum, stat) => sum + stat.stats.completedOrders, 0),
        
        // Alan bazlı toplamlar (m²)
        totalPreparedAreaM2: validStats.reduce((sum, stat) => sum + stat.stats.totalPreparedAreaM2, 0),
        totalDeliveredAreaM2: validStats.reduce((sum, stat) => sum + stat.stats.totalDeliveredAreaM2, 0),
        
        // Ortalama performans
        averagePreparationRate: validStats.length > 0 
          ? validStats.reduce((sum, stat) => sum + stat.stats.preparationRate, 0) / validStats.length 
          : 0,
        averageDeliveryRate: validStats.length > 0 
          ? validStats.reduce((sum, stat) => sum + stat.stats.deliveryRate, 0) / validStats.length 
          : 0,
        averageCompletionRate: validStats.length > 0 
          ? validStats.reduce((sum, stat) => sum + stat.stats.completionRate, 0) / validStats.length 
          : 0
      }

      return res.status(200).json({
        success: true,
        data: {
          overallStats,
          employees: limitedStats,
          meta: {
            totalEmployees: validStats.length,
            displayedEmployees: limitedStats.length,
            orderBy: orderBy,
            dateRange: {
              startDate: startDate || null,
              endDate: endDate || null
            }
          }
        }
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Çalışan istatistikleri alınırken bir hata oluştu'
      })
    }
  }

  /**
   * İstatistikleri tarih bazında grupla
   */
  private groupStatsByDate(stats: any[]) {
    const dailyGroups: { [date: string]: any } = {}

    stats.forEach(stat => {
      const date = stat.completedAt.toISOString().split('T')[0] // YYYY-MM-DD formatı
      
      if (!dailyGroups[date]) {
        dailyGroups[date] = {
          date: date,
          totalOrders: 0,
          totalAmount: 0,
          totalAreaM2: 0,
          totalItems: 0
        }
      }

      dailyGroups[date].totalOrders += 1
      dailyGroups[date].totalAmount += Number(stat.totalAmount)
      dailyGroups[date].totalAreaM2 += Number(stat.totalAreaM2)
      dailyGroups[date].totalItems += stat.totalItems
    })

    return Object.values(dailyGroups).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }
}

export const employeeStatsController = new EmployeeStatsController()