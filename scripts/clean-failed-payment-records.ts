import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function cleanFailedPaymentRecords() {
  try {
    console.log('🧹 Başarısız ödeme muhasebe kayıtları temizleniyor...\n');

    // Mevcut başarısız ödeme kayıtlarını bul
    const failedPaymentRecords = await prisma.muhasebeHareketleri.findMany({
      where: {
        OR: [
          { islemTuru: 'ÖDEME_BAŞARISIZ' },
          { islemTuru: 'ÖDEME_İPTAL' }
        ]
      },
      include: {
        store: {
          select: {
            kurum_adi: true
          }
        }
      }
    });

    console.log(`📋 Bulunan başarısız ödeme kayıtları: ${failedPaymentRecords.length} adet\n`);

    if (failedPaymentRecords.length === 0) {
      console.log('✅ Temizlenecek kayıt bulunamadı.');
      return;
    }

    // Kayıtları listele
    console.log('🗑️  Silinecek kayıtlar:');
    failedPaymentRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.islemTuru} - ${record.store.kurum_adi} - ${record.tutar} TL - ${record.tarih.toLocaleDateString('tr-TR')}`);
    });

    console.log('\n🗂️  Kayıtlar siliniyor...');

    // Başarısız ödeme kayıtlarını sil
    const deletedCount = await prisma.muhasebeHareketleri.deleteMany({
      where: {
        OR: [
          { islemTuru: 'ÖDEME_BAŞARISIZ' },
          { islemTuru: 'ÖDEME_İPTAL' }
        ]
      }
    });

    console.log(`✅ ${deletedCount.count} adet başarısız ödeme kaydı silindi.\n`);

    // Mevcut ödeme kayıtlarının açıklamalarını güncelle
    console.log('🔄 Mevcut başarılı ödeme kayıtlarının açıklamaları güncelleniyor...');

    const successPaymentRecords = await prisma.muhasebeHareketleri.findMany({
      where: {
        islemTuru: 'ÖDEME',
        aciklama: {
          contains: 'DBYE'
        }
      }
    });

    console.log(`📋 Güncelle nacek başarılı ödeme kaydı: ${successPaymentRecords.length} adet\n`);

    for (const record of successPaymentRecords) {
      // Eski açıklamadan tutar bilgisini çıkar
      const tutar = record.tutar.toString();
      
      // Yeni açıklama formatı
      const yeniAciklama = `Sanal POS Ödemesi - ${tutar} TL`;

      await prisma.muhasebeHareketleri.update({
        where: { id: record.id },
        data: {
          aciklama: yeniAciklama
        }
      });

      console.log(`✏️  Güncellendi: ID ${record.id} - "${yeniAciklama}"`);
    }

    console.log('\n🎉 Temizleme işlemi tamamlandı!');
    console.log('\n📊 Özet:');
    console.log(`• ${deletedCount.count} adet başarısız ödeme kaydı silindi`);
    console.log(`• ${successPaymentRecords.length} adet başarılı ödeme açıklaması güncellendi`);
    console.log('\n✅ Artık sadece başarılı ödemeler muhasebe hareketlerine ekleniyor.');

  } catch (error) {
    console.error('❌ Temizleme işlemi hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await cleanFailedPaymentRecords();
}

main().catch(console.error); 