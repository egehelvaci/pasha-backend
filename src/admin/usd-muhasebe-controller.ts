import { Request, Response } from 'express'
import prisma from '../utils/prisma'

// USD Gelir türleri (harcama: false)
const usdIncomeTypes = [
  'Parekende Satış',
  'Toptan Satış', 
  'Hizmet Geliri',
  'Sanal POS Ödemesi',
  'Faiz Geliri',
  'Kira Geliri',
  'Diğer Gelirler',
  'Borç Tahsilatı'
]

// USD Gider türleri (harcama: true)
const usdExpenseTypes = [
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
  'Diğer Giderler'
]

export class UsdMuhasebeController {
  constructor() {
    this.getAllUsdMuhasebeHareketleri = this.getAllUsdMuhasebeHareketleri.bind(this)
    this.createUsdMuhasebeHareketi = this.createUsdMuhasebeHareketi.bind(this)
    this.getUsdIncomeTypes = this.getUsdIncomeTypes.bind(this)
    this.getUsdExpenseTypes = this.getUsdExpenseTypes.bind(this)
    this.getUsdMuhasebeHareketleriByStore = this.getUsdMuhasebeHareketleriByStore.bind(this)
  }

  /**
   * USD mağazalarının tüm muhasebe hareketlerini getir
   */
  async getAllUsdMuhasebeHareketleri(req: Request, res: Response) {
    try {
      const { limit = 50, offset = 0, storeId, startDate, endDate } = req.query
      
      // Where koşulları
      const where: any = {
        store: {
          currency: 'USD' // Sadece USD mağazaları
        }
      }

      // Store ID filtresi
      if (storeId) {
        where.storeId = storeId as string
      }

      // Tarih filtresi
      if (startDate || endDate) {
        where.tarih = {}
        if (startDate) {
          where.tarih.gte = new Date(startDate as string)
        }
        if (endDate) {
          where.tarih.lte = new Date(endDate as string)
        }
      }

      // Ödeme ile ilgili türler (COMPLETED ödemeler için filtreleme)
      const paymentRelatedTypes = ['Sanal POS Ödemesi', 'ADMIN_ÖDEME', 'ÖDEME']

      // Tüm USD muhasebe hareketlerini getir
      const hareketlerData = await prisma.muhasebeHareketleri.findMany({
        where,
        include: {
          store: {
            select: {
              store_id: true,
              kurum_adi: true,
              bakiye: true,
              currency: true,
              is_active: true
            }
          }
        },
        orderBy: {
          tarih: 'desc'
        },
        take: Number(limit),
        skip: Number(offset)
      })

      // COMPLETED ödeme kontrolü için filtreleme
      const filteredHareketler = []
      for (const hareket of hareketlerData) {
        const isPaymentRelated = paymentRelatedTypes.some(type => 
          hareket.islemTuru.includes(type) || hareket.aciklama?.includes('POS') || hareket.aciklama?.includes('Ödeme')
        )
        
        if (isPaymentRelated) {
          // Ödeme ile ilgiliyse COMPLETED kontrolü yap
          const hasCompletedPayment = await prisma.paymentTransaction.findFirst({
            where: {
              storeId: hareket.storeId,
              status: 'COMPLETED',
              paymentDate: {
                gte: new Date(hareket.tarih.getTime() - 60000), // 1 dakika tolerans
                lte: new Date(hareket.tarih.getTime() + 60000)
              }
            }
          })
          
          if (hasCompletedPayment) {
            filteredHareketler.push(hareket)
          }
        } else {
          // Ödeme ile ilgili değilse direkt ekle
          filteredHareketler.push(hareket)
        }
      }

      // Hareketleri formatla
      const hareketler = filteredHareketler.map(hareket => {
        const bakiye = Number(hareket.store.bakiye || 0)
        
        const isPaymentRelated = paymentRelatedTypes.some(type => 
          hareket.islemTuru.includes(type) || hareket.aciklama?.includes('POS') || hareket.aciklama?.includes('Ödeme')
        )
        
        let displayAmount = Number(hareket.tutar)
        let displayCurrency = hareket.currency || 'USD'
        
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

      // USD mağazalarının bakiye bilgilerini getir
      const usdMagazaData = await prisma.store.findMany({
        select: {
          store_id: true,
          kurum_adi: true,
          bakiye: true,
          is_active: true,
          currency: true
        },
        where: {
          currency: 'USD'
        }
      })

      // Bakiye bilgilerini düzenle
      const magazaBakiyeleri = usdMagazaData.map(magaza => {
        const bakiye = magaza.bakiye?.toNumber() || 0
        return {
          store_id: magaza.store_id,
          kurum_adi: magaza.kurum_adi,
          bakiye: bakiye,
          durum: bakiye === 0 ? 'DENGEDE' : bakiye < 0 ? 'BORCLU' : 'ALACAKLI',
          tutar: Math.abs(bakiye),
          is_active: magaza.is_active,
          currency: magaza.currency
        }
      })

      // Toplam alacak hesaplama (USD mağazaları için)
      const toplamAlacak = usdMagazaData
        .filter(magaza => magaza.bakiye && magaza.bakiye.toNumber() < 0)
        .reduce((toplam, magaza) => {
          return toplam + Math.abs(magaza.bakiye?.toNumber() || 0)
        }, 0)

      // Mağaza sayıları
      const adminAlacakliMagazaSayisi = usdMagazaData.filter(
        magaza => magaza.bakiye && magaza.bakiye.toNumber() < 0
      ).length

      const adminVerecekMagazaSayisi = usdMagazaData.filter(
        magaza => magaza.bakiye && magaza.bakiye.toNumber() > 0
      ).length

      return res.status(200).json({
        success: true,
        data: {
          hareketler,
          magazaBakiyeleri,
          toplamAlacak,
          adminAlacakliMagazaSayisi,
          adminVerecekMagazaSayisi,
          currency: 'USD'
        }
      })
    } catch (error: any) {
      console.error('USD Muhasebe hareketleri listesi hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'USD Muhasebe hareketleri getirilemedi'
      })
    }
  }

  /**
   * Belirli bir USD mağazasının muhasebe hareketlerini getir
   */
  async getUsdMuhasebeHareketleriByStore(req: Request, res: Response) {
    try {
      const { storeId } = req.params
      const { limit = 20, offset = 0, startDate, endDate } = req.query

      // Store kontrolü - USD olmalı
      const store = await prisma.store.findUnique({
        where: { store_id: storeId },
        select: {
          store_id: true,
          kurum_adi: true,
          currency: true,
          bakiye: true,
          is_active: true
        }
      })

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Mağaza bulunamadı'
        })
      }

