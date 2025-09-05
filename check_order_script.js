const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrder() {
  try {
    // Sipariş detaylarını getir
    const order = await prisma.order.findUnique({
      where: { id: 'd2c13bce-da9b-4c63-aded-577508ccb8fa' },
      include: {
        user: {
          include: {
            store: true
          }
        }
      }
    });

    if (!order) {
      console.log('Sipariş bulunamadı!');
      return;
    }

    console.log('=== SİPARİŞ DETAYLARI ===');
    console.log('Sipariş ID:', order.id);
    console.log('Durum:', order.status);
    console.log('Toplam Tutar:', order.total_price);
    console.log('Oluşturulma Tarihi:', order.created_at);
    console.log('Mağaza Adı:', order.user.store.kurum_adi);
    console.log('Limitsiz Açık Hesap:', order.user.store.limitsiz_acik_hesap);
    console.log('Para Birimi:', order.user.store.currency);

    // Muhasebe hareketlerini kontrol et
    const accountingMovements = await prisma.muhasebe_hareketleri.findMany({
      where: {
        aciklama: {
          contains: order.id
        }
      },
      include: {
        store: true
      }
    });

    console.log('\n=== MUHASEBE HAREKETLERİ ===');
    if (accountingMovements.length === 0) {
      console.log('❌ Bu sipariş için muhasebe hareketi bulunamadı!');
    } else {
      console.log(`✅ ${accountingMovements.length} adet muhasebe hareketi bulundu:`);
      accountingMovements.forEach((movement, index) => {
        console.log(`${index + 1}. ${movement.islem_turu} - ${movement.tutar} ${movement.currency} - ${movement.aciklama}`);
      });
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrder();
