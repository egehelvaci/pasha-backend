# Admin Sipariş Oluşturma API Dokümantasyonu

## Genel Bakış

Bu API, admin kullanıcıların herhangi bir mağaza için sipariş oluşturmasını sağlar. Sistem mevcut sipariş sistemini bozmadan çalışır ve özel admin mantığı kullanır.

## Özellikler

- ✅ Admin istediği mağaza için sipariş oluşturabilir
- ✅ Kullanıcının adres bilgisi sipariş adres bilgisi olarak kullanılır
- ✅ Tüm ürünler mağazaya atanmış fiyat listesinden alınır
- ✅ Açık hesap limiti kontrolü yapılmaz
- ✅ Sipariş tutarı doğrudan mağaza bakiyesinden düşer
- ✅ Fiyat listesi limiti güncellenir (varsa)

## API Endpoints

### 1. Sipariş Oluşturma Bilgilerini Getir

**Endpoint:** `POST /api/admin/orders/create-for-store`

**Açıklama:** Belirtilen mağaza ve kullanıcı için sipariş oluşturma ekranında gösterilecek tüm bilgileri (ürünler, fiyatlar, stok bilgileri) döner.

**Headers:**
```
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "store_id": "bd0810ce-79db-421e-a21d-77a0b539bd5c",
  "user_id": "ca4a88a7-c029-4054-8b4d-aa9eea38e4d5"
}
```

**Response (Başarılı):**
```json
{
  "success": true,
  "message": "Admin sipariş oluşturma bilgileri hazırlandı",
  "data": {
    "user": {
      "userId": "ca4a88a7-c029-4054-8b4d-aa9eea38e4d5",
      "name": "Ege",
      "surname": "HELVACI",
      "email": "ege@example.com",
      "phoneNumber": "+905551234567",
      "adres": "Yenimahalle mh, Şehit Güntay Polat Sk No:7 Daire:59",
      "userType": "viewer"
    },
    "store": {
      "store_id": "bd0810ce-79db-421e-a21d-77a0b539bd5c",
      "kurum_adi": "ege-magaza",
      "vergi_numarasi": "1234567890",
      "vergi_dairesi": "Merkez",
      "telefon": "+905551234567",
      "eposta": "magaza@example.com",
      "bakiye": 0,
      "acik_hesap_tutari": 5000,
      "limitsiz_acik_hesap": false
    },
    "priceList": {
      "price_list_id": "price-list-uuid",
      "name": "Varsayılan Fiyat Listesi",
      "description": "Standart fiyat listesi",
      "currency": "TRY",
      "limit_amount": 10000
    },
    "products": [
      {
        "productId": "5555a45e-cea9-48b2-9d53-b6afed833687",
        "name": "ST03 VİZON",
        "description": "Saten serisi vizon renk halı",
        "productImage": "https://s3.tebi.io/pashahome/products/xxx.jpg",
        "collectionId": "collection-uuid",
        "collectionName": "SATEN SERİSİ",
        "pricing": {
          "price": 504,
          "currency": "TRY",
          "priceListName": "Varsayılan Fiyat Listesi"
        },
        "canHaveFringe": true,
        "sizeOptions": [
          {
            "id": 1,
            "width": 80,
            "height": 10000,
            "is_optional_height": true,
            "stockQuantity": 0,
            "stockAreaM2": 50.5
          }
        ],
        "cutTypes": [
          {
            "id": 1,
            "name": "standart"
          },
          {
            "id": 2,
            "name": "oval"
          }
        ]
      }
    ],
    "totalProducts": 32,
    "availableCollections": ["SATEN SERİSİ", "VİTRİN SERİSİ", "MODERN SERİ"]
  }
}
```

### 2. Admin Sipariş Oluştur

**Endpoint:** `POST /api/admin/orders/process-admin-order`

**Açıklama:** Admin için özel sipariş oluşturur. Açık hesap limiti kontrolü yapmaz, doğrudan mağaza bakiyesinden düşer.

**Headers:**
```
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "store_id": "bd0810ce-79db-421e-a21d-77a0b539bd5c",
  "user_id": "ca4a88a7-c029-4054-8b4d-aa9eea38e4d5",
  "items": [
    {
      "product_id": "5555a45e-cea9-48b2-9d53-b6afed833687",
      "quantity": 2,
      "width": 100,
      "height": 150,
      "has_fringe": false,
      "cut_type": "standart",
      "notes": "Test siparişi"
    }
  ],
  "notes": "Admin test siparişi"
}
```

