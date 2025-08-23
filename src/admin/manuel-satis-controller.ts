import { Request, Response } from 'express'
import { manuelSatisService, CreateManuelSatisRequest } from '../services/manuel-satis-service'
import prisma from '../utils/prisma'

export class ManuelSatisController {
  constructor() {
    this.searchProducts = this.searchProducts.bind(this)
    this.createManuelSatis = this.createManuelSatis.bind(this)
    this.getManuelSatisReceipt = this.getManuelSatisReceipt.bind(this)
    this.getManuelSatisList = this.getManuelSatisList.bind(this)
    this.getManuelSatisById = this.getManuelSatisById.bind(this)
    this.calculateProductPrice = this.calculateProductPrice.bind(this)
  }

  /**
   * Ürün arama - yazarken filtreleme
   * 
   * @route GET /api/admin/manuel-satis/search-products
   * @access Admin
   * @description Ürün arama API'si - yazarken dinamik filtreleme
   * 
   * @query {string} q - Arama terimi (en az 2 karakter)
   * @query {string} collectionId - Koleksiyon ID'si (opsiyonel)
   * @query {number} limit - Sonuç limiti (varsayılan: 20)
   */
  async searchProducts(req: Request, res: Response) {
    try {
      const { q: query, collectionId, limit } = req.query

      const result = await manuelSatisService.searchProducts({
        query: query as string,
        collectionId: collectionId as string,
        limit: limit ? Number(limit) : 20
      })

      return res.json(result)
    } catch (error: any) {
      console.error('Ürün arama hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Ürün arama sırasında hata oluştu',
        data: []
      })
    }
  }

  /**
   * Manuel satış oluştur
   * 
   * @route POST /api/admin/manuel-satis/create
   * @access Admin
   * @description Yeni manuel satış kaydı oluşturur
   * 
   * @body {string} storeId - Mağaza ID'si
   * @body {Array} items - Satış kalemleri
   * @body {string} paymentMethod - Ödeme yöntemi (opsiyonel)
   * @body {string} notes - Notlar (opsiyonel)
   */
  async createManuelSatis(req: Request, res: Response) {
    try {
      const { storeId, items, paymentMethod, notes } = req.body

      // Zorunlu alanları kontrol et
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Mağaza ID\'si zorunludur'
        })
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'En az bir ürün seçilmelidir'
        })
      }

      // Her item için zorunlu alanları kontrol et
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!item.productId) {
          return res.status(400).json({
            success: false,
            message: `${i + 1}. ürün için ürün ID'si zorunludur`
          })
        }
        if (!item.quantity || item.quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: `${i + 1}. ürün için geçerli bir miktar girilmelidir`
          })
        }
        if (!item.unitPrice || item.unitPrice <= 0) {
          return res.status(400).json({
            success: false,
            message: `${i + 1}. ürün için geçerli bir birim fiyat girilmelidir`
          })
        }
      }

      const requestData: CreateManuelSatisRequest = {
        storeId,
        items,
        paymentMethod,
        notes
      }

      const result = await manuelSatisService.createManuelSatis(requestData)
      
      if (!result.success) {
        return res.status(400).json(result)
      }
      
      return res.status(201).json(result)
    } catch (error: any) {
      console.error('Manuel satış oluşturma hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Manuel satış işlemi sırasında hata oluştu'
      })
    }
  }

  /**
   * Manuel satış fişi al
   * 
   * @route GET /api/admin/manuel-satis/receipt/:fisNumarasi
   * @access Admin
   * @description Manuel satış fişini getirir
   * 
   * @param {string} fisNumarasi - Fiş numarası
   */
  async getManuelSatisReceipt(req: Request, res: Response) {
    try {
      const { fisNumarasi } = req.params
      
      if (!fisNumarasi) {
        return res.status(400).json({
          success: false,
          message: 'Fiş numarası gereklidir'
        })
      }
      
      const result = await manuelSatisService.getManuelSatisReceipt(fisNumarasi)
      
      if (!result.success) {
        return res.status(result.statusCode || 404).json({
          success: false,
          message: result.message
        })
      }
      
      return res.json({
        success: true,
        data: result.receipt
      })
    } catch (error: any) {
      console.error('Manuel satış fişi alma hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Fiş alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Manuel satış listesi
   * 
   * @route GET /api/admin/manuel-satis/list
   * @access Admin
   * @description Manuel satış kayıtlarını listeler
   * 
   * @query {string} storeId - Mağaza ID'si (opsiyonel)
   * @query {string} startDate - Başlangıç tarihi (YYYY-MM-DD)
   * @query {string} endDate - Bitiş tarihi (YYYY-MM-DD)
   * @query {number} page - Sayfa numarası (varsayılan: 1)
   * @query {number} limit - Sayfa başına kayıt (varsayılan: 20)
   */
  async getManuelSatisList(req: Request, res: Response) {
    try {
      const { 
        storeId, 
        startDate, 
        endDate, 
        page = '1', 
        limit = '20' 
      } = req.query
      
      const result = await manuelSatisService.getManuelSatisList({
        storeId: storeId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: Number(page),
        limit: Number(limit)
      })
      
      return res.json(result)
    } catch (error: any) {
      console.error('Manuel satış listesi hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Liste alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Manuel satış detayı getir
   * 
   * @route GET /api/admin/manuel-satis/:fisNumarasi
   * @access Admin
   * @description Belirli bir manuel satışın detaylarını getirir
   * 
   * @param {string} fisNumarasi - Fiş numarası
   */
  async getManuelSatisById(req: Request, res: Response) {
    try {
      const { fisNumarasi } = req.params
      
      if (!fisNumarasi) {
        return res.status(400).json({
          success: false,
          message: 'Fiş numarası gereklidir'
        })
      }
      
      const result = await manuelSatisService.getManuelSatisReceipt(fisNumarasi)
      
      if (!result.success) {
        return res.status(result.statusCode || 404).json({
          success: false,
          message: result.message
        })
      }
      
      // Sadece satış bilgilerini döndür, fiş formatında değil
      const receipt = result.receipt
      if (!receipt) {
        return res.status(500).json({
          success: false,
          message: 'Fiş verisi alınamadı'
        })
      }
      
      const response = {
        fisNumarasi: receipt.satis.fisNumarasi,
        tarih: receipt.satis.tarih,
        toplamTutar: receipt.satis.toplamTutar,
        aciklama: receipt.satis.aciklama,
        magaza: receipt.magaza,
        urunler: receipt.urunler,
        ozet: receipt.ozet
      }
      
      return res.json({
        success: true,
        data: response
      })
    } catch (error: any) {
      console.error('Manuel satış detayı alma hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Detay alınırken bir hata oluştu'
      })
    }
  }

  /**
   * Ürün fiyatı hesapla
   * 
   * @route POST /api/admin/manuel-satis/calculate-price
   * @access Admin
   * @description Belirli bir ürün için fiyat hesaplar
   * 
   * @body {string} storeId - Mağaza ID'si
   * @body {string} productId - Ürün ID'si
   * @body {number} width - En (cm)
   * @body {number} height - Boy (cm)
   * @body {boolean} useStorePriceList - Mağaza fiyat listesi kullanılsın mı
   */
  async calculateProductPrice(req: Request, res: Response) {
    try {
      const { storeId, productId, width, height, useStorePriceList = true } = req.body
      
      if (!storeId || !productId) {
        return res.status(400).json({
          success: false,
          message: 'Mağaza ID\'si ve Ürün ID\'si gereklidir'
        })
      }

      // Ürün bilgilerini al
      const product = await prisma.product.findUnique({
        where: { productId },
        include: {
          collection: true
        }
      })

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Ürün bulunamadı'
        })
      }

      // Manuel satışta her zaman varsayılan fiyat listesi kullanılır
      const { getDefaultPriceList } = require('../utils/priceListUtils')
      const priceList = await getDefaultPriceList()
      
      if (!priceList) {
        return res.status(404).json({
          success: false,
          message: 'Varsayılan fiyat listesi bulunamadı'
        })
      }

      // Fiyat hesapla
      const mockItem = {
        productId,
        quantity: 1,
        width: width || undefined,
        height: height || undefined,
        unitPrice: 0 // Bu hesaplanacak
      }

      const calculatedPrice = await manuelSatisService.calculateProductPrice(product, mockItem, priceList)
      
      return res.json({
        success: true,
        data: {
          productId,
          productName: product.name,
          collectionName: product.collection.name,
          width: width || null,
          height: height || null,
          alanM2: width && height ? (width * height) / 10000 : null,
          unitPrice: calculatedPrice,
          priceListName: priceList.name,
          currency: priceList.currency || 'TRY'
        }
      })
    } catch (error: any) {
      console.error('Fiyat hesaplama hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Fiyat hesaplanırken hata oluştu'
      })
    }
  }

  /**
   * Manuel satış iptal et
   * 
   * @route DELETE /api/admin/manuel-satis/:fisNumarasi
   * @access Admin
   * @description Manuel satışı iptal eder ve stokları geri yükler
   * 
   * @param {string} fisNumarasi - Fiş numarası
   */
  async cancelManuelSatis(req: Request, res: Response) {
    try {
      const { fisNumarasi } = req.params
      const { reason } = req.body
      
      if (!fisNumarasi) {
        return res.status(400).json({
          success: false,
          message: 'Fiş numarası gereklidir'
        })
      }
      
      // Bu özellik ileride eklenebilir
      return res.status(501).json({
        success: false,
        message: 'Manuel satış iptal özelliği henüz implementasyona alınmamıştır'
      })
    } catch (error: any) {
      console.error('Manuel satış iptal hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'İptal işlemi sırasında hata oluştu'
      })
    }
  }
}
