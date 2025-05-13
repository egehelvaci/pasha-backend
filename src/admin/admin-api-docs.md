# Admin API Dokümantasyonu

Bu dokümantasyon, admin kullanıcılarının kullanıcı yönetimi işlemleri için kullanabileceği API uç noktalarını tanımlar.

## Genel Bilgiler

- Tüm API uç noktaları `/api/admin` yolu ile başlar
- Tüm istekler JWT token ile yetkilendirilmelidir ve token, istek başlığında `Authorization: Bearer <token>` formatında gönderilmelidir
- Sadece "admin" tipindeki kullanıcılar bu API'lere erişebilir

## Kullanıcı Yönetimi API'leri

### 1. Tüm Kullanıcıları Listeleme

**Endpoint:** `GET /api/admin/users`

**Açıklama:** Sisteme kayıtlı tüm kullanıcıları (aktif ve pasif) listeler.

**Query Parametreleri:**
- `userType` (opsiyonel): Belirli bir kullanıcı tipine göre filtreleme yapar (örn: "admin", "editor", "viewer")

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "userId": "1234abcd",
      "username": "admin",
      "name": "Admin",
      "surname": "Kullanıcı",
      "email": "admin@example.com",
      "isActive": true,
      "credit": 0,
      "debit": 0,
      "userType": {
        "id": 1,
        "name": "admin"
      }
    },
    // Diğer kullanıcılar...
  ]
}
```

### 2. Belirli Bir Kullanıcıyı Görüntüleme

**Endpoint:** `GET /api/admin/users/:userId`

**Açıklama:** Belirli bir kullanıcının detaylarını görüntüler.

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "userId": "1234abcd",
    "username": "someuser",
    "name": "Example",
    "surname": "User",
    "email": "user@example.com",
    "isActive": true,
    "credit": 100,
    "debit": 50,
    "userType": {
      "id": 2,
      "name": "editor"
    }
  }
}
```

**Hata Yanıtı (404):**
```json
{
  "success": false,
  "message": "Kullanıcı bulunamadı"
}
```

### 3. Yeni Kullanıcı Oluşturma

**Endpoint:** `POST /api/admin/users`

**Açıklama:** Sisteme yeni bir kullanıcı ekler.

**İstek Gövdesi:**
```json
{
  "username": "newuser",
  "password": "securepassword",
  "name": "Yeni",
  "surname": "Kullanıcı",
  "email": "newuser@example.com",
  "userTypeName": "editor",
  "credit": 100,
  "debit": 50,
  "phoneNumber": "+90 555 123 4567"
}
```

**Zorunlu Alanlar:**
- `username`: Kullanıcı adı (benzersiz olmalı)
- `password`: Şifre
- `name`: Ad
- `surname`: Soyad
- `email`: E-posta adresi (benzersiz olmalı)
- `userTypeName`: Kullanıcı tipi adı ("admin", "editor", "viewer" vb.)

**Opsiyonel Alanlar:**
- `credit`: Kullanıcı kredisi (varsayılan: 0)
- `debit`: Kullanıcı borcu (varsayılan: 0)
- `phoneNumber`: Telefon numarası

**Başarılı Yanıt (201):**
```json
{
  "success": true,
  "data": {
    "userId": "5678efgh",
    "username": "newuser",
    "name": "Yeni",
    "surname": "Kullanıcı",
    "email": "newuser@example.com",
    "isActive": true,
    "credit": 100,
    "debit": 50,
    "userType": {
      "id": 2,
      "name": "editor"
    }
  }
}
```

**Hata Yanıtı (400):**
```json
{
  "success": false,
  "message": "Bu kullanıcı adı zaten kullanılıyor"
}
```

### 4. Kullanıcı Bilgilerini Güncelleme

**Endpoint:** `PUT /api/admin/users/:userId`

**Açıklama:** Belirli bir kullanıcının bilgilerini günceller.

**İstek Gövdesi:**
```json
{
  "name": "Güncellenmiş",
  "surname": "Ad",
  "email": "updated@example.com",
  "userTypeName": "viewer",
  "isActive": true,
  "password": "yenisifre",
  "credit": 200,
  "debit": 75,
  "phoneNumber": "+90 555 987 6543"
}
```

**Not:** Tüm alanlar opsiyoneldir, sadece değiştirilmek istenen alanlar gönderilmelidir.

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "userId": "1234abcd",
    "username": "someuser",
    "name": "Güncellenmiş",
    "surname": "Ad",
    "email": "updated@example.com",
    "isActive": true,
    "credit": 200,
    "debit": 75,
    "userType": {
      "id": 3,
      "name": "viewer"
    }
  }
}
```

**Hata Yanıtı (404):**
```json
{
  "success": false,
  "message": "Güncellenecek kullanıcı bulunamadı"
}
```

### 5. Kullanıcıyı Silme/Deaktif Etme

**Endpoint:** `DELETE /api/admin/users/:userId`

**Açıklama:** Belirli bir kullanıcıyı kalıcı olarak siler veya deaktif eder.

**İstek Gövdesi (opsiyonel):**
```json
{
  "permanently": true
}
```

**Parametreler:**
- `permanently`: `true` ise kullanıcı tamamen silinir, `false` veya belirtilmezse sadece deaktif edilir.

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "message": "Kullanıcı kalıcı olarak silindi"
}
```

