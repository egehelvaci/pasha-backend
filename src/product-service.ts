import { Prisma } from '../generated/prisma';
import { TebiService } from './utils/tebi-service';
import prisma from './utils/prisma';
import { cacheService, CacheService } from './utils/cache-service';

// Kesim türleri için tip tanımı
export interface CutType {
  id: number;
  name: string;
}

// Boyut seçenekleri için tip tanımı
export interface SizeOption {
  id: number;
  width: number;
  height: number;
  is_optional_height: boolean;
  stockQuantity?: number;
}

// Ürün veri modelini tipini genişlet
interface ExtendedProduct extends Prisma.ProductGetPayload<{include: {collection: true}}> {
  pricing?: {
    price: number | null;
    currency: string;
    userTypeId: number;
  };
  sizeOptions?: SizeOption[];
  cutTypes?: CutType[];
  hasFringe?: boolean;
  canHaveFringe?: boolean;
}

const tebiService = new TebiService();

export class ProductService {
  /**
   * Yeni bir ürün oluştur
   */
  async createProduct(data: {
    name: string
    description: string
    productImage?: string
    collectionId: string
    rule_id?: number | null
  }) {
    try {
      // Önce koleksiyonun var olup olmadığını kontrol et
      const collection = await prisma.collection.findUnique({
        where: { collectionId: data.collectionId }
      });
      
      if (!collection) {
        throw new Error(`${data.collectionId} ID'li koleksiyon bulunamadı`);
      }
      
      // Prisma ProductCreateInput tipine uygun nesne oluştur
      const productData: Prisma.ProductUncheckedCreateInput = {
        name: data.name,
        description: data.description,
        productImage: data.productImage,
        collectionId: data.collectionId,
        rule_id: data.rule_id
      };
      
      const product = await prisma.product.create({
        data: productData,
        include: {
          collection: true // Ürün ile birlikte koleksiyon bilgilerini de getir
        }
      });

      // Kurala göre varyasyonları oluştur
      try {
        await this.regenerateVariationsForProduct(product.productId);
        console.log('Ürün varyasyonları kurala göre başarıyla oluşturuldu');
      } catch (variationError) {
        console.error('Ürün varyasyonu oluşturulurken hata:', variationError);
        // Fallback olarak temel varyasyon oluştur
        try {
          await prisma.productvariations.create({
            data: {
              product_id: product.productId,
              width: 100,
              height: 100,
              stock_quantity: 0,
              has_fringe: false
            }
          });
          console.log('Fallback varyasyon oluşturuldu');
        } catch (fallbackError) {
          console.error('Fallback varyasyon hatası:', fallbackError);
        }
      }
      
      return product;
    } catch (error) {
      console.error('Ürün oluşturma hatası:', error);
      throw error;
    }
  }
  
  // storePriceList bulunursa yapılacak işlemler için ortak metot
  private async getPriceInfoFromPriceList(priceList: any, collectionId: string, userTypeId: number) {
    // Fiyat listesinin geçerli olup olmadığını kontrol et
    const now = new Date();
    
    // Fiyat listesi aktif değilse kullanma
    if (!priceList.is_active) {
      return null;
    }
    
    // Fiyat listesinin tarih aralığı kontrolü
    if (priceList.valid_from && new Date(priceList.valid_from) > now) {
      // Başlangıç tarihi henüz gelmemiş
      return null;
    }
    
    if (priceList.valid_to && new Date(priceList.valid_to) < now) {
      // Bitiş tarihi geçmiş
      return null;
    }
    
    // Fiyat detayını bul
    const priceDetail = await prisma.priceListDetail.findFirst({
      where: {
        price_list_id: priceList.price_list_id,
        collection_id: collectionId
      }
    });
    
    if (priceDetail) {
      // Fiyat detayı bulundu
      return {
        price: priceDetail.price_per_square_meter ? parseFloat(priceDetail.price_per_square_meter.toString()) : null,
        currency: priceList.currency || "TRY",
        userTypeId: userTypeId
      };
    }
    
    return null;
  }
  
