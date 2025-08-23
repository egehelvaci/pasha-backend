import prisma from '../src/utils/prisma';
import { ProductService } from '../src/product-service';

async function updateStockForSampleProducts() {
  const productService = new ProductService();
  
  try {
    console.log('Örnek stok güncelleme işlemi başlatılıyor...\n');
    
    // İlk 10 ürünü al
    const products = await prisma.product.findMany({
      take: 10,
      include: {
        productrules: {
          include: {
            productsizeoptions: true
          }
        }
      }
    });
    
    console.log(`${products.length} ürün için stok güncellenecek.\n`);
    
    let optionalHeightCount = 0;
    let fixedHeightCount = 0;
    
    for (const product of products) {
      console.log(`Ürün: ${product.name}`);
      
      if (!product.productrules?.productsizeoptions?.length) {
        console.log('  ⚠️ Boyut seçenekleri yok\n');
        continue;
      }
      
      // İlk boyut seçeneğini al
      const firstSize = product.productrules.productsizeoptions[0];
      
      try {
        if (firstSize.is_optional_height) {
          // Opsiyonel yükseklik - 50m² ekle
          await productService.updateStockAreaM2(product.productId, {
            width: firstSize.width,
            height: firstSize.height,
            areaM2: 50
          });
          optionalHeightCount++;
          console.log(`  ✅ 50m² stok eklendi (${firstSize.width}x${firstSize.height}cm)\n`);
        } else {
          // Sabit yükseklik - 50 adet ekle
          await productService.updateStock(product.productId, {
            width: firstSize.width,
            height: firstSize.height,
            quantity: 50
          });
          fixedHeightCount++;
          console.log(`  ✅ 50 adet stok eklendi (${firstSize.width}x${firstSize.height}cm)\n`);
        }
      } catch (error: any) {
        console.error(`  ❌ Hata: ${error.message}\n`);
      }
    }
    
    console.log('='.repeat(50));
    console.log('ÖZET:');
    console.log(`Opsiyonel yükseklik (m²): ${optionalHeightCount} ürün`);
    console.log(`Sabit yükseklik (adet): ${fixedHeightCount} ürün`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStockForSampleProducts();