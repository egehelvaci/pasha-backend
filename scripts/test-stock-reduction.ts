import { PrismaClient } from '../generated/prisma';
import { QRCodeService } from '../src/services/qr-code-service';

const prisma = new PrismaClient();
const qrCodeService = new QRCodeService();

async function testStockReduction() {
  try {
    console.log('🔍 Stok düşürme işlemi test ediliyor...');
    
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
    
    console.log(`📦 Test siparişi: ${confirmedOrder.id}`);
    console.log(`📅 Tarih: ${confirmedOrder.created_at}`);
    
    // Stok düşürme öncesi durumu göster
    console.log('\n📊 Stok düşürme öncesi durum:');
    for (const item of confirmedOrder.items) {
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
    
    // Stok düşürme işlemini çalıştır
    console.log('\n🔄 Stok düşürme işlemi çalıştırılıyor...');
    
    try {
      await qrCodeService.reduceStockForOrder(confirmedOrder.id);
      console.log('✅ Stok düşürme işlemi başarılı!');
    } catch (error) {
      console.error('❌ Stok düşürme hatası:', error);
      return;
    }
    
    // Stok düşürme sonrası durumu göster
    console.log('\n📊 Stok düşürme sonrası durum:');
    for (const item of confirmedOrder.items) {
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
        console.log(`   📉 Düşen miktar: ${item.quantity} adet`);
      }
    }
    
    // Sipariş durumunu kontrol et
    const updatedOrder = await prisma.order.findUnique({
      where: { id: confirmedOrder.id }
    });
    
    console.log(`\n📋 Sipariş durumu: ${updatedOrder?.status}`);
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Testi çalıştır
testStockReduction()
  .then(() => {
    console.log('\n🎉 Test tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test hatası:', error);
    process.exit(1);
  }); 