**Response (Başarılı):**
```json
{
  "success": true,
  "message": "Admin siparişi başarıyla oluşturuldu",
  "data": {
    "order": {
      "id": "46c04b24-96c1-4cbc-a7a9-801396ceb33b",
      "user_id": "ca4a88a7-c029-4054-8b4d-aa9eea38e4d5",
      "cart_id": 123,
      "total_price": "1512.0",
      "status": "PENDING",
      "delivery_address": "Yenimahalle mh, Şehit Güntay Polat Sk No:7 Daire:59",
      "store_name": "ege-magaza",
      "store_tax_number": "1234567890",
      "store_tax_office": "Merkez",
      "store_phone": "+905551234567",
      "store_email": "magaza@example.com",
      "created_at": "2024-01-15T10:30:00Z",
      "items": [
        {
          "id": "item-uuid",
          "product_id": "5555a45e-cea9-48b2-9d53-b6afed833687",
          "quantity": 2,
          "width": "100",
          "height": "150",
          "unit_price": "504.0",
          "total_price": "1512.0",
          "has_fringe": false,
          "cut_type": "standart"
        }
      ]
    }
  }
}
```

## Hata Kodları

### 400 Bad Request
```json
{
  "success": false,
  "message": "store_id ve user_id alanları zorunludur"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Kullanıcı bulunamadı"
}
```

### 400 Bad Request - Mağaza Eşleşmemesi
```json
{
  "success": false,
  "message": "Kullanıcı belirtilen mağazaya ait değil"
}
```

### 400 Bad Request - Adres Eksik
```json
{
  "success": false,
  "message": "Kullanıcının adres bilgisi bulunamadı"
}
```

### 400 Bad Request - Fiyat Listesi Eksik
```json
{
  "success": false,
  "message": "Mağazaya atanmış fiyat listesi bulunamadı"
}
```

## Admin Sipariş Mantığı

### Normal Sipariş vs Admin Sipariş

| Özellik | Normal Sipariş | Admin Sipariş |
|---------|---------------|---------------|
| **Açık Hesap Kontrolü** | ✅ Yapılır | ❌ Yapılmaz |
| **Bakiye Kontrolü** | ✅ Bakiye + Açık Hesap | ❌ Kontrolsüz |
| **Bakiye Düşümü** | ✅ Limit dahilinde | ✅ Doğrudan düşer |
| **Fiyat Listesi Limiti** | ✅ Kontrol edilir | ✅ Güncellenir |
| **Sepet Sistemi** | ✅ Kullanıcı sepeti | ✅ Geçici sepet |

### İşlem Akışı

1. **Validation:**
   - Kullanıcı ve mağaza kontrolü
   - Kullanıcının o mağazaya ait olması
   - Adres bilgisi kontrolü
   - Fiyat listesi kontrolü

2. **Sipariş Oluşturma:**
   - Geçici sepet oluşturulur
   - Ürün fiyatları mağaza fiyat listesinden alınır
   - Sipariş oluşturulur (PENDING durumunda)

3. **Bakiye İşlemleri:**
   - Açık hesap limiti kontrolü yapılmaz
   - Sipariş tutarı doğrudan mağaza bakiyesinden düşer
   - Fiyat listesi limiti güncellenir (varsa)

4. **Fiyat Listesi Limiti:**
   - Eğer limit biterse varsayılan fiyat listesine geçilir
   - Limit güncellemesi normal sipariş mantığı ile aynı

## Test Verileri

Sistem test etmek için aşağıdaki verileri kullanabilirsiniz:

```json
{
  "store_id": "bd0810ce-79db-421e-a21d-77a0b539bd5c",
  "user_id": "ca4a88a7-c029-4054-8b4d-aa9eea38e4d5",
  "items": [
    {
      "product_id": "5555a45e-cea9-48b2-9d53-b6afed833687",
      "quantity": 2,
      "width": 100,
      "height": 150,
      "has_fringe": false,
      "cut_type": "standart",
      "notes": "Test siparişi"
    }
  ],
  "notes": "Admin test siparişi"
}
```

## Güvenlik

- Bu endpoint'ler sadece **admin** yetkisine sahip kullanıcılar tarafından kullanılabilir
- JWT token ile kimlik doğrulama gereklidir
- Tüm işlemler admin log'larında kayıt altına alınır

## Önemli Notlar

⚠️ **DİKKAT:** Admin siparişlerde açık hesap limiti kontrolü yapılmaz. Bu özellik sadece özel durumlar için kullanılmalıdır.

✅ **AVANTAJLAR:**
- Mağaza bakiyesi negatif olsa bile sipariş verilebilir
- Hızlı sipariş oluşturma
- Mevcut sipariş sistemini bozmaz

❌ **RİSKLER:**
- Mağaza bakiyesi kontrolsüz düşebilir
- Yanlış kullanımda mali sorunlara yol açabilir 