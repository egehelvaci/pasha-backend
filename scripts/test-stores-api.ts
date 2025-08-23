import fetch from 'node-fetch';

async function testStoresAPI() {
  try {
    console.log('🔍 /api/stores endpoint test ediliyor...');
    
    // Test için admin token gerekiyor, basit bir test yapalım
    const response = await fetch('http://localhost:3001/api/stores', {
      headers: {
        'Authorization': 'Bearer test-token' // Gerçek token gerekecek
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response alındı');
      console.log('📊 Store count:', data.count);
      
      if (data.data && data.data.length > 0) {
        const firstStore = data.data[0];
        console.log('🏪 İlk mağaza örneği:');
        console.log('- Store ID:', firstStore.store_id);
        console.log('- Kurum Adı:', firstStore.kurum_adi);
        console.log('- Store Type:', firstStore.store_type || 'YOK!');
        
        if (firstStore.store_type) {
          console.log('✅ store_type alanı mevcut:', firstStore.store_type);
        } else {
          console.log('❌ store_type alanı eksik!');
        }
      }
    } else {
      console.log('❌ API Error:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

testStoresAPI();
