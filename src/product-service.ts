import { PrismaClient, Prisma } from '../generated/prisma'
import { TebiService } from './utils/tebi-service';

// Ürün veri modelini tipini genişlet
interface Product extends Prisma.ProductGetPayload<{include: {collection: true}}> {
  presignedImageUrl?: string; // Görsel için presigned URL'ı saklamak üzere opsiyonel alan
}

const prisma = new PrismaClient()
const tebiService = new TebiService();

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
      const products = await prisma.product.findMany({
        include: {
          collection: true
        }
      });
      
      // Ürün görsellerine presigned URL ekle
      for (const product of products as Product[]) {
        if (product.productImage && product.productImage.includes('tebi.io')) {
          try {
            // Görseller için presigned URL oluştur
            product.presignedImageUrl = await this.getPresignedImageUrl(product.productImage);
          } catch (imageError) {
            console.error(`Ürün ID ${product.productId} için presigned URL oluşturulamadı:`, imageError);
            // Hatayı yutarak işleme devam et
          }
        }
      }
      
      return products as Product[];
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
      const product = await prisma.product.findUnique({
        where: { productId },
        include: {
          collection: true
        }
      }) as Product | null;
      
      if (product && product.productImage && product.productImage.includes('tebi.io')) {
        try {
          // Görsel için presigned URL oluştur
          product.presignedImageUrl = await this.getPresignedImageUrl(product.productImage);
        } catch (imageError) {
          console.error(`Ürün ID ${product.productId} için presigned URL oluşturulamadı:`, imageError);
          // Hatayı yutarak işleme devam et
        }
      }
      
      return product;
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
      const products = await prisma.product.findMany({
        where: { collectionId },
        include: {
          collection: true
        }
      });
      
      // Ürün görsellerine presigned URL ekle
      for (const product of products as Product[]) {
        if (product.productImage && product.productImage.includes('tebi.io')) {
          try {
            // Görseller için presigned URL oluştur
            product.presignedImageUrl = await this.getPresignedImageUrl(product.productImage);
          } catch (imageError) {
            console.error(`Ürün ID ${product.productId} için presigned URL oluşturulamadı:`, imageError);
            // Hatayı yutarak işleme devam et
          }
        }
      }
      
      return products as Product[];
    } catch (error) {
      console.error('Koleksiyon ürünlerini getirme hatası:', error)
      throw new Error('Koleksiyon ürünleri getirilemedi')
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
      
      const updatedProduct = await prisma.product.update({
        where: { productId },
        data: updateData,
        include: {
          collection: true
        }
      }) as Product;
      
      // Ürün görsellerine presigned URL ekle
      if (updatedProduct.productImage && updatedProduct.productImage.includes('tebi.io')) {
        try {
          // Görsel için presigned URL oluştur
          updatedProduct.presignedImageUrl = await this.getPresignedImageUrl(updatedProduct.productImage);
        } catch (imageError) {
          console.error(`Güncellenmiş ürün ID ${updatedProduct.productId} için presigned URL oluşturulamadı:`, imageError);
          // Hatayı yutarak işleme devam et
        }
      }
      
      return updatedProduct;
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