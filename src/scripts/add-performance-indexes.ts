/**
 * Performans indexlerini canlı veritabanına uygular.
 *
 * - CREATE INDEX CONCURRENTLY: tabloları yazmaya kilitlemez (production-safe)
 * - IF NOT EXISTS: tekrar çalıştırılabilir (idempotent)
 * - Migration geçmişi drift olduğu için prisma migrate yerine bu script kullanılır
 *
 * Çalıştırma: npx ts-node src/scripts/add-performance-indexes.ts
 */
import prisma from '../utils/prisma';

const indexes: { name: string; sql: string }[] = [
  // Order: sipariş listeleme sorgularının tamamı bu tabloyu tarıyor
  {
    name: 'idx_order_user_created',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_user_created ON "Order" (user_id, created_at DESC)`
  },
  {
    name: 'idx_order_status_created',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_status_created ON "Order" (status, created_at DESC)`
  },
  {
    name: 'idx_order_created_at',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_created_at ON "Order" (created_at DESC)`
  },
  {
    name: 'idx_order_address_id',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_address_id ON "Order" (address_id)`
  },
  // OrderItem: her siparişin kalemleri order_id ile çekiliyor
  {
    name: 'idx_order_item_order_id',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_item_order_id ON "OrderItem" (order_id)`
  },
  {
    name: 'idx_order_item_product_id',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_item_product_id ON "OrderItem" (product_id)`
  },
  // User: mağaza kullanıcıları store_id ile bulunuyor (my-orders akışı)
  {
    name: 'idx_user_store_id',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_store_id ON "User" (store_id)`
  },
  // Muhasebe hareketleri: mağaza + tarih filtreli listeleme
  {
    name: 'idx_muhasebe_store_tarih',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_muhasebe_store_tarih ON muhasebe_hareketleri (store_id, tarih DESC)`
  },
  {
    name: 'idx_muhasebe_order_id',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_muhasebe_order_id ON muhasebe_hareketleri (order_id)`
  },
  // Bildirimler: kullanıcı bazlı liste + okunmamış sayısı
  {
    name: 'idx_notification_user_read',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_user_read ON in_app_notifications (user_id, is_read)`
  },
  {
    name: 'idx_notification_user_created',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_user_created ON in_app_notifications (user_id, created_at DESC)`
  },
  // Ödeme işlemleri: mağaza bazlı liste ve PENDING webhook aramaları
  {
    name: 'idx_payment_tx_store_created',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_tx_store_created ON payment_transactions (store_id, created_at DESC)`
  },
  {
    name: 'idx_payment_tx_status',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_tx_status ON payment_transactions (status)`
  }
];

async function main() {
  console.log(`${indexes.length} index kontrol edilecek/oluşturulacak...\n`);

  for (const index of indexes) {
    const start = Date.now();
    try {
      await prisma.$executeRawUnsafe(index.sql);
      console.log(`✅ ${index.name} (${((Date.now() - start) / 1000).toFixed(1)}s)`);
    } catch (error: any) {
      console.error(`❌ ${index.name}: ${error.message}`);
    }
  }

  // CONCURRENTLY yarıda kesilirse INVALID index kalabilir; kontrol et
  const invalid = await prisma.$queryRawUnsafe<any[]>(`
    SELECT c.relname AS index_name
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indexrelid
    WHERE NOT i.indisvalid
  `);

  if (invalid.length > 0) {
    console.warn('\n⚠️ INVALID durumda index(ler) bulundu (silinip script tekrar çalıştırılmalı):');
    invalid.forEach(row => console.warn(`   - ${row.index_name}`));
  } else {
    console.log('\n✅ Tüm indexler geçerli durumda.');
  }
}

main()
  .catch(err => {
    console.error('Script hatası:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
