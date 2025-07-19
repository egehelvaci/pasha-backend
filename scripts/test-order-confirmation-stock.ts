import { PrismaClient } from '../generated/prisma';
import { QRCodeService } from '../src/services/qr-code-service';

const prisma = new PrismaClient();
const qrCodeService = new QRCodeService();

async function testOrderConfirmationStock() {
  try {
    console.log('🔍 Sipariş onaylama ve stok düşürme testi başlatılıyor...');
    
    // PENDING durumundaki siparişleri bul
    const pendingOrders = await prisma.order.findMany({
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
      },
      take: 1 // Sadece ilk siparişi test et
    });
    
    if (pendingOrders.length === 0) {
      console.log('❌ PENDING durumunda sipariş bulunamadı!');
      return;
    }
    
    const testOrder = pendingOrders[0];
    console.log(`📦 Test siparişi: ${testOrder.id}`);
    console.log(`👤 Kullanıcı: ${testOrder.user.name} ${testOrder.user.surname}`);
    console.log(`🏪 Mağaza: ${testOrder.user.Store?.kurum_adi || 'Mağaza yok'}`);
    console.log(`💰 Toplam tutar: ${testOrder.total_price} TL`);
    console.log(`📋 Sipariş öğeleri: ${testOrder.items.length} adet`);
    
    // Sipariş öğelerini ve mevcut stokları göster
    console.log('\n📋 Sipariş öğeleri ve mevcut stoklar:');
    for (const item of testOrder.items) {
      console.log(`\n🔍 Öğe: ${item.product.name}`);
      console.log(`   - Ürün ID: ${item.product_id}`);
      console.log(`   - Miktar: ${item.quantity}`);
      console.log(`   - Boyut: ${item.width}x${item.height}`);
      console.log(`   - Saçak: ${item.has_fringe}`);
      
      // Bu ürünün varyasyonlarını bul
      const variations = await prisma.productvariations.findMany({
        where: {
          product_id: item.product_id
        }
      });
      
      console.log(`   - Toplam varyasyon sayısı: ${variations.length}`);
      
      // Spesifik varyasyonu bul
      const specificVariation = variations.find(v => 
        v.width === Math.round(Number(item.width)) && 
        v.height === Math.round(Number(item.height)) &&
        v.has_fringe === (item.has_fringe || false)
      );
      
      if (specificVariation) {
        console.log(`   ✅ Spesifik varyasyon bulundu: ID ${specificVariation.id}`);
        console.log(`   📦 Mevcut stok: ${specificVariation.stock_quantity}`);
        console.log(`   📉 Düşecek stok: ${item.quantity}`);
        console.log(`   📦 Yeni stok: ${Math.max(0, specificVariation.stock_quantity - item.quantity)}`);
      } else {
        console.log(`   ❌ Spesifik varyasyon bulunamadı!`);
        
        // Alternatif varyasyonları göster
        const alternativeVariations = variations.filter(v => 
          v.width === Math.round(Number(item.width)) && 
          v.height === Math.round(Number(item.height))
        );
        
        if (alternativeVariations.length > 0) {
          console.log(`   🔄 Alternatif varyasyonlar:`);
          alternativeVariations.forEach(v => {
            console.log(`      - ID: ${v.id}, Saçak: ${v.has_fringe}, Stok: ${v.stock_quantity}`);
          });
        }
      }
    }
    
    // Stok düşürme işlemini test et
    console.log('\n🔄 Stok düşürme işlemi test ediliyor...');
    
    try {
      await qrCodeService.reduceStockForOrder(testOrder.id);
      console.log('✅ Stok düşürme işlemi başarılı!');
    } catch (error) {
      console.error('❌ Stok düşürme hatası:', error);
    }
    
    // Güncellenmiş stokları kontrol et
    console.log('\n📊 Güncellenmiş stoklar:');
    for (const item of testOrder.items) {
      const variations = await prisma.productvariations.findMany({
        where: {
          product_id: item.product_id
        }
      });
      
      const specificVariation = variations.find(v => 
        v.width === Math.round(Number(item.width)) && 
        v.height === Math.round(Number(item.height)) &&
        v.has_fringe === (item.has_fringe || false)
      );
      
      if (specificVariation) {
        console.log(`   ${item.product.name}: ${specificVariation.stock_quantity} adet`);
      }
    }
    
    // QR kod oluşturma işlemini test et
    console.log('\n🔄 QR kod oluşturma işlemi test ediliyor...');
    
    try {
      const qrResult = await qrCodeService.generateQRCodesForOrder(testOrder.id);
      console.log('✅ QR kod oluşturma işlemi başarılı!');
      console.log(`   📱 Oluşturulan QR kod sayısı: ${qrResult.totalQRCodes}`);
    } catch (error) {
      console.error('❌ QR kod oluşturma hatası:', error);
    }
    
    // Sipariş durumunu kontrol et
    const updatedOrder = await prisma.order.findUnique({
      where: { id: testOrder.id }
    });
    
    console.log(`\n📋 Güncellenmiş sipariş durumu: ${updatedOrder?.status}`);
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Testi çalıştır
testOrderConfirmationStock()
  .then(() => {
    console.log('\n🎉 Test tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test hatası:', error);
    process.exit(1);
  }); 