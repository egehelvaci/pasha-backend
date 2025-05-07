import { PrismaClient, Prisma } from '../generated/prisma'

const prisma = new PrismaClient()

export class ProductService {
  /**
   * Yeni bir ürün oluştur
   */
  async createProduct(data: {
    name: string
    description: string
    price: number
    stock: number
    width: number
    height: number
    cut: boolean
    productImage?: string
    collectionId: string
    currency?: 'TRY' | 'USD' | 'EUR'
  }) {
    try {
      // Önce koleksiyonun var olup olmadığını kontrol et
      const collection = await prisma.collection.findUnique({
        where: { collectionId: data.collectionId }
      })
      
      if (!collection) {
        throw new Error(`${data.collectionId} ID'li koleksiyon bulunamadı`)
      }
      
      // ProductCreateInput tipine uygun nesne oluştur
      const productData: Prisma.ProductUncheckedCreateInput = {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        width: data.width,
        height: data.height,
        cut: data.cut,
        productImage: data.productImage,
        collectionId: data.collectionId,
        collection_name: collection.name // Koleksiyon adını otomatik olarak ekle
      };
      
      if (data.currency) {
        productData.currency = data.currency;
      }
      
      return await prisma.product.create({
        data: productData,
        include: {
          collection: true // Ürün ile birlikte koleksiyon bilgilerini de getir
        }
      })
    } catch (error) {
      console.error('Ürün oluşturma hatası:', error)
      throw error
    }
  }
  
  /**
   * Tüm ürünleri getir
   */
  async getAllProducts() {
    try {
      return await prisma.product.findMany({
        include: {
          collection: true
        }
      })
    } catch (error) {
      console.error('Ürünleri getirme hatası:', error)
      throw new Error('Ürünler getirilemedi')
    }
  }
  
  /**
   * ID'ye göre ürün getir
   */
  async getProductById(productId: string) {
    try {
      return await prisma.product.findUnique({
        where: { productId },
        include: {
          collection: true
        }
      })
    } catch (error) {
      console.error('Ürün getirme hatası:', error)
      throw new Error('Ürün bulunamadı')
    }
  }
  
  /**
   * Koleksiyona ait tüm ürünleri getir
   */
  async getProductsByCollection(collectionId: string) {
    try {
      return await prisma.product.findMany({
        where: { collectionId },
        include: {
          collection: true
        }
      })
    } catch (error) {
      console.error('Koleksiyon ürünlerini getirme hatası:', error)
      throw new Error('Koleksiyon ürünleri getirilemedi')
    }
  }
  
  /**
   * Ürün güncelle
   */
  async updateProduct(productId: string, data: {
    name?: string
    description?: string
    price?: number
    stock?: number
    width?: number
    height?: number
    cut?: boolean
    productImage?: string
    collectionId?: string
    currency?: 'TRY' | 'USD' | 'EUR'
  }) {
    try {
      const updateData: Prisma.ProductUncheckedUpdateInput = {};
      
      // Sadece belirtilen alanları güncelle
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.stock !== undefined) updateData.stock = data.stock;
      if (data.width !== undefined) updateData.width = data.width;
      if (data.height !== undefined) updateData.height = data.height;
      if (data.cut !== undefined) updateData.cut = data.cut;
      if (data.productImage !== undefined) updateData.productImage = data.productImage;
      if (data.currency !== undefined) updateData.currency = data.currency;
      
      // Eğer koleksiyon ID'si değiştiriliyorsa, yeni koleksiyonun varlığını kontrol et
      if (data.collectionId) {
        const collection = await prisma.collection.findUnique({
          where: { collectionId: data.collectionId }
        })
        
        if (!collection) {
          throw new Error(`${data.collectionId} ID'li koleksiyon bulunamadı`)
        }
        
        updateData.collectionId = data.collectionId;
        updateData.collection_name = collection.name; // Koleksiyon adını güncelle
      }
      
      return await prisma.product.update({
        where: { productId },
        data: updateData,
        include: {
          collection: true
        }
      })
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error)
      throw error
    }
  }
  
  /**
   * Ürün sil
   */
  async deleteProduct(productId: string) {
    try {
      return await prisma.product.delete({
        where: { productId }
      })
    } catch (error) {
      console.error('Ürün silme hatası:', error)
      throw new Error('Ürün silinemedi')
    }
  }
  
  /**
   * Stok güncelle
   */
  async updateStock(productId: string, quantity: number) {
    try {
      return await prisma.product.update({
        where: { productId },
        data: {
          stock: {
            increment: quantity // Negatif değer de olabilir
          }
        }
      })
    } catch (error) {
      console.error('Stok güncelleme hatası:', error)
      throw new Error('Stok güncellenemedi')
    }
  }
} 