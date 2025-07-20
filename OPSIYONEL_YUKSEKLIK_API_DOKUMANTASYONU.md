# Opsiyonel Yükseklik - API Dökümantasyonu

Bu döküman, opsiyonel yükseklik halıları için API endpoint'lerini ve kullanım şekillerini açıklar.

## 🎯 Sistem Mantığı

### Opsiyonel Yükseklik Ürünleri:
- **Stok Varyasyonu:** Maksimum boyutta tutulur (örn: 80×10000cm)
- **Müşteri Siparişi:** İstediği boyutta verebilir (örn: 80×300cm)
- **Stok Kontrolü:** Gerçek sipariş boyutuna göre m² hesaplanır
- **Stok Düşürme:** Gerçek sipariş boyutuna göre m² düşürülür

---

## 📡 API Endpoint'leri

### 1. Ürün Detayları Getirme

**Endpoint:** `GET /api/products/{productId}`

**Headers:**
```
Authorization: Bearer {userToken}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "007fe5f6-4df7-413d-b4ab-09e05cb305e7",
    "name": "ALA 03 İKON GRİ",
    "description": "ALA KADİFE SERİSİ - ALA 03 İKON GRİ",
    "sizeOptions": [
      {
        "id": 123,
        "width": 80,
        "height": 10000,
        "is_optional_height": true,
        "stockQuantity": 0,
        "stockAreaM2": 50.0,
        "pieceAreaM2": 80.0
      }
    ],
    "pricing": {
      "price": 504,
      "currency": "TRY"
    }
  }
}
```

**Opsiyonel Yükseklik Tanıma:**
- `is_optional_height: true` olan size option'lar opsiyoneldir
- `height` değeri maksimum yüksekliği gösterir
- `stockAreaM2` mevcut m² stokunu gösterir

---

### 2. Sepete Ekleme

**Endpoint:** `POST /api/cart/add`

**Headers:**
```
Authorization: Bearer {userToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "007fe5f6-4df7-413d-b4ab-09e05cb305e7",
  "width": 80,
  "height": 300,
  "quantity": 3,
  "hasFringe": false,
  "cutType": "standart"
}
```

**Response (Başarılı):**
```json
{
  "success": true,
  "message": "Ürün sepete eklendi",
  "data": {
    "id": 118,
    "product_id": "007fe5f6-4df7-413d-b4ab-09e05cb305e7",
    "quantity": 3,
    "width": 80,
    "height": 300,
    "area_m2": 7.2,
    "total_price": 3628.8
  }
}
```

**Response (Stok Yetersiz - Opsiyonel Yükseklik):**
```json
{
  "success": false,
  "message": "Yeterli stok yok. Seçilen boyut (80x300cm) için maksimum sipariş: 20 adet (Mevcut: 50m²)"
}
```

**Response (Stok Yetersiz - Hazır Kesim):**
```json
{
  "success": false,
  "message": "Yeterli stok yok. Seçilen boyut (200x300cm) için maksimum sipariş: 5 adet"
}
```

**Önemli Notlar:**
- `height` parametresi müşterinin istediği yükseklik
- Sistem otomatik olarak maksimum yükseklik kontrolü yapar
- Stok kontrolü gerçek sipariş boyutuna göre yapılır

---

### 3. Sepet Görüntüleme

**Endpoint:** `GET /api/cart`

**Headers:**
```
Authorization: Bearer {userToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 73,
    "items": [
      {
        "id": 118,
        "productId": "007fe5f6-4df7-413d-b4ab-09e05cb305e7",
        "quantity": 3,
        "width": 80,
        "height": 300,
        "area_m2": 7.2,
        "total_price": 3628.8,
        "has_fringe": false,
        "cut_type": "standart",
        "product": {
          "name": "ALA 03 İKON GRİ",
          "productImage": "https://s3.tebi.io/pashahome/products/xxx.jpg"
        }
      }
    ],
    "totalItems": 3,
    "totalPrice": 3628.8
  }
}
```

---

### 4. Sipariş Oluşturma

**Endpoint:** `POST /api/orders/create-from-cart`

**Headers:**
```
Authorization: Bearer {userToken}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Sipariş başarıyla oluşturuldu",
  "data": {
    "order": {
      "id": "46c04b24-96c1-4cbc-a7a9-801396ceb33b",
      "user_id": "9db66c32-acd1-4fff-b08c-cb725ad9da42",
      "total_price": "3628.8",
      "status": "PENDING",
      "items": [
        {
          "id": "25e01138-e2c2-4420-bb9f-b6d700f55606",
          "product_id": "007fe5f6-4df7-413d-b4ab-09e05cb305e7",
          "quantity": 3,
          "width": "80",
          "height": "300",
          "total_price": "3628.8"
        }
      ]
    }
  }
}
```

---

### 5. Admin - Sipariş Onaylama

**Endpoint:** `POST /api/admin/orders/{orderId}/confirm`

