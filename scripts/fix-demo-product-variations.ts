import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function fixDemoProductVariations() {
  try {
    console.log('🔧 DENEME ürününün varyasyonları düzeltiliyor...');
    
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
    
    console.log(`📦 DENEME ürünü bulundu: ${demoProduct.productId}`);
    
    // Mevcut varyasyonları bul
    const variations = await prisma.productvariations.findMany({
      where: {
        product_id: demoProduct.productId
      }
    });
    
    console.log(`📊 Mevcut varyasyon sayısı: ${variations.length}`);
    
    // Yanlış boyutlu varyasyonları düzelt
    for (const variation of variations) {
      console.log(`\n🔍 Varyasyon: ${variation.id}`);
      console.log(`  - Önceki boyut: ${variation.width}x${variation.height}`);
      console.log(`  - Saçak: ${variation.has_fringe}`);
      console.log(`  - Stok: ${variation.stock_quantity}`);
      
      // 10000 yüksekliğini 100 yap
      if (variation.height === 10000) {
        await prisma.productvariations.update({
          where: { id: variation.id },
          data: {
            height: 100,
            updated_at: new Date()
          }
        });
        
        console.log(`  - ✅ Düzeltildi: ${variation.width}x100`);
      } else {
        console.log(`  - ✅ Zaten doğru boyut`);
      }
    }
    
    // Düzeltme sonrası kontrol
    console.log('\n📊 Düzeltme sonrası kontrol:');
    const fixedVariations = await prisma.productvariations.findMany({
      where: {
        product_id: demoProduct.productId
      }
    });
    
    fixedVariations.forEach((v, index) => {
      console.log(`  ${index + 1}. ${v.width}x${v.height} - Saçak: ${v.has_fringe} - Stok: ${v.stock_quantity}`);
    });
    
    console.log('\n✅ DENEME ürünü varyasyonları düzeltildi!');
    
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixDemoProductVariations(); 