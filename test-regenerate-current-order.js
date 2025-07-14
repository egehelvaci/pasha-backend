const fetch = require('node-fetch');

// Mevcut sipariş için QR kodları yeniden oluştur
async function regenerateCurrentOrder() {
  const orderId = '3eb3d977-35c6-41e9-a5c5-1c0eaf7c6d35'; // Problemli sipariş
  const apiUrl = `http://localhost:3001/api/admin/orders/${orderId}/regenerate-qr-codes`;
  
  try {
    console.log('🔄 Problemli sipariş için QR kodları yeniden oluşturuluyor...');
    console.log(`📍 Sipariş ID: ${orderId}`);
    console.log(`📍 API URL: ${apiUrl}\n`);
    
    console.log('📊 Mevcut durum:');
    console.log('- 4 farklı item var');
    console.log('- 31 adet toplam ürün (10+10+10+1)');
    console.log('- 31 QR kod mevcut (YANLIŞ!)');
    console.log('');
    console.log('🎯 Beklenen sonuç:');
    console.log('- 4 QR kod olmalı (her item için 1)');
    console.log('- QR kod quantity\'leri: 10, 10, 10, 1');
    console.log('');
    
    // Not: Gerçek kullanımda admin JWT token gerekir
    console.log('⚠️  NOT: Bu API gerçek kullanımda admin JWT token gerektirir');
    console.log('📝 Test etmek için önce auth middleware\'i geçici devre dışı bırakın\n');
    
    console.log('📋 Manuel test adımları:');
    console.log('1. Postman veya curl ile API\'yi çağırın');
    console.log('2. Admin JWT token ekleyin');
    console.log('3. Response\'ta newQRCodeCount: 4 olduğunu kontrol edin');
    console.log('4. /api/admin/orders API\'sini tekrar çağırın');
    console.log('5. QR kod sayısının 4 olduğunu doğrulayın');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

regenerateCurrentOrder(); 