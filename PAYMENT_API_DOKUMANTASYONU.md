# DBYE Ödeme Sistemi API Dokümantasyonu

## Genel Bakış

Bu sistem, DBYE (Dijital Bankacılık Ödeme Entegrasyonu) ile entegre çalışan bir ara katman API'sidir. Mağazaların online ödeme alabilmesini, tüm ödeme durumlarını (başarılı/başarısız/iptal) takip edebilmesini ve bakiye yönetimini sağlar.

## Sistem Mimarisi

```
Frontend → Backend API → DBYE/Octet API → Ödeme Sayfası
                    ↑
              DBYE Webhook
```

## API Endpoint'leri

### 1. Ödeme İşlemi Başlatma

**Endpoint:** `POST /api/payments/process`

**Açıklama:** Ödeme talebi oluşturur, DBYE'ye gönderir ve kullanıcıyı ödeme sayfasına yönlendirecek URL'i döner.

**Request Body:**
```json
{
  "storeId": "4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5",
  "amount": 150.75,
  "aciklama": "Test ödeme açıklaması"
}
```

**Response (Başarılı):**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://qashell.octet.com.tr/ortak-odeme/...",
    "sellerReference": "PASHA-1703123456789-abc123",
    "apiReferenceNumber": "PASHA-ODEME-1703123456789-def456",
    "amount": 150.75
  }
}
```

**Response (Hatalı):**
```json
{
  "success": false,
  "message": "Hata açıklaması",
  "data": null
}
```

### 2. DBYE Ana Webhook Endpoint'i

**Endpoint:** `POST /api/payments/webhook/dbye`

**Açıklama:** DBYE sisteminden gelen tüm webhook bildirimleri bu endpoint'e gelir. Hash doğrulaması yapar ve transaction state'e göre işlem yapar.

**DBYE Webhook Request Body:**
```json
{
  "NotificationId": "a1b2c3d4-5678-9101-1121-314151617181",
  "TransactionType": 1,
  "TransactionState": 3,
  "PaymentAmount": 150.75,
  "OrderNumber": "PASHA-1703123456789-abc123",
  "PaymentDate": "2025-01-20T14:30:00",
  "CardNumber": "************4242",
  "ApprovalCode": "123456",
  "Hash": "sha512_hesaplanan_hash_degeri",
  "HashParameters": "OrderNumber|PaymentAmount|TransactionState|NotificationId|PaymentDate"
}
```

**Transaction State Değerleri:**
- `1`: Başarısız ödeme
- `2`: İptal edilen ödeme  
- `3`: Başarılı ödeme

**Webhook Response:**
```json
{
  "success": true,
  "message": "Ödeme başarıyla işlendi"
}
```

### 3. Transaction Durum Sorgulama

**Endpoint:** `GET /api/payments/status/{sellerReference}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "sellerReference": "PASHA-1703123456789-abc123",
    "apiReferenceNumber": "PASHA-ODEME-1703123456789-def456",
    "amount": 150.75,
    "status": "COMPLETED",
    "description": "Test ödeme açıklaması",
    "paymentDate": "2025-01-20T14:30:00.000Z",
    "octetPaymentId": "a1b2c3d4-5678-9101-1121-314151617181",
    "store": {
      "kurum_adi": "Paşa Home",
      "store_id": "4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5"
    },
    "createdAt": "2025-01-20T14:25:00.000Z",
    "updatedAt": "2025-01-20T14:30:15.000Z"
  }
}
```

## Güvenlik

### Hash Doğrulaması

DBYE webhook'larında güvenlik için SHA512 hash doğrulaması yapılır:

1. `HashParameters` alanındaki parametreler sırasıyla alınır
2. Her parametre değeri pipe (`|`) ile birleştirilir
3. `DBYE_WEBHOOK_SECRET` ile HMAC-SHA512 hash'i hesaplanır
4. Gelen `Hash` değeri ile karşılaştırılır

**Hash Hesaplama Örneği:**
```typescript
const hashString = "PASHA-123|150.75|3|notification-id|2025-01-20T14:30:00";
const calculatedHash = crypto
  .createHmac('sha512', process.env.DBYE_WEBHOOK_SECRET)
  .update(hashString)
  .digest('hex');
