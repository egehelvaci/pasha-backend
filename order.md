# SİPARİŞ API ENDPOINT'LERİ

Bu dosya Pasha Backend sipariş sistemi API endpoint'lerini içerir.
Tüm endpoint'ler JWT authentication gerektirir.

## İŞ MANTIKLARI

### Sipariş Verme Şartları

1. **Fiyat Listesi Limiti**: Mağazaya ait fiyat listesi varsa, sadece o fiyat listesinin limit tutarı kadar alışveriş yapılabilir.
2. **Açık Hesap Limiti**: Mağazanın açık hesap bakiyesi kontrol edilir:
   - **Sınırsız**: `limitsiz_acik_hesap = true` ise limit kontrolü yapılmaz
   - **Sınırlı**: Sipariş tutarı mevcut `acik_hesap_tutari` bakiyesini aşamaz
   - **Bakiye Kontrolü**: Direkt bakiye kontrolü yapılır (sipariş tutarı ≤ mevcut bakiye)
3. **Limit Aşımı**: Limitler aşılırsa uygun hata mesajı döner

### Sipariş Süreci

1. Kullanıcı sepetine ürün ekler
2. Sepet limiti kontrol edilir (opsiyonel)
3. Sepet onaylanır ve sipariş oluşturulur
4. **Otomatik Adres Bilgisi Ekleme**:
   - Mağaza adres bilgileri otomatik olarak siparişe eklenir
   - Teslimat adresi, kurum bilgileri, vergi bilgileri dahil edilir
5. **Sipariş Sonrası İşlemler** (otomatik):
   - Açık hesap tutarı sipariş tutarı kadar düşürülür
   - Fiyat listesi limiti sipariş tutarı kadar azaltılır
   - Fiyat listesi limiti biterse mağaza varsayılan fiyat listesine geçer
6. Sepet pasif duruma geçer

---

## AUTH GEREKSİNİMLERİ

Tüm isteklerde Authorization header'ı gereklidir:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## BASE URL

- **Local**: `http://localhost:3001/api/orders`
- **Production**: `https://your-domain.com/api/orders`

---

## ENDPOINT'LER

### 1. SEPET LİMİTİ KONTROLÜ

**Method**: `GET`  
**URL**: `/api/orders/check-limits`

Bu endpoint sipariş vermeden önce sepetteki ürünlerin limitleri aşıp aşmadığını kontrol eder.

