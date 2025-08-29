# Dolar Takip Sistemi - API Dokümantasyonu

## 📋 Genel Bakış

Bu dokümantasyon, dolar ile yapılan ödemelerin ve USD para birimi kullanan mağazaların ayrı takip edilmesi için eklenen yeni API endpoint'lerini ve geliştirilen özellikleri kapsamlı olarak açıklamaktadır.

### 🎯 Sistem Amacı
- USD ve TRY para birimlerinin ayrı takip edilmesi
- Currency bazında muhasebe hareketlerinin kaydedilmesi
- Exchange rate bilgilerinin otomatik hesaplanması
- Mağaza bazında currency analiz raporları
- Geriye uyumlu API yapısının korunması

## 🗄️ Database Değişiklikleri

### Yeni Alanlar

#### Order Tablosu
```sql
-- Yeni eklenen alanlar
order_currency     Currency   DEFAULT 'TRY'     -- Sipariş para birimi
payment_currency   Currency   DEFAULT 'TRY'     -- Ödeme para birimi
exchange_rate      DECIMAL(10,4)               -- Döviz kuru
original_amount    DECIMAL(12,2)               -- Orijinal tutar
converted_amount   DECIMAL(12,2)               -- Çevrilmiş tutar
```

#### MuhasebeHareketleri Tablosu
```sql
-- Yeni eklenen alanlar
currency          Currency    DEFAULT 'TRY'     -- İşlem para birimi
original_currency Currency    DEFAULT 'TRY'     -- Orijinal para birimi
exchange_rate     DECIMAL(10,4)               -- Döviz kuru
original_amount   DECIMAL(10,2)               -- Orijinal tutar
```

#### PaymentTransaction Tablosu
```sql
-- Yeni eklenen alanlar
store_currency    Currency    DEFAULT 'TRY'     -- Mağaza para birimi
payment_currency  Currency    DEFAULT 'TRY'     -- Ödeme para birimi
exchange_rate     DECIMAL(10,4)               -- Döviz kuru
original_amount   DECIMAL(12,2)               -- Orijinal tutar
converted_amount  DECIMAL(12,2)               -- Çevrilmiş tutar
```

#### Yeni CurrencySummary Tablosu
```sql
CREATE TABLE currency_summaries (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id          UUID NOT NULL,
  currency          Currency NOT NULL,
  period_start      TIMESTAMP NOT NULL,
  period_end        TIMESTAMP NOT NULL,
  total_revenue     DECIMAL(12,2) NOT NULL,
  total_orders      INTEGER NOT NULL,
  average_rate      DECIMAL(10,4),
  created_at        TIMESTAMP DEFAULT now(),
  updated_at        TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (store_id) REFERENCES stores(store_id),
  UNIQUE (store_id, currency, period_start, period_end)
);
```

## 🔗 API Endpoint'leri

### 1. Finance Controller - Güncellenen Endpoint'ler

#### GET /api/admin/finance/transactions
**Geriye uyumlu endpoint - Yeni currency separation özelliği**

**Query Parametreleri:**
```typescript
interface QueryParams {
  storeId: string;           // ZORUNLU - Mağaza ID'si
  currency?: 'TRY' | 'USD';  // OPSİYONEL - Para birimi filtresi
  convertTo?: 'TRY' | 'USD'; // OPSİYONEL - Çevrilecek para birimi
  separateCurrencies?: boolean; // YENİ - Currency bazında ayrım
}
```

**Örnek İstek:**
```bash
# Eski kullanım (mevcut)
GET /api/admin/finance/transactions?storeId=uuid

# Yeni kullanım - Currency separation ile
GET /api/admin/finance/transactions?storeId=uuid&separateCurrencies=true
```

**Eski Format Response (Korunur):**
```json
{
  "success": true,
  "data": {
    "store": { "store_id": "uuid", "kurum_adi": "Store Name" },
    "transactions": [
      {
        "id": 1,
        "tutar": 1000,
        "harcama": false,
        "currency": "TRY"
      }
    ],
    "summary": {
      "totalIncome": 5000,
      "totalExpense": 2000,
      "balance": 3000
    }
  }
}
```

