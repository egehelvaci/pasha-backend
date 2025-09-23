import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

interface TestResult {
  testName: string;
  duration: number;
  success: boolean;
  error?: string;
  recordCount?: number;
}

async function performanceTest() {
  const results: TestResult[] = [];
  
  console.log('🚀 Database Performans Testi Başlatılıyor...\n');

  // Test 1: Basit bağlantı testi
  await runTest('Basit Bağlantı Testi', async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { recordCount: 1 };
  }, results);

  // Test 2: Ürün sayısı
  await runTest('Ürün Sayısı', async () => {
    const count = await prisma.product.count();
    return { recordCount: count };
  }, results);

  // Test 3: Koleksiyon listesi
  await runTest('Koleksiyon Listesi', async () => {
    const collections = await prisma.collection.findMany();
    return { recordCount: collections.length };
  }, results);

  // Test 4: Ürün listesi (ilk 10)
  await runTest('Ürün Listesi (10 kayıt)', async () => {
    const products = await prisma.product.findMany({
      take: 10,
      include: {
        collection: true
      }
    });
    return { recordCount: products.length };
  }, results);

  // Test 5: Alış fiyat listesi
  await runTest('Alış Fiyat Listesi', async () => {
    const purchaseList = await prisma.purchasePriceList.findFirst({
      where: { name: 'Varsayılan Alış Fiyat Listesi' },
      include: {
        details: {
          include: {
            collection: true
          }
        }
      }
    });
    return { recordCount: purchaseList?.details.length || 0 };
  }, results);

  // Test 6: Satıcı listesi
  await runTest('Satıcı Listesi', async () => {
    const suppliers = await prisma.supplier.findMany({
      where: { is_active: true }
    });
    return { recordCount: suppliers.length };
  }, results);

  // Test 7: Kompleks join sorgusu
  await runTest('Kompleks Join (Ürün+Koleksiyon+Fiyat)', async () => {
    const complexQuery = await prisma.product.findMany({
      take: 5,
      include: {
        collection: {
          include: {
            PriceListDetail: {
              include: {
                PriceList: true
              }
            }
          }
        }
      }
    });
    return { recordCount: complexQuery.length };
  }, results);

  // Test 8: Eş zamanlı bağlantı testi
  await runTest('Eş Zamanlı Bağlantı (5 paralel)', async () => {
    const promises = Array(5).fill(0).map(async (_, index) => {
      await prisma.$queryRaw`SELECT ${index + 1} as test_id`;
      return index + 1;
    });
    
    const parallelResults = await Promise.all(promises);
    return { recordCount: parallelResults.length };
  }, results);

  // Test 9: Transaction testi
  await runTest('Transaction Testi', async () => {
    const result = await prisma.$transaction(async (tx) => {
      const count1 = await tx.product.count();
      const count2 = await tx.collection.count();
      return count1 + count2;
    });
    return { recordCount: result };
  }, results);

  // Test 10: Stress test (10 eş zamanlı sorgu)
  await runTest('Stress Test (10 paralel sorgu)', async () => {
    const stressPromises = Array(10).fill(0).map(async (_, index) => {
      return await prisma.product.count({
        where: {
          name: {
            contains: 'test' + index
          }
        }
      });
    });
    
    const stressResults = await Promise.all(stressPromises);
    return { recordCount: stressResults.reduce((a, b) => a + b, 0) };
  }, results);

  // Sonuçları göster
  console.log('\n📊 PERFORMANS TEST SONUÇLARI');
  console.log('=' .repeat(60));
  
  let totalTime = 0;
  let successCount = 0;
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const duration = result.duration.toFixed(2);
    const records = result.recordCount ? ` (${result.recordCount} kayıt)` : '';
    
    console.log(`${index + 1}. ${status} ${result.testName}: ${duration}ms${records}`);
    
    if (result.success) {
      totalTime += result.duration;
      successCount++;
    } else {
      console.log(`   Hata: ${result.error}`);
    }
  });

  console.log('=' .repeat(60));
  console.log(`📈 Toplam Test: ${results.length}`);
  console.log(`✅ Başarılı: ${successCount}`);
  console.log(`❌ Başarısız: ${results.length - successCount}`);
  console.log(`⏱️ Toplam Süre: ${totalTime.toFixed(2)}ms`);
  console.log(`📊 Ortalama: ${(totalTime / successCount).toFixed(2)}ms/test`);

  // Performans değerlendirmesi
  const avgTime = totalTime / successCount;
  console.log('\n🎯 PERFORMANS DEĞERLENDİRMESİ:');
  
  if (avgTime < 100) {
    console.log('🟢 MÜKEMMEL: Çok hızlı response (<100ms)');
  } else if (avgTime < 300) {
    console.log('🟡 İYİ: Normal response (100-300ms)');
  } else if (avgTime < 1000) {
    console.log('🟠 ORTA: Yavaş response (300-1000ms)');
  } else {
    console.log('🔴 KÖTÜ: Çok yavaş response (>1000ms)');
  }

  console.log(`\n🔗 Connection Pool Durumu: ${successCount}/${results.length} test başarılı`);
  
  if (successCount === results.length) {
    console.log('✅ Connection pool stabil çalışıyor');
  } else {
    console.log('⚠️ Connection pool sorunları var');
  }
}

async function runTest(
  testName: string, 
  testFn: () => Promise<{ recordCount?: number }>, 
  results: TestResult[]
) {
  console.log(`🔄 ${testName} çalışıyor...`);
  
  const startTime = Date.now();
  
  try {
    const result = await testFn();
    const duration = Date.now() - startTime;
    
    results.push({
      testName,
      duration,
      success: true,
      recordCount: result.recordCount
    });
    
    console.log(`✅ ${testName}: ${duration}ms`);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    results.push({
      testName,
      duration,
      success: false,
      error: error.message
    });
    
    console.log(`❌ ${testName}: ${duration}ms - ${error.message}`);
  }
}

// Script olarak çalıştırılırsa
if (require.main === module) {
  performanceTest()
    .then(() => {
      console.log('\n🎉 Performans testi tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Performans testi hatası:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}


