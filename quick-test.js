const { PrismaClient } = require('./generated/prisma/default.js');
const prisma = new PrismaClient();

async function quickTest() {
  try {
    console.log('=== HIZLI STOK KONTROLÜ ===');
    
    const productId = '007fe5f6-4df7-413d-b4ab-09e05cb305e7';
    
    // 80x10000 varyasyonunu kontrol et
    const variation = await prisma.productvariations.findFirst({
      where: {
        product_id: productId,
        width: 80,
        height: 10000
      }
    });
    
    if (variation) {
      console.log(`\n📦 ALA 03 İKON GRİ - 80x10000:`);
      console.log(`- Mevcut Stok: ${variation.stock_area_m2} m²`);
      
      return parseFloat(variation.stock_area_m2);
    } else {
      console.log('❌ Varyasyon bulunamadı');
      return null;
    }
    
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();
