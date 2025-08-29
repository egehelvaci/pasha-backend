# Dolar Ödeme ve Mağaza Takip Sistemi - Implementasyon Rehberi

## 🎯 Genel Bakış

Bu dokümantasyon, dolar ile yapılan ödemelerin ve USD para birimi kullanan mağazaların ayrı takip edilmesi için gereken tüm sistem değişikliklerini içerir. **Mevcut API'ler korunarak**, yeni özellikler eklenir.

## ⚠️ Önemli Notlar

- **DB Push kullanılacak** (migration değil)
- **Reset yapılmayacak**
- **Mevcut API'ler bozulmayacak**
- **Tüm yeni alanlar opsiyonel olacak**

## 📊 Mevcut Sistem Analizi

### Halihazırda Var Olan Özellikler:
- Store tablosunda `currency` alanı (TRY/USD)
- ExchangeRate tablosu ve servisi
- Payment sisteminde currencyCode desteği
- Finance controller'da basit currency filtreleme

### Eksiklikler:
- Sipariş bazında currency takibi yok
- Muhasebe hareketlerinde currency ayrımı yok
- İstatistiklerde currency bazlı raporlama yok
- Payment transaction'larda detaylı currency bilgisi yok

## 🗄️ Database Değişiklikleri (DB Push ile)

### 1. Schema.prisma Güncellemeleri

```prisma
// prisma/schema.prisma

// Order tablosuna eklenecek alanlar
model Order {
  // ... mevcut alanlar ...
  
  // YENI ALANLAR - Hepsi opsiyonel ve default değerli
  order_currency     Currency?  @default(TRY) @map("order_currency")
  payment_currency   Currency?  @default(TRY) @map("payment_currency")
  exchange_rate      Decimal?   @db.Decimal(10, 4) @map("exchange_rate")
  original_amount    Decimal?   @db.Decimal(12, 2) @map("original_amount")
  converted_amount   Decimal?   @db.Decimal(12, 2) @map("converted_amount")
  
  // ... mevcut ilişkiler ...
}

// MuhasebeHareketleri tablosuna eklenecek alanlar
model MuhasebeHareketleri {
  // ... mevcut alanlar ...
  
  // YENI ALANLAR - Hepsi opsiyonel
  currency           Currency?  @default(TRY) @map("currency")
  original_currency  Currency?  @default(TRY) @map("original_currency")
  exchange_rate      Decimal?   @db.Decimal(10, 4) @map("exchange_rate")
  original_amount    Decimal?   @db.Decimal(10, 2) @map("original_amount")
  
  // ... mevcut ilişkiler ...
}

// PaymentTransaction tablosuna eklenecek alanlar
model PaymentTransaction {
  // ... mevcut alanlar ...
  
  // YENI ALANLAR - Hepsi opsiyonel
  store_currency     Currency?  @default(TRY) @map("store_currency")
  payment_currency   Currency?  @default(TRY) @map("payment_currency")
  exchange_rate      Decimal?   @db.Decimal(10, 4) @map("exchange_rate")
  original_amount    Decimal?   @db.Decimal(12, 2) @map("original_amount")
  converted_amount   Decimal?   @db.Decimal(12, 2) @map("converted_amount")
  
  // ... mevcut ilişkiler ...
}

// YENI TABLO - Currency özet verileri için
model CurrencySummary {
  id                String    @id @default(uuid())
  store_id          String    @db.Uuid
  currency          Currency
  period_start      DateTime
  period_end        DateTime
  total_revenue     Decimal   @db.Decimal(12, 2)
  total_orders      Int
  average_rate      Decimal?  @db.Decimal(10, 4)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  
  store             Store     @relation(fields: [store_id], references: [store_id])
  
  @@unique([store_id, currency, period_start, period_end])
  @@map("currency_summaries")
}

// Store tablosuna relation ekleme
model Store {
  // ... mevcut alanlar ...
  
  currencySummaries  CurrencySummary[]
}
```

### 2. DB Push Komutu

```bash
# Development ortamı için
npx prisma db push --skip-generate

# Prisma client'ı güncelle
npx prisma generate

# Production için (dikkatli olun)
DATABASE_URL="production_url" npx prisma db push --skip-generate --accept-data-loss=false
```

## 🔧 API Güncellemeleri

### 1. Finance Controller Güncellemeleri

#### A. Mevcut Endpoint Korunur + Yeni Özellikler

