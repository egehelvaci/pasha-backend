# Satıcı Yönetimi ve Alış Fiyat Listesi API Dokümantasyonu

Bu dokümantasyon, satıcı yönetimi ve alış fiyat listesi sisteminin API endpoint'lerini açıklar.

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

## Satıcı Yönetimi API'leri

### 1. Tüm Satıcıları Listele
**GET** `/suppliers`

**Açıklama:** Aktif tüm satıcıları ve bakiye bilgilerini getirir.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "ABC Halı Tedarik",
      "company_name": "ABC Halı Tedarik Ltd. Şti.",
      "phone": "+90 212 555 0001",
      "address": "Merkez Mah. Sanayi Cad. No:15",
      "balance": -1500.00,
      "currency": "USD",
      "notes": "Ana tedarikçimiz",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "purchasePriceLists": []
    }
  ],
  "message": "Satıcılar başarıyla getirildi"
}
```

### 2. Yeni Satıcı Oluştur
**POST** `/suppliers`

**Body:**
```json
{
  "name": "Satıcı Adı", // Zorunlu
  "company_name": "Firma Adı", // Zorunlu
  "phone": "+90 555 123 4567",
  "address": "Tam Adres",
  "notes": "Notlar",
  "balance": -30000.00, // TRY cinsinden tutar (negatif değer borç, pozitif değer alacak)
  "exchange_rate": 34.50, // Dolar kuru (opsiyonel, balance varsa zorunlu)
  "currency": "USD" // Varsayılan: USD (satıcı bakiyesi her zaman USD'de tutulur)
}
```

**Not:** 
- Eğer `balance` girilirse ve `exchange_rate` belirtilirse, sistem TRY tutarı dolar kuruna bölerek USD'ye çevirir
- Örnek: 30,000 TRY ÷ 34.50 kur = $869.57 USD olarak kaydedilir

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Satıcı Adı",
    // ... diğer alanlar
  },
  "message": "Satıcı başarıyla oluşturuldu"
}
```

### 3. Satıcı Güncelle
**PUT** `/suppliers/:id`

**Body:** Güncellenecek alanlar (kısmi güncelleme desteklenir)

### 4. Satıcı Sil (Deaktif Et)
**DELETE** `/suppliers/:id`

### 5. Satıcıdan Ürün Alımı Yap
**POST** `/suppliers/:supplier_id/purchase-product`

**Açıklama:** Belirtilen satıcıdan ürün alımı yapar. Ürünün alış fiyatı ve m² miktarına göre toplam tutarı hesaplar, satıcı bakiyesinden düşer ve ürün stoklarına ekler.

**Body:**
```json
{
  "product_id": "uuid", // Zorunlu - Alınacak ürün ID'si
  "quantity_m2": 25.5, // Zorunlu - Alınacak m² miktarı
  "description": "Halı alımı - Ocak 2024", // Opsiyonel
  "reference_number": "AL-2024-001" // Opsiyonel - Referans numarası
}
```

**Not:** Alış fiyatları zaten USD cinsinden olduğu için dolar kuru gerekmez. Sistem otomatik olarak: **Alış Fiyatı (USD/m²) × m² Miktarı = Toplam USD Tutar** hesaplamasını yapar.

**Response:**
```json
{
  "success": true,
  "data": {
    "supplier": {
      "id": "uuid",
      "name": "ABC Halı Tedarik",
      "balance": -2395.50 // Güncellenmiş bakiye (USD)
    },
    "product": {
      "productId": "uuid",
      "name": "Premium Halı",
      "collection": {
        "name": "SATEN SERİSİ"
      }
    },
    "transaction": {
      "id": "uuid",
      "transaction_type": "PRODUCT_PURCHASE",
      "amount": -395.50, // USD tutarı (negatif - borç artışı)
      "description": "Ürün alımı - Premium Halı (25.5 m² x $15.50/m²)"
    },
    "purchase_details": {
      "quantity_m2": 25.5,
      "unit_price_usd": 15.50, // USD/m² alış fiyatı
      "total_usd": 395.50 // Toplam USD tutar
    }
  },
  "message": "Satıcıdan 25.5 m² ürün alımı başarıyla gerçekleştirildi. Toplam: $395.5 USD"
}
```

