import { PrismaClient } from '../../generated/prisma';
import * as bwipjs from 'bwip-js';
import { UploadService } from '../utils/upload-service';
import crypto from 'crypto';

const prisma = new PrismaClient();
const uploadService = new UploadService();

/**
 * Benzersiz barkod üret (servisin aynı mantığını kullan)
 */
function generateUniqueBarcode(): string {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `BAR-${timestamp}-${randomBytes}`;
}

async function fixBarcodes() {
  try {
    console.log('🔄 Mevcut yanlış formattaki barkodları düzeltme işlemi başlıyor...\n');

    // Önce mevcut tüm barkodları sil
    const deleteResult = await prisma.barcode.deleteMany({});
    console.log(`🗑️  ${deleteResult.count} adet eski barkod silindi.\n`);

    // Tüm siparişleri al
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'READY', 'SHIPPED', 'DELIVERED']
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    console.log(`📦 ${orders.length} sipariş için barkod oluşturulacak.\n`);

    let totalBarcodesCreated = 0;
    let totalImagesCreated = 0;

    for (const order of orders) {
      console.log(`\n📋 Sipariş ${order.id} işleniyor...`);
      console.log(`   Kullanıcı: ${order.user.name} ${order.user.surname}`);
      console.log(`   Tarih: ${order.created_at}`);
      console.log(`   Ürün sayısı: ${order.items.length}`);

      // Her sipariş item'ı için 1 barkod oluştur (barcode-service mantığı)
      for (const item of order.items) {
        const barcodeString = generateUniqueBarcode();

        try {
          // Barkod görselini oluştur
          const png = await bwipjs.toBuffer({
            bcid: 'code128',
            text: barcodeString,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: 'center',
          });

          // Tebi'ye yükle
          const fileName = `${barcodeString}.png`;
          const imageUrl = await uploadService.uploadFile(
            png,
            'image/png',
            fileName,
            'barcodes'
          );

          // Veritabanına barkod kaydı ekle
          await prisma.barcode.create({
            data: {
              order_id: order.id,
              order_item_id: item.id,
              product_id: item.product_id,
              barcode: barcodeString,
              barcode_type: 'CODE128',
              barcode_image_url: imageUrl,
              quantity: item.quantity,
              required_scans: item.quantity,
              is_scanned: false,
              scan_count: 0
            }
          });

          totalBarcodesCreated++;
          totalImagesCreated++;
          console.log(`   ✅ Barkod oluşturuldu: ${barcodeString} (${item.quantity} kez okutulacak)`);
          console.log(`      Ürün: ${item.product.name}`);
          console.log(`      Görsel: ${imageUrl}`);

        } catch (error) {
          console.error(`   ❌ Barkod oluşturulamadı:`, error instanceof Error ? error.message : error);
        }
      }
    }

    console.log(`\n✅ İşlem tamamlandı!`);
    console.log(`📊 Toplam ${totalBarcodesCreated} barkod oluşturuldu.`);
    console.log(`🖼️  Toplam ${totalImagesCreated} barkod görseli Tebi'ye yüklendi.`);

    // Özet istatistikler
    const barcodeStats = await prisma.barcode.groupBy({
      by: ['order_id'],
      _count: {
        id: true
      }
    });

    console.log(`\n📈 Sipariş başına barkod dağılımı:`);
    for (const stat of barcodeStats.slice(0, 5)) {
      console.log(`   Sipariş ${stat.order_id}: ${stat._count.id} barkod`);
    }
    if (barcodeStats.length > 5) {
      console.log(`   ... ve ${barcodeStats.length - 5} sipariş daha`);
    }

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
fixBarcodes();