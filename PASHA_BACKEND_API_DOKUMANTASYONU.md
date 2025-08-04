# 🏠 Pasha Backend API Dokümantasyonu

## 📋 Genel Bakış

Pasha Backend, halı satışı ve yönetimi için geliştirilmiş kapsamlı bir REST API sistemidir. Sistem kullanıcı yönetimi, ürün kataloğu, sepet işlemleri, sipariş yönetimi, ödeme entegrasyonu, admin paneli ve çalışan takibi gibi modülleri içerir.

## 🌐 Environment Variables

Sistem aşağıdaki environment variable'ları kullanır:

```bash
# Database
DATABASE_URL=postgresql://...

# Security
JWT_SECRET=your-secret-key
DBYE_WEBHOOK_SECRET=your-webhook-secret

# Storage
TEBI_ACCESS_KEY=your-access-key
TEBI_SECRET_KEY=your-secret-key

# URLs
PUBLIC_URL=https://pasha-backend-production.up.railway.app
PRODUCTION_FRONTEND_URL=https://pasha-frontend.vercel.app

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@pasha.com

# Development URLs
# PUBLIC_URL=http://localhost:3001
# PRODUCTION_FRONTEND_URL=http://localhost:3000
```

## 🔐 Kimlik Doğrulama

Tüm API endpoint'leri **JWT token** ile kimlik doğrulaması gerektirir (login ve register hariç).

```bash
Authorization: Bearer <JWT_TOKEN>
```

## 📊 API Kategorileri

### 1. 🔐 Kimlik Doğrulama API'leri
### 2. 🛒 Sepet API'leri  
### 3. 📦 Sipariş API'leri
### 4. 👨‍💼 Admin API'leri
### 5. 💰 Ödeme API'leri
### 6. 👷 Çalışan API'leri
### 7. 🏪 Mağaza API'leri
### 8. 📊 İstatistik API'leri
### 9. 🛍️ Ürün API'leri
### 10. 📋 Koleksiyon API'leri
### 11. 💵 Fiyat Listesi API'leri
### 12. 📧 E-posta API'leri
### 13. 🖼️ Login Assets API'leri

---

## 1. 🔐 Kimlik Doğrulama API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Giriş Yapma
**Endpoint:** `POST {PUBLIC_URL}/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "store_id": 1
    }
  }
}
```

### Kayıt Olma
**Endpoint:** `POST {PUBLIC_URL}/api/auth/register`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+905551234567"
}
```

### Şifre Sıfırlama
**Endpoint:** `POST {PUBLIC_URL}/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Şifre Sıfırlama (Token ile)
**Endpoint:** `POST {PUBLIC_URL}/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-here",
  "password": "newpassword123"
}
```

---

## 2. 🛒 Sepet API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Sepete Ürün Ekleme
**Endpoint:** `POST {PUBLIC_URL}/api/cart/add`

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2,
  "size": "2x3",
  "color": "Kırmızı",
  "cutType": "STANDARD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cartItem": {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "size": "2x3",
      "color": "Kırmızı",
      "cutType": "STANDARD",
      "price": 150.75,
      "totalPrice": 301.50
    },
    "cartTotal": 301.50,
    "itemCount": 1
  }
}
```

### Sepeti Görüntüleme
**Endpoint:** `GET {PUBLIC_URL}/api/cart`

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Lüks Halı",
          "image": "https://example.com/hali.jpg"
        },
        "quantity": 2,
        "size": "2x3",
        "color": "Kırmızı",
        "cutType": "STANDARD",
        "price": 150.75,
        "totalPrice": 301.50
      }
    ],
    "total": 301.50,
    "itemCount": 1
  }
}
```

### Sepetten Ürün Çıkarma
**Endpoint:** `DELETE {PUBLIC_URL}/api/cart/item/:itemId`

### Sepeti Temizleme
**Endpoint:** `DELETE {PUBLIC_URL}/api/cart/clear`

---

