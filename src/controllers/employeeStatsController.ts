import { Request, Response } from 'express'
import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

export class EmployeeStatsController {
  constructor() {
    this.getEmployeeStats = this.getEmployeeStats.bind(this)
  }

  /**
   * Belirli bir çalışanın sipariş istatistiklerini getir
   */
  async getEmployeeStats(req: Request, res: Response) {
    try {
      const { employeeId } = req.params

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Çalışan ID\'si gerekli'
        })
      }

      // Çalışanın var olup olmadığını ve employee tipinde olduğunu kontrol et
      const employee = await prisma.user.findFirst({
        where: {
          userId: employeeId,
          userType: {
            name: 'employee'
          },
          isActive: true
        },
        select: {
          userId: true,
          name: true,
          surname: true,
          email: true,
          phoneNumber: true
        }
      })

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Çalışan bulunamadı'
        })
      }

      // Çalışanın tamamladığı siparişlerin istatistiklerini getir
      const employeeStats = await prisma.employeeOrderStats.findMany({
        where: {
          employeeId: employeeId
        },
        include: {
          order: {
            select: {
              id: true,
              status: true,
              total_price: true,
              created_at: true,
              items: {
                select: {
                  quantity: true,
                  unit_price: true,
                  total_price: true
                }
              }
            }
          }
        },
        orderBy: {
          completedAt: 'desc'
        }
      })

      // İstatistikleri hesapla
      const totalCompletedOrders = employeeStats.length
      const totalAmount = employeeStats.reduce((sum, stat) => sum + Number(stat.totalAmount), 0)
      const totalAreaCm2 = employeeStats.reduce((sum, stat) => sum + Number(stat.totalAreaM2), 0)
      const totalAreaM2 = totalAreaCm2 / 10000 // cm²'den m²'ye dönüştür
      const totalItems = employeeStats.reduce((sum, stat) => sum + stat.totalItems, 0)

      // Ortalama değerleri hesapla
      const averageAmount = totalCompletedOrders > 0 ? totalAmount / totalCompletedOrders : 0
      const averageAreaM2 = totalCompletedOrders > 0 ? totalAreaM2 / totalCompletedOrders : 0
      const averageItems = totalCompletedOrders > 0 ? totalItems / totalCompletedOrders : 0

      // Sipariş detaylarını hazırla
      const completedOrders = employeeStats.map(stat => ({
        orderId: stat.orderId,
        completedAt: stat.completedAt,
        totalAmount: Number(stat.totalAmount),
        totalAreaM2: Number(stat.totalAreaM2) / 10000, // cm²'den m²'ye dönüştür
        totalItems: stat.totalItems,
        orderStatus: stat.order.status,
        orderCreatedAt: stat.order.created_at,
        orderTotalPrice: Number(stat.order.total_price)
      }))

      // Son 30 günlük performans
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentStats = employeeStats.filter(stat => 
        stat.completedAt >= thirtyDaysAgo
      )

      const recentCompletedOrders = recentStats.length
      const recentTotalAmount = recentStats.reduce((sum, stat) => sum + Number(stat.totalAmount), 0)
      const recentTotalAreaCm2 = recentStats.reduce((sum, stat) => sum + Number(stat.totalAreaM2), 0)
      const recentTotalAreaM2 = recentTotalAreaCm2 / 10000 // cm²'den m²'ye dönüştür
      const recentTotalItems = recentStats.reduce((sum, stat) => sum + stat.totalItems, 0)

      return res.status(200).json({
        success: true,
        data: {
          employee: {
            userId: employee.userId,
            name: employee.name,
            surname: employee.surname,
            email: employee.email,
            phoneNumber: employee.phoneNumber
          },
          overallStats: {
            totalCompletedOrders,
            totalAmount: Number(totalAmount.toFixed(2)),
            totalAreaM2: Number(totalAreaM2.toFixed(2)),
            totalItems,
            averageAmount: Number(averageAmount.toFixed(2)),
            averageAreaM2: Number(averageAreaM2.toFixed(2)),
            averageItems: Number(averageItems.toFixed(1))
          },
          recentStats: {
            period: 'Son 30 gün',
            completedOrders: recentCompletedOrders,
            totalAmount: Number(recentTotalAmount.toFixed(2)),
            totalAreaM2: Number(recentTotalAreaM2.toFixed(2)),
            totalItems: recentTotalItems
          },
          completedOrders: completedOrders
        }
      })

    } catch (error: any) {
      console.error('Çalışan istatistikleri getirme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Çalışan istatistikleri getirilemedi'
      })
    }
  }
} 