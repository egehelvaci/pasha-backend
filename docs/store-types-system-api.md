# Mağaza Türleri Sistemi API Dokümantasyonu

## Genel Bakış

Bu sistem, mağazaları türlerine göre kategorize ederek QR kod ve fiş çıktılarında farklı formatlar sunar. Mağaza türüne göre müşterilere özel bilgiler gösterilir.

## Mağaza Türleri

### 1. KARGO
- **Açıklama**: Kargo ile teslimat yapılan mağazalar
- **QR Kod İçeriği**: Adres, telefon ve ürün bilgileri
- **Fiş Çıktısı**: Teslimat adresi, telefon ve ürün detayları

### 2. SERVIS  
- **Açıklama**: Servis hizmeti veren mağazalar
- **QR Kod İçeriği**: Müşteri adı, ürün adı, ebat, kesim türü
- **Fiş Çıktısı**: Müşteri bilgileri, ürün detayları, bakiye bilgileri

### 3. KENDI_ALAN
- **Açıklama**: Kendi alanında hizmet veren mağazalar  
- **QR Kod İçeriği**: Müşteri adı, ürün adı, ebat, kesim türü
- **Fiş Çıktısı**: Müşteri bilgileri, ürün detayları, bakiye bilgileri

### 4. AMBAR
- **Açıklama**: Ambar/depo türü mağazalar
- **QR Kod İçeriği**: Adres, telefon ve ürün bilgileri
- **Fiş Çıktısı**: Teslimat adresi, telefon ve ürün detayları

## Veritabanı Değişiklikleri

### Store Tablosu Yeni Alanı

```sql
-- Mağaza türü (varsayılan: KARGO)
store_type StoreType DEFAULT 'KARGO'
```

### Enum Tanımı

```prisma
enum StoreType {
  KARGO      // Kargo - adres telefon ve ürün bilgileri
  SERVIS     // Servis - müşteri adı ürün adı ebat kesim türü
  KENDI_ALAN // Kendi alan - müşteri adı ürün adı ebat kesim türü  
  AMBAR      // Ambar - adres telefon ve ürün bilgileri
}
```

## API Endpoint'leri

### 1. Mağaza Oluşturma

**Endpoint:** `POST /admin/stores`

**Body Parametreleri:**
```json
{
  "kurum_adi": "Örnek Mağaza",
  "vergi_numarasi": "1234567890",
  "vergi_dairesi": "Kadıköy",
  "telefon": "0212 123 45 67",
  "eposta": "info@ornek.com",
  "store_type": "KARGO",
  // ... diğer alanlar
}
```

**Başarılı Yanıt (201):**
```json
{
  "success": true,
  "data": {
    "store_id": "uuid",
    "kurum_adi": "Örnek Mağaza",
    "store_type": "KARGO",
    // ... diğer alanlar
  }
}
```

**Hata Yanıtları:**
```json
// Geçersiz mağaza türü (400)
{
  "success": false,
  "message": "Geçersiz mağaza türü. Geçerli türler: KARGO, SERVIS, KENDI_ALAN, AMBAR"
}
```

### 2. Mağaza Güncelleme

**Endpoint:** `PUT /admin/stores/:storeId`

**Body Parametreleri:**
```json
{
  "store_type": "SERVIS",
  // ... güncellenecek diğer alanlar
}
```

### 3. Mağaza Listesi

**Endpoint:** `GET /admin/stores`

