# QR Kod Sistemi API Değişiklikleri

## Sistem Genel Bakış

**Eski Sistem**: Sipariş bazlı QR kod (1 sipariş = 1 QR kod)
**Yeni Sistem**: Item bazlı QR kod (Her farklı ürün tipi için 1 QR kod, quantity kadar okutma gerekiyor)

## Yeni QR Kod Mantığı

### Örnek Sipariş
```
Sipariş ID: abc-123
├── Item 1: SUYOLU MAVİ (80×100 cm) - 100 adet
├── Item 2: SUYOLU MAVİ (80×150 cm) - 50 adet  
└── Item 3: SUYOLU MAVİ (160×10 cm) - 10 adet
```

### QR Kod Oluşturma
- **3 QR kod oluşturulur** (her item için 1 adet)
- QR1: 100 kere okutulmalı
- QR2: 50 kere okutulmalı  
- QR3: 10 kere okutulmalı
- **Tüm QR kodlar tamamlandığında** sipariş DELIVERED olur

---

## API Endpoint'leri

### 1. Sipariş Onaylama ve QR Kod Oluşturma

**Endpoint**: `PUT /api/admin/orders/{orderId}/confirm`

**Request**: 
```http
PUT /api/admin/orders/abc-123/confirm
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "success": true,
  "message": "Sipariş onaylandı ve QR kodlar oluşturuldu",
  "order": {
    "id": "abc-123",
    "status": "CONFIRMED",
    "total_price": 75550.0,
    "updated_at": "2025-01-15T10:30:00Z"
  },
  "qrCodes": [
    {
      "id": "qr-1",
      "qr_code": "https://pasha-backend-production.up.railway.app/api/admin/scan-qr?qrCode=PASHA-1748123456789-ABC123DE",
      "order_item_id": "item-1",
      "product_id": "prod-1",
      "scan_count": 0,
      "required_scans": 100,
      "is_scanned": false,
      "qrCodeImageUrl": null
    },
    {
      "id": "qr-2", 
      "qr_code": "https://pasha-backend-production.up.railway.app/api/admin/scan-qr?qrCode=PASHA-1748123456790-DEF456GH",
      "order_item_id": "item-2",
      "product_id": "prod-1",
      "scan_count": 0,
      "required_scans": 50,
      "is_scanned": false,
      "qrCodeImageUrl": null
    },
    {
      "id": "qr-3",
      "qr_code": "https://pasha-backend-production.up.railway.app/api/admin/scan-qr?qrCode=PASHA-1748123456791-HIJ789KL",
      "order_item_id": "item-3", 
      "product_id": "prod-1",
      "scan_count": 0,
      "required_scans": 10,
      "is_scanned": false,
      "qrCodeImageUrl": null
    }
  ],
  "qrCodeStats": {
    "totalGenerated": 3,
    "itemBreakdown": [
      {
        "itemId": "item-1",
        "productId": "prod-1",
        "quantity": 100,
        "qrCodesGenerated": 1
      },
      {
        "itemId": "item-2", 
        "productId": "prod-1",
        "quantity": 50,
        "qrCodesGenerated": 1
      },
      {
        "itemId": "item-3",
        "productId": "prod-1", 
        "quantity": 10,
        "qrCodesGenerated": 1
      }
    ]
  }
}
```

---

### 2. QR Kod Görsellerini Oluşturma

**Endpoint**: `POST /api/admin/orders/{orderId}/generate-qr-images`

**Request**:
```http
POST /api/admin/orders/abc-123/generate-qr-images
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "success": true,
  "message": "3 QR kod görseli başarıyla oluşturuldu ve yüklendi.",
  "processedCount": 3,
  "generatedImages": [
    {
      "qr_code": "https://pasha-backend-production.up.railway.app/api/admin/scan-qr?qrCode=PASHA-1748123456789-ABC123DE",
      "imageUrl": "https://pashahome.s3.tebi.io/qr_codes/PASHA-1748123456789-ABC123DE.png"
    },
    {
      "qr_code": "https://pasha-backend-production.up.railway.app/api/admin/scan-qr?qrCode=PASHA-1748123456790-DEF456GH", 
      "imageUrl": "https://pashahome.s3.tebi.io/qr_codes/PASHA-1748123456790-DEF456GH.png"
    },
    {
      "qr_code": "https://pasha-backend-production.up.railway.app/api/admin/scan-qr?qrCode=PASHA-1748123456791-HIJ789KL",
      "imageUrl": "https://pashahome.s3.tebi.io/qr_codes/PASHA-1748123456791-HIJ789KL.png"
    }
  ]
}
```

