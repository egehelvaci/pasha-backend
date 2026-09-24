import { Request, Response } from 'express';
import { PaymentService } from '../services/payment-service';
import prisma from '../utils/prisma';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
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
        // NOT: JWT'deki store_id login anında donduğu için güncel değer DB'den okunur
        // (checkout endpoint'i ile aynı davranış; eski token'larda 403'e yol açıyordu)
        const user = await prisma.user.findUnique({
          where: { userId },
          select: { store_id: true }
        });

        if (!user || !user.store_id) {
          return res.status(404).json({
            success: false,
            message: 'Kullanıcı veya mağaza bulunamadı'
          });
        }

        if (user.store_id !== storeId) {
          return res.status(403).json({
            success: false,
            message: 'Sadece kendi mağazanız için ödeme alabilirsiniz'
          });
        }
        targetStoreId = user.store_id;
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