---

## Bakiye Yönetimi API'leri

### 6. Satıcı Bakiyesi Güncelle
**PUT** `/suppliers/:id/balance`

**Body:**
```json
{
  "amount": -17250.00, // TRY cinsinden tutar (Negatif: Borç artışı, Pozitif: Ödeme/Alacak)
  "exchange_rate": 34.50, // Dolar kuru (zorunlu)
  "transaction_type": "PURCHASE", // PAYMENT, PURCHASE, ADJUSTMENT
  "description": "Halı alımı - Fatura No: FA-2024-015",
  "reference_number": "FA-2024-015"
}
```

**Hesaplama:** 17,250 TRY ÷ 34.50 kur = $500.00 USD (satıcı bakiyesine eklenir)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "balance": -1500.00, // Güncellenmiş USD bakiye
    "transaction_info": {
      "original_amount": -17250.00, // Orijinal TRY tutar
      "exchange_rate": 34.50, // Kullanılan dolar kuru
      "usd_amount": -500.00, // USD'ye çevrilmiş tutar
      "original_currency": "TRY"
    },
    // ... diğer satıcı bilgileri
  },
  "message": "Satıcı bakiyesi başarıyla güncellendi. -17250 TRY (34.5 kurdan) = $-500 USD"
}
```

### 7. Satıcı Bakiye Geçmişi
**GET** `/suppliers/:id/balance-history?page=1&limit=50`

**Query Parameters:**
- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına kayıt (varsayılan: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "supplier_id": "uuid",
        "transaction_type": "PURCHASE",
        "amount": -500.00, // USD cinsinden tutar
        "original_amount": -17250.00, // Orijinal TRY tutar
        "exchange_rate": 34.50, // Kullanılan dolar kuru
        "original_currency": "TRY",
        "previous_balance": -1000.00,
        "new_balance": -1500.00,
        "description": "Halı alımı - Fatura No: FA-2024-015",
        "reference_number": "FA-2024-015",
        "created_by": "admin-user-id",
        "created_at": "2024-01-15T10:30:00Z",
        "supplier": {
          "name": "ABC Halı Tedarik",
          "company_name": "ABC Halı Tedarik Ltd. Şti."
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 10,
      "totalPages": 1
    }
  },
  "message": "Satıcı bakiye geçmişi başarıyla getirildi"
}
```

### 7. Satıcı Bakiye Özeti ve Borç Raporu
**GET** `/suppliers/balance-summary`

