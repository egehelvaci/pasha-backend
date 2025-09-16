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
  stockAreaM2?: number;
  pieceAreaM2?: number;
}

// Ürün veri modelini tipini genişlet
interface ExtendedProduct extends Prisma.ProductGetPayload<{include: {collection: true}}> {
  pricing?: {
    price: number | null;
    currency: string;
    userTypeId: number;
  };
  purchasePricing?: {
    price_per_square_meter: number;
    currency: string;
    list_name: string;
  } | null;
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
   * Varsayılan alış fiyat listesini getir
   */
  private async getDefaultPurchasePriceList() {
    try {
      return await prisma.purchasePriceList.findFirst({
        where: { 
          name: 'Varsayılan Alış Fiyat Listesi',
          is_active: true 
        },
        include: {
          details: {
            include: {
              collection: {
                select: {
                  collectionId: true,
                  name: true,
                  code: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Varsayılan alış fiyat listesi getirme hatası:', error);
      return null;
    }
  }

  /**
   * Koleksiyon için alış fiyatını getir
   */
  private getPurchasePriceForCollection(purchasePriceList: any, collectionId: string) {
    if (!purchasePriceList || !purchasePriceList.details) {
      return {
        price_per_square_meter: 0.00,
        currency: 'USD',
        list_name: 'Alış fiyat listesi bulunamadı'
      };
    }

    const detail = purchasePriceList.details.find((d: any) => d.collection_id === collectionId);
    return detail ? {
      price_per_square_meter: parseFloat(parseFloat(detail.price_per_square_meter.toString()).toFixed(2)),
      currency: purchasePriceList.currency || 'USD',
      list_name: purchasePriceList.name
    } : {
      price_per_square_meter: 0.00,
      currency: 'USD',
      list_name: 'Bu koleksiyon için alış fiyat bulunamadı'
    };
  }

  /**
   * Tüm ürünleri getir - OPTİMİZE EDİLMİŞ VERSİYON
   */
  async getAllProducts(userId?: string, options?: {
    page?: number;
    limit?: number;
    collectionId?: string;
    search?: string;
    hasStock?: boolean;
  }) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 50; // Limit sınırlaması kaldırıldı
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

      // Alış fiyat listesini getir
      const purchasePriceList = await this.getDefaultPurchasePriceList();

      // Stok filtresi varsa, önce tüm ürünleri al
      let products;
      let totalCount;
      
      if (options?.hasStock !== undefined) {
        // Stok filtresi var - tüm ürünleri al
        products = await prisma.product.findMany({
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
          orderBy: { createdAt: 'desc' }
        });
        totalCount = products.length;
      } else {
        // Normal pagination
        totalCount = await prisma.product.count({ where: whereCondition });
        products = await prisma.product.findMany({
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
      }

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
              stockQuantity: stockForSize ? stockForSize.stock_quantity : 0,
              stockAreaM2: stockForSize ? Number(stockForSize.stock_area_m2 || 0) : 0
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

      // Stok filtresi uygula
      let filteredProducts = processedProducts;
      if (options?.hasStock !== undefined) {
        filteredProducts = processedProducts.filter(product => {
          const hasStock = this.checkProductHasStock(product);
          return options.hasStock ? hasStock : !hasStock;
        });
        
        // Stok filtresi sonrası pagination uygula
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        // Her durumda alış fiyat bilgilerini ekle
        paginatedProducts.forEach((product: any) => {
          if (!product.purchasePricing) { // Daha önce eklenmemişse ekle
            const purchasePrice = this.getPurchasePriceForCollection(purchasePriceList, product.collectionId);
            product.purchasePricing = purchasePrice;
          }
        });
        
        return {
          products: paginatedProducts,
          pagination: {
            page,
            limit,
            total: filteredProducts.length,
            totalPages: Math.ceil(filteredProducts.length / limit),
            hasMore: endIndex < filteredProducts.length
          }
        };
      }

      // Her durumda alış fiyat bilgilerini ekle
      filteredProducts.forEach((product: any) => {
        if (!product.purchasePricing) { // Daha önce eklenmemişse ekle
          const purchasePrice = this.getPurchasePriceForCollection(purchasePriceList, product.collectionId);
          product.purchasePricing = purchasePrice;
        }
      });

      return {
        products: filteredProducts,
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
      // Alış fiyat listesini getir
      const purchasePriceList = await this.getDefaultPurchasePriceList();

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

              // Alış fiyat bilgisini ekle
              if (purchasePriceList) {
                const purchasePrice = this.getPurchasePriceForCollection(purchasePriceList, product.collectionId);
                product.purchasePricing = purchasePrice;
              }

            } catch (priceError) {
              console.error("Fiyat bilgisi alınırken hata:", priceError);
              // Hata durumunda minimum fiyat bilgisi ekle
              product.pricing = {
                price: null,
                currency: "TRY",
                userTypeId: userTypeId
              };
              
              // Alış fiyat bilgisini ekle (hata durumunda da)
              if (purchasePriceList) {
                const purchasePrice = this.getPurchasePriceForCollection(purchasePriceList, product.collectionId);
                product.purchasePricing = purchasePrice;
              }
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
                
                const pieceAreaM2 = (so.width * so.height) / 10000;
                return {
                  id: so.id,
                  width: so.width,
                  height: so.height,
                  is_optional_height: so.is_optional_height || false,
                  stockQuantity: stockForSize ? stockForSize.stock_quantity : 0,
                  stockAreaM2: stockForSize ? Number(stockForSize.stock_area_m2 || 0) : 0,
                  pieceAreaM2: pieceAreaM2
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
      
      // Alış fiyat bilgisini ekle
      if (purchasePriceList) {
        const purchasePrice = this.getPurchasePriceForCollection(purchasePriceList, product.collectionId);
        product.purchasePricing = purchasePrice;
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
                  
                  const pieceAreaM2 = (so.width * so.height) / 10000;
                  return {
                    id: so.id,
                    width: so.width,
                    height: so.height,
                    is_optional_height: so.is_optional_height || false,
                    stockQuantity: stockForSize ? stockForSize.stock_quantity : 0,
                    stockAreaM2: stockForSize ? Number(stockForSize.stock_area_m2 || 0) : 0,
                    pieceAreaM2: pieceAreaM2
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
   * Ürün sil - Tüm ilişkili verilerle birlikte
   */
  async deleteProduct(productId: string) {
    try {
      // Önce ürünün var olup olmadığını kontrol et
      const existingProduct = await prisma.product.findUnique({
        where: { productId },
        include: {
          cart_items: {
            include: {
              carts: {
                select: { is_active: true }
              }
            }
          },
          orderItems: {
            include: {
              order: {
                select: { status: true }
              }
            }
          },
          qr_codes: true,
          productvariations: true
        }
      });

      if (!existingProduct) {
        throw new Error('Silinecek ürün bulunamadı');
      }

      // Transaction ile tüm ilişkili verileri güvenli şekilde sil
      return await prisma.$transaction(async (tx) => {
        let deletedItemsCount = 0;

        // 1. Tüm sepetlerden (aktif/pasif) bu ürünü kaldır
        if (existingProduct.cart_items.length > 0) {
          const activeCartItems = existingProduct.cart_items.filter(item => item.carts.is_active);
          const inactiveCartItems = existingProduct.cart_items.filter(item => !item.carts.is_active);
          
          console.log(`Ürün ${productId} için sepet temizliği:`);
          console.log(`  - Aktif sepetlerde: ${activeCartItems.length} öğe`);
          console.log(`  - Pasif sepetlerde: ${inactiveCartItems.length} öğe`);
          
          const { count: cartDeleteCount } = await tx.cart_items.deleteMany({
            where: { product_id: productId }
          });
          deletedItemsCount += cartDeleteCount;
          console.log(`  - Toplam ${cartDeleteCount} sepet öğesi silindi`);
        }

        // 2. Tüm siparişlerden bu ürünü kaldır
        if (existingProduct.orderItems.length > 0) {
          const pendingOrders = existingProduct.orderItems.filter(item => item.order.status === 'PENDING');
          const confirmedOrders = existingProduct.orderItems.filter(item => item.order.status !== 'PENDING');
          
          console.log(`Ürün ${productId} için sipariş temizliği:`);
          console.log(`  - Bekleyen siparişlerde: ${pendingOrders.length} öğe`);
          console.log(`  - Onaylanmış siparişlerde: ${confirmedOrders.length} öğe`);
          
          const { count: orderDeleteCount } = await tx.orderItem.deleteMany({
            where: { product_id: productId }
          });
          deletedItemsCount += orderDeleteCount;
          console.log(`  - Toplam ${orderDeleteCount} sipariş öğesi silindi`);
        }

        // 3. Tüm QR kodlarını sil
        if (existingProduct.qr_codes.length > 0) {
          console.log(`Ürün ${productId} için ${existingProduct.qr_codes.length} QR kod siliniyor...`);
          const { count: qrDeleteCount } = await tx.qRCode.deleteMany({
            where: { product_id: productId }
          });
          deletedItemsCount += qrDeleteCount;
          console.log(`  - ${qrDeleteCount} QR kod silindi`);
        }

        // 4. Ürün varyasyonlarını sil (cascade ile de silinir ama explicitly yapalım)
        if (existingProduct.productvariations.length > 0) {
          console.log(`Ürün ${productId} için ${existingProduct.productvariations.length} varyasyon siliniyor...`);
          const { count: variationDeleteCount } = await tx.productvariations.deleteMany({
            where: { product_id: productId }
          });
          deletedItemsCount += variationDeleteCount;
          console.log(`  - ${variationDeleteCount} varyasyon silindi`);
        }

        // 5. Son olarak ürünü sil
        const deletedProduct = await tx.product.delete({
          where: { productId }
        });

        console.log(`✅ Ürün ${productId} ve ${deletedItemsCount} ilişkili kayıt başarıyla silindi`);
        return deletedProduct;
      });
    } catch (error: any) {
      console.error('Ürün silme hatası:', error);
      
      // Prisma hatalarını kontrol et
      if (error.code === 'P2003') {
        throw new Error('Bu ürün başka kayıtlar tarafından kullanıldığı için silinemez');
      }
      
      if (error.code === 'P2025') {
        throw new Error('Silinecek ürün bulunamadı');
      }
      
      // Zaten fırlatılmış hata mesajını koru
      if (error.message && error.message !== 'Ürün silinemedi') {
        throw error;
      }
      
      throw new Error('Ürün silinirken beklenmeyen bir hata oluştu');
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
   * M² bazlı stok güncelle - Hem adet hem m² stok yönetimi
   */
  async updateStockAreaM2(productId: string, stockData: {
    width: number;
    height: number;
    areaM2: number;
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
      
      // Ürünün opsiyonel yükseklik olup olmadığını kontrol et
      let isOptionalHeight = false;
      if (product.rule_id) {
        const sizeOption = await prisma.productsizeoptions.findFirst({
          where: {
            rule_id: product.rule_id,
            width: stockData.width,
            is_optional_height: true
          }
        });
        isOptionalHeight = !!sizeOption;
      }

      // Bu halının tek parça alanını hesapla (cm² -> m²)
      const singlePieceAreaM2 = (stockData.width * stockData.height) / 10000;
      
      // OPSIYONEL YÜKSEKLİK: Adet hesaplanmaz, sadece bilgi amaçlı
      // HAZIR KESİM: M²'den adet hesapla
      const calculatedQuantity = isOptionalHeight ? 0 : Math.floor(stockData.areaM2 / singlePieceAreaM2);
      
      // Kullanılacak yükseklik değerini belirle
      let heightToUse = stockData.height;
      
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
        const updateData: any = {
          stock_area_m2: stockData.areaM2,
          cut_type_id: null,
          has_fringe: false
        };
        
        // OPSIYONEL YÜKSEKLİK: stock_quantity değişmez
        // HAZIR KESİM: stock_quantity güncellenir
        if (!isOptionalHeight) {
          updateData.stock_quantity = calculatedQuantity;
        }
        
        await prisma.productvariations.update({
          where: { id: existingVariation.id },
          data: updateData
        });
      } else {
        // Yeni varyasyon oluştur
        await prisma.productvariations.create({
          data: {
            product_id: productId,
            width: stockData.width,
            height: heightToUse,
            stock_quantity: calculatedQuantity,
            stock_area_m2: stockData.areaM2,
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
          const pieceAreaM2 = (v.width * v.height) / 10000;
          return {
            width: v.width,
            height: v.height,
            stockQuantity: v.stock_quantity,
            stockAreaM2: Number(v.stock_area_m2 || 0),
            pieceAreaM2: pieceAreaM2,
            calculatedFromArea: v.stock_area_m2 ? Math.floor(Number(v.stock_area_m2) / pieceAreaM2) : 0
          };
        })
      };
    } catch (error) {
      console.error('M² stok güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Hibrit stok güncelle - Hem adet hem m² desteği
   */
  async updateStockHybrid(productId: string, stockData: {
    width: number;
    height: number;
    quantity?: number;
    areaM2?: number;
    updateMode: 'quantity' | 'area' | 'both';
  }) {
    try {
      // En az bir değer gönderilmeli (0 dahil geçerli)
      if (stockData.quantity === undefined && stockData.areaM2 === undefined) {
        throw new Error('Adet veya m² değerlerinden en az biri belirtilmelidir');
      }

      // Bu halının tek parça alanını hesapla
      const singlePieceAreaM2 = (stockData.width * stockData.height) / 10000;

      let finalQuantity = 0;
      let finalAreaM2 = 0;

      // Güncelleme moduna göre hesapla
      switch (stockData.updateMode) {
        case 'quantity':
          // Adet bazlı güncelleme - HAZIR KESİM İÇİN m² = 0
          finalQuantity = stockData.quantity || 0;
          finalAreaM2 = 0; // Hazır kesim ürünlerde m² stok tutulmaz
          break;
          
        case 'area':
          // M² bazlı güncelleme
          finalAreaM2 = stockData.areaM2 || 0;
          finalQuantity = Math.floor(finalAreaM2 / singlePieceAreaM2);
          break;
          
        case 'both':
          // Her ikisi de belirtildi - tutarlılık kontrolü
          const calculatedQuantityFromArea = Math.floor((stockData.areaM2 || 0) / singlePieceAreaM2);
          const calculatedAreaFromQuantity = (stockData.quantity || 0) * singlePieceAreaM2;
          
          // Küçük tolerans (0.1 m²) ile kontrol et
          if (Math.abs(calculatedAreaFromQuantity - (stockData.areaM2 || 0)) > 0.1) {
            return {
              error: true,
              message: `Adet ve m² değerleri tutarsız. ${stockData.quantity} adet = ${calculatedAreaFromQuantity.toFixed(2)}m², ancak ${stockData.areaM2}m² belirtildi.`,
              suggestions: {
                fromQuantity: { quantity: stockData.quantity, areaM2: calculatedAreaFromQuantity },
                fromArea: { quantity: calculatedQuantityFromArea, areaM2: stockData.areaM2 }
              }
            };
          }
          
          finalQuantity = stockData.quantity || 0;
          finalAreaM2 = stockData.areaM2 || 0;
          break;
      }

      // Normal updateStock mantığını kullan ama ek alan bilgisini de güncelle
      const result = await this.updateStock(productId, {
        width: stockData.width,
        height: stockData.height,
        quantity: finalQuantity
      });

      // M² bilgisini ayrıca güncelle
      await prisma.productvariations.updateMany({
        where: {
          product_id: productId,
          width: stockData.width,
          height: stockData.height
        },
        data: {
          stock_area_m2: finalAreaM2
        }
      });

      return {
        ...result,
        stockInfo: {
          quantity: finalQuantity,
          areaM2: finalAreaM2,
          pieceAreaM2: singlePieceAreaM2,
          updateMode: stockData.updateMode
        }
      };
    } catch (error) {
      console.error('Hibrit stok güncelleme hatası:', error);
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

  /**
   * Ürünün stok durumunu kontrol eder
   * 1. sizeOptions varsa → is_optional_height'a göre:
   *    - false: stockQuantity > 0 (hazır kesim)
   *    - true: stockAreaM2 > 0 (opsiyonel yükseklik, m² bazlı)
   * 2. Yoksa productvariations kontrol et → stock_area_m2 > 0 VEYA stock_quantity > 0
   * 3. Hiçbiri yoksa false döndür (legacy stock field Product modelinde yok)
   */
  private checkProductHasStock(product: any): boolean {
    // 1. sizeOptions varsa, is_optional_height'a göre kontrol et
    if (product.sizeOptions && product.sizeOptions.length > 0) {
      const hasStock = product.sizeOptions.some((sizeOption: any) => {
        if (sizeOption.is_optional_height === true) {
          // Opsiyonel yükseklik: m² bazlı stok kontrolü
          return sizeOption.stockAreaM2 && sizeOption.stockAreaM2 > 0;
        } else {
          // Hazır kesim: adet bazlı stok kontrolü
          return sizeOption.stockQuantity && sizeOption.stockQuantity > 0;
        }
      });
      
      return hasStock;
    }

    // 2. sizeOptions yoksa productvariations kontrol et
    if (product.productvariations && product.productvariations.length > 0) {
      return product.productvariations.some((variation: any) => {
        // Ürünün kurallarından bu variation'ın is_optional_height bilgisini bul
        let isOptionalHeight = false;
        if (product.productrules?.productsizeoptions) {
          const sizeOption = product.productrules.productsizeoptions.find((so: any) => 
            so.width === variation.width && so.height === variation.height
          );
          if (sizeOption) {
            isOptionalHeight = sizeOption.is_optional_height;
          }
        }
        
        if (isOptionalHeight === true) {
          // Opsiyonel yükseklik: m² bazlı stok kontrolü
          return variation.stock_area_m2 && Number(variation.stock_area_m2) > 0;
        } else {
          // Hazır kesim: adet bazlı stok kontrolü
          return variation.stock_quantity && variation.stock_quantity > 0;
        }
      });
    }

    // 3. Hiçbiri yoksa stok yok kabul et
    return false;
  }
} 