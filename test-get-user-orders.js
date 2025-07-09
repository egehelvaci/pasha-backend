const axios = require('axios');

// Test Configuration
const BASE_URL = 'http://localhost:3001/api';

// Test senaryolarını çalıştır
async function testGetUserOrders() {
  console.log('🧪 Kullanıcı Sipariş Geçmişi API Test Edilmeye Başlanıyor...\n');

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

    // 2. Kullanıcının tüm siparişlerini getir (ilk sayfa)
    console.log('2️⃣ Kullanıcının tüm siparişleri getiriliyor...');
    const ordersResponse = await axios.get(`${BASE_URL}/orders/my-orders`, { headers });
    
    console.log('📊 Sipariş listesi sonucu:');
    console.log(`✅ Toplam sipariş sayısı: ${ordersResponse.data.data.pagination.total}`);
    console.log(`📋 Bu sayfadaki sipariş sayısı: ${ordersResponse.data.data.orders.length}`);
    console.log(`📄 Sayfa: ${ordersResponse.data.data.pagination.page}/${ordersResponse.data.data.pagination.totalPages}\n`);

    // 3. Siparişleri detaylı göster
    if (ordersResponse.data.data.orders.length > 0) {
      console.log('3️⃣ Sipariş detayları:');
      ordersResponse.data.data.orders.forEach((order, index) => {
        console.log(`\n📦 Sipariş ${index + 1}:`);
        console.log(`   ID: ${order.id}`);
        console.log(`   Durum: ${order.status}`);
        console.log(`   Toplam: ${order.total_price} TL`);
        console.log(`   Tarih: ${new Date(order.created_at).toLocaleString('tr-TR')}`);
        console.log(`   Teslimat Adresi: ${order.delivery_address || 'Belirtilmemiş'}`);
        console.log(`   Mağaza: ${order.store_name || 'Belirtilmemiş'}`);
        console.log(`   Ürün Sayısı: ${order.items?.length || 0}`);
        
        if (order.items && order.items.length > 0) {
          console.log(`   İlk Ürün: ${order.items[0].product?.name || 'N/A'} (${order.items[0].quantity} adet)`);
        }
      });
    } else {
      console.log('📭 Henüz sipariş geçmişi bulunmuyor');
    }

    // 4. Sayfalama testi (2. sayfa)
    if (ordersResponse.data.data.pagination.totalPages > 1) {
      console.log('\n4️⃣ Sayfalama testi - 2. sayfa getiriliyor...');
      const page2Response = await axios.get(`${BASE_URL}/orders/my-orders?page=2&limit=3`, { headers });
      
      console.log(`✅ 2. sayfa getirildi`);
      console.log(`📋 Bu sayfadaki sipariş sayısı: ${page2Response.data.data.orders.length}`);
      console.log(`📄 Sayfa: ${page2Response.data.data.pagination.page}/${page2Response.data.data.pagination.totalPages}`);
    }

    // 5. Limit testi
    console.log('\n5️⃣ Limit testi - sadece 2 sipariş getiriliyor...');
    const limitedResponse = await axios.get(`${BASE_URL}/orders/my-orders?limit=2`, { headers });
    
    console.log(`✅ Limit testi tamamlandı`);
    console.log(`📋 Getirilen sipariş sayısı: ${limitedResponse.data.data.orders.length} (maksimum 2 bekleniyor)`);

    // 6. Belirli bir siparişin detayını getir
    if (ordersResponse.data.data.orders.length > 0) {
      const firstOrderId = ordersResponse.data.data.orders[0].id;
      console.log(`\n6️⃣ Belirli sipariş detayı getiriliyor (ID: ${firstOrderId})...`);
      
      const orderDetailResponse = await axios.get(`${BASE_URL}/orders/${firstOrderId}`, { headers });
      
      console.log('✅ Sipariş detayı başarıyla getirildi');
      console.log(`📋 Sipariş ID: ${orderDetailResponse.data.data.id}`);
      console.log(`💰 Toplam: ${orderDetailResponse.data.data.total_price} TL`);
      console.log(`📦 Ürün sayısı: ${orderDetailResponse.data.data.items?.length || 0}`);
    }

    console.log('\n🎉 Test başarıyla tamamlandı!');

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

// API endpoint'leri ve kullanım örnekleri
function showApiExamples() {
  console.log('\n📚 API Kullanım Örnekleri:\n');
  
  console.log('1️⃣ Tüm siparişleri listele:');
  console.log('GET /api/orders/my-orders');
  console.log('Authorization: Bearer <JWT_TOKEN>\n');
  
  console.log('2️⃣ Sayfalama ile siparişleri getir:');
  console.log('GET /api/orders/my-orders?page=2&limit=5');
  console.log('Authorization: Bearer <JWT_TOKEN>\n');
  
  console.log('3️⃣ Belirli sipariş detayını getir:');
  console.log('GET /api/orders/{orderId}');
  console.log('Authorization: Bearer <JWT_TOKEN>\n');
  
  console.log('📋 Response Yapısı:');
  console.log(`
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order-uuid",
        "total_price": "1250.75",
        "status": "PENDING|CONFIRMED|SHIPPED|DELIVERED|CANCELED",
        "delivery_address": "Teslimat adresi",
        "store_name": "Mağaza adı",
        "store_phone": "Telefon",
        "store_email": "Email",
        "created_at": "2024-01-15T10:30:00.000Z",
        "items": [
          {
            "product_id": "product-uuid",
            "quantity": 2,
            "unit_price": "45.50",
            "total_price": "273.00",
            "product": {
              "name": "Ürün adı",
              "collection": { "name": "Koleksiyon" }
            }
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
  `);
  
  console.log('💡 Önemli Notlar:');
  console.log('• JWT token gereklidir');
  console.log('• Kullanıcı sadece kendi siparişlerini görebilir');
  console.log('• Varsayılan sayfa boyutu: 10, maksimum: 50');
  console.log('• Siparişler en yeni tarihten eskiye sıralanır');
  console.log('• Adres bilgileri sipariş sırasında otomatik eklenir');
}

// Testleri çalıştır
console.log('🚀 Kullanıcı Sipariş Geçmişi API Test Paketi\n');
console.log('Bu test, kullanıcının sipariş geçmişini görüntüleme API\'sini test eder:\n');
console.log('✓ Tüm siparişleri listeleme');
console.log('✓ Sayfalama özelliği');
console.log('✓ Limit kontrolü');
console.log('✓ Sipariş detayı görüntüleme');
console.log('✓ Adres bilgileri kontrolü');
console.log('\n' + '='.repeat(60) + '\n');

testGetUserOrders()
  .then(() => {
    showApiExamples();
    console.log('\n✅ Test paketi tamamlandı!');
  })
  .catch(console.error); 