## 3. 📦 Sipariş API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Sipariş Oluşturma
**Endpoint:** `POST {PUBLIC_URL}/api/orders/create-from-cart`

**Request Body:**
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+905551234567",
    "address": "Atatürk Cad. No:123",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700"
  },
  "notes": "Özel kesim istiyorum"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "orderNumber": "ORD-2025-001",
      "status": "PENDING",
      "totalAmount": 301.50,
      "items": [...],
      "shippingAddress": {...},
      "createdAt": "2025-01-20T10:30:00Z"
    }
  }
}
```

### Sipariş Durumu Kontrolü
**Endpoint:** `GET {PUBLIC_URL}/api/orders/:orderId`

### Sipariş Geçmişi
**Endpoint:** `GET {PUBLIC_URL}/api/orders`

---

## 4. 👨‍💼 Admin API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Admin Sepet Sistemi

#### Admin Sepete Ürün Ekleme
**Endpoint:** `POST {PUBLIC_URL}/api/admin/cart/add-to-admin-cart`

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2,
  "size": "2x3",
  "color": "Kırmızı",
  "cutType": "STANDARD",
  "customerId": 1
}
```

#### Admin Sepetini Görüntüleme
**Endpoint:** `GET {PUBLIC_URL}/api/admin/cart`

#### Admin Sepetinden Ürün Çıkarma
**Endpoint:** `DELETE {PUBLIC_URL}/api/admin/cart/item/:itemId`

#### Admin Sepetini Temizleme
**Endpoint:** `DELETE {PUBLIC_URL}/api/admin/cart/clear`

### Admin Sipariş Yönetimi

#### Admin Sipariş Oluşturma
**Endpoint:** `POST {PUBLIC_URL}/api/admin/orders/create`

#### Siparişleri Listeleme
**Endpoint:** `GET {PUBLIC_URL}/api/admin/orders`

#### Sipariş Detayı
**Endpoint:** `GET {PUBLIC_URL}/api/admin/orders/:orderId`

#### Sipariş Durumu Güncelleme
**Endpoint:** `PUT {PUBLIC_URL}/api/admin/orders/:orderId/status`

**Request Body:**
```json
{
  "status": "PROCESSING",
  "notes": "Üretime alındı"
}
```

### Admin Ödeme Yönetimi

#### Ödeme Listesi
**Endpoint:** `GET {PUBLIC_URL}/api/admin/payments`

#### Ödeme Detayı
**Endpoint:** `GET {PUBLIC_URL}/api/admin/payments/:paymentId`

#### Ödeme Durumu Güncelleme
**Endpoint:** `PUT {PUBLIC_URL}/api/admin/payments/:paymentId/status`

### Admin İstatistikleri

#### Genel İstatistikler
**Endpoint:** `GET {PUBLIC_URL}/api/admin/statistics/general`

#### Satış İstatistikleri
**Endpoint:** `GET {PUBLIC_URL}/api/admin/statistics/sales`

#### Ürün İstatistikleri
**Endpoint:** `GET {PUBLIC_URL}/api/admin/statistics/products`

### Mağaza Yönetimi

#### Mağaza Listesi
**Endpoint:** `GET {PUBLIC_URL}/api/admin/stores`

#### Mağaza Ekleme
**Endpoint:** `POST {PUBLIC_URL}/api/admin/stores`

#### Mağaza Güncelleme
**Endpoint:** `PUT {PUBLIC_URL}/api/admin/stores/:storeId`

#### Mağaza Silme
**Endpoint:** `DELETE {PUBLIC_URL}/api/admin/stores/:storeId`

### Muhasebe API'leri

#### Gelir Raporu
**Endpoint:** `GET {PUBLIC_URL}/api/admin/muhasebe/gelir`

#### Gider Raporu
**Endpoint:** `GET {PUBLIC_URL}/api/admin/muhasebe/gider`

