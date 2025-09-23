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
  "cutType": "rectangle"       // Zorunlu - Kesim türü (rectangle, round, oval, hexagon, star)        // Opsiyonel - Notlar
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

---

## Satın Alım Geçmişi ve Raporlama API'leri

### 6. Tüm Satın Alımları Listele
**GET** `/purchases`

**Açıklama:** Tüm satın alım işlemlerini filtreleme ve pagination ile getirir. Detaylı raporlama için kullanılır.

**Query Parameters:**
- `page` (number): Sayfa numarası (varsayılan: 1)
- `limit` (number): Sayfa başına kayıt (varsayılan: 20)
- `supplier_id` (string): Belirli satıcıya göre filtrele
- `transaction_type` (string): İşlem türüne göre filtrele (CART_PURCHASE, PRODUCT_PURCHASE, PAYMENT, vb.)
- `start_date` (string): Başlangıç tarihi (ISO format)
- `end_date` (string): Bitiş tarihi (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "supplier_id": "uuid",
        "transaction_type": "CART_PURCHASE",
        "transaction_type_description": "Sepetten Toplu Alım",
        "amount": -500.00,
        "amount_formatted": "$500.00",
        "balance_change": "increase_debt",
        "original_amount": null,
        "exchange_rate": null,
        "original_currency": null,
        "previous_balance": "-1500.00",
        "new_balance": "-2000.00",
        "description": "Alım sepetinden toplu satın alma - 3 ürün",
        "reference_number": "CART-1705320123456",
        "created_by": "admin-user-id",
        "created_at": "2024-01-15T11:00:00Z",
        "supplier": {
          "id": "uuid",
          "name": "ABC Halı Tedarik",
          "company_name": "ABC Halı Tedarik Ltd. Şti.",
          "currency": "USD"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "stats": {
      "totalTransactions": 150,
      "totalAmount": -25000.00,
      "totalAmountFormatted": "$25000.00"
    }
  },
  "message": "Satın alım geçmişi başarıyla getirildi"
}
```

### 7. Satın Alım Detayını Getir
**GET** `/purchases/{transaction-id}`

**Açıklama:** Belirli bir satın alım işleminin detaylı bilgilerini getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "supplier_id": "uuid",
      "transaction_type": "CART_PURCHASE",
      "transaction_type_description": "Sepetten Toplu Alım",
      "amount": -500.00,
      "amount_formatted": "$500.00",
      "balance_change_type": "debt_increase",
      "balance_change_description": "Borç Artışı",
      "original_amount": null,
      "exchange_rate": null,
      "original_currency": null,
      "previous_balance": "-1500.00",
      "previous_balance_formatted": "$-1500.00",
      "new_balance": "-2000.00",
      "new_balance_formatted": "$-2000.00",
      "description": "Alım sepetinden toplu satın alma - 3 ürün",
      "reference_number": "CART-1705320123456",
      "created_by": "admin-user-id",
      "created_at": "2024-01-15T11:00:00Z",
      "created_at_formatted": "15.01.2024 14:00:00",
      "purchase_details": {
        "type": "cart_purchase",
        "description": "Alım sepetinden toplu satın alma",
        "note": "Detaylı ürün bilgileri transaction sırasında sepet temizlendiği için mevcut değil"
      },
      "supplier": {
        "id": "uuid",
        "name": "ABC Halı Tedarik",
        "company_name": "ABC Halı Tedarik Ltd. Şti.",
        "phone": "+90 212 555 0001",
        "address": "Merkez Mah. Sanayi Cad. No:15",
        "currency": "USD",
        "balance": "-2000.00"
      }
    }
  },
  "message": "Satın alım detayı başarıyla getirildi"
}
```

### 8. Satıcı Bazında Satın Alım Özeti
**GET** `/suppliers/{supplier-id}/purchase-summary`

**Açıklama:** Belirli bir satıcı için detaylı satın alım özeti ve istatistikleri getirir.

