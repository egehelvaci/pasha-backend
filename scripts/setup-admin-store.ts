import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function setupAdminStore() {
  try {
    console.log('🔧 Admin store ayarları yapılıyor...');
    
    // Paşa Home store'unu admin store olarak ayarla
    const adminStore = await prisma.adminStoreConfig.upsert({
      where: {
        storeId: '4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5'
      },
      update: {
        isAdminStore: true,
        description: 'Ana yönetim mağazası - Ödemeler kasa bakiyesine eklenir'
      },
      create: {
        storeId: '4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5',
        isAdminStore: true,
        description: 'Ana yönetim mağazası - Ödemeler kasa bakiyesine eklenir'
      },
      include: {
        store: {
          select: {
            kurum_adi: true,
            bakiye: true
          }
        }
      }
    });
    
    console.log('✅ Admin store ayarlandı:');
    console.log(`- Store: ${adminStore.store.kurum_adi}`);
    console.log(`- Store ID: ${adminStore.storeId}`);
    console.log(`- Admin Store: ${adminStore.isAdminStore}`);
    console.log(`- Açıklama: ${adminStore.description}`);
    console.log(`- Mevcut Store Bakiyesi: ${adminStore.store.bakiye} TL`);
    
    // Kasa bakiyesini kontrol et
    const kasaBakiyesi = await prisma.adminVarliklari.findUnique({
      where: { id: 1 }
    });
    
    console.log(`- Mevcut Kasa Bakiyesi: ${kasaBakiyesi?.kasaBakiyesi || 0} TL`);
    
    console.log('\n📋 Admin Store Kuralları:');
    console.log('• Admin store ödemeleri store bakiyesini artırmaz');
    console.log('• Admin store ödemeleri kasa bakiyesini artırır');
    console.log('• Muhasebe kaydında "ADMIN_ÖDEME" olarak işaretlenir');
    
  } catch (error) {
    console.error('❌ Admin store ayarlama hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdminStore(); 