**Headers:**
```
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Sipariş onaylandı ve QR kod oluşturuldu",
  "data": {
    "orderId": "46c04b24-96c1-4cbc-a7a9-801396ceb33b",
    "status": "CONFIRMED",
    "qrCode": "PASHA-ABC123"
  }
}
```

**Stok Düşürme:**
- Sipariş onaylandığında ürün tipine göre stok düşürülür
- **Opsiyonel Yükseklik:** Gerçek sipariş boyutuna göre m² düşürülür (örn: 80×300cm × 3 adet = 7.2m²)
- **Hazır Kesim:** Sadece adet düşürülür (örn: 3 adet)

---

### 6. Admin - M² Bazlı Stok Ekleme

**Endpoint:** `PATCH /api/products/{productId}/stock-area`

**Headers:**
```
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "additionalAreaM2": 100.0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stok başarıyla güncellendi",
  "data": {
    "productId": "007fe5f6-4df7-413d-b4ab-09e05cb305e7",
    "variation": {
      "width": 80,
      "height": 10000,
      "previousStockAreaM2": 50.0,
      "newStockAreaM2": 150.0,
      "addedAreaM2": 100.0
    }
  }
}
```

---

### 7. Admin - Hibrit Stok Güncelleme

**Endpoint:** `PATCH /api/products/{productId}/stock-hybrid`

**Headers:**
```
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "width": 80,
  "height": 10000,
  "stockQuantity": 10,
  "stockAreaM2": 80.0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hibrit stok başarıyla güncellendi",
  "data": {
    "variation": {
      "width": 80,
      "height": 10000,
      "stock_quantity": 10,
      "stock_area_m2": 80.0
    },
    "consistency": {
      "isConsistent": true,
      "expectedAreaFromQuantity": 80.0,
      "actualArea": 80.0
    }
  }
}
```

---

### 8. Stok Durumu Kontrol

**Mevcut Product API'sini kullanın:**

**Endpoint:** `GET /api/products/{productId}?userId={userId}`

**Stok Bilgisi Hesaplama:**
```javascript
// Frontend'de stok durumu hesaplama
const sizeOption = product.sizeOptions.find(o => 
  o.width === selectedWidth && o.is_optional_height
);

if (sizeOption) {
  const selectedAreaM2 = (selectedWidth * selectedHeight) / 10000;
  const maxQuantityFromArea = Math.floor(sizeOption.stockAreaM2 / selectedAreaM2);
  
  console.log(`Mevcut stok: ${sizeOption.stockAreaM2}m²`);
  console.log(`Seçilen boyut için maksimum adet: ${maxQuantityFromArea}`);
}
```

---

## 🔍 Hata Kodları

### Sepete Ekleme Hataları:

| Hata | Açıklama |
|------|----------|
| `Seçilen boyut (...) bu ürün için geçerli değil` | Geçersiz boyut seçimi |
| `Maksimum yükseklik ...cm'dir` | Maksimum yükseklik aşıldı |
| `Yeterli stok yok. Seçilen boyut için maksimum sipariş: X adet` | Stok yetersiz |
| `Bu ürün saçaklı olamaz` | Saçak seçimi uygun değil |

### Stok Güncelleme Hataları:

| Hata | Açıklama |
|------|----------|
| `Ürün bulunamadı` | Geçersiz product ID |
| `Bu ürün için varyasyon bulunamadı` | Size option mevcut değil |
| `Negatif stok değeri verilemez` | Geçersiz stok miktarı |

---

## 📊 Stok Takip Sistemi

### Yeni Stok Mantığı:

1. **Hazır Kesim Ürünler:** Sadece `stock_quantity` (adet) kontrol edilir ve düşürülür
2. **Opsiyonel Yükseklik Ürünler:** Sadece `stock_area_m2` (m²) kontrol edilir ve düşürülür
3. **Otomatik Tanıma:** Sistem ürün tipini otomatik tanır (`is_optional_height` flag'i)
4. **Stok Düşürme:** Ürün tipine göre sadece ilgili stok türü düşürülür

### Opsiyonel Yükseklik İçin:

- **Varyasyon:** 80×10000cm (maksimum boyut)
- **Sipariş:** 80×300cm (müşteri seçimi)
- **Alan Hesabı:** (80 × 300) ÷ 10000 = 2.4m²
- **Stok Kontrolü:** 2.4m² × adet = toplam alan
- **Stok Düşürme:** Hesaplanan toplam alan kadar düşürülür

---

## 🎯 Önemli Notlar

1. **API Endpoint'leri değişmedi** - Mevcut API'lar kullanılabilir
2. **Stok kontrol mantığı backend'de düzeltildi**
3. **Geriye uyumluluk korundu** - Hazır kesim ürünler etkilenmedi
4. **Authentication gerekli** - Tüm endpoint'ler token doğrulaması yapar
5. **Error handling** - Hata durumları detaylı mesajlarla döner

Bu API dökümantasyonu opsiyonel yükseklik sisteminin frontend entegrasyonu için tüm gerekli bilgileri içerir. 