  /**
   * Tüm ürünleri getir - OPTİMİZE EDİLMİŞ VERSİYON
   */
  async getAllProducts(userId?: string, options?: {
    page?: number;
    limit?: number;
    collectionId?: string;
    search?: string;
  }) {
    try {
      const page = options?.page || 1;
      const limit = Math.min(options?.limit || 50, 100); // Max 100 ürün
      const skip = (page - 1) * limit;

      // Temel sorgu koşulları
      const whereCondition: any = {};
      
      if (options?.collectionId) {
        whereCondition.collectionId = options.collectionId;
      }
      
      if (options?.search) {
        whereCondition.OR = [
          { name: { contains: options.search, mode: 'insensitive' } },
          { description: { contains: options.search, mode: 'insensitive' } }
        ];
      }

      // Toplam sayıyı al
      const totalCount = await prisma.product.count({ where: whereCondition });

      // Optimize edilmiş tek sorgu ile tüm gerekli verileri getir
      const products = await prisma.product.findMany({
        where: whereCondition,
        include: {
          collection: true,
          productrules: {
            include: {
              productsizeoptions: true,
              productrulecuttypes: {
                include: {
                  cuttypes: true
                }
              }
            }
          },
          productvariations: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

             let userPriceInfo: any = null;
       
       // Kullanıcı bilgilerini cache'den al veya veritabanından getir
       if (userId) {
         const cacheKey = cacheService.getUserPriceListKey(userId);
         userPriceInfo = cacheService.get(cacheKey);
         
         if (!userPriceInfo) {
           const user = await prisma.user.findUnique({
             where: { userId },
             include: {
               userType: true,
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

           if (user) {
             // Mağaza fiyat listesini kontrol et
             let activePriceList = null;
             
             if (user.Store?.StorePriceList?.[0]?.PriceList) {
               activePriceList = user.Store.StorePriceList[0].PriceList;
             } else {
               // Varsayılan fiyat listesini al
               activePriceList = await prisma.priceList.findFirst({
                 where: { is_default: true },
                 include: { PriceListDetail: true }
               });
             }

             userPriceInfo = {
               userTypeId: user.userTypeId,
               priceList: activePriceList
             };
             
             // Cache'e kaydet (5 dakika)
             cacheService.set(cacheKey, userPriceInfo, CacheService.TTL.MEDIUM);
           }
         }
       }

      // Ürünleri optimize edilmiş şekilde işle
      const processedProducts = products.map(product => {
        const extendedProduct = product as any;
        
        // Fiyat bilgisini ekle
        if (userPriceInfo?.priceList) {
          const collectionPrice = userPriceInfo.priceList.PriceListDetail?.find(
            (detail: any) => detail.collection_id === product.collectionId
          );
          
          extendedProduct.pricing = {
            price: collectionPrice?.price_per_square_meter || null,
            currency: userPriceInfo.priceList.currency || "TRY",
            userTypeId: userPriceInfo.userTypeId
          };
        } else if (userId) {
          extendedProduct.pricing = {
            price: null,
            currency: "TRY",
            userTypeId: userPriceInfo?.userTypeId || 1
          };
        }

        // Kural bilgilerini işle
        if (product.productrules) {
          extendedProduct.canHaveFringe = product.productrules.can_have_fringe;
          extendedProduct.hasFringe = false;
          
          // Kesim tiplerini ekle
          extendedProduct.cutTypes = product.productrules.productrulecuttypes?.map(ct => ({
            id: ct.cuttypes.id,
            name: ct.cuttypes.name
          })) || [];
          
          // Boyut seçeneklerini işle
          extendedProduct.sizeOptions = product.productrules.productsizeoptions?.map(so => {
            const stockForSize = product.productvariations?.find(v => 
              v.width === so.width && v.height === so.height
            );
            
            return {
              id: so.id,
              width: so.width,
              height: so.height,
              is_optional_height: so.is_optional_height || false,
              stockQuantity: stockForSize ? stockForSize.stock_quantity : 0
            };
          }) || [];
        } else {
          extendedProduct.cutTypes = [];
          extendedProduct.sizeOptions = [];
          extendedProduct.canHaveFringe = false;
          extendedProduct.hasFringe = false;
        }

        return extendedProduct;
      });

      return {
        products: processedProducts,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + limit < totalCount
        }
      };
    } catch (error) {
      console.error('Ürünleri getirme hatası:', error);
      throw new Error('Ürünler getirilemedi');
    }
  }
  
  /**
   * ID'ye göre ürün getir
   */
  async getProductById(productId: string, userId?: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { productId },
        include: {
          collection: true
        }
      }) as ExtendedProduct | null;

      if (!product) {
        return null;
      }

      // Eğer kullanıcı ID'si belirtilmişse fiyat bilgisini ekle
      if (userId) {
        try {
          // Kullanıcı bilgilerini getir
          const user = await prisma.user.findUnique({
            where: { userId },
            include: {
              userType: true
            }
          });

          if (user) {
            // Kullanıcının müşteri tipi ID'sini al
            const userTypeId = user.userTypeId;
            // Kullanıcının bağlı olduğu mağaza ID'si
            const storeId = user.store_id;

            try {
              let priceInfo;
              
              if (storeId) {
                // Eğer kullanıcı bir mağazaya bağlıysa, mağazanın fiyat listesini bul
                const storePriceList = await prisma.storePriceList.findFirst({
                  where: { store_id: storeId },
                  include: { PriceList: true }
                });
                
                if (storePriceList && storePriceList.PriceList) {
                  // Fiyat listesinin geçerlilik kontrolü
                  priceInfo = await this.getPriceInfoFromPriceList(
                    storePriceList.PriceList, 
                    product.collectionId, 
                    userTypeId
                  );
                }
              }
              
              // Eğer mağaza bazlı fiyat bulunamazsa, varsayılan fiyat listesine bak
              if (!priceInfo) {
                const defaultPriceList = await prisma.priceList.findFirst({
                  where: { is_default: true }
                });
                
                if (defaultPriceList) {
                  // Varsayılan fiyat listesinin geçerlilik kontrolü
                  priceInfo = await this.getPriceInfoFromPriceList(
                    defaultPriceList, 
                    product.collectionId, 
                    userTypeId
                  );
                }
              }

              // Eğer fiyat bilgisi varsa ürüne ekle, yoksa varsayılan değerleri ekle
              if (priceInfo) {
                product.pricing = priceInfo;
              } else {
                product.pricing = {
                  price: null,
                  currency: "TRY",
                  userTypeId: userTypeId
                };
              }
            } catch (priceError) {
              console.error("Fiyat bilgisi alınırken hata:", priceError);
              // Hata durumunda minimum fiyat bilgisi ekle
              product.pricing = {
                price: null,
                currency: "TRY",
                userTypeId: userTypeId
              };
            }
          }
        } catch (userError) {
          console.error("Kullanıcı bilgileri alınırken hata:", userError);
        }
      }
      
      // Ürünün rule_id'si varsa kuralları al
      if (product.rule_id) {
        try {
          // Kural bilgisini getir
          const rule = await prisma.productrules.findUnique({
            where: { id: product.rule_id }
          });
          
          if (rule) {
            // Saçak bilgisini ekle
            product.canHaveFringe = rule.can_have_fringe;
            
            // Varsayılan saçak durumunu ekle (ürüne göre kontrol etmek gerekirse burayı değiştirin)
            product.hasFringe = false;
            if (rule.can_have_fringe) {
              // Eğer saçaklı olabiliyorsa, her iki seçeneği de sunabiliriz
              product.hasFringe = true; // veya false, isteğe bağlı
            }
            
            // Kesim tiplerini getir
            const cutTypes = await prisma.productrulecuttypes.findMany({
              where: { rule_id: product.rule_id },
              include: {
                cuttypes: true
              }
            });
            
            if (cutTypes && cutTypes.length > 0) {
              product.cutTypes = cutTypes.map(ct => ({
                id: ct.cuttypes.id,
                name: ct.cuttypes.name
              }));
            } else {
              product.cutTypes = [];
            }
            
            // Boyut seçeneklerini getir
            const sizeOptions = await prisma.productsizeoptions.findMany({
              where: { rule_id: product.rule_id }
            });
            
            // Mevcut stok varyasyonlarını getir
            const variations = await prisma.productvariations.findMany({
              where: { product_id: productId }
            });
            
            if (sizeOptions && sizeOptions.length > 0) {
              // Her bir boyut seçeneği için stok bilgisini ekle
              product.sizeOptions = sizeOptions.map(so => {
                // Her zaman spesifik boyut için stok ara (tam eşleşme)
                const stockForSize = variations.find(v => 
                  v.width === so.width && v.height === so.height
                );
                
                return {
                  id: so.id,
                  width: so.width,
                  height: so.height,
                  is_optional_height: so.is_optional_height || false,
                  stockQuantity: stockForSize ? stockForSize.stock_quantity : 0
                };
              });
            } else {
              product.sizeOptions = [];
            }
          }
        } catch (ruleError) {
          console.error("Ürün kuralları alınırken hata:", ruleError);
        }
      }
      
      return product;
    } catch (error) {
      console.error('Ürün getirme hatası:', error);
      throw new Error('Ürün bulunamadı');
    }
  }
  
  /**
   * Koleksiyona ait tüm ürünleri getir
   */
  async getProductsByCollection(collectionId: string, userId?: string) {
    try {
      const products = await prisma.product.findMany({
        where: { collectionId },
        include: {
          collection: true
        }
      });
      
      // Ürünlere fiyat bilgisi ekle
      for (const product of products as ExtendedProduct[]) {
        // Eğer kullanıcı ID'si belirtilmişse fiyat bilgisini ekle
        if (userId) {
          try {
            // Kullanıcı bilgilerini getir
            const user = await prisma.user.findUnique({
              where: { userId },
              include: {
                userType: true
              }
            });

            if (user) {
              // Kullanıcının müşteri tipi ID'sini al
              const userTypeId = user.userTypeId;
              // Kullanıcının bağlı olduğu mağaza ID'si
              const storeId = user.store_id;

              try {
                let priceInfo;
                
                if (storeId) {
                  // Eğer kullanıcı bir mağazaya bağlıysa, mağazanın fiyat listesini bul
                  const storePriceList = await prisma.storePriceList.findFirst({
                    where: { store_id: storeId },
                    include: { PriceList: true }
                  });
                  
                  if (storePriceList && storePriceList.PriceList) {
                    // Fiyat listesinin geçerlilik kontrolü
                    priceInfo = await this.getPriceInfoFromPriceList(
                      storePriceList.PriceList, 
                      product.collectionId, 
                      userTypeId
                    );
                  }
                }
                
                // Eğer mağaza bazlı fiyat bulunamazsa, varsayılan fiyat listesine bak
                if (!priceInfo) {
                  const defaultPriceList = await prisma.priceList.findFirst({
                    where: { is_default: true }
                  });
                  
                  if (defaultPriceList) {
                    // Varsayılan fiyat listesinin geçerlilik kontrolü
                    priceInfo = await this.getPriceInfoFromPriceList(
                      defaultPriceList, 
                      product.collectionId, 
                      userTypeId
                    );
                  }
                }

                // Eğer fiyat bilgisi varsa ürüne ekle, yoksa varsayılan değerleri ekle
                if (priceInfo) {
                  product.pricing = priceInfo;
                } else {
                  product.pricing = {
                    price: null,
                    currency: "TRY",
                    userTypeId: userTypeId
                  };
                }
              } catch (priceError) {
                console.error("Fiyat bilgisi alınırken hata:", priceError);
                // Hata durumunda minimum fiyat bilgisi ekle
                product.pricing = {
                  price: null,
                  currency: "TRY",
                  userTypeId: userTypeId
                };
              }
            }
          } catch (userError) {
            console.error("Kullanıcı bilgileri alınırken hata:", userError);
          }
        }

        // Ürünün rule_id'si varsa kuralları al (tüm ürünler için)
        if (product.rule_id) {
          try {
            // Kural bilgisini getir
            const rule = await prisma.productrules.findUnique({
              where: { id: product.rule_id }
            });
            
            if (rule) {
              // Saçak bilgisini ekle
              product.canHaveFringe = rule.can_have_fringe;
              product.hasFringe = false;
              
              // Kesim tiplerini getir
              const cutTypes = await prisma.productrulecuttypes.findMany({
                where: { rule_id: product.rule_id },
                include: {
                  cuttypes: true
                }
              });
              
              if (cutTypes && cutTypes.length > 0) {
                product.cutTypes = cutTypes.map(ct => ({
                  id: ct.cuttypes.id,
                  name: ct.cuttypes.name
                }));
              } else {
                product.cutTypes = [];
              }
              
              // Boyut seçeneklerini getir
              const sizeOptions = await prisma.productsizeoptions.findMany({
                where: { rule_id: product.rule_id }
              });
              
              // Mevcut stok varyasyonlarını getir
              const variations = await prisma.productvariations.findMany({
                where: { product_id: product.productId }
              });
              
              if (sizeOptions && sizeOptions.length > 0) {
                // Her bir boyut seçeneği için stok bilgisini ekle
                product.sizeOptions = sizeOptions.map(so => {
                  // Her zaman spesifik boyut için stok ara (tam eşleşme)
                  const stockForSize = variations.find(v => 
                    v.width === so.width && v.height === so.height
                  );
                  
                  return {
                    id: so.id,
                    width: so.width,
                    height: so.height,
                    is_optional_height: so.is_optional_height || false,
                    stockQuantity: stockForSize ? stockForSize.stock_quantity : 0
                  };
                });
              } else {
                product.sizeOptions = [];
              }
            }
          } catch (ruleError) {
            console.error("Ürün kuralları alınırken hata:", ruleError);
            // Hata durumunda boş değerler ata
            product.cutTypes = [];
            product.sizeOptions = [];
            product.canHaveFringe = false;
            product.hasFringe = false;
          }
        } else {
          // Kural yoksa boş değerler ata
          product.cutTypes = [];
          product.sizeOptions = [];
          product.canHaveFringe = false;
          product.hasFringe = false;
        }
      }

      return products as ExtendedProduct[];
    } catch (error) {
      console.error('Koleksiyon ürünlerini getirme hatası:', error);
      throw new Error('Koleksiyon ürünleri getirilemedi');
    }
  }
  
  /**
   * Ürün görseli için presigned URL oluştur
   */
  private async getPresignedImageUrl(imageUrl: string): Promise<string> {
    try {
      return await tebiService.getPresignedUrlFromProductImage(imageUrl);
    } catch (error) {
      console.error('Presigned URL oluşturma hatası:', error);
      throw error;
    }
  }
  
  /**
   * Ürün kuralına göre varyasyonları yeniden oluştur
   */
  async regenerateVariationsForProduct(productId: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { productId },
        include: {
          productrules: {
            include: {
              productsizeoptions: true,
              productrulecuttypes: {
                include: {
                  cuttypes: true
                }
              }
            }
          }
        }
      });

      if (!product) {
        throw new Error('Ürün bulunamadı');
      }

      // Eğer ürünün kuralı yoksa, sadece temel varyasyon oluştur
      if (!product.rule_id || !product.productrules) {
        // Mevcut varyasyonları sil
        await prisma.productvariations.deleteMany({
          where: { product_id: productId }
        });

        // Temel varyasyon oluştur
        await prisma.productvariations.create({
          data: {
            product_id: productId,
            width: 100,
            height: 100,
            stock_quantity: 0,
            has_fringe: false
          }
        });

        console.log(`Ürün ${productId} için temel varyasyon oluşturuldu`);
        return;
      }

      const rule = product.productrules;
      
      // Mevcut stok bilgilerini koru
      const existingVariations = await prisma.productvariations.findMany({
        where: { product_id: productId }
      });

      // Mevcut varyasyonları sil
      await prisma.productvariations.deleteMany({
        where: { product_id: productId }
      });

      // Yeni varyasyonları oluştur
      const sizeOptions = rule.productsizeoptions;
      
      if (sizeOptions && sizeOptions.length > 0) {
        for (const sizeOption of sizeOptions) {
          // Mevcut stok bilgisini bul
          const existingStock = existingVariations.find(v => 
            v.width === sizeOption.width && v.height === sizeOption.height
          );

          // Varyasyon oluştur
          await prisma.productvariations.create({
            data: {
              product_id: productId,
              width: sizeOption.width,
              height: sizeOption.height,
              stock_quantity: existingStock ? existingStock.stock_quantity : 0,
              has_fringe: false,
              cut_type_id: null
            }
          });
        }
      } else {
        // Boyut seçeneği yoksa varsayılan varyasyon oluştur
        const existingStock = existingVariations.find(v => 
          v.width === 100 && v.height === 100
        );

        await prisma.productvariations.create({
          data: {
            product_id: productId,
            width: 100,
            height: 100,
            stock_quantity: existingStock ? existingStock.stock_quantity : 0,
            has_fringe: false,
            cut_type_id: null
          }
        });
      }

      console.log(`Ürün ${productId} için varyasyonlar yeniden oluşturuldu`);
    } catch (error) {
      console.error('Varyasyon yeniden oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Ürün güncelle
   */
  async updateProduct(productId: string, data: {
    name?: string
    description?: string
    productImage?: string
    collectionId?: string
    rule_id?: number | null
  }) {
    try {
      // Mevcut ürün bilgisini al
      const currentProduct = await prisma.product.findUnique({
        where: { productId }
      });

      if (!currentProduct) {
        throw new Error('Ürün bulunamadı');
      }

      const updateData: Prisma.ProductUncheckedUpdateInput = {};
      
      // Sadece belirtilen alanları güncelle
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.productImage !== undefined) updateData.productImage = data.productImage;
      if (data.rule_id !== undefined) updateData.rule_id = data.rule_id;
      
      // Eğer koleksiyon ID'si değiştiriliyorsa, yeni koleksiyonun varlığını kontrol et
      if (data.collectionId) {
        const collection = await prisma.collection.findUnique({
          where: { collectionId: data.collectionId }
        });
        
        if (!collection) {
          throw new Error(`${data.collectionId} ID'li koleksiyon bulunamadı`);
        }
        
        updateData.collectionId = data.collectionId;
      }
      
      // Kural değişip değişmediğini kontrol et
      const ruleChanged = data.rule_id !== undefined && data.rule_id !== currentProduct.rule_id;
      
      const updatedProduct = await prisma.product.update({
        where: { productId },
        data: updateData,
        include: {
          collection: true
        }
      }) as ExtendedProduct;

      // Eğer kural değiştiyse varyasyonları yeniden oluştur
      if (ruleChanged) {
        await this.regenerateVariationsForProduct(productId);
        console.log(`Ürün ${productId} kuralı değiştiği için varyasyonlar yeniden oluşturuldu`);
      }
      
      return updatedProduct;
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      throw error;
    }
  }
  
  /**
   * Ürün sil
   */
  async deleteProduct(productId: string) {
    try {
      return await prisma.product.delete({
        where: { productId }
      });
    } catch (error) {
      console.error('Ürün silme hatası:', error);
      throw new Error('Ürün silinemedi');
    }
  }
  
  /**
   * Stok güncelle - Ürün kurallarına göre stok miktarını günceller
   */
  async updateStock(productId: string, stockData: {
    width: number;
    height: number;
    quantity: number;
  }) {
    try {
      // Ürünün var olup olmadığını kontrol et
      const product = await prisma.product.findUnique({
        where: { productId },
        include: {
          productrules: true
        }
      });
      
      if (!product) {
        throw new Error('Ürün bulunamadı');
      }
      
      // Ürün kuralına göre ölçülerin geçerli olup olmadığını kontrol et
      if (product.rule_id) {
        // Önce tam eşleşme ara (is_optional_height: false durumlar için)
        let sizeOption = await prisma.productsizeoptions.findFirst({
          where: {
            rule_id: product.rule_id,
            width: stockData.width,
            height: stockData.height
          }
        });
        
        // Tam eşleşme bulunamazsa, opsiyonel yükseklik kontrolü yap
        if (!sizeOption) {
          sizeOption = await prisma.productsizeoptions.findFirst({
            where: {
              rule_id: product.rule_id,
              width: stockData.width,
              is_optional_height: true
            }
          });
          
          if (sizeOption) {
            // Opsiyonel yükseklik bulundu, maksimum değer kontrolü yap
            if (stockData.height > sizeOption.height) {
              throw new Error(`Bu genişlik (${stockData.width}) için maksimum yükseklik değeri: ${sizeOption.height}cm'dir`);
            }
          }
        }
        
        if (!sizeOption) {
          throw new Error(`Belirtilen ölçüler (${stockData.width}x${stockData.height}) bu ürün için geçerli değil`);
        }
      }
      
      // Kullanılacak yükseklik değerini belirle - artık bu değer kesinlikle veritabanındaki değer olacak
      let heightToUse = stockData.height; // Bu zaten doğrulanmış bir değer
      
      // Bu ebatta varyasyon daha önce eklenmiş mi kontrol et
      const existingVariation = await prisma.productvariations.findFirst({
        where: {
          product_id: productId,
          width: stockData.width,
          height: heightToUse
        }
      });
      
      if (existingVariation) {
        // Varolan varyasyonu güncelle
        await prisma.productvariations.update({
          where: { id: existingVariation.id },
          data: { 
            stock_quantity: stockData.quantity,
            // Kesim tipi ve saçak değerlerini null yap
            cut_type_id: null,
            has_fringe: false
          }
        });
      } else {
        // Yeni varyasyon oluştur
        await prisma.productvariations.create({
          data: {
            product_id: productId,
            width: stockData.width,
            height: heightToUse,
            stock_quantity: stockData.quantity,
            // Kesim tipi ve saçak değerlerini varsayılan değerlere ayarla
            cut_type_id: null,
            has_fringe: false
          }
        });
      }
      
      // Ürün varyasyonlarını getir
      const variations = await prisma.productvariations.findMany({
        where: { product_id: productId }
      });
      
      // Ürünü getir ve döndür
      const updatedProduct = await this.getProductById(productId);
      
      // Varyasyonları da ekle
      return {
        ...updatedProduct,
        variations: variations.map(v => {
          return {
            width: v.width,
            height: v.height, // Gerçek yükseklik değerini kullan
            stockQuantity: v.stock_quantity
          };
        })
      };
    } catch (error) {
      console.error('Stok güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Tüm ürün kurallarını getir
   */
  async getAllProductRules() {
    try {
      const rules = await prisma.productrules.findMany({
        where: { is_active: true },
        orderBy: { name: 'asc' }
      });
      
      return rules;
    } catch (error) {
      console.error('Ürün kuralları getirme hatası:', error);
      throw new Error('Ürün kuralları getirilemedi');
    }
  }

  /**
   * Belirli bir kurala sahip tüm ürünlerin varyasyonlarını yeniden oluştur
   */
  async regenerateVariationsForRule(ruleId: number) {
    try {
      const products = await prisma.product.findMany({
        where: { rule_id: ruleId }
      });

      console.log(`Kural ${ruleId} için ${products.length} ürünün varyasyonları yeniden oluşturuluyor...`);

      for (const product of products) {
        try {
          await this.regenerateVariationsForProduct(product.productId);
          console.log(`✓ Ürün ${product.productId} (${product.name}) varyasyonları güncellendi`);
        } catch (error) {
          console.error(`✗ Ürün ${product.productId} için varyasyon güncelleme hatası:`, error);
        }
      }

      return {
        success: true,
        processedProducts: products.length,
        ruleId: ruleId
      };
    } catch (error) {
      console.error('Toplu varyasyon güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Tüm ürünlerin varyasyonlarını yeniden oluştur
   */
  async regenerateAllVariations() {
    try {
      const products = await prisma.product.findMany();

      console.log(`Tüm ${products.length} ürünün varyasyonları yeniden oluşturuluyor...`);

      let successCount = 0;
      let errorCount = 0;

      for (const product of products) {
        try {
          await this.regenerateVariationsForProduct(product.productId);
          successCount++;
          console.log(`✓ Ürün ${product.productId} (${product.name}) varyasyonları güncellendi`);
        } catch (error) {
          errorCount++;
          console.error(`✗ Ürün ${product.productId} için varyasyon güncelleme hatası:`, error);
        }
      }

      return {
        success: true,
        totalProducts: products.length,
        successCount: successCount,
        errorCount: errorCount
      };
    } catch (error) {
      console.error('Tüm varyasyonları güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Ürünün kurallarına göre geçerli ölçüleri, kesim tiplerini ve varyasyon seçeneklerini getir
   */
  async getProductVariationOptions(productId: string) {
    try {
      // Ürünün var olup olmadığını kontrol et
      const product = await prisma.product.findUnique({
        where: { productId }
      });
      
      if (!product) {
        throw new Error('Ürün bulunamadı');
      }
      
      // Eğer ürünün kural ID'si yoksa boş sonuç döndür
      if (!product.rule_id) {
        return {
          sizeOptions: [],
          cutTypes: [],
          canHaveFringe: false,
          variations: []
        };
      }
      
      // Ürün kuralını getir
      const rule = await prisma.productrules.findUnique({
        where: { id: product.rule_id }
      });
      
      if (!rule) {
        throw new Error('Ürün kuralı bulunamadı');
      }
      
      // Boyut seçeneklerini getir
      const sizeOptions = await prisma.productsizeoptions.findMany({
        where: { rule_id: product.rule_id }
      });
      
      // Kesim tiplerini getir
      const cutTypes = await prisma.productrulecuttypes.findMany({
        where: { rule_id: product.rule_id },
        include: {
          cuttypes: true
        }
      });
      
      // Mevcut stok varyasyonlarını getir
      const variations = await prisma.productvariations.findMany({
        where: { product_id: productId }
      });
      
      // Her bir boyut seçeneği için stok miktarını hesapla
      const sizeOptionsWithStock = sizeOptions.map(so => {
        // Her zaman spesifik boyut için stok ara (tam eşleşme)
        const stockForSize = variations.find(v => 
          v.width === so.width && v.height === so.height
        );
        
        return {
          id: so.id,
          width: so.width,
          height: so.height,
          is_optional_height: so.is_optional_height || false,
          stockQuantity: stockForSize ? stockForSize.stock_quantity : 0
        };
      });
      
      return {
        sizeOptions: sizeOptionsWithStock,
        cutTypes: cutTypes.map(ct => ({
          id: ct.cuttypes.id,
          name: ct.cuttypes.name
        })),
        canHaveFringe: rule.can_have_fringe || false,
        variations: variations.map(v => {
          return {
            width: v.width,
            height: v.height,
            stockQuantity: v.stock_quantity
          };
        })
      };
    } catch (error) {
      console.error('Ürün varyasyon seçenekleri getirme hatası:', error);
      throw error;
    }
  }
} 