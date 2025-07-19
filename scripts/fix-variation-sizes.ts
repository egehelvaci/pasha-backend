import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function fixVariationSizes() {
  try {
    console.log('🔧 Yanlış boyutlu varyasyonlar düzeltiliyor...');
    
    // 10000 yüksekliğindeki varyasyonları bul
    const wrongVariations = await prisma.productvariations.findMany({
      where: {
        height: 10000
      },
      include: {
        Product: true
      }
    });
    
    console.log(`📊 ${wrongVariations.length} adet yanlış boyutlu varyasyon bulundu`);
    
    if (wrongVariations.length === 0) {
      console.log('✅ Yanlış boyutlu varyasyon bulunamadı!');
      return;
    }
    
    // Her yanlış varyasyon için düzeltme yap
    for (const variation of wrongVariations) {
      console.log(`\n🔍 Varyasyon: ${variation.Product?.name} (ID: ${variation.id})`);
      console.log(`   Eski boyut: ${variation.width}x${variation.height}`);
      
      // Yüksekliği 100 yap
      const newHeight = 100;
      
      // Aynı ürün için aynı boyutta başka varyasyon var mı kontrol et
      const existingVariation = await prisma.productvariations.findFirst({
        where: {
          product_id: variation.product_id,
          width: variation.width,
          height: newHeight,
          has_fringe: variation.has_fringe,
          id: { not: variation.id } // Kendisi hariç
        }
      });
      
      if (existingVariation) {
        console.log(`   ⚠️ Aynı boyutta başka varyasyon var (ID: ${existingVariation.id})`);
        console.log(`   🔄 Bu varyasyonu siliyorum...`);
        
        await prisma.productvariations.delete({
          where: { id: variation.id }
        });
      } else {
        console.log(`   ✅ Yükseklik ${newHeight} olarak güncelleniyor...`);
        
        await prisma.productvariations.update({
          where: { id: variation.id },
          data: {
            height: newHeight,
            updated_at: new Date()
          }
        });
        
        console.log(`   ✅ Yeni boyut: ${variation.width}x${newHeight}`);
      }
    }
    
    // Düzeltme sonrası kontrol
    console.log('\n📊 Düzeltme sonrası kontrol...');
    
    const remainingWrongVariations = await prisma.productvariations.findMany({
      where: {
        height: 10000
      }
    });
    
    if (remainingWrongVariations.length === 0) {
      console.log('✅ Tüm yanlış boyutlu varyasyonlar düzeltildi!');
    } else {
      console.log(`⚠️ Hala ${remainingWrongVariations.length} yanlış boyutlu varyasyon var`);
    }
    
    // Örnek düzeltilmiş varyasyonları göster
    const sampleVariations = await prisma.productvariations.findMany({
      where: {
        height: 100
      },
      include: {
        Product: true
      },
      take: 5
    });
    
    console.log('\n📋 Örnek düzeltilmiş varyasyonlar:');
    sampleVariations.forEach(variation => {
      console.log(`   ${variation.Product?.name}: ${variation.width}x${variation.height} (Stok: ${variation.stock_quantity})`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Scripti çalıştır
fixVariationSizes()
  .then(() => {
    console.log('\n🎉 Varyasyon düzeltme tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Hata:', error);
    process.exit(1);
  }); 