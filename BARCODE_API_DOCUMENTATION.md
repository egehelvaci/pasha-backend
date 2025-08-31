# Barkod Sistemi API Dökümanı

## Genel Bakış

Bu döküman, sipariş yönetim sistemine eklenen barkod okutma özelliğinin API endpoint'lerini açıklamaktadır.

## Sistem Akışı

1. **QR Kod Okutma**: Tüm QR kodlar okutulduğunda sipariş durumu `READY` olur
2. **Otomatik Barkod Oluşturma**: Sipariş `CONFIRMED` olduğunda (QR kod oluşturma esnasında) her ürün için otomatik barkod oluşturulur
3. **Barkod Okutma**: Barkodlar okutulup gönderildiğinde sipariş `DELIVERED` durumuna geçer
4. **Çoklu Sipariş Desteği**: Birden fazla siparişin barkodları aynı anda okutulabilir

## Database Değişiklikleri

### Yeni Model: Barcode

```prisma
model Barcode {
  id              String     @id @default(uuid())
  order_id        String
  order_item_id   String
  product_id      String?    @db.VarChar(36)
  barcode         String     @unique
  barcode_type    String     @default("CODE128")
  is_scanned      Boolean    @default(false)
  scanned_at      DateTime?
  scanned_by      String?    @db.VarChar(36)
  created_at      DateTime   @default(now())
  quantity        Int        @default(1)
  order           Order      @relation(...)
  order_item      OrderItem  @relation(...)
  product         Product?   @relation(...)
}
```

### OrderStatus Enum Güncellemesi

```prisma
enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELED
  READY
}
```

## API Endpoints

### 1. Tekli Barkod Okutma

**Endpoint:** `POST /api/admin/barcode/scan`

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "barcode": "BAR-1234567890-ABCDEF"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Barkod okutuldu (5/10)",
  "barcode": {
    "id": "uuid",
    "barcode": "BAR-1234567890-ABCDEF",
    "is_scanned": true,
    "scanned_at": "2024-01-15T10:30:00Z",
    "product_id": "product-uuid"
  },
  "order": {
    "id": "order-uuid",
    "status": "READY",
    "total_price": 1500.00,
    "customer": {
      "name": "Ahmet",
      "email": "ahmet@example.com",
      "store": {...}
    }
  },
  "scanInfo": {
    "scanned_count": 5,
    "total_count": 10,
    "is_completed": false,
    "progress_percentage": 50
  }
}
```

### 2. Çoklu Barkod Okutma

**Endpoint:** `POST /api/admin/barcode/scan-multiple`

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "barcodes": [
    "BAR-1234567890-ABCDEF",
    "BAR-1234567890-GHIJKL",
    "BAR-1234567890-MNOPQR"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "success": true,
      "barcode": "BAR-1234567890-ABCDEF",
      "order": {...},
      "scanInfo": {...}
    },
    {
      "success": false,
      "barcode": "BAR-1234567890-GHIJKL",
      "error": "Bu barkod zaten okutulmuş"
    }
  ],
  "summary": {
    "total_scanned": 2,
    "total_failed": 1,
    "completed_orders": ["order-uuid-1"],
    "completed_orders_count": 1
  }
}
```

### 3. Sipariş Barkodlarını Getir

**Endpoint:** `GET /api/admin/orders/{orderId}/barcodes`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Response:**
```json
{
  "success": true,
  "barcodes": [
    {
      "id": "uuid",
      "barcode": "BAR-1234567890-ABCDEF",
      "is_scanned": false,
      "product_id": "product-uuid",
      "order_item": {
        "id": "item-uuid",
        "product": {
          "name": "Ürün Adı"
        }
      }
    }
  ],
  "scanInfo": {
    "scanned_count": 0,
    "total_count": 10,
    "is_completed": false,
    "progress_percentage": 0
  }
}
```

### 4. Barkod İstatistikleri

**Endpoint:** `GET /api/admin/barcode/stats`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Query Parameters:**
- `orderId` (opsiyonel): Belirli bir sipariş için istatistikler

