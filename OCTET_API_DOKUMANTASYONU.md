# Octet Entegre Taksitli Arakatman Ödeme Sistemi - API Dokümantasyonu

Bu doküman, Octet Ortak Ödeme Sayfası entegrasyonu ile çalışan taksitli arakatman ödeme sisteminin API endpoint'lerini içerir.

---

## 🔧 Yapılandırma

### Environment Variables

```env
# Octet Ödeme API Konfigürasyonu
OCTET_API_URL="https://test-api.octet.com.tr/commonPaymentPage"
OCTET_PARTNER_CODE="YOUR_OCTET_PARTNER_CODE"
OCTET_SECRET_KEY="YOUR_OCTET_SECRET_KEY"

# Octet Callback URL'i - ödeme sonucu frontend'e yönlendirme için
OCTET_CALLBACK_URL="http://localhost:3000/payment-result"

# Production için
# OCTET_API_URL="https://api.octet.com.tr/commonPaymentPage"
# OCTET_CALLBACK_URL="https://your-production-frontend.com/payment-result"
```

### Callback URL
Sistem artık callback URL'ini environment değişkeninden alır:
- **OCTET_CALLBACK_URL**: Ödeme tamamlandıktan sonra kullanıcının yönlendirileceği frontend sayfası
- **Default değer**: `http://localhost:3000/payment-result`

---

## 🏪 Admin API Endpoint'leri

Tüm admin endpoint'leri JWT authentication ve admin rolü gerektirir.

### Authentication Header
```http
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

### Base URL
- **Admin Endpoints**: `/api/admin/octet`

---

## 👤 User API Endpoint'leri

Normal kullanıcılar için endpoint'ler. JWT authentication gerektirir, mağaza bilgileri otomatik alınır.

### Authentication Header
```http
Authorization: Bearer <USER_JWT_TOKEN>
```

### Base URL
- **User Endpoints**: `/api/user`

---

## 💳 Ödeme İşlemleri

### 1. Ödeme Başlatma

**Endpoint**: `POST /api/admin/octet/payments/initiate`

Admin, mağaza adına ödeme talebi oluşturur.

**Request Body**:
```json
{
  "storeId": "store_001",
  "amount": 1500.00,
  "currency": "TRY",
  "maxInstallments": [1, 3, 6],
  "expireDateTime": "2025-07-17 23:59:59"
}
```

**Request Fields**:
| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `storeId` | string | ✅ | Mağaza UUID |
| `amount` | number | ✅ | Ödeme tutarı (pozitif sayı) |
| `currency` | string | ❌ | Para birimi (default: TRY) |
| `maxInstallments` | number[] | ❌ | İzin verilen taksit sayıları |
| `expireDateTime` | string | ✅ | Link bitiş tarihi (yyyy-MM-dd HH:mm:ss) |

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "paymentLink": "https://octet.com/payment/abc123&installmentStyle=ddl"
  }
}
```

**Error Responses**:
```json
// 400 - Geçersiz parametreler
{
  "success": false,
  "message": "storeId, amount ve expireDateTime zorunludur"
}

// 401 - Kimlik doğrulama hatası
{
  "success": false,
  "message": "Admin kimlik doğrulaması gerekli"
}

// 500 - Octet API hatası
{
  "success": false,
  "message": "Ödeme başlatılamadı"
}
```

---

> **📋 Not**: Admin kullanıcılar tüm ödeme geçmişini mevcut muhasebe ekranından görebilir. Ayrı bir ödeme geçmişi endpoint'i bulunmamaktadır.

---

## 💰 User Ödeme İşlemleri

### 1. Kullanıcı Ödeme Başlatma

**Endpoint**: `POST /api/user/payments/initiate`

Normal kullanıcı kendi mağazası için ödeme başlatır. Mağaza bilgileri otomatik alınır.

**Request Body**:
```json
{
  "amount": 1500.00,
  "currency": "TRY",
  "maxInstallments": [1, 3, 6],
  "expireDateTime": "2025-07-17 23:59:59"
}
```

**Request Fields**:
| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `amount` | number | ✅ | Ödeme tutarı (pozitif sayı) |
| `currency` | string | ❌ | Para birimi (default: TRY) |
| `maxInstallments` | number[] | ❌ | İzin verilen taksit sayıları |
| `expireDateTime` | string | ✅ | Link bitiş tarihi (yyyy-MM-dd HH:mm:ss) |

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "paymentLink": "https://octet.com/payment/abc123&installmentStyle=ddl",
    "storeInfo": {
      "name": "Kullanıcının Mağazası",
      "currentBalance": "1250.00"
    }
  }
}
```

**Error Responses**:
```json
// 400 - Mağaza bilgisi yok
{
  "success": false,
  "message": "Mağaza bilginiz bulunamadı. Lütfen admin ile iletişime geçin."
}

