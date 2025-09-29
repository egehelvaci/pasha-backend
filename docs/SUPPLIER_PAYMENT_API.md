# Satıcı Ödeme API Dokümantasyonu

## Genel Bilgiler

Bu API, satıcılara ödeme yapma işlemlerini yönetmek için kullanılır. Tüm işlemler USD cinsinden kaydedilir ve TRY tutarlar dolar kuru ile çevrilerek işlenir.

**Base URL:** `http://localhost:3001/api/admin/purchase-management`

**Yetkilendirme:** Tüm endpoint'ler Bearer token ile korunmaktadır.

---

## 1. Satıcıya Ödeme Yapma

Belirtilen satıcının borcunu azaltmak için ödeme işlemi yapar.

### Endpoint
```
PUT /suppliers/{supplier_id}/balance
```

### Headers
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "amount": 50000,
  "transaction_type": "PAYMENT",
  "description": "Aylık ödeme",
  "reference_number": "PAY-2025-001",
  "exchange_rate": 35.50
}
```

### Request Body Parametreleri

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `amount` | number | ✅ | TRY cinsinden ödeme tutarı |
| `transaction_type` | string | ✅ | İşlem türü (PAYMENT, ADJUSTMENT, REFUND) |
| `description` | string | ❌ | İşlem açıklaması |
| `reference_number` | string | ❌ | Referans numarası |
| `exchange_rate` | number | ✅ | USD/TRY kuru |

### Başarılı Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "68896ed9-e0bd-4ef8-9738-7f2361082365",
    "name": "serhat kenar",
    "company_name": "burgaz iplik",
    "phone": "+90 545 501 56 11",
    "address": "lüleburgaz sokak",
    "notes": null,
    "balance": "-1419.75",
    "currency": "USD",
    "is_active": true,
    "created_at": "2025-09-22T13:06:53.867Z",
    "updated_at": "2025-09-29T19:45:12.123Z",
    "transaction_info": {
      "original_amount": 50000,
      "exchange_rate": 35.50,
      "usd_amount": 1408.45,
      "original_currency": "TRY"
    }
  },
  "message": "Satıcı bakiyesi başarıyla güncellendi. 50000 TRY (35.5 kurdan) = $1408.45 USD"
}
```

### Hata Response'ları

#### 400 Bad Request - Geçersiz Tutar
```json
{
  "success": false,
  "message": "Geçerli bir tutar giriniz"
}
```

#### 400 Bad Request - Eksik İşlem Türü
```json
{
  "success": false,
  "message": "İşlem türü zorunludur"
}
```

#### 400 Bad Request - Geçersiz Dolar Kuru
```json
{
  "success": false,
  "message": "Geçerli bir dolar kuru giriniz"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Kullanıcı doğrulaması gerekli"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Satıcı bulunamadı"
}
```

---

## 2. Satıcı Bakiye Geçmişi

Belirtilen satıcının tüm bakiye işlemlerini listeler.

### Endpoint
```
GET /suppliers/{supplier_id}/balance-history?page=1&limit=50
```

### Headers
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

### Query Parametreleri

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|-----------|-----|---------|------------|----------|
| `page` | number | ❌ | 1 | Sayfa numarası |
| `limit` | number | ❌ | 50 | Sayfa başına kayıt sayısı |

