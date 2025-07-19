import { PrismaClient } from '../generated/prisma';
import { QRCodeService } from '../src/services/qr-code-service';

const prisma = new PrismaClient();
const qrCodeService = new QRCodeService();

async function testStockReductionAgain() {
  try {
    console.log('🔍 Düzeltilmiş varyasyonlarla stok düşürme testi...');
    
    // DENEME ürününü bul
    const demoProduct = await prisma.product.findFirst({
      where: {
        name: 'DENEME'
      }
    });
    
    if (!demoProduct) {
      console.log('❌ DENEME ürünü bulunamadı!');
      return;
    }
    
    console.log(`📦 DENEME ürünü: ${demoProduct.productId}`);
    
    // 80x100 saçaklı varyasyonu bul
    const fringedVariation = await prisma.productvariations.findFirst({
      where: {
        product_id: demoProduct.productId,
        width: 80,
        height: 100,
        has_fringe: true
      }
    });
    
    if (!fringedVariation) {
      console.log('❌ 80x100 saçaklı varyasyon bulunamadı!');
      return;
    }
    
    console.log(`📊 80x100 saçaklı varyasyon:`);
    console.log(`  - ID: ${fringedVariation.id}`);
    console.log(`  - Mevcut stok: ${fringedVariation.stock_quantity}`);
    
    // Test için 5 adet düşür
    const testQuantity = 5;
    const newStock = Math.max(0, fringedVariation.stock_quantity - testQuantity);
    
    await prisma.productvariations.update({
      where: { id: fringedVariation.id },
      data: { 
        stock_quantity: newStock,
        updated_at: new Date()
      }
    });
    
    console.log(`📦 Test stok düşürme:`);
    console.log(`  - Önceki stok: ${fringedVariation.stock_quantity}`);
    console.log(`  - Düşen miktar: ${testQuantity}`);
    console.log(`  - Yeni stok: ${newStock}`);
    console.log(`  - ✅ Stok düşürme başarılı!`);
    
    // Güncel stoku kontrol et
    const updatedVariation = await prisma.productvariations.findUnique({
      where: { id: fringedVariation.id }
    });
    
    console.log(`\n📊 Güncel stok kontrolü:`);
    console.log(`  - Güncel stok: ${updatedVariation?.stock_quantity}`);
    console.log(`  - Beklenen stok: ${newStock}`);
    console.log(`  - Doğruluk: ${updatedVariation?.stock_quantity === newStock ? '✅' : '❌'}`);
    
    console.log('\n✅ Test tamamlandı!');
    
  } catch (error: any) {
    console.error('❌ Test hatası:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testStockReductionAgain(); 