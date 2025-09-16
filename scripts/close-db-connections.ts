import { PrismaClient } from '../generated/prisma';

async function closeAllConnections() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Aktif veritabanı bağlantıları kontrol ediliyor...');
    
    // PostgreSQL'de aktif bağlantıları görüntüle
    const activeConnections = await prisma.$queryRaw`
      SELECT 
        pid,
        usename,
        application_name,
        client_addr,
        state,
        query_start,
        state_change
      FROM pg_stat_activity 
      WHERE state = 'active' 
      AND datname = current_database()
      AND pid != pg_backend_pid()
      ORDER BY query_start;
    `;
    
    console.log('📊 Aktif bağlantılar:', activeConnections);
    
    // İşlemsiz (idle) bağlantıları kapat
    const idleConnections = await prisma.$queryRaw`
      SELECT 
        pid,
        usename,
        application_name,
        state,
        state_change
      FROM pg_stat_activity 
      WHERE state = 'idle' 
      AND datname = current_database()
      AND pid != pg_backend_pid()
      AND state_change < NOW() - INTERVAL '5 minutes';
    `;
    
    console.log('💤 İşlemsiz bağlantılar (5 dk+):', idleConnections);
    
    if (Array.isArray(idleConnections) && idleConnections.length > 0) {
      console.log('🔄 İşlemsiz bağlantılar kapatılıyor...');
      
      for (const conn of idleConnections as any[]) {
        try {
          await prisma.$queryRaw`SELECT pg_terminate_backend(${conn.pid})`;
          console.log(`✅ PID ${conn.pid} kapatıldı`);
        } catch (error) {
          console.log(`❌ PID ${conn.pid} kapatılamadı:`, error);
        }
      }
    }
    
    // Toplam bağlantı sayısını göster
    const totalConnections = await prisma.$queryRaw`
      SELECT count(*) as total
      FROM pg_stat_activity 
      WHERE datname = current_database();
    `;
    
    console.log('📈 Toplam bağlantı sayısı:', totalConnections);
    
    // Connection limit bilgisini göster
    const connectionLimit = await prisma.$queryRaw`
      SELECT setting as max_connections 
      FROM pg_settings 
      WHERE name = 'max_connections';
    `;
    
    console.log('🔢 Maksimum bağlantı limiti:', connectionLimit);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
    console.log('✅ Script tamamlandı ve bağlantı kapatıldı');
  }
}

// Script olarak çalıştırılırsa
if (require.main === module) {
  closeAllConnections()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script hatası:', error);
      process.exit(1);
    });
}

export { closeAllConnections };
