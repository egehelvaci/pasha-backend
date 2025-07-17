import { Request, Response } from 'express'
import prisma from '../utils/prisma'

// Gelir türleri (harcama: false)
const incomeTypes = [
  'Parekende Satış',
  'Toptan Satış',
  'Hizmet Geliri',
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
  }

  /**
   * Tüm muhasebe hareketlerini listele
   */
  async getAllMuhasebeHareketleri(req: Request, res: Response) {
    try {
      const hareketler = await prisma.muhasebeHareketleri.findMany({
        include: {
          store: {
            select: {
              store_id: true,
              kurum_adi: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.status(200).json({
        success: true,
        data: hareketler
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
      const { storeId, islemTuru, tutar, tarih, aciklama } = req.body

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
        where: { store_id: storeId }
      })

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Belirtilen mağaza bulunamadı'
        })
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
            aciklama
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

        if (!adminVarliklar) {
          // İlk kez oluşturuluyor
          await tx.adminVarliklari.create({
            data: {
              id: 1,
              kasaBakiyesi: harcama ? -tutar : tutar
            }
          })
        } else {
          // Mevcut bakiyeyi güncelle
          await tx.adminVarliklari.update({
            where: { id: 1 },
            data: {
              kasaBakiyesi: {
                increment: harcama ? -tutar : tutar
              }
            }
          })
        }

        // Mağaza cari bakiyesini güncelle
        await tx.store.update({
          where: { store_id: storeId },
          data: {
            cari_bakiye: {
              increment: harcama ? -tutar : tutar
            }
          }
        })

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

      // Tüm mağazaların cari bakiyeleri
      const magazalar = await prisma.store.findMany({
        select: {
          store_id: true,
          kurum_adi: true,
          cari_bakiye: true
        },
        where: {
          is_active: true
        }
      })

      // Toplam alacak hesaplama (sadece negatif bakiyeler)
      const toplamAlacak = magazalar
        .filter(magaza => magaza.cari_bakiye && magaza.cari_bakiye.toNumber() < 0)
        .reduce((toplam, magaza) => {
          return toplam + Math.abs(magaza.cari_bakiye?.toNumber() || 0)
        }, 0)

      // Borçlu ve alacaklı mağazalar
      const borcluMagazalar = magazalar.filter(magaza => 
        magaza.cari_bakiye && magaza.cari_bakiye.toNumber() < 0
      )

      const alacakliMagazalar = magazalar.filter(magaza => 
        magaza.cari_bakiye && magaza.cari_bakiye.toNumber() > 0
      )

      return res.status(200).json({
        success: true,
        data: {
          adminKasaBakiyesi: adminVarliklar?.kasaBakiyesi || 0,
          toplamAlacak,
          borcluMagazalar: borcluMagazalar.map(magaza => ({
            store_id: magaza.store_id,
            kurum_adi: magaza.kurum_adi,
            borc: Math.abs(magaza.cari_bakiye?.toNumber() || 0)
          })),
          alacakliMagazalar: alacakliMagazalar.map(magaza => ({
            store_id: magaza.store_id,
            kurum_adi: magaza.kurum_adi,
            alacak: magaza.cari_bakiye?.toNumber() || 0
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
}

export const muhasebeController = new MuhasebeController() 