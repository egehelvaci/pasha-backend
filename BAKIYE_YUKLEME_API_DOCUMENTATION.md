# Mağaza Bakiye Yükleme Sistemi - API Dokümantasyonu

## Proje Özeti

Bu doküman, Pasha Backend sisteminin mağaza bakiye yükleme sistemi API dokümantasyonunu içerir. Sistem, sipariş sisteminden bağımsız olarak çalışır ve Octet Ortak Ödeme Sayfası API'si ile entegre edilmiştir.

### Amaç
- Mağaza bakiyelerini güvenli bir şekilde yüklemek
- Admin'in herhangi bir mağaza için bakiye yükleyebilmesi
- Mağaza sahiplerinin kendi bakiyelerini yükleyebilmesi
- Otomatik mağaza bilgisi çekimi (frontend'te form doldurmaya gerek yok)
- Ödeme işlemi sonrası otomatik bakiye güncelleme

### Özellikler
- ✅ Sipariş sisteminden bağımsız
- ✅ Otomatik mağaza bilgisi çekimi
- ✅ Admin ve mağaza kullanıcısı ayrı endpoint'leri
- ✅ secretKey backend'de gizli tutulur
- ✅ Ödeme sonrası otomatik bakiye artırma
- ✅ Ödeme geçmişi takibi

---

## Konfigürasyon

### Çevre Değişkenleri (.env)

```env
# Octet Ödeme API Konfigürasyonu
OCTET_API_URL="https://test-api.octet.com.tr/commonPaymentPage"
OCTET_PARTNER_CODE="YOUR_OCTET_PARTNER_CODE"
OCTET_SECRET_KEY="YOUR_OCTET_SECRET_KEY"

# Frontend URL (callback için)
FRONTEND_URL="http://localhost:3000"
PUBLIC_URL="http://localhost:3001"
```

---

## API Endpoint'leri

### Base URL
- **Local**: `http://localhost:3001/api/v1/payment`
- **Production**: `https://your-domain.com/api/v1/payment`

### Admin Endpoint'leri
- **Base URL**: `http://localhost:3001/api/admin/payment`

---

## 1. Mağaza Listesi (Admin)

**Endpoint**: `GET /api/v1/payment/stores`  
**Auth**: Admin gerekli

### Request
```http
GET /api/v1/payment/stores
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "store_id": "abc123-def456-789",
      "kurum_adi": "ABC Halı Mağazası",
      "vergi_numarasi": "1234567890",
      "vergi_dairesi": "Kadıköy Vergi Dairesi",
      "tckn": null,
      "yetkili_adi": "Ahmet",
      "yetkili_soyadi": "Yılmaz",
      "telefon": "00905551234567",
      "eposta": "ahmet@abchali.com",
      "adres": "İstanbul Kadıköy ...",
      "bakiye": 15000.50
    }
  ],
  "message": "25 aktif mağaza bulundu"
}
```

---

## 2. Mağaza Bilgisi Getirme (Admin)

**Endpoint**: `GET /api/v1/payment/stores/:storeId`  
**Auth**: Admin gerekli

### Request
```http
GET /api/v1/payment/stores/abc123-def456-789
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "store_id": "abc123-def456-789",
    "kurum_adi": "ABC Halı Mağazası",
    "vergi_numarasi": "1234567890",
    "vergi_dairesi": "Kadıköy Vergi Dairesi",
    "yetkili_adi": "Ahmet",
    "yetkili_soyadi": "Yılmaz",
    "telefon": "00905551234567",
    "eposta": "ahmet@abchali.com",
    "adres": "İstanbul Kadıköy Moda Mahallesi...",
    "bakiye": 15000.50
  }
}
```

---

## 3. Admin Bakiye Yükleme

**Endpoint**: `POST /api/v1/payment/admin/initiate`  
**Auth**: Admin gerekli

### Request
```http
POST /api/v1/payment/admin/initiate
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "storeId": "abc123-def456-789",
  "amount": 5000,
  "description": "İlk bakiye yüklemesi"
}
```

### Request Body Validasyonu
- `storeId`: **Zorunlu** - Mağaza ID'si
- `amount`: **Zorunlu** - 10-100,000 TL arası
- `description`: Opsiyonel - Açıklama

### Response (200 OK)
```json
{
  "success": true,
  "paymentUrl": "https://test-api.octet.com.tr/commonPaymentPage?token=abc123...",
  "paymentReference": "BALANCE-abc123de-1738091234567",
  "storeInfo": {
    "store_id": "abc123-def456-789",
    "kurum_adi": "ABC Halı Mağazası",
    "currentBalance": 15000.50
  },
  "message": "Ödeme sayfası başarıyla oluşturuldu"
}
```

---

## 4. Mağaza Sahibi Bakiye Yükleme

**Endpoint**: `POST /api/v1/payment/store/initiate`  
**Auth**: Store User gerekli

### Request
```http
POST /api/v1/payment/store/initiate
Authorization: Bearer <STORE_USER_JWT_TOKEN>
Content-Type: application/json

{
  "amount": 2000,
  "description": "Aylık bakiye yüklemesi"
}
```

### Request Body Validasyonu
- `amount`: **Zorunlu** - 10-50,000 TL arası (mağaza kullanıcıları için daha düşük limit)
- `description`: Opsiyonel - Açıklama

### Response (200 OK)
```json
{
  "success": true,
  "paymentUrl": "https://test-api.octet.com.tr/commonPaymentPage?token=def456...",
  "paymentReference": "BALANCE-abc123de-1738091234568",
  "storeInfo": {
    "store_id": "abc123-def456-789",
    "kurum_adi": "ABC Halı Mağazası",
    "currentBalance": 15000.50
  },
  "message": "Ödeme sayfası başarıyla oluşturuldu"
}
```

---

## 5. Ödeme Callback (Octet'ten gelen)

**Endpoint**: `POST /api/v1/payment/callback`  
**Auth**: Gerekli değil (Octet'ten gelen istek)

Bu endpoint Octet tarafından otomatik olarak çağrılır:

1. Octet bu endpoint'e callback gönderir
2. Callback verisi veritabanına kaydedilir
3. Kullanıcı frontend'e yönlendirilir: `${FRONTEND_URL}/admin/bakiye-yukleme/sonuc?paymentRef=${paymentReference}`

### Octet'ten Gelen Veriler
```json
{
  "resultStatus": "SUCCESS",
  "resultData": "...",
  "apiReferenceID": "BALANCE-abc123de-1738091234567-1738091234999",
  "amount": "5000.00",
  "currency": "TL"
}
```

### Yanıt
```http
HTTP/1.1 302 Found
Location: http://localhost:3000/admin/bakiye-yukleme/sonuc?paymentRef=BALANCE-abc123de-1738091234567
```

---

## 6. Ödeme Durumu Sorgulama

**Endpoint**: `GET /api/v1/payment/status/:paymentReference`  
**Auth**: Gerekli (JWT Token)

### Request
```http
GET /api/v1/payment/status/BALANCE-abc123de-1738091234567
Authorization: Bearer <JWT_TOKEN>
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "paymentReference": "BALANCE-abc123de-1738091234567",
    "status": "SUCCESS",
    "message": "Ödeme başarıyla doğrulandı",
    "storeId": "abc123-def456-789",
    "amount": 5000,
    "paymentDetails": {
      "resultStatus": "SUCCESS",
      "amount": "5000.00",
      "currency": "TL",
      "transactionId": "TXN123456789"
    }
  }
}
```

### Status Değerleri
- **SUCCESS**: Ödeme başarılı, bakiye artırıldı
- **ERROR**: Ödeme başarısız
- **PENDING**: Ödeme beklemede
- **CALLBACK_RECEIVED**: Callback alındı, doğrulama yapılıyor

---

## 7. Ödeme Geçmişi

**Endpoint**: `GET /api/v1/payment/history/:storeId`  
**Auth**: Admin veya ilgili mağaza kullanıcısı

### Request
```http
GET /api/v1/payment/history/abc123-def456-789?limit=10
Authorization: Bearer <JWT_TOKEN>
```

### Query Parameters
- `limit`: Kayıt sayısı (default: 20, max: 100)

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "payment-uuid-1",
      "paymentReference": "BALANCE-abc123de-1738091234567",
      "amount": 5000,
      "status": "SUCCESS",
      "description": "Admin tarafından bakiye yükleme (5000 TL)",
      "createdAt": "2025-01-29T10:30:00Z",
      "finalizedAt": "2025-01-29T10:35:00Z"
    },
    {
      "id": "payment-uuid-2",
      "paymentReference": "BALANCE-abc123de-1738091234568",
      "amount": 2000,
      "status": "SUCCESS",
      "description": "Aylık bakiye yüklemesi",
      "createdAt": "2025-01-28T15:20:00Z",
      "finalizedAt": "2025-01-28T15:25:00Z"
    }
  ],
  "message": "2 ödeme kaydı bulundu"
}
```

---

## Kullanıcı Akışları

### 1. Admin Bakiye Yükleme Akışı

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as Backend API
    participant O as Octet API
    participant DB as Database

    A->>API: GET /stores (mağaza listesi)
    API->>A: Mağaza listesi

    A->>API: GET /stores/:id (mağaza seç)
    API->>A: Mağaza detayları

    A->>API: POST /admin/initiate (tutar, açıklama)
    API->>DB: Store bilgilerini çek
    API->>O: CREATE_COMMON_PAYMENT_PAGE_REQUEST
    O->>API: commonPaymentPageURL
    API->>A: paymentUrl + paymentReference

    A->>O: Ödeme sayfasına git
    O->>API: POST /callback
    API->>DB: Callback kaydet
    API->>A: Frontend'e yönlendir

    A->>API: GET /status/:ref (periyodik kontrol)
    API->>O: GET_COMMON_PAYMENT_REQUEST
    O->>API: Final status
    API->>DB: Bakiye artır (SUCCESS ise)
    API->>A: Sonuç göster
```

