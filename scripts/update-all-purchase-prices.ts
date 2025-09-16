import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export async function updateAllPurchasePrices() {
  try {
    console.log('🔄 Tüm koleksiyonların alış fiyatları 5 USD olarak güncelleniyor...');
    
    // Varsayılan alış fiyat listesini bul
    const purchasePriceList = await prisma.purchasePriceList.findFirst({
      where: { 
        name: 'Varsayılan Alış Fiyat Listesi',
        is_active: true 
      }
    });

    if (!purchasePriceList) {
      console.log('❌ Varsayılan alış fiyat listesi bulunamadı!');
      return;
    }

    console.log(`✅ Alış fiyat listesi bulundu: ${purchasePriceList.name}`);

    // Tüm alış fiyat detaylarını 5 USD olarak güncelle
    const updateResult = await prisma.purchasePriceListDetail.updateMany({
      where: {
        purchase_price_list_id: purchasePriceList.id
      },
      data: {
        price_per_square_meter: 5.00
      }
    });

    console.log(`✅ ${updateResult.count} koleksiyon fiyatı güncellendi`);

    // Güncellenmiş fiyatları kontrol et
    const updatedDetails = await prisma.purchasePriceListDetail.findMany({
      where: {
        purchase_price_list_id: purchasePriceList.id
      },
      include: {
        collection: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        collection: {
          name: 'asc'
        }
      }
    });

    console.log('\n📊 Güncellenmiş Alış Fiyatları:');
    updatedDetails.forEach((detail, index) => {
      console.log(`${index + 1}. ${detail.collection.name} (${detail.collection.code}): $${detail.price_per_square_meter}/m²`);
    });

    console.log(`\n🎉 Toplam ${updatedDetails.length} koleksiyon için alış fiyatı $5.00/m² olarak ayarlandı!`);
    
  } catch (error) {
    console.error('❌ Alış fiyatları güncellenirken hata:', error);
    throw error;
  }
}

// Script olarak çalıştırılırsa
if (require.main === module) {
  updateAllPurchasePrices()
    .then(() => {
      console.log('✅ İşlem başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ İşlem başarısız:', error);
      process.exit(1);
    });
}
