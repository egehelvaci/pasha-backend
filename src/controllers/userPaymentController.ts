import { Request, Response } from 'express'
import { octetPaymentService } from '../services/octet-payment-service'
import prisma from '../utils/prisma'

export class UserPaymentController {
  constructor() {
    this.initiatePayment = this.initiatePayment.bind(this)
    this.getMyPaymentHistory = this.getMyPaymentHistory.bind(this)
    this.getMyPaymentById = this.getMyPaymentById.bind(this)
    this.getMyInstallmentOptions = this.getMyInstallmentOptions.bind(this)
  }

  /**
   * POST /api/user/payments/initiate
   * Normal kullanıcı kendi mağazası için ödeme başlatır
   */
  async initiatePayment(req: Request, res: Response) {
    try {
      const { amount, currency = 'TRY', maxInstallments, expireDateTime } = req.body
      const userId = (req as any).user?.userId

      // Input validasyonu
      if (!amount || !expireDateTime) {
        return res.status(400).json({
          success: false,
          message: 'amount ve expireDateTime zorunludur'
        })
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      // Tutar validasyonu
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir tutar giriniz'
        })
      }

      // Tarih validasyonu
      const expireDate = new Date(expireDateTime)
      if (isNaN(expireDate.getTime()) || expireDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir bitiş tarihi giriniz (gelecek bir tarih olmalı)'
        })
      }

      // Kullanıcının mağaza bilgilerini kontrol et
      const user = await prisma.user.findUnique({
        where: { userId },
        include: { Store: true }
      })

      if (!user?.Store) {
        return res.status(400).json({
          success: false,
          message: 'Mağaza bilginiz bulunamadı. Lütfen admin ile iletişime geçin.'
        })
      }

      // Ödeme başlat
      const result = await octetPaymentService.initiatePayment({
        amount,
        currency,
        maxInstallments: maxInstallments || [1],
        expireDateTime,
        userId
      })

      return res.status(200).json({
        success: true,
        data: {
          paymentLink: result.paymentLink,
          storeInfo: {
            name: user.Store.kurum_adi,
            currentBalance: user.Store.bakiye
          }
        }
      })

    } catch (error: any) {
      console.error('Kullanıcı ödeme başlatma hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Ödeme başlatılamadı'
      })
    }
  }

  /**
   * GET /api/user/payments/history
   * Kullanıcının kendi ödeme geçmişini listeler
   */
  async getMyPaymentHistory(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status,
        startDate,
        endDate 
      } = req.query
      const userId = (req as any).user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      const skip = (Number(page) - 1) * Number(limit)
      
      // Filtreleme koşulları - sadece kendi ödemelerini göster
      const where: any = {
        admin_id: userId // user ödemeinde admin_id alanında userId saklanıyor
      }
      
      if (status) where.status = status
      
      if (startDate || endDate) {
        where.created_at = {}
        if (startDate) where.created_at.gte = new Date(startDate as string)
        if (endDate) where.created_at.lte = new Date(endDate as string)
      }

      const [payments, totalCount] = await Promise.all([
        prisma.octetPayment.findMany({
          where,
          include: {
            store: {
              select: {
                kurum_adi: true,
                bakiye: true
              }
            }
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.octetPayment.count({ where })
      ])

      const totalPages = Math.ceil(totalCount / Number(limit))

      return res.status(200).json({
        success: true,
        data: {
          payments,
          pagination: {
            currentPage: Number(page),
            totalPages,
            totalCount,
            hasNextPage: Number(page) < totalPages,
            hasPrevPage: Number(page) > 1
          }
        }
      })

    } catch (error: any) {
      console.error('Kullanıcı ödeme geçmişi getirme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Ödeme geçmişi alınamadı'
      })
    }
  }

  /**
   * GET /api/user/payments/:paymentId
   * Kullanıcının belirli bir ödeme detayını getirir
   */
  async getMyPaymentById(req: Request, res: Response) {
    try {
      const { paymentId } = req.params
      const userId = (req as any).user?.userId

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment ID gerekli'
        })
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      const payment = await prisma.octetPayment.findFirst({
        where: { 
          id: paymentId,
          admin_id: userId // Sadece kendi ödemesini görebilir
        },
        include: {
          store: true
        }
      })

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Ödeme bulunamadı veya bu ödemeyi görme yetkiniz yok'
        })
      }

      return res.status(200).json({
        success: true,
        data: payment
      })

    } catch (error: any) {
      console.error('Kullanıcı ödeme detayı getirme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Ödeme detayı alınamadı'
      })
    }
  }

  /**
   * GET /api/user/installments/options
   * Kullanıcının mağazasına tanımlı taksit seçeneklerini döner
   */
  async getMyInstallmentOptions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      // Kullanıcının mağaza bilgilerini al
      const user = await prisma.user.findUnique({
        where: { userId },
        include: { Store: true }
      })

      if (!user?.Store) {
        return res.status(400).json({
          success: false,
          message: 'Mağaza bilginiz bulunamadı'
        })
      }

      const limits = await octetPaymentService.getInstallmentLimits(user.Store.store_id)

      return res.status(200).json({
        success: true,
        data: {
          ...limits,
          storeInfo: {
            name: user.Store.kurum_adi,
            currentBalance: user.Store.bakiye
          }
        }
      })

    } catch (error: any) {
      console.error('Kullanıcı taksit seçenekleri getirme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Taksit seçenekleri alınamadı'
      })
    }
  }
}

export const userPaymentController = new UserPaymentController() 