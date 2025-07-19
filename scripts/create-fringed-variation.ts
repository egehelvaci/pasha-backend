import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function createFringedVariation() {
  try {
    console.log('🔧 DENEME ürünü için saçaklı varyasyon oluşturuluyor...');
    
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
    
    // 80x100 saçaklı varyasyon var mı kontrol et
    const existingFringedVariation = await prisma.productvariations.findFirst({
      where: {
        product_id: demoProduct.productId,
        width: 80,
        height: 100,
        has_fringe: true
      }
    });
    
    if (existingFringedVariation) {
      console.log('✅ 80x100 saçaklı varyasyon zaten mevcut!');
      console.log(`  - ID: ${existingFringedVariation.id}`);
      console.log(`  - Stok: ${existingFringedVariation.stock_quantity}`);
      return;
    }
    
    // Saçaklı varyasyon oluştur
    const newVariation = await prisma.productvariations.create({
      data: {
        product_id: demoProduct.productId,
        width: 80,
        height: 100,
        has_fringe: true,
        stock_quantity: 1000,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ 80x100 saçaklı varyasyon oluşturuldu!');
    console.log(`  - ID: ${newVariation.id}`);
    console.log(`  - Boyut: ${newVariation.width}x${newVariation.height}`);
    console.log(`  - Saçak: ${newVariation.has_fringe}`);
    console.log(`  - Stok: ${newVariation.stock_quantity}`);
    
    // Tüm varyasyonları listele
    console.log('\\n📊 DENEME ürününün tüm varyasyonları:');
    const allVariations = await prisma.productvariations.findMany({
      where: {
        product_id: demoProduct.productId
      },
      orderBy: {
        width: 'asc'
      }
    });
    
    allVariations.forEach((v, index) => {
      console.log(`  ${index + 1}. ${v.width}x${v.height} - Saçak: ${v.has_fringe} - Stok: ${v.stock_quantity}`);
    });
    
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createFringedVariation(); 