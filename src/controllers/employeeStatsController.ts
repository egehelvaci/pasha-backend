import { Request, Response } from 'express'
import prisma from '../utils/prisma'

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

      // Artık teslimat istatistikleri tutulmayacak - sadece boş array döndür
      const employeeStats: any[] = []

      // QRCode tablosundan çalışanın hazırladığı siparişleri getir
      const preparedOrdersFromQR = await prisma.qRCode.findMany({
        where: {
          first_scan_employee_id: employeeId
        },
        include: {
          order: {
            include: {
              items: true
            }
          }
        },
        distinct: ['order_id']
      })

      // Teslimat istatistikleri artık tutulmayacak
      const totalCompletedOrders = 0
      const totalAmount = 0
      const totalAreaM2 = 0
      const totalItems = 0

      // Hazırlama istatistiklerini hesapla (QRCode tablosundan)
      const preparedOrderCount = preparedOrdersFromQR.length
      const preparedAreaM2Total = preparedOrdersFromQR.reduce((sum, qr) => {
        return sum + qr.order.items.reduce((orderSum, item) => {
          return orderSum + (Number(item.width) * Number(item.height) * item.quantity / 10000)
        }, 0)
      }, 0)
      const preparedAmountTotal = preparedOrdersFromQR.reduce((sum, qr) => {
        return sum + Number(qr.order.total_price)
      }, 0)
      const preparedItemsTotal = preparedOrdersFromQR.reduce((sum, qr) => {
        return sum + qr.order.items.reduce((orderSum, item) => orderSum + item.quantity, 0)
      }, 0)

      // Ortalama değerleri hesapla
      const averageAmount = totalCompletedOrders > 0 ? totalAmount / totalCompletedOrders : 0
      const averageAreaM2 = totalCompletedOrders > 0 ? totalAreaM2 / totalCompletedOrders : 0
      const averageItems = totalCompletedOrders > 0 ? totalItems / totalCompletedOrders : 0

      // Teslimat istatistikleri artık tutulmayacak
      const completedOrders: any[] = []

      // Hazırlanan siparişlerin detaylarını hazırla
      const preparedOrders = preparedOrdersFromQR.map(qr => ({
        orderId: qr.order_id,
        preparedAt: qr.first_scan_at,
        totalAmount: Number(qr.order.total_price),
        totalAreaM2: qr.order.items.reduce((sum, item) => {
          return sum + (Number(item.width) * Number(item.height) * item.quantity / 10000)
        }, 0),
        totalItems: qr.order.items.reduce((sum, item) => sum + item.quantity, 0),
        orderStatus: qr.order.status,
        orderCreatedAt: qr.order.created_at,
        qrCodeId: qr.id
      }))

      // Son 30 günlük performans - teslimat istatistikleri artık tutulmayacak
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentCompletedOrders = 0
      const recentTotalAmount = 0
      const recentTotalAreaM2 = 0
      const recentTotalItems = 0

      // Son 30 günlük hazırlama performansı
      const recentPreparedOrders = preparedOrdersFromQR.filter(qr => 
        qr.first_scan_at && qr.first_scan_at >= thirtyDaysAgo
      )
      const recentPreparedOrderCount = recentPreparedOrders.length
      const recentPreparedAmount = recentPreparedOrders.reduce((sum, qr) => sum + Number(qr.order.total_price), 0)
      const recentPreparedAreaM2 = recentPreparedOrders.reduce((sum, qr) => {
        return sum + qr.order.items.reduce((orderSum, item) => {
          return orderSum + (Number(item.width) * Number(item.height) * item.quantity / 10000)
        }, 0)
      }, 0)
      const recentPreparedItems = recentPreparedOrders.reduce((sum, qr) => {
        return sum + qr.order.items.reduce((orderSum, item) => orderSum + item.quantity, 0)
      }, 0)

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
            // Teslimat istatistikleri artık tutulmayacak - sadece hazırlama istatistikleri
            preparedOrders: preparedOrderCount,
            preparedAmount: Number(preparedAmountTotal.toFixed(2)),
            preparedAreaM2: Number(preparedAreaM2Total.toFixed(2)),
            preparedItems: preparedItemsTotal,
            averagePreparedAmount: preparedOrderCount > 0 ? Number((preparedAmountTotal / preparedOrderCount).toFixed(2)) : 0,
            averagePreparedAreaM2: preparedOrderCount > 0 ? Number((preparedAreaM2Total / preparedOrderCount).toFixed(2)) : 0,
            averagePreparedItems: preparedOrderCount > 0 ? Number((preparedItemsTotal / preparedOrderCount).toFixed(1)) : 0
          },
          recentStats: {
            period: 'Son 30 gün',
            // Sadece hazırlama istatistikleri
            preparedOrders: recentPreparedOrderCount,
            preparedAmount: Number(recentPreparedAmount.toFixed(2)),
            preparedAreaM2: Number(recentPreparedAreaM2.toFixed(2)),
            preparedItems: recentPreparedItems
          },
          preparedOrders: preparedOrders
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