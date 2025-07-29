import { Prisma, $Enums } from '../generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { ProductService, CutType, SizeOption } from './product-service';
import { TebiService } from './utils/tebi-service';
import prisma from './utils/prisma';

const productService = new ProductService();

export interface AddToCartRequest {
  userId: string;
  productId: string;
  quantity: number;
  width: number;
  height: number;
  hasFringe: boolean;
  cutType: 'standart' | 'round' | 'oval' | 'custom';
  notes?: string;
}

export interface UpdateCartItemRequest {
  cartItemId: number;
  quantity: number;
  width?: number;
  height?: number;
  hasFringe?: boolean;
  cutType?: 'standart' | 'round' | 'oval' | 'custom';
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

  // Admin için kullanıcı sepeti oluştur/getir
  async getOrCreateAdminCart(targetUserId: string, adminUserId: string, storeId: string) {
    console.log(`Admin (${adminUserId}) kullanıcı (${targetUserId}) için admin sepet oluşturuyor/getiriyor`);
    
    let adminCart = await prisma.admin_carts.findFirst({
      where: {
        target_user_id: targetUserId,
        admin_user_id: adminUserId,
        store_id: storeId,
        is_active: true
      }
    });

    if (!adminCart) {
      adminCart = await prisma.admin_carts.create({
        data: {
          target_user_id: targetUserId,
          admin_user_id: adminUserId,
          store_id: storeId,
          is_active: true
        }
      });
      console.log(`Yeni admin sepet oluşturuldu: ${adminCart.id}`);
    }

    return adminCart;
  }

