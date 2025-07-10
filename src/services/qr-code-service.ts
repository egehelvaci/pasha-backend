import crypto from 'crypto'
import prisma from '../utils/prisma'

export class QRCodeService {
  /**
   * Sipariş için QR kodları oluştur
   * Her ürün çeşidi için ayrı QR kod oluşturulur
   */
  async generateQRCodesForOrder(orderId: string) {
    try {
      // Siparişin mevcut olup olmadığını kontrol et
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      if (!order) {
        throw new Error('Sipariş bulunamadı')
      }

      if (order.status !== 'PENDING') {
        throw new Error('Sadece bekleyen siparişler için QR kod oluşturulabilir')
      }

      const qrCodes = []

      // Her sipariş öğesi için QR kod oluştur
      for (const item of order.items) {
        // Her ürün adedi için ayrı QR kod oluştur
        for (let i = 0; i < item.quantity; i++) {
          const qrCode = this.generateUniqueQRCode()
          
          const createdQRCode = await prisma.qRCode.create({
            data: {
              order_id: orderId,
              product_id: item.product_id,
              order_item_id: item.id,
              qr_code: qrCode,
              quantity: 1 // Her QR kod bir adet için
            }
          })

          qrCodes.push(createdQRCode)
        }
      }

      // Siparişi onaylandı olarak işaretle
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'CONFIRMED',
          updated_at: new Date()
        }
      })

      return {
        success: true,
        qrCodes,
        totalQRCodes: qrCodes.length
      }
    } catch (error: any) {
      throw new Error(`QR kod oluşturma hatası: ${error.message}`)
    }
  }

  /**
   * Sipariş için stokları düşür
   */
  async reduceStockForOrder(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true
        }
      })

      if (!order) {
        throw new Error('Sipariş bulunamadı')
      }

      // Her sipariş öğesi için stok düşür
      for (const item of order.items) {
        // Ürün varyasyonlarında stok kontrolü ve düşürme
        const variations = await prisma.productvariations.findMany({
          where: {
            product_id: item.product_id,
            width: item.width ? Math.round(Number(item.width)) : undefined,
            height: item.height ? Math.round(Number(item.height)) : undefined,
            has_fringe: item.has_fringe || false
          }
        })

        if (variations.length > 0) {
          for (const variation of variations) {
            if (variation.stock_quantity < item.quantity) {
              throw new Error(`${item.product_id} ürünü için yeterli stok yok. Mevcut: ${variation.stock_quantity}, İstenen: ${item.quantity}`)
            }

            // Stok düşür
            await prisma.productvariations.update({
              where: { id: variation.id },
              data: {
                stock_quantity: variation.stock_quantity - item.quantity
              }
            })
          }
        } else {
          console.warn(`${item.product_id} ürünü için varyasyon bulunamadı, stok düşürülmedi`)
        }
      }

      return { success: true }
    } catch (error: any) {
      throw new Error(`Stok düşürme hatası: ${error.message}`)
    }
  }

  /**
   * QR kod okut ve teslim durumunu güncelle
   */
  async scanQRCode(qrCode: string, adminUserId: string) {
    try {
      // QR kod kontrolü
      const qrRecord = await prisma.qRCode.findUnique({
        where: { qr_code: qrCode },
        include: {
          order: {
            include: {
              user: true,
              items: true
            }
          },
          product: true,
          order_item: true
        }
      })

      if (!qrRecord) {
        throw new Error('Geçersiz QR kod')
      }

      if (qrRecord.is_scanned) {
        throw new Error('Bu QR kod daha önce okunmuş')
      }

      // QR kodu okundu olarak işaretle
      await prisma.qRCode.update({
        where: { id: qrRecord.id },
        data: {
          is_scanned: true,
          scanned_at: new Date()
        }
      })

      // Siparişteki tüm QR kodların okunup okunmadığını kontrol et
      const allQRCodes = await prisma.qRCode.findMany({
        where: { order_id: qrRecord.order_id }
      })

      const scannedCount = allQRCodes.filter(qr => qr.is_scanned).length
      const totalCount = allQRCodes.length

      // Tüm QR kodlar okunduysa siparişi teslim edildi olarak işaretle
      if (scannedCount === totalCount) {
        await prisma.order.update({
          where: { id: qrRecord.order_id },
          data: {
            status: 'DELIVERED',
            updated_at: new Date()
          }
        })
      }

      return {
        success: true,
        qrCode: qrRecord,
        order: qrRecord.order,
        scannedCount,
        totalCount,
        isOrderCompleted: scannedCount === totalCount
      }
    } catch (error: any) {
      throw new Error(`QR kod okuma hatası: ${error.message}`)
    }
  }

  /**
   * Sipariş için QR kodları listele
   */
  async getQRCodesForOrder(orderId: string) {
    try {
      const qrCodes = await prisma.qRCode.findMany({
        where: { order_id: orderId },
        include: {
          product: true,
          order_item: true
        },
        orderBy: { created_at: 'asc' }
      })

      const scannedCount = qrCodes.filter(qr => qr.is_scanned).length
      const totalCount = qrCodes.length

      return {
        qrCodes,
        scannedCount,
        totalCount,
        completionPercentage: totalCount > 0 ? Math.round((scannedCount / totalCount) * 100) : 0
      }
    } catch (error: any) {
      throw new Error(`QR kod listesi alınırken hata: ${error.message}`)
    }
  }

  /**
   * Benzersiz QR kod oluştur
   */
  private generateUniqueQRCode(): string {
    const timestamp = Date.now()
    const randomBytes = crypto.randomBytes(8).toString('hex')
    return `PASHA-${timestamp}-${randomBytes}`.toUpperCase()
  }

  /**
   * QR kod istatistikleri
   */
  async getQRCodeStats(orderId?: string) {
    try {
      const where = orderId ? { order_id: orderId } : {}
      
      const totalQRCodes = await prisma.qRCode.count({ where })
      const scannedQRCodes = await prisma.qRCode.count({ 
        where: { ...where, is_scanned: true } 
      })

      return {
        total: totalQRCodes,
        scanned: scannedQRCodes,
        pending: totalQRCodes - scannedQRCodes,
        completionRate: totalQRCodes > 0 ? Math.round((scannedQRCodes / totalQRCodes) * 100) : 0
      }
    } catch (error: any) {
      throw new Error(`QR kod istatistikleri alınırken hata: ${error.message}`)
    }
  }
}

export const qrCodeService = new QRCodeService() 