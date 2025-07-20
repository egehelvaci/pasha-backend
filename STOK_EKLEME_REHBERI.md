# STOK EKLEME REHBERİ

Bu dokümantasyon, opsiyonel yükseklik ve hazır kesim ürünlerde stok ekleme işlemlerini ve ürün detay API'sindeki değişiklikleri açıklar.

## 📦 STOK EKLEME İŞLEMLERİ

### 🔵 OPSIYONEL YÜKSEKLİK ÜRÜNLERİNDE STOK EKLEME

Opsiyonel yükseklik ürünlerde **sadece m² bazlı** stok yönetimi yapılır.

#### API Endpoint:
```
PATCH /api/products/{productId}/stock-area
```

#### Request Body:
```json
{
  "width": 80,
  "height": 10000,
  "areaM2": gi
}
```

#### Örnek Request:
```javascript
const response = await fetch('/api/products/007fe5f6-4df7-413d-b4ab-09e05cb305e7/stock-area', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  },
  body: JSON.stringify({
    width: 80,
    height: 10000,  // Maksimum yükseklik
    areaM2: 50       // Eklenecek m² stok
  })
});
```

#### Response:
```json
{
  "success": true,
  "data": {
    "productId": "007fe5f6-4df7-413d-b4ab-09e05cb305e7",
    "name": "ALA 03 İKON GRİ",
    "variations": [
      {
        "width": 80,
        "height": 10000,
        "stockQuantity": 6,
        "stockAreaM2": 50,
        "pieceAreaM2": 8,
        "calculatedFromArea": 6
      }
    ]
  },
  "message": "50m² stok eklendi (6 adet halıya eşdeğer)"
}
```

---

### 🔴 HAZIR KESİM ÜRÜNLERİNDE STOK EKLEME

Hazır kesim ürünlerde **sadece adet bazlı** stok yönetimi yapılır.

#### API Endpoint:
```
PATCH /api/products/{productId}/stock-hybrid
```

#### Request Body:
```json
{
  "width": 80,
  "height": 150,
  "quantity": 15,
  "updateMode": "quantity"
}
```

#### Örnek Request:
```javascript
const response = await fetch('/api/products/b188bb8e-ccc9-4f39-ad9a-47b2e9fa85ed/stock-hybrid', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  },
  body: JSON.stringify({
    width: 80,
    height: 150,        // Sabit boyut
    quantity: 15,       // Eklenecek adet
    updateMode: "quantity"  // Adet bazlı güncelleme
  })
});
```

#### Response:
```json
{
  "success": true,
  "data": {
    "productId": "b188bb8e-ccc9-4f39-ad9a-47b2e9fa85ed",
    "name": "SONSUZ BEYAZ",
    "stockInfo": {
      "quantity": 15,
      "areaM2": 0,
      "pieceAreaM2": 1.2,
      "updateMode": "quantity"
    }
  },
  "message": "Hibrit stok güncellendi"
}
```

---

## 📋 ÜRÜN DETAY API DEĞİŞİKLİKLERİ

### API Endpoint:
```
GET /api/products/{productId}
```

### Yeni Response Yapısı:

```json
{
  "success": true,
  "data": {
    "productId": "007fe5f6-4df7-413d-b4ab-09e05cb305e7",
    "name": "ALA 03 İKON GRİ",
    "description": "ALA SERİSİ - ALA 03 İKON GRİ",
    "productImage": "https://s3.tebi.io/pashahome/products/image.jpg",
    "collectionId": "f2e9d46b-68e4-4125-ae75-80a9437297fd",
    "rule_id": 1,
    "canHaveFringe": true,
    "hasFringe": true,
    "cutTypes": [
      {
        "id": 5,
        "name": "standart"
      },
      {
        "id": 6,
        "name": "oval"
      }
    ],
    "sizeOptions": [
      {
        "id": 14,
        "width": 80,
        "height": 10000,
        "is_optional_height": true,
        "stockQuantity": 6,
        "stockAreaM2": 50,
        "pieceAreaM2": 8
      }
    ]
  }
}
```

