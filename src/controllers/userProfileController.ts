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

  /**
   * Kullanıcının kendi profil bilgilerini güncelle
   * 
   * @route PUT /api/profile/me
   * @access Authenticated (Giriş yapmış kullanıcılar)
   * @description Kullanıcının kendi temel bilgilerini günceller
   * 
   * @body {Object} profileData - Güncellenecek profil bilgileri
   * @body {string} profileData.name - Ad (opsiyonel)
   * @body {string} profileData.surname - Soyad (opsiyonel)
   * @body {string} profileData.phoneNumber - Telefon numarası (opsiyonel)
   */
  async updateMyProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      const {
        name,
        surname,
        phoneNumber
      } = req.body

      // Kullanıcının mevcut bilgilerini al
      const user = await prisma.user.findUnique({
        where: { userId }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        })
      }

      // Güncelleme verilerini hazırla
      const updateData: any = {}

      if (name !== undefined) {
        if (!name || name.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Ad boş olamaz'
          })
        }
        updateData.name = name.trim()
      }

      if (surname !== undefined) {
        if (!surname || surname.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Soyad boş olamaz'
          })
        }
        updateData.surname = surname.trim()
      }

      if (phoneNumber !== undefined) {
        updateData.phoneNumber = phoneNumber?.trim() || null
      }

      // Kullanıcı bilgilerini güncelle
      const updatedUser = await prisma.user.update({
        where: { userId },
        data: updateData,
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
      })

      return res.status(200).json({
        success: true,
        message: 'Profil bilgileri başarıyla güncellendi',
        data: {
          ...updatedUser,
          userType: updatedUser.userType.name
        }
      })

    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Profil bilgileri güncellenirken bir hata oluştu'
      })
    }
  }

  /**
   * Müşterinin muhasebe hareketlerini, siparişlerini ve ödemelerini getir
   * 
   * @route GET /api/profile/accounting
   * @access Authenticated (Giriş yapmış kullanıcılar)
   * @description Müşterinin bakiye detaylarını, siparişlerini ve ödeme geçmişini döndürür
   */
  async getAccountingDetails(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      // Kullanıcının mağaza bilgilerini al
      const user = await prisma.user.findUnique({
        where: { userId },
        select: {
          store_id: true,
          Store: {
            select: {
              store_id: true,
              kurum_adi: true,
              bakiye: true
            }
          }
        }
      })

      if (!user || !user.store_id || !user.Store) {
        return res.status(404).json({
          success: false,
          message: 'Mağaza bilgisi bulunamadı'
        })
      }

      // Muhasebe hareketlerini al
      const muhasebeHareketleri = await prisma.muhasebeHareketleri.findMany({
        where: {
          storeId: user.store_id
        },
        orderBy: {
          tarih: 'desc'
        },
        take: 100 // Son 100 hareket
      })

      // Siparişleri al
      const orders = await prisma.order.findMany({
        where: {
          user_id: userId
        },
        select: {
          id: true,
          total_price: true,
          status: true,
          created_at: true,
          updated_at: true,
          items: {
            select: {
              product: {
                select: {
                  name: true,
                  description: true,
                  collection: {
                    select: {
                      name: true,
                      code: true
                    }
                  }
                }
              },
              quantity: true,
              unit_price: true,
              total_price: true,
              width: true,
              height: true,
              has_fringe: true,
              cut_type: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 50 // Son 50 sipariş
      })

      // Ödeme işlemlerini al (sadece COMPLETED ve FAILED durumlarını göster)
      const paymentTransactions = await prisma.paymentTransaction.findMany({
        where: {
          storeId: user.store_id,
          status: {
            in: ['COMPLETED', 'FAILED'] // PENDING ödemeleri gösterme
          }
        },
        select: {
          id: true,
          amount: true,
          description: true,
          status: true,
          paymentDate: true,
          createdAt: true,
          sellerReference: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 // Son 50 ödeme
      })

      // Toplam harcama ve ödeme hesapla (Kullanıcı perspektifinden)
      // Admin geliri (harcama=false) = Kullanıcı harcaması
      // Admin gideri (harcama=true) = Kullanıcı geliri/iadesi
      const toplamHarcama = muhasebeHareketleri
        .filter(h => !h.harcama && (h.islemTuru === 'Parekende Satış' || h.islemTuru === 'Toptan Satış'))
        .reduce((sum, h) => sum + Number(h.tutar), 0)

      const toplamOdeme = muhasebeHareketleri
        .filter(h => h.harcama && h.islemTuru === 'Diğer Giderler' && h.aciklama?.includes('İptal'))
        .reduce((sum, h) => sum + Number(h.tutar), 0)

      const toplamSiparisTutari = orders.reduce((sum, order) => 
        sum + Number(order.total_price), 0)

      const bekleyenSiparisler = orders.filter(o => o.status === 'PENDING').length
      const teslimEdilenSiparisler = orders.filter(o => o.status === 'DELIVERED').length

      return res.status(200).json({
        success: true,
        data: {
          ozet: {
            guncelBakiye: Number(user.Store.bakiye),
            toplamHarcama,
            toplamOdeme,
            toplamSiparisTutari,
            toplamSiparisSayisi: orders.length,
            bekleyenSiparisler,
            teslimEdilenSiparisler
          },
          muhasebeHareketleri: muhasebeHareketleri.map(hareket => {
            // Kullanıcı perspektifinden işlemleri göster
            // Admin perspektifinde: Parekende Satış = gelir (harcama: false), İptal = gider (harcama: true)
            // Kullanıcı perspektifinde: Sipariş = gider (-), İptal = gelir (+)
            let kullaniciPerspektifiTutar = Number(hareket.tutar);
            
            // Parekende Satış veya benzeri gelir işlemleri kullanıcı için gider (negatif)
            if (!hareket.harcama && (hareket.islemTuru === 'Parekende Satış' || hareket.islemTuru === 'Toptan Satış')) {
              kullaniciPerspektifiTutar = -Math.abs(kullaniciPerspektifiTutar);
            }
            // İptal/İade işlemleri kullanıcı için gelir (pozitif)
            else if (hareket.harcama && hareket.islemTuru === 'Diğer Giderler' && hareket.aciklama?.includes('İptal')) {
              kullaniciPerspektifiTutar = Math.abs(kullaniciPerspektifiTutar);
            }
            // Diğer admin giderleri kullanıcı için gelir
            else if (hareket.harcama) {
              kullaniciPerspektifiTutar = Math.abs(kullaniciPerspektifiTutar);
            }
            // Diğer admin gelirleri kullanıcı için gider
            else {
              kullaniciPerspektifiTutar = -Math.abs(kullaniciPerspektifiTutar);
            }
            
            return {
              id: hareket.id,
              islemTuru: hareket.islemTuru,
              tutar: kullaniciPerspektifiTutar,
              harcamaMi: !hareket.harcama, // Tersine çevir: Admin geliri = Kullanıcı harcaması
              tarih: hareket.tarih,
              aciklama: hareket.aciklama,
              createdAt: hareket.createdAt
            };
          }),
          siparisler: orders.map(order => ({
            id: order.id,
            toplamTutar: Number(order.total_price),
            durum: order.status,
            olusturmaTarihi: order.created_at,
            guncellemeTarihi: order.updated_at,
            urunSayisi: order.items.length,
            urunler: order.items.map(item => ({
              urunAdi: item.product.name,
              koleksiyonAdi: item.product.collection.name,
              koleksiyonKodu: item.product.collection.code,
              miktar: item.quantity,
              birimFiyat: Number(item.unit_price),
              toplamFiyat: Number(item.total_price),
              en: item.width ? Number(item.width) : null,
              boy: item.height ? Number(item.height) : null,
              sasakVar: item.has_fringe,
              kesimTipi: item.cut_type
            }))
          })),
          odemeler: paymentTransactions.map(payment => ({
            id: payment.id,
            tutar: Number(payment.amount),
            aciklama: payment.description,
            durum: payment.status,
            odemeTarihi: payment.paymentDate,
            olusturmaTarihi: payment.createdAt,
            referansNo: payment.sellerReference
          }))
        }
      })

    } catch (error: any) {
      console.error('Muhasebe detayları alınırken hata:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Muhasebe detayları alınırken bir hata oluştu'
      })
    }
  }
}

export const userProfileController = new UserProfileController() 