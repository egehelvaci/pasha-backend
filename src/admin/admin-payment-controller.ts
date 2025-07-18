import { Request, Response } from 'express'
import prisma from '../utils/prisma'

export class AdminPaymentController {
  constructor() {
    this.getAllPayments = this.getAllPayments.bind(this)
    this.getStorePayments = this.getStorePayments.bind(this)
  }

  /**
   * Tüm ödemeleri listele (Admin için)
   * Sadece COMPLETED ve FAILED durumlarındaki ödemeleri gösterir
   */
  async getAllPayments(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status,
        storeId,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      
      // Filtreleme koşulları - sadece COMPLETED ve FAILED ödemeleri
      const where: any = {
        status: {
          in: status ? [status] : ['COMPLETED', 'FAILED']
        }
      }

      // Belirli bir mağaza filtresi
      if (storeId) {
        where.storeId = storeId
      }

      // Geçerli status kontrolü
      if (status && !['COMPLETED', 'FAILED'].includes(status as string)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz status. Sadece COMPLETED veya FAILED değerleri kabul edilir.'
        })
      }

      // Sıralama
      const orderBy: any = {}
      orderBy[sortBy as string] = sortOrder

      const [payments, totalCount] = await Promise.all([
        prisma.paymentTransaction.findMany({
          where,
          include: {
            store: {
              select: {
                store_id: true,
                kurum_adi: true,
                vergi_numarasi: true,
                telefon: true,
                eposta: true
              }
            }
          },
          orderBy,
          skip,
          take: Number(limit)
        }),
        prisma.paymentTransaction.count({ where })
      ])

      const totalPages = Math.ceil(totalCount / Number(limit))

      // Response data formatı
      const formattedPayments = payments.map((payment: any) => ({
        id: payment.id,
        sellerReference: payment.sellerReference,
        apiReferenceNumber: payment.apiReferenceNumber,
        amount: Number(payment.amount),
        description: payment.description,
        status: payment.status,
        paymentDate: payment.paymentDate,
        octetPaymentId: payment.octetPaymentId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        store: {
          store_id: payment.store.store_id,
          kurum_adi: payment.store.kurum_adi,
          vergi_numarasi: payment.store.vergi_numarasi,
          telefon: payment.store.telefon,
          eposta: payment.store.eposta
        }
      }))

      // Özet istatistikler
      const [completedCount, failedCount, totalAmount] = await Promise.all([
        prisma.paymentTransaction.count({
          where: { ...where, status: 'COMPLETED' }
        }),
        prisma.paymentTransaction.count({
          where: { ...where, status: 'FAILED' }
        }),
        prisma.paymentTransaction.aggregate({
          where: { ...where, status: 'COMPLETED' },
          _sum: { amount: true }
        })
      ])

      return res.status(200).json({
        success: true,
        data: {
          payments: formattedPayments,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalCount,
            totalPages,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1
          },
          summary: {
            completedCount,
            failedCount,
            totalAmount: Number(totalAmount._sum.amount || 0),
            successRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
          }
        }
      })
    } catch (error: any) {
      console.error('Admin payment listesi hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Ödemeler listelenirken bir hata oluştu'
      })
    }
  }

  /**
   * Mağaza ödemelerini listele (Mağaza sahipleri için)
   * Sadece kendi mağazalarının COMPLETED ve FAILED ödemelerini görebilir
   */
  async getStorePayments(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query

      // Kullanıcının mağaza bilgisini al
      const userId = (req as any).user?.userId
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı bilgisi bulunamadı'
        })
      }

      // Kullanıcının mağaza ID'sini bul
      const user = await prisma.user.findUnique({
        where: { userId },
        include: {
          Store: {
            select: {
              store_id: true,
              kurum_adi: true
            }
          }
        }
      })

      if (!user?.Store) {
        return res.status(403).json({
          success: false,
          message: 'Bu işlem için mağaza yetkisi gereklidir'
        })
      }

      const storeId = user.Store.store_id
      const skip = (Number(page) - 1) * Number(limit)
      
      // Filtreleme koşulları - sadece COMPLETED ve FAILED ödemeleri ve kendi mağazası
      const where: any = {
        storeId,
        status: {
          in: status ? [status] : ['COMPLETED', 'FAILED']
        }
      }

      // Geçerli status kontrolü
      if (status && !['COMPLETED', 'FAILED'].includes(status as string)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz status. Sadece COMPLETED veya FAILED değerleri kabul edilir.'
        })
      }

      // Sıralama
      const orderBy: any = {}
      orderBy[sortBy as string] = sortOrder

      const [payments, totalCount] = await Promise.all([
        prisma.paymentTransaction.findMany({
          where,
          include: {
            store: {
              select: {
                store_id: true,
                kurum_adi: true
              }
            }
          },
          orderBy,
          skip,
          take: Number(limit)
        }),
        prisma.paymentTransaction.count({ where })
      ])

      const totalPages = Math.ceil(totalCount / Number(limit))

      // Response data formatı
      const formattedPayments = payments.map((payment: any) => ({
        id: payment.id,
        sellerReference: payment.sellerReference,
        apiReferenceNumber: payment.apiReferenceNumber,
        amount: Number(payment.amount),
        description: payment.description,
        status: payment.status,
        paymentDate: payment.paymentDate,
        octetPaymentId: payment.octetPaymentId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        store: {
          store_id: payment.store.store_id,
          kurum_adi: payment.store.kurum_adi
        }
      }))

      // Özet istatistikler
      const [completedCount, failedCount, totalAmount] = await Promise.all([
        prisma.paymentTransaction.count({
          where: { ...where, status: 'COMPLETED' }
        }),
        prisma.paymentTransaction.count({
          where: { ...where, status: 'FAILED' }
        }),
        prisma.paymentTransaction.aggregate({
          where: { ...where, status: 'COMPLETED' },
          _sum: { amount: true }
        })
      ])

      return res.status(200).json({
        success: true,
        data: {
          payments: formattedPayments,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalCount,
            totalPages,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1
          },
          summary: {
            completedCount,
            failedCount,
            totalAmount: Number(totalAmount._sum.amount || 0),
            successRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
          },
          store: {
            store_id: user.Store.store_id,
            kurum_adi: user.Store.kurum_adi
          }
        }
      })
    } catch (error: any) {
      console.error('Mağaza payment listesi hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Ödemeler listelenirken bir hata oluştu'
      })
    }
  }
} 