### 2. Mağaza Kullanıcısı Bakiye Yükleme

```mermaid
sequenceDiagram
    participant S as Store User
    participant API as Backend API
    participant O as Octet API
    participant DB as Database

    S->>API: POST /store/initiate (tutar)
    API->>DB: JWT'den store_id çek
    API->>DB: Store bilgilerini çek
    API->>O: CREATE_COMMON_PAYMENT_PAGE_REQUEST
    O->>API: commonPaymentPageURL
    API->>S: paymentUrl + paymentReference

    Note over S,O: Ödeme işlemi devam eder...
    Note over API,DB: Başarılı ödeme sonrası bakiye otomatik artar
```

---

## Veritabanı Şeması

### Payment Modeli

```sql
CREATE TABLE "payments" (
  "id" TEXT PRIMARY KEY,
  "store_id" UUID NOT NULL REFERENCES "Store"("store_id"),
  "payment_reference" TEXT UNIQUE NOT NULL,
  "api_reference_id" TEXT UNIQUE NOT NULL,
  "total_amount" DECIMAL(12,2) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'INITIATED',
  "payment_type" TEXT NOT NULL DEFAULT 'BALANCE_TOP_UP',
  "description" TEXT,
  "octet_response" JSONB,
  "callback_data" JSONB,
  "final_response" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "callback_time" TIMESTAMP,
  "finalized_at" TIMESTAMP
);
```