#### Kâr/Zarar Raporu
**Endpoint:** `GET {PUBLIC_URL}/api/admin/muhasebe/kar-zarar`

### Excel Export

#### Sipariş Export
**Endpoint:** `GET {PUBLIC_URL}/api/admin/export/orders`

#### Ödeme Export
**Endpoint:** `GET {PUBLIC_URL}/api/admin/export/payments`

#### Ürün Export
**Endpoint:** `GET {PUBLIC_URL}/api/admin/export/products`

### Ürün Kuralları

#### Kural Listesi
**Endpoint:** `GET {PUBLIC_URL}/api/admin/product-rules`

#### Kural Ekleme
**Endpoint:** `POST {PUBLIC_URL}/api/admin/product-rules`

#### Kural Güncelleme
**Endpoint:** `PUT {PUBLIC_URL}/api/admin/product-rules/:ruleId`

#### Kural Silme
**Endpoint:** `DELETE {PUBLIC_URL}/api/admin/product-rules/:ruleId`

### Kesim Tipleri

#### Kesim Tipi Listesi
**Endpoint:** `GET {PUBLIC_URL}/api/admin/cut-types`

#### Kesim Tipi Ekleme
**Endpoint:** `POST {PUBLIC_URL}/api/admin/cut-types`

#### Kesim Tipi Güncelleme
**Endpoint:** `PUT {PUBLIC_URL}/api/admin/cut-types/:cutTypeId`

#### Kesim Tipi Silme
**Endpoint:** `DELETE {PUBLIC_URL}/api/admin/cut-types/:cutTypeId`

---

## 5. 💰 Ödeme API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Ödeme Başlatma
**Endpoint:** `POST {PUBLIC_URL}/api/payments/create`

**Request Body:**
```json
{
  "orderId": 1,
  "amount": 301.50,
  "currency": "TRY",
  "paymentMethod": "CREDIT_CARD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://qashell.octet.com.tr/ortak-odeme/...",
    "sellerReference": "PASHA-1703123456789-abc123",
    "apiReferenceNumber": "PASHA-ODEME-1703123456789-def456",
    "amount": 150.75
  }
}
```

**Not:** `paymentUrl` değeri DBYE sisteminden döner ve environment variable'dan okunmaz.

### Ödeme Durumu Kontrolü
**Endpoint:** `GET {PUBLIC_URL}/api/payments/status/:sellerReference`

### Ödeme Geçmişi
**Endpoint:** `GET {PUBLIC_URL}/api/payments/history`

### Webhook (DBYE)
**Endpoint:** `POST {PUBLIC_URL}/api/payments/webhook/dbye`

