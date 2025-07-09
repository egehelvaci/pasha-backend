import { PrismaClient, OrderStatus, Order, OrderItem } from '../generated/prisma';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export interface CreateOrderFromCartRequest {
  user_id: string;
  cart_id: number;
  notes?: string;
}

export interface CreateOrderRequest {
  user_id: string;
  delivery_address_id?: string;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    width: number;
    height: number;
    has_fringe?: boolean;
    cut_type?: string;
    notes?: string;
  }[];
}

export interface OrderValidationResult {
  isValid: boolean;
  message?: string;
  limitAmount?: number;
  canProceed?: boolean; // Ödeme gerekip gerekmediğini belirtir
}

export class OrderService {
  
  // Sepetten sipariş oluşturma fonksiyonu
  async createOrderFromCart(orderData: CreateOrderFromCartRequest): Promise<{ 
    success: boolean; 
    message: string; 
    order?: Order;
    requiresPayment?: boolean;
  }> {
    try {
      // Kullanıcı ve mağaza bilgilerini al
      const user = await prisma.user.findUnique({
        where: { userId: orderData.user_id },
        include: {
          Store: {
            include: {
              StorePriceList: {
                include: {
                  PriceList: true
                }
              }
            }
          }
        }
      });

      if (!user || !user.Store) {
        return { success: false, message: 'Kullanıcı veya mağaza bulunamadı' };
      }

      // Sepeti kontrol et
      const cart = await prisma.carts.findUnique({
        where: { 
          id: orderData.cart_id,
          user_id: orderData.user_id,
          is_active: true
        },
        include: {
          cart_items: {
            include: {
              Product: true
            }
          }
        }
      });

      if (!cart || cart.cart_items.length === 0) {
        return { success: false, message: 'Sepet bulunamadı veya boş' };
      }

      // Sepet tutarını hesapla
      const cartTotal = await this.calculateCartTotal(cart.cart_items, user.Store.store_id);
      
      // Sipariş limitlerini kontrol et
      const validation = await this.validateOrderLimits(user, cartTotal);
      if (!validation.isValid) {
        return { 
          success: false, 
          message: validation.message!,
          requiresPayment: !validation.canProceed
        };
      }

      // Sipariş oluştur
      const order = await prisma.order.create({
        data: {
          user_id: orderData.user_id,
          cart_id: orderData.cart_id,
          total_price: cartTotal,
          status: OrderStatus.PENDING,
          
          // Mağaza adres bilgilerini otomatik ekle
          delivery_address: user.Store.adres,
          store_name: user.Store.kurum_adi,
          store_tax_number: user.Store.vergi_numarasi,
          store_tax_office: user.Store.vergi_dairesi,
          store_phone: user.Store.telefon,
          store_email: user.Store.eposta,
          store_fax: user.Store.faks_numarasi,
          
          items: {
            create: cart.cart_items.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              has_fringe: item.has_fringe,
              width: item.width,
              height: item.height,
              cut_type: item.cut_type?.toString()
            }))
          }
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  collection: true
                }
              }
            }
          },
          user: true,
          cart: true
        }
      });

      // Sipariş sonrası işlemleri gerçekleştir
      await this.processPostOrderOperations(user, cartTotal);

      // Sepeti pasif hale getir
      await prisma.carts.update({
        where: { id: orderData.cart_id },
        data: { is_active: false }
      });

      return { success: true, message: 'Sipariş başarıyla oluşturuldu', order };

    } catch (error) {
      console.error('Sepetten sipariş oluşturma hatası:', error);
      return { success: false, message: 'Sipariş oluşturulurken bir hata oluştu' };
    }
  }

  // Sipariş limitlerini kontrol et
  private async validateOrderLimits(user: any, orderTotal: number): Promise<OrderValidationResult> {
    const store = user.Store;
    
    // Kullanıcıya ait fiyat listesi var mı kontrol et
    const userPriceList = store.StorePriceList.find((spl: any) => spl.PriceList);
    
    if (userPriceList && userPriceList.PriceList.limit_amount) {
      // Fiyat listesi limiti kontrol et
      const currentOrdersTotal = await this.getUserCurrentOrdersTotal(user.userId);
      const totalWithNewOrder = currentOrdersTotal + orderTotal;
      
      if (totalWithNewOrder > Number(userPriceList.PriceList.limit_amount)) {
        return {
          isValid: false,
          message: 'Size uygun fiyat listesinden fazla miktarda alışveriş yapamazsınız',
          limitAmount: Number(userPriceList.PriceList.limit_amount),
          canProceed: false
        };
      }
    }

    // Mağaza açık hesap limiti kontrol et
    if (store.limitsiz_acik_hesap) {
      // Sınırsız açık hesap - sipariş verilebilir
      return { isValid: true, canProceed: true };
    }

    // Sınırlı açık hesap - limit kontrolü
    const currentStoreTotal = await this.getStoreCurrentOrdersTotal(store.store_id);
    const totalWithNewOrder = currentStoreTotal + orderTotal;
    const storeLimit = Number(store.acik_hesap_tutari || 0);
    
    if (totalWithNewOrder > storeLimit) {
      return {
        isValid: false,
        message: 'Ödeme yapın',
        limitAmount: storeLimit,
        canProceed: false
      };
    }

    return { isValid: true, canProceed: true };
  }

  // Sipariş tutarını hesapla
  private async calculateOrderTotal(items: CreateOrderRequest['items'], storeId: string): Promise<number> {
    let total = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { productId: item.product_id },
        include: {
          collection: {
            include: {
              PriceListDetail: {
                include: {
                  PriceList: {
                    include: {
                      StorePriceList: {
                        where: { store_id: storeId }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (product) {
        const area = (item.width * item.height) / 10000; // m2'ye çevir
        const priceDetail = product.collection.PriceListDetail.find(pld => 
          pld.PriceList.StorePriceList.length > 0
        );
        
        if (priceDetail) {
          const unitPrice = Number(priceDetail.price_per_square_meter);
          const itemTotal = unitPrice * area * item.quantity;
          total += itemTotal;
        }
      }
    }

    return total;
  }

  // Sepet tutarını hesapla
  private async calculateCartTotal(cartItems: any[], storeId: string): Promise<number> {
    let total = 0;

    for (const item of cartItems) {
      total += Number(item.total_price);
    }

    return total;
  }

  // Sipariş öğelerini hazırla
  private async prepareOrderItems(items: CreateOrderRequest['items'], storeId: string) {
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { productId: item.product_id },
        include: {
          collection: {
            include: {
              PriceListDetail: {
                include: {
                  PriceList: {
                    include: {
                      StorePriceList: {
                        where: { store_id: storeId }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (product) {
        const area = (item.width * item.height) / 10000; // m2'ye çevir
        const priceDetail = product.collection.PriceListDetail.find(pld => 
          pld.PriceList.StorePriceList.length > 0
        );
        
        if (priceDetail) {
          const unitPrice = Number(priceDetail.price_per_square_meter);
          const totalPrice = unitPrice * area * item.quantity;

          orderItems.push({
            product_id: item.product_id,
            quantity: item.quantity,
            width: item.width,
            height: item.height,
            area_m2: area,
            unit_price: unitPrice,
            total_price: totalPrice,
            has_fringe: item.has_fringe || false,
            cut_type: item.cut_type as any || 'rectangle',
            notes: item.notes
          });
        }
      }
    }

    return orderItems;
  }

  // Kullanıcının mevcut toplam sipariş tutarını getir
  private async getUserCurrentOrdersTotal(userId: string): Promise<number> {
    const result = await prisma.order.aggregate({
      where: {
        user_id: userId,
        status: {
          in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPED]
        }
      },
      _sum: {
        total_price: true
      }
    });

    return Number(result._sum.total_price || 0);
  }

  // Mağazanın mevcut toplam sipariş tutarını getir
  private async getStoreCurrentOrdersTotal(storeId: string): Promise<number> {
    const result = await prisma.order.aggregate({
      where: {
        user: {
          store_id: storeId
        },
        status: {
          in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPED]
        }
      },
      _sum: {
        total_price: true
      }
    });

    return Number(result._sum.total_price || 0);
  }

  // Sipariş detayını getir
  async getOrderById(orderId: string): Promise<{ success: boolean; order?: Order; message?: string }> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  collection: true
                }
              }
            }
          },
          user: true,
          cart: true
        }
      });

      if (!order) {
        return { success: false, message: 'Sipariş bulunamadı' };
      }

      return { success: true, order };
    } catch (error) {
      console.error('Sipariş getirme hatası:', error);
      return { success: false, message: 'Sipariş getirilemedi' };
    }
  }

  // Kullanıcının siparişlerini listele
  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const orders = await prisma.order.findMany({
        where: { user_id: userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  collection: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      });

      const totalCount = await prisma.order.count({
        where: { user_id: userId }
      });

      return {
        orders,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Kullanıcı siparişleri getirme hatası:', error);
      throw error;
    }
  }

  // Admin için siparişleri listele
  async getOrdersForAdmin(page: number = 1, limit: number = 20, status?: OrderStatus) {
    try {
      const skip = (page - 1) * limit;
      
      const where = status ? { status } : {};
      
      const orders = await prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              surname: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  productImage: true
                }
              }
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      });

      const total = await prisma.order.count({ where });

      return {
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Siparişleri getirme hatası:', error);
      return { success: false, message: 'Siparişler getirilirken bir hata oluştu' };
    }
  }

  // Kullanıcı için siparişleri listele
  async getOrdersForUser(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const orders = await prisma.order.findMany({
        where: { user_id: userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  productImage: true
                }
              }
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      });

      const total = await prisma.order.count({ where: { user_id: userId } });

      return {
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Kullanıcı siparişleri getirme hatası:', error);
      return { success: false, message: 'Siparişler getirilirken bir hata oluştu' };
    }
  }

  // Mağaza limitini artır (ödeme sonrası)
  async increaseStoreLimit(storeId: string, amount: number): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.store.update({
        where: { store_id: storeId },
        data: {
          acik_hesap_tutari: {
            increment: amount
          }
        }
      });

      return { success: true, message: 'Mağaza limiti başarıyla artırıldı' };

    } catch (error) {
      console.error('Mağaza limiti artırma hatası:', error);
      return { success: false, message: 'Mağaza limiti artırılırken bir hata oluştu' };
    }
  }

  // Sipariş sonrası işlemler
  private async processPostOrderOperations(user: any, orderTotal: number): Promise<void> {
    const store = user.Store;
    
    try {
      // 1. Açık hesap tutarını düşür
      if (!store.limitsiz_acik_hesap) {
        await prisma.store.update({
          where: { store_id: store.store_id },
          data: {
            acik_hesap_tutari: {
              decrement: orderTotal
            }
          }
        });
      }

      // 2. Fiyat listesi limitini güncelle
      const storePriceList = store.StorePriceList.find((spl: any) => spl.PriceList);
      if (storePriceList && storePriceList.PriceList.limit_amount) {
        const currentLimit = Number(storePriceList.PriceList.limit_amount);
        const newLimit = currentLimit - orderTotal;

        // Fiyat listesi limitini güncelle
        await prisma.priceList.update({
          where: { price_list_id: storePriceList.PriceList.price_list_id },
          data: {
            limit_amount: Math.max(0, newLimit) // Negatif olmayacak şekilde
          }
        });

        // 3. Limit bittiğinde varsayılan fiyat listesine geç
        if (newLimit <= 0) {
          // Mevcut fiyat listesi atamasını kaldır
          await prisma.storePriceList.delete({
            where: {
              store_price_list_id: storePriceList.store_price_list_id
            }
          });

          // Varsayılan fiyat listesini bul ve ata
          const defaultPriceList = await prisma.priceList.findFirst({
            where: { 
              is_default: true,
              is_active: true 
            }
          });

          if (defaultPriceList) {
            await prisma.storePriceList.create({
              data: {
                store_id: store.store_id,
                price_list_id: defaultPriceList.price_list_id
              }
            });
          }
        }
      }

    } catch (error) {
      console.error('Sipariş sonrası işlemler hatası:', error);
      // Bu hata sipariş oluşumunu engellemeyecek, sadece log tutulacak
    }
  }

  // Mağaza limitini artır (ödeme sonrası) - deliveryAddress tablosu şemada yok, kaldırıldı
}

export const orderService = new OrderService(); 