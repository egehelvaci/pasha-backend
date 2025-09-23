# Satıcı Alım Sepeti API Dokümantasyonu

Bu dokümantasyon, satıcı alım sepeti sisteminin API endpoint'lerini açıklar. Bu sistem normal müşteri sepetlerinden tamamen ayrı olarak çalışır ve sadece admin kullanıcılar tarafından satıcılardan ürün alımı için kullanılır.

## Base URL
```
/api/admin/purchase-management
```

## Authentication
Tüm endpoint'ler `authMiddleware` ile korunmaktadır. İstek header'ında valid JWT token bulunmalıdır:
```
Authorization: Bearer <token>
```

---

## Satıcı Alım Sepeti API'leri

### 1. Alım Sepetine Ürün Ekleme
**POST** `/suppliers/{supplier-id}/purchase-cart/items`

**Açıklama:** Belirtilen satıcının alım sepetine ürün ekler. Alış fiyatları otomatik olarak "Varsayılan Alış Fiyat Listesi"nden alınır ve USD cinsinden hesaplanır.

**Path Parameters:**
- `supplier-id` (string): Satıcı ID'si

**Body:**
```json
{
  "productId": "uuid",           // Zorunlu - Ürün ID'si
  "quantity": 5,                 // Zorunlu - Adet miktarı
  "width": 200.0,               // Zorunlu - Genişlik (cm)
  "height": 300.0,              // Zorunlu - Yükseklik (cm)
  "hasFringe": true,            // Zorunlu - Saçaklı mı?
  "cutType": "rectangle",       // Zorunlu - Kesim türü (rectangle, round, oval, hexagon, star)
  "notes": "Özel not"           // Opsiyonel - Notlar
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "purchase_cart_id": 45,
    "product_id": "uuid",
    "quantity": 5,
    "width": "200.00",
    "height": "300.00",
    "area_m2": "6.00",           // Otomatik hesaplanan m² (width × height ÷ 10000)
    "unit_price": "15.50",       // USD/m² alış fiyatı
    "total_price": "465.00",     // USD toplam fiyat (quantity × area_m2 × unit_price)
    "has_fringe": true,
    "cut_type": "rectangle",
    "notes": "Özel not",
    "created_at": "2024-01-15T10:30:00Z",
    "product": {
      "productId": "uuid",
      "name": "Premium Halı",
      "collection": {
        "collectionId": "uuid",
        "name": "SATEN SERİSİ"
      }
    }
  },
  "message": "Ürün alım sepetine eklendi"
}
```

### 2. Alım Sepetini Görüntüleme
**GET** `/suppliers/{supplier-id}/purchase-cart`