**Request Body (DBYE'den gelen):**
```json
{
  "NotificationId": "12345",
  "TransactionType": 1,
  "TransactionState": 3,
  "PaymentAmount": 150.75,
  "OrderNumber": "PASHA-1703123456789-abc123",
  "PaymentDate": "2025-01-20T10:30:00Z",
  "Hash": "abc123...",
  "HashParameters": "OrderNumber|PaymentAmount|TransactionState"
}
```

### Legacy Webhook'lar (Test için)
**Endpoint:** `GET {PUBLIC_URL}/api/payments/webhook/success?token=webhook-token`

**Endpoint:** `GET {PUBLIC_URL}/api/payments/webhook/failure?token=webhook-token`

---

## 6. 👷 Çalışan API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Çalışan Atama

#### Siparişe Çalışan Atama
**Endpoint:** `POST {PUBLIC_URL}/api/employee-assignment/assign`

**Request Body:**
```json
{
  "orderId": 1,
  "employeeId": 2,
  "assignmentType": "PRODUCTION",
  "notes": "Özel kesim gerekiyor"
}
```

#### Atama Listesi
**Endpoint:** `GET {PUBLIC_URL}/api/employee-assignment`

#### Atama Güncelleme
**Endpoint:** `PUT {PUBLIC_URL}/api/employee-assignment/:assignmentId`

#### Atama Silme
**Endpoint:** `DELETE {PUBLIC_URL}/api/employee-assignment/:assignmentId`

### Çalışan İstatistikleri

#### Çalışan Performansı
**Endpoint:** `GET {PUBLIC_URL}/api/employee-stats/performance`

#### Çalışan İş Yükü
**Endpoint:** `GET {PUBLIC_URL}/api/employee-stats/workload`

#### Çalışan Detay İstatistikleri
**Endpoint:** `GET {PUBLIC_URL}/api/employee-stats/:employeeId`

---

## 7. 🏪 Mağaza API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Mağaza İstatistikleri

#### Genel Mağaza İstatistikleri
**Endpoint:** `GET {PUBLIC_URL}/api/store-statistics/general`

#### Satış İstatistikleri
**Endpoint:** `GET {PUBLIC_URL}/api/store-statistics/sales`

#### Ürün İstatistikleri
**Endpoint:** `GET {PUBLIC_URL}/api/store-statistics/products`

#### Müşteri İstatistikleri
**Endpoint:** `GET {PUBLIC_URL}/api/store-statistics/customers`

---

## 8. 📊 İstatistik API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Genel İstatistikler
**Endpoint:** `GET {PUBLIC_URL}/api/statistics/general`

### Satış İstatistikleri
**Endpoint:** `GET {PUBLIC_URL}/api/statistics/sales`

### Ürün İstatistikleri
**Endpoint:** `GET {PUBLIC_URL}/api/statistics/products`

### Müşteri İstatistikleri
**Endpoint:** `GET {PUBLIC_URL}/api/statistics/customers`

---

## 9. 🛍️ Ürün API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Ürün Listesi
**Endpoint:** `GET {PUBLIC_URL}/api/products`

**Query Parameters:**
- `category` - Kategori filtresi
- `search` - Arama terimi
- `minPrice` - Minimum fiyat
- `maxPrice` - Maksimum fiyat
- `page` - Sayfa numarası
- `limit` - Sayfa başına ürün sayısı

### Ürün Detayı
**Endpoint:** `GET {PUBLIC_URL}/api/products/:productId`

### Ürün Varyasyonları
**Endpoint:** `GET {PUBLIC_URL}/api/products/:productId/variations`

### Ürün Resimleri
**Endpoint:** `GET {PUBLIC_URL}/api/products/:productId/images`

### Ürün Arama
**Endpoint:** `GET {PUBLIC_URL}/api/products/search`

**Query Parameters:**
- `q` - Arama terimi
- `category` - Kategori
- `brand` - Marka
- `size` - Boyut
- `color` - Renk

---

## 10. 📋 Koleksiyon API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Koleksiyon Listesi
**Endpoint:** `GET {PUBLIC_URL}/api/collections`

### Koleksiyon Detayı
**Endpoint:** `GET {PUBLIC_URL}/api/collections/:collectionId`

### Koleksiyon Ürünleri
**Endpoint:** `GET {PUBLIC_URL}/api/collections/:collectionId/products`

---

## 11. 💵 Fiyat Listesi API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Fiyat Listesi
**Endpoint:** `GET {PUBLIC_URL}/api/price-list`

### Fiyat Hesaplama
**Endpoint:** `POST {PUBLIC_URL}/api/price-list/calculate`

**Request Body:**
```json
{
  "productId": 1,
  "size": "2x3",
  "cutType": "STANDARD",
  "quantity": 1
}
```

### Özel Fiyat Sorgulama
**Endpoint:** `GET {PUBLIC_URL}/api/price-list/custom/:productId`

---

## 12. 📧 E-posta API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Şifre Sıfırlama E-postası
**Endpoint:** `POST {PUBLIC_URL}/api/email/password-reset`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### E-posta Bağlantı Testi
**Endpoint:** `GET {PUBLIC_URL}/api/email/test-connection`

---

## 13. 🖼️ Login Assets API'leri

**Base URL:** `{PUBLIC_URL}` (Environment variable'dan okunur)

### Rastgele Halı Mağazası Görseli
**Endpoint:** `GET {PUBLIC_URL}/api/login-assets/random`

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    "type": "image",
    "isAnimated": false,
    "source": "unsplash",
    "timestamp": "2025-01-20T15:30:00Z"
  }
}
```

### Birden Fazla Rastgele Görsel
**Endpoint:** `GET {PUBLIC_URL}/api/login-assets/multiple`

**Query Parameters:**
- `count` (opsiyonel): Döndürülecek görsel sayısı (varsayılan: 5, maksimum: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "imageUrl": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
        "type": "image",
        "isAnimated": false,
        "source": "unsplash"
      },
      {
        "imageUrl": "https://media.giphy.com/media/l0MYw3vwxIAFKz1Xa/giphy.gif",
        "type": "gif",
        "isAnimated": true,
        "source": "giphy"
      }
    ],
    "count": 2,
    "timestamp": "2025-01-20T15:30:00Z"
  }
}
```

