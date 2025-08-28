# Döviz Desteği - API Değişiklikleri

## 🔄 Güncellenmiş API'ler

### 1. **Login API**
**Endpoint:** `POST /api/auth/login`

**Response Değişikliği:**
```json
{
  "success": true,
  "data": {
    "token": "...",
    "user": {
      "userId": "...",
      "username": "...",
      "store": {
        "store_id": "...",
        "kurum_adi": "...",
        "bakiye": 5000,
        "currency": "USD", 
        "acik_hesap_tutari": 1000,
        "toplam_kullanilabilir": 6000
      }
    }
  }
}
```

---

### 2. **Mağaza Listeleme (Admin)**
**Endpoint:** `GET /api/admin/stores`

**Response Değişikliği:**
```json
{
  "success": true,
  "data": [
    {
      "store_id": "...",
      "kurum_adi": "Test Mağaza",
      "bakiye": 10000,
      "currency": "TRY",  // ✅ YENİ - Para birimi
      "users": [...],
      "priceLists": [...]
    }
  ]
}
```

---

### 3. **Mağaza Oluşturma (Admin)**
**Endpoint:** `POST /api/admin/stores`

**Request Body Değişikliği:**
```json
{
  "kurum_adi": "Yeni Mağaza",
  "vergi_numarasi": "1234567890",
  "currency": "USD",  // ✅ YENİ - Opsiyonel (varsayılan: TRY)
  "bakiye": 0,
  // Diğer alanlar...
}
```

**Geçerli Para Birimleri:** `TRY`, `USD`

---

### 4. **Mağaza Güncelleme (Admin)**
**Endpoint:** `PUT /api/admin/stores/:storeId`

**Request Body Değişikliği:**
```json
{
  "kurum_adi": "Güncellenmiş Mağaza",
  "currency": "USD",  // ✅ YENİ - Para birimini değiştir
  "bakiye": 5000,     // Artık currency'e göre yorumlanır
  // Diğer alanlar...
}
```

---

### 5. **Ödeme API - Checkout**
**Endpoint:** `POST /api/payment/checkout`

**Request Body Değişikliği:**
```json
{
  "storeId": "...",
  "userId": "...",
  "amount": 100,
  "currencyCode": "USD",  // ✅ YENİ - Opsiyonel (varsayılan: mağazanın para birimi)
  "aciklama": "Ödeme açıklaması",
  "channel": "web"
}
```

**Davranış:**
- `currencyCode` belirtilmezse → Mağazanın varsayılan para birimi kullanılır
- Farklı para birimi belirtilirse → Otomatik çevrim yapılır

---

### 6. **Ödeme API - Payment Request**
**Endpoint:** `POST /api/payment/create-request`

**Request Body Değişikliği:**
```json
{
  "storeId": "...",
  "userId": "...",
  "amount": 100,
  "currencyCode": "TRY",  // ✅ YENİ - Opsiyonel
  "aciklama": "Ödeme"
}
```

---

### 7. **Sipariş İptal (Admin)**
**Endpoint:** `POST /api/admin/orders/cancel`

**Yeni Davranış:**
- ✅ DELIVERED (Teslim edilmiş) siparişler artık iptal edilebilir
- İptal edildiğinde stok ve bakiye iadesi otomatik yapılır
- Para birimi mağazanın currency ayarına göre işlenir

**Request Body (Değişmedi):**
```json
{
  "orderId": "...",
  "reason": "Müşteri iade talebi"
}
```

---

## 💱 Döviz Çevrimi Mantığı

### Senaryolar:

#### 1. **USD Mağaza + TRY Ödeme**
```json
// Request
{
  "storeId": "usd-store",
  "amount": 4096,
  "currencyCode": "TRY"
}

// Sonuç
// 4096 TRY → ~100 USD'ye çevrilir
// Mağaza bakiyesine 100 USD eklenir
```

#### 2. **TRY Mağaza + USD Ödeme**
```json
// Request
{
  "storeId": "try-store",
  "amount": 100,
  "currencyCode": "USD"
}

// Sonuç
// 100 USD → ~4096 TRY'ye çevrilir
// Mağaza bakiyesine 4096 TRY eklenir
```

#### 3. **Para Birimi Belirtilmemiş**
```json
// Request
{
  "storeId": "usd-store",
  "amount": 100
  // currencyCode yok
}

// Sonuç
// Mağaza USD kullandığı için 100 USD olarak işlenir
```

---

## 📊 Kur Kaynağı

**Anlık Döviz Kuru Kaynakları (Öncelik Sırası):**
1. **TCMB XML API** - `https://www.tcmb.gov.tr/kurlar/today.xml`
2. **ExchangeRate-API** - Alternatif kaynak
3. **Veritabanı** - Son kaydedilen kur (fallback)

**Cache Süresi:** 1 saat

---

## 🗄️ Veritabanı Değişiklikleri

### Store Tablosu
```sql
-- Eklenen alan
currency  Currency  DEFAULT 'TRY'  -- Para birimi (TRY veya USD)

-- Kaldırılan alan
bakiye_usd  -- ❌ KALDIRILDI
```

### ExchangeRate Tablosu (Yeni)
```sql
CREATE TABLE exchange_rates (
  id              UUID PRIMARY KEY,
  source_currency Currency DEFAULT 'TRY',
  target_currency Currency DEFAULT 'USD',
  rate            DECIMAL(10,4),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMP,
  updated_at      TIMESTAMP
);
```

---

## ⚠️ Önemli Notlar

1. **Geriye Uyumluluk:** Mevcut API'ler çalışmaya devam edecek
2. **Varsayılan Değerler:** 
   - `currency` belirtilmezse → `TRY`
   - `currencyCode` belirtilmezse → Mağazanın para birimi
3. **Tek Bakiye:** Artık sadece `bakiye` alanı var, `bakiye_usd` kaldırıldı
4. **Otomatik Çevrim:** Farklı para birimleri otomatik çevrilir

---

## 📝 Örnek Kullanım

### USD Mağaza Oluşturma ve Ödeme Alma
```bash
# 1. USD mağaza oluştur
curl -X POST /api/admin/stores \
  -H "Authorization: Bearer {token}" \
  -d '{
    "kurum_adi": "Dollar Store",
    "currency": "USD",
    "bakiye": 0
  }'

# 2. TRY ile ödeme al (otomatik çevrim)
curl -X POST /api/payment/checkout \
  -H "Authorization: Bearer {token}" \
  -d '{
    "storeId": "{store_id}",
    "amount": 4096,
    "currencyCode": "TRY"
  }'

# Sonuç: Mağazaya 100 USD eklenir (4096 TRY / 40.96 = 100 USD)
```