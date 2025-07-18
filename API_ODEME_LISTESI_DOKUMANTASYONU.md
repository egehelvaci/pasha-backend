# 💰 Ödeme Listeleme API Dokümantasyonu

## 📋 Genel Bakış

Bu döküman, DBYE ödeme sistemi için oluşturulan ödeme listeleme API endpoint'lerini açıklamaktadır. Sistem 2 ana endpoint içerir:

1. **Admin Ödeme Listesi** - Tüm mağazaların ödemelerini görüntüleme
2. **Mağaza Ödeme Listesi** - Sadece kendi mağazasının ödemelerini görüntüleme

## 🔐 Kimlik Doğrulama

Tüm endpoint'ler **JWT token** ile kimlik doğrulaması gerektirir.

```bash
Authorization: Bearer <JWT_TOKEN>
```

## 📊 API Endpoint'leri

### 1. Admin için Tüm Ödemeleri Listele

**Endpoint:** `GET /api/admin/payments`

**Açıklama:** Admin kullanıcıları tüm mağazaların COMPLETED ve FAILED durumlarındaki ödemelerini görüntüleyebilir.

**Yetki:** Admin rolü gereklidir

**Query Parametreleri:**
- `page` (isteğe bağlı): Sayfa numarası (varsayılan: 1)
- `limit` (isteğe bağlı): Sayfa başına kayıt sayısı (varsayılan: 20)
- `status` (isteğe bağlı): Ödeme durumu (`COMPLETED` veya `FAILED`)
- `storeId` (isteğe bağlı): Belirli bir mağaza filtresi
- `sortBy` (isteğe bağlı): Sıralama alanı (varsayılan: `createdAt`)
- `sortOrder` (isteğe bağlı): Sıralama yönü (`asc` veya `desc`, varsayılan: `desc`)

**Örnek İstek:**
```bash
GET /api/admin/payments?page=1&limit=10&status=COMPLETED
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Başarılı Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid-payment-id",
        "sellerReference": "PASHA-1703123456789-abc123",
        "apiReferenceNumber": "PASHA-ODEME-1703123456789-def456",
        "amount": 150.75,
        "description": "Test ödeme açıklaması",
        "status": "COMPLETED",
        "paymentDate": "2025-01-20T14:30:00.000Z",
        "octetPaymentId": "a1b2c3d4-5678-9101-1121-314151617181",
        "createdAt": "2025-01-20T14:25:00.000Z",
        "updatedAt": "2025-01-20T14:30:15.000Z",
        "store": {
          "store_id": "4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5",
          "kurum_adi": "Paşa Home",
          "vergi_numarasi": "1234567890",
          "telefon": "+90 532 123 45 67",
          "eposta": "info@pasahome.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "summary": {
      "completedCount": 20,
      "failedCount": 5,
      "totalAmount": 3250.75,
      "successRate": 80
    }
  }
}
```

### 2. Mağaza Ödemelerini Listele

**Endpoint:** `GET /api/payments/my-store-payments`

**Açıklama:** Mağaza sahipleri sadece kendi mağazalarının COMPLETED ve FAILED durumlarındaki ödemelerini görüntüleyebilir.

**Yetki:** Mağaza sahibi olmalı (Store ile ilişkili User)

**Query Parametreleri:**
- `page` (isteğe bağlı): Sayfa numarası (varsayılan: 1)
- `limit` (isteğe bağlı): Sayfa başına kayıt sayısı (varsayılan: 20)
- `status` (isteğe bağlı): Ödeme durumu (`COMPLETED` veya `FAILED`)
- `sortBy` (isteğe bağlı): Sıralama alanı (varsayılan: `createdAt`)
- `sortOrder` (isteğe bağlı): Sıralama yönü (`asc` veya `desc`, varsayılan: `desc`)

**Örnek İstek:**
```bash
GET /api/payments/my-store-payments?page=1&limit=5&status=COMPLETED
Authorization: Bearer <STORE_USER_JWT_TOKEN>
```

