import { Request, Response } from 'express';
import { PaymentService } from '../services/payment-service';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async createPaymentRequest(req: Request, res: Response) {
    try {
      const { storeId, amount, aciklama } = req.body;

      // Validasyon
      if (!storeId || !amount || !aciklama) {
        return res.status(400).json({
          success: false,
          message: 'storeId, amount ve aciklama alanları gereklidir'
        });
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'amount pozitif bir sayı olmalıdır'
        });
      }

      console.log('💳 Payment request oluşturuluyor:', { storeId, amount, aciklama });

      // Sadece request objesi oluştur, Octet'e gönderme
      const paymentRequest = await this.paymentService.createPaymentRequest({
        storeId,
        amount,
        aciklama
      });

      return res.status(200).json({
        success: true,
        message: 'Payment request başarıyla oluşturuldu',
        data: paymentRequest
      });

    } catch (error) {
      console.error('❌ Payment request controller hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Payment request oluşturulurken hata oluştu'
      });
    }
  }

  async processPayment(req: Request, res: Response) {
    try {
      const { storeId, amount, aciklama } = req.body;

      // Validasyon
      if (!storeId || !amount || !aciklama) {
        return res.status(400).json({
          success: false,
          message: 'storeId, amount ve aciklama alanları gereklidir'
        });
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'amount pozitif bir sayı olmalıdır'
        });
      }

      console.log('🚀 Payment işlemi başlatılıyor:', { storeId, amount, aciklama });

      // Request oluştur ve Octet'e gönder
      const result = await this.paymentService.processPayment({
        storeId,
        amount,
        aciklama
      });

      return res.status(200).json(result);

    } catch (error) {
      console.error('❌ Payment process controller hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Payment işlemi sırasında hata oluştu'
      });
    }
  }
} 