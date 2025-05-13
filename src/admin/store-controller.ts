import { Request, Response } from 'express'
import { PrismaClient, Prisma } from '../../generated/prisma'

const prisma = new PrismaClient()

export class StoreController {
  /**
   * Tüm mağazaları listele
   */
  async getAllStores(req: Request, res: Response) {
    try {
      const { isActive } = req.query
      
      let whereCondition: Prisma.StoreWhereInput = {}
      
      // isActive parametresi varsa filtreleme yap
      if (isActive !== undefined) {
        whereCondition.is_active = isActive === 'true'
      }
      
      const stores = await prisma.store.findMany({
        where: whereCondition,
        include: {
          StorePriceList: {
            include: {
              PriceList: true
            }
          }
        }
      })
      
      return res.status(200).json({
        success: true,
        count: stores.length,
        data: stores
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Mağazalar listelenirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Belirli bir mağazanın bilgilerini getir
   */
  async getStoreById(req: Request, res: Response) {
    try {
      const { storeId } = req.params
      
      const store = await prisma.store.findUnique({
        where: { store_id: storeId },
        include: {
          StorePriceList: {
            include: {
              PriceList: true
            }
          },
          User: true
        }
      })
      
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Mağaza bulunamadı'
        })
      }
      
      return res.status(200).json({
        success: true,
        data: store
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Mağaza bilgileri alınırken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Yeni mağaza oluştur
   */
  async createStore(req: Request, res: Response) {
    try {
      const { 
        kurum_adi, 
        vergi_numarasi, 
        vergi_dairesi, 
        yetkili_adi, 
        yetkili_soyadi, 
        telefon, 
        eposta, 
        adres, 
        faks_numarasi, 
        aciklama, 
        limitsiz_acik_hesap, 
        acik_hesap_tutari 
      } = req.body
      
      // Zorunlu alanların kontrolü
      if (!kurum_adi) {
        return res.status(400).json({
          success: false,
          message: 'Kurum adı zorunludur'
        })
      }

      // Yeni mağaza oluştur
      const newStore = await prisma.store.create({
        data: {
          kurum_adi,
          vergi_numarasi,
          vergi_dairesi,
          yetkili_adi,
          yetkili_soyadi,
          telefon,
          eposta,
          adres,
          faks_numarasi,
          aciklama,
          limitsiz_acik_hesap: limitsiz_acik_hesap || false,
          acik_hesap_tutari: acik_hesap_tutari ? parseFloat(acik_hesap_tutari) : 0,
          is_active: true
        }
      })
      
      return res.status(201).json({
        success: true,
        data: newStore
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Mağaza oluşturulurken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Mağaza bilgilerini güncelle
   */
  async updateStore(req: Request, res: Response) {
    try {
      const { storeId } = req.params
      const { 
        kurum_adi, 
        vergi_numarasi, 
        vergi_dairesi, 
        yetkili_adi, 
        yetkili_soyadi, 
        telefon, 
        eposta, 
        adres, 
        faks_numarasi, 
        aciklama, 
        limitsiz_acik_hesap, 
        acik_hesap_tutari,
        is_active 
      } = req.body
      
      // Güncellenecek mağazanın var olup olmadığını kontrol et
      const existingStore = await prisma.store.findUnique({
        where: { store_id: storeId }
      })
      
      if (!existingStore) {
        return res.status(404).json({
          success: false,
          message: 'Güncellenecek mağaza bulunamadı'
        })
      }
      
      // Güncelleme verileri
      const updateData: any = {}
      
      if (kurum_adi !== undefined) updateData.kurum_adi = kurum_adi
      if (vergi_numarasi !== undefined) updateData.vergi_numarasi = vergi_numarasi
      if (vergi_dairesi !== undefined) updateData.vergi_dairesi = vergi_dairesi
      if (yetkili_adi !== undefined) updateData.yetkili_adi = yetkili_adi
      if (yetkili_soyadi !== undefined) updateData.yetkili_soyadi = yetkili_soyadi
      if (telefon !== undefined) updateData.telefon = telefon
      if (eposta !== undefined) updateData.eposta = eposta
      if (adres !== undefined) updateData.adres = adres
      if (faks_numarasi !== undefined) updateData.faks_numarasi = faks_numarasi
      if (aciklama !== undefined) updateData.aciklama = aciklama
      if (limitsiz_acik_hesap !== undefined) updateData.limitsiz_acik_hesap = limitsiz_acik_hesap
      if (acik_hesap_tutari !== undefined) updateData.acik_hesap_tutari = parseFloat(acik_hesap_tutari)
      if (is_active !== undefined) updateData.is_active = is_active
      
      // Mağazayı güncelle
      const updatedStore = await prisma.store.update({
        where: { store_id: storeId },
        data: updateData
      })
      
      return res.status(200).json({
        success: true,
        data: updatedStore
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Mağaza güncellenirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Mağazayı sil
   */
  async deleteStore(req: Request, res: Response) {
    try {
      const { storeId } = req.params
      const { permanently = false } = req.body
      
      // Mağazanın var olup olmadığını kontrol et
      const existingStore = await prisma.store.findUnique({
        where: { store_id: storeId }
      })
      
      if (!existingStore) {
        return res.status(404).json({
          success: false,
          message: 'Silinecek mağaza bulunamadı'
        })
      }
      
      // Kalıcı silme işlemi
      if (permanently) {
        await prisma.store.delete({
          where: { store_id: storeId }
        })
        
        return res.status(200).json({
          success: true,
          message: 'Mağaza kalıcı olarak silindi'
        })
      } 
      // Deaktif etme işlemi
      else {
        await prisma.store.update({
          where: { store_id: storeId },
          data: { is_active: false }
        })
        
        return res.status(200).json({
          success: true,
          message: 'Mağaza deaktif edildi'
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Mağaza silinirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Mağazaya fiyat listesi ata
   */
  async assignPriceListToStore(req: Request, res: Response) {
    try {
      const { storeId } = req.params
      const { priceListId } = req.body
      
      // Zorunlu alanların kontrolü
      if (!priceListId) {
        return res.status(400).json({
          success: false,
          message: 'Fiyat listesi ID zorunludur'
        })
      }
      
      // Mağazanın var olup olmadığını kontrol et
      const existingStore = await prisma.store.findUnique({
        where: { store_id: storeId }
      })
      
      if (!existingStore) {
        return res.status(404).json({
          success: false,
          message: 'Mağaza bulunamadı'
        })
      }
      
      // Fiyat listesinin var olup olmadığını kontrol et
      const existingPriceList = await prisma.priceList.findUnique({
        where: { price_list_id: priceListId }
      })
      
      if (!existingPriceList) {
        return res.status(404).json({
          success: false,
          message: 'Fiyat listesi bulunamadı'
        })
      }
      
      // Mağaza-fiyat listesi ilişkisini oluştur
      const storePriceList = await prisma.storePriceList.create({
        data: {
          store_id: storeId,
          price_list_id: priceListId
        },
        include: {
          PriceList: true,
          Store: true
        }
      })
      
      return res.status(201).json({
        success: true,
        data: storePriceList
      })
    } catch (error) {
      // Unique constraint hatası kontrolü
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'Bu fiyat listesi zaten bu mağazaya atanmış'
        })
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Fiyat listesi atanırken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Mağazadan fiyat listesi kaldır
   */
  async removePriceListFromStore(req: Request, res: Response) {
    try {
      const { storeId, priceListId } = req.params
      
      // İlişkinin var olup olmadığını kontrol et
      const existingRelation = await prisma.storePriceList.findFirst({
        where: {
          store_id: storeId,
          price_list_id: priceListId
        }
      })
      
      if (!existingRelation) {
        return res.status(404).json({
          success: false,
          message: 'Bu mağaza-fiyat listesi ilişkisi bulunamadı'
        })
      }
      
      // İlişkiyi sil
      await prisma.storePriceList.delete({
        where: {
          store_id_price_list_id: {
            store_id: storeId,
            price_list_id: priceListId
          }
        }
      })
      
      return res.status(200).json({
        success: true,
        message: 'Fiyat listesi mağazadan kaldırıldı'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fiyat listesi kaldırılırken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Mağazanın fiyat listelerini getir
   */
  async getStorePriceLists(req: Request, res: Response) {
    try {
      const { storeId } = req.params
      
      // Mağazanın var olup olmadığını kontrol et
      const existingStore = await prisma.store.findUnique({
        where: { store_id: storeId }
      })
      
      if (!existingStore) {
        return res.status(404).json({
          success: false,
          message: 'Mağaza bulunamadı'
        })
      }
      
      // Mağazanın fiyat listelerini getir
      const priceLists = await prisma.storePriceList.findMany({
        where: { store_id: storeId },
        include: {
          PriceList: true
        }
      })
      
      return res.status(200).json({
        success: true,
        count: priceLists.length,
        data: priceLists
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fiyat listeleri alınırken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }
} 