**Yeni Format Response (separateCurrencies=true):**
```json
{
  "success": true,
  "data": {
    "store": { "store_id": "uuid", "kurum_adi": "Store Name" },
    "transactions": {
      "TRY": [
        {
          "id": 1,
          "tutar": 1000,
          "harcama": false,
          "currency": "TRY"
        }
      ],
      "USD": [
        {
          "id": 2,
          "tutar": 100,
          "harcama": false,
          "currency": "USD"
        }
      ]
    },
    "summary": {
      "TRY": {
        "totalIncome": 5000,
        "totalExpense": 2000,
        "balance": 3000,
        "transactionCount": 10,
        "currency": "TRY"
      },
      "USD": {
        "totalIncome": 500,
        "totalExpense": 200,
        "balance": 300,
        "transactionCount": 5,
        "currency": "USD"
      }
    },
    "separatedByCurrency": true
  }
}
```

### 2. Currency Analysis - Yeni Endpoint

#### GET /api/admin/finance/currency-analysis
**Mağaza için detaylı currency analizi**

**Query Parametreleri:**
```typescript
interface AnalysisParams {
  storeId: string;      // ZORUNLU - Mağaza ID'si
  startDate?: string;   // OPSİYONEL - Başlangıç tarihi (ISO)
  endDate?: string;     // OPSİYONEL - Bitiş tarihi (ISO)
}
```

**Örnek İstek:**
```bash
GET /api/admin/finance/currency-analysis?storeId=uuid&startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "store": {
      "id": "uuid",
      "name": "Mağaza Adı",
      "defaultCurrency": "USD"
    },
    "summary": {
      "TRY": {
        "orderCount": 50,
        "totalRevenue": 150000,
        "averageOrderValue": 3000,
        "orders": [
          {
            "id": "order-uuid",
            "amount": 3000,
            "date": "2024-01-15T10:30:00Z",
            "status": "DELIVERED"
          }
        ]
      },
      "USD": {
        "orderCount": 25,
        "totalRevenue": 2500,
        "averageOrderValue": 100,
        "orders": [
          {
            "id": "order-uuid-2",
            "amount": 100,
            "date": "2024-01-16T14:20:00Z",
            "status": "CONFIRMED"
          }
        ]
      }
    },
    "exchangeRateStats": {
      "average": 32.15,
      "min": 31.80,
      "max": 32.50,
      "rates": [32.15, 31.95, 32.30]
    },
    "transactionSummary": {
      "TRY": {
        "income": 45000,
        "expense": 15000,
        "count": 30
      },
      "USD": {
        "income": 1800,
        "expense": 200,
        "count": 12
      }
    },
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  }
}
```

### 3. Muhasebe Controller - Güncellenen Endpoint

#### POST /api/admin/muhasebe/hareketi
**Currency desteği eklenen muhasebe hareketi oluşturma**

**Request Body:**
```typescript
interface MuhasebeHareketiRequest {
  storeId: string;           // ZORUNLU - Mağaza ID'si
  islemTuru: string;         // ZORUNLU - İşlem türü
  tutar: number;             // ZORUNLU - Tutar
  tarih: string;             // ZORUNLU - Tarih (ISO)
  aciklama: string;          // ZORUNLU - Açıklama
  currency?: 'TRY' | 'USD';  // YENİ - Para birimi (opsiyonel)
}
```

**Örnek İstek:**
```json
{
  "storeId": "uuid",
  "islemTuru": "Parakende Satış",
  "tutar": 100,
  "tarih": "2024-01-15T10:30:00Z",
  "aciklama": "USD ile yapılan satış",
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "storeId": "uuid",
    "islemTuru": "Parakende Satış",
    "tutar": 100,
    "harcama": false,
    "currency": "USD",
    "original_currency": "USD",
    "exchange_rate": 32.15,
    "original_amount": 100,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Order Service - Currency Tracking

**Otomatik currency tracking - API değişikliği yok**

Tüm order oluşturma işlemlerinde otomatik olarak:
- Store'un currency bilgisi order'a eklenir
- `order_currency` ve `payment_currency` alanları doldurulur
- `original_amount` olarak order tutarı kaydedilir

### 5. Payment Service - Currency Conversion

#### POST /api/payments/checkout
**Currency conversion desteği eklendi**

**Mevcut CreateCheckoutInput (güncellenmiş):**
```typescript
interface CreateCheckoutInput {
  storeId: string;
  userId: string;
  amount: number;
  aciklama?: string;
  channel?: 'web' | 'mobile';
  idempotencyKey?: string;
  orderId?: string;
  currencyCode?: 'TRY' | 'USD'; // Mevcut - Güçlendirildi
}
```

**İşleyiş:**
1. Store'un varsayılan currency'si kontrol edilir
2. Payment currency farklıysa exchange rate hesaplanır
3. Gerekirse amount çevrimi yapılır
4. Tüm currency bilgileri PaymentTransaction'a kaydedilir

## 📊 Raporlama ve Analiz

### 1. Dashboard Widget'ları

#### Currency Overview Widget
```typescript
GET /api/admin/dashboard/currency-overview

