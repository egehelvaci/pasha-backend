import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

async function checkBarcodes() {
  try {
    // Son oluşturulan barkodları kontrol et
    const barcodes = await prisma.barcode.findMany({
      take: 5,
      orderBy: {
        created_at: 'desc'
      },
      include: {
        order: true,
        order_item: {
          include: {
            product: true
          }
        }
      }
    });

    console.log(`Son ${barcodes.length} barkod:`);
    barcodes.forEach(barcode => {
      console.log(`\n📊 Barkod: ${barcode.barcode}`);
      console.log(`   Sipariş: ${barcode.order_id}`);
      console.log(`   Ürün: ${barcode.order_item.product.name}`);
      console.log(`   Görsel URL: ${barcode.barcode_image_url}`);
      console.log(`   Oluşturulma: ${barcode.created_at}`);
    });

    // Toplam barkod sayısı
    const totalBarcodes = await prisma.barcode.count();
    const scannedBarcodes = await prisma.barcode.count({
      where: { is_scanned: true }
    });

    console.log(`\n📈 Toplam İstatistikler:`);
    console.log(`   Toplam barkod: ${totalBarcodes}`);
    console.log(`   Okutulmuş: ${scannedBarcodes}`);
    console.log(`   Okutulmamış: ${totalBarcodes - scannedBarcodes}`);

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBarcodes();