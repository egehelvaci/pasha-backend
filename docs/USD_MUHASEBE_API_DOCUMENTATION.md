# USD Mağazaları Muhasebe Sistemi API Dökümantasyonu

## Genel Bakış

USD currency'sine sahip mağazaların muhasebe hareketleri, TRY mağazalarından ayrı olarak yönetilmektedir. Bu sistem, USD mağazalarının finansal işlemlerinin ayrı tutulmasını ve doğru döviz kuru çevrimlerinin yapılmasını sağlar.

## Önemli Değişiklikler

### 🔄 USD Mağazaları için Ayrı Muhasebe Sistemi

USD currency'sine sahip mağazalar artık ana muhasebe sisteminden ayrı tutulmaktadır:

- ✅ **Ödemeler**: USD mağazalarının ödemeleri ana muhasebe hareketlerinde gözükmez
- ✅ **Siparişler**: USD mağazalarının verdiği siparişler muhasebe hareketlerinde gözükmez
- ✅ **İptaller**: USD mağazalarının iptal ettiği siparişler muhasebe hareketlerinde gözükmez
- ✅ **Bakiye**: USD mağazalarının bakiyesi ana muhasebe sisteminde görüntülenmez

### 💱 Döviz Kuru Çevirimi Düzeltmesi

TL ile yapılan ödemeler USD mağazalarında artık doğru şekilde çevrilmektedir:

**Önceki Durum (Hatalı):**
```
1 TL ödeme → USD mağazasında 1 USD bakiye artışı ❌
```

**Yeni Durum (Doğru):**
```
1 TL ödeme → TCMB kuru (örn: 32.50) → USD mağazasında 0.031 USD bakiye artışı ✅
```

## API Endpoint'leri

### 1. Muhasebe Hareketleri Listesi

**Endpoint:** `GET /api/admin/muhasebe-hareketleri`

**Değişiklik:** USD mağazaları artık bu listede gözükmez.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hareketler": [
      // Sadece TRY ve EUR mağazalarının hareketleri
    ],
    "magazaBakiyeleri": [
      // USD mağazaları bu listede yer almaz
    ],
    "adminKasaBakiyesi": 12500.75
  }
}
```

### 2. Mağaza Bazlı Muhasebe Hareketleri

**Endpoint:** `GET /api/admin/muhasebe/store/{storeId}`

**Davranış:** USD mağazası için erişim engellenir.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**USD Mağazası Response:**
```json
{
  "success": false,
  "message": "USD currency'ne sahip mağazaların muhasebe hareketleri ayrı tutulmaktadır ve bu sistemde görüntülenemez."
}
```

### 3. Manuel Muhasebe Hareketi Yaratma

**Endpoint:** `POST /api/admin/muhasebe-hareketleri`

**Davranış:** USD mağazaları için manuel hareket yaratılamaz.

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "storeId": "usd-store-uuid",
  "islemTuru": "Parekende Satış",
  "tutar": 100,
  "harcama": false,
  "tarih": "2024-01-15",
  "aciklama": "Test hareketi"
}
```

**USD Mağazası Response:**
```json
{
  "success": false,
  "message": "USD currency'ne sahip mağazaların muhasebe hareketleri ayrı tutulmaktadır ve bu sistemde muhasebe hareketi yaratılamaz."
}
```

### 4. Mağaza Ödemeleri Listesi (Güncellenmiş)

**Endpoint:** `GET /api/payments/my-store-payments`

**Yenilik:** Currency bilgileri ve para birimi bazında özet eklendi.

**Headers:**
```
Authorization: Bearer {store_token}
```

**Query Parameters:**
- `page` (opsiyonel): Sayfa numarası (varsayılan: 1)
- `limit` (opsiyonel): Sayfa başına kayıt (varsayılan: 20)
- `status` (opsiyonel): COMPLETED, FAILED

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment-uuid",
        "amount": 0.031,
        "status": "COMPLETED",
        
        // 🆕 Currency Bilgileri
        "store_currency": "USD",           // Mağazanın para birimi
        "payment_currency": "TRY",         // Ödemenin yapıldığı para birimi
        "exchange_rate": 32.50,            // Kullanılan döviz kuru
        "original_amount": 1,              // Orijinal ödeme tutarı (1 TRY)
        "converted_amount": 0.031,         // Çevrilmiş tutar (0.031 USD)
        
        "paymentDate": "2024-01-15T10:30:00Z",
        "store": {
          "store_id": "store-uuid",
          "kurum_adi": "USD Mağaza"
        }
      }
    ],
    "summary": {
      "completedCount": 3,
      "failedCount": 0,
      "totalAmount": 0.093,
      "successRate": 100,
      
      // 🆕 Para Birimi Bazında Özet
      "tryPayments": {
        "count": 2,                        // TL ile yapılan ödeme sayısı
        "totalAmount": 65                  // TL ile yapılan toplam tutar
      },
      "usdPayments": {
        "count": 1,                        // USD ile yapılan ödeme sayısı
        "totalAmount": 1                   // USD ile yapılan toplam tutar
      }
    }
  }
}
```

## Teknik Detaylar

### Döviz Kuru Hesaplama

**Exchange Rate Service:**
- TCMB (Türkiye Cumhuriyet Merkez Bankası) kurları kullanılır
- Kurlar günlük olarak güncellenir
- Cache süresi: 1 saat
- Alternatif kaynak: ExchangeRate-API

**Çevrim Formülü:**
```javascript
// TRY → USD
usdAmount = tryAmount / tcmbRate