### Başarılı Response (200 OK)
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "520eae0c-1327-4ab7-a0ae-8c93d4e9274a",
        "supplier_id": "68896ed9-e0bd-4ef8-9738-7f2361082365",
        "transaction_type": "PAYMENT",
        "amount": "1408.45",
        "original_amount": "50000",
        "exchange_rate": "35.50",
        "original_currency": "TRY",
        "previous_balance": "-1839.75",
        "new_balance": "-431.30",
        "description": "Aylık ödeme",
        "reference_number": "PAY-2025-001",
        "created_by": "9db66c32-acd1-4fff-b08c-cb725ad9da42",
        "created_at": "2025-09-29T19:45:12.123Z",
        "supplier": {
          "name": "serhat kenar",
          "company_name": "burgaz iplik"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Satıcı bakiye geçmişi başarıyla getirildi"
}
```

---

## 3. Satıcı Bakiye Özeti

Tüm satıcıların bakiye durumunu ve borç/alacak özetini getirir.

### Endpoint
```
GET /suppliers/balance-summary
```

### Headers
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

### Başarılı Response (200 OK)
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalReceivable": 0,
      "totalPayable": 1839.75,
      "receivableCount": 0,
      "payableCount": 4,
      "neutralCount": 0,
      "totalSuppliers": 4,
      "netBalance": -1839.75
    },
    "debtors": [
      {
        "id": "68896ed9-e0bd-4ef8-9738-7f2361082365",
        "name": "serhat kenar",
        "company_name": "burgaz iplik",
        "balance": "-1839.75",
        "currency": "USD",
        "updated_at": "2025-09-29T19:36:09.189Z",
        "debt": 1839.75
      }
    ],
    "creditors": [],
    "allSuppliers": [...]
  },
  "message": "Satıcı bakiye özeti başarıyla getirildi"
}
```

---

## İşlem Türleri

| Kod | Açıklama |
|-----|----------|
| `PAYMENT` | Ödeme (borç azalması) |
| `ADJUSTMENT` | Manuel düzeltme |
| `REFUND` | İade |
| `DISCOUNT` | İndirim |
| `CART_PURCHASE` | Sepetten alım (borç artışı) |
| `PRODUCT_PURCHASE` | Tekil ürün alımı (borç artışı) |
| `INITIAL_BALANCE` | Başlangıç bakiyesi |

---

## Örnekler

### PowerShell ile Ödeme Yapma
```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
$supplierId = "68896ed9-e0bd-4ef8-9738-7f2361082365"

$paymentData = @{
    amount = 50000
    transaction_type = "PAYMENT"
    description = "Aylık ödeme"
    reference_number = "PAY-2025-001"
    exchange_rate = 35.50
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/purchase-management/suppliers/$supplierId/balance" -Method PUT -Headers @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" } -Body $paymentData

Write-Host "Ödeme sonucu:"
$result | ConvertTo-Json -Depth 3
```

### cURL ile Ödeme Yapma
```bash
curl -X PUT "http://localhost:3001/api/admin/purchase-management/suppliers/68896ed9-e0bd-4ef8-9738-7f2361082365/balance" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "transaction_type": "PAYMENT",
    "description": "Aylık ödeme",
    "reference_number": "PAY-2025-001",
    "exchange_rate": 35.50
  }'
```

### JavaScript/Node.js ile Ödeme Yapma
```javascript
const axios = require('axios');

const makeSupplierPayment = async () => {
  try {
    const response = await axios.put(
      'http://localhost:3001/api/admin/purchase-management/suppliers/68896ed9-e0bd-4ef8-9738-7f2361082365/balance',
      {
        amount: 50000,
        transaction_type: 'PAYMENT',
        description: 'Aylık ödeme',
        reference_number: 'PAY-2025-001',
        exchange_rate: 35.50
      },
      {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Ödeme başarılı:', response.data);
  } catch (error) {
    console.error('Ödeme hatası:', error.response?.data || error.message);
  }
};

makeSupplierPayment();
```

---

## Notlar

1. **Para Birimi:** Tüm işlemler USD cinsinden saklanır, TRY tutarlar exchange_rate ile çevrilir.
2. **Bakiye Mantığı:** 
   - Negatif bakiye = Satıcıya borç var
   - Pozitif bakiye = Satıcıdan alacak var
   - Ödeme işlemi bakiyeyi pozitif yönde artırır (borcu azaltır)
3. **Yetkilendirme:** Sadece admin ve editor yetkili kullanıcılar ödeme yapabilir.
4. **İşlem Geçmişi:** Tüm işlemler supplier_balance_transactions tablosunda saklanır.
5. **Validation:** amount ve exchange_rate pozitif değerler olmalıdır.
