import { Request, Response } from 'express'
import prisma from '../utils/prisma'

// Gelir türleri (harcama: false)
const incomeTypes = [
  'Parekende Satış',
  'Toptan Satış',
  'Hizmet Geliri',
  'Sanal POS Ödemesi',
  'Faiz Geliri',
  'Kira Geliri',
  'Diğer Gelirler',
  'Borç Tahsilatı'
]

// Gider türleri (harcama: true)
const expenseTypes = [
  'Kira / Aidat Giderleri',
  'Elektrik / Su / Doğalgaz',
  'Telefon / İnternet',
  'Personel Maaş Ödemesi',
  'SGK Primleri',
  'Vergi Ödemeleri',
  'Nakliye Giderleri',
  'Ofis Malzemeleri',
  'Temizlik Giderleri',
  'Bakım Onarım',
  'Reklamı Pazarlama',
  'Danışmanlık Giderleri',
  'Sigortalar',
  'Bankacılık Giderleri',
  'Diğer Giderler',
  'Borç Verme'
]

export class MuhasebeController {
  constructor() {
    this.getAllMuhasebeHareketleri = this.getAllMuhasebeHareketleri.bind(this)
    this.createMuhasebeHareketi = this.createMuhasebeHareketi.bind(this)
    this.getIncomeTypes = this.getIncomeTypes.bind(this)
    this.getExpenseTypes = this.getExpenseTypes.bind(this)
    this.getAdminToplam = this.getAdminToplam.bind(this)
    this.getManuelSatislar = this.getManuelSatislar.bind(this)
    this.getMuhasebeHareketleriByStore = this.getMuhasebeHareketleriByStore.bind(this)
  }

