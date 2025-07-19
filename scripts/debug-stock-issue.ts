import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function debugStockIssue() {
  try {
    console.log('🔍 Stok düşürme sorunu detaylı inceleniyor...');
    
    // CONFIRMED siparişi bul
    const confirmedOrder = await prisma.order.findFirst({
      where: {
        status: 'CONFIRMED'
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!confirmedOrder) {
      console.log('❌ CONFIRMED sipariş bulunamadı!');
      return;
    }
    
    console.log(`📦 CONFIRMED Sipariş: ${confirmedOrder.id}`);
    console.log(`📅 Tarih: ${confirmedOrder.created_at}`);
    
    for (const item of confirmedOrder.items) {
      console.log(`\n🔍 Sipariş Öğesi: ${item.product.name}`);
      console.log(`   - Ürün ID: ${item.product_id}`);
      console.log(`   - Miktar: ${item.quantity}`);
      console.log(`   - Boyut: ${item.width}x${item.height}`);
      console.log(`   - Saçak: ${item.has_fringe}`);
      console.log(`   - Boyut tipi: ${typeof item.width} x ${typeof item.height}`);
      console.log(`   - Yuvarlanmış boyut: ${Math.round(Number(item.width))}x${Math.round(Number(item.height))}`);
      
      // Bu ürünün tüm varyasyonlarını getir
      const allVariations = await prisma.productvariations.findMany({
        where: {
          product_id: item.product_id
        }
      });
      
      console.log(`   - Toplam varyasyon sayısı: ${allVariations.length}`);
      
      if (allVariations.length > 0) {
        console.log(`   - Tüm varyasyonlar:`);
        allVariations.forEach((variation, index) => {
          console.log(`     ${index + 1}. ID: ${variation.id}`);
          console.log(`        Boyut: ${variation.width}x${variation.height}`);
          console.log(`        Saçak: ${variation.has_fringe}`);
          console.log(`        Stok: ${variation.stock_quantity}`);
          
          // Eşleşme kontrolü
          const widthMatch = variation.width === Math.round(Number(item.width));
          const heightMatch = variation.height === Math.round(Number(item.height));
          const fringeMatch = variation.has_fringe === (item.has_fringe || false);
          
          console.log(`        Eşleşme: Genişlik: ${widthMatch ? '✅' : '❌'}, Yükseklik: ${heightMatch ? '✅' : '❌'}, Saçak: ${fringeMatch ? '✅' : '❌'}`);
        });
      }
      
      // Spesifik eşleşme arama
      console.log(`\n   🔍 Spesifik eşleşme aranıyor...`);
      
      // 1. Tam eşleşme (boyut + saçak)
      const exactMatch = allVariations.find(v => 
        v.width === Math.round(Number(item.width)) && 
        v.height === Math.round(Number(item.height)) &&
        v.has_fringe === (item.has_fringe || false)
      );
      
      if (exactMatch) {
        console.log(`   ✅ Tam eşleşme bulundu: ID ${exactMatch.id}`);
        console.log(`      Stok: ${exactMatch.stock_quantity}`);
      } else {
        console.log(`   ❌ Tam eşleşme bulunamadı`);
        
        // 2. Boyut eşleşmesi (saçak farklı)
        const sizeMatch = allVariations.find(v => 
          v.width === Math.round(Number(item.width)) && 
          v.height === Math.round(Number(item.height))
        );
        
        if (sizeMatch) {
          console.log(`   🔄 Boyut eşleşmesi bulundu (saçak farklı): ID ${sizeMatch.id}`);
          console.log(`      Sipariş saçak: ${item.has_fringe}, Varyasyon saçak: ${sizeMatch.has_fringe}`);
          console.log(`      Stok: ${sizeMatch.stock_quantity}`);
        } else {
          console.log(`   ❌ Boyut eşleşmesi de bulunamadı`);
          
          // 3. En yakın boyut
          const closestVariation = allVariations.reduce((closest, current) => {
            const currentDiff = Math.abs(current.width - Math.round(Number(item.width))) + 
                               Math.abs(current.height - Math.round(Number(item.height)));
            const closestDiff = Math.abs(closest.width - Math.round(Number(item.width))) + 
                               Math.abs(closest.height - Math.round(Number(item.height)));
            return currentDiff < closestDiff ? current : closest;
          });
          
          console.log(`   📏 En yakın varyasyon: ID ${closestVariation.id}`);
          console.log(`      İstenen: ${Math.round(Number(item.width))}x${Math.round(Number(item.height))}`);
          console.log(`      Mevcut: ${closestVariation.width}x${closestVariation.height}`);
          console.log(`      Fark: ${Math.abs(closestVariation.width - Math.round(Number(item.width)))}x${Math.abs(closestVariation.height - Math.round(Number(item.height)))}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Scripti çalıştır
debugStockIssue()
  .then(() => {
    console.log('\n🎉 Debug tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Hata:', error);
    process.exit(1);
  }); 