      if (store.currency !== 'USD') {
        return res.status(403).json({
          success: false,
          message: 'Bu mağaza USD currency\'sine sahip değil. USD muhasebe sistemine erişim reddedildi.'
        })
      }

      // Where koşulları
      const where: any = {
        storeId: storeId
      }

      // Tarih filtresi
      if (startDate || endDate) {
        where.tarih = {}
        if (startDate) {
          where.tarih.gte = new Date(startDate as string)
        }
        if (endDate) {
          where.tarih.lte = new Date(endDate as string)
        }
      }

      // Hareketleri getir
      const hareketler = await prisma.muhasebeHareketleri.findMany({
        where,
        orderBy: {
          tarih: 'desc'
        },
        take: Number(limit),
        skip: Number(offset)
      })

      // Formatla
      const formattedHareketler = hareketler.map(hareket => ({
        ...hareket,
        tutar: Number(hareket.tutar),
        original_amount: hareket.original_amount ? Number(hareket.original_amount) : null,
        exchange_rate: hareket.exchange_rate ? Number(hareket.exchange_rate) : null
      }))

      // Bakiye durumu hesaplama
      const bakiye = Number(store.bakiye || 0)
      const bakiyeDurumu = {
        bakiye: bakiye,
        durum: bakiye === 0 ? 'DENGEDE' : bakiye < 0 ? 'BORCLU' : 'ALACAKLI',
        tutar: Math.abs(bakiye),
        acikHesapLimiti: 3000, // USD mağazaları için varsayılan limit
        limitsizAcikHesap: false,
        currency: store.currency
      }

