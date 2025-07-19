import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkPendingOrders() {
  try {
    console.log('🔍 PENDING durumundaki siparişler kontrol ediliyor...');
    
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
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log(`📊 PENDING durumunda sipariş sayısı: ${pendingOrders.length}`);
    
    if (pendingOrders.length === 0) {
      console.log('❌ PENDING durumunda sipariş bulunamadı!');
      
      // Tüm sipariş durumlarını kontrol et
      console.log('\n🔍 Tüm sipariş durumları kontrol ediliyor...');
      const allOrders = await prisma.order.findMany({
        select: {
          id: true,
          status: true,
          created_at: true,
          total_price: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      
      const statusCounts: { [key: string]: number } = {};
      allOrders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      
      console.log('📋 Mevcut sipariş durumları:');
      Object.keys(statusCounts).forEach(status => {
        console.log(`  - ${status}: ${statusCounts[status]} sipariş`);
      });
      
      // En son oluşturulan siparişleri göster
      console.log('\n📦 En son oluşturulan 5 sipariş:');
      allOrders.slice(0, 5).forEach(order => {
        console.log(`  - ID: ${order.id}`);
        console.log(`    Durum: ${order.status}`);
        console.log(`    Tutar: ${order.total_price} TL`);
        console.log(`    Tarih: ${order.created_at}`);
        console.log('');
      });
      
      return;
    }
    
    // PENDING siparişleri detaylı göster
    pendingOrders.forEach((order, index) => {
      console.log(`\n📦 PENDING Sipariş ${index + 1}:`);
      console.log(`  - ID: ${order.id}`);
      console.log(`  - Kullanıcı: ${order.user.name} ${order.user.surname}`);
      console.log(`  - Mağaza: ${order.user.Store?.kurum_adi || 'Mağaza yok'}`);
      console.log(`  - Tutar: ${order.total_price} TL`);
      console.log(`  - Öğe sayısı: ${order.items.length}`);
      console.log(`  - Tarih: ${order.created_at}`);
      
      // Öğeleri göster
      order.items.forEach((item: any, itemIndex: number) => {
        console.log(`    ${itemIndex + 1}. ${item.product.name}`);
        console.log(`       - Boyut: ${item.width}x${item.height}`);
        console.log(`       - Saçak: ${item.has_fringe ? 'Evet' : 'Hayır'}`);
        console.log(`       - Adet: ${item.quantity}`);
        console.log(`       - Birim fiyat: ${item.unit_price} TL`);
        console.log(`       - Toplam fiyat: ${item.total_price} TL`);
      });
    });
    
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPendingOrders(); 