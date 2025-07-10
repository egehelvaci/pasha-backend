# Admin Sipariş Yönetim Sistemi

Bu dokümantasyon, admin paneli için sipariş yönetimi, QR kod sistemi ve stok yönetimi API'lerini açıklar.

## Özellikler

- ✅ Admin siparişleri listeleme ve detaylarını görüntüleme
- ✅ Sipariş onaylama işlemi (QR kod oluşturma + stok düşürme)
- ✅ QR kod okutma ve sipariş teslim etme
- ✅ Sipariş durumu güncelleme
- ✅ QR kod istatistikleri ve raporlama

## API Endpoint'leri

### 1. Tüm Siparişleri Listele

**GET** `/api/admin/orders`

Admin tüm siparişleri listelenir, sayfalama ve filtreleme desteklenir.

**Query Parametreleri:**
- `page` (isteğe bağlı): Sayfa numarası (varsayılan: 1)
- `limit` (isteğe bağlı): Sayfa başına kayıt sayısı (varsayılan: 20)
- `status` (isteğe bağlı): Sipariş durumu filtresi (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELED)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Örnek Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order-uuid",
        "user_id": "user-uuid",
        "cart_id": 123,
        "total_price": "250.00",
        "status": "PENDING",
        "delivery_address": "Mağaza Adresi",
        "store_name": "Örnek Mağaza",
        "created_at": "2024-01-15T10:30:00Z",
        "user": {
          "username": "magaza1",
          "name": "Ahmet",
          "surname": "Yılmaz",
          "Store": {
            "kurum_adi": "Örnek Mağaza",
            "vergi_numarasi": "1234567890"
          }
        },
        "items": [
          {
            "id": "item-uuid",
            "product_id": "product-uuid",
            "quantity": 2,
            "unit_price": "125.00",
            "total_price": "250.00",
            "width": "100.00",
            "height": "200.00",
            "product": {
              "name": "Halı Ürünü",
              "description": "Ürün açıklaması"
            }
          }
        ],
        "qr_stats": {
          "total": 2,
          "scanned": 0,
          "pending": 2
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

**Curl Örneği:**
```bash
curl -X GET "http://localhost:3000/api/admin/orders?page=1&limit=10&status=PENDING" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Sipariş Detaylarını Getir

**GET** `/api/admin/orders/:orderId`

Belirli bir siparişin tüm detaylarını ve QR kod bilgilerini getirir.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Örnek Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "user_id": "user-uuid",
    "total_price": "250.00",
    "status": "CONFIRMED",
    "user": {
      "username": "magaza1",
      "Store": {
        "kurum_adi": "Örnek Mağaza"
      }
    },
    "items": [...],
    "qr_codes": [
      {
        "id": "qr-uuid",
        "qr_code": "PASHA-1641234567890-ABC123DEF456",
        "is_scanned": false,
        "created_at": "2024-01-15T10:35:00Z",
        "product": {
          "name": "Halı Ürünü"
        }
      }
    ],
    "qr_stats": {
      "total": 2,
      "scanned": 0,
      "pending": 2,
      "completionPercentage": 0
    }
  }
}
```

**Curl Örneği:**
```bash
curl -X GET "http://localhost:3000/api/admin/orders/order-uuid" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Siparişi Onayla (QR Kod Oluştur + Stok Düşür)

**POST** `/api/admin/orders/:orderId/confirm`

Bekleyen bir siparişi onaylar. Bu işlem:
- Siparişteki her ürün adedi için ayrı QR kod oluşturur
- Ürün stoklarını düşürür
- Sipariş durumunu CONFIRMED yapar

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Örnek Response:**
```json
{
  "success": true,
  "message": "Sipariş başarıyla onaylandı",
  "data": {
    "order": {
      "id": "order-uuid",
      "status": "CONFIRMED",
      "updated_at": "2024-01-15T10:35:00Z"
    },
    "qrCodes": [
      {
        "id": "qr-uuid-1",
        "order_id": "order-uuid",
        "product_id": "product-uuid",
        "qr_code": "PASHA-1641234567890-ABC123DEF456",
        "quantity": 1,
        "is_scanned": false
      },
      {
        "id": "qr-uuid-2",
        "order_id": "order-uuid",
        "product_id": "product-uuid",
        "qr_code": "PASHA-1641234567891-DEF456GHI789",
        "quantity": 1,
        "is_scanned": false
      }
    ],
    "totalQRCodes": 2
  }
}
```

**Curl Örneği:**
```bash
curl -X POST "http://localhost:3000/api/admin/orders/order-uuid/confirm" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. QR Kod Okut

**POST** `/api/admin/scan-qr`

QR kod okutarak ürün teslimatını işaretler. Tüm QR kodlar okunduğunda sipariş otomatik olarak DELIVERED durumuna geçer.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "qrCode": "PASHA-1641234567890-ABC123DEF456"
}
```

**Örnek Response:**
```json
{
  "success": true,
  "message": "QR kod başarıyla okundu",
  "data": {
    "qrCode": {
      "id": "qr-uuid",
      "qr_code": "PASHA-1641234567890-ABC123DEF456",
      "is_scanned": true,
      "scanned_at": "2024-01-15T11:00:00Z",
      "product": {
        "name": "Halı Ürünü"
      }
    },
    "order": {
      "id": "order-uuid",
      "status": "CONFIRMED"
    },
    "scannedCount": 1,
    "totalCount": 2,
    "isOrderCompleted": false
  }
}
```

**Tüm QR Kodlar Okunduğunda:**
```json
{
  "success": true,
  "message": "QR kod okundu ve sipariş teslim edildi!",
  "data": {
    "scannedCount": 2,
    "totalCount": 2,
    "isOrderCompleted": true
  }
}
```

**Curl Örneği:**
```bash
curl -X POST "http://localhost:3000/api/admin/scan-qr" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "PASHA-1641234567890-ABC123DEF456"}'
```

### 5. Sipariş QR Kodlarını Listele

**GET** `/api/admin/orders/:orderId/qrcodes`

Bir siparişe ait tüm QR kodları listeler.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Örnek Response:**
```json
{
  "success": true,
  "data": {
    "qrCodes": [
      {
        "id": "qr-uuid-1",
        "qr_code": "PASHA-1641234567890-ABC123DEF456",
        "is_scanned": true,
        "scanned_at": "2024-01-15T11:00:00Z",
        "product": {
          "name": "Halı Ürünü"
        }
      },
      {
        "id": "qr-uuid-2",
        "qr_code": "PASHA-1641234567891-DEF456GHI789",
        "is_scanned": false,
        "scanned_at": null,
        "product": {
          "name": "Halı Ürünü"
        }
      }
    ],
    "scannedCount": 1,
    "totalCount": 2,
    "completionPercentage": 50
  }
}
```

### 6. Sipariş Durumunu Güncelle

**PUT** `/api/admin/orders/:orderId/status`

Sipariş durumunu manuel olarak günceller.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "SHIPPED"
}
```

