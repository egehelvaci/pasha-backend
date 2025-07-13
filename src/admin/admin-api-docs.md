# ADMIN API DOCUMENTATION

Bu dosya Pasha Backend admin API endpoint'lerini içerir.
Tüm admin endpoint'leri JWT authentication ve admin rolü gerektirir.

## Authentication

Tüm isteklerde Authorization header'ı gereklidir:
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

## Base URL

- **Local**: `http://localhost:3001/api/admin`
- **Production**: `https://your-domain.com/api/admin`

---

## SİPARİŞ YÖNETİMİ

### 1. TÜM SİPARİŞLERİ DETAYLARLA LİSTELE

**Method**: `GET`  
**URL**: `/api/admin/orders`

Admin için tüm siparişleri detaylarıyla birlikte listeler.

#### Query Parameters
- `page` (optional): Sayfa numarası (default: 1)
- `limit` (optional): Sayfa başına öğe sayısı (default: 20)
- `status` (optional): Sipariş durumu filtresi (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELED)
- `search` (optional): Mağaza adı, kullanıcı adı veya email ile arama

#### Request
```http
GET /api/admin/orders?page=1&limit=10&status=PENDING&search=Ahmet
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "user_id": "user123",
        "cart_id": 456,
        "total_price": "2500.75",
        "status": "PENDING",
        "delivery_address": "İstanbul, Türkiye",
        "store_name": "ABC Mağaza",
        "store_tax_number": "1234567890",
        "store_tax_office": "İstanbul Vergi Dairesi",
        "store_phone": "0212 555 0123",
        "store_email": "info@abcmağaza.com",
        "store_fax": "0212 555 0124",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "user": {
          "userId": "user123",
          "name": "Ahmet",
          "surname": "Yılmaz",
          "email": "ahmet@email.com",
          "phone": "0532 555 0123",
          "Store": {
            "store_id": "store123",
            "kurum_adi": "ABC Mağaza",
            "vergi_numarasi": "1234567890",
            "vergi_dairesi": "İstanbul Vergi Dairesi",
            "telefon": "0212 555 0123",
            "eposta": "info@abcmağaza.com",
            "adres": "İstanbul, Türkiye",
            "acik_hesap_tutari": "5000.00",
            "limitsiz_acik_hesap": false
          }
        },
        "items": [
          {
            "id": "item123",
            "order_id": "550e8400-e29b-41d4-a716-446655440001",
            "product_id": "product123",
            "quantity": 2,
            "unit_price": "125.50",
            "total_price": "251.00",
            "has_fringe": true,
            "width": "100.00",
            "height": "150.00",
            "cut_type": "rectangle",
            "product": {
              "productId": "product123",
              "name": "Halı Model A",
              "productImage": "https://example.com/image.jpg",
              "productCode": "HAL001",
              "collection": {
                "collectionId": "col123",
                "name": "Klasik Koleksiyon"
              }
            }
          }
        ],
        "cart": {
          "id": 456,
          "created_at": "2024-01-15T09:00:00Z",
          "updated_at": "2024-01-15T10:00:00Z"
        },
        "qr_codes": [
          {
            "id": "qr123",
            "qr_code": "QR_CODE_STRING",
            "quantity": 1,
            "is_scanned": false,
            "scanned_at": null,
            "created_at": "2024-01-15T10:30:00Z"
          }
        ],
        "order_summary": {
          "total_items": 2,
          "total_area_m2": 3.0,
          "items_with_fringe": 1,
          "unique_products": 1
        },
        "qr_stats": {
          "total": 2,
          "scanned": 0,
          "pending": 2,
          "scanned_percentage": 0
        },
        "customer_info": {
          "name": "Ahmet Yılmaz",
          "email": "ahmet@email.com",
          "phone": "0532 555 0123",
          "store_name": "ABC Mağaza",
          "store_tax_number": "1234567890",
          "store_address": "İstanbul, Türkiye"
        },
        "financial_info": {
          "total_price": 2500.75,
          "store_balance": 5000.00,
          "unlimited_account": false
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "status": "PENDING",
      "search": "Ahmet"
    }
  }
}
```

