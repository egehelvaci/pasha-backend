import { Decimal } from '@prisma/client/runtime/library';
import prisma from './utils/prisma';

export interface AddToPurchaseCartRequest {
  supplierId: string;
  userId: string; // Admin kullanıcı ID'si
  productId: string;
  quantity: number;
  width: number;
  height: number;
  hasFringe: boolean;
  cutType: string;
  notes?: string;
}

export interface UpdatePurchaseCartItemRequest {
  purchaseCartItemId: number;
  quantity?: number;
  width?: number;
  height?: number;
  hasFringe?: boolean;
  cutType?: string;
  notes?: string;
}

export class PurchaseCartService {
  
  // Satıcıya ait aktif alım sepetini getir veya oluştur
  async getOrCreatePurchaseCart(supplierId: string, userId: string) {
    let cart = await prisma.purchaseCarts.findFirst({
      where: {
        supplier_id: supplierId,
        user_id: userId,
        is_active: true
      }
    });

    if (!cart) {
      cart = await prisma.purchaseCarts.create({
        data: {
          supplier_id: supplierId,
          user_id: userId,
          is_active: true
        }
      });
    }

    return cart;
  }

  // Alım sepetine ürün ekle
  async addToPurchaseCart(data: AddToPurchaseCartRequest) {
    try {
      // Satıcının varlığını kontrol et
      const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId, is_active: true }
      });

      if (!supplier) {
        throw new Error('Satıcı bulunamadı veya aktif değil');
      }

      // Ürün bilgilerini ve alış fiyatını getir
      const product = await prisma.product.findUnique({
        where: { productId: data.productId },
        include: {
          collection: true
        }
      });

      if (!product) {
        throw new Error('Ürün bulunamadı');
      }

      // Bu koleksiyon için alış fiyatını getir
      const purchasePriceDetail = await prisma.purchasePriceListDetail.findFirst({
        where: {
          collection_id: product.collectionId,
          purchasePriceList: {
            name: 'Varsayılan Alış Fiyat Listesi',
            is_active: true
          }
        }
      });

      if (!purchasePriceDetail) {
        throw new Error(`${product.collection.name} koleksiyonu için alış fiyat bilgisi bulunamadı`);
      }

      // Kesim türü kontrolü
      const cutTypeMapping: { [key: string]: string } = {
        'rectangle': 'rectangle',
        'round': 'round',
        'oval': 'oval',
        'hexagon': 'hexagon',
        'star': 'star'
      };

      const mappedCutType = cutTypeMapping[data.cutType?.toLowerCase()];
      if (!mappedCutType) {
        throw new Error(`Geçersiz kesim türü: ${data.cutType}`);
      }

      // Fiyat hesaplama
      const areaM2 = (data.width * data.height) / 10000; // cm²'den m²'ye çevirme
      const unitPrice = new Decimal(purchasePriceDetail.price_per_square_meter); // USD cinsinden alış fiyatı
      const totalPrice = new Decimal(data.quantity).mul(new Decimal(areaM2)).mul(unitPrice);

      // Alım sepetini getir veya oluştur
      const cart = await this.getOrCreatePurchaseCart(data.supplierId, data.userId);

      // Aynı ürün, boyut ve özelliklerle sepette var mı kontrol et
      const existingItem = await prisma.purchaseCartItems.findFirst({
        where: {
          purchase_cart_id: cart.id,
          product_id: data.productId,
          width: new Decimal(data.width),
          height: new Decimal(data.height),
          has_fringe: data.hasFringe,
          cut_type: mappedCutType as any
        }
      });

      if (existingItem) {
        // Mevcut öğeyi güncelle
        const newQuantity = existingItem.quantity + data.quantity;
        const newTotalPrice = new Decimal(newQuantity).mul(new Decimal(areaM2)).mul(unitPrice);

        return await prisma.purchaseCartItems.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            total_price: newTotalPrice
          },
          include: {
            product: {
              include: {
                collection: true
              }
            }
          }
        });
      } else {
        // Yeni öğe oluştur
        return await prisma.purchaseCartItems.create({
          data: {
            purchase_cart_id: cart.id,
            product_id: data.productId,
            quantity: data.quantity,
            width: new Decimal(data.width),
            height: new Decimal(data.height),
            area_m2: new Decimal(areaM2),
            unit_price: unitPrice,
            total_price: totalPrice,
            has_fringe: data.hasFringe,
            cut_type: mappedCutType as any,
            notes: data.notes
          },
          include: {
            product: {
              include: {
                collection: true
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Alım sepetine ekleme hatası:', error);
      throw error;
    }
  }

  // Alım sepeti öğesini güncelle
  async updatePurchaseCartItem(data: UpdatePurchaseCartItemRequest) {
    try {
      const existingItem = await prisma.purchaseCartItems.findUnique({
        where: { id: data.purchaseCartItemId },
        include: {
          product: {
            include: {
              collection: true
            }
          }
        }
      });

      if (!existingItem) {
        throw new Error('Alım sepeti öğesi bulunamadı');
      }

      // Alış fiyatını getir
      const purchasePriceDetail = await prisma.purchasePriceListDetail.findFirst({
        where: {
          collection_id: existingItem.product.collectionId,
          purchasePriceList: {
            name: 'Varsayılan Alış Fiyat Listesi',
            is_active: true
          }
        }
      });

      if (!purchasePriceDetail) {
        throw new Error(`${existingItem.product.collection.name} koleksiyonu için alış fiyat bilgisi bulunamadı`);
      }

      // Güncellenecek alanları belirle
      const updateData: any = {};
      
      if (data.quantity !== undefined) {
        updateData.quantity = data.quantity;
      }
      
      if (data.width !== undefined) {
        updateData.width = new Decimal(data.width);
      }
      
      if (data.height !== undefined) {
        updateData.height = new Decimal(data.height);
      }
      
      if (data.hasFringe !== undefined) {
        updateData.has_fringe = data.hasFringe;
      }
      
      if (data.cutType !== undefined) {
        const cutTypeMapping: { [key: string]: string } = {
          'rectangle': 'rectangle',
          'round': 'round',
          'oval': 'oval',
          'hexagon': 'hexagon',
          'star': 'star'
        };
        
        const mappedCutType = cutTypeMapping[data.cutType?.toLowerCase()];
        if (!mappedCutType) {
          throw new Error(`Geçersiz kesim türü: ${data.cutType}`);
        }
        updateData.cut_type = mappedCutType;
      }
      
      if (data.notes !== undefined) {
        updateData.notes = data.notes;
      }

      // Alan ve fiyat hesaplama
      const finalWidth = data.width !== undefined ? data.width : parseFloat(existingItem.width.toString());
      const finalHeight = data.height !== undefined ? data.height : parseFloat(existingItem.height.toString());
      const finalQuantity = data.quantity !== undefined ? data.quantity : existingItem.quantity;
      
      const areaM2 = (finalWidth * finalHeight) / 10000;
      const unitPrice = new Decimal(purchasePriceDetail.price_per_square_meter);
      const totalPrice = new Decimal(finalQuantity).mul(new Decimal(areaM2)).mul(unitPrice);

      updateData.area_m2 = new Decimal(areaM2);
      updateData.unit_price = unitPrice;
      updateData.total_price = totalPrice;

      return await prisma.purchaseCartItems.update({
        where: { id: data.purchaseCartItemId },
        data: updateData,
        include: {
          product: {
            include: {
              collection: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Alım sepeti öğesi güncelleme hatası:', error);
      throw error;
    }
  }

  // Alım sepeti öğesini sil
  async removePurchaseCartItem(purchaseCartItemId: number) {
    try {
      return await prisma.purchaseCartItems.delete({
        where: { id: purchaseCartItemId }
      });
    } catch (error) {
      console.error('Alım sepeti öğesi silme hatası:', error);
      throw error;
    }
  }

  // Satıcının alım sepetini getir
  async getPurchaseCart(supplierId: string, userId: string) {
    try {
      return await prisma.purchaseCarts.findFirst({
        where: {
          supplier_id: supplierId,
          user_id: userId,
          is_active: true
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  collection: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            }
          },
          supplier: true
        }
      });
    } catch (error) {
      console.error('Alım sepeti getirme hatası:', error);
      throw error;
    }
  }

  // Alım sepetini temizle
  async clearPurchaseCart(supplierId: string, userId: string) {
    try {
      const cart = await prisma.purchaseCarts.findFirst({
        where: {
          supplier_id: supplierId,
          user_id: userId,
          is_active: true
        }
      });

      if (!cart) {
        throw new Error('Alım sepeti bulunamadı');
      }

      // Önce sepet öğelerini sil
      await prisma.purchaseCartItems.deleteMany({
        where: { purchase_cart_id: cart.id }
      });

      // Sepeti deaktif et
      return await prisma.purchaseCarts.update({
        where: { id: cart.id },
        data: { is_active: false }
      });
    } catch (error) {
      console.error('Alım sepeti temizleme hatası:', error);
      throw error;
    }
  }

  // Alım sepeti toplamını hesapla (USD cinsinden)
  async calculatePurchaseCartTotal(supplierId: string, userId: string): Promise<number> {
    try {
      const cart = await this.getPurchaseCart(supplierId, userId);
      
      if (!cart || !cart.items.length) {
        return 0;
      }

      return cart.items.reduce((total, item) => {
        return total + parseFloat(item.total_price.toString());
      }, 0);
    } catch (error) {
      console.error('Alım sepeti toplam hesaplama hatası:', error);
      throw error;
    }
  }
}
