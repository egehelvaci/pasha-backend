const axios = require('axios');

// Railway test konfigürasyonu
const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_ENDPOINT = `${BASE_URL}/api/catalog/generate`;

async function testRailwayCatalogPerformance() {
  console.log('🚀 Railway katalog performans testi başlıyor...');
  console.log(`Test URL: ${TEST_ENDPOINT}`);
  
  const startTime = Date.now();
  
  try {
    // Railway test verisi (küçük dataset)
    const testData = {
      companyName: "Railway Test Şirketi",
      productIds: [] // Boş = tüm ürünler (max 50 ile sınırlı)
    };
    
    console.log('📤 Railway katalog oluşturma isteği gönderiliyor...');
    console.log('⚠️ Railway limitleri: Max 50 ürün, 5 dakika timeout');
    
    const response = await axios.post(TEST_ENDPOINT, testData, {
      timeout: 300000, // Railway için 5 dakika timeout
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Railway-Test-Client'
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const pdfSize = response.data.length;
    
    console.log('✅ Railway katalog başarıyla oluşturuldu!');
    console.log(`⏱️  Toplam süre: ${duration}ms (${(duration / 1000).toFixed(2)} saniye)`);
    console.log(`📄 PDF boyutu: ${(pdfSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`🚀 Performans: ${(pdfSize / duration * 1000 / 1024).toFixed(2)} KB/s`);
    
    // PDF'i kaydet
    const fs = require('fs');
    const filename = `railway-catalog-${Date.now()}.pdf`;
    fs.writeFileSync(filename, response.data);
    console.log(`💾 Railway PDF kaydedildi: ${filename}`);
    
    // Railway performans değerlendirmesi
    if (duration < 30000) {
      console.log('🎉 Railway için mükemmel performans! (< 30 saniye)');
    } else if (duration < 60000) {
      console.log('✅ Railway için iyi performans (30-60 saniye)');
    } else if (duration < 120000) {
      console.log('⚠️  Railway için orta performans (1-2 dakika)');
    } else if (duration < 300000) {
      console.log('🐌 Railway için yavaş performans (2-5 dakika)');
    } else {
      console.log('❌ Railway timeout riski (> 5 dakika)');
    }
    
    // Railway memory ve boyut analizi
    if (pdfSize > 50 * 1024 * 1024) {
      console.log('⚠️ Büyük PDF boyutu - Railway memory sorununa neden olabilir');
    }
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('❌ Railway test başarısız!');
    console.error(`⏱️  Hata süresi: ${duration}ms`);
    
    if (error.code === 'ECONNABORTED') {
      console.error('🕐 Railway timeout hatası - İşlem 5 dakikayı aştı');
      console.error('💡 Çözüm önerileri:');
      console.error('   - Ürün sayısını azaltın');
      console.error('   - Resim boyutlarını küçültün');
      console.error('   - Memory optimizasyonu yapın');
    } else if (error.response) {
      console.error(`📡 Railway HTTP Hatası: ${error.response.status}`);
      console.error(`📝 Hata mesajı:`, error.response.data);
      
      if (error.response.status === 502) {
        console.error('🚨 502 Gateway Error - Railway sunucu sorunu');
        console.error('💡 Çözüm önerileri:');
        console.error('   - Memory kullanımını kontrol edin');
        console.error('   - Browser instance optimize edin');
        console.error('   - Timeout ayarlarını kontrol edin');
      }
    } else {
      console.error(`🔥 Railway genel hata: ${error.message}`);
    }
    
    console.error('\n🔧 Railway Debug Bilgileri:');
    console.error(`   - Test URL: ${TEST_ENDPOINT}`);
    console.error(`   - Timeout: 5 dakika`);
    console.error(`   - Max ürün: 50`);
    console.error(`   - Memory limit: 512MB`);
  }
}

// Railway test'i çalıştır
testRailwayCatalogPerformance(); 