import { Request, Response } from 'express';
import { PaymentService } from '../services/payment-service';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async createPaymentRequest(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { storeId, amount, aciklama } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        });
      }

      // Validasyon
      if (!storeId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'storeId ve amount alanları gereklidir'
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
        userId,
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
      const userId = (req as any).user?.userId;
      const { storeId, amount, aciklama } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        });
      }

      // Validasyon
      if (!storeId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'storeId ve amount alanları gereklidir'
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
        userId,
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