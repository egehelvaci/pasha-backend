import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function updateExistingStoresType() {
  try {
    console.log('🔄 Mevcut mağazaların store_type alanları güncelleniyor...');

    // Mevcut tüm mağazaları varsayılan KARGO türü ile güncelle
    const result = await prisma.store.updateMany({
      where: {
        store_type: null // store_type null olan mağazaları bul
      },
      data: {
        store_type: 'KARGO' // Varsayılan olarak KARGO yap
      }
    });

    console.log(`✅ ${result.count} mağaza başarıyla güncellendi`);

    // Güncellenen mağazaları listele
    const updatedStores = await prisma.store.findMany({
      select: {
        store_id: true,
        kurum_adi: true,
        store_type: true
      }
    });

    console.log('\n📋 Güncellenmiş mağazalar:');
    updatedStores.forEach(store => {
      console.log(`- ${store.kurum_adi}: ${store.store_type}`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingStoresType();