// 401 - Authentication hatası
{
  "success": false,
  "message": "Kullanıcı kimlik doğrulaması gerekli"
}
```

---

### 2. Kullanıcı Ödeme Geçmişi

**Endpoint**: `GET /api/user/payments/history`

Kullanıcının kendi ödeme geçmişini listeler.

**Query Parameters**:
- `page` (optional): Sayfa numarası (default: 1)
- `limit` (optional): Sayfa başına öğe sayısı (default: 20)
- `status` (optional): Durum filtresi (PENDING, COMPLETED, FAILED, EXPIRED, CANCELLED)
- `startDate` (optional): Başlangıç tarihi (ISO string)
- `endDate` (optional): Bitiş tarihi (ISO string)

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment_001",
        "store_id": "store_001",
        "amount": "1500.00",
        "currency": "TRY",
        "status": "COMPLETED",
        "installment_count": 6,
        "payment_date": "2025-07-16T14:00:00Z",
        "created_at": "2025-07-16T10:00:00Z",
        "store": {
          "kurum_adi": "Kullanıcının Mağazası",
          "bakiye": "2750.00"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 3. Kullanıcı Ödeme Detayı

**Endpoint**: `GET /api/user/payments/:paymentId`

Kullanıcının belirli bir ödeme detayını getirir (sadece kendi ödemelerini görebilir).

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "id": "payment_001",
    "store_id": "store_001",
    "amount": "1500.00",
    "currency": "TRY",
    "status": "COMPLETED",
    "installment_count": 6,
    "payment_date": "2025-07-16T14:00:00Z",
    "created_at": "2025-07-16T10:00:00Z",
    "store": {
      "kurum_adi": "Kullanıcının Mağazası",
      "vergi_numarasi": "1234567890",
      "bakiye": "2750.00"
    }
  }
}
```

---

### 4. Kullanıcı Taksit Seçenekleri

**Endpoint**: `GET /api/user/installments/options`

Kullanıcının mağazasına tanımlı taksit seçeneklerini döner.

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "consumerCardInstallmentLimit": [1, 3, 6, 9],
    "commercialCardInstallmentLimit": [1, 2],
    "storeInfo": {
      "name": "Kullanıcının Mağazası",
      "currentBalance": "2750.00"
    }
  }
}
```

---

## 🎯 Admin Taksit Yönetimi

### 1. Taksit Limitlerini Ayarlama

**Endpoint**: `POST /api/admin/octet/installments/set`

**Request Body**:
```json
{
  "storeId": "store_001",
  "consumerLimits": [1, 3, 6, 9],
  "commercialLimits": [1, 2]
}
```

**Request Fields**:
| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `storeId` | string | ✅ | Mağaza UUID |
| `consumerLimits` | number[] | ✅ | Bireysel kart taksit limitleri |
| `commercialLimits` | number[] | ✅ | Ticari kart taksit limitleri |

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Taksit limitleri başarıyla ayarlandı"
}
```

---

### 2. Taksit Seçeneklerini Getirme

