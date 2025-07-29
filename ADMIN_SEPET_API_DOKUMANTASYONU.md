# Admin Sepet Sistemi API Dokümantasyonu

## Genel Bakış

Admin sepet sistemi, admin kullanıcıların müşteriler için özel sepetler oluşturmasına, yönetmesine ve bu sepetlerden sipariş vermesine olanak tanır. Bu sistem mevcut sepet sisteminin birebir aynısını takip eder ancak admin kontrolünde çalışır.

## Veritabanı Yapısı

### `admin_carts` Tablosu
```sql
CREATE TABLE admin_carts (
  id SERIAL PRIMARY KEY,
  admin_user_id VARCHAR(36) NOT NULL,     -- Sepeti oluşturan admin kullanıcı ID'si
  target_user_id VARCHAR(36) NOT NULL,    -- Sepet sahibi kullanıcı ID'si  
  store_id UUID NOT NULL,                 -- Mağaza ID'si
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT                              -- Admin notları
);
```

### `admin_cart_items` Tablosu
```sql
CREATE TABLE admin_cart_items (
  id SERIAL PRIMARY KEY,
  admin_cart_id INTEGER NOT NULL,         -- admin_carts tablosu ile ilişki
  product_id VARCHAR(36) NOT NULL,
  quantity INTEGER DEFAULT 1,
  width DECIMAL(8,2) NOT NULL,
  height DECIMAL(8,2) NOT NULL,
  area_m2 DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  has_fringe BOOLEAN DEFAULT FALSE,
  cut_type cut_type_enum DEFAULT 'rectangle',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoint'leri

### 1. Admin Sepete Ürün Ekleme

**Endpoint:** `POST /admin/cart/add-to-admin-cart`

**Yetkilendirme:** Admin rolü gerekli

**Request Body:**
```json
{
  "targetUserId": "uuid-string",           // Zorunlu: Sepet sahibi kullanıcı ID'si
  "storeId": "uuid-string",               // Zorunlu: Mağaza ID'si
  "productId": "uuid-string",             // Zorunlu: Ürün ID'si
  "quantity": 5,                          // Zorunlu: Miktar (pozitif sayı)
  "width": 100,                           // Zorunlu: Genişlik (cm, pozitif sayı)
  "height": 150,                          // Zorunlu: Yükseklik (cm, pozitif sayı)
  "hasFringe": false,                     // Zorunlu: Saçak durumu
  "cutType": "standart",                  // Zorunlu: Kesim türü
  "notes": "Özel kesim talebi"            // Opsiyonel: Notlar
}
```

**Geçerli Kesim Türleri:**
- `standart` / `dikdörtgen` / `rectangle`
- `daire` / `round` / `circle` 
- `oval`
- `custom` / `özel` / `post` / `post kesim`

**Response:**
```json
{
  "success": true,
  "message": "Admin {adminUserId} tarafından {targetUser.name} {targetUser.surname} adlı kullanıcının admin sepetine ürün eklendi",
  "data": {
    "adminCartItem": {
      "id": 123,
      "admin_cart_id": 45,
      "product_id": "uuid",
      "quantity": 5,
      "width": "100.00",
      "height": "150.00",
      "area_m2": "1.50",
      "unit_price": "25.00",
      "total_price": "187.50",
      "has_fringe": false,
      "cut_type": "rectangle",
      "notes": "Özel kesim talebi",
      "created_at": "2024-01-15T10:30:00Z",
      "Product": { /* ürün detayları */ }
    },
    "targetUser": {
      "userId": "uuid",
      "name": "Ahmet",
      "surname": "Yılmaz", 
      "email": "ahmet@example.com",
      "store": {
        "store_id": "uuid",
        "kurum_adi": "ABC Mağazası"
      }
    },
    "store": {
      "store_id": "uuid",
      "kurum_adi": "ABC Mağazası"
    }
  }
}
```

### 2. Admin Sepeti Getirme

**Endpoint:** `GET /admin/cart/:targetUserId/:storeId`

**Yetkilendirme:** Admin rolü gerekli

**Parametreler:**
- `targetUserId`: Sepet sahibi kullanıcı ID'si
- `storeId`: Mağaza ID'si

**Response:**
```json
{
  "success": true,
  "message": "{targetUser.name} {targetUser.surname} adlı kullanıcının admin sepeti getirildi",
  "data": {
    "adminCart": {
      "id": 45,
      "targetUserId": "uuid",
      "adminUserId": "admin-uuid", 
      "storeId": "store-uuid",
      "items": [
        {
          "id": 123,
          "productId": "product-uuid",
          "quantity": 5,
          "width": "100.00",
          "height": "150.00",
          "area_m2": "1.50",
          "unit_price": "25.00",
          "total_price": "187.50",
          "has_fringe": false,
          "cut_type": "standart",
          "notes": "Özel kesim talebi",
          "product": {
            "productId": "uuid",
            "name": "Ürün Adı",
            "description": "Ürün açıklaması",
            "productImage": "image-url",
            "collection": {
              "collectionId": "uuid",
              "name": "Koleksiyon Adı",
              "code": "KOL001"
            },
            "pricing": {
              "price": "25.00",
              "currency": "TRY"
            }
          }
        }
      ],
      "totalItems": 5,
      "totalPrice": "187.50",
      "adminUser": {
        "userId": "admin-uuid",
        "name": "Admin",
        "surname": "User"
      },
      "targetUser": {
        "userId": "uuid", 
        "name": "Ahmet",
        "surname": "Yılmaz"
      },
      "store": {
        "store_id": "uuid",
        "kurum_adi": "ABC Mağazası"
      },
      "notes": null,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 3. Admin Sepeti Temizleme

**Endpoint:** `DELETE /admin/cart/:targetUserId/:storeId/clear`

**Yetkilendirme:** Admin rolü gerekli

**Parametreler:**
- `targetUserId`: Sepet sahibi kullanıcı ID'si
- `storeId`: Mağaza ID'si

**Response:**
```json
{
  "success": true,
  "message": "Admin {adminUserId} tarafından {targetUser.name} {targetUser.surname} adlı kullanıcının admin sepeti temizlendi",
  "data": {
    "success": true,
    "message": "Admin sepet temizlendi",
    "targetUser": {
      "userId": "uuid",
      "name": "Ahmet", 
      "surname": "Yılmaz",
      "email": "ahmet@example.com"
    }
  }
}
```

### 4. Admin Sepetinden Ürün Çıkarma

**Endpoint:** `DELETE /admin/cart/:targetUserId/:storeId/item/:adminCartItemId`

**Yetkilendirme:** Admin rolü gerekli

**Parametreler:**
- `targetUserId`: Sepet sahibi kullanıcı ID'si  
- `storeId`: Mağaza ID'si
- `adminCartItemId`: Admin sepet öğesi ID'si

**Response:**
```json
{
  "success": true,
  "message": "Admin {adminUserId} tarafından {targetUser.name} {targetUser.surname} adlı kullanıcının admin sepetinden ürün çıkarıldı",
  "data": {
    "success": true,
    "message": "Ürün admin sepetten çıkarıldı",
    "targetUser": {
      "userId": "uuid",
      "name": "Ahmet",
      "surname": "Yılmaz", 
      "email": "ahmet@example.com"
    }
  }
}
```

### 5. Admin Sepetinden Sipariş Oluşturma

**Endpoint:** `POST /admin/cart/create-order-from-admin-cart`

**Yetkilendirme:** Admin rolü gerekli

**Request Body:**
```json
{
  "targetUserId": "uuid-string",           // Zorunlu: Sepet sahibi kullanıcı ID'si
  "storeId": "uuid-string",               // Zorunlu: Mağaza ID'si
  "notes": "Sipariş notları"              // Opsiyonel: Sipariş notları
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin {adminUserId} tarafından {targetUser.name} {targetUser.surname} adlı kullanıcının admin sepetinden sipariş oluşturuldu",
  "data": {
    "order": {
      "id": "order-uuid",
      "user_id": "uuid",
      "cart_id": 123,
      "total_price": "187.50",
      "status": "PENDING",
      "delivery_address": "Müşteri adresi",
      "store_name": "ABC Mağazası",
      "store_tax_number": "1234567890",
      "store_tax_office": "Vergi Dairesi",
      "notes": "Sipariş notları",
      "items": [/* sipariş öğeleri */]
    },
    "targetUser": {
      "userId": "uuid",
      "name": "Ahmet",
      "surname": "Yılmaz",
      "email": "ahmet@example.com",
      "store": {
        "store_id": "uuid", 
        "kurum_adi": "ABC Mağazası"
      }
    },
    "requiresPayment": false,
    "limitAmount": 10000,
    "minimumPayment": null
  }
}
```

## Hata Kodları

### 400 Bad Request
- **Eksik Parametreler:** `targetUserId, storeId, productId, quantity, width, height, hasFringe ve cutType alanları zorunludur`
- **Geçersiz Değerler:** `Miktar, genişlik ve yükseklik pozitif değerler olmalıdır`
- **Geçersiz Boyut:** `Seçilen boyut (100x150cm) bu ürün için geçerli değil. Mevcut boyutlar: 80x120cm, 100x140cm`
- **Stok Yetersiz:** `Yeterli stok yok. Seçilen boyut için maksimum sipariş: 10 adet`
- **Geçersiz Kesim:** `Seçilen kesim türü (custom) bu ürün için geçerli değil`
- **Boş Sepet:** `Kullanıcının aktif admin sepeti bulunamadı veya sepet boş`

### 401 Unauthorized
- **Kimlik Doğrulama:** `Admin kimlik doğrulaması gerekli`

### 403 Forbidden
- **Yetki:** Admin rolü gerekli (middleware tarafından kontrol edilir)

### 404 Not Found  
- **Kullanıcı:** `Hedef kullanıcı bulunamadı`
- **Mağaza:** `Mağaza bulunamadı`
- **Ürün:** `Ürün bulunamadı`
- **Sepet Öğesi:** `Admin sepet öğesi bulunamadı veya yetkisiz erişim`

### 500 Internal Server Error
- **Genel Hatalar:** Sunucu tarafı hatalar için detaylı hata mesajları

## Özellikler

### ✅ Validasyonlar
- **Ürün Kontrolü:** Ürün varlığı ve erişilebilirlik
- **Boyut Kontrolü:** Ürün için geçerli boyut seçenekleri
- **Stok Kontrolü:** Hazır kesim ve opsiyonel yükseklik için stok kontrolleri
- **Kesim Türü:** Ürün için desteklenen kesim türleri
- **Saçak Kontrolü:** Ürünün saçaklı olup olamayacağı
- **Fiyat Hesaplama:** Alan bazlı otomatik fiyat hesaplama

### ✅ Güvenlik
- **Admin Yetkilendirme:** Tüm endpoint'ler admin rolü gerektirir
- **Kullanıcı Kontrolü:** Hedef kullanıcı varlık kontrolü
- **Mağaza Kontrolü:** Mağaza varlık ve erişim kontrolü
- **Sahiplik Kontrolü:** Admin sepet öğelerinin doğru admin'e ait olduğu kontrol

### ✅ İş Mantığı
- **Sepet Birleştirme:** Aynı ürün/boyut/özellik varsa miktar birleştirme
- **Otomatik Dönüştürme:** Admin sepet → Normal sepet → Sipariş
- **Mağaza Bazlı:** Her admin sepet belirli bir mağaza ile ilişkili
- **Admin Takibi:** Hangi admin'in hangi sepeti oluşturduğu kayıt altında

## Kullanım Senaryoları

### 1. Telefon Siparişi
```
1. Müşteri telefon ile arar
2. Admin müşteri bilgilerini sisteme girer
3. Admin müşteri için sepet oluşturur
4. Admin sepete ürünleri ekler  
5. Admin sepetten sipariş oluşturur
6. Sistem otomatik olarak fiyatlandırma ve limit kontrolü yapar
```

### 2. Mağaza Ziyareti
```
1. Müşteri mağazaya gelir
2. Admin müşteri ile birlikte ürünleri seçer
3. Admin sepete ürünleri ekler
4. Müşteri sepeti onaylar
5. Admin sipariş oluşturur
```

### 3. Toplu Sipariş
```
1. Admin büyük müşteri için sepet hazırlar
2. Birden fazla ürün ve boyut ekler
3. Özel notlar ekler
4. Sepeti müşteri onayı için bekletir
5. Onay gelince sipariş oluşturur
```

## Dikkat Edilmesi Gerekenler

1. **Admin Sepet ≠ Normal Sepet:** Bu iki ayrı sistemdir
2. **Mağaza Bağımlılığı:** Her admin sepet bir mağaza ile ilişkilidir
3. **Otomatik Dönüştürme:** Sipariş oluştururken admin sepet normal sepete dönüştürülür
4. **Yetki Kontrolü:** Sadece admin kullanıcılar bu API'leri kullanabilir
5. **Stok Güncellemesi:** Sipariş oluşturulduğunda stok otomatik düşer

## Geliştirici Notları

- **Prisma Client:** Yeni tablolar için `npx prisma generate` çalıştırılmalı
- **Migration:** Production'da migration çalıştırılmamalı, sadece `prisma db push` kullan
- **Test:** Admin rolü olan test kullanıcısı gerekli
- **Monitoring:** Admin sepet işlemleri loglanır 