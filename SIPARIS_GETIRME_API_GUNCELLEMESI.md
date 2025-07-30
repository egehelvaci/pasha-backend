# Sipariş Getirme API Güncellemesi

## Genel Bakış

Sipariş getirme API'si (`GET /api/admin/orders`) güncellenmiştir. Artık son 100 siparişi getirirken aynı zamanda istatistik sayılarını da döndürür.

---

## API Endpoint

**Endpoint:** `GET /api/admin/orders`

**Query Parameters:**
- `page` (opsiyonel): Sayfa numarası (varsayılan: 1)
- `limit` (opsiyonel): Sayfa başına sipariş sayısı (varsayılan: 100)
- `status` (opsiyonel): Sipariş durumu filtresi
- `userId` (opsiyonel): Kullanıcı ID filtresi
- `sortBy` (opsiyonel): Sıralama alanı (varsayılan: 'created_at')
- `sortOrder` (opsiyonel): Sıralama yönü (varsayılan: 'desc')

---

## Response Format

### Başarılı Response Örneği:

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "...",
        "status": "DELIVERED",
        "total_price": "1500.00",
        "created_at": "2024-01-15T10:30:00Z",
        "user": {
          "userId": "...",
          "name": "Ahmet",
          "surname": "Yılmaz",
          "email": "ahmet@example.com"
        },
        "items": [
          {
            "id": "...",
            "quantity": 2,
            "price": "750.00",
            "product": {
              "productId": "...",
              "name": "Ürün Adı"
            }
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "totalCount": 250,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "statistics": {
      "totalOrders": 250,
      "cancelledOrders": 15,
      "completedOrders": 180,
      "inDeliveryOrders": 25
    }
  }
}
```

---

## İstatistik Alanları

### `statistics` objesi şu alanları içerir:

1. **`totalOrders`**: Sistemdeki toplam sipariş sayısı
2. **`cancelledOrders`**: İptal edilen sipariş sayısı (status: 'CANCELED')
3. **`completedOrders`**: Tamamlanan sipariş sayısı (status: 'DELIVERED')
4. **`inDeliveryOrders`**: Teslimatta olan sipariş sayısı (status: 'SHIPPED')

---

## Sipariş Durumları

Sistemde kullanılan sipariş durumları:

- **`PENDING`**: Beklemede
- **`CONFIRMED`**: Onaylandı
- **`SHIPPED`**: Teslimatta
- **`DELIVERED`**: Teslim edildi
- **`CANCELED`**: İptal edildi

---

## Kullanım Örnekleri

### 1. Son 100 Siparişi Getir
```bash
GET /api/admin/orders
```

### 2. Belirli Durumdaki Siparişleri Getir
```bash
GET /api/admin/orders?status=DELIVERED
```

### 3. Sayfalama ile Getir
```bash
GET /api/admin/orders?page=2&limit=50
```

### 4. Kullanıcıya Göre Filtrele
```bash
GET /api/admin/orders?userId=user_123
```

---

## Önemli Notlar

- Varsayılan olarak son 100 sipariş getirilir
- İstatistik sayıları her çağrıda hesaplanır
- Filtreleme yapıldığında istatistikler tüm siparişler üzerinden hesaplanır
- Pagination bilgileri filtrelenmiş sonuçlara göre hesaplanır

---

## Performans

- İstatistik hesaplamaları paralel olarak yapılır
- Büyük veri setlerinde performans için index'ler kullanılır
- Filtreleme yapıldığında sadece gerekli sorgular çalıştırılır

---

Herhangi bir sorunda veya ek geliştirme ihtiyacında bu dökümanı referans alabilirsiniz. 