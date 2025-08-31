import crypto from 'crypto'
import prisma from '../utils/prisma'
import { notificationService } from './notification-service'
import { UploadService } from '../utils/upload-service'

export class BarcodeService {
  /**
   * Sipariş CONFIRMED olduğunda otomatik barkod oluştur
   */
  async generateBarcodesForOrder(orderId: string) {
    try {
      // Siparişi kontrol et
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          },
          barcodes: true
        }
      })

      if (!order) {
        throw new Error('Sipariş bulunamadı')
      }

      // CONFIRMED veya READY siparişler için barkod oluşturulabilir
      if (order.status !== 'CONFIRMED' && order.status !== 'READY') {
        throw new Error(`Barkodlar sadece 'ONAYLANMIŞ' (CONFIRMED) veya 'HAZIR' (READY) siparişler için oluşturulabilir. Bu siparişin durumu: ${order.status}`)
      }

      // Eğer mevcut barkodlar varsa, bunları kontrol et
      if (order.barcodes && order.barcodes.length > 0) {
        console.log(`✅ Sipariş ${orderId} için ${order.barcodes.length} barkod zaten mevcut`)
        return {
          success: true,
          barcodes: order.barcodes,
          message: `Sipariş için ${order.barcodes.length} barkod zaten mevcut`
        }
      }

      const createdBarcodes = []

      // Her sipariş item'ı için 1 barkod oluştur (quantity'den bağımsız)
      for (const item of order.items) {
        console.log(`🚀 Item ${item.id} için 1 adet barkod oluşturuluyor (Ürün: ${item.product_id}, Miktar: ${item.quantity})`)
        
        const barcodeString = this.generateUniqueBarcode()
        
        const createdBarcode = await prisma.barcode.create({
          data: {
            order_id: orderId,
            order_item_id: item.id,
            product_id: item.product_id,
            barcode: barcodeString,
            barcode_type: 'CODE128',
            is_scanned: false,
            quantity: item.quantity,
            required_scans: item.quantity, // Item'ın quantity'si kadar okutulması gerekiyor
            scan_count: 0
          }
        })

        createdBarcodes.push(createdBarcode)
        console.log(`✅ Barkod oluşturuldu: ${createdBarcode.barcode} (${item.quantity} kez okutulacak)`)
      }

      const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
      console.log(`✅ Toplam ${createdBarcodes.length} barkod oluşturuldu (${totalItems} ürün için)`)

      return {
        success: true,
        barcodes: createdBarcodes,
        message: `Sipariş için ${createdBarcodes.length} barkod başarıyla oluşturuldu`,
        totalBarcodes: createdBarcodes.length,
        itemBreakdown: order.items.map(item => ({
          itemId: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          barcodesGenerated: item.quantity
        }))
      }
    } catch (error: any) {
      console.error('Barkod oluşturma hatası:', error)
      throw new Error(`Barkod oluşturma hatası: ${error.message}`)
    }
  }

  /**
   * Barkod okut ve sipariş durumunu kontrol et
   */
  async scanBarcode(barcode: string, userId?: string) {
    try {
      // Barkod kontrolü
      const barcodeRecord = await prisma.barcode.findUnique({
        where: { barcode },
        include: {
          order: {
            include: {
              user: {
                include: {
                  Store: true,
                  userType: true
                }
              },
              items: {
                include: {
                  product: {
                    include: {
                      collection: true
                    }
                  }
                }
              }
            }
          },
          order_item: {
            include: {
              product: true
            }
          },
          product: true
        }
      })

      if (!barcodeRecord) {
        throw new Error('Geçersiz barkod')
      }

      // Gerekli scan sayısına ulaşıp ulaşmadığını kontrol et
      if (barcodeRecord.scan_count >= barcodeRecord.required_scans) {
        return {
          success: false,
          message: `Bu barkod zaten ${barcodeRecord.required_scans} kez okutulmuş (tamamlandı)`,
          alreadyCompleted: true,
          barcode: barcodeRecord,
          scanCount: barcodeRecord.scan_count,
          requiredScans: barcodeRecord.required_scans
        }
      }

      // Scan sayısını artır
      const newScanCount = barcodeRecord.scan_count + 1
      const isCompleted = newScanCount >= barcodeRecord.required_scans

      await prisma.barcode.update({
        where: { id: barcodeRecord.id },
        data: {
          scan_count: newScanCount,
          is_scanned: isCompleted, // Sadece tüm scanler tamamlandığında true
          last_scan_at: new Date(),
          scanned_at: isCompleted ? new Date() : barcodeRecord.scanned_at, // İlk tamamlandığında set et
          scanned_by: userId
        }
      })

      // Siparişin tüm barkodlarını kontrol et
      const allBarcodes = await prisma.barcode.findMany({
        where: { order_id: barcodeRecord.order_id }
      })

      const scannedBarcodes = allBarcodes.filter(b => b.is_scanned)
      const allScanned = scannedBarcodes.length === allBarcodes.length

      let message = `Barkod okutuldu (${scannedBarcodes.length}/${allBarcodes.length})`
      
      // Tüm barkodlar okutulduysa siparişi teslim edildi olarak güncelle
      if (allScanned) {
        await prisma.order.update({
          where: { id: barcodeRecord.order_id },
          data: {
            status: 'DELIVERED',
            updated_at: new Date()
          }
        })
        message = 'Tüm barkodlar okutuldu! Sipariş teslim edildi.'

        // Teslim edildi bildirimi gönder
        try {
          await notificationService.notifyOrderCompleted(
            barcodeRecord.order_id,
            barcodeRecord.order.user_id,
            barcodeRecord.order_id
          );
          console.log('✅ Sipariş teslim edildi bildirimi gönderildi');
        } catch (notificationError) {
          console.error('❌ Sipariş teslim edildi bildirim hatası:', notificationError);
        }
      }

      return {
        success: true,
        message: `Barkod okutuldu (${newScanCount}/${barcodeRecord.required_scans}) - ${barcodeRecord.order_item?.product?.name || 'Bilinmeyen ürün'}${isCompleted ? ' ✅ Tamamlandı!' : ''}`,
        barcode: {
          ...barcodeRecord,
          scan_count: newScanCount,
          is_scanned: isCompleted
        },
        order: {
          id: barcodeRecord.order.id,
          status: allScanned ? 'DELIVERED' : barcodeRecord.order.status,
          total_price: barcodeRecord.order.total_price,
          customer: {
            name: barcodeRecord.order.user.name,
            email: barcodeRecord.order.user.email,
            store: barcodeRecord.order.user.Store,
            userType: barcodeRecord.order.user.userType
          }
        },
        scanInfo: {
          current_scan_count: newScanCount,
          required_scans: barcodeRecord.required_scans,
          item_completed: isCompleted,
          total_barcodes_completed: scannedBarcodes.length,
          total_count: allBarcodes.length,
          is_completed: allScanned,
          progress_percentage: Math.round((scannedBarcodes.length / allBarcodes.length) * 100)
        }
      }
    } catch (error: any) {
      throw new Error(`Barkod okuma hatası: ${error.message}`)
    }
  }

  /**
   * Birden çok barkod okut (toplu gönderim)
   */
  async scanMultipleBarcodes(barcodes: string[], userId?: string) {
    try {
      const results = []
      const orderStatusUpdates = new Map<string, boolean>()

      for (const barcode of barcodes) {
        try {
          const result = await this.scanBarcode(barcode, userId)
          results.push(result)

          // Sipariş durumunu takip et
          if (result.order && result.scanInfo?.is_completed) {
            orderStatusUpdates.set(result.order.id, true)
          }
        } catch (error: any) {
          results.push({
            success: false,
            barcode,
            error: error.message
          })
        }
      }

      // Tamamlanan siparişleri listele
      const completedOrders = Array.from(orderStatusUpdates.keys())

      return {
        success: true,
        results,
        summary: {
          total_scanned: results.filter(r => r.success).length,
          total_failed: results.filter(r => !r.success).length,
          completed_orders: completedOrders,
          completed_orders_count: completedOrders.length
        }
      }
    } catch (error: any) {
      throw new Error(`Toplu barkod okuma hatası: ${error.message}`)
    }
  }

  /**
   * Sipariş için barkod bilgilerini getir
   */
  async getBarcodesForOrder(orderId: string) {
    try {
      const barcodes = await prisma.barcode.findMany({
        where: { order_id: orderId },
        include: {
          order_item: {
            include: {
              product: true
            }
          },
          product: true
        },
        orderBy: {
          created_at: 'asc'
        }
      })

      if (barcodes.length === 0) {
        throw new Error('Bu sipariş için barkod bulunamadı')
      }

      const scannedCount = barcodes.filter(b => b.is_scanned).length
      const totalCount = barcodes.length

      return {
        success: true,
        barcodes,
        scanInfo: {
          scanned_count: scannedCount,
          total_count: totalCount,
          is_completed: scannedCount === totalCount,
          progress_percentage: Math.round((scannedCount / totalCount) * 100)
        }
      }
    } catch (error: any) {
      throw new Error(`Barkod bilgisi alınamadı: ${error.message}`)
    }
  }

  /**
   * READY durumdaki tüm siparişleri kontrol et ve barkod oluştur
   */
  async checkAndCreateBarcodesForReadyOrders() {
    try {
      // READY durumundaki ve barkodu olmayan siparişleri bul
      const readyOrders = await prisma.order.findMany({
        where: {
          status: 'READY',
          barcodes: {
            none: {}
          }
        },
        select: {
          id: true
        }
      })

      const results = []
      for (const order of readyOrders) {
        try {
          const result = await this.generateBarcodesForOrder(order.id)
          results.push({
            orderId: order.id,
            success: true,
            barcodesCreated: result.totalBarcodes
          })
        } catch (error: any) {
          results.push({
            orderId: order.id,
            success: false,
            error: error.message
          })
        }
      }

      return {
        success: true,
        ordersProcessed: readyOrders.length,
        results
      }
    } catch (error: any) {
      throw new Error(`READY siparişler için barkod oluşturma hatası: ${error.message}`)
    }
  }

  /**
   * Sipariş için barkod görsellerini oluştur ve Tebi'ye yükle
   */
  async generateBarcodeImagesForOrder(orderId: string) {
    const uploadService = new UploadService()

    try {
      // Siparişi kontrol et
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true }
      });

      if (!order) {
        throw new Error('Sipariş bulunamadı.');
      }

      // Siparişe ait barkodları bul
      const barcodeRecords = await prisma.barcode.findMany({
        where: {
          order_id: orderId
        },
        select: {
          id: true,
          barcode: true,
          barcode_image_url: true
        }
      })

      if (barcodeRecords.length === 0) {
        throw new Error('Bu sipariş için barkod bulunamadı.');
      }

      // Zaten görseli olan barkodları filtrele
      const barcodesNeedingImages = barcodeRecords.filter(barcode => !barcode.barcode_image_url)

      if (barcodesNeedingImages.length === 0) {
        return {
          success: true,
          message: 'Bu sipariş için tüm barkod görselleri zaten mevcut.',
          processedCount: 0,
          generatedImages: []
        }
      }

      let successCount = 0
      const generatedImages = []

      // Her barkod için SVG görsel oluştur
      for (const barcodeRecord of barcodesNeedingImages) {
        try {
          // Basit SVG barkod oluştur
          const svgContent = this.generateBarcodeSVG(barcodeRecord.barcode)
          const svgBuffer = Buffer.from(svgContent, 'utf-8')

          // Dosyayı Tebi'ye yükle
          const fileName = `${barcodeRecord.barcode}.svg`
          const imageUrl = await uploadService.uploadFile(
            svgBuffer,
            'image/svg+xml',
            fileName,
            'barcodes' // Barkodlar için özel klasör
          )

          // Veritabanındaki kaydı güncelle
          await prisma.barcode.update({
            where: { id: barcodeRecord.id },
            data: { barcode_image_url: imageUrl }
          })

          generatedImages.push({ 
            barcode: barcodeRecord.barcode, 
            imageUrl: imageUrl
          })
          successCount++
        } catch (error) {
          console.error(`Barkod ${barcodeRecord.barcode} için görsel oluşturulurken veya yüklenirken hata oluştu:`, error)
        }
      }

      return {
        success: true,
        message: `${successCount} barkod görseli başarıyla oluşturuldu ve yüklendi.`,
        processedCount: successCount,
        generatedImages: generatedImages
      }
    } catch (error: any) {
      throw new Error(`Barkod görsel oluşturma hatası: ${error.message}`)
    }
  }

  /**
   * Basit SVG barkod oluştur
   */
  private generateBarcodeSVG(barcodeText: string): string {
    // Basit çubuk deseni oluştur (gerçek CODE128 algoritması değil, sadece görsel amaçlı)
    const bars: number[] = []
    for (let i = 0; i < barcodeText.length; i++) {
      const char = barcodeText.charCodeAt(i)
      // Her karakter için farklı bar deseni
      bars.push(1, 1, 2, 1, 1) // Basit desen
    }

    let svgBars = ''
    let x = 10
    const barWidth = 2
    const barHeight = 60

    for (let i = 0; i < bars.length; i++) {
      const barSize = bars[i]
      if (i % 2 === 0) { // Siyah çubuk
        svgBars += `<rect x="${x}" y="20" width="${barSize * barWidth}" height="${barHeight}" fill="#000000"/>`
      }
      x += barSize * barWidth
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="120" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="120" fill="#ffffff"/>
  ${svgBars}
  <text x="150" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#000000">${barcodeText}</text>
</svg>`
  }

  /**
   * Barkod görsel oluşturma işlemini çalıştır (queue için)
   */
  async generateBarcodeImagesForOrderQueued(orderId: string): Promise<boolean> {
    try {
      await this.generateBarcodeImagesForOrder(orderId);
      return true;
    } catch (error) {
      console.error('Barkod görsel oluşturma hatası:', error);
      return false;
    }
  }

  /**
   * Benzersiz barkod üret
   */
  private generateUniqueBarcode(): string {
    const timestamp = Date.now()
    const randomBytes = crypto.randomBytes(6).toString('hex').toUpperCase()
    return `BAR-${timestamp}-${randomBytes}`
  }

  /**
   * Barkod istatistikleri
   */
  async getBarcodeStats(orderId?: string) {
    try {
      const where = orderId ? { order_id: orderId } : {}
      
      const allBarcodes = await prisma.barcode.findMany({ where })
      const totalBarcodes = allBarcodes.length
      
      const scannedBarcodes = allBarcodes.filter(b => b.is_scanned)
      const pendingBarcodes = allBarcodes.filter(b => !b.is_scanned)

      if (orderId) {
        return {
          total: totalBarcodes,
          scanned: scannedBarcodes.length,
          pending: pendingBarcodes.length,
          completion_rate: totalBarcodes > 0 ? Math.round((scannedBarcodes.length / totalBarcodes) * 100) : 0
        }
      }

      // Genel istatistikler
      const orders = await prisma.order.findMany({
        where: {
          status: 'READY',
          barcodes: {
            some: {}
          }
        },
        include: {
          barcodes: true
        }
      })

      const orderStats = orders.map(order => {
        const barcodes = order.barcodes
        const scanned = barcodes.filter(b => b.is_scanned).length
        const total = barcodes.length
        
        return {
          order_id: order.id,
          status: order.status,
          total_barcodes: total,
          scanned_barcodes: scanned,
          is_completed: total > 0 && scanned === total
        }
      })

      const completedOrders = orderStats.filter(o => o.is_completed).length
      const totalOrdersWithBarcodes = orderStats.length

      return {
        total_barcodes: totalBarcodes,
        scanned_barcodes: scannedBarcodes.length,
        pending_barcodes: pendingBarcodes.length,
        total_orders_with_barcodes: totalOrdersWithBarcodes,
        completed_orders: completedOrders,
        order_completion_rate: totalOrdersWithBarcodes > 0 ? Math.round((completedOrders / totalOrdersWithBarcodes) * 100) : 0,
        barcode_scan_rate: totalBarcodes > 0 ? Math.round((scannedBarcodes.length / totalBarcodes) * 100) : 0
      }
    } catch (error: any) {
      throw new Error(`İstatistik hatası: ${error.message}`)
    }
  }
}

export const barcodeService = new BarcodeService()