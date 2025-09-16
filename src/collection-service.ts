import prisma from './utils/prisma';
import { Currency } from '../generated/prisma';

export class CollectionService {
  /**
   * Yeni koleksiyonu varsayılan alış fiyat listesine ekle
   */
  private async addCollectionToPurchasePriceList(collectionId: string) {
    try {
      // Varsayılan alış fiyat listesini bul
      const purchasePriceList = await prisma.purchasePriceList.findFirst({
        where: { name: 'Varsayılan Alış Fiyat Listesi' }
      });

      if (!purchasePriceList) {
        console.log('Varsayılan alış fiyat listesi bulunamadı. Önce oluşturun.');
        return;
      }

      // Bu koleksiyon için zaten bir detay var mı kontrol et
      const existingDetail = await prisma.purchasePriceListDetail.findFirst({
        where: {
          purchase_price_list_id: purchasePriceList.id,
          collection_id: collectionId
        }
      });

      if (!existingDetail) {
        await prisma.purchasePriceListDetail.create({
          data: {
            purchase_price_list_id: purchasePriceList.id,
            collection_id: collectionId,
            price_per_square_meter: 0.00 // Admin tarafından düzenlenecek
          }
        });
        console.log(`Koleksiyon ${collectionId} varsayılan alış fiyat listesine eklendi`);
      }

    } catch (error) {
      console.error('Koleksiyon alış fiyat listesine eklenirken hata:', error);
      throw error;
    }
  }

  /**
   * Yeni bir koleksiyon oluştur
   */
  async createCollection(data: {
    name: string
    description?: string
    code: string
  }) {
    try {
      const collection = await prisma.collection.create({
        data: {
          name: data.name,
          description: data.description,
          code: data.code
        }
      });

      // Yeni koleksiyonu varsayılan alış fiyat listesine ekle
      try {
        await this.addCollectionToPurchasePriceList(collection.collectionId);
        console.log(`Koleksiyon ${collection.name} alış fiyat listesine eklendi`);
      } catch (error) {
        console.error('Koleksiyon alış fiyat listesine eklenirken hata:', error);
        // Bu hata koleksiyon oluşturma işlemini durdurmaz
      }

      return collection;
    } catch (error) {
      console.error('Koleksiyon oluşturma hatası:', error)
      throw new Error('Koleksiyon oluşturulamadı')
    }
  }
  
  /**
   * Tüm koleksiyonları getir
   */
  async getAllCollections(onlyActive = true, includeProducts = false) {
    try {
      return await prisma.collection.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        orderBy: { createdAt: 'asc' },
        include: {
          products: includeProducts // Koleksiyona ait ürünleri de getir
        }
      })
    } catch (error) {
      console.error('Koleksiyonları getirme hatası:', error)
      throw new Error('Koleksiyonlar getirilemedi')
    }
  }
  
  /**
   * ID'ye göre koleksiyon getir
   */
  async getCollectionById(collectionId: string, includeProducts = false) {
    try {
      return await prisma.collection.findUnique({
        where: { collectionId },
        include: {
          products: includeProducts // Koleksiyona ait ürünleri de getir
        }
      })
    } catch (error) {
      console.error('Koleksiyon getirme hatası:', error)
      throw new Error('Koleksiyon bulunamadı')
    }
  }
  
  /**
   * Kod'a göre koleksiyon getir
   */
  async getCollectionByCode(code: string, includeProducts = false) {
    try {
      return await prisma.collection.findUnique({
        where: { code },
        include: {
          products: includeProducts // Koleksiyona ait ürünleri de getir
        }
      })
    } catch (error) {
      console.error('Koleksiyon getirme hatası:', error)
      throw new Error('Koleksiyon bulunamadı')
    }
  }
  
  /**
   * Koleksiyon güncelle
   */
  async updateCollection(collectionId: string, data: {
    name?: string
    description?: string
    code?: string
    isActive?: boolean
  }) {
    try {
      return await prisma.collection.update({
        where: { collectionId },
        data
      })
    } catch (error) {
      console.error('Koleksiyon güncelleme hatası:', error)
      throw new Error('Koleksiyon güncellenemedi')
    }
  }
  
  /**
   * Koleksiyon sil (soft delete - deaktif et)
   */
  async deactivateCollection(collectionId: string) {
    try {
      return await prisma.collection.update({
        where: { collectionId },
        data: { isActive: false }
      })
    } catch (error) {
      console.error('Koleksiyon deaktif etme hatası:', error)
      throw new Error('Koleksiyon deaktif edilemedi')
    }
  }
  
  /**
   * Koleksiyona ait ürünleri getir
   */
  async getCollectionProducts(collectionId: string) {
    try {
      const collection = await prisma.collection.findUnique({
        where: { collectionId },
        include: {
          products: true
        }
      })
      
      if (!collection) {
        throw new Error(`${collectionId} ID'li koleksiyon bulunamadı`)
      }
      
      return collection.products
    } catch (error) {
      console.error('Koleksiyon ürünlerini getirme hatası:', error)
      throw error
    }
  }
  
  /**
   * Koleksiyondaki ürün sayısını getir
   */
  async getCollectionProductCount(collectionId: string) {
    try {
      return await prisma.product.count({
        where: { collectionId }
      })
    } catch (error) {
      console.error('Koleksiyon ürün sayısı getirme hatası:', error)
      throw new Error('Koleksiyon ürün sayısı getirilemedi')
    }
  }
} 