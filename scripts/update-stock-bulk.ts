import prisma from '../src/utils/prisma';
import { ProductService } from '../src/product-service';

async function updateStockForAllProducts() {
  const productService = new ProductService();
  
  try {
    console.log('Stok güncelleme işlemi başlatılıyor...\n');
    
    // Tüm ürünleri ve kural bilgilerini al
    const products = await prisma.product.findMany({
      include: {
        productrules: {
          include: {
            productsizeoptions: true
          }
        },
        productvariations: true
      }
    });
    
    console.log(`Toplam ${products.length} ürün bulundu.\n`);
    
    let optionalHeightCount = 0;
    let fixedHeightCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      console.log(`\nÜrün: ${product.name} (${product.productId})`);
      
      if (!product.productrules || !product.productrules.productsizeoptions || product.productrules.productsizeoptions.length === 0) {
        console.log('  ⚠️ Bu ürün için boyut seçenekleri tanımlı değil, atlanıyor...');
        continue;
      }
      
      // Her bir boyut seçeneği için stok ekle
      for (const sizeOption of product.productrules.productsizeoptions) {
        try {
          if (sizeOption.is_optional_height) {
            // Opsiyonel yükseklik olan halılara 50m² stok ekle
            console.log(`  📦 Opsiyonel yükseklik (${sizeOption.width}x${sizeOption.height}cm) - 50m² stok ekleniyor...`);
            
            await productService.updateStockAreaM2(product.productId, {
              width: sizeOption.width,
              height: sizeOption.height,
              areaM2: 50
            });
            
            optionalHeightCount++;
            successCount++;
            console.log(`  ✅ Başarıyla 50m² stok eklendi`);
          } else {
            // Opsiyonel yükseklik olmayan halılara 50 adet stok ekle
            console.log(`  📦 Sabit yükseklik (${sizeOption.width}x${sizeOption.height}cm) - 50 adet stok ekleniyor...`);
            
            await productService.updateStock(product.productId, {
              width: sizeOption.width,
              height: sizeOption.height,
              quantity: 50
            });
            
            fixedHeightCount++;
            successCount++;
            console.log(`  ✅ Başarıyla 50 adet stok eklendi`);
          }
        } catch (error: any) {
          errorCount++;
          console.error(`  ❌ Hata: ${error.message}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('STOK GÜNCELLEME ÖZET RAPORU');
    console.log('='.repeat(60));
    console.log(`✅ Başarılı güncelleme: ${successCount}`);
    console.log(`  - Opsiyonel yükseklik (m² bazlı): ${optionalHeightCount}`);
    console.log(`  - Sabit yükseklik (adet bazlı): ${fixedHeightCount}`);
    console.log(`❌ Hatalı güncelleme: ${errorCount}`);
    console.log('='.repeat(60));
    
    // Güncellenen stokları kontrol et
    console.log('\nGüncellenmiş stok durumu kontrol ediliyor...\n');
    
    const updatedProducts = await prisma.productvariations.groupBy({
      by: ['product_id'],
      _sum: {
        stock_quantity: true,
        stock_area_m2: true
      }
    });
    
    console.log('GÜNCEL STOK DURUMU:');
    console.log('-'.repeat(40));
    
    for (const productStock of updatedProducts) {
      if (!productStock.product_id) continue;
      
      const product = await prisma.product.findUnique({
        where: { productId: productStock.product_id }
      });
      
      if (product && product.name) {
        const totalQuantity = productStock._sum.stock_quantity || 0;
        const totalAreaM2 = Number(productStock._sum.stock_area_m2 || 0);
        
        console.log(`${product.name}:`);
        if (totalQuantity > 0) {
          console.log(`  Toplam adet: ${totalQuantity}`);
        }
        if (totalAreaM2 > 0) {
          console.log(`  Toplam m²: ${totalAreaM2.toFixed(2)}`);
        }
      }
    }
    
    console.log('\n✨ Stok güncelleme işlemi tamamlandı!');
    
  } catch (error) {
    console.error('Kritik hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
updateStockForAllProducts();