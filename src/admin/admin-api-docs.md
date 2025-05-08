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
  "phoneNumber": "+90 555 123 4567",
  "avatar": "https://example.com/avatars/default.png"
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
- `avatar`: Profil resmi URL'i

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
  "phoneNumber": "+90 555 987 6543",
  "avatar": "https://example.com/avatars/user123.png"
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
    phoneNumber: '+90 555 123 4567',
    avatar: 'https://example.com/avatars/editor.png'
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