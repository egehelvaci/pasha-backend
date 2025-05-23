import { Request, Response } from 'express';
import { CartService, AddToCartRequest, UpdateCartItemRequest } from '../cart-service';

const cartService = new CartService();

// Sepete ürün ekleme
export const addToCart = async (req: Request, res: Response) => {
  try {
    // Kullanıcı ID'sini token'dan al
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    const { productId, quantity, width, height, hasFringe, cutType, notes } = req.body;

    // Zorunlu alanları kontrol et
    if (!productId || !quantity || !width || !height || hasFringe === undefined || !cutType) {
      return res.status(400).json({
        success: false,
        message: 'Tüm zorunlu alanları doldurmanız gerekiyor'
      });
    }

    // Sayısal değerleri kontrol et
    if (quantity <= 0 || width <= 0 || height <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Miktar, genişlik ve yükseklik pozitif değerler olmalıdır'
      });
    }

    const addToCartData: AddToCartRequest = {
      userId,
      productId,
      quantity: Number(quantity),
      width: Number(width),
      height: Number(height),
      hasFringe: Boolean(hasFringe),
      cutType,
      notes
    };

    const cartItem = await cartService.addToCart(addToCartData);

    return res.status(201).json({
      success: true,
      message: 'Ürün sepete eklendi',
      data: cartItem
    });
  } catch (error: any) {
    console.error('Sepete ekleme hatası:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Ürün sepete eklenirken hata oluştu'
    });
  }
};

// Kullanıcının sepetini getir
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    const cart = await cartService.getCart(userId);

    return res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error: any) {
    console.error('Sepet getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Sepet getirilemedi'
    });
  }
};

// Sepet öğesini güncelle
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    const cartItemId = Number(req.params.cartItemId);
    const { quantity, width, height, hasFringe, cutType, notes } = req.body;

    if (!cartItemId || isNaN(cartItemId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir sepet öğesi ID\'si gerekli'
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir miktar gerekli'
      });
    }

    const updateData: UpdateCartItemRequest = {
      cartItemId,
      quantity: Number(quantity),
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      hasFringe: hasFringe !== undefined ? Boolean(hasFringe) : undefined,
      cutType,
      notes
    };

    const updatedItem = await cartService.updateCartItem(updateData);

    return res.status(200).json({
      success: true,
      message: 'Sepet öğesi güncellendi',
      data: updatedItem
    });
  } catch (error: any) {
    console.error('Sepet öğesi güncelleme hatası:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Sepet öğesi güncellenirken hata oluştu'
    });
  }
};

// Sepetten ürün çıkar
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    const cartItemId = Number(req.params.cartItemId);

    if (!cartItemId || isNaN(cartItemId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir sepet öğesi ID\'si gerekli'
      });
    }

    const result = await cartService.removeFromCart(cartItemId, userId);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Sepetten çıkarma hatası:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Ürün sepetten çıkarılırken hata oluştu'
    });
  }
};

// Sepeti temizle
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    const result = await cartService.clearCart(userId);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Sepet temizleme hatası:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Sepet temizlenirken hata oluştu'
    });
  }
};

// Sepeti sil
export const deleteCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    const result = await cartService.deleteCart(userId);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Sepet silme hatası:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Sepet silinirken hata oluştu'
    });
  }
};

// Admin: Eski sepetleri temizle
export const cleanOldCarts = async (req: Request, res: Response) => {
  try {
    // Bu endpoint sadece admin için olabilir
    const result = await cartService.cleanOldCarts();

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Eski sepetleri temizleme hatası:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Eski sepetler temizlenirken hata oluştu'
    });
  }
}; 