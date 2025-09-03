import { PrismaClient } from '../../generated/prisma';
import * as bwipjs from 'bwip-js';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

async function generateBarcodesForOldOrders() {
  try {
    // Barkod olmayan siparişleri bul
    const ordersWithoutBarcodes = await prisma.order.findMany({
      where: {
        barcodes: {
          none: {}
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

    console.log(`Barkod olmayan ${ordersWithoutBarcodes.length} sipariş bulundu.`);

    if (ordersWithoutBarcodes.length === 0) {
      console.log('Tüm siparişlerde barkod mevcut.');
      return;
    }

    // Barkod görselleri için klasör oluştur
    const barcodesDir = path.join(process.cwd(), 'public', 'barcodes');
    await fs.mkdir(barcodesDir, { recursive: true });

    let totalBarcodesCreated = 0;

    for (const order of ordersWithoutBarcodes) {
      console.log(`\nSipariş ${order.id} için barkodlar oluşturuluyor...`);
      console.log(`  Kullanıcı: ${order.user.name} ${order.user.surname}`);
      console.log(`  Tarih: ${order.created_at}`);
      console.log(`  Ürün sayısı: ${order.items.length}`);

      for (const item of order.items) {
        // Her ürün için quantity kadar barkod oluştur
        for (let i = 0; i < item.quantity; i++) {
          // Benzersiz barkod kodu oluştur
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 8).toUpperCase();
          const barcodeData = `ORD${order.id.substring(0, 8).toUpperCase()}${timestamp}${random}`;

          try {
            // Barkod görselini oluştur
            const png = await bwipjs.toBuffer({
              bcid: 'ean13',
              text: barcodeData,
              scale: 3,
              height: 10,
              includetext: true,
              textxalign: 'center',
            });

            // Görseli kaydet
            const fileName = `${barcodeData}.png`;
            const filePath = path.join(barcodesDir, fileName);
            await fs.writeFile(filePath, png);

            // Veritabanına barkod kaydı ekle
            await prisma.barcode.create({
              data: {
                order_id: order.id,
                order_item_id: item.id,
                product_id: item.product_id,
                barcode: barcodeData,
                barcode_type: 'EAN13',
                barcode_image_url: `/barcodes/${fileName}`,
                quantity: 1,
                required_scans: 1,
                is_scanned: false,
                scan_count: 0
              }
            });

            totalBarcodesCreated++;
            console.log(`    ✓ Barkod oluşturuldu: ${barcodeData}`);
          } catch (error) {
            console.error(`    ✗ Barkod oluşturulamadı: ${error instanceof Error ? error.message : error}`);
          }
        }
      }
    }

    console.log(`\n✅ Toplam ${totalBarcodesCreated} barkod başarıyla oluşturuldu.`);

    // Özet rapor
    const updatedOrders = await prisma.order.findMany({
      where: {
        id: {
          in: ordersWithoutBarcodes.map(o => o.id)
        }
      },
      include: {
        barcodes: true
      }
    });

    console.log('\n📊 Özet Rapor:');
    updatedOrders.forEach(order => {
      console.log(`  Sipariş ${order.id}: ${order.barcodes.length} barkod`);
    });

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
generateBarcodesForOldOrders();