#### Request
```http
GET /api/orders/check-limits
Authorization: Bearer <JWT_TOKEN>
```

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Limit kontrolü tamamlandı",
  "data": {
    "canProceed": true,
    "message": "Sipariş verilebilir",
    "requiresPayment": false,
    "cartTotal": "1250.75"
  }
}
```

#### Response (Fiyat Listesi Limiti Aşımı - 200)
```json
{
  "success": true,
  "message": "Limit kontrolü tamamlandı",
  "data": {
    "canProceed": false,
    "message": "Size uygun fiyat listesinden fazla miktarda alışveriş yapamazsınız",
    "requiresPayment": false,
    "cartTotal": "2500.00"
  }
}
```

#### Response (Açık Hesap Limiti Aşımı - 200)
```json
{
  "success": true,
  "message": "Limit kontrolü tamamlandı",
  "data": {
    "canProceed": false,
    "message": "Ödeme yapın",
    "requiresPayment": true,
    "cartTotal": "3000.00"
  }
}
```

#### Response (Sepet Boş - 400)
```json
{
  "success": false,
  "message": "Sepetiniz boş veya bulunamadı"
}
```

---

### 2. SEPETİ ONAYLA VE SİPARİŞ OLUŞTUR

**Method**: `POST`  
**URL**: `/api/orders/create-from-cart`

Kullanıcının aktif sepetini onaylayıp sipariş oluşturur.

#### Request
```http
POST /api/orders/create-from-cart
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "notes": "Özel teslimat talimatları (opsiyonel)"
}
```

#### Response (Success - 201)
```json
{
  "success": true,
  "message": "Sipariş başarıyla oluşturuldu",
  "data": {
    "order": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "user_id": "user-uuid",
      "cart_id": 15,
      "total_price": "1250.75",
      "status": "PENDING",
      
      // Mağaza adres bilgileri (otomatik eklenir)
      "delivery_address": "Atatürk Cad. No:123 Kadıköy/İstanbul",
      "store_name": "ABC Halı Mağazası",
      "store_tax_number": "1234567890",
      "store_tax_office": "Kadıköy",
      "store_phone": "+90 212 123 45 67",
      "store_email": "info@abchali.com",
      "store_fax": "+90 212 123 45 68",
      
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "items": [
        {
          "id": "item-uuid-1",
          "order_id": "550e8400-e29b-41d4-a716-446655440001",
          "product_id": "product-uuid",
          "quantity": 2,
          "unit_price": "45.50",
          "total_price": "273.00",
          "has_fringe": true,
          "width": "150.00",
          "height": "200.00",
          "cut_type": "standart",
          "product": {
            "productId": "product-uuid",
            "name": "Premium Halı",
            "description": "Yüksek kalite halı",
            "productImage": "https://example.com/image.jpg",
            "collection": {
              "collectionId": "col-123",
              "name": "Premium Koleksiyon",
              "code": "PREM"
            }
          }
        }
      ],
      "user": {
        "userId": "user-uuid",
        "name": "John",
        "surname": "Doe",
        "email": "john@example.com"
      },
      "cart": {
        "id": 15,
        "created_at": "2024-01-15T09:00:00.000Z"
      }
    }
  }
}
```

#### Response (Fiyat Listesi Limiti Aşımı - 400)
```json
{
  "success": false,
  "message": "Size uygun fiyat listesinden fazla miktarda alışveriş yapamazsınız",
  "requiresPayment": false
}
```

#### Response (Açık Hesap Limiti Aşımı - 400)
```json
{
  "success": false,
  "message": "Ödeme yapın",
  "requiresPayment": true
}
```

#### Response (Sepet Boş - 400)
```json
{
  "success": false,
  "message": "Sepet bulunamadı veya boş"
}
```

---

### 3. KULLANICININ TÜM SİPARİŞLERİNİ LİSTELE

**Method**: `GET`  
**URL**: `/api/orders/my-orders`

Kullanıcının verdiği tüm siparişleri sayfalama ile listeler.

#### Request
```http
GET /api/orders/my-orders?page=1&limit=10
Authorization: Bearer <JWT_TOKEN>
```

#### Query Parameters
- `page` (opsiyonel): Sayfa numarası (varsayılan: 1)
- `limit` (opsiyonel): Sayfa başına sipariş sayısı (varsayılan: 10, maksimum: 50)

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "user_id": "user-uuid",
        "cart_id": 15,
        "total_price": "1250.75",
        "status": "PENDING",
        
        // Mağaza adres bilgileri
        "delivery_address": "Atatürk Cad. No:123 Kadıköy/İstanbul",
        "store_name": "ABC Halı Mağazası",
        "store_tax_number": "1234567890",
        "store_phone": "+90 212 123 45 67",
        "store_email": "info@abchali.com",
        
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z",
        "items": [
          {
            "id": "item-uuid-1",
            "product_id": "product-uuid",
            "quantity": 2,
            "unit_price": "45.50",
            "total_price": "273.00",
            "has_fringe": true,
            "width": "150.00",
            "height": "200.00",
            "cut_type": "standart",
            "product": {
              "productId": "product-uuid",
              "name": "Premium Halı",
              "description": "Yüksek kalite halı",
              "collection": {
                "name": "Premium Koleksiyon",
                "code": "PREM"
              }
            }
          }
        ]
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "user_id": "user-uuid",
        "cart_id": 16,
        "total_price": "890.25",
        "status": "CONFIRMED",
        "delivery_address": "Atatürk Cad. No:123 Kadıköy/İstanbul",
        "store_name": "ABC Halı Mağazası",
        "created_at": "2024-01-14T15:20:00.000Z",
        "updated_at": "2024-01-14T16:00:00.000Z",
        "items": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### Response (Sipariş Yok - 200)
```json
{
  "success": true,
  "data": {
    "orders": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

---

### 4. SİPARİŞ DETAYINI GETİR

**Method**: `GET`  
**URL**: `/api/orders/{orderId}`

Belirtilen sipariş ID'sine ait sipariş detaylarını getirir.

#### Request
```http
GET /api/orders/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <JWT_TOKEN>
```

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "user-uuid",
    "cart_id": 15,
    "total_price": "1250.75",
    "status": "PENDING",
    
    // Mağaza adres bilgileri (otomatik eklenir)
    "delivery_address": "Atatürk Cad. No:123 Kadıköy/İstanbul",
    "store_name": "ABC Halı Mağazası",
    "store_tax_number": "1234567890",
    "store_tax_office": "Kadıköy",
    "store_phone": "+90 212 123 45 67",
    "store_email": "info@abchali.com",
    "store_fax": "+90 212 123 45 68",
    
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "items": [
      {
        "id": "item-uuid-1",
        "product_id": "product-uuid",
        "quantity": 2,
        "unit_price": "45.50",
        "total_price": "273.00",
        "has_fringe": true,
        "width": "150.00",
        "height": "200.00",
        "cut_type": "standart",
        "product": {
          "productId": "product-uuid",
          "name": "Premium Halı",
          "description": "Yüksek kalite halı",
          "collection": {
            "name": "Premium Koleksiyon",
            "code": "PREM"
          }
        }
      }
    ],
    "user": {
      "name": "John",
      "surname": "Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Response (Sipariş Bulunamadı - 404)
```json
{
  "success": false,
  "message": "Sipariş bulunamadı"
}
```

#### Response (Yetkisiz Erişim - 403)
```json
{
  "success": false,
  "message": "Bu siparişi görme yetkiniz yok"
}
```

---

## ÖRNEK KULLANIM SENARYOLARI

### Senaryo 1: Başarılı Sipariş Verme

```bash
# 1. Sepet limitini kontrol et
curl -X GET "http://localhost:3001/api/orders/check-limits" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. Limit uygunsa sipariş oluştur
curl -X POST "http://localhost:3001/api/orders/create-from-cart" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Acil teslimat"
  }'

# 3. Tüm siparişleri listele
curl -X GET "http://localhost:3001/api/orders/my-orders?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Belirli bir sipariş detayını kontrol et
curl -X GET "http://localhost:3001/api/orders/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Senaryo 2: Fiyat Listesi Limiti Aşımı

```bash
# Limit kontrolü
curl -X GET "http://localhost:3001/api/orders/check-limits" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
# {
#   "success": true,
#   "data": {
#     "canProceed": false,
#     "message": "Size uygun fiyat listesinden fazla miktarda alışveriş yapamazsınız"
#   }
# }

# Bu durumda sipariş verilemez, sepetten ürün çıkarılması gerekir
```

### Senaryo 3: Açık Hesap Limiti Aşımı

```bash
# Limit kontrolü
curl -X GET "http://localhost:3001/api/orders/check-limits" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
# {
#   "success": true,
#   "data": {
#     "canProceed": false,
#     "message": "Ödeme yapın",
#     "requiresPayment": true
#   }
# }

# Bu durumda önce ödeme yapılması gerekir
```

### Senaryo 4: Sipariş Geçmişi Görüntüleme

```bash
# Tüm siparişleri listele (ilk sayfa)
curl -X GET "http://localhost:3001/api/orders/my-orders" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Sayfalama ile 2. sayfayı getir
curl -X GET "http://localhost:3001/api/orders/my-orders?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
# {
#   "success": true,
#   "data": {
#     "orders": [...],
#     "pagination": {
#       "page": 2,
#       "limit": 5,
#       "total": 25,
#       "totalPages": 5
#     }
#   }
# }
```

---

## SİPARİŞ DURUMLAR

- **PENDING**: Bekleyen sipariş
- **CONFIRMED**: Onaylanmış sipariş
- **SHIPPED**: Kargoya verilmiş sipariş
- **DELIVERED**: Teslim edilmiş sipariş
- **CANCELED**: İptal edilmiş sipariş

---

## HATA KODLARI

- **200**: Başarılı işlem
- **201**: Başarılı sipariş oluşturma
- **400**: Geçersiz istek / Limit aşımı
- **401**: Kimlik doğrulama gerekli
- **403**: Yetkisiz erişim
- **404**: Sipariş bulunamadı
- **500**: Sunucu hatası

---

## ÖNEMLİ NOTLAR

1. **Sepet Durumu**: Sipariş oluşturulduktan sonra sepet otomatik olarak pasif duruma geçer.

2. **Limit Kontrolleri**:
   - Fiyat listesi limiti her zaman açık hesap limitinden önce kontrol edilir
   - Sınırsız açık hesap (`limitsiz_acik_hesap = true`) durumunda sadece fiyat listesi limiti kontrol edilir
   - **Açık hesap kontrolü**: Direkt mağazanın mevcut bakiyesi ile sipariş tutarı karşılaştırılır
   - **Güvenli kontrol**: Sipariş tutarı > mevcut bakiye ise red edilir

3. **Güvenlik**: Kullanıcılar sadece kendi siparişlerini görebilir ve oluşturabilir.

4. **Performans**: Sepet limiti kontrolü endpoint'i sipariş oluşturmadan önce kontrole yarar, gereksiz sipariş oluşturma denemelerini önler.

5. **Sipariş Sonrası İşlemler**: 
   - Açık hesap tutarı otomatik düşürülür
   - Fiyat listesi limiti güncellenir
   - Limit biterse varsayılan fiyat listesine geçiş yapılır

6. **İş Akışı**: Sepet → Limit Kontrolü → Sipariş Oluşturma → Otomatik Güncellemeler → Sipariş Takibi

---

## SİPARİŞ SONRASI OTOMATİK İŞLEMLER

Sipariş başarıyla oluşturulduktan sonra sistem otomatik olarak şu işlemleri gerçekleştirir:

### 1. Açık Hesap Güncelleme
- Mağazanın `acik_hesap_tutari` sipariş tutarı kadar düşürülür
- Sınırsız açık hesaba sahip mağazalar (`limitsiz_acik_hesap = true`) bu işlemden etkilenmez

### 2. Fiyat Listesi Limit Güncelleme
- Mağazaya atanmış fiyat listesinin `limit_amount` değeri sipariş tutarı kadar azaltılır
- Limit 0 veya altına düşerse otomatik olarak bir sonraki adım tetiklenir

### 3. Varsayılan Fiyat Listesine Geçiş
Fiyat listesi limiti bittiğinde:
- Mevcut fiyat listesi ataması (`StorePriceList`) silinir
- Sistemde tanımlı varsayılan fiyat listesi (`is_default = true`) bulunur
- Mağaza varsayılan fiyat listesine otomatik olarak atanır

### Örnek Senaryo
```
Başlangıç:
- Mağaza A'nın açık hesap tutarı: 5000 TL
- Atanmış özel fiyat listesi limiti: 2000 TL

1500 TL'lik sipariş sonrası:
- Açık hesap tutarı: 3500 TL (5000 - 1500)
- Fiyat listesi limiti: 500 TL (2000 - 1500)

Sonraki 800 TL'lik sipariş sonrası:
- Açık hesap tutarı: 2700 TL (3500 - 800)
- Fiyat listesi limiti: 0 TL (500 - 800, minimum 0)
- Mağaza varsayılan fiyat listesine geçer
```

Bu işlemler **hata durumunda sipariş oluşumunu engellemez**. İşlemler başarısız olursa sadece log tutulur ve sipariş normal şekilde oluşturulur.

---

## OTOMATİK ADRES BİLGİSİ EKLEMESİ

Sipariş oluşturulurken mağaza bilgileri otomatik olarak siparişe eklenir. Bu sayede her sipariş kendi teslimat adres bilgilerine sahip olur.

### Eklenen Adres Alanları

| Alan | Açıklama | Kaynak |
|------|----------|--------|
| `delivery_address` | Teslimat adresi | `Store.adres` |
| `store_name` | Mağaza/Kurum adı | `Store.kurum_adi` |
| `store_tax_number` | Vergi numarası | `Store.vergi_numarasi` |
| `store_tax_office` | Vergi dairesi | `Store.vergi_dairesi` |
| `store_phone` | Telefon | `Store.telefon` |
| `store_email` | E-posta | `Store.eposta` |
| `store_fax` | Faks numarası | `Store.faks_numarasi` |

### Avantajları

1. **Tutarlılık**: Her sipariş kendi adres bilgilerine sahip olur
2. **Geçmiş Koruma**: Mağaza adresi değişse bile eski siparişlerin adresi korunur
3. **Fatura Hazırlığı**: Fatura için gerekli tüm bilgiler siparişte hazır bulunur
4. **Manuel Giriş Gereksiz**: Kullanıcı adres girmek zorunda kalmaz

### Örnek Sipariş Adres Bilgisi

```json
{
  "id": "order-uuid",
  "delivery_address": "Atatürk Cad. No:123 Kadıköy/İstanbul",
  "store_name": "ABC Halı Mağazası",
  "store_tax_number": "1234567890",
  "store_tax_office": "Kadıköy",
  "store_phone": "+90 212 123 45 67",
  "store_email": "info@abchali.com",
  "store_fax": "+90 212 123 45 68"
}
```

**Not**: Mağaza adres bilgileri eksikse (null), ilgili alanlar da null olarak kaydedilir.

---

## 5. QR KOD OKUTMA API'LERİ

### 5.1 TEK QR KOD OKUTMA

**Method**: `POST`  
**URL**: `/api/admin/scan-qr`

Admin kullanıcı için tek QR kod okutma işlemi. Tüm QR kodlar okunduğunda sipariş otomatik olarak DELIVERED durumuna geçer.

#### Request
```http
POST /api/admin/scan-qr
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "qrCode": "PASHA-1641234567890-ABC123DEF456"
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "QR kod başarıyla okundu",
  "data": {
    "qrCode": {
      "id": "qr-uuid-001",
      "qr_code": "PASHA-1641234567890-ABC123DEF456",
      "is_scanned": true,
      "scanned_at": "2024-01-15T12:30:00.000Z"
    },
    "productDetails": {
      "id": "product-uuid",
      "name": "Premium Halı",
      "description": "Yüksek kalite halı"
    },
    "order": {
      "id": "order-uuid-123",
      "status": "CONFIRMED",
      "customer": {
        "name": "Müşteri Adı",
        "email": "musteri@example.com"
      }
    },
    "deliveryInfo": {
      "scannedCount": 1,
      "totalCount": 3,
      "isOrderCompleted": false,
      "completionPercentage": 33
    }
  }
}
```

#### Response (Sipariş Tamamlandı - 200)
```json
{
  "success": true,
  "message": "QR kod okundu ve sipariş teslim edildi!",
  "data": {
    "deliveryInfo": {
      "scannedCount": 3,
      "totalCount": 3,
      "isOrderCompleted": true,
      "completionPercentage": 100
    },
    "order": {
      "status": "DELIVERED"
    }
  }
}
```

---

### 5.2 ÇOKLU QR KOD OKUTMA (YENİ!)

**Method**: `POST`  
**URL**: `/api/admin/scan-qr-multiple`

Admin kullanıcı için birden çok QR kod okutma işlemi. Tüm QR kodlar aynı siparişe ait olmalıdır. Hepsinin başarıyla okunması durumunda sipariş otomatik olarak DELIVERED durumuna geçer.

#### Request
```http
POST /api/admin/scan-qr-multiple
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "qrCodes": [
    "PASHA-1641234567890-ABC123DEF456",
    "PASHA-1641234567891-DEF456GHI789",
    "PASHA-1641234567892-GHI789JKL012"
  ]
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "3 QR kod başarıyla okundu ve sipariş teslim edildi!",
  "data": {
    "results": [
      {
        "qrCode": "PASHA-1641234567890-ABC123DEF456",
        "id": "qr-uuid-001",
        "productName": "Premium Halı",
        "scanned_at": "2024-01-15T12:30:00.000Z"
      },
      {
        "qrCode": "PASHA-1641234567891-DEF456GHI789",
        "id": "qr-uuid-002",
        "productName": "Lüks Halı",
        "scanned_at": "2024-01-15T12:30:01.000Z"
      },
      {
        "qrCode": "PASHA-1641234567892-GHI789JKL012",
        "id": "qr-uuid-003",
        "productName": "Klasik Halı",
        "scanned_at": "2024-01-15T12:30:02.000Z"
      }
    ],
    "errors": [],
    "deliveryInfo": {
      "scannedCount": 3,
      "totalCount": 3,
      "isOrderCompleted": true,
      "completionPercentage": 100
    },
    "orderInfo": {
      "id": "order-uuid-123",
      "status": "DELIVERED",
      "total_price": "1250.75",
      "customer": {
        "name": "Müşteri Adı",
        "email": "musteri@example.com",
        "store": {
          "kurum_adi": "ABC Halı Mağazası"
        }
      },
      "updated_at": "2024-01-15T12:30:02.000Z"
    },
    "summary": {
      "totalSubmitted": 3,
      "successfullyScanned": 3,
      "failed": 0,
      "isOrderCompleted": true
    }
  }
}
```

#### Response (Kısmi Başarı - 200)
```json
{
  "success": true,
  "message": "2 QR kod başarıyla okundu, 1 QR kod başarısız",
  "data": {
    "results": [
      {
        "qrCode": "PASHA-1641234567890-ABC123DEF456",
        "id": "qr-uuid-001",
        "productName": "Premium Halı",
        "scanned_at": "2024-01-15T12:30:00.000Z"
      },
      {
        "qrCode": "PASHA-1641234567891-DEF456GHI789",
        "id": "qr-uuid-002",
        "productName": "Lüks Halı",
        "scanned_at": "2024-01-15T12:30:01.000Z"
      }
    ],
    "errors": [
      {
        "qrCode": "INVALID-QR-CODE-123",
        "error": "Geçersiz QR kod"
      }
    ],
    "deliveryInfo": {
      "scannedCount": 2,
      "totalCount": 3,
      "isOrderCompleted": false,
      "completionPercentage": 67
    },
    "orderInfo": null,
    "summary": {
      "totalSubmitted": 3,
      "successfullyScanned": 2,
      "failed": 1,
      "isOrderCompleted": false
    }
  }
}
```

#### Response (Hata Durumları)

**Geçersiz QR Kodlar (400)**
```json
{
  "success": false,
  "message": "Hiçbir QR kod başarıyla okunamadı"
}
```

**Maksimum Limit Aşımı (400)**
```json
{
  "success": false,
  "message": "Bir seferde maksimum 50 QR kod okutabilirsiniz"
}
```

**Farklı Siparişlerden QR Kodlar (400)**
```json
{
  "success": false,
  "message": "QR kodlar farklı siparişlere ait"
}
```

**Yetkisiz Erişim (401)**
```json
{
  "success": false,
  "message": "Yetkisiz erişim"
}
```

---

### QR KOD OKUTMA ÖZELLİKLERİ

#### ✅ Güvenlik
- Sadece admin kullanıcılar erişebilir
- JWT token gerekli
- Tüm QR kodlar aynı siparişe ait olmalı

#### ✅ Performans
- Maksimum 50 QR kod tek seferde okutulabilir
- Paralel işlem desteği
- Hata toleransı (bazı QR kodlar başarısız olsa bile diğerleri işlenir)

#### ✅ Akıllı Sipariş Yönetimi
- Tüm QR kodlar okunduğunda sipariş otomatik DELIVERED durumuna geçer
- Kısmi okutma durumunda sipariş durumu değişmez
- Gerçek zamanlı ilerleme takibi

#### ✅ Hata Yönetimi
- Geçersiz QR kodlar raporlanır
- Zaten okunmuş QR kodlar tekrar okunamaz
- Detaylı hata mesajları

---

### ÖRNEK KULLANIM SENARYOLARI

#### Senaryo 1: Tüm QR Kodları Tek Seferde Okutma

```bash
# 1. Admin girişi
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Siparişin tüm QR kodlarını al
curl -X GET "http://localhost:3001/api/admin/orders/order-uuid-123/qrcodes" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Tüm QR kodları tek seferde okut
curl -X POST "http://localhost:3001/api/admin/scan-qr-multiple" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCodes": [
      "PASHA-1641234567890-ABC123DEF456",
      "PASHA-1641234567891-DEF456GHI789",
      "PASHA-1641234567892-GHI789JKL012"
    ]
  }'

