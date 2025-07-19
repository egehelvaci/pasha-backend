import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkAllOrders() {
  try {
    console.log('🔍 Tüm siparişler kontrol ediliyor...');
    
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
      if (!statusCounts[order.status]) {
        statusCounts[order.status] = 0;
        statusOrders[order.status] = [];
      }
      statusCounts[order.status]++;
      statusOrders[order.status].push(order);
    });
    
    console.log('\n📋 Sipariş durumları:');
    Object.keys(statusCounts).forEach(status => {
      console.log(`  - ${status}: ${statusCounts[status]} sipariş`);
    });
    
    // Her durum için detaylı bilgi
    Object.keys(statusOrders).forEach(status => {
      console.log(`\n📦 ${status} durumundaki siparişler:`);
      statusOrders[status].forEach(order => {
        console.log(`  - ID: ${order.id}`);
        console.log(`    Kullanıcı: ${order.user.name} ${order.user.surname}`);
        console.log(`    Mağaza: ${order.user.Store?.kurum_adi || 'Mağaza yok'}`);
        console.log(`    Tutar: ${order.total_price} TL`);
        console.log(`    Öğe sayısı: ${order.items.length}`);
        console.log(`    Tarih: ${order.created_at}`);
        
        // Öğeleri göster
        order.items.forEach((item: any, index: number) => {
          console.log(`      ${index + 1}. ${item.product.name} - ${item.quantity} adet`);
        });
        console.log('');
      });
    });
    
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllOrders(); 