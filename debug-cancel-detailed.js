const { PrismaClient } = require('./generated/prisma/default.js');
const prisma = new PrismaClient();

async function debugCancelDetailed() {
  try {
    console.log('=== DETAYLI İPTAL ANALİZİ ===');
    
    // Son iptal edilen siparişi bul
    const canceledOrder = await prisma.order.findFirst({
      where: {
        user_id: '9ad0b9a6-450a-4988-8945-3e38017aa146', // egehelvaci user ID
        status: 'CANCELED'
      },
      orderBy: { updated_at: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                productvariations: true,
                productrules: {
                  include: {
                    productsizeoptions: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!canceledOrder) {
      console.log('❌ İptal edilen sipariş bulunamadı');
      return;
    }
    
    console.log(`\nSon İptal Edilen Sipariş: ${canceledOrder.id}`);
    console.log(`Updated At: ${canceledOrder.updated_at}`);
    
    for (const item of canceledOrder.items) {
      console.log(`\n--- ITEM ANALİZİ ---`);
      console.log(`Ürün: ${item.product.name}`);
      console.log(`Sipariş Ebatı: ${item.width}x${item.height}`);
      console.log(`Miktar: ${item.quantity}`);
      console.log(`Cut Type: ${item.cut_type}`);
      console.log(`Has Fringe: ${item.has_fringe}`);
      console.log(`Product Rule ID: ${item.product.rule_id}`);
      
      // Hesaplanan değerler
      const itemWidth = item.width ? Math.round(Number(item.width)) : 0;
      const itemHeight = item.height ? Math.round(Number(item.height)) : 0;
      const itemHasFringe = item.has_fringe || false;
      
      console.log(`\nHesaplanan Değerler:`);
      console.log(`- itemWidth: ${itemWidth}`);
      console.log(`- itemHeight: ${itemHeight}`);
      console.log(`- itemHasFringe: ${itemHasFringe}`);
      
      // Ürün kurallarını kontrol et
      let targetWidth = itemWidth;
      let targetHeight = itemHeight;
      
      if (item.product.rule_id && item.product.productrules) {
        const sizeOptions = item.product.productrules.productsizeoptions;
        console.log(`\nÜrün Kuralları (${sizeOptions.length} adet):`);
        
        sizeOptions.forEach(opt => {
          console.log(`- Width: ${opt.width}, Height: ${opt.height}, Optional: ${opt.is_optional_height}`);
        });
        
        const widthOption = sizeOptions.find(opt => opt.width === itemWidth);
        
        if (widthOption && widthOption.is_optional_height) {
          targetHeight = widthOption.height;
          console.log(`\n✅ Opsiyonel yükseklik kuralı bulundu:`);
          console.log(`${itemWidth}x${itemHeight} → ${targetWidth}x${targetHeight}`);
        } else {
          console.log(`\n❌ Opsiyonel yükseklik kuralı bulunamadı`);
        }
      }
      
      // Varyasyon arama
      console.log(`\nVaryasyon Arama Kriterleri:`);
      console.log(`- width: ${targetWidth}`);
      console.log(`- height: ${targetHeight}`);
      console.log(`- has_fringe: ${itemHasFringe}`);
      console.log(`- cut_type_id: ${item.cut_type ? parseInt(item.cut_type) : null}`);
      
      const matchingVariations = item.product.productvariations.filter(v => 
        v.width === targetWidth && 
        v.height === targetHeight &&
        v.has_fringe === itemHasFringe &&
        v.cut_type_id === (item.cut_type ? parseInt(item.cut_type) : null)
      );
      
      console.log(`\nEşleşen Varyasyon Sayısı: ${matchingVariations.length}`);
      
      if (matchingVariations.length > 0) {
        const variation = matchingVariations[0];
        console.log(`✅ Varyasyon Bulundu:`);
        console.log(`- ID: ${variation.id}`);
        console.log(`- ${variation.width}x${variation.height}`);
        console.log(`- Stock Area M²: ${variation.stock_area_m2}`);
        console.log(`- Stock Quantity: ${variation.stock_quantity}`);
        
        // Alan hesaplama
        const areaM2 = (Number(item.width) * Number(item.height)) / 10000;
        const totalAreaM2 = areaM2 * item.quantity;
        console.log(`\nAlan Hesaplama:`);
        console.log(`- (${item.width} * ${item.height}) / 10000 = ${areaM2} m²`);
        console.log(`- ${areaM2} * ${item.quantity} = ${totalAreaM2} m²`);
        console.log(`- Beklenen yeni stok: ${Number(variation.stock_area_m2) + totalAreaM2} m²`);
        
      } else {
        console.log(`❌ Hiç varyasyon bulunamadı`);
        console.log(`\nTüm mevcut varyasyonlar:`);
        item.product.productvariations.slice(0, 5).forEach(v => {
          console.log(`- ${v.width}x${v.height} (fringe: ${v.has_fringe}, cut_type: ${v.cut_type_id})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugCancelDetailed();
