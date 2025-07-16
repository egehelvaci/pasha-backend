import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import prisma from '../utils/prisma'

export class UserProfileController {
  constructor() {
    this.updateStoreProfile = this.updateStoreProfile.bind(this)
    this.changePassword = this.changePassword.bind(this)
    this.getMyProfile = this.getMyProfile.bind(this)
  }

  /**
   * Kullanıcının kendi profil bilgilerini getir
   * 
   * @route GET /api/profile/me
   * @access Authenticated (Giriş yapmış kullanıcılar)
   * @description Kullanıcının kendi bilgilerini ve mağaza bilgilerini döndürür
   */
  async getMyProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      // Kullanıcı ve mağaza bilgilerini getir
      const user = await prisma.user.findUnique({
        where: { userId },
        include: {
          Store: true,
          userType: true
        }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        })
      }

      // Şifre bilgisini çıkar
      const { password, ...userWithoutPassword } = user

      return res.status(200).json({
        success: true,
        data: {
          user: {
            userId: user.userId,
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            isActive: user.isActive,
            createdAt: user.createdAt,
            userType: user.userType.name
          },
          store: user.Store ? {
            store_id: user.Store.store_id,
            kurum_adi: user.Store.kurum_adi,
            vergi_numarasi: user.Store.vergi_numarasi,
            vergi_dairesi: user.Store.vergi_dairesi,
            tckn: user.Store.tckn,
            yetkili_adi: user.Store.yetkili_adi,
            yetkili_soyadi: user.Store.yetkili_soyadi,
            telefon: user.Store.telefon,
            eposta: user.Store.eposta,
            adres: user.Store.adres,
            faks_numarasi: user.Store.faks_numarasi,
            is_active: user.Store.is_active,
            created_at: user.Store.created_at
          } : null
        }
      })

    } catch (error: any) {
      console.error('Profil bilgileri getirilirken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Profil bilgileri alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Kullanıcının mağaza bilgilerini güncelle
   * 
   * @route PUT /api/profile/store
   * @access Authenticated (Giriş yapmış kullanıcılar)
   * @description Kullanıcının bağlı olduğu mağazanın bilgilerini günceller
   * 
   * @body {Object} storeData - Güncellenecek mağaza bilgileri
   * @body {string} storeData.kurum_adi - Kurum/Mağaza adı (zorunlu)
   * @body {string} storeData.vergi_numarasi - Vergi numarası (opsiyonel)
   * @body {string} storeData.vergi_dairesi - Vergi dairesi (opsiyonel)
   * @body {string} storeData.yetkili_adi - Yetkili kişi adı (opsiyonel)
   * @body {string} storeData.yetkili_soyadi - Yetkili kişi soyadı (opsiyonel)
   * @body {string} storeData.telefon - Telefon numarası (opsiyonel)
   * @body {string} storeData.eposta - E-posta adresi (opsiyonel)
   * @body {string} storeData.adres - Adres (opsiyonel)
   * @body {string} storeData.faks_numarasi - Faks numarası (opsiyonel)
   */
  async updateStoreProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      const {
        kurum_adi,
        vergi_numarasi,
        vergi_dairesi,
        tckn,
        yetkili_adi,
        yetkili_soyadi,
        telefon,
        eposta,
        adres,
        faks_numarasi
      } = req.body

      // Kullanıcının mağaza bilgilerini getir
      const user = await prisma.user.findUnique({
        where: { userId },
        include: { Store: true }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        })
      }

      if (!user.Store) {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcı bir mağazaya bağlı değil'
        })
      }

      // Zorunlu alan kontrolü
      if (!kurum_adi || kurum_adi.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Kurum adı zorunludur'
        })
      }

      // Email format kontrolü (eğer verilmişse)
      if (eposta && eposta.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(eposta.trim())) {
          return res.status(400).json({
            success: false,
            message: 'Geçerli bir e-posta adresi giriniz'
          })
        }
      }

      // Telefon format kontrolü (eğer verilmişse)
      if (telefon && telefon.trim().length > 0) {
        // Türkiye telefon formatları için basit kontrol
        const phoneRegex = /^(\+90|0)?[1-9][0-9]{9}$/
        const cleanPhone = telefon.replace(/[\s\-\(\)]/g, '')
        if (!phoneRegex.test(cleanPhone)) {
          return res.status(400).json({
            success: false,
            message: 'Geçerli bir telefon numarası giriniz (örn: 0212 555 0123)'
          })
        }
      }

      // Vergi numarası format kontrolü (eğer verilmişse)
      if (vergi_numarasi && vergi_numarasi.trim().length > 0) {
        const taxRegex = /^[0-9]{10,11}$/
        if (!taxRegex.test(vergi_numarasi.replace(/\s/g, ''))) {
          return res.status(400).json({
            success: false,
            message: 'Vergi numarası 10-11 haneli sayısal değer olmalıdır'
          })
        }
      }

      // TCKN format kontrolü (eğer verilmişse)
      if (tckn && tckn.trim().length > 0) {
        const tcknRegex = /^[0-9]{11}$/
        if (!tcknRegex.test(tckn.replace(/\s/g, ''))) {
          return res.status(400).json({
            success: false,
            message: 'TCKN 11 haneli sayısal değer olmalıdır'
          })
        }
      }

      // Güncelleme verilerini hazırla
      const updateData: any = {
        kurum_adi: kurum_adi.trim(),
        updated_at: new Date()
      }

      // Opsiyonel alanları ekle
      if (vergi_numarasi !== undefined) {
        updateData.vergi_numarasi = vergi_numarasi?.trim() || null
      }
      if (vergi_dairesi !== undefined) {
        updateData.vergi_dairesi = vergi_dairesi?.trim() || null
      }
      if (tckn !== undefined) {
        updateData.tckn = tckn?.trim() || null
      }
      if (yetkili_adi !== undefined) {
        updateData.yetkili_adi = yetkili_adi?.trim() || null
      }
      if (yetkili_soyadi !== undefined) {
        updateData.yetkili_soyadi = yetkili_soyadi?.trim() || null
      }
      if (telefon !== undefined) {
        updateData.telefon = telefon?.trim() || null
      }
      if (eposta !== undefined) {
        updateData.eposta = eposta?.trim().toLowerCase() || null
      }
      if (adres !== undefined) {
        updateData.adres = adres?.trim() || null
      }
      if (faks_numarasi !== undefined) {
        updateData.faks_numarasi = faks_numarasi?.trim() || null
      }

      // Mağaza bilgilerini güncelle
      const updatedStore = await prisma.store.update({
        where: { store_id: user.Store.store_id },
        data: updateData
      })

      return res.status(200).json({
        success: true,
        message: 'Mağaza bilgileri başarıyla güncellendi',
        data: {
          store_id: updatedStore.store_id,
          kurum_adi: updatedStore.kurum_adi,
          vergi_numarasi: updatedStore.vergi_numarasi,
          vergi_dairesi: updatedStore.vergi_dairesi,
          tckn: updatedStore.tckn,
          yetkili_adi: updatedStore.yetkili_adi,
          yetkili_soyadi: updatedStore.yetkili_soyadi,
          telefon: updatedStore.telefon,
          eposta: updatedStore.eposta,
          adres: updatedStore.adres,
          faks_numarasi: updatedStore.faks_numarasi,
          updated_at: updatedStore.updated_at
        }
      })

    } catch (error: any) {
      console.error('Mağaza bilgileri güncellenirken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Mağaza bilgileri güncellenirken bir hata oluştu'
      })
    }
  }

  /**
   * Kullanıcının şifresini değiştir
   * 
   * @route PUT /api/profile/change-password
   * @access Authenticated (Giriş yapmış kullanıcılar)
   * @description Kullanıcının mevcut şifresini kontrol ederek yeni şifre belirler
   * 
   * @body {Object} passwordData - Şifre değişim bilgileri
   * @body {string} passwordData.currentPassword - Mevcut şifre (zorunlu)
   * @body {string} passwordData.newPassword - Yeni şifre (zorunlu, min 6 karakter)
   * @body {string} passwordData.confirmPassword - Yeni şifre onayı (zorunlu)
   */
  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      const { currentPassword, newPassword, confirmPassword } = req.body

      // Gerekli alanları kontrol et
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mevcut şifre, yeni şifre ve şifre onayı gereklidir'
        })
      }

      // Yeni şifre uzunluk kontrolü
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Yeni şifre en az 6 karakter olmalıdır'
        })
      }

      // Şifre eşleşme kontrolü
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Yeni şifre ve onay şifresi eşleşmiyor'
        })
      }

      // Kullanıcıyı getir
      const user = await prisma.user.findUnique({
        where: { userId }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        })
      }

      // Mevcut şifreyi kontrol et
      let isCurrentPasswordValid = false

      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        // Bcrypt ile hash'lenmiş şifre
        try {
          isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
        } catch (error) {
          console.error('Bcrypt karşılaştırma hatası:', error)
          return res.status(500).json({
            success: false,
            message: 'Şifre doğrulama hatası'
          })
        }
      } else {
        // Düz metin şifre (eski kullanıcılar için)
        isCurrentPasswordValid = currentPassword === user.password
      }

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Mevcut şifre hatalı'
        })
      }

      // Yeni şifreyi hash'le
      const hashedNewPassword = await bcrypt.hash(newPassword, 10)

      // Kullanıcının şifresini güncelle
      await prisma.user.update({
        where: { userId },
        data: {
          password: hashedNewPassword
        }
      })

      console.log(`Şifre başarıyla değiştirildi: ${user.username}`)

      return res.status(200).json({
        success: true,
        message: 'Şifreniz başarıyla değiştirildi'
      })

    } catch (error: any) {
      console.error('Şifre değiştirme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Şifre değiştirilirken bir hata oluştu'
      })
    }
  }
}

export const userProfileController = new UserProfileController() 