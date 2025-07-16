import { Request, Response } from 'express';
import { PaymentService, BalanceTopUpRequest, AdminBalanceTopUpRequest, PaymentCallbackData } from '../services/payment-service';

const paymentService = new PaymentService();

/**
 * Mağaza listesi getirme (admin için)
 * GET /api/v1/payment/stores
 */
export const getStores = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userType = (req as any).user?.userType;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    // Sadece admin erişebilir
    if (userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için admin yetkisi gerekli'
      });
    }

    console.log('📋 Mağaza listesi istendi');

    const stores = await paymentService.getActiveStores();

    return res.status(200).json({
      success: true,
      data: stores,
      message: `${stores.length} aktif mağaza bulundu`
    });

  } catch (error) {
    console.error('❌ Mağaza listesi getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : 'İç sunucu hatası'
    });
  }
};

/**
 * Belirli bir mağaza bilgisi getirme (admin için)
 * GET /api/v1/payment/stores/:storeId
 */
export const getStoreById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userType = (req as any).user?.userType;
    const { storeId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    // Sadece admin erişebilir
    if (userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için admin yetkisi gerekli'
      });
    }

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'storeId parametresi gerekli'
      });
    }

    console.log('🏪 Mağaza bilgisi istendi:', storeId);

    const store = await paymentService.getStoreInfo(storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Mağaza bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      data: store
    });

  } catch (error) {
    console.error('❌ Mağaza bilgisi getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : 'İç sunucu hatası'
    });
  }
};

/**
 * Admin bakiye yükleme başlatma endpoint'i
 * POST /api/v1/payment/admin/initiate
 */
export const initiateAdminBalanceTopUp = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userType = (req as any).user?.userType;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    // Sadece admin erişebilir
    if (userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için admin yetkisi gerekli'
      });
    }

    // Request body'den verileri al
    const { storeId, amount, description } = req.body as AdminBalanceTopUpRequest;

    // Gerekli alanları kontrol et
    if (!storeId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'storeId ve amount alanları gerekli'
      });
    }

    // Amount validasyonu
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir tutar giriniz (pozitif sayı)'
      });
    }

    // Minimum tutar kontrolü
    if (amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum yükleme tutarı 10 TL\'dir'
      });
    }

    // Maksimum tutar kontrolü
    if (amount > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Maksimum yükleme tutarı 100.000 TL\'dir'
      });
    }

    console.log('💳 Admin bakiye yükleme isteği:', { storeId, amount, userId });

    // Mağaza var mı kontrol et
    const store = await paymentService.getStoreInfo(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Mağaza bulunamadı'
      });
    }

    // Bakiye yükleme başlatma işlemini gerçekleştir
    const result = await paymentService.initiateBalanceTopUp({
      storeId,
      amount,
      description: description || `${store.kurum_adi} - Admin tarafından bakiye yükleme (${amount} TL)`
    });

    if (result.success && result.paymentUrl) {
      return res.status(200).json({
        success: true,
        paymentUrl: result.paymentUrl,
        paymentReference: result.paymentReference,
        storeInfo: {
          store_id: store.store_id,
          kurum_adi: store.kurum_adi,
          currentBalance: store.bakiye
        },
        message: 'Ödeme sayfası başarıyla oluşturuldu'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Ödeme başlatılamadı',
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Admin bakiye yükleme controller hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : 'İç sunucu hatası'
    });
  }
};

/**
 * Mağaza sahibi bakiye yükleme endpoint'i
 * POST /api/v1/payment/store/initiate
 */