**Başarılı Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid-payment-id",
        "sellerReference": "PASHA-1703123456789-abc123",
        "apiReferenceNumber": "PASHA-ODEME-1703123456789-def456",
        "amount": 150.75,
        "description": "Test ödeme açıklaması",
        "status": "COMPLETED",
        "paymentDate": "2025-01-20T14:30:00.000Z",
        "octetPaymentId": "a1b2c3d4-5678-9101-1121-314151617181",
        "createdAt": "2025-01-20T14:25:00.000Z",
        "updatedAt": "2025-01-20T14:30:15.000Z",
        "store": {
          "store_id": "4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5",
          "kurum_adi": "Paşa Home"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "totalCount": 12,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "summary": {
      "completedCount": 10,
      "failedCount": 2,
      "totalAmount": 1520.50,
      "successRate": 83
    },
    "store": {
      "store_id": "4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5",
      "kurum_adi": "Paşa Home"
    }
  }
}
```

## 🚫 Hata Durumları

### Kimlik Doğrulama Hatası
```json
{
  "success": false,
  "message": "Kullanıcı bilgisi bulunamadı"
}
```

### Yetki Hatası (Mağaza endpoint'i için)
```json
{
  "success": false,
  "message": "Bu işlem için mağaza yetkisi gereklidir"
}
```

### Geçersiz Status Hatası
```json
{
  "success": false,
  "message": "Geçersiz status. Sadece COMPLETED veya FAILED değerleri kabul edilir."
}
```

### Sunucu Hatası
```json
{
  "success": false,
  "message": "Ödemeler listelenirken bir hata oluştu"
}
```

## 📈 Response Alanları Açıklaması

### Payment Objesi
- `id`: Benzersiz ödeme ID'si
- `sellerReference`: Ödeme referans numarası (PASHA-timestamp-random)
- `apiReferenceNumber`: API referans numarası (PASHA-ODEME-timestamp-random)
- `amount`: Ödeme tutarı (Number)
- `description`: Ödeme açıklaması
- `status`: Ödeme durumu (`COMPLETED`, `FAILED`)
- `paymentDate`: Ödeme tarihi (ISO string)
- `octetPaymentId`: Octet sisteminden gelen ödeme ID'si
- `createdAt`: Kayıt oluşturma tarihi
- `updatedAt`: Son güncelleme tarihi

### Store Objesi
- `store_id`: Mağaza UUID
- `kurum_adi`: Mağaza adı
- `vergi_numarasi`: Vergi numarası (sadece admin endpoint'inde)
- `telefon`: Telefon numarası (sadece admin endpoint'inde)
- `eposta`: E-posta adresi (sadece admin endpoint'inde)

### Pagination Objesi
- `page`: Mevcut sayfa numarası
- `limit`: Sayfa başına kayıt sayısı
- `totalCount`: Toplam kayıt sayısı
- `totalPages`: Toplam sayfa sayısı
- `hasNext`: Sonraki sayfa var mı?
- `hasPrev`: Önceki sayfa var mı?

### Summary Objesi
- `completedCount`: Başarılı ödeme sayısı
- `failedCount`: Başarısız ödeme sayısı
- `totalAmount`: Toplam başarılı ödeme tutarı
- `successRate`: Başarı oranı (%)

## 🔍 Filtreleme ve Sıralama

### Status Filtreleme
```bash
# Sadece başarılı ödemeler
GET /api/admin/payments?status=COMPLETED

# Sadece başarısız ödemeler
GET /api/admin/payments?status=FAILED

# Tüm ödemeler (COMPLETED + FAILED)
GET /api/admin/payments
```

### Mağaza Filtreleme (Sadece Admin)
```bash
# Belirli bir mağazanın ödemeleri
GET /api/admin/payments?storeId=4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5
```

### Sıralama
```bash
# Tarihe göre eskiden yeniye
GET /api/admin/payments?sortBy=createdAt&sortOrder=asc

# Tutara göre büyükten küçüğe
GET /api/admin/payments?sortBy=amount&sortOrder=desc

# Ödeme tarihine göre yeniden eskiye
GET /api/admin/payments?sortBy=paymentDate&sortOrder=desc
```

### Sayfalama
```bash
# 2. sayfa, sayfa başına 50 kayıt
GET /api/admin/payments?page=2&limit=50
```

## 🎯 Kullanım Senaryoları

### 1. Admin Dashboard - Günlük Ödemeler
```bash
# Bugünkü tüm başarılı ödemeler
GET /api/admin/payments?status=COMPLETED&sortBy=paymentDate&sortOrder=desc&limit=100
```

### 2. Mağaza Panel - Ödeme Geçmişi
```bash
# Mağaza sahibinin son 20 ödemesi
GET /api/payments/my-store-payments?limit=20
```

### 3. Hata Analizi - Başarısız Ödemeler
```bash
# Son 1 aydaki başarısız ödemeler
GET /api/admin/payments?status=FAILED&sortBy=createdAt&sortOrder=desc
```

### 4. Muhasebe Raporu - Toplam Ciro
```bash
# Tüm başarılı ödemeler için toplam tutarı summary.totalAmount'tan alabilirsiniz
GET /api/admin/payments?status=COMPLETED&limit=1
```

## 🔒 Güvenlik Notları

1. **PENDING** ve **CANCELLED** durumlarındaki ödemeler bu endpoint'lerde görünmez
2. Mağaza sahipleri sadece kendi mağazalarının ödemelerini görebilir
3. Admin kullanıcıları tüm mağazaların ödemelerini görebilir
4. Tüm endpoint'ler JWT token ile korunur
5. Hassas bilgiler (webhook data, token'lar) response'da döndürülmez

## 📝 Notlar

- Tüm tutar değerleri **TRY (Türk Lirası)** cinsindendir
- Tarih formatları **ISO 8601** standardındadır
- **PENDING** durumundaki ödemeler henüz tamamlanmamış olduğu için listelenmez
- **CANCELLED** durumundaki ödemeler iptal edildiği için listelenmez
- Sadece **COMPLETED** (başarılı) ve **FAILED** (başarısız) ödemeler görüntülenir 