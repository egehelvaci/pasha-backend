import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

interface StressTestResult {
  testId: number;
  duration: number;
  success: boolean;
  error?: string;
  recordCount?: number;
}

async function stressTest(concurrentQueries: number = 35) {
  console.log(`🚀 Stress Test Başlatılıyor: ${concurrentQueries} eş zamanlı sorgu\n`);
  
  const startTime = Date.now();
  
  // 30-40 eş zamanlı sorgu oluştur
  const promises = Array(concurrentQueries).fill(0).map(async (_, index): Promise<StressTestResult> => {
    const testStartTime = Date.now();
    const testId = index + 1;
    
    try {
      // Farklı tipte sorgular yaparak gerçekçi test
      let result;
      let recordCount = 0;
      
      switch (index % 5) {
        case 0:
          // Ürün sayısı sorgusu
          result = await prisma.product.count();
          recordCount = result;
          break;
          
        case 1:
          // Koleksiyon listesi
          result = await prisma.collection.findMany({ take: 5 });
          recordCount = result.length;
          break;
          
        case 2:
          // Ürün detayı
          result = await prisma.product.findMany({ 
            take: 3,
            include: { collection: true }
          });
          recordCount = result.length;
          break;
          
        case 3:
          // Alış fiyat kontrolü
          result = await prisma.purchasePriceListDetail.findMany({ take: 5 });
          recordCount = result.length;
          break;
          
        case 4:
          // Basit sorgu
          result = await prisma.$queryRaw`SELECT ${testId} as test_id, NOW() as test_time`;
          recordCount = 1;
          break;
      }
      
      const duration = Date.now() - testStartTime;
      
      return {
        testId,
        duration,
        success: true,
        recordCount
      };
      
    } catch (error: any) {
      const duration = Date.now() - testStartTime;
      
      return {
        testId,
        duration,
        success: false,
        error: error.message
      };
    }
  });

  // Tüm sorguları eş zamanlı çalıştır
  console.log(`⏳ ${concurrentQueries} eş zamanlı sorgu çalıştırılıyor...`);
  
  const results = await Promise.allSettled(promises);
  const totalDuration = Date.now() - startTime;
  
  // Sonuçları analiz et
  const successResults: StressTestResult[] = [];
  const failedResults: StressTestResult[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        successResults.push(result.value);
      } else {
        failedResults.push(result.value);
      }
    } else {
      failedResults.push({
        testId: index + 1,
        duration: 0,
        success: false,
        error: result.reason?.message || 'Promise rejected'
      });
    }
  });

  // Sonuçları göster
  console.log('\n📊 STRESS TEST SONUÇLARI');
  console.log('=' .repeat(70));
  
  console.log(`🎯 Toplam Sorgu: ${concurrentQueries}`);
  console.log(`✅ Başarılı: ${successResults.length}`);
  console.log(`❌ Başarısız: ${failedResults.length}`);
  console.log(`📊 Başarı Oranı: ${((successResults.length / concurrentQueries) * 100).toFixed(1)}%`);
  console.log(`⏱️ Toplam Süre: ${totalDuration}ms`);
  
  if (successResults.length > 0) {
    const avgDuration = successResults.reduce((sum, r) => sum + r.duration, 0) / successResults.length;
    const minDuration = Math.min(...successResults.map(r => r.duration));
    const maxDuration = Math.max(...successResults.map(r => r.duration));
    
    console.log(`📈 Ortalama Response: ${avgDuration.toFixed(2)}ms`);
    console.log(`⚡ En Hızlı: ${minDuration}ms`);
    console.log(`🐌 En Yavaş: ${maxDuration}ms`);
  }

  // Hata analizi
  if (failedResults.length > 0) {
    console.log('\n❌ HATA ANALİZİ:');
    
    const errorTypes = new Map<string, number>();
    failedResults.forEach(result => {
      const errorKey = result.error?.includes('too many clients') ? 'Connection Limit' :
                      result.error?.includes('timeout') ? 'Timeout' :
                      result.error?.includes('pool') ? 'Pool Error' : 'Other';
      
      errorTypes.set(errorKey, (errorTypes.get(errorKey) || 0) + 1);
    });
    
    errorTypes.forEach((count, errorType) => {
      console.log(`  🔴 ${errorType}: ${count} adet`);
    });
    
    console.log('\nİlk 5 hata detayı:');
    failedResults.slice(0, 5).forEach(result => {
      console.log(`  Test ${result.testId}: ${result.error}`);
    });
  }

  // Performans değerlendirmesi
  console.log('\n🎯 PERFORMANS DEĞERLENDİRMESİ:');
  
  const successRate = (successResults.length / concurrentQueries) * 100;
  
  if (successRate >= 95) {
    console.log('🟢 MÜKEMMEL: Connection pool çok stabil');
  } else if (successRate >= 80) {
    console.log('🟡 İYİ: Connection pool stabil');
  } else if (successRate >= 60) {
    console.log('🟠 ORTA: Connection pool sorunları var');
  } else {
    console.log('🔴 KÖTÜ: Connection pool ciddi sorunlar');
  }

  console.log('\n💡 ÖNERİLER:');
  
  if (successRate < 90) {
    console.log('- Railway Pro plan düşünün');
    console.log('- Connection limit artırın');
    console.log('- Query optimizasyonu yapın');
  } else {
    console.log('- Sistem optimal çalışıyor');
    console.log('- Mevcut ayarlar yeterli');
  }
}

// Script olarak çalıştırılırsa
if (require.main === module) {
  const concurrentQueries = process.argv[2] ? parseInt(process.argv[2]) : 35;
  
  stressTest(concurrentQueries)
    .then(() => {
      console.log('\n🎉 Stress test tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Stress test hatası:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}