#### Response (Error - 500)
```json
{
  "success": false,
  "message": "Siparişler alınırken bir hata oluştu"
}
```

### 2. BELİRLİ BİR SİPARİŞİN DETAYLARINI GETİR

**Method**: `GET`  
**URL**: `/api/admin/orders/:orderId`

#### Request
```http
GET /api/admin/orders/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

### 3. SİPARİŞ DURUMU GÜNCELLE

**Method**: `PUT`  
**URL**: `/api/admin/orders/:orderId/status`

#### Request
```http
PUT /api/admin/orders/550e8400-e29b-41d4-a716-446655440001/status
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "status": "CONFIRMED"
}
```

### 4. SİPARİŞ İSTATİSTİKLERİ

**Method**: `GET`  
**URL**: `/api/admin/orders/stats`

#### Request
```http
GET /api/admin/orders/stats
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

---

## KULLANIM ÖRNEKLERİ

### Tüm Pending Siparişleri Listele
```bash
curl -X GET "http://localhost:3001/api/admin/orders?status=PENDING" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Belirli Mağaza ile Arama
```bash
curl -X GET "http://localhost:3001/api/admin/orders?search=ABC%20Mağaza" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Sayfalama ile Listeleme
```bash
curl -X GET "http://localhost:3001/api/admin/orders?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## RESPONSE AÇIKLAMALARI

### Order Summary
- `total_items`: Siparişteki toplam ürün adedi
- `total_area_m2`: Toplam alan (metrekare)
- `items_with_fringe`: Saçaklı ürün sayısı
- `unique_products`: Farklı ürün sayısı

### QR Stats
- `total`: Toplam QR kod sayısı
- `scanned`: Taranan QR kod sayısı
- `pending`: Bekleyen QR kod sayısı
- `scanned_percentage`: Tarama yüzdesi

### Customer Info
- Müşteri ve mağaza temel bilgileri
- Vergi bilgileri
- İletişim bilgileri

### Financial Info
- `total_price`: Sipariş toplam tutarı
- `store_balance`: Mağaza açık hesap bakiyesi
- `unlimited_account`: Sınırsız hesap durumu

---

## HATA KODLARI

- **200**: Başarılı işlem
- **401**: Kimlik doğrulama gerekli
- **403**: Admin yetkisi gerekli
- **404**: Sipariş bulunamadı
- **500**: Sunucu hatası

---

## FİLTRELEME VE ARAMA

### Status Filtreleri
- `PENDING`: Bekleyen siparişler
- `CONFIRMED`: Onaylanmış siparişler
- `SHIPPED`: Kargoya verilmiş siparişler
- `DELIVERED`: Teslim edilmiş siparişler
- `CANCELED`: İptal edilmiş siparişler

### Arama Kriterleri
- Kullanıcı adı
- Kullanıcı soyadı
- Email adresi
- Mağaza adı

Arama case-insensitive olarak çalışır ve kısmi eşleşmeleri destekler.

---

## PERFORMANS NOTLARI

- Sayfalama kullanarak büyük veri setlerinde performans sağlanır
- Default limit 20, maksimum 100 önerilir
- Arama ve filtreleme indeksli alanlar üzerinde yapılır
- QR kod istatistikleri gerçek zamanlı hesaplanır

---

## MAĞAZA YÖNETİMİ

### Mağaza Listesi
**GET** `/api/admin/stores`

### Mağaza Detayı
**GET** `/api/admin/stores/:storeId`

### Mağaza Güncelle
**PUT** `/api/admin/stores/:storeId`

---

## KULLANICI YÖNETİMİ

### Kullanıcı Listesi
**GET** `/api/admin/users`

### Kullanıcı Detayı
**GET** `/api/admin/users/:userId`

### Kullanıcı Oluştur
**POST** `/api/admin/users`

### Kullanıcı Güncelle
**PUT** `/api/admin/users/:userId`

### Kullanıcı Sil
**DELETE** `/api/admin/users/:userId` 