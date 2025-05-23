import { PrismaClient, Prisma } from '../generated/prisma';
import { TebiService } from './utils/tebi-service';

// Kesim türleri için tip tanımı
interface CutType {
  id: number;
  name: string;
}

// Boyut seçenekleri için tip tanımı
interface SizeOption {
  id: number;
  width: number;
  height: number;
  is_optional_height: boolean;
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

const prisma = new PrismaClient();
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

      // Ürün varyasyonu oluştur
      try {
        await prisma.productvariations.create({
          data: {
            product_id: product.productId,
            width: 100, // Default width
            height: 100, // Default height
            stock_quantity: 0, // Default stock
            has_fringe: false // Default fringe status
          }
        });
        console.log('Ürün varyasyonu başarıyla oluşturuldu');
      } catch (variationError) {
        console.error('Ürün varyasyonu oluşturulurken hata:', variationError);
      }
      
      return product;
    } catch (error) {
      console.error('Ürün oluşturma hatası:', error);
      throw error;
    }
  }
  
  /**
   * Tüm ürünleri getir
   */
  async getAllProducts(userId?: string) {
    try {
      const products = await prisma.product.findMany({
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
                  
                  if (storePriceList) {
                    // Mağazanın fiyat listesi varsa, bu koleksiyon için fiyat detayını bul
                    const priceDetail = await prisma.priceListDetail.findFirst({
                      where: {
                        price_list_id: storePriceList.price_list_id,
                        collection_id: product.collectionId
                      }
                    });
                    
                    if (priceDetail) {
                      // Fiyat detayı bulundu
                      priceInfo = {
                        price: priceDetail.price_per_square_meter ? parseFloat(priceDetail.price_per_square_meter.toString()) : null,
                        currency: storePriceList.PriceList.currency || "TRY",
                        userTypeId: userTypeId
                      };
                    }
                  }
                }
                
                // Eğer mağaza bazlı fiyat bulunamazsa, varsayılan fiyat listesine bak
                if (!priceInfo) {
                  const defaultPriceList = await prisma.priceList.findFirst({
                    where: { is_default: true }
                  });
                  
                  if (defaultPriceList) {
                    const defaultPriceDetail = await prisma.priceListDetail.findFirst({
                      where: {
                        price_list_id: defaultPriceList.price_list_id,
                        collection_id: product.collectionId
                      }
                    });
                    
                    if (defaultPriceDetail) {
                      priceInfo = {
                        price: defaultPriceDetail.price_per_square_meter ? parseFloat(defaultPriceDetail.price_per_square_meter.toString()) : null,
                        currency: defaultPriceList.currency || "TRY",
                        userTypeId: userTypeId
                      };
                    }
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
      }

      return products as ExtendedProduct[];
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
                
                if (storePriceList) {
                  // Mağazanın fiyat listesi varsa, bu koleksiyon için fiyat detayını bul
                  const priceDetail = await prisma.priceListDetail.findFirst({
                    where: {
                      price_list_id: storePriceList.price_list_id,
                      collection_id: product.collectionId
                    }
                  });
                  
                  if (priceDetail) {
                    // Fiyat detayı bulundu
                    priceInfo = {
                      price: priceDetail.price_per_square_meter ? parseFloat(priceDetail.price_per_square_meter.toString()) : null,
                      currency: storePriceList.PriceList.currency || "TRY",
                      userTypeId: userTypeId
                    };
                  }
                }
              }
              
              // Eğer mağaza bazlı fiyat bulunamazsa, varsayılan fiyat listesine bak
              if (!priceInfo) {
                const defaultPriceList = await prisma.priceList.findFirst({
                  where: { is_default: true }
                });
                
                if (defaultPriceList) {
                  const defaultPriceDetail = await prisma.priceListDetail.findFirst({
                    where: {
                      price_list_id: defaultPriceList.price_list_id,
                      collection_id: product.collectionId
                    }
                  });
                  
                  if (defaultPriceDetail) {
                    priceInfo = {
                      price: defaultPriceDetail.price_per_square_meter ? parseFloat(defaultPriceDetail.price_per_square_meter.toString()) : null,
                      currency: defaultPriceList.currency || "TRY",
                      userTypeId: userTypeId
                    };
                  }
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
                // Bu boyut için stok varyasyonlarını bul
                const stockForSize = variations.find(v => {
                  // Eğer yükseklik değeri opsiyonelse sadece genişliğe göre eşleştir
                  if (so.is_optional_height) {
                    return v.width === so.width;
                  } else {
                    // Aksi takdirde hem genişlik hem yükseklik eşleşmeli
                    return v.width === so.width && v.height === so.height;
                  }
                });
                
                return {
                  id: so.id,
                  width: so.width,
                  height: so.height,
                  is_optional_height: so.is_optional_height || false,
                  // Stok miktarını ekle, eğer stok yoksa 0 olarak göster
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
                  
                  if (storePriceList) {
                    // Mağazanın fiyat listesi varsa, bu koleksiyon için fiyat detayını bul
                    const priceDetail = await prisma.priceListDetail.findFirst({
                      where: {
                        price_list_id: storePriceList.price_list_id,
                        collection_id: product.collectionId
                      }
                    });
                    
                    if (priceDetail) {
                      // Fiyat detayı bulundu
                      priceInfo = {
                        price: priceDetail.price_per_square_meter ? parseFloat(priceDetail.price_per_square_meter.toString()) : null,
                        currency: storePriceList.PriceList.currency || "TRY",
                        userTypeId: userTypeId
                      };
                    }
                  }
                }
                
                // Eğer mağaza bazlı fiyat bulunamazsa, varsayılan fiyat listesine bak
                if (!priceInfo) {
                  const defaultPriceList = await prisma.priceList.findFirst({
                    where: { is_default: true }
                  });
                  
                  if (defaultPriceList) {
                    const defaultPriceDetail = await prisma.priceListDetail.findFirst({
                      where: {
                        price_list_id: defaultPriceList.price_list_id,
                        collection_id: product.collectionId
                      }
                    });
                    
                    if (defaultPriceDetail) {
                      priceInfo = {
                        price: defaultPriceDetail.price_per_square_meter ? parseFloat(defaultPriceDetail.price_per_square_meter.toString()) : null,
                        currency: defaultPriceList.currency || "TRY",
                        userTypeId: userTypeId
                      };
                    }
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
      
      const updatedProduct = await prisma.product.update({
        where: { productId },
        data: updateData,
        include: {
          collection: true
        }
      }) as ExtendedProduct;
      
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
        // Girilen genişlik ve yükseklik değerleri size options tablosunda var mı kontrol et
        const sizeOption = await prisma.productsizeoptions.findFirst({
          where: {
            rule_id: product.rule_id,
            width: stockData.width
          }
        });
        
        if (!sizeOption) {
          throw new Error('Belirtilen genişlik değeri bu ürün için geçerli değil');
        }
        
        // Eğer yükseklik opsiyonel ise, kullanıcının girdiği height değeri veritabanındaki değerle eşleşmeli
        if (sizeOption.is_optional_height) {
          if (stockData.height !== sizeOption.height) {
            throw new Error(`Bu genişlik (${stockData.width}) için geçerli yükseklik değeri: ${sizeOption.height}`);
          }
        } 
        // Eğer yükseklik opsiyonel değilse, zaten tam eşleşme şartı var
        else if (sizeOption.height !== stockData.height) {
          throw new Error(`Belirtilen ölçüler geçerli değil. Bu genişlik (${stockData.width}) için yükseklik değeri: ${sizeOption.height} olmalıdır.`);
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
      
      // Her ölçü seçeneği için stok miktarını kontrol et
      const variationsMap = new Map();
      
      // Her bir boyut için ayrı varyasyonlar oluştur
      const processedVariations = [];
      
      for (const sizeOption of sizeOptions) {
        // Bu ölçü için varyasyonları bul
        const matchingVariations = variations.filter(v => {
          // Eğer yükseklik değeri opsiyonelse sadece genişliğe göre eşleştir
          if (sizeOption.is_optional_height) {
            return v.width === sizeOption.width;
          } else {
            // Aksi takdirde hem genişlik hem yükseklik eşleşmeli
            return v.width === sizeOption.width && v.height === sizeOption.height;
          }
        });
        
        if (matchingVariations.length > 0) {
          // Bu ölçü için varyasyonlar var, her birini işle
          for (const variation of matchingVariations) {
            // Sadece width, height ve stockQuantity bilgilerini ekle
            processedVariations.push({
              width: variation.width,
              height: variation.height, // Gerçek yükseklik değerini kullan
              stockQuantity: variation.stock_quantity
            });
          }
        }
      }
      
      // Her bir boyut seçeneği için stok miktarını hesapla
      const sizeOptionsWithStock = sizeOptions.map(so => {
        // Bu boyut için stok varyasyonlarını bul
        const stockForSize = variations.find(v => {
          // Eğer yükseklik değeri opsiyonelse sadece genişliğe göre eşleştir
          if (so.is_optional_height) {
            return v.width === so.width;
          } else {
            // Aksi takdirde hem genişlik hem yükseklik eşleşmeli
            return v.width === so.width && v.height === so.height;
          }
        });
        
        return {
          id: so.id,
          width: so.width,
          height: so.height, // Gerçek yükseklik değerini kullan
          is_optional_height: so.is_optional_height || false,
          // Stok miktarını ekle, eğer stok yoksa 0 olarak göster
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
        variations: processedVariations
      };
    } catch (error) {
      console.error('Ürün varyasyon seçenekleri getirme hatası:', error);
      throw error;
    }
  }
} 