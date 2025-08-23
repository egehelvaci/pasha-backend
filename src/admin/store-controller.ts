import { Request, Response } from 'express'
import prisma from '../utils/prisma'
import { Prisma } from '../../generated/prisma'

export class StoreController {
  /**
   * Tüm mağazaları listele
   * 
   * @route GET /api/admin/stores
   * @access Authenticated (Admin kullanıcılar)
   * @description Mağazaları, kullanıcılarını ve fiyat listelerini içerir. Adres bilgisi sadece kullanıcı alanından döner.
   * 
   * @query {string} isActive - Aktif/pasif durumu filtresi (true/false)
   * 
   * @returns {Object} response - API yanıtı
   * @returns {boolean} response.success - İşlem durumu
   * @returns {number} response.count - Mağaza sayısı
   * @returns {Array} response.data - Mağaza listesi
   * @returns {Array} response.data[].users - Mağazaya atanmış kullanıcılar
   * @returns {Array} response.data[].priceLists - Mağazaya atanmış fiyat listeleri
   * @returns {Object} response.data[].summary - Özet bilgiler (kullanıcı ve fiyat listesi sayıları)
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
              PriceList: {
                select: {
                  price_list_id: true,
                  name: true,
                  description: true,
                  is_active: true,
                  created_at: true
                }
              }
            }
          },
          User: {
            select: {
              userId: true,
              name: true,
              surname: true,
              username: true,
              email: true,
              phoneNumber: true,
              isActive: true,
              createdAt: true,
              userType: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
      
      // Response formatını düzenle
      const formattedStores = stores.map(store => ({
        store_id: store.store_id,
        kurum_adi: store.kurum_adi,
        vergi_numarasi: store.vergi_numarasi,
        vergi_dairesi: store.vergi_dairesi,
        tckn: store.tckn,
        yetkili_adi: store.yetkili_adi,
        yetkili_soyadi: store.yetkili_soyadi,
        telefon: store.telefon,
        eposta: store.eposta,
        faks_numarasi: store.faks_numarasi,
        aciklama: store.aciklama,
        limitsiz_acik_hesap: store.limitsiz_acik_hesap,
        acik_hesap_tutari: store.acik_hesap_tutari,
        bakiye: store.bakiye,
        maksimum_taksit: store.maksimum_taksit,
        store_type: store.store_type,
        is_active: store.is_active,
        created_at: store.created_at,
        updated_at: store.updated_at,
        
        // Mağazaya atanmış kullanıcılar
        users: (store as any).User.map((user: any) => ({
          userId: user.userId,
          name: user.name,
          surname: user.surname,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          adres: user.adres,
          isActive: user.isActive,
          createdAt: user.createdAt,
          userType: user.userType?.name
        })),
        
        // Mağazaya atanmış fiyat listeleri
        priceLists: (store as any).StorePriceList.map((spl: any) => ({
          assignment_id: spl.id,
          price_list_id: spl.PriceList.price_list_id,
          name: spl.PriceList.name,
          description: spl.PriceList.description,
          is_active: spl.PriceList.is_active,
          created_at: spl.PriceList.created_at,
          assigned_at: spl.created_at
        })),
        
        // Özet bilgiler
        summary: {
          total_users: (store as any).User.length,
          active_users: (store as any).User.filter((user: any) => user.isActive).length,
          total_price_lists: (store as any).StorePriceList.length,
          active_price_lists: (store as any).StorePriceList.filter((spl: any) => spl.PriceList.is_active).length
        }
      }))

      return res.status(200).json({
        success: true,
        count: formattedStores.length,
        data: formattedStores
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
      
      // Response formatını düzenle - adres alanını çıkar ama store_type'ı dahil et
      const { adres, ...storeData } = store
      
      return res.status(200).json({
        success: true,
        data: {
          ...storeData,
          store_type: store.store_type // Mağaza türü bilgisini açıkça ekle
        }
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
        tckn,
        yetkili_adi, 
        yetkili_soyadi, 
        telefon, 
        eposta, 
        faks_numarasi, 
        aciklama, 
        limitsiz_acik_hesap, 
        acik_hesap_tutari,
        bakiye,
        maksimum_taksit,
        store_type
      } = req.body
      
      // Zorunlu alanların kontrolü
      if (!kurum_adi) {
        return res.status(400).json({
          success: false,
          message: 'Kurum adı zorunludur'
        })
      }

      // Mağaza türü kontrolü
      const validStoreTypes = ['KARGO', 'SERVIS', 'KENDI_ALAN', 'AMBAR'];
      if (store_type && !validStoreTypes.includes(store_type)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz mağaza türü. Geçerli türler: KARGO, SERVIS, KENDI_ALAN, AMBAR'
        })
      }

      // Yeni mağaza oluştur
      const newStore = await prisma.store.create({
        data: {
          kurum_adi,
          vergi_numarasi,
          vergi_dairesi,
          tckn,
          yetkili_adi,
          yetkili_soyadi,
          telefon,
          eposta,
          faks_numarasi,
          aciklama,
          limitsiz_acik_hesap: limitsiz_acik_hesap || false,
          acik_hesap_tutari: acik_hesap_tutari ? parseFloat(acik_hesap_tutari) : 0,
          bakiye: bakiye ? parseFloat(bakiye) : 0,
          maksimum_taksit: maksimum_taksit ? parseInt(maksimum_taksit) : 1,
          store_type: store_type || 'KARGO', // Varsayılan olarak KARGO
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
        tckn,
        yetkili_adi, 
        yetkili_soyadi, 
        telefon, 
        eposta, 
        faks_numarasi, 
        aciklama, 
        limitsiz_acik_hesap, 
        acik_hesap_tutari,
        bakiye,
        maksimum_taksit,
        is_active,
        store_type
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

      // Mağaza türü kontrolü
      const validStoreTypes = ['KARGO', 'SERVIS', 'KENDI_ALAN', 'AMBAR'];
      if (store_type && !validStoreTypes.includes(store_type)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz mağaza türü. Geçerli türler: KARGO, SERVIS, KENDI_ALAN, AMBAR'
        })
      }
      
      // Güncelleme verileri
      const updateData: any = {}
      
      if (kurum_adi !== undefined) updateData.kurum_adi = kurum_adi
      if (vergi_numarasi !== undefined) updateData.vergi_numarasi = vergi_numarasi
      if (vergi_dairesi !== undefined) updateData.vergi_dairesi = vergi_dairesi
      if (tckn !== undefined) updateData.tckn = tckn
      if (yetkili_adi !== undefined) updateData.yetkili_adi = yetkili_adi
      if (yetkili_soyadi !== undefined) updateData.yetkili_soyadi = yetkili_soyadi
      if (telefon !== undefined) updateData.telefon = telefon
      if (eposta !== undefined) updateData.eposta = eposta
      if (faks_numarasi !== undefined) updateData.faks_numarasi = faks_numarasi
      if (aciklama !== undefined) updateData.aciklama = aciklama
      if (limitsiz_acik_hesap !== undefined) updateData.limitsiz_acik_hesap = limitsiz_acik_hesap
      if (acik_hesap_tutari !== undefined) updateData.acik_hesap_tutari = parseFloat(acik_hesap_tutari)
      if (bakiye !== undefined) updateData.bakiye = parseFloat(bakiye)
      if (maksimum_taksit !== undefined) updateData.maksimum_taksit = parseInt(maksimum_taksit)
      if (is_active !== undefined) updateData.is_active = is_active
      if (store_type !== undefined) updateData.store_type = store_type
      
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

  /**
   * Mağazanın kullanıcılarını getir
   */
  async getStoreUsers(req: Request, res: Response) {
    try {
      const { storeId } = req.params

      // Mağazanın var olup olmadığını kontrol et
      const store = await prisma.store.findUnique({
        where: { store_id: storeId }
      })

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Mağaza bulunamadı'
        })
      }

      // Mağazaya atanmış kullanıcıları getir
      const users = await prisma.user.findMany({
        where: { store_id: storeId },
        include: {
          userType: true
        }
      })

      return res.status(200).json({
        success: true,
        data: users
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Mağaza kullanıcıları listelenirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }
} 