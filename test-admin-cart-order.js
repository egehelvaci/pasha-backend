const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const ADMIN_TOKEN = 'your-admin-token-here'; // Bu token'ı gerçek admin token ile değiştir

// Test data
const testData = {
  targetUserId: 'test-user-uuid',
  storeId: 'test-store-uuid', 
  notes: 'API test siparişi - admin sepetinden oluşturuldu'
};

async function testCreateOrderFromAdminCart() {
  try {
    console.log('🧪 Admin sepetinden sipariş oluşturma API testi başlatılıyor...\n');
    
    const response = await fetch(`${BASE_URL}/admin/cart/create-order-from-admin-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify(testData)
    });

    const responseData = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📄 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('📝 Response Body:');
    console.log(JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Test BAŞARILI!');
      if (responseData.data?.order) {
        console.log(`📦 Sipariş ID: ${responseData.data.order.id}`);
        console.log(`💰 Toplam Tutar: ${responseData.data.order.total_price} TL`);
        console.log(`👤 Müşteri: ${responseData.data.targetUser.name} ${responseData.data.targetUser.surname}`);
      }
    } else {
      console.log('\n❌ Test BAŞARISIZ!');
      console.log('Hata Detayları:', responseData.message || 'Bilinmeyen hata');
    }
    
  } catch (error) {
    console.log('\n💥 Test sırasında hata oluştu:');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Çözüm önerileri:');
      console.log('1. Sunucunun 3001 portunda çalıştığından emin olun');
      console.log('2. npm run dev veya benzeri komut ile sunucuyu başlatın');
    }
  }
}

// Test fonksiyonları
async function testAddToAdminCart() {
  console.log('\n🧪 Admin sepete ürün ekleme testi...\n');
  
  const addData = {
    targetUserId: 'test-user-uuid',
    storeId: 'test-store-uuid',
    productId: 'test-product-uuid',
    quantity: 2,
    width: 100,
    height: 150,
    hasFringe: false,
    cutType: 'standart',
    notes: 'Test ürünü'
  };

  try {
    const response = await fetch(`${BASE_URL}/admin/cart/add-to-admin-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify(addData)
    });

    const responseData = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(responseData, null, 2));
    
  } catch (error) {
    console.error('Add to cart test error:', error.message);
  }
}

async function testGetAdminCart() {
  console.log('\n🧪 Admin sepet getirme testi...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/admin/cart/test-user-uuid/test-store-uuid`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    const responseData = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(responseData, null, 2));
    
  } catch (error) {
    console.error('Get cart test error:', error.message);
  }
}

// Ana test fonksiyonu
async function runAllTests() {
  console.log('🚀 Admin Sepet API Test Süreci\n');
  console.log('================================\n');
  
  // 1. Sepete ürün ekleme testi
  await testAddToAdminCart();
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
  
  // 2. Sepet getirme testi  
  await testGetAdminCart();
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
  
  // 3. Sipariş oluşturma testi
  await testCreateOrderFromAdminCart();
}

// Testi çalıştır
if (require.main === module) {
  console.log('⚠️  DİKKAT: Bu test scripti çalıştırılmadan önce:');
  console.log('1. ADMIN_TOKEN değişkenini gerçek token ile değiştirin');
  console.log('2. Test veritabanı kullandığınızdan emin olun');
  console.log('3. Geçerli kullanıcı, mağaza ve ürün ID\'leri kullanın\n');
  
  runAllTests();
}

module.exports = {
  testCreateOrderFromAdminCart,
  testAddToAdminCart,
  testGetAdminCart
};