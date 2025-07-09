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

    const { notes } = req.body;

    const orderData: CreateOrderFromCartRequest = {
      user_id: userId,
      cart_id: cart.id,
      notes
    };

    const result = await orderService.createOrderFromCart(orderData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        requiresPayment: result.requiresPayment
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

// Kullanıcının siparişlerini listele
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

    const orders = await orderService.getUserOrders(userId, page, limit);

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

    // Sadece limit kontrolü yap, sipariş oluşturma
    const result = await orderService.createOrderFromCart({
      ...orderData,
      __checkOnly: true // Bu parametreyi service'te kontrol ederek sadece validasyon yapmak için kullanabiliriz
    } as any);

    return res.status(200).json({
      success: true,
      message: 'Limit kontrolü tamamlandı',
      data: {
        canProceed: result.success,
        message: result.message,
        requiresPayment: result.requiresPayment,
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