  /**
   * Tüm muhasebe hareketlerini ve mağaza bakiyelerini listele
   */
  async getAllMuhasebeHareketleri(req: Request, res: Response) {
    try {
      // Muhasebe hareketlerini getir - USD mağazaları hariç
      const hareketlerData = await prisma.muhasebeHareketleri.findMany({
        include: {
          store: {
                    select: {
          store_id: true,
          kurum_adi: true,
          bakiye: true,
          currency: true // Currency bilgisini de al
        }
          }
        },
        where: {
          store: {
            currency: {
              not: 'USD' // USD mağazalarını hariç tut
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Ödeme ile ilgili islemTuru'ları tanımla
      const paymentRelatedTypes = [
        'ADMIN_ÖDEME',
        'Sanal POS Ödemesi', 
        'Ödeme alındı',
        'TRY Ekleme İşlemi',
        'USD Ekleme İşlemi'
      ]

      // FAILED ödemelerle ilgili muhasebe hareketlerini filtrele
      const filteredHareketler = []
      for (const hareket of hareketlerData) {
        const isPaymentRelated = paymentRelatedTypes.some(type => 
          hareket.islemTuru.includes(type) || hareket.aciklama?.includes('POS') || hareket.aciklama?.includes('Ödeme')
        )
        
        if (isPaymentRelated) {
          // Ödeme ile ilgiliyse, COMPLETED payment transaction var mı kontrol et
          const hasCompletedPayment = await prisma.paymentTransaction.findFirst({
            where: {
              storeId: hareket.storeId,
              status: 'COMPLETED',
              paymentDate: {
                gte: new Date(hareket.tarih.getTime() - 60000), // 1 dakika öncesi
                lte: new Date(hareket.tarih.getTime() + 60000)  // 1 dakika sonrası
              }
            }
          })
          
          if (hasCompletedPayment) {
            filteredHareketler.push(hareket)
          }
          // COMPLETED payment yoksa, bu hareket gösterilmez (FAILED ödeme olabilir)
        } else {
          // Ödeme ile ilgili değilse (manuel hareket, sipariş vs.), normal şekilde dahil et
          filteredHareketler.push(hareket)
        }
      }

      // Hareketlerdeki store bilgilerini de borç/alacak formatında düzenle
      const hareketler = filteredHareketler.map(hareket => {
        const bakiye = hareket.store.bakiye?.toNumber() || 0
        
        // Ödeme ile ilgili hareketlerde original currency tutarını kullan
        const isPaymentRelated = paymentRelatedTypes.some(type => 
          hareket.islemTuru.includes(type) || hareket.aciklama?.includes('POS') || hareket.aciklama?.includes('Ödeme')
        )
        
        let displayAmount = Number(hareket.tutar)
        let displayCurrency = hareket.currency || 'TRY'
        
        if (isPaymentRelated && hareket.original_amount && hareket.original_currency) {
          // Ödeme ile ilgiliyse, orijinal tutarı ve currency'sini kullan
          displayAmount = Number(hareket.original_amount)
          displayCurrency = hareket.original_currency
        }
        
        return {
          ...hareket,
          // Display için orijinal tutar ve currency
          display_amount: displayAmount,
          display_currency: displayCurrency,
          // Mevcut alanları da koru
          tutar: Number(hareket.tutar),
          original_amount: hareket.original_amount ? Number(hareket.original_amount) : null,
          original_currency: hareket.original_currency,
          exchange_rate: hareket.exchange_rate ? Number(hareket.exchange_rate) : null,
          store: {
            store_id: hareket.store.store_id,
            kurum_adi: hareket.store.kurum_adi,
            bakiye: bakiye,
            durum: bakiye === 0 ? 'DENGEDE' : bakiye < 0 ? 'BORCLU' : 'ALACAKLI',
            tutar: Math.abs(bakiye)
          }
        }
      })

      // Tüm mağazaların bakiyelerini getir - USD mağazaları hariç
      const magazaData = await prisma.store.findMany({
        select: {
          store_id: true,
          kurum_adi: true,
          bakiye: true,
          is_active: true,
          currency: true
        },
        where: {
          is_active: true,
          currency: {
            not: 'USD' // USD mağazalarını hariç tut
          }
        },
        orderBy: {
          kurum_adi: 'asc'
        }
      })

      // Bakiye bilgilerini borç/alacak formatında düzenle
      const magazaBakiyeleri = magazaData.map(magaza => {
        const bakiye = magaza.bakiye?.toNumber() || 0
        return {
          store_id: magaza.store_id,
          kurum_adi: magaza.kurum_adi,
          bakiye: bakiye,
          durum: bakiye === 0 ? 'DENGEDE' : bakiye < 0 ? 'BORCLU' : 'ALACAKLI',
          tutar: Math.abs(bakiye),
          is_active: magaza.is_active
        }
      })

      // Admin kasa bakiyesi
      const adminVarliklar = await prisma.adminVarliklari.findFirst({
        where: { id: 1 }
      })

      // Toplam alacak hesaplama (sadece negatif bakiyeler - Admin'in alacağı)
      const toplamAlacak = magazaData
        .filter(magaza => magaza.bakiye && magaza.bakiye.toNumber() < 0)
        .reduce((toplam, magaza) => {
          return toplam + Math.abs(magaza.bakiye?.toNumber() || 0)
        }, 0)

      // Admin alacaklı ve Admin verecek mağaza sayıları
      const adminAlacakliMagazaSayisi = magazaData.filter(magaza => 
        magaza.bakiye && magaza.bakiye.toNumber() < 0
      ).length

      const adminVerecekMagazaSayisi = magazaData.filter(magaza => 
        magaza.bakiye && magaza.bakiye.toNumber() > 0
      ).length

      return res.status(200).json({
        success: true,
        data: {
          hareketler,
          magazaBakiyeleri,
          adminKasaBakiyesi: adminVarliklar?.kasaBakiyesi || 0,
          toplamAlacak,
          adminAlacakliMagazaSayisi,
          adminVerecekMagazaSayisi
        }
      })
    } catch (error: any) {
      console.error('Muhasebe hareketleri listesi hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Muhasebe hareketleri getirilemedi'
      })
    }
  }

  /**
   * Yeni muhasebe hareketi oluştur
   */
  async createMuhasebeHareketi(req: Request, res: Response) {
    try {
      const { storeId, islemTuru, tutar, tarih, aciklama, currency } = req.body
      const adminStoreId = (req as any).user?.store_id

      // Girdi doğrulama
      if (!storeId || !islemTuru || !tutar || !tarih || !aciklama) {
        return res.status(400).json({
          success: false,
          message: 'storeId, islemTuru, tutar, tarih ve aciklama zorunlu alanlarıdır'
        })
      }

      // Tutar kontrolü
      if (typeof tutar !== 'number' || tutar <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Tutar 0\'dan büyük bir sayı olmalıdır'
        })
      }

      // Tarih format kontrolü
      const tarihDate = new Date(tarih)
      if (isNaN(tarihDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir tarih formatı gönderiniz'
        })
      }

      // İşlem türü kontrolü ve harcama değerini belirleme
      let harcama: boolean
      if (incomeTypes.includes(islemTuru)) {
        harcama = false // Gelir
      } else if (expenseTypes.includes(islemTuru)) {
        harcama = true // Gider
      } else {
        return res.status(422).json({
          success: false,
          message: `Geçersiz işlem türü: ${islemTuru}. Geçerli türler için /api/admin/muhasebe/income-types ve /api/admin/muhasebe/expense-types endpoint'lerini kullanın.`
        })
      }

      // Mağaza var mı kontrolü
      const store = await prisma.store.findUnique({
        where: { store_id: storeId },
        select: {
          store_id: true,
          kurum_adi: true,
          currency: true
        }
      })

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Belirtilen mağaza bulunamadı'
        })
      }

