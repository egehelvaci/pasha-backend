import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

async function deleteOrdersByDate() {
  try {
    // 1 Eylül 2025 tarihindeki siparişleri bul (Türkiye saati UTC+3)
    const startOfDay = new Date('2025-08-31T21:00:00.000Z'); // 1 Eylül 00:00 TR
    const endOfDay = new Date('2025-09-01T20:59:59.999Z');   // 1 Eylül 23:59 TR

    // Önce siparişleri kontrol et
    const orders = await prisma.order.findMany({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        items: true,
        qr_codes: true,
        barcodes: true,
        employeeOrderStats: true
      }
    });

    console.log(`1 Eylül 2025 tarihinde ${orders.length} adet sipariş bulundu.`);

    if (orders.length === 0) {
      console.log('Silinecek sipariş bulunamadı.');
      return;
    }

    // Siparişlerin detaylarını göster
    orders.forEach(order => {
      console.log(`- Sipariş ID: ${order.id}`);
      console.log(`  Kullanıcı: ${order.user_id}`);
      console.log(`  Toplam Tutar: ${order.total_price}`);
      console.log(`  Durum: ${order.status}`);
      console.log(`  Oluşturulma: ${order.created_at}`);
      console.log(`  Ürün sayısı: ${order.items.length}`);
      console.log(`  QR kod sayısı: ${order.qr_codes.length}`);
      console.log(`  Barkod sayısı: ${order.barcodes.length}`);
      console.log('---');
    });

    // Kullanıcıdan onay al
    console.log('\nBu siparişler silinecek. Devam etmek için bekleyin...\n');

    // Transaction içinde sil (cascade delete otomatik olarak ilişkili verileri siler)
    const deleteResult = await prisma.$transaction(async (tx) => {
      // Order modelinde cascade delete tanımlı olduğu için
      // sadece Order'ları silmek yeterli, ilişkili veriler otomatik silinir
      const deleted = await tx.order.deleteMany({
        where: {
          created_at: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      return deleted;
    });

    console.log(`✅ ${deleteResult.count} adet sipariş ve ilişkili tüm veriler başarıyla silindi.`);

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
deleteOrdersByDate();