**Açıklama:** Tüm satıcıların bakiye özetini, borçlu/alacaklı satıcıları ve toplam rakamları getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalReceivable": 2300.50, // Toplam alacak
      "totalPayable": 2350.75,    // Toplam borç
      "receivableCount": 1,        // Alacaklı satıcı sayısı
      "payableCount": 2,           // Borçlu satıcı sayısı
      "neutralCount": 1,           // Nötr satıcı sayısı
      "totalSuppliers": 4,         // Toplam satıcı sayısı
      "netBalance": -50.25         // Net durum (alacak - borç)
    },
    "debtors": [ // Borçlu satıcılar (negatif bakiye)
      {
        "id": "uuid",
        "name": "ABC Halı Tedarik",
        "company_name": "ABC Halı Tedarik Ltd. Şti.",
        "balance": -1500.00,
        "currency": "USD",
        "debt": 1500.00 // Mutlak borç miktarı
      }
    ],
    "creditors": [ // Alacaklı satıcılar (pozitif bakiye)
      {
        "id": "uuid",
        "name": "DEF Tekstil",
        "company_name": "DEF Tekstil San. Tic. A.Ş.",
        "balance": 2300.50,
        "currency": "USD"
      }
    ],
    "allSuppliers": [] // Tüm satıcılar (bakiye sıralı)
  },
  "message": "Satıcı bakiye özeti başarıyla getirildi"
}
```

---

## Alış Fiyat Listesi API'leri

### 8. Tüm Alış Fiyat Listelerini Getir
**GET** `/purchase-price-lists`

### 9. Varsayılan Alış Fiyat Listesi
**GET** `/purchase-price-lists/default`

**Açıklama:** Sistem tarafından otomatik oluşturulan ve tüm koleksiyonları içeren varsayılan alış fiyat listesini getirir.

### 10. ID'ye Göre Alış Fiyat Listesi
**GET** `/purchase-price-lists/:id`

### 11. Yeni Alış Fiyat Listesi Oluştur
**POST** `/purchase-price-lists`

**Body:**
```json
{
  "name": "Ocak 2024 Alış Fiyatları",
  "description": "Ocak ayı için güncellenmiş alış fiyat listesi",
  "supplier_id": "uuid", // Opsiyonel
  "currency": "USD",
  "collectionPrices": [
    {
      "collection_id": "uuid",
      "price_per_square_meter": 15.50
    }
  ]
}
```

### 12. Alış Fiyat Listesi Güncelle
**PUT** `/purchase-price-lists/:id`

### 13. Koleksiyon Fiyatı Güncelle
**PUT** `/purchase-price-lists/:listId/collections/:collectionId`

**Body:**
```json
{
  "price_per_square_meter": 18.75
}
```

---

## İşlem Türleri (Transaction Types)

- `INITIAL_BALANCE`: Başlangıç bakiyesi
- `PAYMENT`: Ödeme (borç azaltma)
- `PURCHASE`: Alış (borç artışı)
- `ADJUSTMENT`: Düzeltme
- `REFUND`: İade
- `DISCOUNT`: İndirim

---

## Hata Kodları

- `400`: Geçersiz istek (eksik/hatalı parametreler)
- `401`: Kimlik doğrulama hatası
- `404`: Kaynak bulunamadı
- `500`: Sunucu hatası

---

## Kullanım Örnekleri

### Satıcıya Ödeme Yapma
```javascript
// 34,500 TRY ödeme yapma (34.50 kurdan = $1000 USD)
PUT /api/admin/purchase-management/suppliers/[supplier-id]/balance
{
  "amount": 34500.00, // TRY cinsinden pozitif tutar (ödeme)
  "exchange_rate": 34.50, // Güncel dolar kuru
  "transaction_type": "PAYMENT",
  "description": "Ocak ayı ödemesi",
  "reference_number": "ÖD-2024-001"
}
```

### Satıcıdan Alış Yapma
```javascript
// 17,250 TRY değerinde alış (34.50 kurdan = $500 USD borç)
PUT /api/admin/purchase-management/suppliers/[supplier-id]/balance
{
  "amount": -17250.00, // TRY cinsinden negatif tutar (alış/borç)
  "exchange_rate": 34.50, // Güncel dolar kuru
  "transaction_type": "PURCHASE",
  "description": "Halı alımı - Fatura No: FA-2024-015",
  "reference_number": "FA-2024-015"
}
```

### Borç Raporu Alma
```javascript
GET /api/admin/purchase-management/suppliers/balance-summary
// Tüm satıcıların bakiye durumunu ve borç/alacak özetini getirir
```

Bu API'ler sayesinde admin kullanıcıları:
- ✅ Satıcı listesi oluşturup yönetebilir
- ✅ Firma adı, adres, bakiye bilgilerini girebilir
- ✅ Bakiye güncelleyebilir (negatif değerlerle borç girebilir)
- ✅ Toplam bakiye ve borç durumunu görebilir
- ✅ Kime ne kadar borçlu olduğunu takip edebilir
- ✅ Tüm işlem geçmişini görüntüleyebilir