**Query Parameters:**
- `start_date` (string): Başlangıç tarihi (ISO format)
- `end_date` (string): Bitiş tarihi (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "supplier": {
      "id": "uuid",
      "name": "ABC Halı Tedarik",
      "company_name": "ABC Halı Tedarik Ltd. Şti.",
      "phone": "+90 212 555 0001",
      "address": "Merkez Mah. Sanayi Cad. No:15",
      "balance": "-2000.00",
      "currency": "USD"
    },
    "summary": {
      "period": {
        "start_date": "2024-01-01",
        "end_date": "2024-01-31"
      },
      "totals": {
        "transaction_count": 25,
        "total_amount": -3000.00,
        "total_amount_formatted": "$3000.00"
      },
      "purchases": {
        "count": 20,
        "amount": 3500.00,
        "amount_formatted": "$3500.00"
      },
      "payments": {
        "count": 5,
        "amount": 500.00,
        "amount_formatted": "$500.00"
      },
      "cart_purchases": {
        "count": 8,
        "amount": 2000.00,
        "amount_formatted": "$2000.00"
      },
      "by_transaction_type": [
        {
          "transaction_type": "CART_PURCHASE",
          "count": 8,
          "amount": -2000.00,
          "amount_formatted": "$2000.00"
        },
        {
          "transaction_type": "PRODUCT_PURCHASE",
          "count": 12,
          "amount": -1500.00,
          "amount_formatted": "$1500.00"
        },
        {
          "transaction_type": "PAYMENT",
          "count": 5,
          "amount": 500.00,
          "amount_formatted": "$500.00"
        }
      ]
    },
    "recent_transactions": [
      {
        "id": "uuid",
        "transaction_type": "CART_PURCHASE",
        "amount": "-500.00",
        "amount_formatted": "$500.00",
        "balance_change": "debt_increase",
        "description": "Alım sepetinden toplu satın alma - 3 ürün",
        "created_at": "2024-01-15T11:00:00Z",
        "reference_number": "CART-1705320123456"
      }
    ]
  },
  "message": "Satıcı satın alım özeti başarıyla getirildi"
}
```

### 9. Satın Alım İstatistikleri (Dashboard)
**GET** `/statistics/purchases`

**Açıklama:** Dashboard için genel satın alım istatistikleri, günlük veriler ve en çok alım yapılan satıcıları getirir.

**Query Parameters:**
- `period` (number): İstatistik periyodu (gün olarak, varsayılan: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "days": 30,
      "start_date": "2023-12-16T00:00:00Z",
      "end_date": "2024-01-15T00:00:00Z"
    },
    "overview": {
      "total_purchases": {
        "count": 85,
        "amount": 25000.00,
        "amount_formatted": "$25000.00"
      },
      "total_payments": {
        "count": 15,
        "amount": 5000.00,
        "amount_formatted": "$5000.00"
      },
      "cart_purchases": {
        "count": 30,
        "amount": 15000.00,
        "amount_formatted": "$15000.00"
      },
      "active_suppliers": 12
    },
    "daily_stats": [
      {
        "date": "2024-01-15",
        "transaction_count": 5,
        "purchase_amount": 1500.00,
        "payment_amount": 200.00
      },
      {
        "date": "2024-01-14",
        "transaction_count": 3,
        "purchase_amount": 800.00,
        "payment_amount": 0.00
      }
    ],
    "top_suppliers": [
      {
        "supplier_id": "uuid",
        "supplier_name": "ABC Halı Tedarik",
        "company_name": "ABC Halı Tedarik Ltd. Şti.",
        "transaction_count": 15,
        "purchase_amount": 8500.00,
        "purchase_amount_formatted": "$8500.00"
      },
      {
        "supplier_id": "uuid2",
        "supplier_name": "DEF Tekstil",
        "company_name": "DEF Tekstil San. Tic. A.Ş.",
        "transaction_count": 12,
        "purchase_amount": 6200.00,
        "purchase_amount_formatted": "$6200.00"
      }
    ]
  },
  "message": "Satın alım istatistikleri başarıyla getirildi"
}
```

---

## Gelişmiş Kullanım Örnekleri

### Detaylı Raporlama Senaryoları

#### 1. Belirli Tarih Aralığında Satın Alımları Listele
```bash
GET /api/admin/purchase-management/purchases?start_date=2024-01-01&end_date=2024-01-31&page=1&limit=50
```

#### 2. Sadece Sepet Alımlarını Filtrele
```bash
GET /api/admin/purchase-management/purchases?transaction_type=CART_PURCHASE&page=1&limit=20
```

#### 3. Belirli Satıcının Son 3 Aylık Özeti
```bash
GET /api/admin/purchase-management/suppliers/abc-123/purchase-summary?start_date=2023-10-01&end_date=2024-01-01
```

#### 4. Dashboard İstatistikleri (Son 7 Gün)
```bash
GET /api/admin/purchase-management/statistics/purchases?period=7
```

### İşlem Türleri ve Açıklamaları

| Transaction Type | Açıklama | Bakiye Etkisi |
|-----------------|----------|---------------|
| `INITIAL_BALANCE` | Başlangıç Bakiyesi | Pozitif/Negatif |
| `PAYMENT` | Ödeme | Pozitif (Borç Azalır) |
| `PURCHASE` | Tek Ürün Alımı | Negatif (Borç Artar) |
| `CART_PURCHASE` | Sepetten Toplu Alım | Negatif (Borç Artar) |
| `PRODUCT_PURCHASE` | Ürün Alımı | Negatif (Borç Artar) |
| `ADJUSTMENT` | Düzeltme | Pozitif/Negatif |
| `REFUND` | İade | Pozitif (Borç Azalır) |
| `DISCOUNT` | İndirim | Pozitif (Borç Azalır) |

### Bakiye Değişim Türleri

- `debt_increase`: Borç artışı (negatif tutar)
- `debt_decrease`: Borç azalması (pozitif tutar)

Bu gelişmiş raporlama API'leri sayesinde artık:
- ✅ Tüm satın alım işlemlerini detaylı olarak takip edebilir
- ✅ Satıcı bazında performans analizi yapabilir  
- ✅ Tarih bazlı filtreleme ile dönemsel raporlar oluşturabilir
- ✅ Dashboard için gerçek zamanlı istatistikler alabilir
- ✅ İşlem detaylarını tek tek inceleyebilirsiniz