      return res.status(200).json({
        success: true,
        data: {
          store_id: store.store_id,
          kurum_adi: store.kurum_adi,
          bakiyeDurumu,
          hareketler: formattedHareketler,
          total: hareketler.length
        }
      })
    } catch (error: any) {
      console.error('USD Mağaza muhasebe hareketleri hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'USD Mağaza muhasebe hareketleri getirilemedi'
      })
    }
  }

  /**
   * USD mağazası için yeni muhasebe hareketi oluştur
   */
  async createUsdMuhasebeHareketi(req: Request, res: Response) {
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

      // Store kontrolü - USD olmalı
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
          message: 'Mağaza bulunamadı'
        })
      }

      if (store.currency !== 'USD') {
        return res.status(403).json({
          success: false,
          message: 'Bu mağaza USD currency\'sine sahip değil'
        })
      }

      // İşlem türü kontrolü
      let harcama: boolean
      if (usdIncomeTypes.includes(islemTuru)) {
        harcama = false // Gelir
      } else if (usdExpenseTypes.includes(islemTuru)) {
        harcama = true // Gider
      } else {
        return res.status(422).json({
          success: false,
          message: `Geçersiz işlem türü: ${islemTuru}. Geçerli türler için /api/admin/usd-muhasebe/income-types ve /api/admin/usd-muhasebe/expense-types endpoint'lerini kullanın.`
        })
      }

      // Admin kendi mağazasına mı işlem yapıyor kontrolü
      const isAdminOwnStore = adminStoreId === storeId
      
      console.log(`🔍 USD BAKIYE DEBUG - İşlem Öncesi:`);
      console.log(`   Mağaza: ${store.kurum_adi}`);
      console.log(`   İşlem Türü: ${islemTuru}`);
      console.log(`   Tutar: ${tutar}`);
      console.log(`   Harcama Flag: ${harcama}`);
      console.log(`   USD Store: true`);
      console.log(`   Admin Own Store: ${isAdminOwnStore}`);

      // Currency bilgileri
      const storeCurrency = store.currency || 'USD'
      const transactionCurrency = currency || storeCurrency
      let exchangeRate: number | null = null
      let originalAmount = tutar

      // Transaction başlat - Normal muhasebe controller ile birebir aynı mantık
      const result = await prisma.$transaction(async (tx) => {
        // Yeni muhasebe hareketi oluştur
        const yeniHareket = await tx.muhasebeHareketleri.create({
          data: {
            storeId,
            islemTuru,
            tutar,
            harcama,
            tarih: new Date(tarih),
            aciklama,
            currency: transactionCurrency as any,
            original_currency: transactionCurrency as any,
            exchange_rate: exchangeRate,
            original_amount: originalAmount
          },
          include: {
            store: {
              select: {
                store_id: true,
                kurum_adi: true,
                currency: true
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
          
          console.log(`🔍 USD BAKIYE DEBUG - İşlem Öncesi:`);
          console.log(`   Mağaza: ${store.kurum_adi}`);
          console.log(`   İşlem Türü: ${islemTuru}`);
          console.log(`   Tutar: ${tutar}`);
          console.log(`   Harcama Flag: ${harcama}`);
          console.log(`   USD Store: true`);
          
          if (islemTuru === 'Borç Verme') {
            // Admin mağazaya borç veriyor: mağaza borca giriyor (bakiye azalmalı)
            magazaBakiyeDeğişimi = -tutar
            console.log(`   Borç Verme Mantığı: -${tutar}`);
          } else if (islemTuru === 'Borç Tahsilatı') {
            // Admin mağazadan borç tahsil ediyor: mağaza borcunu ödüyor (bakiye artmalı)
            magazaBakiyeDeğişimi = tutar
            console.log(`   Borç Tahsilatı Mantığı: +${tutar}`);
          } else {
            // Diğer işlemler için admin muhasebe mantığı
            // Gelir (harcama=false): Admin'e gelir, mağaza için borç (-) 
            // Gider (harcama=true): Admin'den gider, mağaza için alacak (+)
            magazaBakiyeDeğişimi = harcama ? tutar : -tutar
            console.log(`   Genel Mantık: harcama=${harcama} → ${magazaBakiyeDeğişimi > 0 ? '+' : ''}${magazaBakiyeDeğişimi}`);
          }
          
          console.log(`🔧 BAKIYE GÜNCELLEMESI:`);
          console.log(`   Hesaplanan Değişim: ${magazaBakiyeDeğişimi > 0 ? '+' : ''}${magazaBakiyeDeğişimi}`);
          
          // Önceki bakiyeyi al
          const oncekiBakiye = await tx.store.findUnique({
            where: { store_id: storeId },
            select: { bakiye: true }
          });
          
          console.log(`   Önceki Bakiye: ${oncekiBakiye?.bakiye || 0}`);
          
          // USD mağazaları da dahil olmak üzere tüm mağazaların bakiyesini güncelle
          const guncellenmisMagaza = await tx.store.update({
            where: { store_id: storeId },
            data: {
              bakiye: {
                increment: magazaBakiyeDeğişimi
              }
            },
            select: {
              bakiye: true
            }
          })
          
          console.log(`   Yeni Bakiye: ${guncellenmisMagaza.bakiye}`);
          console.log(`💰 BAŞARILI: ${store.kurum_adi} bakiyesi güncellendi → ${guncellenmisMagaza.bakiye} USD`);
        }

        return yeniHareket
      })

      return res.status(201).json({
        success: true,
        message: 'USD Muhasebe hareketi başarıyla oluşturuldu ve bakiye güncellendi',
        data: {
          ...result,
          tutar: Number(result.tutar),
          original_amount: result.original_amount ? Number(result.original_amount) : null,
          exchange_rate: result.exchange_rate ? Number(result.exchange_rate) : null
        }
      })
    } catch (error: any) {
      console.error('USD Muhasebe hareketi oluşturma hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'USD Muhasebe hareketi oluşturulamadı'
      })
    }
  }

  /**
   * USD Gelir türleri listesi
   */
  async getUsdIncomeTypes(req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      data: usdIncomeTypes
    })
  }

  /**
   * USD Gider türleri listesi  
   */
  async getUsdExpenseTypes(req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      data: usdExpenseTypes
    })
  }
}

export const usdMuhasebeController = new UsdMuhasebeController()
