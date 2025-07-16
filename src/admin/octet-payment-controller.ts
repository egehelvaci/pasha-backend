import { Request, Response } from 'express'
import { octetPaymentService } from '../services/octet-payment-service'
import prisma from '../utils/prisma'

export class OctetPaymentController {
  constructor() {
    this.initiatePayment = this.initiatePayment.bind(this)
    this.handlePaymentCallback = this.handlePaymentCallback.bind(this)
    this.setInstallmentLimits = this.setInstallmentLimits.bind(this)
    this.getInstallmentOptions = this.getInstallmentOptions.bind(this)
  }

  /**
   * POST /api/admin/payments/initiate
   * Admin, mağaza adına ödeme başlatır
   */
  async initiatePayment(req: Request, res: Response) {
    try {
      const { storeId, amount, currency = 'TRY', maxInstallments, expireDateTime } = req.body
      const adminId = (req as any).user?.userId

      // Input validasyonu
      if (!storeId || !amount || !expireDateTime) {
        return res.status(400).json({
          success: false,
          message: 'storeId, amount ve expireDateTime zorunludur'
        })
      }

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Admin kimlik doğrulaması gerekli'
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

      // Ödeme başlat
      const result = await octetPaymentService.initiatePayment({
        storeId,
        amount,
        currency,
        maxInstallments: maxInstallments || [1],
        expireDateTime,
        adminId
      })

      return res.status(200).json({
        success: true,
        data: {
          paymentLink: result.paymentLink
        }
      })

    } catch (error: any) {
      console.error('Ödeme başlatma hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Ödeme başlatılamadı'
      })
    }
  }

  /**
   * POST /api/payments/callback
   * Octet'ten gelen ödeme callback'ini işler
   */
  async handlePaymentCallback(req: Request, res: Response) {
    try {
      console.log('Octet callback alındı:', req.body)
      
      await octetPaymentService.handlePaymentCallback(req.body)
      
      return res.status(200).json({
        success: true,
        message: 'Ödeme başarıyla işlendi'
      })

    } catch (error: any) {
      console.error('Callback işleme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Callback işlenemedi'
      })
    }
  }

  /**
   * POST /api/admin/installments/set
   * Admin mağaza başı taksit limiti belirler
   */
  async setInstallmentLimits(req: Request, res: Response) {
    try {
      const { storeId, consumerLimits, commercialLimits } = req.body

      // Input validasyonu
      if (!storeId || !Array.isArray(consumerLimits) || !Array.isArray(commercialLimits)) {
        return res.status(400).json({
          success: false,
          message: 'storeId, consumerLimits ve commercialLimits zorunludur'
        })
      }

      // Taksit sayılarının geçerliliğini kontrol et
      const validateInstallments = (limits: number[]) => {
        return limits.every(limit => Number.isInteger(limit) && limit > 0 && limit <= 12)
      }

      if (!validateInstallments(consumerLimits) || !validateInstallments(commercialLimits)) {
        return res.status(400).json({
          success: false,
          message: 'Taksit sayıları 1-12 arasında pozitif tam sayı olmalıdır'
        })
      }

      // Mağazanın var olduğunu kontrol et
      const store = await prisma.store.findUnique({
        where: { store_id: storeId }
      })

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Mağaza bulunamadı'
        })
      }

      await octetPaymentService.setInstallmentLimits(storeId, consumerLimits, commercialLimits)

      return res.status(200).json({
        success: true,
        message: 'Taksit limitleri başarıyla ayarlandı'
      })

    } catch (error: any) {
      console.error('Taksit limiti ayarlama hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Taksit limitleri ayarlanamadı'
      })
    }
  }

  /**
   * GET /api/admin/installments/options/:storeId
   * Mağazaya tanımlı taksit seçeneklerini döner
   */
  async getInstallmentOptions(req: Request, res: Response) {
    try {
      const { storeId } = req.params

      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID gerekli'
        })
      }

      const limits = await octetPaymentService.getInstallmentLimits(storeId)

      return res.status(200).json({
        success: true,
        data: limits
      })

    } catch (error: any) {
      console.error('Taksit seçenekleri getirme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Taksit seçenekleri alınamadı'
      })
    }
  }


}

export const octetPaymentController = new OctetPaymentController() 