**Response:**
```json
{
  "success": true,
  "data": {
    "total_barcodes": 150,
    "scanned_barcodes": 75,
    "pending_barcodes": 75,
    "total_orders_with_barcodes": 10,
    "completed_orders": 3,
    "order_completion_rate": 30,
    "barcode_scan_rate": 50
  }
}
```

### 5. READY Durumundaki Siparişleri Barkodlarıyla Getir

**Endpoint:** `GET /api/admin/orders/ready/with-barcodes`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "status": "READY",
      "total_price": 1500.00,
      "user": {...},
      "items": [...],
      "barcodes": [...],
      "barcodeInfo": {
        "total": 10,
        "scanned": 5,
        "pending": 5,
        "completionRate": 50,
        "isComplete": false
      }
    }
  ],
  "summary": {
    "totalOrders": 5,
    "ordersWithAllBarcodesScanned": 2,
    "ordersWithPendingBarcodes": 3,
    "ordersWithoutBarcodes": 0
  }
}
```

## Otomatik Barkod Oluşturma

### QR Kod API'sinde Otomatik Barkod Oluşturma

**Endpoint:** `POST /api/admin/orders/{orderId}/generate-qr`

Sipariş durumu `CONFIRMED` olduğunda otomatik olarak barkodlar da oluşturulur.

**Response:**
```json
{
  "success": true,
  "qrCodes": [...],
  "barcodes": {
    "success": true,
    "barcodes": [...],
    "totalBarcodes": 10,
    "itemBreakdown": [
      {
        "itemId": "item-uuid",
        "productId": "product-uuid",
        "quantity": 5,
        "barcodesGenerated": 5
      }
    ]
  }
}
```

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 400 | Geçersiz istek - Eksik veya hatalı parametreler |
| 401 | Yetkisiz erişim - Token geçersiz veya eksik |
| 403 | Yasaklı - Yetersiz yetki |
| 404 | Bulunamadı - Barkod veya sipariş bulunamadı |
| 500 | Sunucu hatası |

## Kullanım Senaryoları

### Senaryo 1: Tek Sipariş Gönderimi

1. Çalışan, READY durumundaki siparişi görür
2. Sipariş için oluşturulmuş barkodları görür
3. Her ürünün barkodunu okutarak paketler
4. Tüm barkodlar okutulduğunda sipariş otomatik olarak IN_DELIVERY durumuna geçer

### Senaryo 2: Toplu Gönderim

1. Çalışan birden fazla siparişin ürünlerini toplar
2. Tüm ürünlerin barkodlarını toplu olarak okuttur
3. Sistem otomatik olarak hangi siparişlerin tamamlandığını tespit eder
4. Tamamlanan siparişler IN_DELIVERY durumuna geçer

## Güvenlik Notları

- Tüm endpoint'ler authentication gerektirir
- Sadece `admin` ve `editor` rolleri bu API'leri kullanabilir
- Barkodlar benzersiz olmalıdır ve tekrar kullanılamaz
- Okutulmuş barkodlar tekrar okutulamaz

## Entegrasyon Örnekleri

### JavaScript/TypeScript

```typescript
// Tekli barkod okutma
async function scanBarcode(barcode: string) {
  const response = await fetch('/api/admin/barcode/scan', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ barcode })
  });
  
  return await response.json();
}

// Çoklu barkod okutma
async function scanMultipleBarcodes(barcodes: string[]) {
  const response = await fetch('/api/admin/barcode/scan-multiple', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ barcodes })
  });
  
  return await response.json();
}
```

### Barkod Okuyucu Entegrasyonu

Barkod okuyucular genellikle klavye emülasyonu yapar. Okutma sayfasında:

1. Input alanına focus verilir
2. Barkod okutulduğunda otomatik olarak input'a yazılır
3. Enter tuşu tetiklenir (çoğu okuyucu otomatik yapar)
4. API çağrısı yapılır

## Versiyon Notları

- **v1.0.0** (2024-01-15): İlk versiyon
  - QR kod okutma sonrası otomatik barkod oluşturma
  - Tekli ve çoklu barkod okutma
  - IN_DELIVERY durumu eklendi
  - Barkod istatistikleri