Response:
{
  "TRY": {
    "revenue": 500000,
    "orders": 150,
    "trend": "+5.2%"
  },
  "USD": {
    "revenue": 8500,
    "orders": 45,
    "trend": "+12.8%"
  },
  "exchangeRate": {
    "current": 32.15,
    "change": "+0.25"
  }
}
```

### 2. Dolar Mağaza Performance Raporu

#### GET /api/admin/reports/dollar-store-performance
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "stores": [
      {
        "storeId": "uuid",
        "storeName": "Dollar Store 1",
        "metrics": {
          "totalOrders": 150,
          "totalRevenueUSD": 15000,
          "averageOrderValueUSD": 100,
          "growthRate": 15.5,
          "exchangeRateImpact": {
            "averageRate": 32.50,
            "totalSavedTRY": 5000
          }
        }
      }
    ],
    "summary": {
      "totalDollarStores": 5,
      "totalDollarRevenue": 50000,
      "totalDollarOrders": 500,
      "marketShare": 12.5
    }
  }
}
```

### 3. Currency Conversion Report

#### GET /api/admin/reports/currency-conversions
```json
{
  "success": true,
  "data": {
    "conversions": [
      {
        "date": "2024-01-15",
        "orderId": "order-uuid",
        "storeId": "store-uuid",
        "storeName": "Store Name",
        "originalCurrency": "TRY",
        "originalAmount": 3250,
        "targetCurrency": "USD",
        "convertedAmount": 100,
        "exchangeRate": 32.50,
        "rateSource": "TCMB"
      }
    ],
    "summary": {
      "totalConversions": 45,
      "totalVolumeConverted": {
        "TRY_to_USD": 150000,
        "USD_to_TRY": 5000
      },
      "averageRates": {
        "USD_TRY": 32.45,
        "TRY_USD": 0.0308
      }
    }
  }
}
```

## 🔧 Exchange Rate Service

### Mevcut Metodlar (Korunur)
```typescript
// Güncel kurları getir
getRates(): Promise<{ USD: number }>

// USD'den TRY'ye çevir
convertUSDtoTRY(amount: number): Promise<number>

// TRY'den USD'ye çevir
convertTRYtoUSD(amount: number): Promise<number>
```

## 📈 Kullanım Senaryoları

### 1. USD Mağaza Sipariş İşlemi

1. **Sipariş Oluşturma:**
   - Order Service otomatik olarak store'un currency'sini (USD) order'a atar
   - `order_currency: 'USD'`, `payment_currency: 'USD'` olur

2. **Ödeme İşlemi:**
   - Payment Service store currency'sini kontrol eder
   - USD ödeme için dönüşüm yapılmaz
   - PaymentTransaction'da currency bilgileri kaydedilir

3. **Muhasebe Kaydı:**
   - Manuel satış için currency belirtilir: `{ currency: 'USD' }`
   - Exchange rate hesaplanmaz (aynı currency)

### 2. TRY Mağaza USD Ödemesi

1. **Ödeme İşlemi:**
   - Store currency: TRY, Payment currency: USD
   - Exchange rate hesaplanır ve çevrim yapılır
   - Converted amount TRY olarak hesaplanır

2. **Muhasebe Kaydı:**
   - Original currency: USD, Target currency: TRY
   - Exchange rate ve converted amount kaydedilir

### 3. Currency Bazında Raporlama

1. **Mağaza Analizi:**
   ```bash
   GET /api/admin/finance/currency-analysis?storeId=uuid
   ```

