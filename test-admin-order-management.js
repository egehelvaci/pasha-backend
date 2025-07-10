/**
 * Admin Sipariş Yönetimi Test Dosyası
 * 
 * Bu test dosyası admin sipariş yönetimi özelliklerini test eder:
 * - Sipariş listeleme
 * - Sipariş onaylama (QR kod oluşturma + stok düşürme)  
 * - QR kod okutma
 * - Sipariş teslim etme
 */

console.log('🔧 Admin Sipariş Yönetimi Test Sistemi')
console.log('=====================================')

// Test adımları:
console.log(`
TEST ADIMLARI:
1. Admin token al (admin kullanıcısı ile giriş yap)
2. Siparişleri listele
3. Bekleyen bir sipariş seç
4. Siparişi onayla (QR kodlar oluştur + stok düşür)
5. QR kodları okut
6. Sipariş durumunu kontrol et

GEREKLI BILGILER:
- Admin kullanıcı bilgileri
- Mevcut sipariş ID'leri
- Base URL: http://localhost:3000 (veya Railway URL)
`)

console.log('\n🔐 ADMİN TOKEN ALMA:')
console.log(`
curl -X POST "http://localhost:3000/api/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "admin_username",
    "password": "admin_password"
  }'
`)

console.log('\n📋 1. SİPARİŞLERİ LİSTELE:')
console.log(`
curl -X GET "http://localhost:3000/api/admin/orders?page=1&limit=10&status=PENDING" \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Response'dan sipariş ID'sini not edin
`)

console.log('\n📄 2. SİPARİŞ DETAYLARINI GETİR:')
console.log(`
curl -X GET "http://localhost:3000/api/admin/orders/ORDER_ID" \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Sipariş durumunun PENDING olduğunu kontrol edin
`)

console.log('\n✅ 3. SİPARİŞİ ONAYLA (QR KOD OLUŞTUR + STOK DÜŞÜR):')
console.log(`
curl -X POST "http://localhost:3000/api/admin/orders/ORDER_ID/confirm" \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Beklenen sonuç:
# - QR kodlar oluşturulur
# - Stoklar düşürülür  
# - Sipariş durumu CONFIRMED olur
`)

console.log('\n📱 4. QR KODLARI LİSTELE:')
console.log(`
curl -X GET "http://localhost:3000/api/admin/orders/ORDER_ID/qrcodes" \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Response'dan QR kod string'lerini not edin
`)

console.log('\n🔍 5. QR KOD OKUT:')
console.log(`
# Her QR kodu tek tek okutun:
curl -X POST "http://localhost:3000/api/admin/scan-qr" \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"qrCode": "PASHA-1641234567890-ABC123DEF456"}'

# Son QR kod okunduğunda sipariş otomatik DELIVERED olur
`)

console.log('\n📊 6. SİPARİŞ İSTATİSTİKLERİ:')
console.log(`
curl -X GET "http://localhost:3000/api/admin/orders/stats" \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
`)

console.log('\n🏷️ 7. SİPARİŞ DURUMUNU MANUEL GÜNCELLE (OPSİYONEL):')
console.log(`
curl -X PUT "http://localhost:3000/api/admin/orders/ORDER_ID/status" \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"status": "SHIPPED"}'
`)

console.log('\n🔍 DOĞRULAMA SORGURLARI:')
console.log(`
# QR kodların oluştuğunu kontrol et:
SELECT * FROM "QRCode" WHERE order_id = 'YOUR_ORDER_ID';

# Stokların düştüğünü kontrol et:
SELECT * FROM productvariations WHERE product_id IN (
  SELECT product_id FROM "OrderItem" WHERE order_id = 'YOUR_ORDER_ID'
);

# Sipariş durumunu kontrol et:
SELECT id, status, updated_at FROM "Order" WHERE id = 'YOUR_ORDER_ID';
`)

console.log('\n❌ HATA SENARYOLARI TESTİ:')
console.log(`
# 1. Geçersiz QR kod okutma:
curl -X POST "http://localhost:3000/api/admin/scan-qr" \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"qrCode": "INVALID_QR_CODE"}'

# 2. Aynı QR kodu iki kez okutma:
# (Önce geçerli bir QR kod okutun, sonra aynısını tekrar okutun)

# 3. PENDING olmayan siparişi onaylama:
# (Zaten onaylanmış bir siparişi tekrar onaylamaya çalışın)
`)

console.log('\n🧪 COMPLETEٍ TEST SENARYOSU:')
console.log(`
1. Admin olarak giriş yap
2. Yeni bir sipariş oluştur (normal kullanıcı ile)
3. Admin panel ile siparişi listele 
4. Siparişi onayla
5. Tüm QR kodları okut
6. Siparişin DELIVERED durumuna geçtiğini kontrol et
`)

console.log('\n✨ Test tamamlandığında beklenen sonuçlar:')
console.log(`
- ✅ Sipariş durumu: PENDING → CONFIRMED → DELIVERED
- ✅ QR kodlar oluşturulmuş ve okunmuş
- ✅ Stoklar düşürülmüş
- ✅ İstatistikler güncellenmiş
`)

console.log('\n📝 Notlar:')
console.log(`
- Bu testleri gerçek verilerle yapmadan önce test ortamında deneyin
- QR kodlar benzersizdir ve tekrar kullanılamaz
- Stok düşürme işlemi geri alınamaz
- Admin yetkileri gereklidir
`)

// Admin token almak için login helper fonksiyonu
async function getAdminToken() {
  console.log('\n🔑 Admin token alma örneği:')
  
  const loginData = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  }
  
  console.log(`
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${JSON.stringify(loginData, null, 2)})
})

const data = await response.json()
const token = data.data.token
console.log('Admin Token:', token)
`)
}

// Test ortamı kontrolü
function checkEnvironment() {
  console.log('\n🌍 Test Ortamı Kontrolü:')
  console.log(`
- API Server: ${process.env.API_URL || 'http://localhost:3000'}
- Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}
- Admin User: ${process.env.ADMIN_USERNAME || 'Varsayılan kullanılacak'}
`)
}

getAdminToken()
checkEnvironment()

console.log('\n🚀 Test başlatmak için yukarıdaki curl komutlarını sırayla çalıştırın!') 