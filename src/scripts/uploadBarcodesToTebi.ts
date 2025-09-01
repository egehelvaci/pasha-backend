import { PrismaClient } from '../../generated/prisma';
import { UploadService } from '../utils/upload-service';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();
const uploadService = new UploadService();

async function uploadBarcodesToTebi() {
  try {
    // Henüz Tebi URL'si olmayan barkodları bul
    const barcodesWithLocalUrls = await prisma.barcode.findMany({
      where: {
        barcode_image_url: {
          startsWith: '/barcodes/'
        }
      }
    });

    console.log(`Tebi'ye yüklenmemiş ${barcodesWithLocalUrls.length} barkod bulundu.`);

    if (barcodesWithLocalUrls.length === 0) {
      console.log('Tüm barkodlar zaten Tebi\'de.');
      return;
    }

    const barcodesDir = path.join(process.cwd(), 'public', 'barcodes');
    let uploadedCount = 0;
    let failedCount = 0;

    for (const barcode of barcodesWithLocalUrls) {
      try {
        // URL null kontrolü
        if (!barcode.barcode_image_url) {
          console.log(`  ⚠️  URL boş: ${barcode.barcode}`);
          failedCount++;
          continue;
        }

        // Lokal dosya adını çıkar
        const fileName = barcode.barcode_image_url.replace('/barcodes/', '');
        const filePath = path.join(barcodesDir, fileName);

        // Dosyanın var olup olmadığını kontrol et
        try {
          await fs.access(filePath);
        } catch {
          console.log(`  ⚠️  Dosya bulunamadı: ${fileName}`);
          failedCount++;
          continue;
        }

        // Dosyayı oku
        const fileBuffer = await fs.readFile(filePath);

        // Tebi'ye yükle
        const tebiUrl = await uploadService.uploadFile(
          fileBuffer,
          'image/png',
          fileName,
          'barcodes'
        );

        // Veritabanını güncelle
        await prisma.barcode.update({
          where: { id: barcode.id },
          data: { barcode_image_url: tebiUrl }
        });

        uploadedCount++;
        console.log(`  ✅ Yüklendi: ${barcode.barcode} -> ${tebiUrl}`);

        // Yüklenen dosyayı lokal sistemden sil (opsiyonel)
        // await fs.unlink(filePath);

      } catch (error) {
        console.error(`  ❌ Hata (${barcode.barcode}):`, error instanceof Error ? error.message : error);
        failedCount++;
      }
    }

    console.log(`\n📊 Özet:`);
    console.log(`  ✅ Başarıyla yüklenen: ${uploadedCount}`);
    console.log(`  ❌ Başarısız: ${failedCount}`);

    // Güncel durumu kontrol et
    const tebiBarcodesCount = await prisma.barcode.count({
      where: {
        barcode_image_url: {
          contains: 'tebi.io'
        }
      }
    });

    const localBarcodesCount = await prisma.barcode.count({
      where: {
        barcode_image_url: {
          startsWith: '/barcodes/'
        }
      }
    });

    console.log(`\n📈 Genel Durum:`);
    console.log(`  Tebi'de: ${tebiBarcodesCount} barkod`);
    console.log(`  Lokal: ${localBarcodesCount} barkod`);

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
uploadBarcodesToTebi();