      // USD mağazası ise muhasebe hareketi yaratılamaz
      if (store.currency === ('USD' as any)) {
        return res.status(403).json({
          success: false,
          message: 'USD currency\'ne sahip mağazaların muhasebe hareketleri ayrı tutulmaktadır ve bu sistemde muhasebe hareketi yaratılamaz.'
        })
      }

      // Admin kendi mağazasına mı işlem yapıyor kontrolü
      const isAdminOwnStore = adminStoreId === storeId

      // Currency bilgileri
      const storeCurrency = store.currency || 'TRY'
      const transactionCurrency = currency || storeCurrency
      let exchangeRate: number | null = null
      let originalAmount = tutar

      // Currency farklıysa exchange rate hesapla
      if (transactionCurrency !== storeCurrency && transactionCurrency !== 'TRY') {
        const { exchangeRateService } = await import('../services/exchange-rate-service')
        // Get current exchange rate from service
        const rates = await exchangeRateService.getRates()
        if (transactionCurrency === 'USD' && storeCurrency === 'TRY') {
          exchangeRate = rates.USD
        } else if (transactionCurrency === 'TRY' && storeCurrency === 'USD') {
          exchangeRate = 1 / rates.USD
        }
      }

      // Transaction başlat
      const result = await prisma.$transaction(async (tx) => {
        // Yeni muhasebe hareketi oluştur
        const yeniHareket = await tx.muhasebeHareketleri.create({
          data: {
            storeId,
            islemTuru,
            tutar,
            harcama,
            tarih: tarihDate,
            aciklama,
            // YENI currency alanları
            currency: transactionCurrency as any,
            original_currency: transactionCurrency as any,
            exchange_rate: exchangeRate,
            original_amount: originalAmount
          },
          include: {
            store: {
              select: {
                store_id: true,
                kurum_adi: true
              }
            }
          }
        })

        // Admin kasa bakiyesini güncelle
        let adminVarliklar = await tx.adminVarliklari.findFirst({
          where: { id: 1 }
        })

        // Admin kendi mağazasına işlem yapıyorsa
        if (isAdminOwnStore) {
          // Admin kendi mağazasına işlem yapıyor - sadece admin kasası etkilenir
          if (!adminVarliklar) {
            await tx.adminVarliklari.create({
              data: {
                id: 1,
                kasaBakiyesi: harcama ? -tutar : tutar
              }
            })
          } else {
            await tx.adminVarliklari.update({
              where: { id: 1 },
              data: {
                kasaBakiyesi: {
                  increment: harcama ? -tutar : tutar
                }
              }
            })
          }
        } else {
          // Admin başka bir mağazaya işlem yapıyor
          // Parakende Satış gibi gelir türleri: Admin'e gelir, mağazaya gider
          // Gider türleri: Admin'e gider, mağazaya gelir
          
          // Admin kasa güncellemesi
          if (!adminVarliklar) {
            await tx.adminVarliklari.create({
              data: {
                id: 1,
                kasaBakiyesi: harcama ? -tutar : tutar
              }
            })
          } else {
            await tx.adminVarliklari.update({
              where: { id: 1 },
              data: {
                kasaBakiyesi: {
                  increment: harcama ? -tutar : tutar
                }
              }
            })
          }

          // Mağaza bakiyesi güncellemesi - Borç verme ve borç tahsilatı için özel mantık
          let magazaBakiyeDeğişimi: number
          
          if (islemTuru === 'Borç Verme') {
            // Admin mağazaya borç veriyor: mağaza borca giriyor (bakiye azalmalı)
            magazaBakiyeDeğişimi = -tutar
          } else if (islemTuru === 'Borç Tahsilatı') {
            // Admin mağazadan borç tahsil ediyor: mağaza borcunu ödüyor (bakiye artmalı)
            magazaBakiyeDeğişimi = tutar
          } else {
            // Diğer işlemler için eski mantık
            // Gelir (harcama=false) ise mağaza için gider (-), Admin için gelir (+)
            // Gider (harcama=true) ise mağaza için gelir (+), Admin için gider (-)
            magazaBakiyeDeğişimi = harcama ? tutar : -tutar
          }
          
          await tx.store.update({
            where: { store_id: storeId },
            data: {
              bakiye: {
                increment: magazaBakiyeDeğişimi
              }
            }
          })
        }

        return yeniHareket
      })