veya 

```json
{
  "success": true,
  "message": "Kullanıcı deaktif edildi"
}
```

**Hata Yanıtı (404):**
```json
{
  "success": false,
  "message": "Silinecek kullanıcı bulunamadı"
}
```

**Hata Yanıtı (403):**
```json
{
  "success": false,
  "message": "Kendi hesabınızı silemezsiniz"
}
```

## Mağaza Yönetimi API'leri

### 1. Tüm Mağazaları Listeleme

**Endpoint:** `GET /api/admin/stores`

**Açıklama:** Sisteme kayıtlı tüm mağazaları listeler.

**Query Parametreleri:**
- `isActive` (opsiyonel): Aktif veya pasif mağazaları filtrelemek için (true/false)

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "store_id": "1234abcd",
      "kurum_adi": "ABC Mağaza",
      "vergi_numarasi": "1234567890",
      "vergi_dairesi": "Merkez",
      "yetkili_adi": "Ahmet",
      "yetkili_soyadi": "Yılmaz",
      "telefon": "05551234567",
      "eposta": "info@abcmagaza.com",
      "adres": "İstanbul",
      "faks_numarasi": "02121234567",
      "aciklama": "Merkez şube",
      "limitsiz_acik_hesap": false,
      "acik_hesap_tutari": 5000.00,
      "is_active": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "StorePriceList": [
        {
          "store_price_list_id": "abc123",
          "store_id": "1234abcd",
          "price_list_id": "pl123",
          "PriceList": {
            "price_list_id": "pl123",
            "name": "Standart Fiyat Listesi",
            // ... diğer fiyat listesi bilgileri
          }
        }
      ]
    },
    // Diğer mağazalar...
  ]
}
```

### 2. Belirli Bir Mağazayı Görüntüleme

**Endpoint:** `GET /api/admin/stores/:storeId`

**Açıklama:** Belirli bir mağazanın detaylarını görüntüler.

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "store_id": "1234abcd",
    "kurum_adi": "ABC Mağaza",
    "vergi_numarasi": "1234567890",
    "vergi_dairesi": "Merkez",
    "yetkili_adi": "Ahmet",
    "yetkili_soyadi": "Yılmaz",
    "telefon": "05551234567",
    "eposta": "info@abcmagaza.com",
    "adres": "İstanbul",
    "faks_numarasi": "02121234567",
    "aciklama": "Merkez şube",
    "limitsiz_acik_hesap": false,
    "acik_hesap_tutari": 5000.00,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "StorePriceList": [
      // Mağazaya atanmış fiyat listeleri
    ],
    "User": [
      // Mağazaya atanmış kullanıcılar
    ]
  }
}
```

**Hata Yanıtı (404):**
```json
{
  "success": false,
  "message": "Mağaza bulunamadı"
}
```

### 3. Yeni Mağaza Oluşturma

**Endpoint:** `POST /api/admin/stores`

**Açıklama:** Yeni bir mağaza kaydı oluşturur.

**İstek Gövdesi:**
```json
{
  "kurum_adi": "XYZ Mağaza",
  "vergi_numarasi": "9876543210",
  "vergi_dairesi": "Şişli",
  "yetkili_adi": "Mehmet",
  "yetkili_soyadi": "Demir",
  "telefon": "05559876543",
  "eposta": "info@xyzmagaza.com",
  "adres": "Ankara",
  "faks_numarasi": "03129876543",
  "aciklama": "Şube mağaza",
  "limitsiz_acik_hesap": true,
  "acik_hesap_tutari": 10000.00
}
```

**Başarılı Yanıt (201):**
```json
{
  "success": true,
  "data": {
    "store_id": "5678efgh",
    "kurum_adi": "XYZ Mağaza",
    "vergi_numarasi": "9876543210",
    "vergi_dairesi": "Şişli",
    "yetkili_adi": "Mehmet",
    "yetkili_soyadi": "Demir",
    "telefon": "05559876543",
    "eposta": "info@xyzmagaza.com",
    "adres": "Ankara",
    "faks_numarasi": "03129876543",
    "aciklama": "Şube mağaza",
    "limitsiz_acik_hesap": true,
    "acik_hesap_tutari": 10000.00,
    "is_active": true,
    "created_at": "2023-01-02T00:00:00.000Z",
    "updated_at": "2023-01-02T00:00:00.000Z"
  }
}
```

**Hata Yanıtı (400):**
```json
{
  "success": false,
  "message": "Kurum adı zorunludur"
}
```

### 4. Mağaza Bilgilerini Güncelleme

**Endpoint:** `PUT /api/admin/stores/:storeId`

