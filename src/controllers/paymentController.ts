import { Request, Response } from 'express';
import { PaymentService } from '../services/payment-service';
import prisma from '../utils/prisma';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Yeni checkout endpoint'i - Kanal desteği ile
   */
  async checkout(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const userType = (req as any).user?.userType;
      const { storeId, amount, aciklama, channel, orderId } = req.body;
      const idempotencyKey = req.headers['idempotency-key'] as string;

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
          message: 'storeId ve amount gerekli'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz tutar'
        });
      }

      // Channel validasyonu
      if (channel && !['web', 'mobile'].includes(channel)) {
        return res.status(400).json({
          success: false,
          message: 'Channel sadece "web" veya "mobile" olabilir'
        });
      }

      // Admin/Editor için storeId kullanımı kontrolü
      let targetStoreId = storeId;
      let targetUserId = userId;

      if (userType === 'admin' || userType === 'editor') {
        // Admin/Editor kullanıcı, belirtilen mağaza için ödeme başlatabilir
        targetStoreId = storeId;
        targetUserId = userId;
      } else {
        // Normal kullanıcı sadece kendi mağazası için ödeme başlatabilir
        const user = await prisma.user.findUnique({
          where: { userId },
          include: { Store: true }
        });

        if (!user || !user.Store) {
          return res.status(404).json({
            success: false,
            message: 'Kullanıcı veya mağaza bulunamadı'
          });
        }

        if (user.Store.store_id !== storeId) {
          return res.status(403).json({
            success: false,
            message: 'Bu mağaza için ödeme başlatma yetkiniz yok'
          });
        }
        targetStoreId = user.Store.store_id;
        targetUserId = userId;
      }

      console.log('💳 Checkout başlatılıyor:', { 
        userId: targetUserId, 
        storeId: targetStoreId, 
        amount, 
        aciklama,
        channel: channel || 'web',
        orderId,
        idempotencyKey,
        isAdmin: userType === 'admin' || userType === 'editor'
      });

      // Checkout işlemi
      const result = await this.paymentService.checkout({
        userId: targetUserId,
        storeId: targetStoreId,
        amount,
        aciklama,
        channel,
        orderId,
        idempotencyKey
      });

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Checkout başarıyla başlatıldı',
          data: {
            checkoutUrl: result.checkoutUrl,
            paymentSessionId: result.paymentSessionId
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message || 'Checkout başlatılamadı'
        });
      }

    } catch (error) {
      console.error('❌ Checkout controller hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Checkout başlatılırken hata oluştu'
      });
    }
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

      // Admin/Editor kontrolü - admin/editor ise herhangi bir mağaza için ödeme alabilir
      let targetStoreId = storeId;
      let targetUserId = userId;

      if (userType === 'admin' || userType === 'editor') {
        console.log(`👑 ${userType.toUpperCase()} kullanıcı ödeme request oluşturuyor:`, { 
          adminUserId: userId, 
          targetStoreId: storeId, 
          amount, 
          aciklama 
        });
        // Admin/Editor için storeId direkt kullanılabilir
        targetStoreId = storeId;
        targetUserId = userId; // Admin/Editor kendi adına ödeme alıyor
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
        isAdmin: userType === 'admin' || userType === 'editor'
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
      const { storeId, amount, aciklama, currencyCode } = req.body;

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

      // Currency validasyonu
      if (currencyCode && !['TRY', 'USD'].includes(currencyCode)) {
        return res.status(400).json({
          success: false,
          message: 'currencyCode sadece TRY veya USD olabilir'
        });
      }

      // Admin/Editor kontrolü - admin/editor ise herhangi bir mağaza için ödeme alabilir
      let targetStoreId = storeId;
      let targetUserId = userId;

      if (userType === 'admin' || userType === 'editor') {
        console.log(`👑 ${userType.toUpperCase()} kullanıcı ödeme işlemi başlatıyor:`, { 
          adminUserId: userId, 
          targetStoreId: storeId, 
          amount, 
          aciklama 
        });
        // Admin/Editor için storeId direkt kullanılabilir
        targetStoreId = storeId;
        targetUserId = userId; // Admin/Editor kendi adına ödeme alıyor
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
        currencyCode: currencyCode || 'TRY',
        isAdmin: userType === 'admin' || userType === 'editor'
      });

      // Request oluştur ve Octet'e gönder
      const result = await this.paymentService.processPayment({
        userId: targetUserId,
        storeId: targetStoreId,
        amount,
        aciklama,
        currencyCode
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