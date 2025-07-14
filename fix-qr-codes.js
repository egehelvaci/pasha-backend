const { PrismaClient } = require('./prisma/client')

const prisma = new PrismaClient()

async function fixQRCodes() {
  const orderId = 'c46da853-de31-4c48-a1dd-3e8719539c6d'
  
  try {
    console.log(`🔧 Sipariş ${orderId} için QR kodları düzeltiliyor...`)
    
    // Mevcut QR kodları sil
    const deletedQRs = await prisma.qRCode.deleteMany({
      where: { order_id: orderId }
    })
    
    console.log(`🗑️ ${deletedQRs.count} mevcut QR kod silindi`)
    
    // Siparişin item'larını al
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
    
    console.log(`📦 Sipariş ${order.items.length} farklı ürün içeriyor`)
    
    // Her item için 1 QR kod oluştur
    const createdQRCodes = []
    
    for (const item of order.items) {
      const timestamp = Date.now()
      const randomBytes = require('crypto').randomBytes(8).toString('hex').toUpperCase()
      const qrCodeString = `PASHA-${timestamp}-${randomBytes}`
      
      const createdQRCode = await prisma.qRCode.create({
        data: {
          order_id: orderId,
          order_item_id: item.id,
          product_id: item.product_id,
          qr_code: `https://pasha-backend-production.up.railway.app/api/admin/scan-qr?qrCode=${qrCodeString}`,
          is_scanned: false
        }
      })
      
      createdQRCodes.push(createdQRCode)
      console.log(`✅ QR kod oluşturuldu: Item ${item.id} (${item.product.name}) - ${createdQRCode.qr_code}`)
    }
    
    console.log(`🎉 Başarılı! ${createdQRCodes.length} QR kod oluşturuldu`)
    console.log(`📋 QR kodları:`)
    
    createdQRCodes.forEach((qr, index) => {
      console.log(`   ${index + 1}. ${qr.qr_code}`)
    })
    
  } catch (error) {
    console.error('❌ Hata:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixQRCodes() 