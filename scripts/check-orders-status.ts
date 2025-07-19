import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkOrdersStatus() {
  try {
    console.log('🔍 Mevcut siparişlerin durumları kontrol ediliyor...');
    
    // Tüm siparişleri durumlarına göre grupla
    const orders = await prisma.order.findMany({
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
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log(`📊 Toplam sipariş sayısı: ${orders.length}`);
    
    // Durumlara göre grupla
    const statusCounts: { [key: string]: number } = {};
    const statusOrders: { [key: string]: any[] } = {};
    
    orders.forEach(order => {
      const status = order.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      if (!statusOrders[status]) {
        statusOrders[status] = [];
      }
      statusOrders[status].push(order);
    });
    
    console.log('\n📋 Sipariş durumu dağılımı:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} sipariş`);
    });
    
    // Her durum için detaylı bilgi
    Object.entries(statusOrders).forEach(([status, statusOrderList]) => {
      console.log(`\n📦 ${status} DURUMUNDAKİ SİPARİŞLER:`);
      
      statusOrderList.slice(0, 5).forEach((order, index) => {
        console.log(`\n   ${index + 1}. Sipariş ID: ${order.id}`);
        console.log(`      👤 Kullanıcı: ${order.user.name} ${order.user.surname}`);
        console.log(`      🏪 Mağaza: ${order.user.Store?.kurum_adi || 'Mağaza yok'}`);
        console.log(`      💰 Tutar: ${order.total_price} TL`);
        console.log(`      📅 Tarih: ${order.created_at}`);
        console.log(`      📋 Öğe sayısı: ${order.items.length}`);
        
        // Sipariş öğelerini göster
        order.items.forEach((item: any, itemIndex: number) => {
          console.log(`         ${itemIndex + 1}. ${item.product.name} - ${item.quantity} adet (${item.width}x${item.height})`);
        });
      });
      
      if (statusOrderList.length > 5) {
        console.log(`      ... ve ${statusOrderList.length - 5} sipariş daha`);
      }
    });
    
    // CONFIRMED siparişlerin stok durumunu kontrol et
    const confirmedOrders = statusOrders['CONFIRMED'] || [];
    if (confirmedOrders.length > 0) {
      console.log('\n🔍 CONFIRMED SİPARİŞLERİN STOK DURUMU:');
      
      for (const order of confirmedOrders.slice(0, 3)) {
        console.log(`\n📦 Sipariş: ${order.id}`);
        
        for (const item of order.items) {
          // Bu ürünün varyasyonlarını bul
          const variations = await prisma.productvariations.findMany({
            where: {
              product_id: item.product_id
            }
          });
          
          // Spesifik varyasyonu bul
          const specificVariation = variations.find(v => 
            v.width === Math.round(Number(item.width)) && 
            v.height === Math.round(Number(item.height)) &&
            v.has_fringe === (item.has_fringe || false)
          );
          
          console.log(`   ${item.product.name}:`);
          console.log(`     - Sipariş miktarı: ${item.quantity}`);
          console.log(`     - Boyut: ${item.width}x${item.height}`);
          console.log(`     - Saçak: ${item.has_fringe}`);
          
          if (specificVariation) {
            console.log(`     - Mevcut stok: ${specificVariation.stock_quantity}`);
            console.log(`     - Stok düşmüş mü: ${specificVariation.stock_quantity < 1000 ? '✅ EVET' : '❌ HAYIR'}`);
          } else {
            console.log(`     - ❌ Uygun varyasyon bulunamadı!`);
          }
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
checkOrdersStatus()
  .then(() => {
    console.log('\n🎉 Kontrol tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Hata:', error);
    process.exit(1);
  }); 