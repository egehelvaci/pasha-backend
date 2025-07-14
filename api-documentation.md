# Pasha Backend API Dokümantasyonu

Bu dokümantasyon, Pasha Backend projesindeki tüm API endpoint'lerini, özellikle admin sipariş yönetimi sistemini detaylı bir şekilde açıklar.

## 📋 İçindekiler

1. [Genel Bilgiler](#genel-bilgiler)
2. [Kimlik Doğrulama](#kimlik-doğrulama)
3. [Admin Sipariş Yönetimi](#admin-sipariş-yönetimi)
4. [QR Kod Sistemi](#qr-kod-sistemi)
5. [Stok Yönetimi](#stok-yönetimi)
6. [Hata Yönetimi](#hata-yönetimi)
7. [Test Örnekleri](#test-örnekleri)

## 🌐 Genel Bilgiler

**Base URL:** 
- Lokal: `http://localhost:3001`
- Canlı: `https://your-domain.com`

**API Versiyonu:** v1

**Content-Type:** `application/json`

**Kimlik Doğrulama:** Bearer Token (JWT)

## 🔐 Kimlik Doğrulama

### Admin Girişi

**POST** `/api/auth/login`

Admin kullanıcısı giriş yapar ve JWT token alır.

**Request Body:**
```json
{
  "username": "admin_username",
  "password": "admin_password"
}
```

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "admin-uuid",
      "username": "admin",
      "name": "Admin",
      "surname": "User",
      "userType": {
        "name": "admin"
      }
    }
  }
}
```

**Response - Error (401):**
```json
{
  "success": false,
  "message": "Geçersiz kullanıcı adı veya şifre"
}
```

**Curl Örneği:**
```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## 📦 Admin Sipariş Yönetimi

### 1. Tüm Siparişleri Listele

**GET** `/api/admin/orders`

Admin tüm siparişleri listeler. Sayfalama ve filtreleme desteklenir.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parametreleri:**
- `page` (isteğe bağlı): Sayfa numarası (varsayılan: 1)
- `limit` (isteğe bağlı): Sayfa başına kayıt sayısı (varsayılan: 20)
- `status` (isteğe bağlı): Sipariş durumu filtresi

**Sipariş Durumları:**
- `PENDING`: Bekliyor
- `CONFIRMED`: Onaylandı (QR kodlar oluşturuldu)
- `SHIPPED`: Kargoya verildi
- `DELIVERED`: Teslim edildi
- `CANCELED`: İptal edildi

**Response - Success (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order-uuid-123",
        "user_id": "user-uuid-456",
        "cart_id": 789,
        "total_price": "1250.50",
        "status": "PENDING",
        "delivery_address": "İstanbul, Kadıköy, Örnek Mahallesi",
        "store_name": "Pasha Halı Mağazası",
        "store_tax_number": "1234567890",
        "store_tax_office": "Kadıköy Vergi Dairesi",
        "store_phone": "+90 555 123 45 67",
        "store_email": "info@pashastore.com",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z",
        "user": {
          "username": "magaza_kullanicisi",
          "name": "Ahmet",
          "surname": "Yılmaz",
          "Store": {
            "store_id": "store-uuid-789",
            "kurum_adi": "Pasha Halı Mağazası",
            "vergi_numarasi": "1234567890",
            "vergi_dairesi": "Kadıköy Vergi Dairesi",
            "telefon": "+90 555 123 45 67",
            "eposta": "info@pashastore.com",
            "adres": "İstanbul, Kadıköy, Örnek Mahallesi"
          }
        },
        "items": [
          {
            "id": "item-uuid-111",
            "product_id": "product-uuid-222",
            "quantity": 2,
            "unit_price": "125.25",
            "total_price": "250.50",
            "width": "150.00",
            "height": "200.00",
            "has_fringe": true,
            "cut_type": "standart",
            "product": {
              "name": "Premium Anadolu Halısı",
              "description": "El dokuması geleneksel desen halı",
              "productImage": "https://example.com/images/hali1.jpg"
            }
          },
          {
            "id": "item-uuid-333",
            "product_id": "product-uuid-444",
            "quantity": 1,
            "unit_price": "1000.00",
            "total_price": "1000.00",
            "width": "300.00",
            "height": "400.00",
            "has_fringe": false,
            "cut_type": "oval",
            "product": {
              "name": "Lüks Modern Halı",
              "description": "Contemporary tasarım halı"
            }
          }
        ],
        "qr_stats": {
          "total": 3,
          "scanned": 0,
          "pending": 3
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Curl Örneği:**
```bash
curl -X GET "http://localhost:3001/api/admin/orders?page=1&limit=10&status=PENDING" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Sipariş Detaylarını Getir

**GET** `/api/admin/orders/:orderId`

Belirli bir siparişin tüm detaylarını ve QR kod bilgilerini getirir.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response - Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid-123",
    "user_id": "user-uuid-456",
    "cart_id": 789,
    "total_price": "1250.50",
    "status": "CONFIRMED",
    "delivery_address": "İstanbul, Kadıköy, Örnek Mahallesi",
    "store_name": "Pasha Halı Mağazası",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z",
    "user": {
      "username": "magaza_kullanicisi",
      "name": "Ahmet",
      "surname": "Yılmaz",
      "userType": {
        "name": "store_user"
      },
      "Store": {
        "kurum_adi": "Pasha Halı Mağazası",
        "vergi_numarasi": "1234567890"
      }
    },
    "items": [
      {
        "id": "item-uuid-111",
        "product_id": "product-uuid-222",
        "quantity": 2,
        "unit_price": "125.25",
        "total_price": "250.50",
        "product": {
          "name": "Premium Anadolu Halısı",
          "collection": {
            "name": "Geleneksel Koleksiyon"
          }
        }
      }
    ],
    "qr_codes": [
      {
        "id": "qr-uuid-001",
        "qr_code": "PASHA-1705392600000-ABC123DEF456",
        "is_scanned": false,
        "scanned_at": null,
        "created_at": "2024-01-15T11:00:00.000Z",
        "product": {
          "name": "Premium Anadolu Halısı"
        }
      },
      {
        "id": "qr-uuid-002",
        "qr_code": "PASHA-1705392600001-DEF456GHI789",
        "is_scanned": true,
        "scanned_at": "2024-01-15T12:30:00.000Z",
        "created_at": "2024-01-15T11:00:00.000Z",
        "product": {
          "name": "Premium Anadolu Halısı"
        }
      }
    ],
    "qr_stats": {
      "total": 3,
      "scanned": 1,
      "pending": 2,
      "completionPercentage": 33
    }
  }
}
```

**Response - Error (404):**
```json
{
  "success": false,
  "message": "Sipariş bulunamadı"
}
```

**Curl Örneği:**
```bash
curl -X GET "http://localhost:3001/api/admin/orders/order-uuid-123" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Siparişi Onayla (QR Kod Oluştur + Stok Düşür)

**POST** `/api/admin/orders/:orderId/confirm`

Bekleyen bir siparişi onaylar. Bu işlem:
- Siparişteki her ürün adedi için ayrı QR kod oluşturur
- Ürün stoklarını düşürür (productvariations tablosunda)
- Sipariş durumunu CONFIRMED yapar

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Sipariş başarıyla onaylandı",
  "data": {
    "order": {
      "id": "order-uuid-123",
      "status": "CONFIRMED",
      "updated_at": "2024-01-15T11:00:00.000Z",
      "user": {
        "username": "magaza_kullanicisi",
        "Store": {
          "kurum_adi": "Pasha Halı Mağazası"
        }
      },
      "items": [
        {
          "id": "item-uuid-111",
          "product_id": "product-uuid-222",
          "quantity": 2,
          "product": {
            "name": "Premium Anadolu Halısı"
          }
        }
      ],
      "qr_codes": [
        {
          "id": "qr-uuid-001",
          "qr_code": "PASHA-1705392600000-ABC123DEF456",
          "is_scanned": false
        },
        {
          "id": "qr-uuid-002",
          "qr_code": "PASHA-1705392600001-DEF456GHI789",
          "is_scanned": false
        }
      ]
    },
    "qrCodes": [
      {
        "id": "qr-uuid-001",
        "order_id": "order-uuid-123",
        "product_id": "product-uuid-222",
        "order_item_id": "item-uuid-111",
        "qr_code": "PASHA-1705392600000-ABC123DEF456",
        "quantity": 1,
        "is_scanned": false,
        "scanned_at": null,
        "created_at": "2024-01-15T11:00:00.000Z"
      },
      {
        "id": "qr-uuid-002",
        "order_id": "order-uuid-123",
        "product_id": "product-uuid-222",
        "order_item_id": "item-uuid-111",
        "qr_code": "PASHA-1705392600001-DEF456GHI789",
        "quantity": 1,
        "is_scanned": false,
        "scanned_at": null,
        "created_at": "2024-01-15T11:00:01.000Z"
      }
    ],
    "totalQRCodes": 2
  }
}
```

**Response - Error (400):**
```json
{
  "success": false,
  "message": "Sadece bekleyen siparişler onaylanabilir"
}
```

**Response - Error (400) - Yetersiz Stok:**
```json
{
  "success": false,
  "message": "product-uuid-222 ürünü için yeterli stok yok. Mevcut: 5, İstenen: 10"
}
```

**Curl Örneği:**
```bash
curl -X POST "http://localhost:3001/api/admin/orders/order-uuid-123/confirm" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📱 QR Kod Sistemi

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
  "qrCode": "PASHA-1705392600000-ABC123DEF456"
}
```

**Response - Success (200) - QR Kod Okundu:**
```json
{
  "success": true,
  "message": "QR kod başarıyla okundu",
  "data": {
    "qrCode": {
      "id": "qr-uuid-001",
      "qr_code": "PASHA-1705392600000-ABC123DEF456",
      "is_scanned": true,
      "scanned_at": "2024-01-15T12:30:00.000Z",
      "order": {
        "id": "order-uuid-123",
        "status": "CONFIRMED",
        "user": {
          "username": "magaza_kullanicisi",
          "name": "Ahmet",
          "surname": "Yılmaz"
        },
        "items": [
          {
            "id": "item-uuid-111",
            "quantity": 2,
            "product": {
              "name": "Premium Anadolu Halısı"
            }
          }
        ]
      },
      "product": {
        "name": "Premium Anadolu Halısı",
        "description": "El dokuması geleneksel desen halı"
      },
      "order_item": {
        "id": "item-uuid-111",
        "quantity": 2,
        "unit_price": "125.25"
      }
    },
    "order": {
      "id": "order-uuid-123",
      "status": "CONFIRMED"
    },
    "scannedCount": 1,
    "totalCount": 3,
    "isOrderCompleted": false
  }
}
```

**Response - Success (200) - Sipariş Teslim Edildi:**
```json
{
  "success": true,
  "message": "QR kod okundu ve sipariş teslim edildi!",
  "data": {
    "qrCode": {
      "id": "qr-uuid-003",
      "qr_code": "PASHA-1705392600002-GHI789JKL012",
      "is_scanned": true,
      "scanned_at": "2024-01-15T13:00:00.000Z",
      "product": {
        "name": "Lüks Modern Halı"
      }
    },
    "order": {
      "id": "order-uuid-123",
      "status": "DELIVERED"
    },
    "scannedCount": 3,
    "totalCount": 3,
    "isOrderCompleted": true
  }
}
```

**Response - Error (400) - Geçersiz QR Kod:**
```json
{
  "success": false,
  "message": "Geçersiz QR kod"
}
```

**Response - Error (400) - QR Kod Zaten Okunmuş:**
```json
{
  "success": false,
  "message": "Bu QR kod daha önce okunmuş"
}
```

**Curl Örneği:**
```bash
curl -X POST "http://localhost:3001/api/admin/scan-qr" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "PASHA-1705392600000-ABC123DEF456"}'
```

### 5. Sipariş QR Kodlarını Listele

**GET** `/api/admin/orders/:orderId/qrcodes`

Bir siparişe ait tüm QR kodları listeler.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response - Success (200):**
```json
{
  "success": true,
  "data": {
    "qrCodes": [
      {
        "id": "qr-uuid-001",
        "order_id": "order-uuid-123",
        "product_id": "product-uuid-222",
        "order_item_id": "item-uuid-111",
        "qr_code": "PASHA-1705392600000-ABC123DEF456",
        "quantity": 1,
        "is_scanned": true,
        "scanned_at": "2024-01-15T12:30:00.000Z",
        "created_at": "2024-01-15T11:00:00.000Z",
        "product": {
          "name": "Premium Anadolu Halısı",
          "description": "El dokuması geleneksel desen halı"
        },
        "order_item": {
          "id": "item-uuid-111",
          "quantity": 2,
          "unit_price": "125.25",
          "total_price": "250.50"
        }
      },
      {
        "id": "qr-uuid-002",
        "order_id": "order-uuid-123",
        "product_id": "product-uuid-222",
        "order_item_id": "item-uuid-111",
        "qr_code": "PASHA-1705392600001-DEF456GHI789",
        "quantity": 1,
        "is_scanned": false,
        "scanned_at": null,
        "created_at": "2024-01-15T11:00:01.000Z",
        "product": {
          "name": "Premium Anadolu Halısı",
          "description": "El dokuması geleneksel desen halı"
        },
        "order_item": {
          "id": "item-uuid-111",
          "quantity": 2,
          "unit_price": "125.25",
          "total_price": "250.50"
        }
      }
    ],
    "scannedCount": 1,
    "totalCount": 2,
    "completionPercentage": 50
  }
}
```

**Curl Örneği:**
```bash
curl -X GET "http://localhost:3001/api/admin/orders/order-uuid-123/qrcodes" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📊 İstatistikler ve Durum Yönetimi

### 6. Sipariş İstatistikleri

**GET** `/api/admin/orders/stats`

Genel sipariş ve QR kod istatistiklerini getirir.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response - Success (200):**
```json
{
  "success": true,
  "data": {
    "orders": {
      "total": 150,
      "pending": 25,
      "confirmed": 45,
      "delivered": 70,
      "canceled": 10
    },
    "qrCodes": {
      "total": 380,
      "scanned": 280,
      "pending": 100,
      "completionRate": 74
    }
  }
}
```

**Curl Örneği:**
```bash
curl -X GET "http://localhost:3001/api/admin/orders/stats" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 7. Sipariş Durumunu Güncelle

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

**Response - Success (200):**
```json
{
  "success": true,
  "message": "Sipariş durumu güncellendi",
  "data": {
    "id": "order-uuid-123",
    "user_id": "user-uuid-456",
    "cart_id": 789,
    "total_price": "1250.50",
    "status": "SHIPPED",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T14:00:00.000Z",
    "user": {
      "username": "magaza_kullanicisi",
      "name": "Ahmet",
      "surname": "Yılmaz",
      "Store": {
        "kurum_adi": "Pasha Halı Mağazası"
      }
    },
    "items": [
      {
        "id": "item-uuid-111",
        "product_id": "product-uuid-222",
        "quantity": 2,
        "product": {
          "name": "Premium Anadolu Halısı"
        }
      }
    ]
  }
}
```

**Response - Error (400) - Geçersiz Durum:**
```json
{
  "success": false,
  "message": "Geçersiz sipariş durumu"
}
```

**Curl Örneği:**
```bash
curl -X PUT "http://localhost:3001/api/admin/orders/order-uuid-123/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"status": "SHIPPED"}'
```

---

## 📦 Stok Yönetimi

Sipariş onaylandığında otomatik stok düşürme işlemi `productvariations` tablosunda gerçekleşir.

### Stok Düşürme Mantığı

1. **Ürün Varyasyonu Eşleştirme:**
   - `product_id`: Siparişteki ürün ID'si
   - `width`: Siparişteki genişlik (matematiksel yuvarlanır)
   - `height`: Siparişteki yükseklik (matematiksel yuvarlanır)
   - `has_fringe`: Siparişteki saçak durumu

2. **Stok Kontrolü:**
   - Mevcut stok miktarı sipariş miktarından az ise hata döndürülür
   - Yeterli stok varsa miktar düşürülür

3. **Stok Güncelleme:**
   ```sql
   UPDATE productvariations 
   SET stock_quantity = stock_quantity - sipariş_miktarı
   WHERE product_id = ? AND width = ? AND height = ? AND has_fringe = ?
   ```

### Örnek Stok Kontrolü

**Sipariş Öncesi Stok:**
```json
{
  "id": 1,
  "product_id": "product-uuid-222",
  "width": 150,
  "height": 200,
  "has_fringe": true,
  "stock_quantity": 10
}
```

**Sipariş: 2 adet**

**Sipariş Sonrası Stok:**
```json
{
  "id": 1,
  "product_id": "product-uuid-222", 
  "width": 150,
  "height": 200,
  "has_fringe": true,
  "stock_quantity": 8
}
```

---

## ❌ Hata Yönetimi

### HTTP Durum Kodları

- **200 OK**: Başarılı işlem
- **400 Bad Request**: Geçersiz istek (eksik parametre, geçersiz veri)
- **401 Unauthorized**: Kimlik doğrulama hatası
- **403 Forbidden**: Yetki hatası
- **404 Not Found**: Kaynak bulunamadı
- **500 Internal Server Error**: Sunucu hatası

### Yaygın Hata Mesajları

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Yetkisiz erişim"
}
```

**400 Bad Request - Geçersiz QR Kod:**
```json
{
  "success": false,
  "message": "Geçersiz QR kod"
}
```

**400 Bad Request - QR Kod Zaten Okunmuş:**
```json
{
  "success": false,
  "message": "Bu QR kod daha önce okunmuş"
}
```

**400 Bad Request - Yetersiz Stok:**
```json
{
  "success": false,
  "message": "product-uuid-222 ürünü için yeterli stok yok. Mevcut: 5, İstenen: 10"
}
```

**400 Bad Request - Sipariş Durumu:**
```json
{
  "success": false,
  "message": "Sadece bekleyen siparişler onaylanabilir"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Sipariş bulunamadı"
}
```

---

## 🧪 Test Örnekleri

### Tam İş Akışı Testi

```bash
#!/bin/bash

# 1. Admin girişi
echo "1. Admin girişi yapılıyor..."
ADMIN_TOKEN=$(curl -s -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  jq -r '.data.token')

echo "Admin Token: $ADMIN_TOKEN"

# 2. Siparişleri listele
echo -e "\n2. Bekleyen siparişler listeleniyor..."
ORDER_ID=$(curl -s -X GET "http://localhost:3001/api/admin/orders?status=PENDING&limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | \
  jq -r '.data.orders[0].id')

echo "Order ID: $ORDER_ID"

# 3. Sipariş detaylarını getir
echo -e "\n3. Sipariş detayları getiriliyor..."
curl -s -X GET "http://localhost:3001/api/admin/orders/$ORDER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# 4. Siparişi onayla
echo -e "\n4. Sipariş onaylanıyor..."
curl -s -X POST "http://localhost:3001/api/admin/orders/$ORDER_ID/confirm" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# 5. QR kodları listele
echo -e "\n5. QR kodları listeleniyor..."
QR_CODES=$(curl -s -X GET "http://localhost:3001/api/admin/orders/$ORDER_ID/qrcodes" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.data.qrCodes[].qr_code')

# 6. QR kodları okut
echo -e "\n6. QR kodları okutiliyor..."
for qr_code in $QR_CODES; do
  echo "QR Code okutiliyor: $qr_code"
  curl -s -X POST "http://localhost:3001/api/admin/scan-qr" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"qrCode\":\"$qr_code\"}" | jq
  sleep 1
done

# 7. Final durum kontrolü
echo -e "\n7. Final sipariş durumu kontrol ediliyor..."
curl -s -X GET "http://localhost:3001/api/admin/orders/$ORDER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data | {id, status, qr_stats}'
```

### JavaScript Test Örneği

```javascript
// Admin API Test Fonksiyonu
async function testAdminOrderSystem() {
  const baseURL = 'http://localhost:3001';
  
  // 1. Admin girişi
  console.log('🔐 Admin girişi yapılıyor...');
  const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  const loginData = await loginResponse.json();
  const token = loginData.data.token;
  console.log('✅ Admin girişi başarılı');
  
  // 2. Siparişleri listele
  console.log('\n📋 Siparişler listeleniyor...');
  const ordersResponse = await fetch(`${baseURL}/api/admin/orders?status=PENDING&limit=1`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const ordersData = await ordersResponse.json();
  const orderId = ordersData.data.orders[0]?.id;
  
  if (!orderId) {
    console.log('❌ Bekleyen sipariş bulunamadı');
    return;
  }
  
  console.log(`✅ Sipariş bulundu: ${orderId}`);
  
  // 3. Siparişi onayla
  console.log('\n✅ Sipariş onaylanıyor...');
  const confirmResponse = await fetch(`${baseURL}/api/admin/orders/${orderId}/confirm`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const confirmData = await confirmResponse.json();
  console.log(`✅ Sipariş onaylandı, ${confirmData.data.totalQRCodes} QR kod oluşturuldu`);
  
  // 4. QR kodları al
  console.log('\n📱 QR kodları getiriliyor...');
  const qrResponse = await fetch(`${baseURL}/api/admin/orders/${orderId}/qrcodes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const qrData = await qrResponse.json();
  const qrCodes = qrData.data.qrCodes.map(qr => qr.qr_code);
  
  // 5. QR kodları okut
  console.log('\n🔍 QR kodları okutiliyor...');
  for (const qrCode of qrCodes) {
    const scanResponse = await fetch(`${baseURL}/api/admin/scan-qr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ qrCode })
    });
    
    const scanData = await scanResponse.json();
    console.log(`📱 QR kod okundu: ${qrCode.substring(0, 20)}...`);
    
    if (scanData.data.isOrderCompleted) {
      console.log('🎉 Sipariş teslim edildi!');
    }
  }
  
  // 6. Final durum
  console.log('\n📊 Final istatistikler...');
  const statsResponse = await fetch(`${baseURL}/api/admin/orders/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const statsData = await statsResponse.json();
  console.log('📈 İstatistikler:', statsData.data);
}

// Test çalıştır
testAdminOrderSystem().catch(console.error);
```

---

## 🔧 Geliştirme Notları

### QR Kod Formatı
```
PASHA-{timestamp}-{randomHex}
Örnek: PASHA-1705392600000-ABC123DEF456
```

### Veritabanı İlişkileri

```
Order (1) -----> (N) OrderItem
Order (1) -----> (N) QRCode
OrderItem (1) -> (N) QRCode
Product (1) ---> (N) QRCode
User (1) ------> (N) Order
Store (1) -----> (N) User -----> (N) Order
```

### Önemli Özellikler

- ✅ **İdempotency**: Aynı QR kod iki kez okutulamaz
- ✅ **Stok Kontrolü**: Yetersiz stok durumunda işlem iptal edilir
- ✅ **Otomatik Teslim**: Tüm QR kodlar okunduğunda sipariş DELIVERED olur
- ✅ **Admin Yetkilendirme**: Tüm endpoint'ler admin yetkisi gerektirir
- ✅ **Sayfalama**: Büyük veri setleri için pagination desteği
- ✅ **Filtreleme**: Sipariş durumuna göre filtreleme
- ✅ **İstatistikler**: Gerçek zamanlı sipariş ve QR kod istatistikleri

### Performans Optimizasyonları

- Paralel stok güncelleme işlemleri
- İndeksli veritabanı sorguları
- Optimize edilmiş JOIN operasyonları
- Sayfalama ile büyük veri yönetimi

---

## 📞 Destek

Herhangi bir sorun veya soru için:
- **Email**: support@pasha.com
- **API Versiyonu**: v1.0.0
- **Son Güncelleme**: 2024-01-15

---

*Bu dokümantasyon, Pasha Backend Admin Sipariş Yönetimi Sistemi v1.0.0 için hazırlanmıştır.* 