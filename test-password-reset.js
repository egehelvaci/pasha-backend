const axios = require('axios');

// API base URL
const API_URL = 'http://localhost:3001/api/auth';

async function testPasswordResetAPI() {
  console.log('🔐 Şifre Sıfırlama API Testi Başlıyor...\n');

  try {
    // 1. Şifre sıfırlama talebi gönder
    console.log('1️⃣ Şifre sıfırlama talebi gönderiliyor...');
    const resetRequest = await axios.post(`${API_URL}/forgot-password`, {
      email: 'egehelvaci@gmail.com' // Gerçek email adresi
    });
    
    console.log('✅ Şifre sıfırlama talebi başarılı:');
    console.log(resetRequest.data);
    console.log('');

    // 2. Geçersiz email ile test
    console.log('2️⃣ Geçersiz email ile test...');
    try {
      await axios.post(`${API_URL}/forgot-password`, {
        email: 'gecersiz-email'
      });
    } catch (error) {
      console.log('✅ Geçersiz email hatası yakalandı:');
      console.log(error.response.data);
      console.log('');
    }

    // 3. Boş email ile test
    console.log('3️⃣ Boş email ile test...');
    try {
      await axios.post(`${API_URL}/forgot-password`, {});
    } catch (error) {
      console.log('✅ Boş email hatası yakalandı:');
      console.log(error.response.data);
      console.log('');
    }

    // 4. Geçersiz token doğrulama testi
    console.log('4️⃣ Geçersiz token doğrulama testi...');
    try {
      await axios.get(`${API_URL}/validate-reset-token/gecersiz-token`);
    } catch (error) {
      console.log('✅ Geçersiz token hatası yakalandı:');
      console.log(error.response.data);
      console.log('');
    }

    // 5. Geçersiz şifre sıfırlama testi
    console.log('5️⃣ Geçersiz şifre sıfırlama testi...');
    try {
      await axios.post(`${API_URL}/reset-password`, {
        token: 'gecersiz-token',
        newPassword: '123456',
        confirmPassword: '123456'
      });
    } catch (error) {
      console.log('✅ Geçersiz token ile şifre sıfırlama hatası yakalandı:');
      console.log(error.response.data);
      console.log('');
    }

    // 6. Şifre eşleşmeme testi
    console.log('6️⃣ Şifre eşleşmeme testi...');
    try {
      await axios.post(`${API_URL}/reset-password`, {
        token: 'gecersiz-token',
        newPassword: '123456',
        confirmPassword: '654321'
      });
    } catch (error) {
      console.log('✅ Şifre eşleşmeme hatası yakalandı:');
      console.log(error.response.data);
      console.log('');
    }

    console.log('🎉 Tüm testler tamamlandı!');
    console.log('\n📝 Gerçek test için:');
    console.log('1. .env dosyasında Gmail App Password\'ü ayarlayın');
    console.log('2. Veritabanında egehelvaci@gmail.com email\'li bir kullanıcı oluşturun');
    console.log('3. API\'yi test edin ve email\'den gelen token ile şifre sıfırlayın');

  } catch (error) {
    console.error('❌ Test sırasında hata oluştu:', error.message);
    if (error.response) {
      console.error('Hata detayı:', error.response.data);
    }
  }
}

// Test fonksiyonunu çalıştır
testPasswordResetAPI(); 