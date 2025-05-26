const axios = require('axios');

// Test konfigürasyonu
const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_ENDPOINT = `${BASE_URL}/api/catalog/generate`;

async function testCatalogPerformance() {
  console.log('🚀 Katalog performans testi başlıyor...');
  console.log(`Test URL: ${TEST_ENDPOINT}`);
  
  const startTime = Date.now();
  
  try {
    // Test verisi
    const testData = {
      companyName: "Test Şirketi",
      // productIds: [] // Boş bırakarak tüm ürünleri test et
    };
    
    console.log('📤 Katalog oluşturma isteği gönderiliyor...');
    
    const response = await axios.post(TEST_ENDPOINT, testData, {
      timeout: 600000, // 10 dakika timeout
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const pdfSize = response.data.length;
    
    console.log('✅ Katalog başarıyla oluşturuldu!');
    console.log(`⏱️  Toplam süre: ${duration}ms (${(duration / 1000).toFixed(2)} saniye)`);
    console.log(`📄 PDF boyutu: ${(pdfSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`🚀 Performans: ${(pdfSize / duration * 1000 / 1024).toFixed(2)} KB/s`);
    
    // PDF'i kaydet
    const fs = require('fs');
    const filename = `test-catalog-${Date.now()}.pdf`;
    fs.writeFileSync(filename, response.data);
    console.log(`💾 PDF kaydedildi: ${filename}`);
    
    // Performans değerlendirmesi
    if (duration < 30000) {
      console.log('🎉 Mükemmel performans! (< 30 saniye)');
    } else if (duration < 60000) {
      console.log('✅ İyi performans (30-60 saniye)');
    } else if (duration < 120000) {
      console.log('⚠️  Orta performans (1-2 dakika)');
    } else {
      console.log('❌ Yavaş performans (> 2 dakika)');
    }
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('❌ Test başarısız!');
    console.error(`⏱️  Hata süresi: ${duration}ms`);
    
    if (error.code === 'ECONNABORTED') {
      console.error('🕐 Timeout hatası - İşlem çok uzun sürdü');
    } else if (error.response) {
      console.error(`📡 HTTP Hatası: ${error.response.status}`);
      console.error(`📝 Hata mesajı: ${error.response.data}`);
    } else {
      console.error(`🔥 Genel hata: ${error.message}`);
    }
  }
}

// Test'i çalıştır
testCatalogPerformance(); 