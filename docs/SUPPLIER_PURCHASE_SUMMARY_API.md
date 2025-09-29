# Satıcı Satın Alım Özeti API Dokümantasyonu

## Genel Bilgiler

Bu API, belirli bir satıcıdan yapılan tüm satın alımları, ürün detaylarını ve istatistikleri getirir.

**Base URL:** `https://pashahomeapps.up.railway.app/api/admin/purchase-management`

**Yetkilendirme:** Bearer token ile korunmaktadır.

---

## Endpoint

```
GET /suppliers/{supplier_id}/purchase-summary
```

### Headers
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

### Query Parametreleri

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `start_date` | string | ❌ | Başlangıç tarihi (ISO 8601 format) |
| `end_date` | string | ❌ | Bitiş tarihi (ISO 8601 format) |

### Başarılı Response (200 OK)
```json
{
  "success": true,
  "data": {
    "supplier": {
      "id": "68896ed9-e0bd-4ef8-9738-7f2361082365",
      "name": "serhat kenar",
      "company_name": "burgaz iplik",
      "phone": "+90 545 501 56 11",
      "address": "lüleburgaz sokak",
      "balance": "-1839.75",
      "currency": "USD"
    },
    "summary": {
      "period": {
        "start_date": "Başlangıç",
        "end_date": "Bugün"
      },
      "totals": {
        "transaction_count": 5,
        "total_amount": -1839.75,
        "total_amount_formatted": "$1839.75"
      },
      "purchases": {
        "count": 4,
        "amount": 1839.75,
        "amount_formatted": "$1839.75"
      },
      "payments": {
        "count": 1,
        "amount": 0,
        "amount_formatted": "$0.00"
      },
      "cart_purchases": {
        "count": 1,
        "amount": 95.25,
        "amount_formatted": "$95.25"
      }
    },
    "items": [
      {
        // Temel ürün bilgileri
        "product_id": "78c66ab3-887b-4376-841a-e975622aa071",
        "product_name": "ISPARTA VİNTAGE RUST",
        "product_description": "ISPARTA VİNTAGE RUST (ORANGE) HAZIR EBATLARI",
        "collection_name": "Vintage Collection",
        "collection_code": "VNT",
        
        // Miktar ve boyut bilgileri
        "quantity": 4,
        "width": 100,
        "height": 300,
        "width_cm": 100,
        "height_cm": 300,
        "size_info": "100x300cm",
        
        // Alan bilgileri
        "area_m2_per_piece": 3.0,
        "total_area_m2": 12.0,
        "area_m2_per_piece_formatted": "3.00 m²",
        "total_area_m2_formatted": "12.00 m²",
        
        // Fiyat bilgileri
        "unit_price": 4.0,
        "total_price": 48.0,
        "unit_price_formatted": "$4.00",
        "total_price_formatted": "$48.00",
        
        // M² başına fiyat
        "price_per_m2": 1.33,
        "price_per_m2_formatted": "$1.33/m²",
        
        // Adet başına fiyat
        "price_per_piece": 4.0,
        "price_per_piece_formatted": "$4.00/adet",
        
        // Ürün özellikleri
        "has_fringe": false,
        "fringe_status": "Saçaksız",
        "cut_type": "rectangle",
        "cut_type_turkish": "Dikdörtgen",
        "notes": "",
        
        // Para birimi bilgisi
        "currency": "USD",
        
        // Hesaplanan değerler
        "total_items_count": 4,
        "average_price_per_m2": 4.0,
        
        // İşlem bilgileri
        "transaction_id": "520eae0c-1327-4ab7-a0ae-8c93d4e9274a",
        "transaction_date": "2025-09-29T19:36:09.292Z",
        "transaction_reference": "CART-1759174569290",
        "transaction_description": "Alım sepetinden toplu satın alma - 2 ürün"
      }
    ],
    "items_summary": {
      "total_unique_products": 2,
      "total_quantity": 7,
      "total_area_m2": 22.5,
      "total_area_m2_formatted": "22.50 m²",
      "total_value": 95.25,
      "total_value_formatted": "$95.25",
      "average_price_per_m2": "4.23",
      "average_price_per_m2_formatted": "$4.23/m²",
      "average_quantity_per_product": "3.5",
      "currency": "USD",
      "by_collection": {
        "Vintage Collection": {
          "collection_name": "Vintage Collection",
          "collection_code": "VNT",
          "product_count": 1,
          "total_quantity": 4,
          "total_area_m2": 12.0,
          "total_value": 48.0
        },
        "Berlin Collection": {
          "collection_name": "Berlin Collection",
          "collection_code": "BRL",
          "product_count": 1,
          "total_quantity": 3,
          "total_area_m2": 10.5,
          "total_value": 47.25
        }
      }
    },
    "all_transactions": [...],
    "cart_purchases_with_products": [...]
  },
  "message": "Satıcı satın alım özeti ve ürün detayları başarıyla getirildi"
}
```

---

## Response Alanları Açıklaması

### Supplier (Satıcı Bilgileri)
- `id`: Satıcı benzersiz kimliği
- `name`: Satıcı adı
- `company_name`: Firma adı
- `phone`: Telefon numarası
- `address`: Adres
- `balance`: Mevcut bakiye (USD)
- `currency`: Para birimi