### Tüm Mevcut Görselleri Listele
**Endpoint:** `GET {PUBLIC_URL}/api/login-assets/all`

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": 1,
        "imageUrl": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
        "type": "image",
        "isAnimated": false,
        "source": "unsplash"
      }
    ],
    "totalCount": 25,
    "sources": {
      "unsplash": 16,
      "pexels": 4,
      "pixabay": 4,
      "giphy": 4
    }
  }
}
```

### Servis Sağlık Kontrolü
**Endpoint:** `GET {PUBLIC_URL}/api/login-assets/health`

**Response:**
```json
{
  "success": true,
  "data": {
    "service": "login-assets",
    "status": "healthy",
    "totalImages": 25,
    "timestamp": "2025-01-20T15:30:00Z"
  }
}
```

**Görsel Kaynakları:**
- **Unsplash**: Yüksek kaliteli halı ve iç mekan görselleri
- **Pexels**: Ücretsiz halı ve dekorasyon görselleri  
- **Pixabay**: Çeşitli halı mağazası görselleri
- **Giphy**: Animasyonlu GIF görselleri

**Görsel Tipleri:**
- `image`: Statik resim (JPG, PNG)
- `gif`: Animasyonlu GIF
- `video`: Video dosyası (MP4, WebM)

---

## 🔧 Teknik Detaylar

### HTTP Status Kodları

- **200** - Başarılı
- **201** - Oluşturuldu
- **400** - Hatalı İstek
- **401** - Yetkisiz Erişim
- **403** - Yasaklı
- **404** - Bulunamadı
- **422** - Doğrulama Hatası
- **500** - Sunucu Hatası

### Hata Response Formatı

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Geçersiz email formatı",
    "details": {
      "email": "Geçerli bir email adresi giriniz"
    }
  }
}
```

### Pagination Formatı

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Dosya Yükleme

Dosya yüklemeleri için `multipart/form-data` formatı kullanılır:

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.jpg" \
  -F "type=product" \
  {PUBLIC_URL}/api/upload
```

---

## 🚀 Deployment

### Railway Deployment

```bash
# Environment Variables
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PUBLIC_URL=https://pasha-backend-production.up.railway.app
PRODUCTION_FRONTEND_URL=https://pasha-frontend.vercel.app
```

### Vercel Deployment

```bash
# Environment Variables
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PUBLIC_URL=https://your-app.vercel.app
PRODUCTION_FRONTEND_URL=https://pasha-frontend.vercel.app
```

---

## 📝 Notlar

1. **CORS**: Tüm endpoint'ler CORS ile korunmuştur
2. **Rate Limiting**: API rate limiting uygulanmıştır
3. **Validation**: Tüm input'lar server-side validation'dan geçer
4. **Logging**: Tüm API çağrıları loglanır
5. **Error Handling**: Kapsamlı hata yönetimi mevcuttur

---

*Son güncelleme: 2025-01-20* 