```typescript
// src/admin/finance-controller.ts

// MEVCUT ENDPOINT - Geriye uyumlu
async getTransactions(req: Request, res: Response) {
  const { 
    storeId, 
    currency, 
    convertTo,
    separateCurrencies = false // YENI opsiyonel parametre
  } = req.query;

  // Eski davranış korunur
  if (!separateCurrencies) {
    // Mevcut logic aynen devam eder
    return existingLogic();
  }

  // Yeni davranış - currency ayrımı
  const transactions = await prisma.muhasebeHareketleri.findMany({
    where: { storeId: storeId as string },
    orderBy: { createdAt: 'desc' }
  });

  // Currency bazında gruplama
  const groupedByCurrency = {
    TRY: [],
    USD: []
  };

  for (const transaction of transactions) {
    const txCurrency = transaction.currency || 'TRY';
    groupedByCurrency[txCurrency].push(transaction);
  }

  // Currency bazında özet
  const currencySummaries = {
    TRY: calculateSummary(groupedByCurrency.TRY, 'TRY'),
    USD: calculateSummary(groupedByCurrency.USD, 'USD')
  };

  return res.json({
    success: true,
    data: {
      transactions: separateCurrencies ? groupedByCurrency : transactions,
      summary: separateCurrencies ? currencySummaries : existingSummary()
    }
  });
}

// YENI ENDPOINT - Currency analizi
async getCurrencyAnalysis(req: Request, res: Response) {
  const { storeId, startDate, endDate } = req.query;

  // Store currency bilgisi
  const store = await prisma.store.findUnique({
    where: { store_id: storeId as string },
    select: { currency: true, kurum_adi: true }
  });

  // Currency bazında siparişler
  const orders = await prisma.order.findMany({
    where: {
      user: { store_id: storeId as string },
      created_at: {
        gte: startDate ? new Date(startDate as string) : undefined,
        lte: endDate ? new Date(endDate as string) : undefined
      }
    },
    select: {
      id: true,
      total_price: true,
      order_currency: true,
      payment_currency: true,
      exchange_rate: true,
      created_at: true
    }
  });

  // Analiz verileri
  const analysis = {
    store: {
      id: storeId,
      name: store.kurum_adi,
      defaultCurrency: store.currency
    },
    summary: {
      TRY: {
        orderCount: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      },
      USD: {
        orderCount: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      }
    },
    exchangeRateStats: {
      average: 0,
      min: 0,
      max: 0
    }
  };

  // Hesaplamalar...
  return res.json({ success: true, data: analysis });
}
```

### 2. Muhasebe Controller Güncellemeleri

```typescript
// src/admin/muhasebe-controller.ts

// MEVCUT createMuhasebeHareketi - Güncellenir
async createMuhasebeHareketi(req: Request, res: Response) {
  const { 
    storeId, 
    islemTuru, 
    tutar, 
    tarih, 
    aciklama,
    currency // YENI - opsiyonel
  } = req.body;

  // Store bilgileri
  const store = await prisma.store.findUnique({
    where: { store_id: storeId },
    select: { currency: true }
  });

  const storeCurrency = store.currency || 'TRY';
  const transactionCurrency = currency || storeCurrency;

  let exchangeRate = null;
  let originalAmount = tutar;

  // Currency farklıysa exchange rate hesapla
  if (transactionCurrency !== storeCurrency) {
    exchangeRate = await exchangeRateService.getRate(
      transactionCurrency, 
      storeCurrency
    );
  }

  // Transaction içinde kaydet
  const result = await prisma.$transaction(async (tx) => {
    const yeniHareket = await tx.muhasebeHareketleri.create({
      data: {
        storeId,
        islemTuru,
        tutar,
        harcama,
        tarih: new Date(tarih),
        aciklama,
        // YENI alanlar
        currency: transactionCurrency,
        original_currency: transactionCurrency,
        exchange_rate: exchangeRate,
        original_amount: originalAmount
      }
    });

    // Mevcut bakiye güncelleme logic'i aynen kalır
    // ...

    return yeniHareket;
  });

  return res.status(201).json({
    success: true,
    data: result
  });
}
```

### 3. Order Service Güncellemeleri

```typescript
// src/order-service.ts

// processOrder metoduna currency bilgisi ekleme
async processOrder(
  userId: string,
  storeId: string,
  items: any[],
  addressId?: string,
  notes?: string
) {
  // Store currency bilgisi
  const store = await prisma.store.findUnique({
    where: { store_id: storeId },
    select: { currency: true }
  });

  const orderCurrency = store?.currency || 'TRY';

  // Order oluşturma
  const order = await prisma.order.create({
    data: {
      // ... mevcut alanlar ...
      // YENI alanlar
      order_currency: orderCurrency,
      payment_currency: orderCurrency, // Başlangıçta aynı
      original_amount: totalPrice
    }
  });

  return order;
}
```

