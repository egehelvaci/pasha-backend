/**
 * Database Connection Test
 * Railway PostgreSQL bağlantısını test eder
 */

import { PrismaClient } from './generated/prisma';

const DATABASE_URL = 'postgresql://postgres:JQFOWXIpEnSvchuIMXpPpGHvCYVOSUdx@yamabiko.proxy.rlwy.net:17072/railway';

async function testDatabaseConnection() {
  console.log('=== DATABASE CONNECTION TEST ===\n');
  
  console.log('Database URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
  console.log('Host: yamabiko.proxy.rlwy.net');
  console.log('Port: 17072');
  console.log('Database: railway');
  console.log('User: postgres');
  console.log('');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL
      }
    },
    log: ['query', 'error', 'warn']
  });
  
  try {
    console.log('Baglanti deneniyor...');
    const startTime = Date.now();
    
    // Basit bir query ile bağlantıyı test et
    await prisma.$queryRaw`SELECT 1 as test`;
    
    const duration = Date.now() - startTime;
    console.log(`\nBASARILI: Database'e baglanildi! (${duration}ms)`);
    
    // Store sayısını kontrol et
    const storeCount = await prisma.store.count();
    console.log(`Store sayisi: ${storeCount}`);
    
    // User sayısını kontrol et
    const userCount = await prisma.user.count();
    console.log(`User sayisi: ${userCount}`);
    
    // DBYE login kaydını kontrol et
    const dbyeLogin = await prisma.dbyeOdemeLogin.findFirst({
      where: { id: 1 }
    });
    
    if (dbyeLogin) {
      console.log('\nDBYE Odeme Login kaydi bulundu:');
      console.log(`  Email: ${dbyeLogin.email}`);
      console.log(`  URL: ${dbyeLogin.url}`);
      console.log(`  Password: ${dbyeLogin.password ? '***' : 'YOK'}`);
    } else {
      console.log('\nUYARI: DBYE Odeme Login kaydi bulunamadi!');
    }
    
    console.log('\n=== TEST BASARILI ===');
    
  } catch (error) {
    console.error('\nHATA: Database baglantisi basarisiz!');
    console.error('');
    
    if (error instanceof Error) {
      console.error('Hata mesaji:', error.message);
      
      if (error.message.includes("Can't reach database server")) {
        console.error('\nOlasi sebepler:');
        console.error('1. Railway database servisi kapatilmis olabilir');
        console.error('2. IP adresi Railway tarafindan engellenebilir');
        console.error('3. Database credentials degismis olabilir');
        console.error('4. Ag baglantisi/firewall sorunu olabilir');
        console.error('5. Railway servisi sleep modunda olabilir (ucretsiz plan)');
      } else if (error.message.includes("authentication failed")) {
        console.error('\nKullanici adi veya sifre hatali!');
      } else if (error.message.includes("timeout")) {
        console.error('\nBaglanti zaman asimina ugradi!');
      }
    } else {
      console.error('Bilinmeyen hata:', error);
    }
    
    console.error('\n=== TEST BASARISIZ ===');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();





