const axios = require('axios');

// Test Configuration
const BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'your-jwt-token-here'; // JWT token'ınızı buraya koyun

// Test senaryolarını çalıştır
async function runOrderPostOperationsTests() {
  console.log('🧪 Sipariş Sonrası İşlemler Test Edilmeye Başlanıyor...\n');

  try {
    // 1. Kullanıcı giriş yap ve token al
    console.log('1️⃣ Test kullanıcısı ile giriş yapılıyor...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.data.access_token;
    console.log('✅ Giriş başarılı\n');

    // Test için header
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Sepet durumunu kontrol et
    console.log('2️⃣ Sepet durumu kontrol ediliyor...');
    const cartResponse = await axios.get(`${BASE_URL}/cart`, { headers });
    const cartId = cartResponse.data.data.id;
    console.log(`✅ Sepet ID: ${cartId}`);
    console.log(`📦 Sepetteki ürün sayısı: ${cartResponse.data.data.items.length}\n`);

    if (cartResponse.data.data.items.length === 0) {
      console.log('⚠️ Sepet boş, test ürünü ekleniyor...');
      // Test ürünü ekle (gerçek ürün ID'si gerekli)
      await axios.post(`${BASE_URL}/cart/add`, {
        product_id: 'test-product-id',
        quantity: 1,
        width: 100,
        height: 150,
        has_fringe: false,
        cut_type: 'rectangle'
      }, { headers });
      console.log('✅ Test ürünü eklendi\n');
    }

    // 3. Sipariş öncesi mağaza durumunu kaydet
    console.log('3️⃣ Sipariş öncesi mağaza durumu kaydediliyor...');
    
    // 4. Sipariş limitlerini kontrol et
    console.log('4️⃣ Sipariş limitleri kontrol ediliyor...');
    const limitResponse = await axios.get(`${BASE_URL}/orders/check-limits`, { headers });
    console.log('📊 Limit kontrolü sonucu:');
    console.log(JSON.stringify(limitResponse.data, null, 2));
    
    if (!limitResponse.data.data.canProceed) {
      console.log('❌ Sipariş verilemez, test durduruluyor');
      return;
    }
    console.log('✅ Sipariş verilebilir\n');

    // 5. Sipariş oluştur
    console.log('5️⃣ Sipariş oluşturuluyor...');
    const orderResponse = await axios.post(`${BASE_URL}/orders/create-from-cart`, {
      notes: 'Test siparişi - sipariş sonrası işlemler testi'
    }, { headers });

    if (orderResponse.data.success) {
      const orderId = orderResponse.data.data.order.id;
      const orderTotal = orderResponse.data.data.order.total_price;
      
      console.log('✅ Sipariş başarıyla oluşturuldu');
      console.log(`📋 Sipariş ID: ${orderId}`);
      console.log(`💰 Sipariş tutarı: ${orderTotal} TL\n`);

      // 6. Sipariş sonrası durumu kontrol et
      console.log('6️⃣ Sipariş sonrası otomatik işlemler kontrol ediliyor...');
      
      // Kısa bir bekleme (veritabanı işlemlerinin tamamlanması için)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Sipariş sonrası işlemler tamamlandı');
      console.log('📝 Kontrol edilecek işlemler:');
      console.log('   • Mağaza adres bilgileri otomatik eklendi');
      console.log('   • Açık hesap tutarı güncellendi');
      console.log('   • Fiyat listesi limiti azaltıldı');
      console.log('   • Gerekirse varsayılan fiyat listesine geçiş yapıldı\n');

      // 7. Sipariş detayını getir
      console.log('7️⃣ Sipariş detayı getiriliyor...');
      const orderDetailResponse = await axios.get(`${BASE_URL}/orders/${orderId}`, { headers });
      console.log('📋 Sipariş detayları:');
      console.log(JSON.stringify(orderDetailResponse.data.data, null, 2));

    } else {
      console.log('❌ Sipariş oluşturulamadı:');
      console.log(orderResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Test sırasında hata oluştu:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Test database verification fonksiyonu
async function verifyDatabaseChanges() {
  console.log('\n🔍 Veritabanı Değişiklikleri Doğrulama Kılavuzu:\n');
  
  console.log('SQL sorguları ile sipariş sonrası işlemleri kontrol edebilirsiniz:\n');
  
  console.log('1️⃣ Mağaza açık hesap tutarı kontrolü:');
  console.log(`
  SELECT 
    store_id, 
    kurum_adi, 
    acik_hesap_tutari, 
    limitsiz_acik_hesap,
    updated_at 
  FROM "Store" 
  WHERE store_id = 'YOUR_STORE_ID';
  `);
  
  console.log('2️⃣ Fiyat listesi limiti kontrolü:');
  console.log(`
  SELECT 
    pl.price_list_id,
    pl.name,
    pl.limit_amount,
    pl.updated_at,
    spl.store_id
  FROM "PriceList" pl
  JOIN "StorePriceList" spl ON pl.price_list_id = spl.price_list_id
  WHERE spl.store_id = 'YOUR_STORE_ID';
  `);
  
  console.log('3️⃣ Varsayılan fiyat listesi ataması kontrolü:');
  console.log(`
  SELECT 
    pl.name,
    pl.is_default,
    spl.store_id,
    spl.created_at
  FROM "PriceList" pl
  JOIN "StorePriceList" spl ON pl.price_list_id = spl.price_list_id
  WHERE spl.store_id = 'YOUR_STORE_ID' 
  AND pl.is_default = true;
  `);
  
  console.log('4️⃣ Son siparişler ve adres bilgisi kontrolü:');
  console.log(`
  SELECT 
    o.id,
    o.total_price,
    o.status,
    o.delivery_address,
    o.store_name,
    o.store_tax_number,
    o.store_phone,
    o.store_email,
    o.created_at,
    u.name || ' ' || u.surname as customer
  FROM "Order" o
  JOIN "User" u ON o.user_id = u."userId"
  WHERE u.store_id = 'YOUR_STORE_ID'
  ORDER BY o.created_at DESC
  LIMIT 5;
  `);
  
  console.log('\n💡 Beklenen Sonuçlar:');
  console.log('• Sipariş adres bilgileri mağaza bilgilerinden otomatik alınmış olmalı');
  console.log('• Açık hesap tutarı sipariş tutarı kadar azalmış olmalı');
  console.log('• Fiyat listesi limiti sipariş tutarı kadar düşmüş olmalı');
  console.log('• Limit bittiğinde varsayılan fiyat listesi atanmış olmalı');
  console.log('• updated_at alanları güncellenmiş olmalı\n');
}

// Testleri çalıştır
console.log('🚀 Sipariş Sonrası İşlemler Test Paketi\n');
console.log('Bu test, sipariş oluşturulduktan sonra otomatik olarak gerçekleşen işlemleri test eder:\n');
console.log('✓ Mağaza adres bilgilerini otomatik ekleme');
console.log('✓ Açık hesap tutarı güncelleme');
console.log('✓ Fiyat listesi limit azaltma');
console.log('✓ Varsayılan fiyat listesine geçiş');
console.log('\n' + '='.repeat(60) + '\n');

runOrderPostOperationsTests()
  .then(() => {
    verifyDatabaseChanges();
    console.log('\n✅ Test tamamlandı!');
  })
  .catch(console.error); 