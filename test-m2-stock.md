# 🧪 M² Bazlı Stok Yönetimi Test Senaryoları

## 📋 Özellik Özeti

✅ **Tamamlanan Özellikler:**
- Veritabanı şemasına `stock_area_m2` alanı eklendi
- ProductService'e hibrit stok fonksiyonları eklendi
- Admin API'lerine m² bazlı stok yönetimi eklendi
- Sipariş sistemine hibrit stok kontrolü eklendi
- QR kod servisine m² bazlı stok düşürme eklendi

## 🔧 API Endpoint'leri

### 1. M² Bazlı Stok Ekleme
```http
PATCH /api/products/{productId}/stock-area
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "width": 100,
  "height": 200,
  "areaM2": 10.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "...",
    "variations": [
      {
        "width": 100,
        "height": 200,
        "stockQuantity": 5,
        "stockAreaM2": 10.5,
        "pieceAreaM2": 2.0,
        "calculatedFromArea": 5
      }
    ]
  },
  "message": "10.5m² stok eklendi (5 adet halıya eşdeğer)"
}
```

### 2. Hibrit Stok Güncelleme
```http
PATCH /api/products/{productId}/stock-hybrid
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "width": 100,
  "height": 200,
  "quantity": 8,
  "areaM2": 16.0,
  "updateMode": "both"
}
```

## 📊 Test Senaryoları

### Senaryo 1: 100x200 Halı - M² Bazlı Stok Ekleme

**Başlangıç:**
- Ürün: 100x200cm halı (2m² alan)
- Mevcut stok: 0 adet, 0m²

**Test 1.1: M² Bazlı Stok Ekleme**
```bash
# 10m² stok ekle
curl -X PATCH "http://localhost:3000/api/products/{productId}/stock-area" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "width": 100,
    "height": 200,
    "areaM2": 10
  }'
```

**Beklenen Sonuç:**
- `stock_quantity`: 5 adet (10m² ÷ 2m² = 5)
- `stock_area_m2`: 10m²
- API Response: "10m² stok eklendi (5 adet halıya eşdeğer)"

### Senaryo 2: Opsiyonel Yükseklik - 200cm Genişlik

**Başlangıç:**
- Ürün kuralı: 200cm genişlik, max 400cm yükseklik (opsiyonel)
- Sipariş: 200x300cm (6m² alan)

**Test 2.1: 40m² Stok Ekleme**
```bash
curl -X PATCH "http://localhost:3000/api/products/{productId}/stock-area" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "width": 200,
    "height": 400,
    "areaM2": 40
  }'
```

**Test 2.2: Müşteri Siparişi Kontrolü**
```bash
# Sepete ekleme testi
curl -X POST "http://localhost:3000/api/cart/add" \
  -H "Authorization: Bearer {user_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "{productId}",
    "width": 200,
    "height": 300,
    "quantity": 6,
    "hasFringe": false,
    "cutType": "standart"
  }'
```

**Beklenen Sonuç:**
- Maksimum sipariş: 6 adet (40m² ÷ 6m² = 6.66 → 6)
- 7 adet sipariş verilirse hata: "m² limiti: 6 adet (40m²)"

### Senaryo 3: Hibrit Stok Kontrolü

**Test 3.1: Tutarlılık Kontrolü**
```bash
curl -X PATCH "http://localhost:3000/api/products/{productId}/stock-hybrid" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "width": 100,
    "height": 200,
    "quantity": 5,
    "areaM2": 15,
    "updateMode": "both"
  }'
```

**Beklenen Sonuç:**
```json
{
  "success": false,
  "message": "Adet ve m² değerleri tutarsız. 5 adet = 10.00m², ancak 15m² belirtildi.",
  "suggestions": {
    "fromQuantity": { "quantity": 5, "areaM2": 10 },
    "fromArea": { "quantity": 7, "areaM2": 15 }
  }
}
```

### Senaryo 4: Sipariş Onaylandığında Stok Düşürme

**Test 4.1: Sipariş Oluşturma ve Onaylama**
```bash
# 1. Sipariş oluştur
curl -X POST "http://localhost:3000/api/orders/create-from-cart" \
  -H "Authorization: Bearer {user_token}"

# 2. Admin sipariş onaylama
curl -X POST "http://localhost:3000/api/admin/orders/{orderId}/confirm" \
  -H "Authorization: Bearer {admin_token}"
```

**Beklenen Sonuç:**
- Hem `stock_quantity` hem `stock_area_m2` düşürülmeli
- QR kod oluşturulmalı
- Console log: "Hibrit stok güncellendi: X → Y adet, A → B m²"

## 🎯 Başarı Kriterleri

### ✅ Fonksiyonel Testler
- [ ] M² bazlı stok ekleme çalışıyor
- [ ] Adet-m² dönüşümü doğru hesaplanıyor
- [ ] Opsiyonel yükseklik maksimum m² kontrolü çalışıyor
- [ ] Hibrit stok kontrolü her iki limiti de dikkate alıyor
- [ ] Sipariş onaylandığında her iki stok türü de düşürülüyor

### ✅ API Testleri
- [ ] `/stock-area` endpoint'i çalışıyor
- [ ] `/stock-hybrid` endpoint'i çalışıyor
- [ ] Hata mesajları anlamlı ve Türkçe
- [ ] Response formatları tutarlı

### ✅ UI/UX Testleri
- [ ] Admin panelde m² bazlı stok ekleme arayüzü
- [ ] Müşteri siparişinde m² limiti uyarıları
- [ ] Stok durumu doğru gösteriliyor

## 🚨 Bilinen Limitasyonlar

1. **Mevcut Varyasyonlar**: Eski varyasyonlarda `stock_area_m2` null olabilir
2. **Veri Migrasyonu**: Mevcut stoklar için m² değeri hesaplanması gerekebilir
3. **Admin Panel UI**: Henüz arayüz eklenmedi

## 📈 Gelişim Önerileri

1. **Toplu Stok Güncelleme**: Excel import ile m² bazlı stok yükleme
2. **Stok Raporu**: Hem adet hem m² bazlı stok raporları
3. **Otomatik Dönüşüm**: Mevcut adet stoklarını m²'ye dönüştürme scripti
4. **Stok Alarm**: Kritik stok seviyesi uyarıları (hem adet hem m²) 