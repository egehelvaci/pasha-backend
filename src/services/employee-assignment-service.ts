import prisma from '../utils/prisma'

export class EmployeeAssignmentService {
  /**
   * Tüm employee kullanıcılarını getir
   */
  async getAllEmployees() {
    try {
      const employees = await prisma.user.findMany({
        where: {
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
          phoneNumber: true,
          createdAt: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      return {
        success: true,
        employees: employees
      }
    } catch (error: any) {
      throw new Error(`Employee listesi alınamadı: ${error.message}`)
    }
  }

  /**
   * Siparişi tamamlayan employee'yi ata
   */
  async assignEmployeeToOrder(orderId: string, employeeId: string) {
    try {
      // Siparişi kontrol et
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      if (!order) {
        throw new Error('Sipariş bulunamadı')
      }

      if (order.status !== 'DELIVERED') {
        throw new Error('Sipariş henüz teslim edilmemiş')
      }

      // Employee'yi kontrol et
      const employee = await prisma.user.findFirst({
        where: {
          userId: employeeId,
          userType: {
            name: 'employee'
          },
          isActive: true
        }
      })

      if (!employee) {
        throw new Error('Geçersiz employee')
      }

      // Daha önce atanmış mı kontrol et
      const existingAssignment = await prisma.employeeOrderStats.findUnique({
        where: { orderId: orderId }
      })

      if (existingAssignment) {
        throw new Error('Bu sipariş zaten bir employee\'ye atanmış')
      }

      // Toplam tutar ve m2 hesapla
      let totalAmount = 0
      let totalAreaM2 = 0
      let totalItems = 0

      for (const item of order.items) {
        totalAmount += Number(item.total_price)
        totalItems += item.quantity
        
        // M2 hesapla (width * height * quantity)
        if (item.width && item.height) {
          const itemArea = Number(item.width) * Number(item.height) * item.quantity
          totalAreaM2 += itemArea
        }
      }

      // Employee istatistiğini kaydet
      const employeeStats = await prisma.employeeOrderStats.create({
        data: {
          employeeId: employeeId,
          orderId: orderId,
          totalAmount: totalAmount,
          totalAreaM2: totalAreaM2,
          totalItems: totalItems,
          completedAt: new Date()
        },
        include: {
          employee: {
            select: {
              name: true,
              surname: true,
              email: true
            }
          },
          order: {
            select: {
              id: true,
              total_price: true,
              status: true
            }
          }
        }
      })

      return {
        success: true,
        message: 'Employee başarıyla atandı',
        assignment: employeeStats
      }
    } catch (error: any) {
      throw new Error(`Employee atama hatası: ${error.message}`)
    }
  }

  /**
   * Employee istatistiklerini getir
   */
  async getEmployeeStats(employeeId?: string) {
    try {
      const where = employeeId ? { employeeId: employeeId } : {}

      const stats = await prisma.employeeOrderStats.findMany({
        where: where,
        include: {
          employee: {
            select: {
              name: true,
              surname: true,
              email: true
            }
          },
          order: {
            select: {
              id: true,
              total_price: true,
              status: true,
              created_at: true
            }
          }
        },
        orderBy: {
          completedAt: 'desc'
        }
      })

      // Toplam istatistikler
      const totalStats = stats.reduce((acc, stat) => {
        acc.totalOrders += 1
        acc.totalAmount += Number(stat.totalAmount)
        acc.totalAreaM2 += Number(stat.totalAreaM2)
        acc.totalItems += stat.totalItems
        return acc
      }, {
        totalOrders: 0,
        totalAmount: 0,
        totalAreaM2: 0,
        totalItems: 0
      })

      return {
        success: true,
        stats: stats,
        totalStats: totalStats
      }
    } catch (error: any) {
      throw new Error(`Employee istatistikleri alınamadı: ${error.message}`)
    }
  }

  /**
   * Sipariş için atanmış employee'yi getir
   */
  async getAssignedEmployeeForOrder(orderId: string) {
    try {
      const assignment = await prisma.employeeOrderStats.findUnique({
        where: { orderId: orderId },
        include: {
          employee: {
            select: {
              userId: true,
              name: true,
              surname: true,
              email: true,
              phoneNumber: true
            }
          }
        }
      })

      return {
        success: true,
        assignment: assignment
      }
    } catch (error: any) {
      throw new Error(`Sipariş employee bilgisi alınamadı: ${error.message}`)
    }
  }
} 