### 4. Payment Service Güncellemeleri

```typescript
// src/services/payment-service.ts

async checkout(input: CreateCheckoutInput) {
  const { 
    storeId, 
    userId, 
    amount, 
    currencyCode,
    // ... diğer parametreler
  } = input;

  // Store bilgileri
  const store = await this.getStoreInfo(storeId);
  const storeCurrency = store.currency || 'TRY';
  const paymentCurrency = currencyCode || storeCurrency;

  let finalAmount = amount;
  let exchangeRate = null;
  let originalAmount = amount;
  let convertedAmount = null;

  // Currency çevrimi gerekiyorsa
  if (paymentCurrency !== storeCurrency) {
    if (paymentCurrency === 'USD' && storeCurrency === 'TRY') {
      convertedAmount = await exchangeRateService.convertUSDtoTRY(amount);
      finalAmount = convertedAmount;
    } else if (paymentCurrency === 'TRY' && storeCurrency === 'USD') {
      convertedAmount = await exchangeRateService.convertTRYtoUSD(amount);
      finalAmount = convertedAmount;
    }
    
    exchangeRate = await exchangeRateService.getRate(
      paymentCurrency, 
      storeCurrency
    );
  }

  // Payment transaction oluştur
  const transaction = await prisma.paymentTransaction.create({
    data: {
      // ... mevcut alanlar ...
      // YENI alanlar
      store_currency: storeCurrency,
      payment_currency: paymentCurrency,
      exchange_rate: exchangeRate,
      original_amount: originalAmount,
      converted_amount: convertedAmount
    }
  });

  // Mevcut checkout logic devam eder...
}
```

### 5. Statistics Controller Güncellemeleri

```typescript
// src/admin/admin-statistics-controller.ts

// YENI ENDPOINT - Currency bazlı istatistikler
async getCurrencyStatistics(req: Request, res: Response) {
  const { period = '1_month', storeId } = req.query;

  const startDate = calculateStartDate(period);

  // Currency bazında sipariş istatistikleri
  const orderStats = await prisma.order.groupBy({
    by: ['order_currency'],
    where: {
      created_at: { gte: startDate },
      ...(storeId && {
        user: { store_id: storeId as string }
      })
    },
    _count: { id: true },
    _sum: { total_price: true }
  });

  // Currency bazında mağaza sayıları
  const storeStats = await prisma.store.groupBy({
    by: ['currency'],
    where: { is_active: true },
    _count: { store_id: true }
  });

  // Dolar mağaza performansı
  const dollarStores = await prisma.store.findMany({
    where: { 
      currency: 'USD',
      is_active: true 
    },
    include: {
      User: {
        include: {
          orders: {
            where: { created_at: { gte: startDate } },
            select: {
              total_price: true,
              order_currency: true
            }
          }
        }
      }
    }
  });

  // Top 5 dolar mağaza
  const topDollarStores = processTopStores(dollarStores);

  return res.json({
    success: true,
    data: {
      orderStatsByCurrency: orderStats,
      storeStatsByCurrency: storeStats,
      topDollarStores,
      period,
      startDate
    }
  });
}

// MEVCUT getTotalStatistics - Currency bilgisi eklenir
async getTotalStatistics(req: Request, res: Response) {
  // Mevcut logic korunur
  const existingData = await getExistingStatistics();

  // YENI - Currency breakdown eklenir
  const currencyBreakdown = await prisma.order.groupBy({
    by: ['order_currency'],
    where: existingData.whereClause,
    _count: { id: true },
    _sum: { total_price: true }
  });

  return res.json({
    success: true,
    data: {
      ...existingData,
      // YENI alan
      currencyBreakdown
    }
  });
}
```

## 📊 Yeni Raporlama Endpoint'leri

### 1. Dolar Mağaza Performans Raporu

```typescript
// Route: GET /api/admin/reports/dollar-store-performance
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
          "growthRate": 15.5, // %
          "exchangeRateImpact": {
            "averageRate": 32.50,
            "totalSavedTRY": 5000 // Kur farkından kazanç
          }
        }
      }
    ],
    "summary": {
      "totalDollarStores": 5,
      "totalDollarRevenue": 50000,
      "totalDollarOrders": 500,
      "marketShare": 12.5 // % of total revenue
    }
  }
}
```

