import { PrismaClient } from '../generated/prisma';
import { QRCodeService } from '../src/services/qr-code-service';

const prisma = new PrismaClient();
const qrCodeService = new QRCodeService();

async function testPendingOrderConfirmation() {
  try {
    console.log('🔍 PENDING sipariş onaylama testi başlatılıyor...');
    
    // PENDING durumundaki siparişi bul
    const pendingOrder = await prisma.order.findFirst({
      where: {
        status: 'PENDING'
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          include: {
            Store: true
          }
        }
      }
    });
    
    if (!pendingOrder) {
      console.log('❌ PENDING durumunda sipariş bulunamadı!');
      return;
    }
    
    console.log(`📦 Test siparişi: ${pendingOrder.id}`);
    console.log(`👤 Kullanıcı: ${pendingOrder.user.name} ${pendingOrder.user.surname}`);
    console.log(`🏪 Mağaza: ${pendingOrder.user.Store?.kurum_adi || 'Mağaza yok'}`);
    console.log(`💰 Toplam tutar: ${pendingOrder.total_price} TL`);
    console.log(`📋 Sipariş öğeleri: ${pendingOrder.items.length} adet`);
    
    // Sipariş öğelerini ve mevcut stokları göster
    console.log('\n📋 Sipariş öğeleri ve mevcut stoklar:');
    for (const item of pendingOrder.items) {
      console.log(`\n🔍 Öğe: ${item.product.name}`);
      console.log(`  - Boyut: ${item.width}x${item.height}`);
      console.log(`  - Saçak: ${item.has_fringe ? 'Evet' : 'Hayır'}`);
      console.log(`  - Adet: ${item.quantity}`);
      
      // Bu ürünün varyasyonlarını bul
      const variations = await prisma.productvariations.findMany({
        where: {
          product_id: item.product_id
        }
      });
      
      console.log(`  - Toplam varyasyon: ${variations.length}`);
      
      // Uygun varyasyonu bul
      const matchingVariations = variations.filter(v => 
        v.width === (item.width ? Math.round(Number(item.width)) : undefined) &&
        v.height === (item.height ? Math.round(Number(item.height)) : undefined) &&
        v.has_fringe === (item.has_fringe || false)
      );
      
      if (matchingVariations.length > 0) {
        const variation = matchingVariations[0];
        console.log(`  - Uygun varyasyon: ${variation.id}`);
        console.log(`  - Mevcut stok: ${variation.stock_quantity}`);
        console.log(`  - Düşecek miktar: ${item.quantity}`);
        console.log(`  - Beklenen yeni stok: ${variation.stock_quantity - item.quantity}`);
      } else {
        console.log(`  - ⚠️ Uygun varyasyon bulunamadı!`);
        
        // Tüm varyasyonları göster
        console.log(`  - Mevcut varyasyonlar:`);
        variations.forEach((v, index) => {
          console.log(`    ${index + 1}. ${v.width}x${v.height} - Saçak: ${v.has_fringe} - Stok: ${v.stock_quantity}`);
        });
      }
    }
    
    console.log('\n🚀 Sipariş onaylama işlemi başlatılıyor...');
    
    // 1. QR kod oluştur
    console.log('\n📱 QR kod oluşturuluyor...');
    const qrResult = await qrCodeService.generateQRCodesForOrder(pendingOrder.id);
    console.log(`✅ QR kod oluşturuldu: ${qrResult.totalQRCodes} adet`);
    
    // 2. Stok düşür
    console.log('\n📦 Stok düşürme işlemi başlatılıyor...');
    await qrCodeService.reduceStockForOrder(pendingOrder.id);
    console.log('✅ Stok düşürme işlemi tamamlandı');
    
    // 3. Sonuçları kontrol et
    console.log('\n📊 Sonuç kontrolü:');
    const updatedOrder = await prisma.order.findUnique({
      where: { id: pendingOrder.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    console.log(`📦 Sipariş durumu: ${updatedOrder?.status}`);
    
    // Stokları tekrar kontrol et
    for (const item of updatedOrder!.items) {
      const variations = await prisma.productvariations.findMany({
        where: {
          product_id: item.product_id
        }
      });
      
      const matchingVariations = variations.filter(v => 
        v.width === (item.width ? Math.round(Number(item.width)) : undefined) &&
        v.height === (item.height ? Math.round(Number(item.height)) : undefined) &&
        v.has_fringe === (item.has_fringe || false)
      );
      
      if (matchingVariations.length > 0) {
        const variation = matchingVariations[0];
        console.log(`\n📦 ${item.product.name}:`);
        console.log(`  - Güncel stok: ${variation.stock_quantity}`);
        console.log(`  - Düşen miktar: ${item.quantity}`);
        console.log(`  - Stok düşürme başarılı: ${variation.stock_quantity === (1000 - item.quantity) ? '✅' : '❌'}`);
      } else {
        console.log(`\n❌ ${item.product.name}: Uygun varyasyon bulunamadı!`);
      }
    }
    
    console.log('\n✅ Test tamamlandı!');
    
  } catch (error: any) {
    console.error('❌ Test hatası:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPendingOrderConfirmation(); 