### Payment Status Enum

```typescript
enum PaymentStatus {
  INITIATED         // Ödeme başlatıldı
  CALLBACK_RECEIVED // Callback alındı
  SUCCESS          // Ödeme başarılı
  ERROR            // Ödeme başarısız
  PENDING          // Beklemede
}

enum PaymentType {
  BALANCE_TOP_UP    // Bakiye yükleme
  ORDER_PAYMENT     // Sipariş ödemesi (gelecekte)
  REFUND           // İade (gelecekte)
}
```

---

## Hata Kodları ve Mesajları

| HTTP Status | Mesaj | Açıklama |
|-------------|-------|----------|
| **200** | Başarılı işlem | Tüm işlemler başarılı |
| **400** | Geçersiz tutar | Tutar 10-100,000 TL aralığında değil |
| **401** | Kimlik doğrulama gerekli | JWT token yok veya geçersiz |
| **403** | Yetkisiz erişim | Admin/Store User yetkisi gerekli |
| **404** | Mağaza bulunamadı | Geçersiz storeId |
| **500** | Sunucu hatası | API bağlantı sorunu, veritabanı hatası |

### Özel Hata Mesajları

```json
{
  "success": false,
  "message": "Minimum yükleme tutarı 10 TL'dir"
}

{
  "success": false,
  "message": "Maksimum yükleme tutarı 100.000 TL'dir"
}

{
  "success": false,
  "message": "Bu işlem için admin yetkisi gerekli"
}

{
  "success": false,
  "message": "Mağaza kullanıcıları için maksimum yükleme tutarı 50.000 TL'dir"
}
```

---

## Test Senaryoları

### 1. Admin Bakiye Yükleme Testi

```bash
# 1. Mağaza listesi al
curl -X GET "http://localhost:3001/api/v1/payment/stores" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# 2. Specific mağaza bilgisi
curl -X GET "http://localhost:3001/api/v1/payment/stores/STORE_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# 3. Bakiye yükleme başlat
curl -X POST "http://localhost:3001/api/v1/payment/admin/initiate" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "STORE_ID",
    "amount": 5000,
    "description": "Test bakiye yüklemesi"
  }'

# 4. Ödeme durumu sorgula
curl -X GET "http://localhost:3001/api/v1/payment/status/PAYMENT_REFERENCE" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 2. Mağaza Kullanıcısı Bakiye Yükleme

```bash
# Mağaza kullanıcısı bakiye yükleme
curl -X POST "http://localhost:3001/api/v1/payment/store/initiate" \
  -H "Authorization: Bearer YOUR_STORE_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2000,
    "description": "Aylık bakiye yüklemesi"
  }'

