import prisma from '../src/utils/prisma';

async function updateAllStock() {
  try {
    console.log('Toplu stok güncelleme işlemi başlatılıyor...\n');
    
    // Tüm ürün kurallarını ve boyut seçeneklerini al
    const sizeOptions = await prisma.productsizeoptions.findMany({
      include: {
        productrules: {
          include: {
            Product: true
          }
        }
      }
    });
    
    console.log(`Toplam ${sizeOptions.length} boyut seçeneği bulundu.\n`);
    
    let optionalHeightUpdates = 0;
    let fixedHeightUpdates = 0;
    let processedProducts = new Set<string>();
    
    // Her boyut seçeneği için stok güncelle
    for (const sizeOption of sizeOptions) {
      const products = sizeOption.productrules?.Product || [];
      
      for (const product of products) {
        const key = `${product.productId}-${sizeOption.width}-${sizeOption.height}`;
        
        // Aynı ürün-boyut kombinasyonunu tekrar işleme
        if (processedProducts.has(key)) continue;
        processedProducts.add(key);
        
        try {
          // Varyasyon var mı kontrol et, yoksa oluştur
          let variation = await prisma.productvariations.findFirst({
            where: {
              product_id: product.productId,
              width: sizeOption.width,
              height: sizeOption.height
            }
          });
          
          if (sizeOption.is_optional_height) {
            // Opsiyonel yükseklik - 50m² stok ekle
            if (variation) {
              await prisma.productvariations.update({
                where: { id: variation.id },
                data: {
                  stock_area_m2: 50,
                  stock_quantity: 0 // Opsiyonel yükseklikte adet 0
                }
              });
            } else {
              await prisma.productvariations.create({
                data: {
                  product_id: product.productId,
                  width: sizeOption.width,
                  height: sizeOption.height,
                  stock_area_m2: 50,
                  stock_quantity: 0,
                  has_fringe: false
                }
              });
            }
            optionalHeightUpdates++;
            console.log(`✅ ${product.name} - ${sizeOption.width}x${sizeOption.height}cm: 50m² stok eklendi`);
          } else {
            // Sabit yükseklik - 50 adet stok ekle
            if (variation) {
              await prisma.productvariations.update({
                where: { id: variation.id },
                data: {
                  stock_quantity: 50,
                  stock_area_m2: 0 // Sabit yükseklikte m² 0
                }
              });
            } else {
              await prisma.productvariations.create({
                data: {
                  product_id: product.productId,
                  width: sizeOption.width,
                  height: sizeOption.height,
                  stock_quantity: 50,
                  stock_area_m2: 0,
                  has_fringe: false
                }
              });
            }
            fixedHeightUpdates++;
            console.log(`✅ ${product.name} - ${sizeOption.width}x${sizeOption.height}cm: 50 adet stok eklendi`);
          }
        } catch (error: any) {
          console.error(`❌ Hata (${product.name}): ${error.message}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('TOPLU STOK GÜNCELLEME TAMAMLANDI');
    console.log('='.repeat(60));
    console.log(`✅ Opsiyonel yükseklik (m² bazlı): ${optionalHeightUpdates} güncelleme`);
    console.log(`✅ Sabit yükseklik (adet bazlı): ${fixedHeightUpdates} güncelleme`);
    console.log(`📦 Toplam güncelleme: ${optionalHeightUpdates + fixedHeightUpdates}`);
    console.log('='.repeat(60));
    
    // Özet rapor
    const summary = await prisma.productvariations.aggregate({
      _sum: {
        stock_quantity: true,
        stock_area_m2: true
      },
      _count: {
        id: true
      }
    });
    
    console.log('\nGEÇERLİ STOK DURUMU:');
    console.log(`Toplam varyasyon sayısı: ${summary._count.id}`);
    console.log(`Toplam adet stoku: ${summary._sum.stock_quantity || 0}`);
    console.log(`Toplam m² stoku: ${Number(summary._sum.stock_area_m2 || 0).toFixed(2)}m²`);
    
  } catch (error) {
    console.error('Kritik hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
updateAllStock();