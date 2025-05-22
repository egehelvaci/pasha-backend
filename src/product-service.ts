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
            
            if (sizeOptions && sizeOptions.length > 0) {
              product.sizeOptions = sizeOptions.map(so => ({
                id: so.id,
                width: so.width,
                height: so.height,
                is_optional_height: so.is_optional_height || false
              }));
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
   * Stok güncelle
   */
  async updateStock(productId: string, quantity: number) {
    try {
      // Ürünün var olup olmadığını kontrol et
      const product = await prisma.product.findUnique({
        where: { productId }
      });
      
      if (!product) {
        throw new Error('Ürün bulunamadı');
      }
      
      // Ürünün varyasyonları üzerinden stok güncellemesi yapalım
      // Eğer hiç varyasyon yoksa, yeni bir varsayılan varyasyon oluşturalım
      const variations = await prisma.productvariations.findMany({
        where: { product_id: productId }
      });
      
      if (variations.length === 0) {
        // Varyasyon yoksa yeni oluştur
        await prisma.productvariations.create({
          data: {
            product_id: productId,
            width: 100, // Default width
            height: 100, // Default height
            stock_quantity: quantity,
            has_fringe: false // Default fringe status
          }
        });
      } else {
        // İlk varyasyonu güncelle (varsayılan olarak)
        await prisma.productvariations.update({
          where: { id: variations[0].id },
          data: { stock_quantity: quantity }
        });
      }
      
      return await this.getProductById(productId);
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
} 