### Summary (Özet Bilgileri)
- `period`: Filtrelenen dönem bilgisi
- `totals`: Toplam işlem sayısı ve tutarları
- `purchases`: Sadece alım işlemleri
- `payments`: Sadece ödeme işlemleri
- `cart_purchases`: Sepetten yapılan alımlar

### Items (Ürün Detayları)
Her ürün için aşağıdaki bilgiler döner:

#### Temel Bilgiler
- `product_id`: Ürün ID'si
- `product_name`: Ürün adı
- `product_description`: Ürün açıklaması
- `collection_name`: Koleksiyon adı
- `collection_code`: Koleksiyon kodu

#### Miktar ve Boyut
- `quantity`: Adet
- `width`/`width_cm`: Genişlik (cm)
- `height`/`height_cm`: Yükseklik (cm)
- `size_info`: Boyut bilgisi (formatlanmış)

#### Alan Bilgileri
- `area_m2_per_piece`: Tek parça m²
- `total_area_m2`: Toplam m²
- Formatlanmış versiyonları

#### Fiyat Bilgileri
- `unit_price`: Birim fiyat (USD)
- `total_price`: Toplam fiyat (USD)
- `price_per_m2`: M² başına fiyat
- `price_per_piece`: Adet başına fiyat
- Formatlanmış versiyonları

#### Ürün Özellikleri
- `has_fringe`: Saçak var mı (boolean)
- `fringe_status`: Saçak durumu (Türkçe)
- `cut_type`: Kesim tipi (İngilizce)
- `cut_type_turkish`: Kesim tipi (Türkçe)
- `notes`: Notlar

#### İşlem Bilgileri
- `transaction_id`: İşlem ID'si
- `transaction_date`: İşlem tarihi
- `transaction_reference`: Referans numarası
- `transaction_description`: İşlem açıklaması

### Items Summary (Ürün İstatistikleri)
- `total_unique_products`: Toplam farklı ürün sayısı
- `total_quantity`: Toplam adet
- `total_area_m2`: Toplam m²
- `total_value`: Toplam değer (USD)
- `average_price_per_m2`: Ortalama m² fiyatı
- `average_quantity_per_product`: Ürün başına ortalama adet
- `by_collection`: Koleksiyon bazında gruplandırma

---

## Kullanım Örnekleri

### JavaScript/Node.js
```javascript
const getSupplierPurchaseSummary = async (supplierId, startDate = null, endDate = null) => {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('start_date', startDate);
  if (endDate) queryParams.append('end_date', endDate);
  
  const response = await fetch(
    `https://pashahomeapps.up.railway.app/api/admin/purchase-management/suppliers/${supplierId}/purchase-summary?${queryParams}`,
    {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  console.log('Satıcı:', data.data.supplier.name);
  console.log('Toplam Ürün:', data.data.items_summary.total_unique_products);
  console.log('Toplam Değer:', data.data.items_summary.total_value_formatted);
  
  // Ürün listesi
  data.data.items.forEach(item => {
    console.log(`${item.product_name}: ${item.quantity} adet - ${item.total_price_formatted}`);
  });
  
  return data;
};
```

### PowerShell
```powershell
$token = "YOUR_TOKEN"
$supplierId = "68896ed9-e0bd-4ef8-9738-7f2361082365"

$response = Invoke-RestMethod -Uri "https://pashahomeapps.up.railway.app/api/admin/purchase-management/suppliers/$supplierId/purchase-summary" -Method GET -Headers @{ 
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json" 
}

Write-Host "Satıcı: $($response.data.supplier.name)"
Write-Host "Toplam Ürün: $($response.data.items_summary.total_unique_products)"
Write-Host "Toplam Değer: $($response.data.items_summary.total_value_formatted)"

Write-Host "`nÜrün Listesi:"
$response.data.items | Format-Table product_name, quantity, total_price_formatted, area_m2_per_piece_formatted -AutoSize
```

### cURL
```bash
curl -X GET "https://pashahomeapps.up.railway.app/api/admin/purchase-management/suppliers/68896ed9-e0bd-4ef8-9738-7f2361082365/purchase-summary?start_date=2025-01-01&end_date=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Filtreleme

### Tarih Aralığı Filtreleme
```
GET /suppliers/{supplier_id}/purchase-summary?start_date=2025-01-01&end_date=2025-12-31
```

### Son 30 Gün
```javascript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const startDate = thirtyDaysAgo.toISOString().split('T')[0];

// start_date parametresi ile kullan
```

---

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 200 | Başarılı |
| 401 | Yetkilendirme hatası |
| 404 | Satıcı bulunamadı |
| 500 | Sunucu hatası |

---

## Notlar

1. **Para Birimi:** Tüm fiyatlar USD cinsindendir
2. **Tarih Formatı:** ISO 8601 formatı kullanılır (YYYY-MM-DD)
3. **M² Hesaplaması:** (width × height) / 10000
4. **Pagination:** Bu endpoint pagination desteklemez, tüm sonuçları döner
5. **Performans:** Büyük veri setleri için tarih filtreleme önerilir
