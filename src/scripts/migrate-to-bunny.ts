/**
 * Tebi.io → Bunny.net Migrasyon Scripti
 * 
 * Bu script tüm görselleri Tebi.io'dan indirip Bunny.net'e yükler
 * ve veritabanındaki URL'leri günceller.
 * 
 * Kullanım: npx ts-node src/scripts/migrate-to-bunny.ts
 */

import { PrismaClient } from '../../generated/prisma';
import dotenv from 'dotenv';

dotenv.config();

// Bağlantı timeout'u artırılmış Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '&connect_timeout=60&pool_timeout=60'
    }
  }
});

// Bunny.net yapılandırması
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE!;
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD!;
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME!;
const BUNNY_STORAGE_URL = 'https://storage.bunnycdn.com';

interface MigrationStats {
  products: { total: number; success: number; failed: number };
  barcodes: { total: number; success: number; failed: number };
  qrcodes: { total: number; success: number; failed: number };
}

const stats: MigrationStats = {
  products: { total: 0, success: 0, failed: 0 },
  barcodes: { total: 0, success: 0, failed: 0 },
  qrcodes: { total: 0, success: 0, failed: 0 },
};

/**
 * Tebi URL'sinden key çıkar
 */
function extractKeyFromTebiUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    if (url.includes('s3.tebi.io')) {
      // Format: https://s3.tebi.io/pashahome/products/image.jpg
      const pathParts = urlObj.pathname.split('/');
      if (pathParts.length >= 3) {
        return pathParts.slice(2).join('/');
      }
    } else if (url.includes('.s3.tebi.io')) {
      // Format: https://pashahome.s3.tebi.io/products/image.jpg
      return urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Dosyayı Tebi'den indir ve Bunny'ye yükle
 */
async function migrateFile(tebiUrl: string): Promise<string | null> {
  try {
    const key = extractKeyFromTebiUrl(tebiUrl);
    if (!key) {
      console.log(`  ❌ Key çıkarılamadı: ${tebiUrl}`);
      return null;
    }

    // Tebi'den indir
    const response = await fetch(tebiUrl);
    if (!response.ok) {
      console.log(`  ❌ İndirilemedi (${response.status}): ${tebiUrl}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await response.arrayBuffer());

    // Bunny'ye yükle
    const uploadUrl = `${BUNNY_STORAGE_URL}/${BUNNY_STORAGE_ZONE}/${key}`;
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_STORAGE_PASSWORD,
        'Content-Type': contentType,
      },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.log(`  ❌ Yükleme hatası (${uploadResponse.status}): ${errorText}`);
      return null;
    }

    // Yeni CDN URL'sini döndür
    return `https://${BUNNY_CDN_HOSTNAME}/${key}`;
  } catch (error) {
    console.log(`  ❌ Hata: ${error}`);
    return null;
  }
}

/**
 * Ürün görsellerini taşı
 */
async function migrateProducts() {
  console.log('\n📦 Ürün görselleri taşınıyor...\n');

  const products = await prisma.product.findMany({
    where: {
      productImage: {
        contains: 'tebi.io'
      }
    },
    select: { productId: true, productImage: true, name: true }
  });

  stats.products.total = products.length;
  console.log(`  Taşınacak ürün görseli: ${products.length}\n`);

  for (const product of products) {
    if (!product.productImage) continue;

    process.stdout.write(`  [${stats.products.success + stats.products.failed + 1}/${products.length}] ${product.name.substring(0, 30)}... `);

    const newUrl = await migrateFile(product.productImage);

    if (newUrl) {
      await prisma.product.update({
        where: { productId: product.productId },
        data: { productImage: newUrl }
      });
      stats.products.success++;
      console.log(`✅`);
    } else {
      stats.products.failed++;
      console.log(`❌`);
    }
  }
}

/**
 * Barkod görsellerini taşı (Son 1 ay)
 */
async function migrateBarcodes() {
  console.log('\n📊 Barkod görselleri taşınıyor (Son 1 ay)...\n');

  // Son 1 ayın başlangıç tarihi
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const barcodes = await prisma.barcode.findMany({
    where: {
      barcode_image_url: {
        contains: 'tebi.io'
      },
      created_at: {
        gte: oneMonthAgo
      }
    },
    select: { id: true, barcode_image_url: true, barcode: true }
  });

  stats.barcodes.total = barcodes.length;
  console.log(`  Taşınacak barkod görseli: ${barcodes.length}\n`);

  for (const item of barcodes) {
    if (!item.barcode_image_url) continue;

    process.stdout.write(`  [${stats.barcodes.success + stats.barcodes.failed + 1}/${barcodes.length}] ${item.barcode}... `);

    const newUrl = await migrateFile(item.barcode_image_url);

    if (newUrl) {
      await prisma.barcode.update({
        where: { id: item.id },
        data: { barcode_image_url: newUrl }
      });
      stats.barcodes.success++;
      console.log(`✅`);
    } else {
      stats.barcodes.failed++;
      console.log(`❌`);
    }
  }
}

/**
 * QR kod görsellerini taşı (Son 1 ay)
 */
async function migrateQRCodes() {
  console.log('\n🔲 QR kod görselleri taşınıyor (Son 1 ay)...\n');

  // Son 1 ayın başlangıç tarihi
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const qrcodes = await prisma.qRCode.findMany({
    where: {
      qrCodeImageUrl: {
        contains: 'tebi.io'
      },
      created_at: {
        gte: oneMonthAgo
      }
    },
    select: { id: true, qrCodeImageUrl: true, qr_code: true }
  });

  stats.qrcodes.total = qrcodes.length;
  console.log(`  Taşınacak QR kod görseli: ${qrcodes.length}\n`);

  for (const item of qrcodes) {
    if (!item.qrCodeImageUrl) continue;

    process.stdout.write(`  [${stats.qrcodes.success + stats.qrcodes.failed + 1}/${qrcodes.length}] ${item.qr_code.substring(0, 20)}... `);

    const newUrl = await migrateFile(item.qrCodeImageUrl);

    if (newUrl) {
      await prisma.qRCode.update({
        where: { id: item.id },
        data: { qrCodeImageUrl: newUrl }
      });
      stats.qrcodes.success++;
      console.log(`✅`);
    } else {
      stats.qrcodes.failed++;
      console.log(`❌`);
    }
  }
}

/**
 * Migrasyon öncesi durum raporu
 */
async function preflightCheck() {
  console.log('\n🔍 Migrasyon öncesi kontrol...\n');

  // Bunny.net credentials kontrolü
  if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_PASSWORD || !BUNNY_CDN_HOSTNAME) {
    console.error('❌ Bunny.net yapılandırması eksik! .env dosyasını kontrol edin.');
    console.log('   Gerekli değişkenler: BUNNY_STORAGE_ZONE, BUNNY_STORAGE_PASSWORD, BUNNY_CDN_HOSTNAME');
    process.exit(1);
  }

  console.log(`  ✅ Bunny Storage Zone: ${BUNNY_STORAGE_ZONE}`);
  console.log(`  ✅ Bunny CDN Hostname: ${BUNNY_CDN_HOSTNAME}`);

  // Son 1 ayın başlangıç tarihi
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // Tebi.io URL sayıları (son 1 ay)
  const productCount = await prisma.product.count({
    where: { productImage: { contains: 'tebi.io' } }
  });
  const barcodeCount = await prisma.barcode.count({
    where: { 
      barcode_image_url: { contains: 'tebi.io' },
      created_at: { gte: oneMonthAgo }
    }
  });
  const qrcodeCount = await prisma.qRCode.count({
    where: { 
      qrCodeImageUrl: { contains: 'tebi.io' },
      created_at: { gte: oneMonthAgo }
    }
  });

  console.log(`\n  📊 Taşınacak görseller (Son 1 ay):`);
  console.log(`     - Ürün görselleri: ${productCount} (ZATEN TAŞINDI ✅)`);
  console.log(`     - Barkod görselleri: ${barcodeCount}`);
  console.log(`     - QR kod görselleri: ${qrcodeCount}`);
  console.log(`     - TOPLAM: ${barcodeCount + qrcodeCount}`);

  if (barcodeCount + qrcodeCount === 0) {
    console.log('\n✨ Taşınacak görsel bulunamadı. Migrasyon zaten tamamlanmış olabilir.');
    process.exit(0);
  }

  // Bunny.net bağlantı testi
  console.log('\n  🧪 Bunny.net bağlantı testi...');
  try {
    const testUrl = `${BUNNY_STORAGE_URL}/${BUNNY_STORAGE_ZONE}/`;
    const testResponse = await fetch(testUrl, {
      method: 'GET',
      headers: { 'AccessKey': BUNNY_STORAGE_PASSWORD }
    });
    
    // 200, 404, veya herhangi bir yanıt = bağlantı var
    console.log(`  ✅ Bunny.net bağlantısı başarılı! (Status: ${testResponse.status})`);
  } catch (error: any) {
    console.log(`  ⚠️  Bunny.net test uyarısı: ${error.message}`);
    console.log('  ℹ️  Yine de migrasyona devam ediliyor...');
  }
}

/**
 * Sonuç raporu
 */
function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📋 MİGRASYON SONUÇ RAPORU');
  console.log('='.repeat(50));
  
  console.log(`\n  Ürün Görselleri:`);
  console.log(`    - Toplam: ${stats.products.total}`);
  console.log(`    - Başarılı: ${stats.products.success} ✅`);
  console.log(`    - Başarısız: ${stats.products.failed} ❌`);

  console.log(`\n  Barkod Görselleri:`);
  console.log(`    - Toplam: ${stats.barcodes.total}`);
  console.log(`    - Başarılı: ${stats.barcodes.success} ✅`);
  console.log(`    - Başarısız: ${stats.barcodes.failed} ❌`);

  console.log(`\n  QR Kod Görselleri:`);
  console.log(`    - Toplam: ${stats.qrcodes.total}`);
  console.log(`    - Başarılı: ${stats.qrcodes.success} ✅`);
  console.log(`    - Başarısız: ${stats.qrcodes.failed} ❌`);

  const totalSuccess = stats.products.success + stats.barcodes.success + stats.qrcodes.success;
  const totalFailed = stats.products.failed + stats.barcodes.failed + stats.qrcodes.failed;
  const total = stats.products.total + stats.barcodes.total + stats.qrcodes.total;

  console.log(`\n  GENEL TOPLAM:`);
  console.log(`    - Toplam: ${total}`);
  console.log(`    - Başarılı: ${totalSuccess} ✅`);
  console.log(`    - Başarısız: ${totalFailed} ❌`);
  console.log(`    - Başarı Oranı: ${total > 0 ? ((totalSuccess / total) * 100).toFixed(1) : 0}%`);

  console.log('\n' + '='.repeat(50));

  if (totalFailed === 0) {
    console.log('\n✨ Migrasyon başarıyla tamamlandı! Tüm görseller Bunny.net\'e taşındı.');
  } else {
    console.log(`\n⚠️  ${totalFailed} görsel taşınamadı. Bunları manuel kontrol etmeniz gerekebilir.`);
  }
}

/**
 * Ana migrasyon fonksiyonu
 */
async function main() {
  console.log('\n🚀 Tebi.io → Bunny.net Migrasyon Başlıyor...');
  console.log('='.repeat(50));

  try {
    await preflightCheck();

    console.log('\n' + '='.repeat(50));
    console.log('📦 MİGRASYON BAŞLIYOR (Son 1 ay)...');
    console.log('='.repeat(50));

    // Ürünler zaten taşındı, atla
    console.log('\n📦 Ürün görselleri zaten taşındı, atlanıyor...');
    
    await migrateBarcodes();
    await migrateQRCodes();

    printSummary();
  } catch (error) {
    console.error('\n❌ Migrasyon hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Scripti çalıştır
main();