**Açıklama:** Belirtilen satıcının aktif alım sepetini ve toplam tutarını getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": 45,
      "supplier_id": "uuid",
      "user_id": "admin-user-id",
      "is_active": true,
      "created_at": "2024-01-15T09:00:00Z",
      "items": [
        {
          "id": 123,
          "product_id": "uuid",
          "quantity": 5,
          "width": "200.00",
          "height": "300.00",
          "area_m2": "6.00",
          "unit_price": "15.50",
          "total_price": "465.00",
          "has_fringe": true,
          "cut_type": "rectangle",
          "notes": "Özel not",
          "product": {
            "productId": "uuid",
            "name": "Premium Halı",
            "collection": {
              "name": "SATEN SERİSİ"
            }
          }
        }
      ],
      "supplier": {
        "id": "uuid",
        "name": "ABC Halı Tedarik",
        "company_name": "ABC Halı Tedarik Ltd. Şti.",
        "balance": "-1500.00"
      }
    },
    "total": {
      "amount": 465.00,           // USD toplam tutar
      "currency": "USD",
      "formatted": "$465.00"
    }
  },
  "message": "Alım sepeti başarıyla getirildi"
}
```

### 3. Alım Sepeti Öğesini Güncelleme
**PUT** `/suppliers/{supplier-id}/purchase-cart/items/{item-id}`

**Açıklama:** Alım sepetindeki belirli bir öğeyi günceller. Fiyatlar otomatik olarak yeniden hesaplanır.

**Path Parameters:**
- `supplier-id` (string): Satıcı ID'si
- `item-id` (number): Sepet öğesi ID'si

**Body:** (Tüm alanlar opsiyonel - sadece güncellenecek alanları gönderin)
```json
{
  "quantity": 8,                // Yeni adet miktarı
  "width": 250.0,              // Yeni genişlik
  "height": 350.0,             // Yeni yükseklik
  "hasFringe": false,          // Saçak durumu
  "cutType": "round",          // Yeni kesim türü
  "notes": "Güncellenen not"   // Yeni not
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "quantity": 8,
    "width": "250.00",
    "height": "350.00",
    "area_m2": "8.75",          // Yeniden hesaplanan m²
    "unit_price": "15.50",
    "total_price": "1085.00",   // Yeniden hesaplanan toplam
    "has_fringe": false,
    "cut_type": "round",
    "notes": "Güncellenen not"
    // ... diğer alanlar
  },
  "message": "Alım sepeti öğesi başarıyla güncellendi"
}
```

### 4. Alım Sepeti Öğesini Silme
**DELETE** `/suppliers/{supplier-id}/purchase-cart/items/{item-id}`

**Açıklama:** Alım sepetinden belirli bir öğeyi siler.

**Response:**
```json
{
  "success": true,
  "message": "Alım sepeti öğesi başarıyla silindi"
}
```

### 5. Alım Sepetinden Satın Alma İşlemi (ANA API)
**PUT** `/suppliers/{supplier-id}/balance`

**Açıklama:** Bu API istediğiniz şekilde çalışır:
- Supplier-id input olarak alınır
- Sepetteki tüm ürünler işlenir
- Exchange_rate kullanılmaz (direkt USD hesaplama)
- Normal sepetlerden ayrı çalışır
- Siparişlere dahil edilmez
- Ürün varyasyonları ve m²'leri stoklara eklenir
- Satıcının bakiyesinden (USD) düşülür
- Sepet temizlenir

**Path Parameters:**
- `supplier-id` (string): Satıcı ID'si

**Body:** (Bu API için body gerektirmez - sepetteki ürünler işlenir)

**Response:**
```json
{
  "success": true,
  "data": {
    "supplier": {
      "id": "uuid",
      "name": "ABC Halı Tedarik",
      "balance": "-2000.00",     // Güncellenmiş bakiye (USD)
      "currency": "USD"
    },
    "transaction": {
      "id": "uuid",
      "supplier_id": "uuid",
      "transaction_type": "CART_PURCHASE",
      "amount": -500.00,         // USD tutarı (negatif - borç artışı)
      "previous_balance": "-1500.00",
      "new_balance": "-2000.00",
      "description": "Alım sepetinden toplu satın alma - 3 ürün",
      "reference_number": "CART-1705320123456",
      "created_at": "2024-01-15T11:00:00Z"
    },
    "stockUpdates": [           // Hangi ürünlerde stok güncellemesi yapıldığı
      {
        "product_id": "uuid1",
        "variation_id": 1,
        "added_m2": 18.5
      },
      {
        "product_id": "uuid2", 
        "variation_id": 2,
        "added_m2": 12.3
      }
    ],
    "purchasedItems": [         // Satın alınan ürünlerin detayları
      {
        "product_id": "uuid1",
        "quantity": 3,
        "area_m2": "6.17",
        "total_price": "185.00",
        "product": {
          "name": "Premium Halı",
          "collection": {
            "name": "SATEN SERİSİ"
          }
        }
      }
    ],
    "totalAmount": 500.00       // Toplam satın alma tutarı (USD)
  },
  "message": "Alım sepetinden 3 ürün başarıyla satın alındı. Toplam: $500.00 USD"
}
```

---

## Kullanım Akışı

### Tipik Alım Süreci:

1. **Sepete ürünler ekleyin:**
   ```bash
   POST /suppliers/abc-123/purchase-cart/items
   # Her ürün için ayrı ayrı çağırın
   ```

2. **Sepeti kontrol edin:**
   ```bash
   GET /suppliers/abc-123/purchase-cart
   # Toplam tutarı ve ürünleri görün
   ```

3. **Gerekirse ürünleri düzenleyin:**
   ```bash
   PUT /suppliers/abc-123/purchase-cart/items/456
   # Miktar, boyut vb. güncelleyin
   ```

4. **Satın alma işlemini gerçekleştirin:**
   ```bash
   PUT /suppliers/abc-123/balance
   # Tüm sepet işlenir, stoklar güncellenir, bakiye düşer
   ```

---

## Önemli Notlar

### Fiyat Hesaplama
- Alış fiyatları "Varsayılan Alış Fiyat Listesi"nden otomatik alınır
- Fiyatlar USD cinsinden hesaplanır
- Alan hesaplama: `(width × height) ÷ 10000 = m²`
- Toplam fiyat: `quantity × area_m2 × unit_price_usd`

### Stok Yönetimi
- Satın alma işleminde mevcut varyasyonlar varsa ilk varyasyona stok eklenir
- Varyasyon yoksa yeni varyasyon oluşturulur
- `stock_area_m2` alanı güncellenir

### Sepet Yönetimi
- Her admin kullanıcının her satıcı için ayrı sepeti vardır
- Sepet işlem sonrası temizlenir (`is_active: false`)
- Aynı ürün özelliklerinde (boyut, kesim, saçak) varsa miktar toplanır

### Hata Durumları
- **400**: Geçersiz istek parametreleri
- **401**: Kimlik doğrulama hatası
- **404**: Satıcı/ürün bulunamadı
- **500**: Sunucu hatası

---

## Kesim Türleri (Cut Types)
Desteklenen kesim türleri:
- `rectangle` - Dikdörtgen
- `round` - Yuvarlak
- `oval` - Oval
- `hexagon` - Altıgen
- `star` - Yıldız

---

## Transaction Türleri
Satıcı bakiye işlemlerinde kullanılan yeni tip:
- `CART_PURCHASE` - Alım sepetinden toplu satın alma

Bu API sayesinde artık satıcılardan ürün alımını sepet sistemi ile kolayca yönetebilir, toplu alımlar yapabilir ve stok güncellemelerini otomatik olarak gerçekleştirebilirsiniz.
