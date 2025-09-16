import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export async function createDefaultPurchasePriceList() {
  try {
    console.log('Varsayılan alış fiyat listesi oluşturuluyor...');
    
    // Mevcut tüm koleksiyonları al
    const collections = await prisma.collection.findMany({
      where: { isActive: true }
    });

    if (collections.length === 0) {
      console.log('Aktif koleksiyon bulunamadı.');
      return;
    }

    // Varsayılan alış fiyat listesini kontrol et
    let purchasePriceList = await prisma.purchasePriceList.findFirst({
      where: { name: 'Varsayılan Alış Fiyat Listesi' }
    });

    // Eğer yoksa oluştur
    if (!purchasePriceList) {
      purchasePriceList = await prisma.purchasePriceList.create({
        data: {
          name: 'Varsayılan Alış Fiyat Listesi',
          description: 'Tüm koleksiyonlar için varsayılan USD alış fiyat listesi',
          currency: 'USD',
          is_active: true
        }
      });
      console.log('Varsayılan alış fiyat listesi oluşturuldu:', purchasePriceList.name);
    } else {
      console.log('Varsayılan alış fiyat listesi zaten mevcut:', purchasePriceList.name);
    }

    // Her koleksiyon için alış fiyat detayı oluştur
    for (const collection of collections) {
      // Bu koleksiyon için zaten bir detay var mı kontrol et
      const existingDetail = await prisma.purchasePriceListDetail.findFirst({
        where: {
          purchase_price_list_id: purchasePriceList.id,
          collection_id: collection.collectionId
        }
      });

      if (!existingDetail) {
        await prisma.purchasePriceListDetail.create({
          data: {
            purchase_price_list_id: purchasePriceList.id,
            collection_id: collection.collectionId,
            price_per_square_meter: 0.00 // Admin tarafından düzenlenecek
          }
        });
        console.log(`${collection.name} koleksiyonu için alış fiyat detayı eklendi`);
      } else {
        console.log(`${collection.name} koleksiyonu için alış fiyat detayı zaten mevcut`);
      }
    }

    console.log('Varsayılan alış fiyat listesi işlemi tamamlandı!');
    
  } catch (error) {
    console.error('Alış fiyat listesi oluşturulurken hata:', error);
    throw error;
  }
}

// Yeni koleksiyon eklendiğinde otomatik olarak alış fiyat listesine ekleyen fonksiyon
export async function addCollectionToPurchasePriceList(collectionId: string) {
  try {
    // Varsayılan alış fiyat listesini bul
    const purchasePriceList = await prisma.purchasePriceList.findFirst({
      where: { name: 'Varsayılan Alış Fiyat Listesi' }
    });

    if (!purchasePriceList) {
      console.log('Varsayılan alış fiyat listesi bulunamadı. Önce oluşturun.');
      return;
    }

    // Bu koleksiyon için zaten bir detay var mı kontrol et
    const existingDetail = await prisma.purchasePriceListDetail.findFirst({
      where: {
        purchase_price_list_id: purchasePriceList.id,
        collection_id: collectionId
      }
    });

    if (!existingDetail) {
      await prisma.purchasePriceListDetail.create({
        data: {
          purchase_price_list_id: purchasePriceList.id,
          collection_id: collectionId,
          price_per_square_meter: 0.00 // Admin tarafından düzenlenecek
        }
      });
      console.log(`Koleksiyon ${collectionId} varsayılan alış fiyat listesine eklendi`);
    }

  } catch (error) {
    console.error('Koleksiyon alış fiyat listesine eklenirken hata:', error);
    throw error;
  }
}

// Script olarak çalıştırılırsa
if (require.main === module) {
  createDefaultPurchasePriceList()
    .then(() => {
      console.log('İşlem başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('İşlem başarısız:', error);
      process.exit(1);
    });
}
