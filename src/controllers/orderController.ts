import { Request, Response } from 'express';
import { OrderService, CreateOrderFromCartRequest } from '../order-service';
import { CartService } from '../cart-service';

const orderService = new OrderService();
const cartService = new CartService();

// Sepeti onayla ve sipariş oluştur
export const createOrderFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    // Kullanıcının aktif sepetini al
    const cart = await cartService.getCart(userId);
    
    if (!cart.id || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sepetiniz boş veya bulunamadı'
      });
    }

    const { notes, address_id } = req.body;

    const orderData: CreateOrderFromCartRequest = {
      user_id: userId,
      cart_id: cart.id,
      notes,
      address_id
    };

    const result = await orderService.createOrderFromCart(orderData);

    if (!result.success) {
      let message = result.message;
      
      // Fiyat listesi limiti aşıldığında limit tutarını mesaja ekle
      if (result.message?.includes('Size uygun fiyat listesinden fazla miktarda alışveriş yapamazsınız')) {
        message = result.message; // Zaten düzgün mesaj
      }
      // Açık hesap bakiyesi yetersiz olduğunda limit tutarını mesaja ekle
      else if (result.message?.includes('Açık hesap bakiyeniz yetersiz')) {
        message = result.message; // Zaten düzgün mesaj
      }
      
      return res.status(400).json({
        success: false,
        message: message,
        requiresPayment: result.requiresPayment,
        limitAmount: result.limitAmount,
        minimumPayment: result.minimumPayment
      });
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      data: {
        order: result.order
      }
    });

  } catch (error: any) {
    console.error('Sepet onaylama hatası:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Sipariş oluşturulurken hata oluştu'
    });
  }
};

// Kullanıcının siparişlerini listelee
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    // Fiş yazdırma filtresi
    let receiptPrinted: boolean | undefined;
    if (req.query.receiptPrinted === 'true') {
      receiptPrinted = true;
    } else if (req.query.receiptPrinted === 'false') {
      receiptPrinted = false;
    }

    const filters = {
      status,
      receiptPrinted
    };

    const orders = await orderService.getUserOrders(userId, page, limit, filters);

    return res.status(200).json({
      success: true,
      data: orders
    });

  } catch (error: any) {
    console.error('Kullanıcı siparişleri getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Siparişler getirilemedi'
    });
  }
};

// Sipariş detayını getir
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const orderId = req.params.orderId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Sipariş ID gerekli'
      });
    }

    const result = await orderService.getOrderById(orderId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    // Kullanıcı sadece kendi siparişlerini görebilir
    if (result.order?.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bu siparişi görme yetkiniz yok'
      });
    }

    return res.status(200).json({
      success: true,
      data: result.order
    });

  } catch (error: any) {
    console.error('Sipariş detayı getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Sipariş detayı getirilemedi'
    });
  }
};

// Sepet limiti kontrolü (sipariş vermeden önce kontrol)
export const checkCartLimits = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    // Kullanıcının aktif sepetini al
    const cart = await cartService.getCart(userId);
    
    if (!cart.id || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sepetiniz boş veya bulunamadı'
      });
    }

    const orderData: CreateOrderFromCartRequest = {
      user_id: userId,
      cart_id: cart.id
    };

    // Sadece limit kontrolü yap
    const result = await orderService.validateCartLimits(userId, cart.id);

    return res.status(200).json({
      success: true,
      message: 'Limit kontrolü tamamlandı',
      data: {
        canProceed: result.success,
        message: result.message,
        requiresPayment: result.requiresPayment,
        limitAmount: result.limitAmount,
        minimumPayment: result.minimumPayment,
        cartTotal: cart.totalPrice
      }
    });

  } catch (error: any) {
    console.error('Limit kontrolü hatası:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Limit kontrolü yapılamadı'
    });
  }
};

// Siparişi iptal et (sadece PENDING durumundaki siparişler)
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userType = (req as any).user?.userType;
    const orderId = req.params.orderId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Sipariş ID gerekli'
      });
    }

    // İptal sebebi (opsiyonel)
    const { reason } = req.body;

    // Admin/Editor kontrolü - viewer'lar da kendi siparişlerini iptal edebilir
    const isAdmin = ['admin', 'editor'].includes(userType);

    const result = await orderService.cancelOrder(orderId, userId, reason, isAdmin);

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.order
    });

  } catch (error: any) {
    console.error('Sipariş iptal hatası:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Sipariş iptal edilemedi'
    });
  }
};

// Sipariş fişi al (onaylanan ve teslim edilenler için)
export const getOrderReceipt = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userType = (req as any).user?.userType;
    const orderId = req.params.orderId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Sipariş ID gerekli'
      });
    }

    // Admin/Editor kontrolü
    const isAdmin = ['admin', 'editor'].includes(userType);
    
    const result = await orderService.getOrderReceipt(orderId, userId, isAdmin);

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      data: result.receipt
    });

  } catch (error: any) {
    console.error('Sipariş fişi alma hatası:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Sipariş fişi alınırken bir hata oluştu'
    });
  }
};

// Fiş yazdırma durumunu güncelle (sadece CONFIRMED ve DELIVERED siparişler için)
export const markReceiptPrinted = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const userType = (req as any).user?.userType;
    const orderId = req.params.orderId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Sipariş ID gerekli'
      });
    }

    // Admin/Editor kontrolü
    const isAdmin = ['admin', 'editor'].includes(userType);
    
    const result = await orderService.markReceiptPrinted(orderId, userId, isAdmin);

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Fiş yazdırma durumu güncellendi',
      data: result.order
    });

  } catch (error: any) {
    console.error('Fiş yazdırma durumu güncelleme hatası:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Fiş yazdırma durumu güncellenirken bir hata oluştu'
    });
  }
}; 