---

### 3. QR Kod Okutma

**Endpoint**: `POST /api/admin/scan-qr` veya `GET /api/admin/scan-qr?qrCode={qrCode}`

**Request (POST)**:
```http
POST /api/admin/scan-qr
Content-Type: application/json

{
  "qrCode": "PASHA-1748123456789-ABC123DE"
}
```

**Request (GET)**:
```http
GET /api/admin/scan-qr?qrCode=PASHA-1748123456789-ABC123DE
```

**Response (İlk Okutma - 1/100)**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>QR Kod Okutuldu</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
        .success { color: #4CAF50; font-size: 24px; margin-bottom: 20px; }
        .info { font-size: 16px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">✅ QR Kod Başarıyla Okutuldu</div>
        <div class="info">QR kod okutuldu (1/100)</div>
        <div class="info">Sipariş: abc-123</div>
        <div class="info">Durum: CONFIRMED</div>
        <div class="info">Tarama Durumu: 0/3</div>
    </div>
</body>
</html>
```

**Response (100. Okutma - QR Kod Tamamlandı)**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>QR Kod Tamamlandı</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; }
        .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
        .success { color: #4CAF50; font-size: 24px; margin-bottom: 20px; }
        .info { font-size: 16px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">🎉 QR Kod Tamamlandı!</div>
        <div class="info">QR kod tamamlandı! (100/100)</div>
        <div class="info">Sipariş: abc-123</div>
        <div class="info">Durum: CONFIRMED</div>
        <div class="info">Tarama Durumu: 1/3</div>
    </div>
</body>
</html>
```

**Response (Tüm QR Kodlar Tamamlandı - Sipariş Teslim)**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Sipariş Teslim Edildi</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%); color: white; }
        .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
        .success { color: #4CAF50; font-size: 28px; margin-bottom: 20px; }
        .info { font-size: 18px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">🚚 Sipariş Teslim Edildi!</div>
        <div class="info">Tüm QR kodlar tamamlandı, sipariş teslim edildi!</div>
        <div class="info">Sipariş: abc-123</div>
        <div class="info">Durum: DELIVERED</div>
        <div class="info">Tarama Durumu: 3/3</div>
    </div>
</body>
</html>
```

---

### 4. Sipariş Detaylarını Getirme (QR Kodlar İle)

**Endpoint**: `GET /api/admin/orders/{orderId}`

**Request**:
```http
GET /api/admin/orders/abc-123
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "abc-123",
    "status": "CONFIRMED",
    "total_price": 75550.0,
    "created_at": "2025-01-15T09:00:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "user": {
      "name": "Test Kullanıcı",
      "email": "test@example.com",
      "Store": {
        "name": "Test Mağaza"
      }
    },
    "items": [
      {
        "id": "item-1",
        "product_id": "prod-1",
        "quantity": 100,
        "unit_price": 504.0,
        "product": {
          "name": "SUYOLU MAVİ",
          "collection": {
            "name": "SOHO SERİSİ"
          }
        }
      }
    ],
    "qr_codes": [
      {
        "id": "qr-1",
        "qr_code": "https://pasha-backend-production.up.railway.app/api/admin/scan-qr?qrCode=PASHA-1748123456789-ABC123DE",
        "scan_count": 45,
        "required_scans": 100,
        "is_scanned": false,
        "qrCodeImageUrl": "https://pashahome.s3.tebi.io/qr_codes/PASHA-1748123456789-ABC123DE.png",
        "order_item": {
          "id": "item-1",
          "product": {
            "name": "SUYOLU MAVİ"
          }
        },
        "product": {
          "productId": "prod-1",
          "name": "SUYOLU MAVİ"
        }
      },
      {
        "id": "qr-2",
        "qr_code": "https://pasha-backend-production.up.railway.app/api/admin/scan-qr?qrCode=PASHA-1748123456790-DEF456GH",
        "scan_count": 50,
        "required_scans": 50, 
        "is_scanned": true,
        "qrCodeImageUrl": "https://pashahome.s3.tebi.io/qr_codes/PASHA-1748123456790-DEF456GH.png",
        "order_item": {
          "id": "item-2",
          "product": {
            "name": "SUYOLU MAVİ"
          }
        },
        "product": {
          "productId": "prod-1",
          "name": "SUYOLU MAVİ"
        }
      },
      {
        "id": "qr-3",
        "qr_code": "https://pasha-backend-production.up.railway.app/api/admin/scan-qr?qrCode=PASHA-1748123456791-HIJ789KL",
        "scan_count": 8,
        "required_scans": 10,
        "is_scanned": false,
        "qrCodeImageUrl": "https://pashahome.s3.tebi.io/qr_codes/PASHA-1748123456791-HIJ789KL.png",
        "order_item": {
          "id": "item-3",
          "product": {
            "name": "SUYOLU MAVİ"
          }
        },
        "product": {
          "productId": "prod-1",
          "name": "SUYOLU MAVİ"
        }
      }
    ]
  }
}
```

---

### 5. Tüm Siparişleri Listele (QR Kodlar İle)

**Endpoint**: `GET /api/admin/orders`

**Request**:
```http
GET /api/admin/orders?page=1&limit=10
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "success": true,
  "orders": [
    {
      "id": "abc-123",
      "status": "CONFIRMED", 
      "total_price": 75550.0,
      "created_at": "2025-01-15T09:00:00Z",
      "user": {
        "name": "Test Kullanıcı",
        "email": "test@example.com"
      },
      "qr_codes": [
        {
          "id": "qr-1",
          "scan_count": 45,
          "required_scans": 100,
          "is_scanned": false
        },
        {
          "id": "qr-2", 
          "scan_count": 50,
          "required_scans": 50,
          "is_scanned": true
        },
        {
          "id": "qr-3",
          "scan_count": 8,
          "required_scans": 10,
          "is_scanned": false
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalOrders": 47
  }
}
```

---

## Veritabanı Schema Değişiklikleri

### QRCode Tablosu

```sql
model QRCode {
  id              String     @id @default(uuid())
  order_id        String     // Hangi siparişe ait
  order_item_id   String?    // Hangi sipariş itemına ait
  product_id      String?    // Hangi ürüne ait
  qr_code         String     @unique
  qrCodeImageUrl  String?    @map("qr_code_image_url")
  is_scanned      Boolean    @default(false) // Tamamlandı mı?
  scanned_at      DateTime?  // Tamamlanma tarihi
  created_at      DateTime   @default(now())
  
  // Yeni alanlar
  scan_count      Int?       @default(0)      // Kaç kere okutuldu
  required_scans  Int?       @default(1)      // Kaç kere okutulması gerekiyor
  last_scan_at    DateTime?                   // Son okutma tarihi
  
  // Relations
  order         Order      @relation(fields: [order_id], references: [id], onDelete: Cascade)
  order_item    OrderItem? @relation(fields: [order_item_id], references: [id], onDelete: Cascade)  
  product       Product?   @relation(fields: [product_id], references: [productId], onDelete: Cascade)
}
```

---

## Hata Durumları

### QR Kod Zaten Tamamlandı
```json
{
  "success": false,
  "error": "Bu QR kod zaten tamamlandı (100/100 okutma)"
}
```

### Geçersiz QR Kod
```json
{
  "success": false, 
  "error": "Geçersiz QR kod"
}
```

### Sipariş Bulunamadı
```json
{
  "success": false,
  "error": "Sipariş bulunamadı"
}
```

---

## Test Senaryoları

### 1. Temel QR Kod Akışı
1. Sipariş oluştur (3 farklı ürün: 100, 50, 10 adet)
2. Siparişi onayla → 3 QR kod oluşur
3. QR1'i 100 kere okut → Tamamlanır
4. QR2'yi 50 kere okut → Tamamlanır  
5. QR3'ü 10 kere okut → Sipariş DELIVERED olur

### 2. Kısmi Okutma
1. QR1'i 45 kere okut → Henüz tamamlanmadı (45/100)
2. QR2'yi 30 kere okut → Henüz tamamlanmadı (30/50)
3. Sipariş durumu hala CONFIRMED

### 3. Hata Durumları
1. Tamamlanan QR kodu tekrar okut → Hata
2. Geçersiz QR kod okut → Hata
3. Olmayan sipariş için QR oluştur → Hata

---

## Önemli Notlar

- **QR kod formatı**: `https://pasha-backend-production.up.railway.app/api/admin/scan-qr?qrCode=PASHA-{timestamp}-{random}`
- **Geriye uyumluluk**: Eski `scan_count` ve `required_scans` alanları korundu
- **HTML response**: QR kod okutma endpoint'i artık JSON yerine HTML döndürür
- **Item bazlı**: Her sipariş item'ı için 1 QR kod, quantity kadar okutma gerekiyor
- **Otomatik teslim**: Tüm QR kodlar tamamlandığında sipariş otomatik DELIVERED olur 