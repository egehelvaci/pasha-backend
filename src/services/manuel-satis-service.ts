import prisma from '../utils/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { getDefaultPriceList } from '../utils/priceListUtils'

export interface ManuelSatisItem {
  productId: string;
  quantity: number;
  width?: number;
  height?: number;
  hasFringe?: boolean;
  cutType?: string;
  unitPrice: number;
  notes?: string;
}

export interface CreateManuelSatisRequest {
  storeId: string;
  items: ManuelSatisItem[];
  paymentMethod?: string;
  notes?: string;
}

export class ManuelSatisService {
  
  /**
   * Benzersiz fiş numarası oluştur
   */
  private generateFisNumarasi(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = date.getHours().toString().padStart(2, '0') + 
                   date.getMinutes().toString().padStart(2, '0');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MS-${dateStr}-${timeStr}-${randomStr}`;
  }

  /**
   * Ürün için fiyat hesapla
   */
  async calculateProductPrice(
    product: any,
    item: ManuelSatisItem,
    priceList: any
  ): Promise<number> {
    try {
      if (!priceList || !priceList.PriceListDetail) {
        throw new Error('Fiyat listesi bulunamadı');
      }

      // Ürünün koleksiyonu için fiyat detayını bul
      const priceDetail = priceList.PriceListDetail.find((detail: any) => 
        detail.collection_id === product.collectionId
      );

      if (!priceDetail) {
        throw new Error(`${product.collection.name} koleksiyonu için fiyat bulunamadı`);
      }

      const pricePerSquareMeter = Number(priceDetail.price_per_square_meter);

      // Boyutlu ürün ise m² bazlı hesaplama
      if (item.width && item.height) {
        const alanM2 = (item.width * item.height) / 10000;
        return pricePerSquareMeter * alanM2;
      }

      // Boyutsuz ürün için varsayılan 1m² fiyatı
      return pricePerSquareMeter;
    } catch (error: any) {
      console.error('Fiyat hesaplama hatası:', error);
      throw new Error(`Fiyat hesaplanamadı: ${error.message}`);
    }
  }

  /**
   * Mağaza için geçerli fiyat listesini getir
   */
  async getPriceListForStore(storeId: string, useStorePriceList: boolean = true) {
    try {
      if (useStorePriceList) {
        // Mağazanın ilk kullanıcısını bul (fiyat listesi için)
        const storeUser = await prisma.user.findFirst({
          where: { store_id: storeId },
          include: {
            Store: {
              include: {
                StorePriceList: {
                  include: {
                    PriceList: {
                      include: {
                        PriceListDetail: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        if (storeUser?.userId) {
          const activePriceList = await getActivePriceListForUser(storeUser.userId);
          if (activePriceList) {
            return activePriceList;
          }
        }
      }

      // Varsayılan fiyat listesini kullan
      return await getDefaultPriceList();
    } catch (error: any) {
      console.error('Fiyat listesi getirme hatası:', error);
      // Hata durumunda varsayılan fiyat listesini kullan
      return await getDefaultPriceList();
    }
  }

  /**
   * Stok kontrolü ve güncelleme
   */
  private async checkAndUpdateStock(
    tx: any,
    product: any,
    item: ManuelSatisItem
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!item.width || !item.height) {
        // Boyutsuz ürün - genel stok kontrolü yapılabilir
        return { success: true };
      }

      // Boyutlu ürün - varyasyon kontrolü
      const variation = product.productvariations.find((v: any) => 
        Number(v.width) === item.width && 
        Number(v.height) === item.height &&
        (v.has_fringe === item.hasFringe || v.has_fringe === null)
      );

      if (!variation) {
        return {
          success: false,
          message: `Ürün varyasyonu bulunamadı: ${product.name} - ${item.width}x${item.height}cm`
        };
      }

      // Ürün kurallarını kontrol et
      const sizeOption = product.productrules?.productsizeoptions?.find((so: any) => 
        so.width === item.width
      );

      if (sizeOption?.is_optional_height) {
        // Opsiyonel yükseklik - m² kontrolü
        const alanM2 = (item.width * item.height) / 10000;
        const toplamAlanM2 = alanM2 * item.quantity;
        const mevcutAlanM2 = Number(variation.stock_area_m2 || 0);
        
        if (mevcutAlanM2 < toplamAlanM2) {
          return {
            success: false,
            message: `Yetersiz stok: ${product.name} - Mevcut: ${mevcutAlanM2}m², İstenen: ${toplamAlanM2}m²`
          };
        }

        // Stok düş
        await tx.productvariations.update({
          where: { id: variation.id },
          data: {
            stock_area_m2: {
              decrement: toplamAlanM2
            }
          }
        });
      } else {
        // Hazır kesim - adet kontrolü
        const mevcutAdet = variation.stock_quantity || 0;
        
        if (mevcutAdet < item.quantity) {
          return {
            success: false,
            message: `Yetersiz stok: ${product.name} - Mevcut: ${mevcutAdet} adet, İstenen: ${item.quantity} adet`
          };
        }

        // Stok düş
        await tx.productvariations.update({
          where: { id: variation.id },
          data: {
            stock_quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Stok kontrol hatası:', error);
      return {
        success: false,
        message: error.message || 'Stok kontrolü sırasında hata oluştu'
      };
    }
  }

  /**
   * Manuel satış oluştur
   */
  async createManuelSatis(data: CreateManuelSatisRequest) {
    try {
      // Store kontrolü
      const store = await prisma.store.findUnique({
        where: { store_id: data.storeId },
        include: {
          User: true
        }
      });
      
      if (!store) {
        return {
          success: false,
          message: 'Mağaza bulunamadı'
        };
      }

      if (!store.is_active) {
        return {
          success: false,
          message: 'Mağaza aktif değil'
        };
      }

      // Items kontrolü
      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          message: 'En az bir ürün seçilmelidir'
        };
      }

      // Manuel satışta her zaman varsayılan fiyat listesi kullanılır
      const priceList = await getDefaultPriceList();

      if (!priceList) {
        return {
          success: false,
          message: 'Varsayılan fiyat listesi bulunamadı'
        };
      }

      // Her ürün için fiyat hesapla ve toplam tutar hesaplama
      const itemsWithTotal = [];
      let totalAmount = 0;

      for (const item of data.items) {
        // Ürün bilgilerini al
        const product = await prisma.product.findUnique({
          where: { productId: item.productId },
          include: {
            collection: true
          }
        });

        if (!product) {
          return {
            success: false,
            message: `Ürün bulunamadı: ${item.productId}`
          };
        }

        // Fiyat hesapla (eğer unitPrice verilmemişse)
        let unitPrice = item.unitPrice;
        if (!unitPrice || unitPrice <= 0) {
          try {
            unitPrice = await this.calculateProductPrice(product, item, priceList);
          } catch (error: any) {
            return {
              success: false,
              message: `${product.name} için fiyat hesaplanamadı: ${error.message}`
            };
          }
        }

        const itemTotal = new Decimal(unitPrice).mul(item.quantity).toNumber();
        
        itemsWithTotal.push({
          ...item,
          unitPrice,
          totalPrice: itemTotal
        });

        totalAmount += itemTotal;
      }

      if (totalAmount <= 0) {
        return {
          success: false,
          message: 'Toplam tutar 0\'dan büyük olmalıdır'
        };
      }

      // Manuel satışta varsayılan fiyat listesi kullanıldığı için limit kontrolü yapılmaz

      // Fiş numarası oluştur
      const fisNumarasi = this.generateFisNumarasi();

      // Transaction ile işlem yap
      const result = await prisma.$transaction(async (tx) => {
        // 1. Muhasebe hareketi oluştur
        const muhasebeHareketi = await tx.muhasebeHareketleri.create({
          data: {
            storeId: data.storeId,
            islemTuru: 'Manuel Satış',
            tutar: new Decimal(totalAmount),
            harcama: false, // Gelir
            tarih: new Date(),
            aciklama: `Manuel Satış - Fiş No: ${fisNumarasi}${data.notes ? ` - ${data.notes}` : ''}`,
            isManuelSatis: true,
            fisNumarasi: fisNumarasi
          }
        });

        // 2. Her ürün için detay ekle ve stok kontrol et
        const createdDetails = [];
        for (const item of itemsWithTotal) {
          // Ürün kontrolü
          const product = await tx.product.findUnique({
            where: { productId: item.productId },
            include: {
              collection: true,
              productvariations: true,
              productrules: {
                include: {
                  productsizeoptions: true
                }
              }
            }
          });

          if (!product) {
            throw new Error(`Ürün bulunamadı: ${item.productId}`);
          }

          // Stok kontrolü ve güncelleme
          const stockResult = await this.checkAndUpdateStock(tx, product, item);
          if (!stockResult.success) {
            throw new Error(stockResult.message);
          }

          // Manuel satış detayı ekle
          const detail = await tx.manuelSatisDetay.create({
            data: {
              muhasebeHareketId: muhasebeHareketi.id,
              productId: item.productId,
              quantity: item.quantity,
              width: item.width ? new Decimal(item.width) : null,
              height: item.height ? new Decimal(item.height) : null,
              unitPrice: new Decimal(item.unitPrice),
              totalPrice: new Decimal(item.totalPrice),
              hasFringe: item.hasFringe,
              cutType: item.cutType,
              notes: item.notes
            },
            include: {
              product: {
                include: {
                  collection: true
                }
              }
            }
          });

          createdDetails.push(detail);
        }

        // 3. Store bakiyesini güncelle (borç olarak)
        await tx.store.update({
          where: { store_id: data.storeId },
          data: {
            bakiye: {
              decrement: new Decimal(totalAmount)
            }
          }
        });

        // 4. Admin kasasını güncelle
        await tx.adminVarliklari.upsert({
          where: { id: 1 },
          update: {
            kasaBakiyesi: {
              increment: new Decimal(totalAmount)
            }
          },
          create: {
            id: 1,
            kasaBakiyesi: new Decimal(totalAmount)
          }
        });

        return {
          muhasebeHareketi,
          details: createdDetails
        };
      });

      return {
        success: true,
        message: 'Manuel satış başarıyla kaydedildi',
        data: {
          fisNumarasi,
          totalAmount,
          itemCount: data.items.length,
          ...result
        }
      };

    } catch (error: any) {
      console.error('Manuel satış hatası:', error);
      return {
        success: false,
        message: error.message || 'Manuel satış işlemi sırasında hata oluştu'
      };
    }
  }

  /**
   * Manuel satış fişi getir
   */
  async getManuelSatisReceipt(fisNumarasi: string) {
    try {
      const muhasebeHareketi = await prisma.muhasebeHareketleri.findUnique({
        where: { fisNumarasi },
        include: {
          store: {
            include: {
              User: true
            }
          },
          manuelSatisDetay: {
            include: {
              product: {
                include: {
                  collection: true
                }
              }
            }
          }
        }
      });

      if (!muhasebeHareketi || !muhasebeHareketi.isManuelSatis) {
        return {
          success: false,
          message: 'Manuel satış fişi bulunamadı',
          statusCode: 404
        };
      }

      const store = muhasebeHareketi.store;
      const totalAmount = Number(muhasebeHareketi.tutar);

      // Mevcut bakiye
      const currentBalance = Number(store.bakiye || 0);
      // Satış öncesi bakiye (mevcut + satış tutarı)
      const previousBalance = currentBalance + totalAmount;

      // Fiş verilerini hazırla
      const receipt = {
        // Satış bilgileri
        satis: {
          fisNumarasi: muhasebeHareketi.fisNumarasi,
          islemTuru: muhasebeHareketi.islemTuru,
          tarih: muhasebeHareketi.tarih,
          toplamTutar: totalAmount,
          aciklama: muhasebeHareketi.aciklama
        },

        // Mağaza bilgileri
        magaza: {
          kurumAdi: store.kurum_adi,
          vergiNumarasi: store.vergi_numarasi,
          vergiDairesi: store.vergi_dairesi,
          yetkiliAdi: store.yetkili_adi,
          yetkiliSoyadi: store.yetkili_soyadi,
          telefon: store.telefon,
          eposta: store.eposta,
          adres: store.adres,
          faksNumarasi: store.faks_numarasi
        },

        // Satış detayları
        urunler: muhasebeHareketi.manuelSatisDetay.map(detail => ({
          urunAdi: detail.product.name,
          aciklama: detail.product.description,
          koleksiyon: {
            adi: detail.product.collection.name,
            kodu: detail.product.collection.code
          },
          miktar: detail.quantity,
          birimFiyat: Number(detail.unitPrice),
          toplamFiyat: Number(detail.totalPrice),
          olculer: {
            en: detail.width ? Number(detail.width) : null,
            boy: detail.height ? Number(detail.height) : null,
            alanM2: detail.width && detail.height ? 
              (Number(detail.width) * Number(detail.height)) / 10000 : null
          },
          ozellikler: {
            sasakVar: detail.hasFringe || false,
            kesimTipi: detail.cutType || null
          },
          notlar: detail.notes
        })),

        // Bakiye bilgileri
        bakiye: {
          satisOncesi: previousBalance,
          satisSonrasi: currentBalance,
          satisKesintisi: totalAmount,
          tarih: new Date()
        },

        // Özet bilgiler
        ozet: {
          toplamUrunSayisi: muhasebeHareketi.manuelSatisDetay.length,
          toplamMiktar: muhasebeHareketi.manuelSatisDetay.reduce(
            (sum, detail) => sum + detail.quantity, 0
          ),
          toplamAlanM2: muhasebeHareketi.manuelSatisDetay.reduce((sum, detail) => {
            if (detail.width && detail.height) {
              const alanM2 = (Number(detail.width) * Number(detail.height)) / 10000;
              return sum + (alanM2 * detail.quantity);
            }
            return sum;
          }, 0),
          toplamTutar: totalAmount
        },

        // Fiş bilgileri
        fis: {
          fisNumarasi: muhasebeHareketi.fisNumarasi,
          fisGrubu: 'MANUEL_SATIS',
          olusturmaTarihi: muhasebeHareketi.createdAt,
          gecerlilikTarihi: new Date(
            muhasebeHareketi.createdAt.getTime() + 365 * 24 * 60 * 60 * 1000
          ), // 1 yıl geçerli
        }
      };

      return {
        success: true,
        message: 'Manuel satış fişi başarıyla hazırlandı',
        receipt
      };

    } catch (error: any) {
      console.error('Manuel satış fişi hazırlama hatası:', error);
      return {
        success: false,
        message: error.message || 'Fiş hazırlanırken bir hata oluştu',
        statusCode: 500
      };
    }
  }

  /**
   * Manuel satış listesi
   */
  async getManuelSatisList(params: {
    storeId?: string;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
  }) {
    try {
      const { storeId, startDate, endDate, page, limit } = params;
      const skip = (page - 1) * limit;

      const whereCondition: any = {
        isManuelSatis: true
      };

      if (storeId) {
        whereCondition.storeId = storeId;
      }

      if (startDate || endDate) {
        whereCondition.tarih = {};
        if (startDate) whereCondition.tarih.gte = startDate;
        if (endDate) whereCondition.tarih.lte = endDate;
      }

      const [data, total] = await Promise.all([
        prisma.muhasebeHareketleri.findMany({
          where: whereCondition,
          include: {
            store: {
              select: {
                kurum_adi: true,
                store_id: true
              }
            },
            manuelSatisDetay: {
              include: {
                product: {
                  select: {
                    name: true,
                    productId: true
                  }
                }
              }
            }
          },
          orderBy: { tarih: 'desc' },
          skip,
          take: limit
        }),
        prisma.muhasebeHareketleri.count({ where: whereCondition })
      ]);

      return {
        success: true,
        data: data.map(item => ({
          ...item,
          tutar: Number(item.tutar),
          itemCount: item.manuelSatisDetay.length,
          totalQuantity: item.manuelSatisDetay.reduce((sum, detail) => sum + detail.quantity, 0)
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      console.error('Manuel satış listesi hatası:', error);
      return {
        success: false,
        message: error.message || 'Liste alınırken bir hata oluştu'
      };
    }
  }

  /**
   * Ürün arama - yazarken filtreleme
   */
  async searchProducts(params: {
    query?: string;
    collectionId?: string;
    limit?: number;
  }) {
    try {
      const { query, collectionId, limit = 20 } = params;
      
      const whereCondition: any = {
        // Aktif ürünleri getir - isActive alanı yoksa bu kontrolü kaldır
      };
      
      if (query && query.length >= 2) {
        whereCondition.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ];
      }
      
      if (collectionId) {
        whereCondition.collectionId = collectionId;
      }
      
      const products = await prisma.product.findMany({
        where: whereCondition,
        include: {
          collection: true,
          productvariations: {
            where: {
              OR: [
                { stock_quantity: { gt: 0 } },
                { stock_area_m2: { gt: 0 } }
              ]
            }
          },
          productrules: {
            include: {
              productsizeoptions: true
            }
          }
        },
        take: limit,
        orderBy: { name: 'asc' }
      });

      // Manuel satışta her zaman varsayılan fiyat listesi kullanılır
      let priceList = null;
      try {
        priceList = await getDefaultPriceList();
      } catch (error) {
        console.warn('Varsayılan fiyat listesi alınamadı');
      }
      
      return {
        success: true,
        data: products.map(product => {
          // Fiyat bilgisini hesapla
          let priceInfo = null;
          if (priceList && priceList.PriceListDetail) {
            const priceDetail = priceList.PriceListDetail.find((detail: any) => 
              detail.collection_id === product.collectionId
            );
            if (priceDetail) {
              priceInfo = {
                pricePerSquareMeter: Number(priceDetail.price_per_square_meter),
                currency: priceList.currency || 'TRY'
              };
            }
          }

          return {
            ...product,
            hasStock: product.productvariations.length > 0,
            priceInfo,
            stockInfo: product.productvariations.map(v => ({
              width: Number(v.width),
              height: Number(v.height),
              stockQuantity: v.stock_quantity,
              stockAreaM2: Number(v.stock_area_m2 || 0),
              hasFringe: v.has_fringe,
              // Boyutlu ürün için tahmini fiyat
              estimatedPrice: priceInfo ? 
                priceInfo.pricePerSquareMeter * ((Number(v.width) * Number(v.height)) / 10000) : null
            }))
          };
        })
      };
    } catch (error: any) {
      console.error('Ürün arama hatası:', error);
      return {
        success: false,
        message: error.message || 'Ürün arama sırasında hata oluştu',
        data: []
      };
    }
  }
}

export const manuelSatisService = new ManuelSatisService();
