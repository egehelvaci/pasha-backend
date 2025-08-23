import { PrismaClient, OrderStatus, Order, OrderItem } from '../generated/prisma';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from '@prisma/client/runtime/library';
import { roundCurrency, addCurrency } from './utils/number-utils';
import { $Enums } from '../generated/prisma';
import { qrCodeService } from './services/qr-code-service';
import { notificationService } from './services/notification-service';

const prisma = new PrismaClient();

// Fiyat listesi minimum eşik değeri - bu değerin altında kaldığında varsayılan listeye geçilir
const PRICE_LIST_MINIMUM_THRESHOLD = 1500;

export interface CreateOrderFromCartRequest {
  user_id: string;
  cart_id: number;
  address_id?: string;  // StoreAddress ID'si
  delivery_address?: string; // Geriye uyumluluk için
  store_name?: string;
  store_tax_number?: string;
  store_tax_office?: string;
  notes?: string;
}

export interface CreateOrderFromAdminCartRequest {
  user_id: string;
  admin_cart_id: number;
  address_id?: string;  // StoreAddress ID'si
  delivery_address?: string; // Geriye uyumluluk için
  store_name?: string;
  store_tax_number?: string;
  store_tax_office?: string;
  notes?: string;
}

export interface CreateOrderRequest {
  user_id: string;
  address_id?: string;  // StoreAddress ID'si
  delivery_address_id?: string; // Geriye uyumluluk için
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

export interface CreateAdminOrderRequest {
  user_id: string;
  store_id: string;
  address_id?: string;  // StoreAddress ID'si
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
  minimumPayment?: number; // Minimum ödeme tutarı
}

export class OrderService {

  /**
   * Address ID'den adres bilgisini alır ve delivery_address formatında döndürür
   */
  private async getDeliveryAddressFromId(addressId: string): Promise<string | null> {
    try {
      const address = await prisma.storeAddress.findUnique({
        where: { 
          id: addressId,
          is_active: true 
        }
      });

      if (!address) {
        return null;
      }

      // Adres bilgisini tek satırda birleştir
      const parts = [address.address];
      if (address.district) parts.push(address.district);
      if (address.city) parts.push(address.city);
      if (address.postal_code) parts.push(address.postal_code);

      return parts.join(', ');
    } catch (error) {
      console.error('Adres bilgisi alınamadı:', error);
      return null;
    }
  }

  /**
   * Mağazanın default adresini getirir
   */
  private async getDefaultStoreAddress(storeId: string): Promise<{ id: string; address: string } | null> {
    try {
      const defaultAddress = await prisma.storeAddress.findFirst({
        where: { 
          store_id: storeId,
          is_default: true,
          is_active: true 
        }
      });

      if (!defaultAddress) {
        // Default adres yoksa, ilk aktif adresi al
        const firstAddress = await prisma.storeAddress.findFirst({
          where: { 
            store_id: storeId,
            is_active: true 
          },
          orderBy: { created_at: 'asc' }
        });

        if (!firstAddress) {
          return null;
        }

        // İlk adresi default yap
        await prisma.storeAddress.update({
          where: { id: firstAddress.id },
          data: { is_default: true }
        });

        return {
          id: firstAddress.id,
          address: this.formatStoreAddress(firstAddress)
        };
      }

      return {
        id: defaultAddress.id,
        address: this.formatStoreAddress(defaultAddress)
      };
    } catch (error) {
      console.error('Default adres alırken hata:', error);
      return null;
    }
  }

  /**
   * StoreAddress nesnesini formatlanmış string'e çevirir
   */
  private formatStoreAddress(address: any): string {
    const parts = [address.address];
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.postal_code) parts.push(address.postal_code);
    return parts.join(', ');
  }
  
  // Sepet limitlerini kontrol et (sadece validasyon)
  async validateCartLimits(userId: string, cartId: number): Promise<{
    success: boolean;
    message: string;
    requiresPayment?: boolean;
    limitAmount?: number;
    minimumPayment?: number;
  }> {
    try {
      // Kullanıcı ve mağaza bilgilerini al
      const user = await prisma.user.findUnique({
        where: { userId: userId },
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
          id: cartId,
          user_id: userId,
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
        let message = validation.message!;
        
        // Fiyat listesi limiti aşıldığında limit tutarını mesaja ekle
        if (validation.message === 'PRICE_LIST_LIMIT_EXCEEDED') {
          message = `Size uygun fiyat listesinden fazla miktarda alışveriş yapamazsınız. Size özel fiyat listesi tutarı: ${validation.limitAmount} TL'dir.`;
        }
        // Bakiye + açık hesap limiti toplamı yetersiz olduğunda
        else if (validation.message === 'BALANCE_INSUFFICIENT') {
          message = `Bakiye + açık hesap limitiniz yetersiz. Toplam kullanılabilir tutarınız: ${validation.limitAmount} TL'dir. Minimum ödeme tutarı: ${validation.minimumPayment} TL'dir.`;
        }
        
        return { 
          success: false, 
          message: message,
          requiresPayment: !validation.canProceed,
          limitAmount: validation.limitAmount,
          minimumPayment: validation.minimumPayment
        };
      }

      return { success: true, message: 'Sepet limitleri uygun' };

    } catch (error) {
      console.error('Sepet limit kontrolü hatası:', error);
      return { success: false, message: 'Limit kontrolü yapılamadı' };
    }
  }

  // Sepetten sipariş oluşturma fonksiyonu
  async createOrderFromCart(orderData: CreateOrderFromCartRequest): Promise<{ 
    success: boolean; 
    message: string; 
    order?: Order;
    requiresPayment?: boolean;
    limitAmount?: number;
    minimumPayment?: number;
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
          requiresPayment: !validation.canProceed,
          limitAmount: validation.limitAmount,
          minimumPayment: validation.minimumPayment
        };
      }

