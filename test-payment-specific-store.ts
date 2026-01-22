/**
 * Specific Store Payment Test
 * Belirli bir store için ödeme testi yapar
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const TEST_STORE_ID = 'bd0810ce-79db-421e-a21d-77a0b539bd5c';

async function login(username: string, password: string) {
  console.log('\n🔐 Login işlemi başlatılıyor...');
  console.log('👤 Kullanıcı:', username);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username,
      password
    });
    
    if (response.data.success) {
      console.log('✅ Login başarılı!');
      console.log('👤 Kullanıcı:', response.data.user.name, response.data.user.surname);
      console.log('📧 Email:', response.data.user.email);
      console.log('🏷️  User Type:', response.data.user.userType);
      console.log('🎫 Token alındı');
      
      return {
        success: true,
        token: response.data.token,
        user: response.data.user
      };
    } else {
      console.error('❌ Login başarısız:', response.data.message);
      return { success: false };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Login hatası:', error.response?.data?.message || error.message);
    } else {
      console.error('❌ Login hatası:', error);
    }
    return { success: false };
  }
}

async function getStoreInfo(token: string, storeId: string) {
  console.log('\n📦 Store bilgileri alınıyor...');
  console.log('🏪 Store ID:', storeId);
  
  try {
    const response = await axios.get(`${BASE_URL}/api/stores/${storeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success && response.data.store) {
      const store = response.data.store;
      console.log('✅ Store bilgileri alındı:');
      console.log('  Kurum Adı:', store.kurum_adi);
      console.log('  Vergi No:', store.vergi_numarasi || 'Yok');
      console.log('  Telefon:', store.telefon || 'Yok');
      console.log('  Email:', store.eposta || 'Yok');
      console.log('  Bakiye:', store.bakiye, store.currency || 'TRY');
      console.log('  Currency:', store.currency || 'TRY');
      console.log('  Aktif:', store.is_active ? 'Evet' : 'Hayır');
      return store;
    } else {
      console.log('⚠️  Store bilgisi alınamadı');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Store bilgisi alınamadı:', error.response?.data?.message || error.message);
    } else {
      console.error('❌ Store bilgisi alınamadı:', error);
    }
    return null;
  }
}

async function testPayment(token: string, storeId: string) {
  console.log('\n💳 100 TL Ödeme Testi Başlatılıyor...');
  console.log('🏪 Store ID:', storeId);
  
  try {
    const paymentData = {
      storeId: storeId,
      amount: 100,
      aciklama: 'Test Ödemesi - 100 TL',
      currencyCode: 'TRY'
    };
    
    console.log('\n📝 Payment request detayları:');
    console.log('  Store ID:', paymentData.storeId);
    console.log('  Tutar:', paymentData.amount, 'TL');
    console.log('  Açıklama:', paymentData.aciklama);
    console.log('  Currency:', paymentData.currencyCode);
    
    console.log('\n🚀 Octet API\'ye ödeme isteği gönderiliyor...');
    console.log('⏳ Lütfen bekleyin, bu işlem 30 saniye kadar sürebilir...');
    
    const startTime = Date.now();
    
    const response = await axios.post(
      `${BASE_URL}/api/payments/process`,
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 saniye timeout
      }
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  İstek süresi: ${duration} saniye`);
    
    if (response.data.success) {
      console.log('\n✅ ÖDEMe İSTEĞİ BAŞARILI!');
      console.log('\n📄 Yanıt Detayları:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (response.data.data?.paymentUrl) {
        console.log('💳 Payment URL:', response.data.data.paymentUrl);
      }
      
      if (response.data.data?.sellerReference) {
        console.log('📋 Seller Reference:', response.data.data.sellerReference);
      }
      
      if (response.data.data?.apiReferenceNumber) {
        console.log('🔢 API Reference:', response.data.data.apiReferenceNumber);
      }
      
      if (response.data.data?.amount) {
        console.log('💰 Tutar:', response.data.data.amount, response.data.data?.currencyCode || 'TRY');
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (response.data.data?.paymentUrl) {
        console.log('\n💡 Ödemeyi tamamlamak için bu URL\'yi tarayıcıda açın:');
        console.log('🔗', response.data.data.paymentUrl);
      }
      
      console.log('\n✨ Ödeme sayfası başarıyla oluşturuldu!');
      
      return true;
    } else {
      console.error('\n❌ ÖDEMe İSTEĞİ BAŞARISIZ!');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Hata Mesajı:', response.data.message);
      if (response.data.data) {
        console.error('Detaylar:', JSON.stringify(response.data.data, null, 2));
      }
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ PAYMENT TESTİ BAŞARISIZ!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('🔴 HTTP Status:', error.response.status);
        console.error('🔴 Hata Mesajı:', error.response.data?.message || error.message);
        
        if (error.response.data) {
          console.error('\n📋 Detaylı Hata Bilgisi:');
          console.error(JSON.stringify(error.response.data, null, 2));
        }
      } else if (error.request) {
        console.error('🔴 AĞ HATASI: İstek gönderildi ama yanıt alınamadı');
        console.error('🔴 Bu genellikle şu sebeplerden olur:');
        console.error('   - Sunucu yanıt vermiyor');
        console.error('   - Timeout aşıldı');
        console.error('   - Octet API\'ye bağlanılamıyor');
        console.error('\n🔍 Hata Detayı:', error.message);
        
        if (error.code) {
          console.error('🔍 Hata Kodu:', error.code);
        }
      } else {
        console.error('🔴 İstek Hatası:', error.message);
      }
    } else {
      console.error('🔴 Beklenmeyen Hata:', error);
    }
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return false;
  }
}

async function runTest() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         SPECIFIC STORE PAYMENT TEST                   ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n🎯 Test Store ID: ${TEST_STORE_ID}`);
  
  try {
    // Step 1: Login
    const loginResult = await login('admin44', '123');
    
    if (!loginResult.success || !loginResult.token) {
      console.log('\n⚠️  Login başarısız olduğu için test durduruluyor.');
      process.exit(1);
    }
    
    const token = loginResult.token;
    
    // Step 2: Store bilgilerini al
    await new Promise(resolve => setTimeout(resolve, 1000));
    const store = await getStoreInfo(token, TEST_STORE_ID);
    
    if (!store) {
      console.log('\n⚠️  Store bilgileri alınamadı ama ödeme testi devam edecek...');
    }
    
    // Step 3: Payment testi
    await new Promise(resolve => setTimeout(resolve, 1000));
    const paymentSuccess = await testPayment(token, TEST_STORE_ID);
    
    // Sonuç özeti
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                  TEST SONUCU                           ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('🔐 Login:', loginResult.success ? '✅ BAŞARILI' : '❌ BAŞARISIZ');
    console.log('💳 Payment Test:', paymentSuccess ? '✅ BAŞARILI' : '❌ BAŞARISIZ');
    
    if (loginResult.success && paymentSuccess) {
      console.log('\n🎉 Test başarıyla tamamlandı!');
      console.log('💡 Ödeme URL\'sini tarayıcıda açarak ödemeyi tamamlayabilirsiniz.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Test başarısız oldu.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Test hatası:', error);
    process.exit(1);
  }
}

// Testi çalıştır
runTest();

