import { Request, Response } from 'express';
import { CartService, AddToCartRequest } from '../cart-service';
import { OrderService } from '../order-service';
import prisma from '../utils/prisma';

const cartService = new CartService();
const orderService = new OrderService();

export class AdminCartController {
  constructor() {
    this.addToAdminCart = this.addToAdminCart.bind(this);
    this.getAdminCart = this.getAdminCart.bind(this);
    this.clearAdminCart = this.clearAdminCart.bind(this);
    this.removeFromAdminCart = this.removeFromAdminCart.bind(this);
    this.createOrderFromAdminCart = this.createOrderFromAdminCart.bind(this);
  }

  /**
   * Admin için kullanıcı admin sepetine ürün ekleme
   */
  async addToAdminCart(req: Request, res: Response) {
    try {
      // Admin kimlik doğrulaması (middleware'den geliyor)
      const adminUserId = (req as any).user?.userId;
      
      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          message: 'Admin kimlik doğrulaması gerekli'
        });
      }

      const { targetUserId, storeId, productId, quantity, width, height, hasFringe, cutType, notes } = req.body;

      // Zorunlu alanları kontrol et
      if (!targetUserId || !storeId || !productId || !quantity || !width || !height || hasFringe === undefined || !cutType) {
        return res.status(400).json({
          success: false,
          message: 'targetUserId, storeId, productId, quantity, width, height, hasFringe ve cutType alanları zorunludur'
        });
      }

      // Sayısal değerleri kontrol et
      if (quantity <= 0 || width <= 0 || height <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Miktar, genişlik ve yükseklik pozitif değerler olmalıdır'
        });
      }

      // Hedef kullanıcının varlığını kontrol et
      const targetUser = await prisma.user.findUnique({
        where: { userId: targetUserId },
        include: { Store: true }
      });

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Hedef kullanıcı bulunamadı'
        });
      }

      // Mağaza kontrolü
      const store = await prisma.store.findUnique({
        where: { store_id: storeId }
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Mağaza bulunamadı'
        });
      }

      const addToCartData: AddToCartRequest & { targetUserId: string; adminUserId: string; storeId: string } = {
        userId: targetUserId, // Backward compatibility için
        targetUserId,
        adminUserId,
        storeId,
        productId,
        quantity: Number(quantity),
        width: Number(width),
        height: Number(height),
        hasFringe: Boolean(hasFringe),
        cutType,
        notes
      };

      const adminCartItem = await cartService.addToAdminCart(addToCartData);

      return res.status(201).json({
        success: true,
        message: `Admin ${adminUserId} tarafından ${targetUser.name} ${targetUser.surname} adlı kullanıcının admin sepetine ürün eklendi`,
        data: {
          adminCartItem,
          targetUser: {
            userId: targetUser.userId,
            name: targetUser.name,
            surname: targetUser.surname,
            email: targetUser.email,
            store: targetUser.Store ? {
              store_id: targetUser.Store.store_id,
              kurum_adi: targetUser.Store.kurum_adi
            } : null
          },
          store: {
            store_id: store.store_id,
            kurum_adi: store.kurum_adi
          }
        }
      });
    } catch (error: any) {
      console.error('Admin sepete ekleme hatası:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Admin tarafından ürün admin sepete eklenirken hata oluştu'
      });
    }
  }

  /**
   * Admin için kullanıcı admin sepetini getirme
   */
  async getAdminCart(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.userId;
      
      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          message: 'Admin kimlik doğrulaması gerekli'
        });
      }

      const { targetUserId, storeId } = req.params;

      if (!targetUserId || !storeId) {
        return res.status(400).json({
          success: false,
          message: 'targetUserId ve storeId parametreleri gerekli'
        });
      }

      // Hedef kullanıcının varlığını kontrol et
      const targetUser = await prisma.user.findUnique({
        where: { userId: targetUserId },
        include: { Store: true }
      });

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Hedef kullanıcı bulunamadı'
        });
      }

      const adminCart = await cartService.getAdminCart(targetUserId, adminUserId, storeId);

      return res.status(200).json({
        success: true,
        message: `${targetUser.name} ${targetUser.surname} adlı kullanıcının admin sepeti getirildi`,
        data: {
          adminCart,
          targetUser: {
            userId: targetUser.userId,
            name: targetUser.name,
            surname: targetUser.surname,
            email: targetUser.email,
            store: targetUser.Store ? {
              store_id: targetUser.Store.store_id,
              kurum_adi: targetUser.Store.kurum_adi
            } : null
          }
        }
      });
    } catch (error: any) {
      console.error('Admin sepet getirme hatası:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Admin tarafından admin sepet getirilirken hata oluştu'
      });
    }
  }

  /**
   * Admin için kullanıcı admin sepetini temizleme
   */
  async clearAdminCart(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.userId;
      
      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          message: 'Admin kimlik doğrulaması gerekli'
        });
      }

      const { targetUserId, storeId } = req.params;

      if (!targetUserId || !storeId) {
        return res.status(400).json({
          success: false,
          message: 'targetUserId ve storeId parametreleri gerekli'
        });
      }

      // Hedef kullanıcının varlığını kontrol et
      const targetUser = await prisma.user.findUnique({
        where: { userId: targetUserId },
        include: { Store: true }
      });

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Hedef kullanıcı bulunamadı'
        });
      }

      const result = await cartService.clearAdminCart(targetUserId, adminUserId, storeId);

      return res.status(200).json({
        success: true,
        message: `Admin ${adminUserId} tarafından ${targetUser.name} ${targetUser.surname} adlı kullanıcının admin sepeti temizlendi`,
        data: {
          ...result,
          targetUser: {
            userId: targetUser.userId,
            name: targetUser.name,
            surname: targetUser.surname,
            email: targetUser.email
          }
        }
      });
    } catch (error: any) {
      console.error('Admin sepet temizleme hatası:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Admin tarafından admin sepet temizlenirken hata oluştu'
      });
    }
  }

  /**
   * Admin için kullanıcı admin sepetinden ürün çıkarma
   */
  async removeFromAdminCart(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.userId;
      
      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          message: 'Admin kimlik doğrulaması gerekli'
        });
      }

      const { targetUserId, storeId, adminCartItemId } = req.params;

      if (!targetUserId || !storeId || !adminCartItemId) {
        return res.status(400).json({
          success: false,
          message: 'targetUserId, storeId ve adminCartItemId parametreleri gerekli'
        });
      }

      const adminCartItemIdNum = Number(adminCartItemId);
      if (isNaN(adminCartItemIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir admin sepet öğesi ID\'si gerekli'
        });
      }

      // Hedef kullanıcının varlığını kontrol et
      const targetUser = await prisma.user.findUnique({
        where: { userId: targetUserId }
      });

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Hedef kullanıcı bulunamadı'
        });
      }

      const result = await cartService.removeFromAdminCart(adminCartItemIdNum, targetUserId, adminUserId);

      return res.status(200).json({
        success: true,
        message: `Admin ${adminUserId} tarafından ${targetUser.name} ${targetUser.surname} adlı kullanıcının admin sepetinden ürün çıkarıldı`,
        data: {
          ...result,
          targetUser: {
            userId: targetUser.userId,
            name: targetUser.name,
            surname: targetUser.surname,
            email: targetUser.email
          }
        }
      });
    } catch (error: any) {
      console.error('Admin sepetten çıkarma hatası:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Admin tarafından ürün admin sepetten çıkarılırken hata oluştu'
      });
    }
  }

  /**
   * Admin için kullanıcı admin sepetinden sipariş oluşturma
   */
  async createOrderFromAdminCart(req: Request, res: Response) {
    try {
      const adminUserId = (req as any).user?.userId;
      
      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          message: 'Admin kimlik doğrulaması gerekli'
        });
      }

      const { targetUserId, storeId, notes } = req.body;

      if (!targetUserId || !storeId) {
        return res.status(400).json({
          success: false,
          message: 'targetUserId ve storeId alanları zorunludur'
        });
      }

      // Hedef kullanıcının varlığını ve mağaza bilgilerini kontrol et
      const targetUser = await prisma.user.findUnique({
        where: { userId: targetUserId },
        include: { Store: true }
      });

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Hedef kullanıcı bulunamadı'
        });
      }

      if (!targetUser.Store) {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcının mağaza bilgisi bulunamadı'
        });
      }

      // Kullanıcının admin sepetini kontrol et
      const adminCart = await prisma.admin_carts.findFirst({
        where: {
          target_user_id: targetUserId,
          admin_user_id: adminUserId,
          store_id: storeId,
          is_active: true
        },
        include: {
          admin_cart_items: {
            include: {
              Product: true
            }
          }
        }
      });

      if (!adminCart || adminCart.admin_cart_items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcının aktif admin sepeti bulunamadı veya sepet boş'
        });
      }

      // Admin sepeti onaylayarak normal sepete dönüştür
      const confirmResult = await cartService.confirmAdminCart(targetUserId, adminUserId, storeId);
      
      if (!confirmResult.success || !confirmResult.cartId) {
        return res.status(400).json({
          success: false,
          message: confirmResult.message
        });
      }

      // OrderService ile sepetten sipariş oluştur
      const orderResult = await orderService.createOrderFromCart({
        user_id: targetUserId,
        cart_id: confirmResult.cartId,
        delivery_address: targetUser.adres || '',
        store_name: targetUser.Store.kurum_adi,
        store_tax_number: targetUser.Store.vergi_numarasi || undefined,
        store_tax_office: targetUser.Store.vergi_dairesi || undefined,
        notes: notes
      });

      if (!orderResult.success) {
        return res.status(400).json({
          success: false,
          message: orderResult.message
        });
      }

      return res.status(201).json({
        success: true,
        message: `Admin ${adminUserId} tarafından ${targetUser.name} ${targetUser.surname} adlı kullanıcının admin sepetinden sipariş oluşturuldu`,
        data: {
          order: orderResult.order,
          targetUser: {
            userId: targetUser.userId,
            name: targetUser.name,
            surname: targetUser.surname,
            email: targetUser.email,
            store: {
              store_id: targetUser.Store.store_id,
              kurum_adi: targetUser.Store.kurum_adi
            }
          },
          requiresPayment: orderResult.requiresPayment,
          limitAmount: orderResult.limitAmount,
          minimumPayment: orderResult.minimumPayment
        }
      });

    } catch (error: any) {
      console.error('Admin sepetten sipariş oluşturma hatası:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Admin tarafından admin sepetten sipariş oluşturulurken hata oluştu'
      });
    }
  }
} 