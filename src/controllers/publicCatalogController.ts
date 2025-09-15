import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export class PublicCatalogController {

  /**
   * Token gerektirmeyen public koleksiyon ve ürün listesi
   * GET /public/catalog/collections
   */
  async getPublicCollections(req: Request, res: Response) {
    try {
      console.log('📚 Public koleksiyonlar ve ürünler getiriliyor...');

      // Aktif koleksiyonları ve altındaki aktif ürünleri getir
      const collections = await prisma.collection.findMany({
        where: {
          isActive: true
        },
        select: {
          collectionId: true,
          name: true,
          description: true,
          code: true,
          products: {
            select: {
              productId: true,
              name: true,
              productImage: true
            },
            orderBy: {
              name: 'asc'
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Response formatını düzenle
      const formattedCollections = collections.map(collection => ({
        id: collection.collectionId,
        name: collection.name,
        description: collection.description,
        code: collection.code,
        productCount: collection.products.length,
        products: collection.products.map(product => ({
          id: product.productId,
          name: product.name,
          image: product.productImage
        }))
      }));

      console.log(`✅ ${formattedCollections.length} koleksiyon ve toplam ${formattedCollections.reduce((total, col) => total + col.productCount, 0)} ürün döndürüldü`);

      return res.status(200).json({
        success: true,
        message: 'Public koleksiyonlar başarıyla getirildi',
        data: {
          collections: formattedCollections,
          totalCollections: formattedCollections.length,
          totalProducts: formattedCollections.reduce((total, col) => total + col.productCount, 0)
        }
      });

    } catch (error) {
      console.error('❌ Public koleksiyonlar getirme hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Public koleksiyonlar getirilirken bir hata oluştu'
      });
    }
  }

  /**
   * Token gerektirmeyen belirli bir koleksiyonun detayları
   * GET /public/catalog/collections/:collectionId
   */
  async getPublicCollectionById(req: Request, res: Response) {
    try {
      const { collectionId } = req.params;

      if (!collectionId) {
        return res.status(400).json({
          success: false,
          message: 'Koleksiyon ID gerekli'
        });
      }

      console.log(`📖 Public koleksiyon detayı getiriliyor: ${collectionId}`);

      const collection = await prisma.collection.findFirst({
        where: {
          collectionId: collectionId,
          isActive: true
        },
        select: {
          collectionId: true,
          name: true,
          description: true,
          code: true,
          products: {
            select: {
              productId: true,
              name: true,
              productImage: true
            },
            orderBy: {
              name: 'asc'
            }
          }
        }
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Koleksiyon bulunamadı'
        });
      }

      const formattedCollection = {
        id: collection.collectionId,
        name: collection.name,
        description: collection.description,
        code: collection.code,
        productCount: collection.products.length,
        products: collection.products.map(product => ({
          id: product.productId,
          name: product.name,
          image: product.productImage
        }))
      };

      console.log(`✅ Koleksiyon "${collection.name}" ve ${collection.products.length} ürün döndürüldü`);

      return res.status(200).json({
        success: true,
        message: 'Koleksiyon detayı başarıyla getirildi',
        data: formattedCollection
      });

    } catch (error) {
      console.error('❌ Public koleksiyon detayı getirme hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Koleksiyon detayı getirilirken bir hata oluştu'
      });
    }
  }
}