**Yanıt:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "store_id": "uuid",
      "kurum_adi": "Örnek Mağaza",
      "store_type": "KARGO",
      // ... diğer alanlar
    }
  ]
}
```

## QR Kod Formatları

### KARGO ve AMBAR Türleri

```json
{
  "siparis_id": "order-uuid",
  "item_id": "item-uuid",
  "magaza_adi": "Örnek Mağaza",
  "telefon": "0212 123 45 67",
  "adres": "İstanbul Cad. No:123",
  "urun_adi": "Halı Modeli A",
  "koleksiyon": "Premium Koleksiyon",
  "miktar": 2,
  "ebat": "200x300",
  "kesim_turu": "rectangle",
  "tarih": "2024-01-15"
}
```

### SERVIS ve KENDI_ALAN Türleri

```json
{
  "siparis_id": "order-uuid",
  "item_id": "item-uuid",
  "musteri_adi": "Ahmet Yılmaz",
  "urun_adi": "Halı Modeli A",
  "koleksiyon": "Premium Koleksiyon",
  "miktar": 2,
  "ebat": "200x300",
  "kesim_turu": "rectangle",
  "saçak": "Var",
  "tarih": "2024-01-15"
}
```

## Fiş Çıktısı Formatları

### KARGO ve AMBAR Türleri

```json
{
  "siparis": {
    "id": "order-uuid",
    "siparisNumarasi": "12345678",
    "durum": "DELIVERED",
    "toplamTutar": 1500.00
  },
  "magaza": {
    "kurumAdi": "Örnek Mağaza",
    "telefon": "0212 123 45 67",
    "adres": "İstanbul Cad. No:123",
    "vergiNumarasi": "1234567890"
  },
  "teslimatBilgileri": {
    "adres": "Ana Mağaza: İstanbul Cad. No:123, Kadıköy İstanbul",
    "telefon": "0212 123 45 67"
  },
  "urunler": [
    {
      "urunAdi": "Halı Modeli A",
      "koleksiyon": "Premium Koleksiyon",
      "miktar": 2,
      "birimFiyat": 750.00,
      "toplamFiyat": 1500.00,
      "olculer": {
        "en": 200,
        "boy": 300,
        "ebat": "200x300"
      }
    }
  ],
  "fis": {
    "fisNumarasi": "FIS-12345678",
    "magazaTuru": "KARGO",
    "olusturmaTarihi": "2024-01-15T10:30:00.000Z"
  }
}
```

### SERVIS ve KENDI_ALAN Türleri

```json
{
  "siparis": {
    "id": "order-uuid",
    "siparisNumarasi": "12345678",
    "durum": "DELIVERED",
    "toplamTutar": 1500.00
  },
  "musteri": {
    "ad": "Ahmet",
    "soyad": "Yılmaz",
    "tamAd": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "telefon": "0532 123 45 67"
  },
  "magaza": {
    "kurumAdi": "Örnek Mağaza",
    "telefon": "0212 123 45 67",
    "magazaTuru": "SERVIS"
  },
  "urunler": [
    {
      "urunAdi": "Halı Modeli A",
      "koleksiyon": "Premium Koleksiyon",
      "miktar": 2,
      "birimFiyat": 750.00,
      "toplamFiyat": 1500.00,
      "olculer": {
        "en": 200,
        "boy": 300,
        "ebat": "200x300",
        "alanM2": 6.0
      },
      "ozellikler": {
        "kesimTuru": "rectangle",
        "sasakVar": "Var"
      }
    }
  ],
  "bakiye": {
    "siparisOncesi": 3000.00,
    "siparisSonrasi": 1500.00,
    "siparisKesintisi": 1500.00,
    "tarih": "2024-01-15T10:30:00.000Z"
  },
  "fis": {
    "fisNumarasi": "FIS-12345678",
    "magazaTuru": "SERVIS",
    "olusturmaTarihi": "2024-01-15T10:30:00.000Z"
  }
}
```

## Etkilenen API'ler

### Güncellenmiş API'ler

1. **Store Management APIs**
   - `POST /admin/stores` - Mağaza oluşturma
   - `PUT /admin/stores/:storeId` - Mağaza güncelleme  
   - `GET /admin/stores` - Mağaza listesi

2. **Store Statistics API**
   - `GET /store-statistics/balance` - Mağaza bakiye bilgileri

3. **Payment Service**
   - Mağaza bilgileri çekme metodları

4. **Order Service**
   - `GET /orders/:orderId/receipt` - Fiş çıktısı

5. **QR Code Service**
   - QR kod oluşturma ve içerik formatı

## Kullanım Örnekleri

### 1. Mağaza Türü ile Mağaza Oluşturma

```javascript
// KARGO türünde mağaza oluşturma
const response = await fetch('/admin/stores', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    kurum_adi: 'Kargo Mağazası',
    telefon: '0212 123 45 67',
    adres: 'İstanbul Cad. No:123',
    store_type: 'KARGO'
  })
});
```

### 2. Mağaza Türünü Güncelleme

```javascript
// Mağaza türünü SERVIS'e çevirme
const response = await fetch('/admin/stores/store-uuid', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    store_type: 'SERVIS'
  })
});
```

### 3. Mağaza Türüne Göre Fiş Alma

```javascript
// Fiş çıktısı alma (mağaza türüne göre otomatik format)
const response = await fetch('/orders/order-uuid/receipt', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const receiptData = await response.json();
console.log('Mağaza Türü:', receiptData.data.fis.magazaTuru);
```

## Geçiş Süreci

### Mevcut Mağazalar

- Mevcut tüm mağazalar varsayılan olarak `KARGO` türünde ayarlanır
- Admin panelinden mağaza türleri güncellenebilir
- Geçiş süreci sırasında eski fiş formatları çalışmaya devam eder

### Yeni Mağazalar

- Yeni mağaza oluştururken `store_type` belirtilmesi önerilir
- Belirtilmezse varsayılan olarak `KARGO` türü atanır

## Test Senaryoları

### 1. Pozitif Test Senaryoları

- ✅ Her mağaza türü için mağaza oluşturma
- ✅ Mağaza türü güncelleme
- ✅ KARGO/AMBAR türü için QR kod oluşturma
- ✅ SERVIS/KENDI_ALAN türü için QR kod oluşturma
- ✅ Mağaza türüne göre fiş çıktısı alma

### 2. Negatif Test Senaryoları

- ❌ Geçersiz mağaza türü ile mağaza oluşturma
- ❌ Geçersiz mağaza türü ile güncelleme
- ❌ Mevcut olmayan mağaza türü

## Performans Notları

1. **Veritabanı**: `store_type` alanı için indeks oluşturulması önerilir
2. **Önbellekleme**: Mağaza türü bilgileri sık kullanıldığı için önbelleklenebilir
3. **QR Kod**: Mağaza türüne göre QR kod içeriği dinamik olarak oluşturulur

## Versiyon Geçmişi

- **v1.0.0** (2024-01-15): İlk sürüm
  - Mağaza türleri sistemi
  - QR kod formatları
  - Fiş çıktısı formatları
  - API güncellemeleri
