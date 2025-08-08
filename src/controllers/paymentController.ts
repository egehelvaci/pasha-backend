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
      const userType = (req as any).user?.userType;
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

      // Admin kontrolü - admin ise herhangi bir mağaza için ödeme alabilir
      let targetStoreId = storeId;
      let targetUserId = userId;

      if (userType === 'admin') {
        console.log('👑 Admin kullanıcı ödeme request oluşturuyor:', { 
          adminUserId: userId, 
          targetStoreId: storeId, 
          amount, 
          aciklama 
        });
        // Admin için storeId direkt kullanılabilir
        targetStoreId = storeId;
        targetUserId = userId; // Admin kendi adına ödeme alıyor
      } else {
        // Normal kullanıcı - sadece kendi mağazası için ödeme alabilir
        const userStoreId = (req as any).user?.store_id;
        if (userStoreId !== storeId) {
          return res.status(403).json({
            success: false,
            message: 'Sadece kendi mağazanız için ödeme alabilirsiniz'
          });
        }
        targetStoreId = userStoreId;
        targetUserId = userId;
      }

      console.log('💳 Payment request oluşturuluyor:', { 
        userId: targetUserId, 
        storeId: targetStoreId, 
        amount, 
        aciklama,
        isAdmin: userType === 'admin'
      });

      // Sadece request objesi oluştur, Octet'e gönderme
      const paymentRequest = await this.paymentService.createPaymentRequest({
        userId: targetUserId,
        storeId: targetStoreId,
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
      const userType = (req as any).user?.userType;
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

      // Admin kontrolü - admin ise herhangi bir mağaza için ödeme alabilir
      let targetStoreId = storeId;
      let targetUserId = userId;

      if (userType === 'admin') {
        console.log('👑 Admin kullanıcı ödeme işlemi başlatıyor:', { 
          adminUserId: userId, 
          targetStoreId: storeId, 
          amount, 
          aciklama 
        });
        // Admin için storeId direkt kullanılabilir
        targetStoreId = storeId;
        targetUserId = userId; // Admin kendi adına ödeme alıyor
      } else {
        // Normal kullanıcı - sadece kendi mağazası için ödeme alabilir
        const userStoreId = (req as any).user?.store_id;
        if (userStoreId !== storeId) {
          return res.status(403).json({
            success: false,
            message: 'Sadece kendi mağazanız için ödeme alabilirsiniz'
          });
        }
        targetStoreId = userStoreId;
        targetUserId = userId;
      }

      console.log('🚀 Payment işlemi başlatılıyor:', { 
        userId: targetUserId, 
        storeId: targetStoreId, 
        amount, 
        aciklama,
        isAdmin: userType === 'admin'
      });

      // Request oluştur ve Octet'e gönder
      const result = await this.paymentService.processPayment({
        userId: targetUserId,
        storeId: targetStoreId,
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