**Endpoint**: `GET /api/admin/octet/installments/options/:storeId`

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "consumerCardInstallmentLimit": [1, 3, 6, 9],
    "commercialCardInstallmentLimit": [1, 2]
  }
}
```

---

## 🔄 Webhook Callback

### Ödeme Callback

**Endpoint**: `POST /api/payments/callback`

> ⚠️ **Güvenlik**: Bu endpoint public'tir ve Octet tarafından çağrılır. Authentication gerektirmez.

Octet, ödeme tamamlandığında bu endpoint'e POST request gönderir.

**Octet Request Body**:
```json
{
  "resultStatus": "SUCCESS",
  "resultCode": "0",
  "resultData": {
    "apiReferenceID": "uuid-reference",
    "paymentAmount": "1500.00",
    "installmentCount": "6",
    "paymentDate": "2025-07-16 14:12"
  }
}
```

**System Response**:
```json
{
  "success": true,
  "message": "Ödeme başarıyla işlendi"
}
```

**İşlem Akışı**:
1. Callback alınır
2. Octet API'den ödeme doğrulanır (`GET_COMMON_PAYMENT_REQUEST`)
3. Ödeme kaydı güncellenir
4. Mağaza bakiyesi artırılır
5. Muhasebe kaydı oluşturulur

---

## 🔐 Güvenlik

### SHA1 Hash Imzalama
Tüm Octet API istekleri SHA1 ile imzalanır:

```javascript
const securityData = `${action}${partnerCode}${sellerReference}${paymentAmount}${currency}${expireDateTime}${apiReferenceID}${secretKey}`
const securityKey = crypto.createHash('sha1').update(securityData).digest('hex')
```

### Ödeme Doğrulama
Her callback'te Octet API'den ödeme durumu doğrulanır:

```javascript
// GET_COMMON_PAYMENT_REQUEST çağrısı
const verificationResult = await octetPaymentService.verifyPayment(apiReferenceID)
```

---

## 📊 Ödeme Durumları

| Durum | Açıklama |
|-------|----------|
| `PENDING` | Ödeme linki oluşturuldu, ödeme bekleniyor |
| `COMPLETED` | Ödeme başarıyla tamamlandı |
| `FAILED` | Ödeme başarısız |
| `EXPIRED` | Ödeme linki süresi doldu |
| `CANCELLED` | Ödeme iptal edildi |

---

## 🗄️ Veritabanı Şeması

### OctetPayment Tablosu
```sql
CREATE TABLE octet_payments (
  id UUID PRIMARY KEY,
  store_id UUID NOT NULL,
  admin_id VARCHAR NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  api_reference_id VARCHAR UNIQUE NOT NULL,
  common_payment_url TEXT,
  consumer_installment_limit VARCHAR,
  commercial_installment_limit VARCHAR,
  buyer_name VARCHAR NOT NULL,
  buyer_email VARCHAR NOT NULL,
  buyer_phone VARCHAR NOT NULL,
  buyer_company_name VARCHAR,
  buyer_tckn VARCHAR,
  status payment_status DEFAULT 'PENDING',
  expire_date_time TIMESTAMP NOT NULL,
  payment_date TIMESTAMP,
  installment_count INTEGER,
  payment_to_seller_amount DECIMAL(15,2),
  octet_transaction_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### StoreInstallmentLimit Tablosu
```sql
CREATE TABLE store_installment_limits (
  id UUID PRIMARY KEY,
  store_id UUID UNIQUE NOT NULL,
  consumer_installment_limit VARCHAR NOT NULL,
  commercial_installment_limit VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Test Senaryoları

### 1. Admin - Başarılı Ödeme Akışı
```bash
# 1. Admin ödeme başlat
curl -X POST http://localhost:3001/api/admin/octet/payments/initiate \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "store_001",
    "amount": 1500.00,
    "expireDateTime": "2025-12-31 23:59:59"
  }'

# 2. Ödeme linkini kullan (manuel)
# 3. Callback otomatik gelir
# 4. Muhasebe ekranından ödeme kayıtlarını kontrol et
```

### 2. User - Başarılı Ödeme Akışı
```bash
# 1. Kullanıcı ödeme başlat (mağaza otomatik)
curl -X POST http://localhost:3001/api/user/payments/initiate \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000.00,
    "expireDateTime": "2025-12-31 23:59:59"
  }'

# 2. Ödeme linkini kullan (manuel)
# 3. Callback otomatik gelir
# 4. Kendi geçmişini kontrol et
curl -X GET http://localhost:3001/api/user/payments/history \
  -H "Authorization: Bearer <user_token>"
```

### 3. Taksit Limiti Ayarlama (Admin)
```bash
curl -X POST http://localhost:3001/api/admin/octet/installments/set \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "store_001",
    "consumerLimits": [1, 3, 6, 9],
    "commercialLimits": [1, 2]
  }'
```

### 4. Taksit Seçenekleri Görme (User)
```bash
curl -X GET http://localhost:3001/api/user/installments/options \
  -H "Authorization: Bearer <user_token>"
```

---

## 📋 Hata Kodları

| HTTP Kodu | Açıklama |
|-----------|----------|
| 200 | Başarılı işlem |
| 400 | Geçersiz istek parametresi |
| 401 | Kimlik doğrulama hatası |
| 403 | Yetki hatası (sadece admin) |
| 404 | Kaynak bulunamadı |
| 500 | Sunucu hatası / Octet API hatası |

---

## 🔄 Muhasebe Entegrasyonu

Her başarılı ödeme için otomatik muhasebe kaydı oluşturulur:

```json
{
  "customer_id": "admin_001",
  "store_id": "store_001",
  "transaction_type": "OCTET_PAYMENT",
  "amount": 1475.00,
  "is_expense": false,
  "transaction_date": "2025-07-16T14:00:00Z",
  "description": "Octet ödeme sistemi ile bakiye yükleme - 6 taksit"
}
```

---

## 📞 Destek

Teknik sorunlar için:
- Octet API dokümanı: [Octet Developer Portal]
- Sistem logları: `/var/log/pasha-backend/`
- Test ortamı: `OCTET_API_URL=https://test-api.octet.com.tr/...` 