### Önemli Değişiklikler:

#### 1. **sizeOptions Array'ine Yeni Alanlar:**

| Alan | Tip | Açıklama |
|------|-----|----------|
| `is_optional_height` | boolean | Ürünün opsiyonel yükseklik olup olmadığı |
| `stockQuantity` | number | Mevcut adet stok |
| `stockAreaM2` | number | Mevcut m² stok |
| `pieceAreaM2` | number | Tek parça halının m² alanı |

#### 2. **Stok Kontrolü için Logic:**

```javascript
// Frontend'de stok kontrolü
const sizeOption = product.sizeOptions.find(so => 
  so.width === selectedWidth && so.height === selectedHeight
);

if (sizeOption.is_optional_height) {
  // Opsiyonel yükseklik: m² bazlı kontrol
  const requestedArea = (selectedWidth * selectedHeight / 10000) * quantity;
  const availableArea = sizeOption.stockAreaM2;
  
  if (requestedArea > availableArea) {
    alert(`Yeterli stok yok. Mevcut: ${availableArea}m²`);
  }
} else {
  // Hazır kesim: adet bazlı kontrol
  const availableQuantity = sizeOption.stockQuantity;
  
  if (quantity > availableQuantity) {
    alert(`Yeterli stok yok. Mevcut: ${availableQuantity} adet`);
  }
}
```

---

## 🎯 ÜRÜN TİPİ TANIMA

### Ürün Tipini Belirleme:
```javascript
function getProductType(sizeOptions) {
  if (sizeOptions.length === 0) return 'unknown';
  
  // Opsiyonel yükseklik kontrolü
  const hasOptionalHeight = sizeOptions.some(so => so.is_optional_height === true);
  
  if (hasOptionalHeight) {
    return 'optional_height';  // Opsiyonel yükseklik ürün
  } else {
    return 'fixed_size';       // Hazır kesim ürün
  }
}
```

### Kullanım Örneği:
```javascript
const productType = getProductType(product.sizeOptions);

switch (productType) {
  case 'optional_height':
    console.log('Bu ürün opsiyonel yükseklik - m² bazlı stok');
    break;
  case 'fixed_size':
    console.log('Bu ürün hazır kesim - adet bazlı stok');
    break;
  default:
    console.log('Ürün tipi belirlenemiyor');
}
```

---

## 📊 STOK DURUMU GÖSTERME

### Frontend'de Stok Durumu:

#### Opsiyonel Yükseklik için:
```javascript
function showOptionalHeightStock(sizeOption) {
  return `Mevcut Stok: ${sizeOption.stockAreaM2}m²`;
}
```

#### Hazır Kesim için:
```javascript
function showFixedSizeStock(sizeOption) {
  return `Mevcut Stok: ${sizeOption.stockQuantity} adet`;
}
```

#### Birleşik Fonksiyon:
```javascript
function showStockStatus(sizeOption) {
  if (sizeOption.is_optional_height) {
    return `Mevcut Stok: ${sizeOption.stockAreaM2}m²`;
  } else {
    return `Mevcut Stok: ${sizeOption.stockQuantity} adet`;
  }
}
```

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Opsiyonel Yükseklik Ürünlerde:**
   - Sadece m² stok takibi yapılır
   - `stockQuantity` bilgi amaçlı hesaplanır
   - Gerçek stok kontrolü `stockAreaM2` ile yapılır

2. **Hazır Kesim Ürünlerde:**
   - Sadece adet stok takibi yapılır
   - `stockAreaM2` her zaman 0'dır
   - Gerçek stok kontrolü `stockQuantity` ile yapılır

3. **Admin Panel için:**
   - Opsiyonel yükseklik ürünlerde m² girişi yapın
   - Hazır kesim ürünlerde adet girişi yapın
   - Yanlış endpoint kullanımından kaçının

4. **Stok Düşürme:**
   - Sistem otomatik olarak doğru mantığı uygular
   - Manuel müdahale gerektirmez
   - Her ürün tipi için özel logic çalışır 