      // Seçilen adresi al ve delivery_address'i ayarla
      let deliveryAddress: string | null = null;
      let finalAddressId: string | null = orderData.address_id || null;
      
      if (orderData.address_id) {
        deliveryAddress = await this.getDeliveryAddressFromId(orderData.address_id);
      } else if (orderData.delivery_address) {
        deliveryAddress = orderData.delivery_address; // Geriye uyumluluk
      } else {
        // Adres belirtilmediyse default adresi kullan
        const defaultAddress = await this.getDefaultStoreAddress(user.Store.store_id);
        if (defaultAddress) {
          finalAddressId = defaultAddress.id;
          deliveryAddress = defaultAddress.address;
        }
      }

      // Sipariş oluştur
      const order = await prisma.order.create({
        data: {
          user_id: orderData.user_id,
          cart_id: orderData.cart_id,
          total_price: cartTotal,
          status: OrderStatus.PENDING,
          address_id: finalAddressId,
          
          // Adres sistemi artık store-based olarak değişti
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
              cut_type: item.cut_type === 'rectangle' ? 'standart' : item.cut_type?.toString()
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
          cart: true,
          address: true
        }
      });

      // YENİ MANTIK: Sipariş oluşturulduğunda stok düşür
      try {
        await qrCodeService.reduceStockForOrder(order.id);
        console.log(`✅ Sipariş ${order.id} oluşturuldu ve stok düşürüldü`);
      } catch (stockError) {
        console.error('❌ Stok düşürme hatası:', stockError);
        // Stok hatası durumunda siparişi iptal et
        await prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELED }
        });
        return { success: false, message: 'Stok yetersizliği nedeniyle sipariş oluşturulamadı' };
      }

      // Sipariş sonrası işlemleri gerçekleştir (bakiye düşürme vs.)
      await this.processPostOrderOperations(user, cartTotal);

      // Sepeti pasif hale getir
      await prisma.carts.update({
        where: { id: orderData.cart_id },
        data: { is_active: false }
      });

      // Admin'e yeni sipariş bildirimi gönder
      try {
        const customerName = `${user.name} ${user.surname}`;
        await notificationService.notifyNewOrder(order.id, orderData.user_id, cartTotal, customerName);
        console.log('✅ Admin\'e yeni sipariş bildirimi gönderildi');
      } catch (notificationError) {
        console.error('❌ Admin sipariş bildirim hatası:', notificationError);
        // Bildirim hatası ana işlemi etkilemesin
      }

      return { success: true, message: 'Sipariş başarıyla oluşturuldu', order };

    } catch (error) {
      console.error('Sepetten sipariş oluşturma hatası:', error);
      return { success: false, message: 'Sipariş oluşturulurken bir hata oluştu' };
    }
  }

  /**
   * Admin sepetinden sipariş oluşturma fonksiyonu
   */
  async createOrderFromAdminCart(orderData: CreateOrderFromAdminCartRequest): Promise<{ 
    success: boolean; 
    message: string; 
    order?: Order;
    requiresPayment?: boolean;
    limitAmount?: number;
    minimumPayment?: number;
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

      // Admin sepeti kontrol et
      const adminCart = await prisma.admin_carts.findUnique({
        where: { 
          id: orderData.admin_cart_id,
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
        return { success: false, message: 'Admin sepet bulunamadı veya boş' };
      }

      // Admin sepet tutarını hesapla
      const cartTotal = await this.calculateCartTotal(adminCart.admin_cart_items, user.Store.store_id);
      
      // Sipariş limitlerini kontrol et
      const validation = await this.validateOrderLimits(user, cartTotal);
      if (!validation.isValid) {
        return { 
          success: false, 
          message: validation.message!,
          requiresPayment: !validation.canProceed,
          limitAmount: validation.limitAmount,
          minimumPayment: validation.minimumPayment
        };
      }

      // Seçilen adresi al ve delivery_address'i ayarla
      let deliveryAddress: string | null = null;
      if (orderData.address_id) {
        deliveryAddress = await this.getDeliveryAddressFromId(orderData.address_id);
      } else if (orderData.delivery_address) {
        deliveryAddress = orderData.delivery_address; // Geriye uyumluluk
      }

      // Sipariş oluştur
      const order = await prisma.order.create({
        data: {
          user_id: orderData.user_id,
          cart_id: orderData.admin_cart_id, // Admin sepet ID'sini kullan
          total_price: cartTotal,
          status: OrderStatus.PENDING,
          address_id: orderData.address_id || null,
          
          // Adres sistemi artık store-based olarak değişti
          store_name: orderData.store_name || user.Store.kurum_adi,
          store_tax_number: orderData.store_tax_number || user.Store.vergi_numarasi,
          store_tax_office: orderData.store_tax_office || user.Store.vergi_dairesi,
          store_phone: user.Store.telefon,
          store_email: user.Store.eposta,
          store_fax: user.Store.faks_numarasi,
          
          items: {
            create: adminCart.admin_cart_items.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              has_fringe: item.has_fringe,
              width: item.width,
              height: item.height,
              cut_type: item.cut_type === 'rectangle' ? 'standart' : item.cut_type?.toString()
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
          cart: true,
          address: true
        }
      });

      // YENİ MANTIK: Sipariş oluşturulduğunda stok düşür
      try {
        await qrCodeService.reduceStockForOrder(order.id);
        console.log(`✅ Admin sepetinden sipariş ${order.id} oluşturuldu ve stok düşürüldü`);
      } catch (stockError) {
        console.error('❌ Stok düşürme hatası:', stockError);
        // Stok hatası durumunda siparişi iptal et
        await prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELED }
        });
        return { success: false, message: 'Stok yetersizliği nedeniyle sipariş oluşturulamadı' };
      }

      // Admin sipariş sonrası işlemleri gerçekleştir (bakiye düşürme vs.)
      await this.processAdminOrderOperations(user, cartTotal);

      // Admin sepeti pasif hale getir
      await prisma.admin_carts.update({
        where: { id: orderData.admin_cart_id },
        data: { is_active: false }
      });

      // Admin'e yeni sipariş bildirimi gönder
      try {
        const customerName = `${user.name} ${user.surname}`;
        await notificationService.notifyNewOrder(order.id, orderData.user_id, cartTotal, customerName);
        console.log('✅ Admin\'e yeni sipariş bildirimi gönderildi (Admin sepeti)');
      } catch (notificationError) {
        console.error('❌ Admin sipariş bildirim hatası (Admin sepeti):', notificationError);
        // Bildirim hatası ana işlemi etkilemesin
      }

      return { 
        success: true, 
        message: 'Admin sepetinden sipariş başarıyla oluşturuldu', 
        order,
        requiresPayment: !validation.canProceed,
        limitAmount: validation.limitAmount,
        minimumPayment: validation.minimumPayment
      };

    } catch (error) {
      console.error('Admin sepetinden sipariş oluşturma hatası:', error);
      return { success: false, message: 'Sipariş oluşturulurken bir hata oluştu' };
    }
  }

  /**
   * Admin için özel sipariş oluşturma fonksiyonu
   * Açık hesap limiti kontrolü yapmaz, doğrudan mağaza bakiyesinden düşer
   */
  async createAdminOrder(orderData: CreateAdminOrderRequest): Promise<{ 
    success: boolean; 
    message: string; 
    order?: Order;
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

      // Kullanıcının belirtilen mağazaya ait olup olmadığını kontrol et
      if (user.store_id !== orderData.store_id) {
        return { success: false, message: 'Kullanıcı belirtilen mağazaya ait değil' };
      }

      // Mağaza aktiflik kontrolü
      if (!user.Store.is_active) {
        return { success: false, message: 'Mağaza aktif değil' };
      }

      // Adres sistemi artık store-based olarak değişti - kontrol kaldırıldı

      // Sipariş items'larını kontrol et
      if (!orderData.items || orderData.items.length === 0) {
        return { success: false, message: 'Sipariş öğeleri belirtilmedi' };
      }

      // Cut type mapping - string'i enum'a çevir
      const cutTypeMapping: { [key: string]: $Enums.cut_type_enum } = {
        'standart': $Enums.cut_type_enum.rectangle,
        'dikdörtgen': $Enums.cut_type_enum.rectangle,
        'rectangle': $Enums.cut_type_enum.rectangle,
        'daire': $Enums.cut_type_enum.round,
        'round': $Enums.cut_type_enum.round,
        'circle': $Enums.cut_type_enum.round,
        'oval': $Enums.cut_type_enum.oval,
        'custom': $Enums.cut_type_enum.custom,
        'özel': $Enums.cut_type_enum.custom
      };

      // Sipariş öğelerini hazırla ve toplam tutarı hesapla
      const orderItems = await this.prepareOrderItems(orderData.items, user.Store.store_id);
      
      if (orderItems.length === 0) {
        return { success: false, message: 'Geçerli sipariş öğesi bulunamadı' };
      }

      // Sipariş tutarını hesapla
      const orderTotal = orderItems.reduce((total, item) => total + item.total_price, 0);

      // Geçici bir sepet oluştur (admin siparişi için)
      const tempCart = await prisma.carts.create({
        data: {
          user_id: orderData.user_id,
          is_active: false // Admin siparişi için hemen pasif
        }
      });

      // Sepet öğelerini oluştur - cut_type mapping ile
      await prisma.cart_items.createMany({
        data: orderItems.map(item => {
          const mappedCutType = cutTypeMapping[item.cut_type?.toLowerCase() || 'standart'] || $Enums.cut_type_enum.rectangle;
          
          return {
            cart_id: tempCart.id,
            product_id: item.product_id,
            quantity: item.quantity,
            width: item.width,
            height: item.height,
            area_m2: item.area_m2,
            unit_price: item.unit_price,
            total_price: item.total_price,
            has_fringe: item.has_fringe,
            cut_type: mappedCutType,
            notes: item.notes
          };
        })
      });

      // Seçilen adresi al ve delivery_address'i ayarla
      let deliveryAddress: string | null = null;
      if (orderData.address_id) {
        deliveryAddress = await this.getDeliveryAddressFromId(orderData.address_id);
      }

      // Sipariş oluştur
      const order = await prisma.order.create({
        data: {
          user_id: orderData.user_id,
          cart_id: tempCart.id,
          total_price: orderTotal,
          status: OrderStatus.PENDING,
          address_id: orderData.address_id || null,
          
          // Adres sistemi artık store-based olarak değişti
          store_name: user.Store.kurum_adi,
          store_tax_number: user.Store.vergi_numarasi,
          store_tax_office: user.Store.vergi_dairesi,
          store_phone: user.Store.telefon,
          store_email: user.Store.eposta,
          store_fax: user.Store.faks_numarasi,
          
          items: {
            create: orderItems.map(item => ({
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
          cart: true,
          address: true
        }
      });

      // YENİ MANTIK: Admin siparişi oluşturulduğunda stok düşür
      try {
        await qrCodeService.reduceStockForOrder(order.id);
        console.log(`✅ Admin siparişi ${order.id} oluşturuldu ve stok düşürüldü`);
      } catch (stockError) {
        console.error('❌ Admin siparişi stok düşürme hatası:', stockError);
        // Stok hatası durumunda siparişi iptal et
        await prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELED }
        });
        return { success: false, message: 'Stok yetersizliği nedeniyle admin siparişi oluşturulamadı' };
      }

      // Admin siparişi için özel işlemler - AÇIK HESAP LİMİTİ KONTROLÜ YOK
      await this.processAdminOrderOperations(user, orderTotal);

      // Admin'e yeni sipariş bildirimi gönder
      try {
        const customerName = `${user.name} ${user.surname}`;
        await notificationService.notifyNewOrder(order.id, orderData.user_id, orderTotal, customerName);
        console.log('✅ Admin\'e yeni sipariş bildirimi gönderildi (Direct admin sipariş)');
      } catch (notificationError) {
        console.error('❌ Admin sipariş bildirim hatası (Direct admin sipariş):', notificationError);
        // Bildirim hatası ana işlemi etkilemesin
      }

      return { 
        success: true, 
        message: 'Admin siparişi başarıyla oluşturuldu', 
        order 
      };

    } catch (error) {
      console.error('Admin sipariş oluşturma hatası:', error);
      return { success: false, message: 'Admin siparişi oluşturulurken bir hata oluştu' };
    }
  }

  // Sipariş limitlerini kontrol et
  private async validateOrderLimits(user: any, orderTotal: number): Promise<OrderValidationResult> {
    const store = user.Store;
    
    console.log(`🔍 Limit kontrolü başlatılıyor:`)
    console.log(`  - Mağaza: ${store.kurum_adi}`)
    console.log(`  - Sipariş tutarı: ${orderTotal} TL`)
    console.log(`  - Açık hesap tutarı: ${store.acik_hesap_tutari} TL`)
    console.log(`  - Sınırsız açık hesap: ${store.limitsiz_acik_hesap}`)
    
    // Kullanıcıya ait fiyat listesi var mı kontrol et
    const userPriceList = store.StorePriceList.find((spl: any) => spl.PriceList);
    
    if (userPriceList && userPriceList.PriceList.limit_amount && !userPriceList.PriceList.is_default) {
      console.log(`📋 Fiyat listesi limiti kontrolü:`)
      console.log(`  - Fiyat listesi limiti: ${userPriceList.PriceList.limit_amount} TL`)
      console.log(`  - Mevcut sipariş tutarı: ${orderTotal} TL`)
      
      // Fiyat listesi limiti kontrol et - sadece mevcut sipariş tutarı
      if (orderTotal > Number(userPriceList.PriceList.limit_amount)) {
        console.log(`❌ Fiyat listesi limiti aşıldı!`)
        console.log(`  - Fiyat listesi limiti: ${userPriceList.PriceList.limit_amount} TL`)
        console.log(`  - Sipariş tutarı: ${orderTotal} TL`)
        console.log(`  - Aşan miktar: ${orderTotal - Number(userPriceList.PriceList.limit_amount)} TL`)
        return {
          isValid: false,
          message: 'PRICE_LIST_LIMIT_EXCEEDED',
          limitAmount: roundCurrency(userPriceList.PriceList.limit_amount),
          canProceed: false
        };
      }
      console.log(`✅ Fiyat listesi limiti uygun`)
    }

    // Mağaza açık hesap limiti kontrol et
    if (store.limitsiz_acik_hesap) {
      console.log(`✅ Sınırsız açık hesap - sipariş verilebilir`)
      return { isValid: true, canProceed: true };
    }

    // Bakiye + açık hesap limiti toplamı kontrolü
    const currentBalance = roundCurrency(store.bakiye || 0);
    const currentOpenAccountLimit = roundCurrency(store.acik_hesap_tutari || 0);
    const totalAvailableAmount = addCurrency(currentBalance, currentOpenAccountLimit);
    
    console.log(`💰 Bakiye + açık hesap limiti kontrolü:`)
    console.log(`  - Mevcut bakiye: ${currentBalance} TL`)
    console.log(`  - Açık hesap limiti: ${currentOpenAccountLimit} TL`)
    console.log(`  - Toplam kullanılabilir tutar: ${totalAvailableAmount} TL`)
    console.log(`  - Sipariş tutarı: ${orderTotal} TL`)
    
    if (orderTotal > totalAvailableAmount) {
      const minimumPayment = Math.ceil(orderTotal - totalAvailableAmount);
      console.log(`❌ Bakiye + açık hesap limiti yetersiz!`)
      console.log(`  - Yetersiz: ${minimumPayment} TL`)
      console.log(`  - Minimum ödeme tutarı: ${minimumPayment} TL`)
      return {
        isValid: false,
        message: 'BALANCE_INSUFFICIENT',
        limitAmount: totalAvailableAmount,
        minimumPayment: minimumPayment,
        canProceed: false
      };
    }

    console.log(`✅ Bakiye + açık hesap limiti yeterli`)
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
            cut_type: item.cut_type as any || 'standart',
            notes: item.notes
          });
        }
      }
    }

    return orderItems;
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
          cart: true,
          address: true
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
      
      // Önce kullanıcının mağaza bilgisini al
      const user = await prisma.user.findUnique({
        where: { userId },
        select: { store_id: true, userType: { select: { name: true } } }
      });

      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      let whereCondition: any;

      // Eğer kullanıcı bir mağazaya bağlıysa, o mağazadaki tüm siparişleri getir
      if (user.store_id) {
        // Mağazadaki tüm kullanıcıları bul
        const storeUsers = await prisma.user.findMany({
          where: { store_id: user.store_id },
          select: { userId: true }
        });

        const storeUserIds = storeUsers.map(u => u.userId);

        whereCondition = {
          user_id: {
            in: storeUserIds
          }
        };
      } else {
        // Kullanıcı mağazaya bağlı değilse sadece kendi siparişlerini getir
        whereCondition = {
          user_id: userId
        };
      }
      
      const orders = await prisma.order.findMany({
        where: whereCondition,
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
          user: {
            select: {
              name: true,
              surname: true,
              email: true,
              username: true
            }
          },
          address: true
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      });

      const totalCount = await prisma.order.count({
        where: whereCondition
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
      // 1. YENİ MANTIK: Sadece bakiyeden düş, açık hesap limiti değişmez
      // Bakiye + açık hesap limiti toplam kontrol zaten yapıldı, güvenle bakiyeden düşebiliriz
      if (!store.limitsiz_acik_hesap) {
        const currentBalance = Number(store.bakiye || 0);
        const currentOpenAccountLimit = Number(store.acik_hesap_tutari || 0);
        
        // Bakiyeden sipariş tutarını düş
        // Bakiye negatif olmayacak şekilde sınırla (en fazla açık hesap limiti kadar düşebilir)
        const newBalance = Math.max(currentBalance - orderTotal, -currentOpenAccountLimit);
        
        await prisma.store.update({
          where: { store_id: store.store_id },
          data: {
            bakiye: newBalance
            // açık hesap limiti değişmez
          }
        });

        console.log(`💰 Bakiye güncellendi:`)
        console.log(`  - Önceki bakiye: ${currentBalance} TL`)
        console.log(`  - Sipariş tutarı: ${orderTotal} TL`)
        console.log(`  - Yeni bakiye: ${newBalance} TL`)
        console.log(`  - Açık hesap limiti: ${currentOpenAccountLimit} TL (değişmez)`)
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

        // 3. Limit bittiğinde veya çok az kaldığında varsayılan fiyat listesine geç
        
        if (newLimit <= 0) {
          console.log(`📋 Fiyat listesi limiti tamamen bitti (${newLimit} TL) - Varsayılan fiyat listesine geçiliyor`);
          
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
            console.log(`✅ Varsayılan fiyat listesi atandı: ${defaultPriceList.name}`);
          }
        } else if (newLimit > 0 && newLimit <= PRICE_LIST_MINIMUM_THRESHOLD) {
          console.log(`📋 Fiyat listesi limiti çok az kaldı (${newLimit} TL) - Minimum eşik: ${PRICE_LIST_MINIMUM_THRESHOLD} TL`);
          console.log(`📋 Kalan limit çok düşük olduğu için varsayılan fiyat listesine geçiliyor`);
          
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
            console.log(`✅ Varsayılan fiyat listesi atandı: ${defaultPriceList.name}`);
          }
        } else {
          console.log(`📋 Fiyat listesi limiti güncellendi: ${currentLimit} TL -> ${newLimit} TL`);
        }
      }

    } catch (error) {
      console.error('Sipariş sonrası işlemler hatası:', error);
      // Bu hata sipariş oluşumunu engellemeyecek, sadece log tutulacak
    }
  }

  // Admin siparişi sonrası işlemler - Açık hesap limiti kontrolsüz
  private async processAdminOrderOperations(user: any, orderTotal: number): Promise<void> {
    const store = user.Store;
    
    try {
      console.log(`🔧 ADMİN SİPARİŞİ: Bakiye işlemleri başlatılıyor`)
      console.log(`  - Mağaza: ${store.kurum_adi}`)
      console.log(`  - Sipariş tutarı: ${orderTotal} TL`)
      console.log(`  - Mevcut bakiye: ${store.bakiye} TL`)
      console.log(`  - Açık hesap kontrolü: YAPILMAYACAK (Admin siparişi)`)
      
      // Admin siparişi - Açık hesap limiti kontrolü yapılmaz
      // Doğrudan bakiyeden düşülür
      const currentBalance = Number(store.bakiye || 0);
      const newBalance = currentBalance - orderTotal;
      
      await prisma.store.update({
        where: { store_id: store.store_id },
        data: {
          bakiye: newBalance
          // açık hesap limiti değişmez
        }
      });

      console.log(`💰 ADMİN SİPARİŞİ: Bakiye güncellendi`)
      console.log(`  - Önceki bakiye: ${currentBalance} TL`)
      console.log(`  - Sipariş tutarı: ${orderTotal} TL`)
      console.log(`  - Yeni bakiye: ${newBalance} TL`)
      console.log(`  - Açık hesap limiti: DEĞİŞMEDİ (Admin siparişi)`)

      // Fiyat listesi limitini güncelle (eğer varsa)
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

        console.log(`📋 ADMİN SİPARİŞİ: Fiyat listesi limiti güncellendi: ${currentLimit} TL -> ${newLimit} TL`);

        // Limit bittiğinde varsayılan fiyat listesine geç
        if (newLimit <= 0) {
          console.log(`📋 ADMİN SİPARİŞİ: Fiyat listesi limiti bitti - Varsayılan fiyat listesine geçiliyor`);
          
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
            console.log(`✅ ADMİN SİPARİŞİ: Varsayılan fiyat listesi atandı: ${defaultPriceList.name}`);
          }
        }
      }

    } catch (error) {
      console.error('Admin sipariş sonrası işlemler hatası:', error);
      // Bu hata sipariş oluşumunu engellemeyecek, sadece log tutulacak
    }
  }

  // Mağaza limitini artır (ödeme sonrası) - deliveryAddress tablosu şemada yok, kaldırıldı

  // Siparişi iptal et (kullanıcılar için PENDING, adminler için tüm durumlar)
  async cancelOrder(orderId: string, userId: string, reason?: string, isAdmin?: boolean): Promise<{
    success: boolean;
    message: string;
    statusCode?: number;
    order?: any;
  }> {
    try {
      // Siparişi bul
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
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
          },
          items: {
            include: {
              product: {
                include: {
                  productvariations: true
                }
              }
            }
          }
        }
      });

      if (!order) {
        return { 
          success: false, 
          message: 'Sipariş bulunamadı',
          statusCode: 404
        };
      }

      // Admin değilse, kullanıcı sadece kendi siparişini iptal edebilir
      if (!isAdmin && order.user_id !== userId) {
        return { 
          success: false, 
          message: 'Bu siparişi iptal etme yetkiniz yok',
          statusCode: 403
        };
      }

      // Admin değilse, sadece PENDING durumundaki siparişler iptal edilebilir
      if (!isAdmin && order.status !== 'PENDING') {
        return { 
          success: false, 
          message: `${order.status} durumundaki sipariş iptal edilemez. Sadece onay bekleyen (PENDING) siparişler iptal edilebilir.`,
          statusCode: 400
        };
      }

      // Admin ise tüm durumları iptal edebilir, ancak DELIVERED ve CANCELED olanları kontrol et
      if (isAdmin && order.status === 'CANCELED') {
        return { 
          success: false, 
          message: 'Bu sipariş zaten iptal edilmiş.',
          statusCode: 400
        };
      }

      if (isAdmin && order.status === 'DELIVERED') {
        return { 
          success: false, 
          message: 'Teslim edilmiş siparişler iptal edilemez.',
          statusCode: 400
        };
      }

      const orderTotal = Number(order.total_price);
      const store = order.user.Store;

      // Transaction içinde tüm işlemleri yap
      const result = await prisma.$transaction(async (tx) => {
        // 1. Siparişi iptal et
        const canceledOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELED',
            updated_at: new Date()
          }
        });

        // 2. Stokları geri yükle
        for (const item of order.items) {
          // Her item için stok varyasyonunu bul ve güncelle
          const variation = item.product.productvariations.find(v => 
            v.width === Number(item.width) && 
            v.height === Number(item.height) &&
            v.has_fringe === item.has_fringe &&
            v.cut_type_id === (item.cut_type ? parseInt(item.cut_type) : null)
          );

          if (variation) {
            const areaM2 = (Number(item.width) * Number(item.height)) / 10000;
            const totalAreaM2 = areaM2 * item.quantity;

            await tx.productvariations.update({
              where: { id: variation.id },
              data: {
                stock_quantity: variation.stock_quantity + item.quantity,
                stock_area_m2: Number(variation.stock_area_m2 || 0) + totalAreaM2
              }
            });

            console.log(`📦 Stok geri yüklendi: ${item.product.name} - ${item.quantity} adet, ${totalAreaM2.toFixed(2)} m²`);
          }
        }

        // 3. Bakiyeyi iade et
        if (store) {
          const currentBalance = Number(store.bakiye || 0);
          const newBalance = currentBalance + orderTotal;

          await tx.store.update({
            where: { store_id: store.store_id },
            data: {
              bakiye: newBalance
            }
          });

          console.log(`💰 Bakiye iade edildi:`);
          console.log(`  - Önceki bakiye: ${currentBalance} TL`);
          console.log(`  - İade tutarı: ${orderTotal} TL`);
          console.log(`  - Yeni bakiye: ${newBalance} TL`);

          // 4. Fiyat listesi limitini geri yükle (eğer varsa)
          const storePriceList = store.StorePriceList.find((spl: any) => spl.PriceList);
          if (storePriceList && storePriceList.PriceList.limit_amount !== null) {
            const currentLimit = Number(storePriceList.PriceList.limit_amount);
            const newLimit = currentLimit + orderTotal;

            await tx.priceList.update({
              where: { price_list_id: storePriceList.PriceList.price_list_id },
              data: {
                limit_amount: newLimit
              }
            });

            console.log(`📋 Fiyat listesi limiti geri yüklendi: ${currentLimit} TL -> ${newLimit} TL`);
          }
        }

        // 5. Muhasebe kaydı oluştur (iptal kaydı)
        if (store) {
          await tx.muhasebeHareketleri.create({
            data: {
              storeId: store.store_id,
              islemTuru: `Sipariş İptali - ${isAdmin ? 'Admin' : 'Müşteri'} İade`,
              tutar: orderTotal,
              harcama: false, // İade olduğu için gelir olarak kaydet
              tarih: new Date(),
              aciklama: `Sipariş #${orderId} ${isAdmin ? 'admin tarafından' : 'müşteri tarafından'} iptal edildi. ${reason ? `Sebep: ${reason}` : ''}`
            }
          });
        }

        // 6. Bildirim oluştur
        await notificationService.notifyOrderCanceled(
          orderId,
          userId,
          orderId.substring(0, 8),
          reason
        );

        return canceledOrder;
      });

      return {
        success: true,
        message: `Sipariş başarıyla iptal edildi. ${orderTotal.toFixed(2)} TL bakiyenize iade edildi.`,
        order: result
      };

    } catch (error: any) {
      console.error('Sipariş iptal hatası:', error);
      return {
        success: false,
        message: error.message || 'Sipariş iptal edilirken bir hata oluştu',
        statusCode: 500
      };
    }
  }

  // Sipariş fişi al (onaylanan ve teslim edilenler için)
  async getOrderReceipt(orderId: string, userId: string, isAdmin?: boolean): Promise<{
    success: boolean;
    message: string;
    statusCode?: number;
    receipt?: any;
  }> {
    try {
      // Siparişi detaylı bilgilerle al
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            include: {
              Store: true
            }
          },
          items: {
            include: {
              product: {
                include: {
                  collection: true
                }
              }
            }
          },
          address: true
        }
      });

      if (!order) {
        return { 
          success: false, 
          message: 'Sipariş bulunamadı',
          statusCode: 404
        };
      }

      // Admin değilse, kullanıcı sadece kendi siparişinin fişini alabilir
      if (!isAdmin && order.user_id !== userId) {
        return { 
          success: false, 
          message: 'Bu siparişin fişini alma yetkiniz yok',
          statusCode: 403
        };
      }

      // Admin değilse, sadece onaylanan veya teslim edilen siparişlerin fişi alınabilir
      if (!isAdmin && !['CONFIRMED', 'SHIPPED', 'DELIVERED', 'READY'].includes(order.status)) {
        return { 
          success: false, 
          message: `${order.status} durumundaki siparişin fişi alınamaz. Sadece onaylanmış veya teslim edilmiş siparişlerin fişi alınabilir.`,
          statusCode: 400
        };
      }

      const store = order.user.Store;
      const orderTotal = Number(order.total_price);

      // Sipariş öncesi bakiyeyi hesapla (mevcut bakiye + sipariş tutarı)
      const currentBalance = Number(store?.bakiye || 0);
      const previousBalance = currentBalance + orderTotal;

      // Muhasebe hareketlerinden sipariş tarihindeki bakiye bilgilerini al
      const muhasebeHareketi = await prisma.muhasebeHareketleri.findFirst({
        where: {
          storeId: store?.store_id,
          aciklama: {
            contains: orderId
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Fiş verilerini hazırla
      const receipt = {
        // Sipariş bilgileri
        siparis: {
          id: order.id,
          siparisNumarasi: order.id.substring(0, 8).toUpperCase(),
          durum: order.status,
          olusturmaTarihi: order.created_at,
          guncellemeTarihi: order.updated_at,
          toplamTutar: orderTotal
        },

        // Müşteri bilgileri
        musteri: {
          ad: order.user.name,
          soyad: order.user.surname,
          email: order.user.email,
          telefon: order.user.phoneNumber,
          adres: order.address ? `${order.address.title}: ${order.address.address}, ${order.address.district || ''} ${order.address.city || ''}`.trim() : null
        },

        // Mağaza bilgileri
        magaza: store ? {
          kurumAdi: store.kurum_adi,
          vergiNumarasi: store.vergi_numarasi,
          vergiDairesi: store.vergi_dairesi,
          yetkiliAdi: store.yetkili_adi,
          yetkiliSoyadi: store.yetkili_soyadi,
          telefon: store.telefon,
          eposta: store.eposta,
          adres: store.adres,
          faksNumarasi: store.faks_numarasi
        } : null,

        // Sipariş detayları
        urunler: order.items.map(item => ({
          urunAdi: item.product.name,
          aciklama: item.product.description,
          koleksiyon: {
            adi: item.product.collection.name,
            kodu: item.product.collection.code
          },
          miktar: item.quantity,
          birimFiyat: Number(item.unit_price),
          toplamFiyat: Number(item.total_price),
          olculer: {
            en: item.width ? Number(item.width) : null,
            boy: item.height ? Number(item.height) : null,
            alanM2: item.width && item.height ? (Number(item.width) * Number(item.height)) / 10000 : null
          },
          ozellikler: {
            sasakVar: item.has_fringe || false,
            kesimTipi: item.cut_type || null
          }
        })),

        // Bakiye bilgileri
        bakiye: {
          siparisOncesi: previousBalance,
          siparisSonrasi: currentBalance,
          siparisKesintisi: orderTotal,
          tarih: new Date()
        },

        // Özet bilgiler
        ozet: {
          toplamUrunSayisi: order.items.length,
          toplamMiktar: order.items.reduce((sum, item) => sum + item.quantity, 0),
          toplamAlanM2: order.items.reduce((sum, item) => {
            if (item.width && item.height) {
              const alanM2 = (Number(item.width) * Number(item.height)) / 10000;
              return sum + (alanM2 * item.quantity);
            }
            return sum;
          }, 0),
          toplamTutar: orderTotal
        },

        // Fiş bilgileri
        fis: {
          fisNumarasi: `${isAdmin ? 'ADM-' : ''}FIS-${order.id.substring(0, 8).toUpperCase()}`,
          olusturmaTarihi: new Date(),
          gecerlilikTarihi: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 yıl geçerli
          adminFisi: isAdmin || false
        }
      };

      return {
        success: true,
        message: 'Sipariş fişi başarıyla hazırlandı',
        receipt
      };

    } catch (error: any) {
      console.error('Sipariş fişi hazırlama hatası:', error);
      return {
        success: false,
        message: error.message || 'Sipariş fişi hazırlanırken bir hata oluştu',
        statusCode: 500
      };
    }
  }

}

export const orderService = new OrderService(); 