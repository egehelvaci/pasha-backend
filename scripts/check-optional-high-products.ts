import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkOptionalHighProducts() {
  try {
    console.log('🔍 is_optional_high değeri true olan ürünler kontrol ediliyor...');
    
    // is_optional_high değeri true olan ürünleri bul
    const optionalHighProducts = await prisma.product.findMany({
      where: {
        is_optional_high: true
      },
      include: {
        productvariations: true
      }
    });
    
    console.log(`📊 is_optional_high=true olan ürün sayısı: ${optionalHighProducts.length}`);
    
    if (optionalHighProducts.length === 0) {
      console.log('❌ is_optional_high=true olan ürün bulunamadı!');
      return;
    }
    
    // Her ürün için detaylı bilgi
    optionalHighProducts.forEach((product, index) => {
      console.log(`\n📦 Ürün ${index + 1}: ${product.name}`);
      console.log(`  - ID: ${product.productId}`);
      console.log(`  - is_optional_high: ${product.is_optional_high}`);
      console.log(`  - Varyasyon sayısı: ${product.productvariations.length}`);
      
      // Varyasyonları listele
      if (product.productvariations.length > 0) {
        console.log(`  - Varyasyonlar:`);
        product.productvariations.forEach((v, vIndex) => {
          console.log(`    ${vIndex + 1}. ${v.width}x${v.height} - Saçak: ${v.has_fringe} - Stok: ${v.stock_quantity}`);
        });
      }
    });
    
    // Yüksek yükseklikli varyasyonları bul (10000)
    console.log('\n🔍 Yüksek yükseklikli varyasyonlar (10000):');
    const highVariations = await prisma.productvariations.findMany({
      where: {
        height: 10000
      },
      include: {
        Product: true
      }
    });
    
    console.log(`📊 10000 yüksekliğinde varyasyon sayısı: ${highVariations.length}`);
    
    highVariations.forEach((v, index) => {
      console.log(`  ${index + 1}. ${v.Product.name} - ${v.width}x${v.height} - Saçak: ${v.has_fringe} - Stok: ${v.stock_quantity}`);
    });
    
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOptionalHighProducts(); 