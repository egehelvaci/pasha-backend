# Payment API Dökümantasyonu

## Genel Bakış
Payment API, mağazaların ödeme almasını sağlayan bir sistemdir. TRY ve USD para birimlerini destekler ve otomatik döviz kuru dönüşümü yapar.

## Endpoints

### 1. Process Payment
Ödeme işlemini başlatır ve Octet payment gateway'ine yönlendirir.

**Endpoint:** `POST /api/payment/process`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "storeId": "uuid",           // Zorunlu - Mağaza ID
  "amount": 100,               // Zorunlu - Ödeme tutarı
  "aciklama": "Açıklama",      // Opsiyonel - Ödeme açıklaması
  "currencyCode": "USD"        // Opsiyonel - Para birimi (TRY veya USD, varsayılan: mağazanın para birimi)
}
```

**Response (Başarılı):**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://payment.octet.com.tr/...",
    "sellerReference": "PASHA-1234567890",
    "apiReferenceNumber": "API-REF-123",
    "amount": 100,
    "currencyCode": "USD",
    "convertedAmount": 3250.50,    // Dönüştürülmüş tutar (farklı para birimi ise)
    "exchangeRate": 32.505          // Kullanılan döviz kuru (farklı para birimi ise)
  }
}
```

**Response (Hatalı):**
```json
{
  "success": false,
  "message": "Hata mesajı"
}
```

### 2. Checkout
Kanal destekli (web/mobile) ödeme başlatır.

**Endpoint:** `POST /api/payment/checkout`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Idempotency-Key: unique-key-123  // Opsiyonel - Tekrar eden istekleri önler
```

**Request Body:**
```json
{
  "storeId": "uuid",           // Zorunlu
  "amount": 100,               // Zorunlu
  "aciklama": "Açıklama",      // Opsiyonel
  "channel": "web",            // Opsiyonel - "web" veya "mobile" (varsayılan: web)
  "orderId": "order-uuid",     // Opsiyonel - İlişkili sipariş ID
  "currencyCode": "USD"        // Opsiyonel - Para birimi (TRY veya USD)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checkout başarıyla başlatıldı",
  "data": {
    "checkoutUrl": "https://payment.octet.com.tr/...",
    "paymentSessionId": "session-uuid"
  }
}
```

### 3. Create Payment Request
Sadece payment request oluşturur, Octet'e göndermez.

**Endpoint:** `POST /api/payment/create-request`

**Request Body:**
```json
{
  "storeId": "uuid",
  "amount": 100,
  "aciklama": "Açıklama",
  "currencyCode": "USD"        // Opsiyonel
}
```

## Currency (Döviz) Desteği

### Desteklenen Para Birimleri
- **TRY** - Türk Lirası (Varsayılan)
- **USD** - Amerikan Doları

### Döviz Kuru Dönüşümü

Sistem otomatik olarak döviz kuru dönüşümü yapar:

1. **Mağaza TRY, Ödeme USD:** USD tutarı güncel kurdan TRY'ye çevrilir
2. **Mağaza USD, Ödeme TRY:** TRY tutarı güncel kurdan USD'ye çevrilir
3. **Aynı para birimi:** Dönüşüm yapılmaz

### Döviz Kuru Kaynağı
- Merkez Bankası güncel kurları kullanılır
- Kurlar günlük olarak güncellenir
- Exchange rate bilgisi response'da döner

## Kullanım Örnekleri

### Örnek 1: TRY Ödeme
```bash
curl -X POST https://api.example.com/api/payment/process \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "123e4567-e89b-12d3-a456-426614174000",
    "amount": 1000,
    "aciklama": "Sipariş ödemesi"
  }'
```

### Örnek 2: USD Ödeme
```bash
curl -X POST https://api.example.com/api/payment/process \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "123e4567-e89b-12d3-a456-426614174000",
    "amount": 100,
    "aciklama": "USD Payment",
    "currencyCode": "USD"
  }'
```

### Örnek 3: Mobile Checkout
```bash
curl -X POST https://api.example.com/api/payment/checkout \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique-123" \
  -d '{
    "storeId": "123e4567-e89b-12d3-a456-426614174000",
    "amount": 50,
    "channel": "mobile",
    "currencyCode": "USD",
    "orderId": "order-456"
  }'
```

## Webhook Endpoints

### Success Webhook
`GET/POST /api/payments/webhook/success?token={webhookToken}`

### Failure Webhook
`GET/POST /api/payments/webhook/failure?token={webhookToken}`

### Mobile 3DS Callback
`GET/POST /api/payments/mobile/3ds/callback?session={sessionId}&status={success|fail}`

### Web Callback
`GET/POST /api/payments/web/callback?session={sessionId}&status={success|fail}`

## Transaction Sorgulama

### Get Transaction Status
**Endpoint:** `GET /api/payments/status/{sellerReference}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "transaction-uuid",
    "sellerReference": "PASHA-1234567890",
    "amount": 100,
    "status": "COMPLETED",
    "store_currency": "TRY",
    "payment_currency": "USD",
    "exchange_rate": 32.505,
    "original_amount": 100,
    "converted_amount": 3250.50,
    "paymentDate": "2024-01-01T12:00:00Z"
  }
}
```

### Get Payment Result (Polling)
**Endpoint:** `GET /api/payments/result?session={sessionId}`

## Store Payment History

### Get My Store Payments
**Endpoint:** `GET /api/payments/my-store-payments`

**Query Parameters:**
- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına kayıt (varsayılan: 20)
- `status`: PENDING, COMPLETED, FAILED, CANCELLED

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment-uuid",
        "amount": 100,
        "status": "COMPLETED",
        "store_currency": "TRY",
        "payment_currency": "USD",
        "exchange_rate": 32.505,
        "original_amount": 100,
        "converted_amount": 3250.50,
        "description": "Ödeme açıklaması",
        "createdAt": "2024-01-01T12:00:00Z",
        "paymentDate": "2024-01-01T12:05:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 400 | Geçersiz istek parametreleri |
| 401 | Kimlik doğrulama hatası |
| 403 | Yetki hatası |
| 404 | Kaynak bulunamadı |
| 500 | Sunucu hatası |

## Güvenlik

### Authentication
Tüm endpoint'ler JWT token ile korunmaktadır. Token'ı `Authorization: Bearer {token}` header'ında göndermeniz gerekmektedir.

### Idempotency
Tekrar eden istekleri önlemek için `Idempotency-Key` header'ı kullanabilirsiniz. Aynı key ile yapılan istekler aynı response'u döner.

### Webhook Security
Webhook'lar güvenlik için `webhookToken` parametresi kullanır. Bu token her transaction için benzersizdir.

## Rate Limiting
- Dakikada maksimum 60 istek
- Saatte maksimum 1000 istek

## Notlar

1. **Para Birimi Dönüşümü:** Farklı para birimlerinde ödeme alındığında, sistem otomatik olarak mağazanın para birimine dönüşüm yapar.

2. **Octet Gateway:** Tüm ödemeler Octet payment gateway üzerinden işlenir. Octet sadece TRY kabul ettiği için, USD ödemeler TRY'ye çevrilir.

3. **Transaction Kayıtları:** Tüm ödeme işlemleri, orijinal tutar, dönüştürülmüş tutar ve kullanılan kur bilgisi ile birlikte saklanır.

4. **Admin/Editor Yetkileri:** Admin ve Editor kullanıcıları herhangi bir mağaza için ödeme işlemi başlatabilir.

## Destek
Sorularınız için: support@example.com