**Açıklama:** Mevcut bir mağazanın bilgilerini günceller.

**İstek Gövdesi:**
```json
{
  "kurum_adi": "XYZ Mağaza (Yeni)",
  "telefon": "05551112233",
  "adres": "İzmir",
  "is_active": false
}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "store_id": "5678efgh",
    "kurum_adi": "XYZ Mağaza (Yeni)",
    "vergi_numarasi": "9876543210",
    "vergi_dairesi": "Şişli",
    "yetkili_adi": "Mehmet",
    "yetkili_soyadi": "Demir",
    "telefon": "05551112233",
    "eposta": "info@xyzmagaza.com",
    "adres": "İzmir",
    "faks_numarasi": "03129876543",
    "aciklama": "Şube mağaza",
    "limitsiz_acik_hesap": true,
    "acik_hesap_tutari": 10000.00,
    "is_active": false,
    "created_at": "2023-01-02T00:00:00.000Z",
    "updated_at": "2023-01-03T00:00:00.000Z"
  }
}
```

**Hata Yanıtı (404):**
```json
{
  "success": false,
  "message": "Güncellenecek mağaza bulunamadı"
}
```

### 5. Mağaza Silme/Deaktif Etme

**Endpoint:** `DELETE /api/admin/stores/:storeId`

**Açıklama:** Bir mağazayı siler veya deaktif eder.

**İstek Gövdesi:**
```json
{
  "permanently": false
}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "message": "Mağaza deaktif edildi"
}
```

veya (permanently=true ise):

```json
{
  "success": true,
  "message": "Mağaza kalıcı olarak silindi"
}
```

**Hata Yanıtı (404):**
```json
{
  "success": false,
  "message": "Silinecek mağaza bulunamadı"
}
```

### 6. Mağazanın Fiyat Listelerini Görüntüleme

**Endpoint:** `GET /api/admin/stores/:storeId/price-lists`

**Açıklama:** Belirli bir mağazaya atanmış fiyat listelerini görüntüler.

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "store_price_list_id": "abc123",
      "store_id": "1234abcd",
      "price_list_id": "pl123",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "PriceList": {
        "price_list_id": "pl123",
        "name": "Standart Fiyat Listesi",
        "description": "Genel müşteriler için standart fiyat listesi",
        "is_default": true,
        "currency": "TRY",
        "is_active": true
        // ... diğer fiyat listesi bilgileri
      }
    },
    // Diğer fiyat listeleri...
  ]
}
```

**Hata Yanıtı (404):**
```json
{
  "success": false,
  "message": "Mağaza bulunamadı"
}
```

### 7. Mağazaya Fiyat Listesi Atama

**Endpoint:** `POST /api/admin/stores/:storeId/price-lists`

**Açıklama:** Belirli bir mağazaya fiyat listesi atar.

**İstek Gövdesi:**
```json
{
  "priceListId": "pl456"
}
```

**Başarılı Yanıt (201):**
```json
{
  "success": true,
  "data": {
    "store_price_list_id": "def456",
    "store_id": "1234abcd",
    "price_list_id": "pl456",
    "created_at": "2023-01-04T00:00:00.000Z",
    "updated_at": "2023-01-04T00:00:00.000Z",
    "PriceList": {
      "price_list_id": "pl456",
      "name": "Premium Fiyat Listesi",
      // ... diğer fiyat listesi bilgileri
    },
    "Store": {
      "store_id": "1234abcd",
      "kurum_adi": "ABC Mağaza",
      // ... diğer mağaza bilgileri
    }
  }
}
```

**Hata Yanıtı (400):**
```json
{
  "success": false,
  "message": "Bu fiyat listesi zaten bu mağazaya atanmış"
}
```

### 8. Mağazadan Fiyat Listesi Kaldırma

**Endpoint:** `DELETE /api/admin/stores/:storeId/price-lists/:priceListId`

**Açıklama:** Belirli bir mağazadan fiyat listesi ilişkisini kaldırır.

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "message": "Fiyat listesi mağazadan kaldırıldı"
}
```

**Hata Yanıtı (404):**
```json
{
  "success": false,
  "message": "Bu mağaza-fiyat listesi ilişkisi bulunamadı"
}
```

## Kullanım Örneği

```javascript
// Örnek: Tüm admin kullanıcılarını listele
fetch('/api/admin/users?userType=admin', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer JWT_TOKEN_HERE',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Hata:', error));

// Örnek: Yeni kullanıcı oluştur
fetch('/api/admin/users', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer JWT_TOKEN_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'neweditor',
    password: 'guvenli123',
    name: 'Yeni',
    surname: 'Editör',
    email: 'editor@example.com',
    userTypeName: 'editor',
    credit: 150,
    debit: 50,
    phoneNumber: '+90 555 123 4567'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Hata:', error));

// Örnek: Kullanıcı bilgilerini güncelle
fetch('/api/admin/users/user123', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer JWT_TOKEN_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    credit: 300,
    debit: 100
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Hata:', error));
``` 