  // Admin için kullanıcı sepetine ürün ekleme (yeni admin_cart_items tablosu kullanarak)
  async addToAdminCart(data: AddToCartRequest & { targetUserId: string; adminUserId: string; storeId: string }) {
    try {
      console.log(`Admin (${data.adminUserId}) kullanıcı (${data.targetUserId}) için admin sepete ürün ekliyor`);
      
      // Ürün detay API'sini hedef kullanıcı ID'si ile çağır
      const productDetails = await productService.getProductById(data.productId, data.targetUserId);

      if (!productDetails) {
        throw new Error('Ürün bulunamadı');
      }

      // Aynı validasyon kontrollerini yap
      if (!productDetails.canHaveFringe && data.hasFringe) {
        throw new Error('Bu ürün saçaklı olamaz');
      }

      if (!productDetails.sizeOptions || productDetails.sizeOptions.length === 0) {
        throw new Error('Bu ürün için boyut seçenekleri tanımlanmamış');
      }

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

      if (!sizeOption.is_optional_height && sizeOption.height !== data.height) {
        throw new Error(`Bu boyut için yükseklik ${sizeOption.height}cm olarak sabitdir`);
      }

      if (sizeOption.is_optional_height && data.height > sizeOption.height) {
        throw new Error(`Maksimum yükseklik ${sizeOption.height}cm'dir`);
      }

      // Cut type kontrolü ve mapping
      const validCutTypes = productDetails.cutTypes?.map(ct => ct.name.toLowerCase()) || [];
      const requestedCutType = data.cutType.toLowerCase();
      
      const cutTypeMapping: { [key: string]: $Enums.cut_type_enum } = {
        'standart': $Enums.cut_type_enum.rectangle,
        'dikdörtgen': $Enums.cut_type_enum.rectangle, 
        'rectangle': $Enums.cut_type_enum.rectangle,
        'daire': $Enums.cut_type_enum.round,
        'round': $Enums.cut_type_enum.round,
        'circle': $Enums.cut_type_enum.round,
        'oval': $Enums.cut_type_enum.oval,
        'custom': $Enums.cut_type_enum.custom,
        'özel': $Enums.cut_type_enum.custom,
        'post': $Enums.cut_type_enum.custom,
        'post kesim': $Enums.cut_type_enum.custom
      };

      const mappedCutType = cutTypeMapping[requestedCutType];
      if (!mappedCutType) {
        throw new Error(`Geçersiz kesim türü: ${data.cutType}. Geçerli değerler: standart, round, oval, custom, daire`);
      }

      const isValidCutType = validCutTypes.some(apiCutType => {
        const apiMapped = cutTypeMapping[apiCutType];
        return apiMapped === mappedCutType;
      });

      if (!isValidCutType) {
        const availableCutTypes = productDetails.cutTypes?.map(ct => ct.name).join(', ') || 'Tanımsız';
        throw new Error(`Seçilen kesim türü (${data.cutType}) bu ürün için geçerli değil. Mevcut kesim türleri: ${availableCutTypes}`);
      }

      // Stok kontrolü
      const availableStock = sizeOption.stockQuantity || 0;
      const availableAreaM2 = sizeOption.stockAreaM2 || 0;
      
      if (sizeOption.is_optional_height) {
        const actualPieceAreaM2 = (data.width * data.height) / 10000;
        const requestedAreaM2 = data.quantity * actualPieceAreaM2;

        if (availableAreaM2 <= 0) {
          throw new Error(`Seçilen boyut (${data.width}x${data.height}cm) için stok bulunmuyor`);
        }

        const maxQuantityFromArea = Math.floor(availableAreaM2 / actualPieceAreaM2);
        if (data.quantity > maxQuantityFromArea) {
          throw new Error(`Yeterli stok yok. Seçilen boyut (${data.width}x${data.height}cm) için maksimum sipariş: ${maxQuantityFromArea} adet (Mevcut: ${availableAreaM2}m²)`);
        }
      } else {
        if (availableStock <= 0) {
          throw new Error(`Seçilen boyut (${data.width}x${data.height}cm) için stok bulunmuyor`);
        }

        if (data.quantity > availableStock) {
          throw new Error(`Yeterli stok yok. Seçilen boyut (${data.width}x${data.height}cm) için maksimum sipariş: ${availableStock} adet`);
        }
      }

      // Fiyat hesaplama
      const areaM2 = (data.width * data.height) / 10000;
      const unitPrice = new Decimal(productDetails.pricing?.price || 0);
      const totalPrice = new Decimal(data.quantity).mul(new Decimal(areaM2)).mul(unitPrice);

      // Admin sepetini getir veya oluştur
      const adminCart = await this.getOrCreateAdminCart(data.targetUserId, data.adminUserId, data.storeId);

      // Aynı ürün, boyut ve özelliklerle admin sepette var mı kontrol et
      const existingItem = await prisma.admin_cart_items.findFirst({
        where: {
          admin_cart_id: adminCart.id,
          product_id: data.productId,
          width: new Decimal(data.width),
          height: new Decimal(data.height),
          has_fringe: data.hasFringe,
          cut_type: mappedCutType
        }
      });

      if (existingItem) {
        // Mevcut öğeyi güncelle
        const newQuantity = existingItem.quantity + data.quantity;
        
        if (newQuantity > availableStock) {
          throw new Error(`Toplam miktar stok miktarını aşıyor. Admin sepette zaten ${existingItem.quantity} adet var. Maksimum eklenebilir: ${availableStock - existingItem.quantity}`);
        }

        const newTotalPrice = new Decimal(newQuantity).mul(new Decimal(areaM2)).mul(unitPrice);

        return await prisma.admin_cart_items.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            total_price: newTotalPrice,
            notes: data.notes || existingItem.notes
          },
          include: {
            Product: true,
            admin_carts: {
              include: {
                AdminUser: true,
                TargetUser: true,
                Store: true
              }
            }
          }
        });
      } else {
        // Yeni öğe ekle
        return await prisma.admin_cart_items.create({
          data: {
            admin_cart_id: adminCart.id,
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
            admin_carts: {
              include: {
                AdminUser: true,
                TargetUser: true,
                Store: true
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Admin sepete ekleme hatası:', error);
      throw error;
    }
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
      const cutTypeMapping: { [key: string]: $Enums.cut_type_enum } = {
        'standart': $Enums.cut_type_enum.rectangle,
        'dikdörtgen': $Enums.cut_type_enum.rectangle, 
        'rectangle': $Enums.cut_type_enum.rectangle,
        'daire': $Enums.cut_type_enum.round,
        'round': $Enums.cut_type_enum.round,
        'circle': $Enums.cut_type_enum.round,
        'oval': $Enums.cut_type_enum.oval,
        'custom': $Enums.cut_type_enum.custom,
        'özel': $Enums.cut_type_enum.custom,
        'post': $Enums.cut_type_enum.custom,
        'post kesim': $Enums.cut_type_enum.custom
      };

              // İlk önce gelen değeri mapping'den kontrol et
        const mappedCutType = cutTypeMapping[requestedCutType];
        if (!mappedCutType) {
          throw new Error(`Geçersiz kesim türü: ${data.cutType}. Geçerli değerler: standart, round, oval, custom, daire`);
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

      // Stok kontrolü - opsiyonel yükseklik vs hazır kesim
      const availableStock = sizeOption.stockQuantity || 0;
      const availableAreaM2 = sizeOption.stockAreaM2 || 0;
      
      if (sizeOption.is_optional_height) {
        // Opsiyonel yükseklik: Sadece m² bazlı kontrol
        const actualPieceAreaM2 = (data.width * data.height) / 10000;
        const requestedAreaM2 = data.quantity * actualPieceAreaM2;

        if (availableAreaM2 <= 0) {
          throw new Error(`Seçilen boyut (${data.width}x${data.height}cm) için stok bulunmuyor`);
        }

        const maxQuantityFromArea = Math.floor(availableAreaM2 / actualPieceAreaM2);
        if (data.quantity > maxQuantityFromArea) {
          throw new Error(`Yeterli stok yok. Seçilen boyut (${data.width}x${data.height}cm) için maksimum sipariş: ${maxQuantityFromArea} adet (Mevcut: ${availableAreaM2}m²)`);
        }
      } else {
        // Hazır kesim: Sadece adet bazlı kontrol
        if (availableStock <= 0) {
          throw new Error(`Seçilen boyut (${data.width}x${data.height}cm) için stok bulunmuyor`);
        }

        if (data.quantity > availableStock) {
          throw new Error(`Yeterli stok yok. Seçilen boyut (${data.width}x${data.height}cm) için maksimum sipariş: ${availableStock} adet`);
        }
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
      let sizeOption;
      if (data.width || data.height) {
        sizeOption = productDetails.sizeOptions?.find(option => 
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
      } else {
        // Boyut değişikliği yoksa mevcut boyut için size option'ı bul
        sizeOption = productDetails.sizeOptions?.find(option => 
          option.width === width && 
          (option.is_optional_height || option.height === height)
        );
      }

      // Stok kontrolü - opsiyonel yükseklik vs hazır kesim
      if (sizeOption) {
        const availableStock = sizeOption.stockQuantity || 0;
        const availableAreaM2 = sizeOption.stockAreaM2 || 0;
        
        if (sizeOption.is_optional_height) {
          // Opsiyonel yükseklik: Sadece m² bazlı kontrol
          const actualPieceAreaM2 = (width * height) / 10000;
          const requestedAreaM2 = data.quantity * actualPieceAreaM2;

          if (availableAreaM2 <= 0) {
            throw new Error(`Seçilen boyut (${width}x${height}cm) için stok bulunmuyor`);
          }

          const maxQuantityFromArea = Math.floor(availableAreaM2 / actualPieceAreaM2);
          if (data.quantity > maxQuantityFromArea) {
            throw new Error(`Yeterli stok yok. Seçilen boyut (${width}x${height}cm) için maksimum sipariş: ${maxQuantityFromArea} adet (Mevcut: ${availableAreaM2}m²)`);
          }
        } else {
          // Hazır kesim: Sadece adet bazlı kontrol
          if (availableStock <= 0) {
            throw new Error(`Seçilen boyut (${width}x${height}cm) için stok bulunmuyor`);
          }

          if (data.quantity > availableStock) {
            throw new Error(`Yeterli stok yok. Seçilen boyut (${width}x${height}cm) için maksimum sipariş: ${availableStock} adet`);
          }
        }
      } else {
        // Size option bulunamazsa hata ver
        throw new Error(`Bu boyut (${width}x${height}cm) için stok bilgisi bulunamadı`);
      }

      // Saçak kontrolü
      if (data.hasFringe !== undefined && !productDetails.canHaveFringe && hasFringe) {
        throw new Error('Bu ürün saçaklı olamaz');
      }

      // Cut type kontrolü
      if (data.cutType) {
        const validCutTypes = productDetails.cutTypes?.map(ct => ct.name.toLowerCase()) || [];
        const requestedCutType = data.cutType.toLowerCase();
        
        const cutTypeMapping: { [key: string]: $Enums.cut_type_enum } = {
          'standart': $Enums.cut_type_enum.rectangle,
          'dikdörtgen': $Enums.cut_type_enum.rectangle, 
          'rectangle': $Enums.cut_type_enum.rectangle,
          'daire': $Enums.cut_type_enum.round,
          'round': $Enums.cut_type_enum.round,
          'circle': $Enums.cut_type_enum.round,
          'oval': $Enums.cut_type_enum.oval,
          'custom': $Enums.cut_type_enum.custom,
          'özel': $Enums.cut_type_enum.custom,
          'post': $Enums.cut_type_enum.custom,
          'post kesim': $Enums.cut_type_enum.custom
        };

        // İlk önce gelen değeri mapping'den kontrol et
        const mappedCutType = cutTypeMapping[requestedCutType];
        if (!mappedCutType) {
          throw new Error(`Geçersiz kesim türü: ${data.cutType}. Geçerli değerler: standart, round, oval, custom, daire`);
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
      let finalCutType: $Enums.cut_type_enum | undefined = undefined;
      if (data.cutType) {
        const cutTypeMapping: { [key: string]: $Enums.cut_type_enum } = {
          'standart': $Enums.cut_type_enum.rectangle,
          'dikdörtgen': $Enums.cut_type_enum.rectangle, 
          'rectangle': $Enums.cut_type_enum.rectangle,
          'daire': $Enums.cut_type_enum.round,
          'round': $Enums.cut_type_enum.round,
          'circle': $Enums.cut_type_enum.round,
          'oval': $Enums.cut_type_enum.oval,
          'custom': $Enums.cut_type_enum.custom,
          'özel': $Enums.cut_type_enum.custom,
          'post': $Enums.cut_type_enum.custom,
          'post kesim': $Enums.cut_type_enum.custom
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
              cut_type: item.cut_type === 'rectangle' ? 'standart' : item.cut_type,
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
              cut_type: item.cut_type === 'rectangle' ? 'standart' : item.cut_type,
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



  // Admin için kullanıcı admin sepetini getirme
  async getAdminCart(targetUserId: string, adminUserId: string, storeId: string) {
    try {
      console.log(`Admin (${adminUserId}) kullanıcı (${targetUserId}) admin sepetini getiriyor`);
      
      const adminCart = await prisma.admin_carts.findFirst({
        where: {
          target_user_id: targetUserId,
          admin_user_id: adminUserId,
          store_id: storeId,
          is_active: true
        },
        include: {
          admin_cart_items: {
            orderBy: {
              created_at: 'desc'
            }
          },
          AdminUser: true,
          TargetUser: true,
          Store: true
        }
      });

      if (!adminCart) {
        return {
          id: null,
          targetUserId: targetUserId,
          adminUserId: adminUserId,
          storeId: storeId,
          items: [],
          totalItems: 0,
          totalPrice: new Decimal(0)
        };
      }

      // Her sepet öğesi için ürün bilgilerini al
      const enhancedItems = await Promise.all(
        adminCart.admin_cart_items.map(async (item) => {
          try {
            const productDetails = await productService.getProductById(item.product_id, targetUserId);
            
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
              cut_type: item.cut_type === 'rectangle' ? 'standart' : item.cut_type,
              notes: item.notes,
              created_at: item.created_at,
              updated_at: item.updated_at,
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
              cut_type: item.cut_type === 'rectangle' ? 'standart' : item.cut_type,
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
        id: adminCart.id,
        targetUserId: targetUserId,
        adminUserId: adminUserId,
        storeId: storeId,
        items: enhancedItems,
        totalItems,
        totalPrice,
        adminUser: {
          userId: adminCart.AdminUser.userId,
          name: adminCart.AdminUser.name,
          surname: adminCart.AdminUser.surname
        },
        targetUser: {
          userId: adminCart.TargetUser.userId,
          name: adminCart.TargetUser.name,
          surname: adminCart.TargetUser.surname
        },
        store: {
          store_id: adminCart.Store.store_id,
          kurum_adi: adminCart.Store.kurum_adi
        },
        notes: adminCart.notes,
        createdAt: adminCart.created_at,
        updatedAt: adminCart.updated_at
      };
    } catch (error) {
      console.error('Admin sepet getirme hatası:', error);
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

  // Admin sepeti temizle
  async clearAdminCart(targetUserId: string, adminUserId: string, storeId: string) {
    try {
      const adminCart = await prisma.admin_carts.findFirst({
        where: {
          target_user_id: targetUserId,
          admin_user_id: adminUserId,
          store_id: storeId,
          is_active: true
        }
      });

      if (!adminCart) {
        throw new Error('Aktif admin sepet bulunamadı');
      }

      await prisma.admin_cart_items.deleteMany({
        where: { admin_cart_id: adminCart.id }
      });

      return { success: true, message: 'Admin sepet temizlendi' };
    } catch (error) {
      console.error('Admin sepet temizleme hatası:', error);
      throw error;
    }
  }

  // Admin sepetinden ürün çıkar
  async removeFromAdminCart(adminCartItemId: number, targetUserId: string, adminUserId: string) {
    try {
      // Önce öğenin doğru admin sepete ait olduğunu kontrol et
      const adminCartItem = await prisma.admin_cart_items.findFirst({
        where: {
          id: adminCartItemId,
          admin_carts: {
            target_user_id: targetUserId,
            admin_user_id: adminUserId,
            is_active: true
          }
        }
      });

      if (!adminCartItem) {
        throw new Error('Admin sepet öğesi bulunamadı veya yetkisiz erişim');
      }

      await prisma.admin_cart_items.delete({
        where: { id: adminCartItemId }
      });

      return { success: true, message: 'Ürün admin sepetten çıkarıldı' };
    } catch (error) {
      console.error('Admin sepetten çıkarma hatası:', error);
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

  // Sepeti onayla ve sipariş durumuna işaretle
  async confirmCart(userId: string): Promise<{ success: boolean; message: string; cartId?: number }> {
    try {
      const cart = await prisma.carts.findFirst({
        where: {
          user_id: userId,
          is_active: true
        },
        include: {
          cart_items: true
        }
      });

      if (!cart || cart.cart_items.length === 0) {
        return { success: false, message: 'Aktif sepet bulunamadı veya sepet boş' };
      }

      // Sepeti pasif duruma getir (sipariş oluşturuldu anlamında)
      await prisma.carts.update({
        where: { id: cart.id },
        data: { is_active: false }
      });

      return { 
        success: true, 
        message: 'Sepet onaylandı ve sipariş oluşturuldu',
        cartId: cart.id
      };
    } catch (error) {
      console.error('Sepet onaylama hatası:', error);
      return { success: false, message: 'Sepet onaylanırken hata oluştu' };
    }
  }

  // Admin sepetini onaylayarak normal sepete dönüştür
  async confirmAdminCart(targetUserId: string, adminUserId: string, storeId: string): Promise<{ success: boolean; message: string; cartId?: number }> {
    try {
      const adminCart = await prisma.admin_carts.findFirst({
        where: {
          target_user_id: targetUserId,
          admin_user_id: adminUserId,
          store_id: storeId,
          is_active: true
        },
        include: {
          admin_cart_items: true
        }
      });

      if (!adminCart || adminCart.admin_cart_items.length === 0) {
        return { success: false, message: 'Aktif admin sepet bulunamadı veya sepet boş' };
      }

      // Normal sepet oluştur
      const normalCart = await prisma.carts.create({
        data: {
          user_id: targetUserId,
          is_active: false // Hemen sipariş için pasif
        }
      });

      // Admin sepet öğelerini normal sepet öğelerine kopyala
      const cartItemsData = adminCart.admin_cart_items.map(item => ({
        cart_id: normalCart.id,
        product_id: item.product_id,
        quantity: item.quantity,
        width: item.width,
        height: item.height,
        area_m2: item.area_m2,
        unit_price: item.unit_price,
        total_price: item.total_price,
        has_fringe: item.has_fringe,
        cut_type: item.cut_type,
        notes: item.notes
      }));

      await prisma.cart_items.createMany({
        data: cartItemsData
      });

      // Admin sepeti pasif duruma getir
      await prisma.admin_carts.update({
        where: { id: adminCart.id },
        data: { is_active: false }
      });

      return { 
        success: true, 
        message: 'Admin sepet onaylandı ve normal sepete dönüştürüldü',
        cartId: normalCart.id
      };
    } catch (error) {
      console.error('Admin sepet onaylama hatası:', error);
      return { success: false, message: 'Admin sepet onaylanırken hata oluştu' };
    }
  }

  // Admin sepet öğesi güncelleme
  async updateAdminCartItem(data: {
    adminCartItemId: number;
    targetUserId: string;
    adminUserId: string;
    quantity: number;
    width?: number;
    height?: number;
    hasFringe?: boolean;
    cutType?: string;
    notes?: string;
  }) {
    try {
      // Admin sepet öğesini bul ve kontrol et
      const adminCartItem = await prisma.admin_cart_items.findFirst({
        where: {
          id: data.adminCartItemId,
          admin_carts: {
            target_user_id: data.targetUserId,
            admin_user_id: data.adminUserId,
            is_active: true
          }
        },
        include: {
          Product: true,
          admin_carts: {
            include: {
              AdminUser: true,
              TargetUser: true,
              Store: true
            }
          }
        }
      });

      if (!adminCartItem) {
        throw new Error('Admin sepet öğesi bulunamadı veya yetkisiz erişim');
      }

      // Güncellenecek boyutlar
      const width = data.width || adminCartItem.width.toNumber();
      const height = data.height || adminCartItem.height.toNumber();
      const hasFringe = data.hasFringe ?? adminCartItem.has_fringe ?? false;

      // Ürün detaylarını al
      const productDetails = await productService.getProductById(
        adminCartItem.product_id, 
        data.targetUserId
      );

      if (!productDetails) {
        throw new Error('Ürün detayları alınamadı');
      }

      // Boyut kontrolü - eğer boyut değiştiriliyorsa
      let sizeOption;
      if (data.width || data.height) {
        sizeOption = productDetails.sizeOptions?.find(option => 
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
      } else {
        // Boyut değişikliği yoksa mevcut boyut için size option'ı bul
        sizeOption = productDetails.sizeOptions?.find(option => 
          option.width === width && 
          (option.is_optional_height || option.height === height)
        );
      }

      // Stok kontrolü
      if (sizeOption) {
        const availableStock = sizeOption.stockQuantity || 0;
        const availableAreaM2 = sizeOption.stockAreaM2 || 0;
        
        if (sizeOption.is_optional_height) {
          // Opsiyonel yükseklik: Sadece m² bazlı kontrol
          const actualPieceAreaM2 = (width * height) / 10000;
          const requestedAreaM2 = data.quantity * actualPieceAreaM2;

          if (availableAreaM2 <= 0) {
            throw new Error(`Seçilen boyut (${width}x${height}cm) için stok bulunmuyor`);
          }

          const maxQuantityFromArea = Math.floor(availableAreaM2 / actualPieceAreaM2);
          if (data.quantity > maxQuantityFromArea) {
            throw new Error(`Yeterli stok yok. Seçilen boyut (${width}x${height}cm) için maksimum sipariş: ${maxQuantityFromArea} adet (Mevcut: ${availableAreaM2}m²)`);
          }
        } else {
          // Hazır kesim: Sadece adet bazlı kontrol
          if (availableStock <= 0) {
            throw new Error(`Seçilen boyut (${width}x${height}cm) için stok bulunmuyor`);
          }

          if (data.quantity > availableStock) {
            throw new Error(`Yeterli stok yok. Seçilen boyut (${width}x${height}cm) için maksimum sipariş: ${availableStock} adet`);
          }
        }
      } else {
        throw new Error(`Bu boyut (${width}x${height}cm) için stok bilgisi bulunamadı`);
      }

      // Saçak kontrolü
      if (data.hasFringe !== undefined && !productDetails.canHaveFringe && hasFringe) {
        throw new Error('Bu ürün saçaklı olamaz');
      }

      // Cut type kontrolü
      let finalCutType: $Enums.cut_type_enum | undefined = undefined;
      if (data.cutType) {
        const validCutTypes = productDetails.cutTypes?.map(ct => ct.name.toLowerCase()) || [];
        const requestedCutType = data.cutType.toLowerCase();
        
        const cutTypeMapping: { [key: string]: $Enums.cut_type_enum } = {
          'standart': $Enums.cut_type_enum.rectangle,
          'dikdörtgen': $Enums.cut_type_enum.rectangle, 
          'rectangle': $Enums.cut_type_enum.rectangle,
          'daire': $Enums.cut_type_enum.round,
          'round': $Enums.cut_type_enum.round,
          'circle': $Enums.cut_type_enum.round,
          'oval': $Enums.cut_type_enum.oval,
          'custom': $Enums.cut_type_enum.custom,
          'özel': $Enums.cut_type_enum.custom,
          'post': $Enums.cut_type_enum.custom,
          'post kesim': $Enums.cut_type_enum.custom
        };

        finalCutType = cutTypeMapping[requestedCutType];
        if (!finalCutType) {
          throw new Error(`Geçersiz kesim türü: ${data.cutType}. Geçerli değerler: standart, round, oval, custom, daire`);
        }

        // API'deki cutTypes'tan validasyon yap
        const isValidCutType = validCutTypes.some(apiCutType => {
          const apiMapped = cutTypeMapping[apiCutType];
          return apiMapped === finalCutType;
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

      return await prisma.admin_cart_items.update({
        where: { id: data.adminCartItemId },
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
          Product: true,
          admin_carts: {
            include: {
              AdminUser: true,
              TargetUser: true,
              Store: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Admin sepet öğesi güncelleme hatası:', error);
      throw error;
    }
  }
} 