// USD → TRY  
tryAmount = usdAmount * tcmbRate
```

### Sistem Akışı

#### 1. TRY Ödeme → USD Mağaza
```
1. Webhook gelir (PaymentAmount: 100 TRY)
2. Store currency kontrolü (USD)
3. TCMB kurundan döviz çevrimi (100 / 32.50 = 3.077 USD)
4. Mağaza bakiyesine USD tutarı eklenir
5. Muhasebe hareketi YARATILMAZ (ayrı sistem)
```

#### 2. USD Ödeme → USD Mağaza
```
1. Webhook gelir (PaymentAmount: USD cinsinden)
2. Store currency kontrolü (USD)
3. Döviz çevrimi gerekmez
4. Mağaza bakiyesine direkt eklenir
5. Muhasebe hareketi YARATILMAZ (ayrı sistem)
```

## Etkilenen Servisler

### 1. Balance Service
- USD mağazaları için muhasebe kaydı yaratılmaz
- Döviz çevrimi doğru şekilde yapılır

### 2. Webhook Service  
- Admin USD store'lar için muhasebe kaydı yaratılmaz
- TRY ödemeler doğru şekilde USD'ye çevrilir

### 3. Muhasebe Controller
- USD mağazaları filtrelenir
- USD mağaza erişimi engellenir
- Manuel hareket yaratma engellenir

## Hata Kodları

| Kod | Endpoint | Açıklama |
|-----|----------|----------|
| 403 | `/muhasebe/store/{usdStoreId}` | USD mağaza muhasebe erişimi engellendi |
| 403 | `/muhasebe-hareketleri` (POST) | USD mağaza manuel hareket yaratma engellendi |

## Örnekler

### USD Mağaza Muhasebe Hareketlerini Görüntüleme Denemesi

```bash
curl -X GET \
  "https://api.example.com/api/admin/muhasebe/store/usd-store-uuid" \
  -H "Authorization: Bearer admin_token"
```

**Response:**
```json
{
  "success": false,
  "message": "USD currency'ne sahip mağazaların muhasebe hareketleri ayrı tutulmaktadır ve bu sistemde görüntülenemez."
}
```

### Mağaza Ödemelerinde Currency Bilgileri

```bash
curl -X GET \
  "https://api.example.com/api/payments/my-store-payments?page=1&limit=5" \
  -H "Authorization: Bearer store_token"
```

**Response:** Yukarıdaki detaylı response örneğine bakınız.

## Migrasyon Notları

### Mevcut Veriler
- Mevcut USD mağaza muhasebe hareketleri korunur
- Yeni sistem sadece ileriye dönük işlemleri etkiler
- Currency bilgileri mevcut payment transaction'larda mevcuttur

### Geliştirici Notları
- USD mağaza kontrolü: `store.currency === 'USD'`
- Exchange rate service singleton pattern kullanır
- Cache mekanizması mevcuttur

## Güvenlik

### Yetki Kontrolleri
- Admin/Editor: Tüm muhasebe endpoint'lerine erişim
- Store User: Sadece kendi mağaza ödemelerine erişim
- USD mağaza kısıtlamaları tüm rollerde geçerli

### Veri Güvenliği
- Currency bilgileri transaction'larda saklanır
- Exchange rate geçmişi korunur
- Döviz çevrimi audit trail'i mevcuttur

## Destek

Bu API ile ilgili sorularınız için:
- GitHub Issues: [Repository Link]
- Email: support@example.com
- Dokümantasyon: `/docs` klasörü

---

**Son Güncelleme:** {{ current_date }}
**Versiyon:** 1.0.0
**API Versiyon:** v1
