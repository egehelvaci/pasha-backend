# Public Catalog API Dokümantasyonu

## Genel Bakış

Public Catalog API, token gerektirmeden koleksiyonları ve ürünleri getirebilen açık erişimli endpoint'lerdir. Bu API, katalog verilerini sadece ürün adı ve görseli ile sınırlı olarak döndürür.

## Base URL

```
https://your-domain.com/api/public/catalog
```

## Özellikler

✅ **Token gerektirmez** - Herhangi bir kimlik doğrulama gerekmez  
✅ **Sadece aktif koleksiyonlar** - `isActive: true` olan koleksiyonlar döndürülür  
✅ **Minimal veri** - Sadece gerekli alanlar (ad, görsel) döndürülür  
✅ **Hızlı yanıt** - Optimize edilmiş sorgular  
✅ **CORS desteği** - Frontend uygulamalardan erişilebilir  

---

## Endpoint'ler

### 1. Tüm Koleksiyonları Getir

Tüm aktif koleksiyonları ve altındaki ürünleri getirir.

#### Request

```http
GET /api/public/catalog/collections
```

#### Headers

```http
Content-Type: application/json
```

#### Response

**Success (200)**

```json
{
  "success": true,
  "message": "Public koleksiyonlar başarıyla getirildi",
  "data": {
    "collections": [
      {
        "id": "uuid-collection-1",
        "name": "Halı Koleksiyonu",
        "description": "En kaliteli halılar",
        "code": "HALI-001",
        "productCount": 15,
        "products": [
          {
            "id": "uuid-product-1",
            "name": "Klasik Halı - Kırmızı",
            "image": "https://example.com/uploads/product1.jpg"
          },
          {
            "id": "uuid-product-2", 
            "name": "Modern Halı - Mavi",
            "image": "https://example.com/uploads/product2.jpg"
          }
        ]
      },
      {
        "id": "uuid-collection-2",
        "name": "Kilim Koleksiyonu", 
        "description": "Geleneksel kilimler",
        "code": "KILIM-001",
        "productCount": 8,
        "products": [
          {
            "id": "uuid-product-3",
            "name": "Antik Kilim",
            "image": "https://example.com/uploads/product3.jpg"
          }
        ]
      }
    ],
    "totalCollections": 2,
    "totalProducts": 23
  }
}
```

**Error (500)**

```json
{
  "success": false,
  "message": "Public koleksiyonlar getirilirken bir hata oluştu"
}
```

---

### 2. Belirli Koleksiyon Detayı

Belirtilen ID'ye sahip koleksiyonun detaylarını getirir.

#### Request

```http
GET /api/public/catalog/collections/{collectionId}
```

#### Path Parameters

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| `collectionId` | string | Koleksiyon UUID'si |

#### Example Request

```http
GET /api/public/catalog/collections/uuid-collection-1
```

#### Response

**Success (200)**

```json
{
  "success": true,
  "message": "Koleksiyon detayı başarıyla getirildi",
  "data": {
    "id": "uuid-collection-1",
    "name": "Halı Koleksiyonu",
    "description": "En kaliteli halılar",
    "code": "HALI-001",
    "productCount": 15,
    "products": [
      {
        "id": "uuid-product-1",
        "name": "Klasik Halı - Kırmızı",
        "image": "https://example.com/uploads/product1.jpg"
      },
      {
        "id": "uuid-product-2",
        "name": "Modern Halı - Mavi", 
        "image": "https://example.com/uploads/product2.jpg"
      }
    ]
  }
}
```

**Error (400)**

```json
{
  "success": false,
  "message": "Koleksiyon ID gerekli"
}
```

**Error (404)**

```json
{
  "success": false,
  "message": "Koleksiyon bulunamadı"
}
```

**Error (500)**

```json
{
  "success": false,
  "message": "Koleksiyon detayı getirilirken bir hata oluştu"
}
```

---

## Veri Yapısı

### Collection Object

```typescript
interface Collection {
  id: string;           // Koleksiyon UUID'si
  name: string;         // Koleksiyon adı
  description: string;  // Koleksiyon açıklaması
  code: string;         // Koleksiyon kodu
  productCount: number; // Bu koleksiyondaki ürün sayısı
  products: Product[];  // Ürün listesi
}
```

### Product Object

```typescript
interface Product {
  id: string;     // Ürün UUID'si  
  name: string;   // Ürün adı
  image: string;  // Ürün görseli URL'si
}
```

---

## Kullanım Örnekleri

### JavaScript/Fetch

