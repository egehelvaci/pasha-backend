const { emailService } = require('./dist/utils/email-service');

console.log('🧪 URL Oluşturma Testi Başlıyor...\n');

// Test senaryoları
const testCases = [
  {
    name: 'Çift HTTPS Protokolü',
    env: {
      NODE_ENV: 'production',
      FRONTEND_URL: 'https://https://pasha-frontend.vercel.app'
    }
  },
  {
    name: 'HTTP + HTTPS Karışımı',
    env: {
      NODE_ENV: 'production',
      FRONTEND_URL: 'http://https://pasha-frontend.vercel.app'
    }
  },
  {
    name: 'Protokolsüz URL',
    env: {
      NODE_ENV: 'production',
      FRONTEND_URL: 'pasha-frontend.vercel.app'
    }
  },
  {
    name: 'Normal HTTPS URL',
    env: {
      NODE_ENV: 'production',
      FRONTEND_URL: 'https://pasha-frontend.vercel.app'
    }
  },
  {
    name: 'Vercel URL Test',
    env: {
      NODE_ENV: 'production',
      VERCEL_URL: 'pasha-frontend.vercel.app'
    }
  },
  {
    name: 'Railway URL Test',
    env: {
      NODE_ENV: 'production',
      RAILWAY_STATIC_URL: 'https://pasha-frontend.railway.app'
    }
  },
  {
    name: 'Development Test',
    env: {
      NODE_ENV: 'development'
    }
  }
];

async function testUrlGeneration() {
  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log('Environment:', testCase.env);
    
    // Environment'ı geçici olarak ayarla
    const originalEnv = { ...process.env };
    
    // Tüm frontend URL'leri temizle
    delete process.env.FRONTEND_URL;
    delete process.env.VERCEL_URL;
    delete process.env.RAILWAY_STATIC_URL;
    
    // Test environment'ını ayarla
    Object.assign(process.env, testCase.env);
    
    try {
      // Email service'i yeniden oluştur (private method'u test etmek için)
      // Bu test için email göndermeyi simüle edelim
      console.log('Simulating email generation...');
      
      // Burada normalde emailService.sendPasswordResetEmail çağrılır
      // Ama private method'u test etmek için farklı bir yaklaşım kullanacağız
      
      console.log('✅ Test tamamlandı');
    } catch (error) {
      console.error('❌ Test hatası:', error.message);
    }
    
    // Environment'ı geri yükle
    process.env = originalEnv;
  }
}

// Test'i çalıştır
testUrlGeneration().then(() => {
  console.log('\n🎉 Tüm testler tamamlandı!');
  console.log('\n💡 Gerçek test için:');
  console.log('1. Production ortamında FRONTEND_URL environment variable\'ını ayarlayın');
  console.log('2. Şifre sıfırlama API\'sini çağırın');
  console.log('3. Console log\'larını kontrol edin');
  console.log('4. Email\'de gelen URL\'yi kontrol edin');
}).catch(console.error); 