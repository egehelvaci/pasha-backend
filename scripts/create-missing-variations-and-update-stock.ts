import { PrismaClient } from '../generated/prisma';
import { ProductService } from '../src/product-service';

const prisma = new PrismaClient();
const productService = new ProductService();

async function createMissingVariationsAndUpdateStock() {
  try {
    console.log('🔍 Varyasyonu olmayan ürünler tespit ediliyor...');
    
    // Tüm ürünleri getir
    const allProducts = await prisma.product.findMany({
      include: {
        productvariations: true
      }
    });
    
    console.log(`📊 Toplam ürün sayısı: ${allProducts.length}`);
    
    // Varyasyonu olmayan ürünleri bul
    const productsWithoutVariations = allProducts.filter(product => 
      product.productvariations.length === 0
    );
    
    console.log(`📊 Varyasyonu olmayan ürün sayısı: ${productsWithoutVariations.length}`);
    
    if (productsWithoutVariations.length > 0) {
      console.log('\n🔧 Varyasyonu olmayan ürünler için varyasyon oluşturuluyor...');
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const product of productsWithoutVariations) {
        try {
          console.log(`📦 Ürün: ${product.name} (${product.productId})`);
          
          // ProductService'in regenerateVariationsForProduct metodunu kullan
          await productService.regenerateVariationsForProduct(product.productId);
          
          successCount++;
          console.log(`✅ ${product.name} için varyasyon oluşturuldu`);
        } catch (error) {
          errorCount++;
          console.error(`❌ ${product.name} için varyasyon oluşturma hatası:`, error);
        }
      }
      
      console.log(`\n📈 Varyasyon oluşturma sonucu:`);
      console.log(`✅ Başarılı: ${successCount}`);
      console.log(`❌ Hatalı: ${errorCount}`);
    } else {
      console.log('✅ Tüm ürünlerin zaten varyasyonu var!');
    }
    
    // Şimdi tüm varyasyonların stoğunu 1000 yap
    console.log('\n🔄 Tüm ürün varyasyonlarının stoğu 1000 olarak güncelleniyor...');
    
    const updateResult = await prisma.productvariations.updateMany({
      where: {}, // Tüm kayıtlar
      data: {
        stock_quantity: 1000,
        updated_at: new Date()
      }
    });
    
    console.log(`✅ Başarıyla ${updateResult.count} adet ürün varyasyonunun stoğu 1000 olarak güncellendi.`);
    
    // Güncelleme sonrası kontrol
    const totalVariations = await prisma.productvariations.count();
    const updatedVariations = await prisma.productvariations.count({
      where: {
        stock_quantity: 1000
      }
    });
    
    console.log(`\n📊 Final Durum:`);
    console.log(`📦 Toplam ürün sayısı: ${allProducts.length}`);
    console.log(`📊 Toplam varyasyon sayısı: ${totalVariations}`);
    console.log(`📊 1000 stoklu varyasyon sayısı: ${updatedVariations}`);
    
    if (totalVariations === updatedVariations) {
      console.log('✅ Tüm varyasyonlar başarıyla güncellendi!');
    } else {
      console.log('⚠️ Bazı varyasyonlar güncellenmemiş olabilir.');
    }
    
    // Ürün başına varyasyon sayısını göster
    console.log('\n📋 Ürün başına varyasyon dağılımı:');
    const productsWithVariations = await prisma.product.findMany({
      include: {
        productvariations: true,
        collection: true
      }
    });
    
    productsWithVariations.forEach(product => {
      console.log(`- ${product.name} (${product.collection.name}): ${product.productvariations.length} varyasyon`);
    });
    
  } catch (error) {
    console.error('❌ İşlem hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Scripti çalıştır
createMissingVariationsAndUpdateStock()
  .then(() => {
    console.log('\n🎉 Tüm işlemler başarıyla tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Hata oluştu:', error);
    process.exit(1);
  }); 