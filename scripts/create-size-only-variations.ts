import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function createSizeOnlyVariations() {
  try {
    console.log('🏭 Tüm ürünler için SADECE BOYUT bazlı varyasyon oluşturma başlatılıyor...');
    
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
        console.log(`   ⚠️ Kural tanımlanmamış, varsayılan boyut (100x100) kullanılacak...`);
        
        // Kural yoksa varsayılan boyut için varyasyon oluştur
        const existingVariation = await prisma.productvariations.findFirst({
          where: { 
            product_id: product.productId,
            width: 100,
            height: 100
          }
        });
        
        if (existingVariation) {
          // Mevcut varyasyonu güncelle (cut_type_id null, has_fringe false yap)
          await prisma.productvariations.update({
            where: { id: existingVariation.id },
            data: { 
              cut_type_id: null,
              has_fringe: false,
              stock_quantity: existingVariation.stock_quantity || 1000,
              updated_at: new Date()
            }
          });
          console.log(`      ✅ Varsayılan varyasyon güncellendi: 100x100`);
          totalVariationsUpdated++;
        } else {
          // Yeni varsayılan varyasyon oluştur
          await prisma.productvariations.create({
            data: {
              product_id: product.productId,
              width: 100,
              height: 100,
              cut_type_id: null,
              has_fringe: false,
              stock_quantity: 1000,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          console.log(`      🆕 Varsayılan varyasyon oluşturuldu: 100x100`);
          totalVariationsCreated++;
        }
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
        
        const variationKey = `${sizeOption.width}x${sizeOption.height}`;
        
        // Bu boyutta varyasyon zaten var mı?
        const existingVariation = existingVariations.find(v => 
          v.width === sizeOption.width && 
          v.height === sizeOption.height
        );
        
        if (existingVariation) {
          // Mevcut varyasyonu güncelle (cut_type_id null, has_fringe false yap)
          await prisma.productvariations.update({
            where: { id: existingVariation.id },
            data: { 
              cut_type_id: null,
              has_fringe: false,
              stock_quantity: existingVariation.stock_quantity || 1000,
              updated_at: new Date()
            }
          });
          console.log(`      ✅ Varyasyon güncellendi: ${variationKey}`);
          totalVariationsUpdated++;
        } else {
          // Yeni varyasyon oluştur (SADECE BOYUT BAZLI)
          await prisma.productvariations.create({
            data: {
              product_id: product.productId,
              width: sizeOption.width,
              height: sizeOption.height,
              cut_type_id: null, // Kesim türü null
              has_fringe: false, // Saçak false
              stock_quantity: 1000,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          console.log(`      🆕 Yeni boyut bazlı varyasyon: ${variationKey}`);
          totalVariationsCreated++;
        }
      }
      
      // Artık gereksiz olan varyasyonları temizle (aynı boyutta birden fazla varyasyon varsa)
      for (const sizeOption of product.productrules.productsizeoptions) {
        const duplicateVariations = await prisma.productvariations.findMany({
          where: { 
            product_id: product.productId,
            width: sizeOption.width,
            height: sizeOption.height
          },
          orderBy: { updated_at: 'desc' }
        });
        
        // En son güncelleneni koru, diğerlerini sil
        if (duplicateVariations.length > 1) {
          const toDelete = duplicateVariations.slice(1); // İlkini atla
          for (const duplicate of toDelete) {
            await prisma.productvariations.delete({
              where: { id: duplicate.id }
            });
            console.log(`      🗑️ Duplicate varyasyon silindi: ${sizeOption.width}x${sizeOption.height}`);
          }
        }
      }
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('🎉 BOYUT BAZLI VARYASYON İŞLEMİ TAMAMLANDI!');
    console.log(`📊 Özet:`);
    console.log(`   🆕 Yeni oluşturulan varyasyon: ${totalVariationsCreated}`);
    console.log(`   ✅ Güncellenen mevcut varyasyon: ${totalVariationsUpdated}`);
    console.log(`   📦 Toplam işlenen varyasyon: ${totalVariationsCreated + totalVariationsUpdated}`);
    
    // Son kontrol - toplam varyasyon sayısı
    const totalVariations = await prisma.productvariations.count();
    console.log(`   🗂️ Sistemdeki toplam varyasyon sayısı: ${totalVariations}`);
    
    console.log('\n💡 NOT: Artık tüm varyasyonlar sadece boyut bazlı (cut_type_id=null, has_fringe=false)');
    
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
createSizeOnlyVariations(); 