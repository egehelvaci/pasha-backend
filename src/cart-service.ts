import { PrismaClient, cut_type_enum } from '../generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { ProductService, CutType, SizeOption } from './product-service';

const prisma = new PrismaClient();
const productService = new ProductService();

export interface AddToCartRequest {
  userId: string;
  productId: string;
  quantity: number;
  width: number;
  height: number;
  hasFringe: boolean;
  cutType: 'rectangle' | 'round' | 'oval' | 'custom';
  notes?: string;
}

export interface UpdateCartItemRequest {
  cartItemId: number;
  quantity: number;
  width?: number;
  height?: number;
  hasFringe?: boolean;
  cutType?: 'rectangle' | 'round' | 'oval' | 'custom';
  notes?: string;
}

export class CartService {
  
  // Kullanıcının aktif sepetini getir veya oluştur
  async getOrCreateCart(userId: string) {
    let cart = await prisma.carts.findFirst({
      where: {
        user_id: userId,
        is_active: true
      }
    });

    if (!cart) {
      cart = await prisma.carts.create({
        data: {
          user_id: userId,
          is_active: true
        }
      });
    }

    return cart;
  }

  // Sepete ürün ekleme
  async addToCart(data: AddToCartRequest) {
    try {
      // Ürün detay API'sinden ürün bilgilerini al
      const productDetails = await productService.getProductById(data.productId, data.userId);

      if (!productDetails) {
        throw new Error('Ürün bulunamadı');
      }

      // Saçak kontrolü
      if (!productDetails.canHaveFringe && data.hasFringe) {
        throw new Error('Bu ürün saçaklı olamaz');
      }

      // Boyut seçeneklerini kontrol et
      if (!productDetails.sizeOptions || productDetails.sizeOptions.length === 0) {
        throw new Error('Bu ürün için boyut seçenekleri tanımlanmamış');
      }

      // Boyut kontrolü - sizeOptions'dan kontrol et
      const sizeOption = productDetails.sizeOptions.find(option => 
        option.width === data.width && 
        (option.is_optional_height || option.height === data.height)
      );

      if (!sizeOption) {
        const availableSizes = productDetails.sizeOptions.map(s => 
          `${s.width}cm${s.is_optional_height ? ` (max height: ${s.height}cm)` : `x${s.height}cm`}`
        ).join(', ');
        throw new Error(`Seçilen boyut (${data.width}x${data.height}cm) bu ürün için geçerli değil. Mevcut boyutlar: ${availableSizes}`);
      }

      // Height kontrolü - eğer optional değilse exact match olmalı
      if (!sizeOption.is_optional_height && sizeOption.height !== data.height) {
        throw new Error(`Bu boyut için yükseklik ${sizeOption.height}cm olarak sabitdir`);
      }

      // Optional height ise maximum değeri aşmamalı
      if (sizeOption.is_optional_height && data.height > sizeOption.height) {
        throw new Error(`Maksimum yükseklik ${sizeOption.height}cm'dir`);
      }

      // Cut type kontrolü ve mapping
      const validCutTypes = productDetails.cutTypes?.map(ct => ct.name.toLowerCase()) || [];
      const requestedCutType = data.cutType.toLowerCase();
      
      // cutType mapping - API'den gelen değerleri enum değerlerine çevir
      const cutTypeMapping: { [key: string]: cut_type_enum } = {
        'standart': cut_type_enum.rectangle,
        'dikdörtgen': cut_type_enum.rectangle, 
        'rectangle': cut_type_enum.rectangle,
        'daire': cut_type_enum.round,
        'round': cut_type_enum.round,
        'circle': cut_type_enum.round,
        'oval': cut_type_enum.oval,
        'custom': cut_type_enum.custom,
        'özel': cut_type_enum.custom,
        'post': cut_type_enum.custom
      };

      // İlk önce gelen değeri mapping'den kontrol et
      const mappedCutType = cutTypeMapping[requestedCutType];
      if (!mappedCutType) {
        throw new Error(`Geçersiz kesim türü: ${data.cutType}. Geçerli değerler: rectangle, round, oval, custom, standart, daire`);
      }

      // API'deki cutTypes'tan validasyon yap ama enum değerini kullan
      const isValidCutType = validCutTypes.some(apiCutType => {
        const apiMapped = cutTypeMapping[apiCutType];
        return apiMapped === mappedCutType;
      });

      if (!isValidCutType) {
        const availableCutTypes = productDetails.cutTypes?.map(ct => ct.name).join(', ') || 'Tanımsız';
        throw new Error(`Seçilen kesim türü (${data.cutType}) bu ürün için geçerli değil. Mevcut kesim türleri: ${availableCutTypes}`);
      }

      // Stok kontrolü - sizeOptions'daki stockQuantity'den
      const availableStock = sizeOption.stockQuantity || 0;

      if (availableStock === 0) {
        throw new Error(`Seçilen boyut (${data.width}x${data.height}cm) için stok bulunmuyor`);
      }

      if (availableStock < data.quantity) {
        throw new Error(`Yeterli stok yok. Seçilen boyut (${data.width}x${data.height}cm) için mevcut stok: ${availableStock}`);
      }

      // Fiyat hesaplama
      const areaM2 = (data.width * data.height) / 10000; // cm²'den m²'ye çevirme
      const unitPrice = new Decimal(productDetails.pricing?.price || 0);
      const totalPrice = new Decimal(data.quantity).mul(new Decimal(areaM2)).mul(unitPrice);

      // Kullanıcının sepetini getir veya oluştur
      const cart = await this.getOrCreateCart(data.userId);

      // Aynı ürün, boyut ve özelliklerle sepette var mı kontrol et
      const existingItem = await prisma.cart_items.findFirst({
        where: {
          cart_id: cart.id,
          product_id: data.productId,
          width: new Decimal(data.width),
          height: new Decimal(data.height),
          has_fringe: data.hasFringe,
          cut_type: mappedCutType
        }
      });

      if (existingItem) {
        // Mevcut öğeyi güncelle - toplam miktar stok kontrolü
        const newQuantity = existingItem.quantity + data.quantity;
        
        if (newQuantity > availableStock) {
          throw new Error(`Toplam miktar stok miktarını aşıyor. Sepette zaten ${existingItem.quantity} adet var. Maksimum eklenebilir: ${availableStock - existingItem.quantity}`);
        }

        const newTotalPrice = new Decimal(newQuantity).mul(new Decimal(areaM2)).mul(unitPrice);

        return await prisma.cart_items.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            total_price: newTotalPrice,
            notes: data.notes || existingItem.notes
          },
          include: {
            Product: true,
            carts: true
          }
        });
      } else {
        // Yeni öğe ekle
        return await prisma.cart_items.create({
          data: {
            cart_id: cart.id,
            product_id: data.productId,
            quantity: data.quantity,
            width: new Decimal(data.width),
            height: new Decimal(data.height),
            area_m2: new Decimal(areaM2),
            unit_price: unitPrice,
            total_price: totalPrice,
            has_fringe: data.hasFringe,
            cut_type: mappedCutType,
            notes: data.notes
          },
          include: {
            Product: true,
            carts: true
          }
        });
      }
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      throw error;
    }
  }

  // Sepet öğesini güncelle
  async updateCartItem(data: UpdateCartItemRequest) {
    try {
      const cartItem = await prisma.cart_items.findUnique({
        where: { id: data.cartItemId },
        include: {
          Product: true,
          carts: true
        }
      });

      if (!cartItem) {
        throw new Error('Sepet öğesi bulunamadı');
      }

      // Güncellenecek boyutlar
      const width = data.width || cartItem.width.toNumber();
      const height = data.height || cartItem.height.toNumber();
      const hasFringe = data.hasFringe ?? cartItem.has_fringe ?? false;

      // Ürün detaylarını al (user_id için cart'tan al)
      const productDetails = await productService.getProductById(cartItem.product_id, cartItem.carts.user_id);

      if (!productDetails) {
        throw new Error('Ürün detayları alınamadı');
      }

      // Boyut kontrolü - eğer boyut değiştiriliyorsa
      if (data.width || data.height) {
        const sizeOption = productDetails.sizeOptions?.find(option => 
          option.width === width && 
          (option.is_optional_height || option.height === height)
        );

        if (!sizeOption) {
          const availableSizes = productDetails.sizeOptions?.map(s => 
            `${s.width}cm${s.is_optional_height ? ` (max height: ${s.height}cm)` : `x${s.height}cm`}`
          ).join(', ') || 'Tanımsız';
          throw new Error(`Seçilen boyut (${width}x${height}cm) bu ürün için geçerli değil. Mevcut boyutlar: ${availableSizes}`);
        }

        // Height kontrolü
        if (!sizeOption.is_optional_height && sizeOption.height !== height) {
          throw new Error(`Bu boyut için yükseklik ${sizeOption.height}cm olarak sabitdir`);
        }

        if (sizeOption.is_optional_height && height > sizeOption.height) {
          throw new Error(`Maksimum yükseklik ${sizeOption.height}cm'dir`);
        }

        // Stok kontrolü
        const availableStock = sizeOption.stockQuantity || 0;
        if (availableStock < data.quantity) {
          throw new Error(`Yeterli stok yok. Seçilen boyut (${width}x${height}cm) için mevcut stok: ${availableStock}`);
        }
      }

      // Saçak kontrolü
      if (data.hasFringe !== undefined && !productDetails.canHaveFringe && hasFringe) {
        throw new Error('Bu ürün saçaklı olamaz');
      }

      // Cut type kontrolü
      if (data.cutType) {
        const validCutTypes = productDetails.cutTypes?.map(ct => ct.name.toLowerCase()) || [];
        const requestedCutType = data.cutType.toLowerCase();
        
        const cutTypeMapping: { [key: string]: cut_type_enum } = {
          'standart': cut_type_enum.rectangle,
          'dikdörtgen': cut_type_enum.rectangle, 
          'rectangle': cut_type_enum.rectangle,
          'daire': cut_type_enum.round,
          'round': cut_type_enum.round,
          'circle': cut_type_enum.round,
          'oval': cut_type_enum.oval,
          'custom': cut_type_enum.custom,
          'özel': cut_type_enum.custom,
          'post': cut_type_enum.custom
        };

        // İlk önce gelen değeri mapping'den kontrol et
        const mappedCutType = cutTypeMapping[requestedCutType];
        if (!mappedCutType) {
          throw new Error(`Geçersiz kesim türü: ${data.cutType}. Geçerli değerler: rectangle, round, oval, custom, standart, daire`);
        }

        // API'deki cutTypes'tan validasyon yap ama enum değerini kullan
        const isValidCutType = validCutTypes.some(apiCutType => {
          const apiMapped = cutTypeMapping[apiCutType];
          return apiMapped === mappedCutType;
        });

        if (!isValidCutType) {
          const availableCutTypes = productDetails.cutTypes?.map(ct => ct.name).join(', ') || 'Tanımsız';
          throw new Error(`Seçilen kesim türü (${data.cutType}) bu ürün için geçerli değil. Mevcut kesim türleri: ${availableCutTypes}`);
        }
      }

      // Fiyat yeniden hesaplama
      const areaM2 = (width * height) / 10000;
      const unitPrice = new Decimal(productDetails.pricing?.price || 0);
      const totalPrice = new Decimal(data.quantity).mul(new Decimal(areaM2)).mul(unitPrice);

      // Cut type mapping için
      let finalCutType: cut_type_enum | undefined = undefined;
      if (data.cutType) {
        const cutTypeMapping: { [key: string]: cut_type_enum } = {
          'standart': cut_type_enum.rectangle,
          'dikdörtgen': cut_type_enum.rectangle, 
          'rectangle': cut_type_enum.rectangle,
          'daire': cut_type_enum.round,
          'round': cut_type_enum.round,
          'circle': cut_type_enum.round,
          'oval': cut_type_enum.oval,
          'custom': cut_type_enum.custom,
          'özel': cut_type_enum.custom,
          'post': cut_type_enum.custom
        };
        finalCutType = cutTypeMapping[data.cutType.toLowerCase()];
      }

      return await prisma.cart_items.update({
        where: { id: data.cartItemId },
        data: {
          quantity: data.quantity,
          width: data.width ? new Decimal(data.width) : undefined,
          height: data.height ? new Decimal(data.height) : undefined,
          area_m2: new Decimal(areaM2),
          unit_price: unitPrice,
          total_price: totalPrice,
          has_fringe: data.hasFringe ?? undefined,
          cut_type: finalCutType,
          notes: data.notes !== undefined ? data.notes : undefined
        },
        include: {
          Product: true
        }
      });
    } catch (error) {
      console.error('Sepet öğesi güncelleme hatası:', error);
      throw error;
    }
  }

  // Kullanıcının sepetini getir
  async getCart(userId: string) {
    try {
      const cart = await prisma.carts.findFirst({
        where: {
          user_id: userId,
          is_active: true
        },
        include: {
          cart_items: {
            orderBy: {
              created_at: 'desc'
            }
          }
        }
      });

      if (!cart) {
        return {
          id: null,
          items: [],
          totalItems: 0,
          totalPrice: new Decimal(0)
        };
      }

      // Her sepet öğesi için sadeleştirilmiş ürün bilgilerini al
      const enhancedItems = await Promise.all(
        cart.cart_items.map(async (item) => {
          try {
            // Ürün detaylarını getProductById API'sinden al
            const productDetails = await productService.getProductById(item.product_id, userId);
            
            return {
              id: item.id,
              productId: item.product_id,
              quantity: item.quantity,
              width: item.width,
              height: item.height,
              area_m2: item.area_m2,
              unit_price: item.unit_price,
              total_price: item.total_price,
              has_fringe: item.has_fringe,
              cut_type: item.cut_type,
              notes: item.notes,
              created_at: item.created_at,
              updated_at: item.updated_at,
              // Sadeleştirilmiş ürün bilgileri
              product: productDetails ? {
                productId: productDetails.productId,
                name: productDetails.name,
                description: productDetails.description,
                productImage: productDetails.productImage,
                collection: {
                  collectionId: productDetails.collection?.collectionId,
                  name: productDetails.collection?.name,
                  code: productDetails.collection?.code
                },
                pricing: {
                  price: productDetails.pricing?.price,
                  currency: productDetails.pricing?.currency
                }
              } : null
            };
          } catch (error) {
            console.error(`Ürün detayları alınırken hata (${item.product_id}):`, error);
            // Hata durumunda null döndür
            return {
              id: item.id,
              productId: item.product_id,
              quantity: item.quantity,
              width: item.width,
              height: item.height,
              area_m2: item.area_m2,
              unit_price: item.unit_price,
              total_price: item.total_price,
              has_fringe: item.has_fringe,
              cut_type: item.cut_type,
              notes: item.notes,
              created_at: item.created_at,
              updated_at: item.updated_at,
              product: null
            };
          }
        })
      );

      const totalItems = enhancedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = enhancedItems.reduce((sum, item) => sum.add(item.total_price), new Decimal(0));

      return {
        id: cart.id,
        items: enhancedItems,
        totalItems,
        totalPrice,
        createdAt: cart.created_at,
        updatedAt: cart.updated_at
      };
    } catch (error) {
      console.error('Sepet getirme hatası:', error);
      throw error;
    }
  }

  // Sepetten ürün çıkar
  async removeFromCart(cartItemId: number, userId: string) {
    try {
      // Önce öğenin kullanıcıya ait olduğunu kontrol et
      const cartItem = await prisma.cart_items.findFirst({
        where: {
          id: cartItemId,
          carts: {
            user_id: userId,
            is_active: true
          }
        }
      });

      if (!cartItem) {
        throw new Error('Sepet öğesi bulunamadı veya size ait değil');
      }

      await prisma.cart_items.delete({
        where: { id: cartItemId }
      });

      return { success: true, message: 'Ürün sepetten çıkarıldı' };
    } catch (error) {
      console.error('Sepetten çıkarma hatası:', error);
      throw error;
    }
  }

  // Sepeti temizle
  async clearCart(userId: string) {
    try {
      const cart = await prisma.carts.findFirst({
        where: {
          user_id: userId,
          is_active: true
        }
      });

      if (!cart) {
        throw new Error('Aktif sepet bulunamadı');
      }

      await prisma.cart_items.deleteMany({
        where: { cart_id: cart.id }
      });

      return { success: true, message: 'Sepet temizlendi' };
    } catch (error) {
      console.error('Sepet temizleme hatası:', error);
      throw error;
    }
  }

  // Sepeti sil (deaktif et)
  async deleteCart(userId: string) {
    try {
      const cart = await prisma.carts.findFirst({
        where: {
          user_id: userId,
          is_active: true
        }
      });

      if (!cart) {
        throw new Error('Aktif sepet bulunamadı');
      }

      // Önce sepet öğelerini sil
      await prisma.cart_items.deleteMany({
        where: { cart_id: cart.id }
      });

      // Sonra sepeti deaktif et
      await prisma.carts.update({
        where: { id: cart.id },
        data: { is_active: false }
      });

      return { success: true, message: 'Sepet silindi' };
    } catch (error) {
      console.error('Sepet silme hatası:', error);
      throw error;
    }
  }

  // Eski sepetleri temizle (cron job için)
  async cleanOldCarts() {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const oldCarts = await prisma.carts.findMany({
        where: {
          updated_at: {
            lt: threeDaysAgo
          },
          is_active: true
        }
      });

      // Eski sepetlerdeki öğeleri sil
      for (const cart of oldCarts) {
        await prisma.cart_items.deleteMany({
          where: { cart_id: cart.id }
        });
      }

      // Eski sepetleri sil
      const deletedCount = await prisma.carts.deleteMany({
        where: {
          updated_at: {
            lt: threeDaysAgo
          },
          is_active: true
        }
      });

      return { 
        success: true, 
        message: `${deletedCount.count} eski sepet temizlendi`,
        deletedCount: deletedCount.count 
      };
    } catch (error) {
      console.error('Eski sepetleri temizleme hatası:', error);
      throw error;
    }
  }
} 