### 2. Currency Dönüşüm Raporu

```typescript
// Route: GET /api/admin/reports/currency-conversions
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

## 📈 Dashboard Widget'ları

### 1. Currency Overview Widget

```typescript
// src/admin/dashboard-widgets.ts

async getCurrencyOverview() {
  const [tryStats, usdStats, currentRate] = await Promise.all([
    // TRY istatistikleri
    prisma.order.aggregate({
      where: { order_currency: 'TRY' },
      _sum: { total_price: true },
      _count: { id: true }
    }),
    // USD istatistikleri
    prisma.order.aggregate({
      where: { order_currency: 'USD' },
      _sum: { total_price: true },
      _count: { id: true }
    }),
    // Güncel kur
    exchangeRateService.getCurrentRate()
  ]);

  return {
    TRY: {
      revenue: tryStats._sum.total_price || 0,
      orders: tryStats._count.id,
      trend: calculateTrend('TRY')
    },
    USD: {
      revenue: usdStats._sum.total_price || 0,
      orders: usdStats._count.id,
      trend: calculateTrend('USD')
    },
    exchangeRate: currentRate
  };
}
```

### 2. Real-time Currency Alert Widget

```typescript
// Kur değişim uyarıları
interface CurrencyAlert {
  type: 'RATE_CHANGE' | 'HIGH_VOLUME' | 'CONVERSION_SPIKE';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  data: {
    currentRate?: number;
    previousRate?: number;
    changePercent?: number;
    affectedStores?: number;
  };
}
```

## 🔐 Güvenlik Önlemleri

### 1. Rate Limiting

```typescript
// Currency endpoint'leri için özel rate limit
const currencyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // maksimum istek
  message: 'Too many currency requests'
});

router.use('/api/admin/finance/currency*', currencyRateLimit);
router.use('/api/admin/reports/dollar*', currencyRateLimit);
```

### 2. Audit Logging

```typescript
// Currency işlemleri için audit log
async logCurrencyOperation(operation: {
  userId: string;
  action: string;
  details: any;
}) {
  await prisma.auditLog.create({
    data: {
      userId: operation.userId,
      action: operation.action,
      entityType: 'CURRENCY_OPERATION',
      details: operation.details,
      ip: req.ip,
      userAgent: req.get('user-agent')
    }
  });
}
```

## 📋 Implementasyon Planı

### Hafta 1: Database ve Model Güncellemeleri
```bash
# 1. Schema.prisma güncellemeleri
# 2. DB Push ile değişiklikleri uygula
npx prisma db push --skip-generate

# 3. Prisma client güncelle
npx prisma generate

# 4. TypeScript type'ları kontrol et
npm run type-check
```

### Hafta 2: Core Service Güncellemeleri
- [ ] Exchange rate service iyileştirmeleri
- [ ] Payment service currency desteği
- [ ] Order service currency tracking
- [ ] Transaction logging

### Hafta 3: API Endpoint'leri
- [ ] Finance controller güncellemeleri
- [ ] Statistics controller yeni endpoint'ler
- [ ] Report controller implementation
- [ ] Dashboard widget API'leri

### Hafta 4: Test ve Optimizasyon
- [ ] Unit testler
- [ ] Integration testler
- [ ] Performance testleri
- [ ] Security audit

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
  });
});
```

## 🚀 Production Deployment Checklist

- [ ] Schema değişiklikleri test edildi
- [ ] DB Push dry-run yapıldı
- [ ] Backup alındı
- [ ] Mevcut API'ler test edildi
- [ ] Yeni endpoint'ler test edildi
- [ ] Performance metrikleri kontrol edildi
- [ ] Rollback planı hazır
- [ ] Monitoring alarm'ları ayarlandı

## 📝 Notlar

1. **DB Push Avantajları:**
   - Migration history karmaşası yok
   - Hızlı iterasyon
   - Development'ta kolay test

2. **Dikkat Edilecekler:**
   - Production'da dikkatli olun
   - Her zaman backup alın
   - Dry-run yapın: `npx prisma db push --dry-run`

3. **Monitoring:**
   - Currency operation metrikleri
   - Exchange rate update başarı oranı
   - API response time'ları

Bu sistem tasarımı ile dolar ödemeleri ve mağazaları güvenli bir şekilde ayrı takip edebilirsiniz.
