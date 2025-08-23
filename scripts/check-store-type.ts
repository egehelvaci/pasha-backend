import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkStoreType() {
  try {
    console.log('🔍 Veritabanından mağaza bilgileri kontrol ediliyor...');

    // İlk mağazayı al
    const store = await prisma.store.findFirst({
      select: {
        store_id: true,
        kurum_adi: true,
        store_type: true
      }
    });

    if (store) {
      console.log('🏪 Mağaza bulundu:');
      console.log('- Store ID:', store.store_id);
      console.log('- Kurum Adı:', store.kurum_adi);
      console.log('- Store Type:', store.store_type);
      
      if (store.store_type) {
        console.log('✅ store_type alanı mevcut ve dolu');
      } else {
        console.log('❌ store_type alanı boş veya null');
      }
    } else {
      console.log('❌ Hiç mağaza bulunamadı');
    }

    // Tüm mağazaların store_type durumunu kontrol et
    const allStores = await prisma.store.findMany({
      select: {
        kurum_adi: true,
        store_type: true
      }
    });

    console.log('\n📋 Tüm mağazaların store_type durumu:');
    allStores.forEach((store, index) => {
      console.log(`${index + 1}. ${store.kurum_adi}: ${store.store_type || 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStoreType();