```javascript
// Tüm koleksiyonları getir
async function getAllCollections() {
  try {
    const response = await fetch('/api/public/catalog/collections');
    const data = await response.json();
    
    if (data.success) {
      console.log('Koleksiyonlar:', data.data.collections);
      console.log('Toplam ürün sayısı:', data.data.totalProducts);
    }
  } catch (error) {
    console.error('Hata:', error);
  }
}

// Belirli koleksiyon detayı
async function getCollectionDetail(collectionId) {
  try {
    const response = await fetch(`/api/public/catalog/collections/${collectionId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('Koleksiyon:', data.data.name);
      console.log('Ürünler:', data.data.products);
    }
  } catch (error) {
    console.error('Hata:', error);
  }
}
```

### cURL

```bash
# Tüm koleksiyonları getir
curl -X GET "https://your-domain.com/api/public/catalog/collections" \
  -H "Content-Type: application/json"

# Belirli koleksiyon detayı  
curl -X GET "https://your-domain.com/api/public/catalog/collections/uuid-collection-1" \
  -H "Content-Type: application/json"
```

### React Example

```jsx
import React, { useState, useEffect } from 'react';

function PublicCatalog() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/public/catalog/collections');
      const data = await response.json();
      
      if (data.success) {
        setCollections(data.data.collections);
      }
    } catch (error) {
      console.error('Katalog yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="catalog">
      <h1>Ürün Kataloğu</h1>
      {collections.map(collection => (
        <div key={collection.id} className="collection">
          <h2>{collection.name}</h2>
          <p>{collection.description}</p>
          <div className="products">
            {collection.products.map(product => (
              <div key={product.id} className="product">
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Performans ve Limitler

### Optimizasyonlar

- ✅ Sadece gerekli alanlar seçiliyor (`SELECT` optimizasyonu)
- ✅ Aktif koleksiyonlar filtreleniyor
- ✅ Ürünler alfabetik sıralanıyor
- ✅ Database index'leri kullanılıyor

### Önerilen Kullanım

- 📱 **Mobil uygulamalar** için katalog gösterimi
- 🌐 **Public web siteleri** için ürün listesi  
- 🔍 **Arama motorları** için SEO-friendly katalog
- 📊 **Analytics** için ürün verisi toplama

### Cache Önerileri

```javascript
// Frontend'de cache implementasyonu
const CACHE_KEY = 'public_catalog';
const CACHE_DURATION = 30 * 60 * 1000; // 30 dakika

async function getCachedCollections() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp < CACHE_DURATION) {
      return data.collections;
    }
  }
  
  // Cache expired, fetch fresh data
  const response = await fetch('/api/public/catalog/collections');
  const result = await response.json();
  
  if (result.success) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      collections: result.data.collections,
      timestamp: Date.now()
    }));
    return result.data.collections;
  }
}
```

---

## Güvenlik

### Erişim Kontrolü

- ❌ **Token gerektirmez** - Herkese açık
- ✅ **Sadece okuma** - Veri değiştirilemez
- ✅ **Minimal veri** - Hassas bilgiler döndürülmez
- ✅ **Rate limiting** önerilir (nginx/cloudflare seviyesinde)

### CORS Ayarları

API, tüm origin'lerden erişime izin verir. Production'da kısıtlama yapılması önerilir:

```javascript
// server.ts'de CORS konfigürasyonu
app.use('/api/public', cors({
  origin: ['https://your-website.com', 'https://your-app.com'],
  methods: ['GET'],
  credentials: false
}));
```

---

## Hata Kodları

| HTTP Status | Açıklama |
|-------------|----------|
| `200` | Başarılı istek |
| `400` | Geçersiz parametre |
| `404` | Koleksiyon bulunamadı |
| `500` | Sunucu hatası |

---

## Versiyon Bilgisi

- **API Version**: 1.0
- **Son Güncelleme**: Eylül 2025
- **Uyumluluk**: Node.js 18+, Express 4+, Prisma 6+

---

## Destek

Bu API ile ilgili sorularınız için:
- 📧 **E-posta**: support@your-domain.com
- 📚 **Dokümantasyon**: Bu dosya
- 🐛 **Bug Report**: GitHub Issues

---

## Changelog

### v1.0.0 (2025-09-15)
- ✨ İlk sürüm yayınlandı
- ✅ Koleksiyon listesi endpoint'i
- ✅ Koleksiyon detay endpoint'i  
- ✅ Token gerektirmeyen erişim
- ✅ Minimal veri yapısı