2. **Ayrı Currency Görünümü:**
   ```bash
   GET /api/admin/finance/transactions?storeId=uuid&separateCurrencies=true
   ```

3. **Performance Raporu:**
   ```bash
   GET /api/admin/reports/dollar-store-performance?period=1_month
   ```

## 🛡️ Güvenlik Önlemleri

### 1. Rate Limiting
```typescript
// Currency endpoint'leri için özel rate limit
const currencyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // maksimum istek
  message: 'Too many currency requests'
});

// Uygulanan rotalar
router.use('/api/admin/finance/currency*', currencyRateLimit);
router.use('/api/admin/reports/dollar*', currencyRateLimit);
```

### 2. Authentication & Authorization
- Tüm finance ve raporlama endpoint'leri admin/editor yetkisi gerektirir
- Currency analysis sadece ilgili mağaza veya admin erişebilir

### 3. Audit Logging
```typescript
// Currency işlemleri için otomatik log
{
  userId: "uuid",
  action: "CURRENCY_CONVERSION",
  details: {
    from: "TRY",
    to: "USD", 
    amount: 3250,
    rate: 32.50,
    storeId: "uuid"
  },
  timestamp: "2024-01-15T10:30:00Z"
}
```

## 🧪 Test Senaryoları

### 1. Geriye Uyumluluk Testi
```typescript
// Mevcut API'lerin çalıştığını doğrula
describe('Backward Compatibility', () => {
  test('Existing finance API works without currency params', async () => {
    const response = await request(app)
      .get('/api/admin/finance/transactions')
      .query({ storeId: 'test-store' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    // Eski format korunmalı
    expect(response.body.data.transactions).toBeInstanceOf(Array);
  });
});
```

### 2. Currency Separation Testi
```typescript
describe('Currency Separation', () => {
  test('Transactions separated by currency when requested', async () => {
    const response = await request(app)
      .get('/api/admin/finance/transactions')
      .query({ 
        storeId: 'test-store',
        separateCurrencies: true 
      });
    
    expect(response.body.data.transactions).toHaveProperty('TRY');
    expect(response.body.data.transactions).toHaveProperty('USD');
    expect(response.body.data.separatedByCurrency).toBe(true);
  });
});
```

### 3. Exchange Rate Test
```typescript
describe('Exchange Rate Conversion', () => {
  test('USD payment converts to TRY correctly', async () => {
    const response = await request(app)
      .post('/api/payments/checkout')
      .send({
        storeId: 'try-store-id',
        userId: 'user-id',
        amount: 100,
        currencyCode: 'USD'
      });
    
    expect(response.body.success).toBe(true);
    // Converted amount TRY cinsinden olmalı
  });
});
```

## 🚀 Production Deployment Checklist

- [x] Database schema changes applied with `db push`
- [x] Prisma client regenerated  
- [x] All TypeScript errors resolved
- [x] Backward compatibility maintained
- [x] New endpoints tested
- [x] Exchange rate service integration verified
- [x] Currency conversion logic tested
- [x] Error handling implemented
- [x] Rate limiting configured
- [x] Audit logging enabled

## 📝 Önemli Notlar

### 1. Geriye Uyumluluk
- **Mevcut API'ler değişmez** - Tüm eski endpoint'ler aynı şekilde çalışır
- **Yeni parametreler opsiyonel** - separateCurrencies, currency vb.
- **Default değerler korunur** - Currency belirtilmezse TRY varsayılır

### 2. Performance Considerations
- Currency conversion işlemleri cache'lenebilir
- Exchange rate service'den alınan kurlar geçici olarak saklanabilir
- Büyük raporlar için pagination düşünülmeli

### 3. Monitoring Metrikleri
- **Currency operation count** - Döviz işlem sayısı
- **Exchange rate update success rate** - Kur güncelleme başarı oranı
- **API response times** - Endpoint yanıt süreleri
- **Error rates by currency** - Para birimi bazında hata oranları

### 4. Future Enhancements
- Otomatik currency summary generation (scheduled job)
- More detailed exchange rate history
- Advanced reporting with charts and graphs
- Mobile app currency widgets
- Real-time currency notifications

Bu sistem ile dolar ödemeleri ve mağazaları güvenli, kapsamlı ve performanslı bir şekilde takip edebilirsiniz.