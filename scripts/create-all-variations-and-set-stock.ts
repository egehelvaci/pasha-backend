import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function createAllVariationsAndSetStock() {
  try {
    console.log('🏭 Tüm ürünler için varyasyon oluşturma ve stok güncelleme başlatılıyor...');
    
    // Tüm ürünleri kural bilgileriyle birlikte getir
    const products = await prisma.product.findMany({
      include: {
        productrules: {
          include: {
            productsizeoptions: true
          }
        }
      }
    });
    
    console.log(`📦 Toplam ${products.length} ürün bulundu`);
    
    let totalVariationsCreated = 0;
    let totalVariationsUpdated = 0;
    
    for (const product of products) {
      console.log(`\n🔧 İşleniyor: ${product.name} (ID: ${product.productId})`);
      
      if (!product.rule_id || !product.productrules) {
        console.log(`   ⚠️ Kural tanımlanmamış, atlanıyor...`);
        continue;
      }
      
      console.log(`   📋 Kural: ${product.productrules.name}`);
      console.log(`   📏 ${product.productrules.productsizeoptions.length} boyut seçeneği mevcut`);
      
      // Bu ürünün mevcut varyasyonlarını getir
      const existingVariations = await prisma.productvariations.findMany({
        where: { product_id: product.productId }
      });
      
      console.log(`   📊 Mevcut varyasyon sayısı: ${existingVariations.length}`);
      
      // Her boyut seçeneği için varyasyonlar oluştur
      for (const sizeOption of product.productrules.productsizeoptions) {
        console.log(`\n   📐 Boyut seçeneği: ${sizeOption.width}x${sizeOption.height}`);
        console.log(`      Opsiyonel yükseklik: ${sizeOption.is_optional_height ? 'Evet' : 'Hayır'}`);
        
        // Saçaklı ve saçaksız varyasyonlar oluştur
        const fringeOptions = [true, false];
        
        for (const hasFringe of fringeOptions) {
          const variationKey = `${sizeOption.width}x${sizeOption.height}_${hasFringe}`;
          
          // Bu varyasyon zaten var mı?
          const existingVariation = existingVariations.find(v => 
            v.width === sizeOption.width && 
            v.height === sizeOption.height && 
            v.has_fringe === hasFringe
          );
          
          if (existingVariation) {
            // Mevcut varyasyonun stokunu 1000 yap
            if (existingVariation.stock_quantity !== 1000) {
              await prisma.productvariations.update({
                where: { id: existingVariation.id },
                data: { 
                  stock_quantity: 1000,
                  updated_at: new Date()
                }
              });
              console.log(`      ✅ Stok güncellendi: ${variationKey} → 1000`);
              totalVariationsUpdated++;
            } else {
              console.log(`      ✅ Zaten 1000: ${variationKey}`);
            }
          } else {
            // Yeni varyasyon oluştur
            await prisma.productvariations.create({
              data: {
                product_id: product.productId,
                width: sizeOption.width,
                height: sizeOption.height,
                has_fringe: hasFringe,
                stock_quantity: 1000,
                created_at: new Date(),
                updated_at: new Date()
              }
            });
            console.log(`      🆕 Yeni varyasyon: ${variationKey} → 1000`);
            totalVariationsCreated++;
          }
        }
      }
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('🎉 İşlem tamamlandı!');
    console.log(`📊 Özet:`);
    console.log(`   🆕 Yeni oluşturulan varyasyon: ${totalVariationsCreated}`);
    console.log(`   ✅ Güncellenen mevcut varyasyon: ${totalVariationsUpdated}`);
    console.log(`   📦 Toplam işlenen varyasyon: ${totalVariationsCreated + totalVariationsUpdated}`);
    
    // Son kontrol - toplam varyasyon sayısı
    const totalVariations = await prisma.productvariations.count();
    console.log(`   🗂️ Sistemdeki toplam varyasyon sayısı: ${totalVariations}`);
    
    // Stok 1000 olan varyasyon sayısı
    const stock1000Count = await prisma.productvariations.count({
      where: { stock_quantity: 1000 }
    });
    console.log(`   📈 Stoku 1000 olan varyasyon sayısı: ${stock1000Count}`);
    
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

createAllVariationsAndSetStock(); 