```

## Veritabanı Tabloları

### PaymentTransaction

```sql
model PaymentTransaction {
  id                  Int      @id @default(autoincrement())
  storeId             String   @map("store_id") @db.Uuid
  sellerReference     String   @unique @map("seller_reference")
  apiReferenceNumber  String   @unique @map("api_reference_number")
  amount              Decimal  @db.Decimal(10, 2)
  description         String?
  status              String   // PENDING, COMPLETED, FAILED, CANCELLED
  webhookToken        String?  @unique @map("webhook_token")
  webhookData         String?  @map("webhook_data") @db.Text
  octetPaymentId      String?  @unique @map("octet_payment_id")
  paymentDate         DateTime? @map("payment_date")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")
  
  store               Store    @relation(fields: [storeId], references: [store_id])
}
```

### MuhasebeHareketleri

```sql
model MuhasebeHareketleri {
  id          Int      @id @default(autoincrement())
  storeId     String   @map("store_id") @db.Uuid
  islemTuru   String   @map("islem_turu") @db.VarChar(255)
  tutar       Decimal  @db.Decimal(10, 2)
  harcama     Boolean
  tarih       DateTime
  aciklama    String?  @db.Text
  createdAt   DateTime @default(now()) @map("created_at")
  
  store       Store    @relation(fields: [storeId], references: [store_id])
}
```

## İşlem Türleri

### Başarılı Ödeme (TransactionState: 3)

1. Hash doğrulaması yapılır
2. Transaction PENDING durumunda olmalı
3. Tutar kontrolü yapılır
4. Transaction durumu COMPLETED olarak güncellenir
5. Store bakiyesi artırılır
6. Muhasebe hareketi eklenir (İşlem Türü: "ÖDEME", Harcama: false)

### Başarısız Ödeme (TransactionState: 1)

1. Hash doğrulaması yapılır
2. Transaction durumu FAILED olarak güncellenir
3. Muhasebe kaydı eklenir (İşlem Türü: "ÖDEME_BAŞARISIZ")
4. Store bakiyesi değişmez

### İptal Edilen Ödeme (TransactionState: 2)

1. Hash doğrulaması yapılır
2. Transaction durumu CANCELLED olarak güncellenir
3. Muhasebe kaydı eklenir (İşlem Türü: "ÖDEME_İPTAL")
4. Store bakiyesi değişmez

## Database Konfigürasyonu

Tüm DBYE ayarları artık database'de tutulmaktadır:

### DbyeConfig Tablosu
```sql
model DbyeConfig {
  id                Int      @id @default(1)
  webhookSecret     String   @map("webhook_secret")
  backendUrl        String   @map("backend_url")
  isActive          Boolean  @default(true)
  description       String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### AdminStoreConfig Tablosu
```sql
model AdminStoreConfig {
  id              Int      @id @default(autoincrement())
  storeId         String   @unique @map("store_id")
  isAdminStore    Boolean  @default(true)
  description     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  store           Store    @relation(fields: [storeId], references: [store_id])
}
```

### Kurulum Scriptleri
```bash
# DBYE konfigürasyonunu ayarla
npx ts-node scripts/setup-dbye-config.ts

# Admin store'u ayarla
npx ts-node scripts/setup-admin-store.ts
```

## Test Senaryoları

### 1. Başarılı Ödeme Testi

```bash
# 1. Ödeme başlat
curl -X POST http://localhost:1337/api/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5",
    "amount": 100.00,
    "aciklama": "Test ödeme"
  }'

# 2. Başarılı webhook simüle et
curl -X POST http://localhost:1337/api/payments/webhook/dbye \
  -H "Content-Type: application/json" \
  -d '{
    "NotificationId": "test-notification-123",
    "TransactionType": 1,
    "TransactionState": 3,
    "PaymentAmount": 100.00,
    "OrderNumber": "PASHA-1703123456789-abc123",
    "PaymentDate": "2025-01-20T14:30:00",
    "Hash": "calculated-hash-value",
    "HashParameters": "OrderNumber|PaymentAmount|TransactionState"
  }'
```

### 2. Başarısız Ödeme Testi

```bash
# Başarısız webhook simüle et
curl -X POST http://localhost:1337/api/payments/webhook/dbye \
  -H "Content-Type: application/json" \
  -d '{
    "NotificationId": "test-fail-123",
    "TransactionType": 1,
    "TransactionState": 1,
    "PaymentAmount": 100.00,
    "OrderNumber": "PASHA-1703123456789-abc123",
    "PaymentDate": "2025-01-20T14:30:00",
    "Hash": "calculated-hash-value",
    "HashParameters": "OrderNumber|PaymentAmount|TransactionState"
  }'
```

### 3. Transaction Durum Kontrolü

```bash
curl -X GET http://localhost:1337/api/payments/status/PASHA-1703123456789-abc123
```

## Geriye Uyumluluk

Eski webhook endpoint'leri test amaçlı korunmuştur:
- `GET/POST /api/payments/webhook/success?token={token}` - Legacy başarılı webhook
- `GET/POST /api/payments/webhook/failure?token={token}` - Legacy başarısız webhook

Bu endpoint'ler basit HTML sayfaları döner ve test amaçlı kullanılabilir.

## Hata Kodları

- `400`: Geçersiz istek parametreleri
- `401`: Hash doğrulaması başarısız
- `404`: Transaction bulunamadı
- `500`: Sunucu hatası

## Loglama

Sistem tüm önemli işlemleri loglar:
- Gelen webhook'lar
- Hash doğrulama sonuçları
- Transaction durum değişiklikleri
- Store bakiye güncellemeleri
- Muhasebe hareketleri

Log seviyeleri:
- `console.log`: Bilgilendirme
- `console.error`: Hata durumları
- `console.warn`: Uyarılar

## Deployment Notları

1. `DBYE_WEBHOOK_SECRET` production'da mutlaka güvenli bir değer olmalı
2. `BACKEND_URL` production'da doğru domain'i işaret etmeli
3. DBYE panel'inde webhook URL'i `{BACKEND_URL}/api/payments/webhook/dbye` olarak ayarlanmalı
4. SSL sertifikası geçerli olmalı (HTTPS zorunlu)
5. Database migration'ları çalıştırılmalı 