export const initiateStoreBalanceTopUp = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userType = (req as any).user?.userType;
    const userStoreId = (req as any).user?.store_id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    // Mağaza kullanıcısı olmalı
    if (userType !== 'store_user' || !userStoreId) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için mağaza kullanıcısı olmanız gerekli'
      });
    }

    // Request body'den verileri al
    const { amount, description } = req.body;

    // Amount validasyonu
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir tutar giriniz (pozitif sayı)'
      });
    }

    // Minimum tutar kontrolü
    if (amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum yükleme tutarı 10 TL\'dir'
      });
    }

    // Maksimum tutar kontrolü
    if (amount > 50000) {
      return res.status(400).json({
        success: false,
        message: 'Mağaza kullanıcıları için maksimum yükleme tutarı 50.000 TL\'dir'
      });
    }

    console.log('💳 Mağaza bakiye yükleme isteği:', { storeId: userStoreId, amount, userId });

    // Mağaza bilgilerini al
    const store = await paymentService.getStoreInfo(userStoreId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Mağaza bulunamadı'
      });
    }

    // Bakiye yükleme başlatma işlemini gerçekleştir
    const result = await paymentService.initiateBalanceTopUp({
      storeId: userStoreId,
      amount,
      description: description || `${store.kurum_adi} - Bakiye yükleme (${amount} TL)`
    });

    if (result.success && result.paymentUrl) {
      return res.status(200).json({
        success: true,
        paymentUrl: result.paymentUrl,
        paymentReference: result.paymentReference,
        storeInfo: {
          store_id: store.store_id,
          kurum_adi: store.kurum_adi,
          currentBalance: store.bakiye
        },
        message: 'Ödeme sayfası başarıyla oluşturuldu'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || 'Ödeme başlatılamadı',
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Mağaza bakiye yükleme controller hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : 'İç sunucu hatası'
    });
  }
};

/**
 * Ödeme callback endpoint'i
 * POST /api/v1/payment/callback
 */
export const paymentCallback = async (req: Request, res: Response) => {
  try {
    console.log('📞 Ödeme callback alındı:', req.body);

    // Callback verilerini al
    const callbackData: PaymentCallbackData = req.body;

    if (!callbackData.apiReferenceID) {
      console.error('❌ Callback\'te apiReferenceID bulunamadı');
      
      // Hata durumunda da frontend'e yönlendir
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/admin/bakiye-yukleme/sonuc?error=invalid_callback`);
    }

    // Callback'i işle
    const result = await paymentService.handlePaymentCallback(callbackData);

    // Kullanıcıyı frontend'e yönlendir
    return res.redirect(result.redirectUrl);

  } catch (error) {
    console.error('❌ Callback controller hatası:', error);
    
    // Hata durumunda frontend'e yönlendir
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/admin/bakiye-yukleme/sonuc?error=callback_error`);
  }
};

/**
 * Ödeme durumu sorgulama endpoint'i
 * GET /api/v1/payment/status/:paymentReference
 */
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { paymentReference } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    if (!paymentReference) {
      return res.status(400).json({
        success: false,
        message: 'paymentReference parametresi gerekli'
      });
    }

    console.log('🔍 Ödeme durumu sorgulanıyor:', { paymentReference, userId });

    // Ödeme durumunu sorgula
    const paymentStatus = await paymentService.getPaymentStatus(paymentReference);

    return res.status(200).json({
      success: true,
      data: paymentStatus
    });

  } catch (error) {
    console.error('❌ Ödeme durumu sorgulama controller hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : 'İç sunucu hatası'
    });
  }
};

/**
 * Mağaza ödeme geçmişi
 * GET /api/v1/payment/history/:storeId
 */
export const getStorePaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userType = (req as any).user?.userType;
    const userStoreId = (req as any).user?.store_id;
    const { storeId } = req.params;
    const { limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    // Yetki kontrolü
    if (userType === 'store_user') {
      // Mağaza kullanıcısı sadece kendi mağazasını görebilir
      if (userStoreId !== storeId) {
        return res.status(403).json({
          success: false,
          message: 'Sadece kendi mağazanızın ödeme geçmişini görüntüleyebilirsiniz'
        });
      }
    } else if (userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz bulunmuyor'
      });
    }

    console.log('📊 Ödeme geçmişi istendi:', { storeId, userId, limit });

    const history = await paymentService.getStorePaymentHistory(storeId, Number(limit));

    return res.status(200).json({
      success: true,
      data: history,
      message: `${history.length} ödeme kaydı bulundu`
    });

  } catch (error) {
    console.error('❌ Ödeme geçmişi getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : 'İç sunucu hatası'
    });
  }
}; 