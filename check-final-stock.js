const { PrismaClient } = require('./generated/prisma/default.js');
const prisma = new PrismaClient();

async function checkFinalStock() {
  try {
    console.log('=== FİNAL STOK KONTROLÜ ===');
    
    const productId = '2f79c0a3-346c-477a-97b0-932b63615b99';
    
    // 80x10000 varyasyonunu bul
    const variation = await prisma.productvariations.findFirst({
      where: {
        product_id: productId,
        width: 80,
        height: 10000
      }
    });
    
    if (variation) {
      console.log('\n✅ 80x10000 Varyasyonu:');
      console.log(`- Stok M²: ${variation.stock_area_m2}`);
      console.log(`- Stok Adet: ${variation.stock_quantity}`);
      
      console.log('\n📊 BEKLENEN SONUÇ:');
      console.log('- Başlangıç stok: 50 m²');
      console.log('- Sipariş miktarı: 1.6 m²');
      console.log('- Sipariş sonrası: 48.4 m²');
      console.log('- İptal sonrası: 50 m² (iade edilmeli)');
      
      const currentStock = parseFloat(variation.stock_area_m2);
      if (currentStock === 50) {
        console.log('\n🎉 TEST BAŞARILI! Stok doğru şekilde iade edildi!');
      } else if (currentStock === 48.4) {
        console.log('\n❌ TEST BAŞARISIZ! Stok iade edilmedi. Düzeltme gerekli.');
      } else {
        console.log(`\n⚠️ BEKLENMEYEN SONUÇ! Mevcut stok: ${currentStock} m²`);
      }
      
    } else {
      console.log('\n❌ 80x10000 varyasyonu bulunamadı');
    }
    
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFinalStock();