**Geçerli Durumlar:**
- `PENDING`: Bekliyor
- `CONFIRMED`: Onaylandı
- `SHIPPED`: Kargoya verildi
- `DELIVERED`: Teslim edildi
- `CANCELED`: İptal edildi

**Örnek Response:**
```json
{
  "success": true,
  "message": "Sipariş durumu güncellendi",
  "data": {
    "id": "order-uuid",
    "status": "SHIPPED",
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

### 7. Sipariş İstatistikleri

**GET** `/api/admin/orders/stats`

Genel sipariş ve QR kod istatistiklerini getirir.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Örnek Response:**
```json
{
  "success": true,
  "data": {
    "orders": {
      "total": 50,
      "pending": 10,
      "confirmed": 15,
      "delivered": 20,
      "canceled": 5
    },
    "qrCodes": {
      "total": 120,
      "scanned": 80,
      "pending": 40,
      "completionRate": 67
    }
  }
}
```

## İş Akışı

### 1. Sipariş Onaylama Süreci

1. **Sipariş Listesi**: Admin `/api/admin/orders` endpoint'i ile siparişleri listeler
2. **Sipariş Detayı**: Belirli bir siparişin detaylarını `/api/admin/orders/:orderId` ile inceler
3. **Onaylama**: `/api/admin/orders/:orderId/confirm` ile siparişi onaylar
   - Her ürün adedi için QR kod oluşturulur
   - Stoklar düşürülür
   - Sipariş durumu CONFIRMED olur

### 2. QR Kod ve Teslimat Süreci

1. **QR Kod Oluşturma**: Sipariş onaylandığında otomatik oluşur
2. **QR Kod Okutma**: `/api/admin/scan-qr` ile her QR kod tek tek okutulur
3. **Otomatik Teslim**: Tüm QR kodlar okunduğunda sipariş otomatik DELIVERED olur

### 3. Stok Yönetimi

- Sipariş onaylandığında `productvariations` tablosunda ilgili ürün varyasyonlarının stok miktarları düşürülür
- Stok kontrolü yapılır, yetersiz stok durumunda hata döndürülür
- Ürün boyutları (width, height) ve fringe durumu eşleştirilerek doğru varyasyon bulunur

## Hata Yönetimi

### Yaygın Hatalar

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Yetkisiz erişim"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Sipariş bulunamadı"
}
```

**400 Bad Request - Geçersiz QR Kod**
```json
{
  "success": false,
  "message": "Geçersiz QR kod"
}
```

**400 Bad Request - QR Kod Zaten Okunmuş**
```json
{
  "success": false,
  "message": "Bu QR kod daha önce okunmuş"
}
```

**400 Bad Request - Yetersiz Stok**
```json
{
  "success": false,
  "message": "product-uuid ürünü için yeterli stok yok. Mevcut: 5, İstenen: 10"
}
```

## Güvenlik

- Tüm endpoint'ler admin yetkisi gerektir
- JWT token ile kimlik doğrulama yapılır
- SQL injection koruması Prisma ORM ile sağlanır
- Input validasyonu tüm endpoint'lerde yapılır

## Test Senaryoları

### Test 1: Sipariş Onaylama
1. PENDING durumunda sipariş oluştur
2. Admin token ile sipariş onaylama API'sini çağır
3. QR kodların oluştuğunu kontrol et
4. Stokların düştüğünü kontrol et

### Test 2: QR Kod Okutma
1. Onaylanmış siparişin QR kodlarını al
2. Her QR kodu tek tek okut
3. Son QR kod okunduğunda siparişin DELIVERED olduğunu kontrol et

### Test 3: Hata Senaryoları
1. Geçersiz QR kod ile okutma dene
2. Aynı QR kodu iki kez okutmaya çalış
3. Yetersiz stok ile sipariş onaylamaya çalış

## Geliştirme Notları

- QR kodlar `PASHA-timestamp-randomhex` formatında oluşturulur
- Her ürün adedi için ayrı QR kod oluşturulur
- Stok düşürme işlemi `productvariations` tablosunda yapılır
- QR kod tarama işlemi idempotent değildir (aynı QR kod iki kez okutulamaz)
- Sipariş durumu manuel olarak da güncellenebilir 