# Sonuç: Sipariş DELIVERED durumuna geçer
```

#### Senaryo 2: Kısmi QR Kod Okutma

```bash
# Siparişin bazı QR kodlarını okut
curl -X POST "http://localhost:3001/api/admin/scan-qr-multiple" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCodes": [
      "PASHA-1641234567890-ABC123DEF456",
      "PASHA-1641234567891-DEF456GHI789"
    ]
  }'

# Sonuç: 2/3 QR kod okundu, sipariş hala CONFIRMED durumunda

# Kalan QR kodu da okut
curl -X POST "http://localhost:3001/api/admin/scan-qr" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "PASHA-1641234567892-GHI789JKL012"}'

# Sonuç: Sipariş DELIVERED durumuna geçer
```

#### Senaryo 3: Hatalı QR Kodlarla Karışık İşlem

```bash
curl -X POST "http://localhost:3001/api/admin/scan-qr-multiple" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCodes": [
      "PASHA-1641234567890-ABC123DEF456",  // Geçerli
      "INVALID-QR-CODE",                   // Geçersiz
      "PASHA-1641234567891-DEF456GHI789"   // Geçerli
    ]
  }'

# Sonuç: 
# - 2 QR kod başarıyla okunur
# - 1 QR kod hata verir
# - İşlem devam eder
```

---

## GELİŞTİRİCİ NOTLARI

- Tüm fiyat hesaplamaları Decimal tipinde yapılır
- Sipariş ID'leri UUID formatındadır
- Sepet ID'leri auto-increment integer'dır
- Veritabanı işlemleri transaction içinde yapılır
- Hata durumları detaylı loglanır
- **QR Kod Formatı**: `PASHA-{timestamp}-{randomHex}`
- **Çoklu QR Kod Limiti**: Maksimum 50 QR kod tek seferde
- **Otomatik Sipariş Teslimi**: Tüm QR kodlar okunduğunda DELIVERED durumu 