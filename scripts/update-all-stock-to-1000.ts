import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function updateAllStockTo1000() {
  try {
    console.log('Tüm ürün varyasyonlarının stoğu 1000 olarak güncelleniyor...');
    
    // Tüm productvariations kayıtlarını güncelle
    const result = await prisma.productvariations.updateMany({
      where: {}, // Tüm kayıtlar
      data: {
        stock_quantity: 1000,
        updated_at: new Date()
      }
    });
    
    console.log(`✅ Başarıyla ${result.count} adet ürün varyasyonunun stoğu 1000 olarak güncellendi.`);
    
    // Güncelleme sonrası kontrol
    const totalVariations = await prisma.productvariations.count();
    const updatedVariations = await prisma.productvariations.count({
      where: {
        stock_quantity: 1000
      }
    });
    
    console.log(`📊 Toplam varyasyon sayısı: ${totalVariations}`);
    console.log(`📊 1000 stoklu varyasyon sayısı: ${updatedVariations}`);
    
    if (totalVariations === updatedVariations) {
      console.log('✅ Tüm varyasyonlar başarıyla güncellendi!');
    } else {
      console.log('⚠️ Bazı varyasyonlar güncellenmemiş olabilir.');
    }
    
  } catch (error) {
    console.error('❌ Stok güncelleme hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Scripti çalıştır
updateAllStockTo1000()
  .then(() => {
    console.log('🎉 Stok güncelleme işlemi tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Hata oluştu:', error);
    process.exit(1);
  }); 