# Ödeme geçmişi
curl -X GET "http://localhost:3001/api/v1/payment/history/YOUR_STORE_ID?limit=10" \
  -H "Authorization: Bearer YOUR_STORE_USER_JWT_TOKEN"
```

---

## Güvenlik

### 1. Hassas Bilgiler
- ✅ **secretKey** asla frontend'e gönderilmez
- ✅ **partnerCode** client-side'da kullanılmaz
- ✅ Mağaza bilgileri otomatik çekilir
- ✅ Alıcı bilgileri backend'de oluşturulur

### 2. Yetkilendirme
- Admin: Tüm mağazalar için bakiye yükleyebilir
- Store User: Sadece kendi mağazası için bakiye yükleyebilir
- Ödeme geçmişi: Sadece yetkili kullanıcılar görebilir

### 3. Doğrulama
- Tutar limitleri (admin: 100K, store: 50K)
- Minimum tutar kontrolü (10 TL)
- Mağaza varlık kontrolü
- S2S ödeme doğrulaması

---

## Frontend Entegrasyonu

### 1. Admin Panel Akışı

```javascript
// 1. Mağaza listesi getir
const stores = await fetch('/api/v1/payment/stores', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});

// 2. Mağaza seç ve bakiye yükle
const result = await fetch('/api/v1/payment/admin/initiate', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    storeId: selectedStoreId,
    amount: 5000,
    description: 'İlk bakiye yüklemesi'
  })
});

// 3. Ödeme sayfasına yönlendir
window.location.href = result.paymentUrl;

// 4. Callback sonrası durum kontrolü
const status = await fetch(`/api/v1/payment/status/${paymentReference}`, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
```

### 2. Mağaza Panel Akışı

```javascript
// Mağaza kullanıcısı bakiye yükleme
const result = await fetch('/api/v1/payment/store/initiate', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${storeToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 2000,
    description: 'Aylık bakiye yüklemesi'
  })
});

// Ödeme sayfasına yönlendir
window.location.href = result.paymentUrl;
```

---

## Monitoring ve Loglama

### Log Örnekleri

```typescript
// Başarılı bakiye yükleme
🚀 Bakiye yükleme başlatılıyor: abc123-def456-789 5000
📤 Octet API'ye gönderilecek parametreler: { ... }
📥 Octet API yanıtı: { commonPaymentPageURL: "..." }
💾 Ödeme kaydı başarıyla saklandı: BALANCE-abc123de-1738091234567

// Callback işleme
📞 Ödeme callback alındı: BALANCE-abc123de-1738091234567-1738091234999
🔄 Kullanıcı frontend'e yönlendiriliyor: .../sonuc?paymentRef=...

// Başarılı ödeme
🔍 Ödeme durumu sorgulanıyor: BALANCE-abc123de-1738091234567
✅ Mağaza bakiyesi güncellendi: abc123-def456-789 + 5000 TL
```

---

## Production Deployment

### 1. Çevre Değişkenleri
```env
# Production Octet API
OCTET_API_URL="https://api.octet.com.tr/commonPaymentPage"
OCTET_PARTNER_CODE="PRODUCTION_PARTNER_CODE"
OCTET_SECRET_KEY="PRODUCTION_SECRET_KEY"

# Production URLs
FRONTEND_URL="https://yoursite.com"
PUBLIC_URL="https://api.yoursite.com"
```

### 2. Güvenlik
- HTTPS callback URL'leri
- Rate limiting
- Request validation
- SQL injection protection

### 3. İzleme
- Payment success/failure rates
- Response time monitoring
- Error tracking
- Balance update audit logs

---

## Gelecek Geliştirmeler

### Planlanmış Özellikler

1. **Otomatik Bakiye Yükleme**
   - Minimum bakiye altında otomatik uyarı
   - Scheduled bakiye yükleme

2. **Bulk İşlemler**
   - Çoklu mağaza bakiye yükleme
   - CSV import/export

3. **Gelişmiş Raporlama**
   - Aylık bakiye raporları
   - Ödeme trend analizi

4. **Webhook Entegrasyonu**
   - Slack/Teams bildirimleri
   - Email otomasyonu

---

**Doküman Versiyonu**: 2.0  
**Son Güncelleme**: 29 Ocak 2025  
**Hazırlayan**: Backend Development Team 