      return res.status(201).json({
        success: true,
        data: result
      })
    } catch (error: any) {
      console.error('Muhasebe hareketi oluşturma hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Muhasebe hareketi oluşturulamadı'
      })
    }
  }

  /**
   * Gelir türlerini getir
   */
  async getIncomeTypes(req: Request, res: Response) {
    try {
      return res.status(200).json({
        success: true,
        data: incomeTypes
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Gelir türleri getirilemedi'
      })
    }
  }

  /**
   * Gider türlerini getir
   */
  async getExpenseTypes(req: Request, res: Response) {
    try {
      return res.status(200).json({
        success: true,
        data: expenseTypes
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Gider türleri getirilemedi'
      })
    }
  }

  /**
   * Admin'in toplam alacağını hesapla
   */
  async getAdminToplam(req: Request, res: Response) {
    try {
      // Admin kasa bakiyesi
      const adminVarliklar = await prisma.adminVarliklari.findFirst({
        where: { id: 1 }
      })

      // Tüm mağazaların bakiyeleri
      const magazalar = await prisma.store.findMany({
        select: {
          store_id: true,
          kurum_adi: true,
          bakiye: true
        },
        where: {
          is_active: true
        }
      })

      // Toplam alacak hesaplama (sadece negatif bakiyeler - borçlu mağazalar)
      const toplamAlacak = magazalar
        .filter(magaza => magaza.bakiye && magaza.bakiye.toNumber() < 0)
        .reduce((toplam, magaza) => {
          return toplam + Math.abs(magaza.bakiye?.toNumber() || 0)
        }, 0)

      // Borçlu ve alacaklı mağazalar
      const borcluMagazalar = magazalar.filter(magaza => 
        magaza.bakiye && magaza.bakiye.toNumber() < 0
      )

      const alacakliMagazalar = magazalar.filter(magaza => 
        magaza.bakiye && magaza.bakiye.toNumber() > 0
      )

      return res.status(200).json({
        success: true,
        data: {
          adminKasaBakiyesi: adminVarliklar?.kasaBakiyesi || 0,
          toplamAlacak,
          borcluMagazalar: borcluMagazalar.map(magaza => ({
            store_id: magaza.store_id,
            kurum_adi: magaza.kurum_adi,
            borc: Math.abs(magaza.bakiye?.toNumber() || 0)
          })),
          alacakliMagazalar: alacakliMagazalar.map(magaza => ({
            store_id: magaza.store_id,
            kurum_adi: magaza.kurum_adi,
            alacak: magaza.bakiye?.toNumber() || 0
          })),
          borcluMagazaSayisi: borcluMagazalar.length,
          alacakliMagazaSayisi: alacakliMagazalar.length
        }
      })
    } catch (error: any) {
      console.error('Admin toplam hesaplama hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Admin toplam bilgileri getirilemedi'
      })
    }
  }

  /**
   * Manuel satışları listele
   */
  async getManuelSatislar(req: Request, res: Response) {
    try {
      const { storeId, startDate, endDate, page = 1, limit = 20 } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      const whereCondition: any = {
        isManuelSatis: true
      }

      if (storeId) {
        whereCondition.storeId = storeId
      }

      if (startDate || endDate) {
        whereCondition.tarih = {}
        if (startDate) whereCondition.tarih.gte = new Date(startDate as string)
        if (endDate) whereCondition.tarih.lte = new Date(endDate as string)
      }

      const [manuelSatislar, total] = await Promise.all([
        prisma.muhasebeHareketleri.findMany({
          where: whereCondition,
          include: {
            store: {
              select: {
                kurum_adi: true,
                store_id: true
              }
            },
            manuelSatisDetay: {
              include: {
                product: {
                  select: {
                    name: true,
                    productId: true
                  }
                }
              }
            }
          },
          orderBy: { tarih: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.muhasebeHareketleri.count({ where: whereCondition })
      ])

      const formattedData = manuelSatislar.map(satis => ({
        id: satis.id,
        fisNumarasi: satis.fisNumarasi,
        tarih: satis.tarih,
        tutar: Number(satis.tutar),
        aciklama: satis.aciklama,
        store: satis.store,
        urunSayisi: satis.manuelSatisDetay.length,
        toplamMiktar: satis.manuelSatisDetay.reduce((sum, item) => sum + item.quantity, 0),
        urunler: satis.manuelSatisDetay.map(item => ({
          urunAdi: item.product.name,
          miktar: item.quantity,
          birimFiyat: Number(item.unitPrice),
          toplamFiyat: Number(item.totalPrice)
        }))
      }))

      return res.json({
        success: true,
        data: formattedData,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error: any) {
      console.error('Manuel satış listesi hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Manuel satış listesi getirilemedi'
      })
    }
  }

  /**
   * Belirli bir mağazanın muhasebe hareketlerini listele
   */
  async getMuhasebeHareketleriByStore(req: Request, res: Response) {
    try {
      const { storeId } = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const startDate = req.query.startDate as string
      const endDate = req.query.endDate as string
      const islemTuru = req.query.islemTuru as string
      
      // Mağaza var mı kontrolü
      const store = await prisma.store.findUnique({
        where: { store_id: storeId },
        select: {
          store_id: true,
          kurum_adi: true,
          bakiye: true,
          currency: true,
          acik_hesap_tutari: true,
          limitsiz_acik_hesap: true
        }
      })

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Mağaza bulunamadı'
        })
      }

      // USD mağazası ise muhasebe hareketleri gösterilmez
      if (store.currency === 'USD') {
        return res.status(403).json({
          success: false,
          message: 'USD currency\'ne sahip mağazaların muhasebe hareketleri ayrı tutulmaktadır ve bu sistemde görüntülenemez.'
        })
      }

      // Filtreleme koşulları
      const whereCondition: any = {
        storeId: storeId
      }

      // Tarih filtreleri
      if (startDate || endDate) {
        whereCondition.tarih = {}
        if (startDate) {
          whereCondition.tarih.gte = new Date(startDate)
        }
        if (endDate) {
          const endDateTime = new Date(endDate)
          endDateTime.setHours(23, 59, 59, 999)
          whereCondition.tarih.lte = endDateTime
        }
      }

      // İşlem türü filtresi
      if (islemTuru) {
        whereCondition.islemTuru = islemTuru
      }

      // Sayfalama hesaplaması
      const skip = (page - 1) * limit

      // Muhasebe hareketlerini getir
      const [hareketler, totalCount] = await Promise.all([
        prisma.muhasebeHareketleri.findMany({
          where: whereCondition,
          include: {
            store: {
              select: {
                store_id: true,
                kurum_adi: true
              }
            }
          },
          orderBy: {
            tarih: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.muhasebeHareketleri.count({ where: whereCondition })
      ])

      // Toplam gelir ve gider hesapla
      const toplamGelir = await prisma.muhasebeHareketleri.aggregate({
        where: {
          ...whereCondition,
          harcama: false
        },
        _sum: {
          tutar: true
        }
      })

      const toplamGider = await prisma.muhasebeHareketleri.aggregate({
        where: {
          ...whereCondition,
          harcama: true
        },
        _sum: {
          tutar: true
        }
      })

      // Mağaza bakiye durumu
      const bakiye = store.bakiye?.toNumber() || 0
      const bakiyeDurumu = {
        bakiye: bakiye,
        durum: bakiye === 0 ? 'DENGEDE' : bakiye < 0 ? 'BORCLU' : 'ALACAKLI',
        tutar: Math.abs(bakiye),
        acikHesapLimiti: store.acik_hesap_tutari?.toNumber() || 0,
        limitsizAcikHesap: store.limitsiz_acik_hesap,
        currency: store.currency || 'TRY'
      }

      return res.status(200).json({
        success: true,
        data: {
          magaza: {
            store_id: store.store_id,
            kurum_adi: store.kurum_adi,
            bakiyeDurumu
          },
          hareketler,
          ozet: {
            toplamGelir: toplamGelir._sum.tutar?.toNumber() || 0,
            toplamGider: toplamGider._sum.tutar?.toNumber() || 0,
            net: (toplamGelir._sum.tutar?.toNumber() || 0) - (toplamGider._sum.tutar?.toNumber() || 0)
          },
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      })
    } catch (error: any) {
      console.error('Mağaza muhasebe hareketleri hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Mağaza muhasebe hareketleri getirilemedi'
      })
    }
  }
}

export const muhasebeController = new MuhasebeController() 