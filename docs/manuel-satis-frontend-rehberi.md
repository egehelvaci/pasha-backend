# Manuel Satış Sistemi - Frontend Geliştirme Rehberi

## 📋 Genel Bakış

Manuel satış sistemi başarıyla backend'e entegre edilmiştir. Bu dokümanda frontend geliştirme için gerekli tüm bilgiler yer almaktadır.

## 🔧 Backend Hazır Durumu

✅ **Tamamlanan Backend İşlemleri:**
- Veritabanı migration'ları oluşturuldu
- ManuelSatisService ve Controller'lar hazır
- API endpoint'leri aktif
- Stok kontrolü ve güncelleme sistemi çalışıyor
- Fiş oluşturma sistemi hazır
- Muhasebe entegrasyonu tamamlandı

## 🚀 API Endpoint'leri

### Base URL
```
/api/admin/manuel-satis
```

### 1. Ürün Arama API'si
```http
GET /api/admin/manuel-satis/search-products
```

**Query Parameters:**
- `q` (string): Arama terimi (en az 2 karakter)
- `collectionId` (string, opsiyonel): Koleksiyon ID'si
- `limit` (number, opsiyonel): Sonuç limiti (varsayılan: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "productId": "uuid",
      "name": "Ürün Adı",
      "description": "Ürün Açıklaması",
      "collection": {
        "name": "Koleksiyon Adı",
        "code": "KOL"
      },
      "hasStock": true,
      "priceInfo": {
        "pricePerSquareMeter": 250.00,
        "currency": "TRY"
      },
      "stockInfo": [
        {
          "width": 200,
          "height": 300,
          "stockQuantity": 10,
          "stockAreaM2": 25.5,
          "hasFringe": false,
          "estimatedPrice": 150.00
        }
      ]
    }
  ]
}
```

### 2. Ürün Fiyatı Hesaplama
```http
POST /api/admin/manuel-satis/calculate-price
```

**Request Body:**
```json
{
  "storeId": "store-uuid",
  "productId": "product-uuid",
  "width": 200,
  "height": 300
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "product-uuid",
    "productName": "Ürün Adı",
    "collectionName": "Koleksiyon Adı",
    "width": 200,
    "height": 300,
    "alanM2": 0.6,
    "unitPrice": 150.00,
    "priceListName": "Varsayılan Fiyat Listesi",
    "currency": "TRY"
  }
}
```

### 3. Manuel Satış Oluşturma
```http
POST /api/admin/manuel-satis/create
```

**Request Body:**
```json
{
  "storeId": "store-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "width": 200,
      "height": 300,
      "hasFringe": true,
      "cutType": "Düz",
      "unitPrice": 1500,
      "notes": "Özel kesim"
    }
  ],
  "paymentMethod": "Nakit",
  "notes": "Mağazadan direkt satış"
}
```

**Not:** 
- `unitPrice` alanı boş bırakılırsa, sistem otomatik olarak varsayılan fiyat listesinden hesaplar
- Manuel satışlarda her zaman varsayılan fiyat listesi kullanılır, mağazaya özel fiyat listesi değil

**Response:**
```json
{
  "success": true,
  "message": "Manuel satış başarıyla kaydedildi",
  "data": {
    "fisNumarasi": "MS-20250120-1430-A1B2",
    "totalAmount": 3000,
    "itemCount": 1
  }
}
```

### 4. Fiş Alma
```http
GET /api/admin/manuel-satis/receipt/{fisNumarasi}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "satis": {
      "fisNumarasi": "MS-20250120-1430-A1B2",
      "tarih": "2025-01-20T14:30:00Z",
      "toplamTutar": 3000
    },
    "magaza": {
      "kurumAdi": "Örnek Mağaza",
      "telefon": "0212 123 45 67"
    },
    "urunler": [...],
    "bakiye": {
      "satisOncesi": 15000,
      "satisSonrasi": 12000,
      "satisKesintisi": 3000
    }
  }
}
```

### 5. Manuel Satış Listesi
```http
GET /api/admin/manuel-satis/list
```

**Query Parameters:**
- `storeId` (string, opsiyonel): Mağaza filtresi
- `startDate` (string, opsiyonel): Başlangıç tarihi (YYYY-MM-DD)
- `endDate` (string, opsiyonel): Bitiş tarihi (YYYY-MM-DD)
- `page` (number): Sayfa numarası (varsayılan: 1)
- `limit` (number): Sayfa başına kayıt (varsayılan: 20)

## 💰 Fiyat Sistemi

### Otomatik Fiyat Hesaplama
- **Varsayılan Davranış**: Ürün seçildiğinde fiyat otomatik hesaplanır
- **Fiyat Kaynağı**: Her zaman varsayılan fiyat listesi (mağazaya özel değil)
- **Hesaplama**: Koleksiyon bazlı m² fiyatı × alan (cm² → m²)
- **Manuel Düzenleme**: Hesaplanan fiyat manuel olarak değiştirilebilir

### API Kullanımı
1. **Ürün Arama**: Varsayılan fiyat listesi bilgisi dahil edilir
2. **Fiyat Hesaplama**: Boyut değiştiğinde `/calculate-price` endpoint'i çağrılır
3. **Satış Oluşturma**: `unitPrice` boş bırakılırsa otomatik hesaplanır

## 🎨 Frontend Geliştirme Görevleri

### 1. Manuel Satış Formu Sayfası

**Dosya:** `pages/admin/manuel-satis/create.tsx` veya benzeri

**Gerekli Bileşenler:**
- Mağaza seçici dropdown
- Ürün arama input'u (yazarken arama)
- Seçilen ürünler listesi
- Ürün detay formu (boyut, miktar, fiyat)
- Toplam tutar hesaplayıcı
- Kaydet butonu

**Özellikler:**
```typescript
interface ManuelSatisForm {
  storeId: string;
  items: ManuelSatisItem[];
  paymentMethod?: string;
  notes?: string;
}

interface ManuelSatisItem {
  productId: string;
  productName: string; // UI için
  quantity: number;
  width?: number;
  height?: number;
  hasFringe?: boolean;
  cutType?: string;
  unitPrice: number;
  totalPrice: number; // Hesaplanan
  notes?: string;
}
```

**Validasyon Kuralları:**
- Mağaza seçimi zorunlu
- En az 1 ürün seçilmeli
- Miktar > 0 olmalı
- Birim fiyat > 0 olmalı
- Boyutlu ürünler için width/height zorunlu

### 2. Ürün Arama Bileşeni

**Dosya:** `components/ManuelSatis/ProductSearch.tsx`

**Özellikler:**
- Debounced arama (300ms)
- Dropdown sonuçlar
- Stok durumu gösterimi
- Koleksiyon bilgisi
- Seçim callback'i

```typescript
interface ProductSearchProps {
  onProductSelect: (product: Product) => void;
  selectedProducts: string[]; // Zaten seçilmiş ürünler
}
```

### 3. Ürün Detay Formu

**Dosya:** `components/ManuelSatis/ProductDetailForm.tsx`

**Özellikler:**
- Boyut seçimi (stok durumuna göre)
- Miktar input'u
- Birim fiyat input'u
- Saçak checkbox'ı
- Kesim tipi seçimi
- Otomatik toplam hesaplama

### 4. Manuel Satış Listesi Sayfası

**Dosya:** `pages/admin/manuel-satis/list.tsx`

**Özellikler:**
- Tarih filtresi
- Mağaza filtresi
- Sayfalama
- Fiş detayı görüntüleme
- Fiş yazdırma
- Excel export (opsiyonel)

### 5. Fiş Görüntüleme Sayfası

**Dosya:** `pages/admin/manuel-satis/receipt/[fisNumarasi].tsx`

**Özellikler:**
- Fiş detaylarını gösterme
- Yazdırma özelliği
- PDF export (opsiyonel)
- Mağaza bilgileri
- Ürün listesi
- Bakiye bilgileri

## 🔧 Utility Fonksiyonlar

### API Service
```typescript
// services/manuelSatisApi.ts
export class ManuelSatisApi {
  static async searchProducts(query: string, collectionId?: string) {
    // API çağrısı
  }
  
  static async createManuelSatis(data: ManuelSatisForm) {
    // API çağrısı
  }
  
  static async getReceipt(fisNumarasi: string) {
    // API çağrısı
  }
  
  static async getList(filters: ListFilters) {
    // API çağrısı
  }
}
```

### Hesaplama Fonksiyonları
```typescript
// utils/manuelSatisUtils.ts
export const calculateItemTotal = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice;
}

export const calculateGrandTotal = (items: ManuelSatisItem[]): number => {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
}

export const calculateAreaM2 = (width: number, height: number): number => {
  return (width * height) / 10000;
}

export const calculatePriceFromArea = (areaM2: number, pricePerM2: number): number => {
  return areaM2 * pricePerM2;
}
```

## 🎯 UI/UX Önerileri

### 1. Ürün Arama
- Minimum 2 karakter sonra arama başlasın
- Loading spinner gösterin
- "Ürün bulunamadı" mesajı
- Stok durumunu renk kodları ile gösterin

### 2. Form Validasyonu
- Real-time validasyon
- Hata mesajlarını input'ların altında gösterin
- Submit butonunu disable edin geçersiz durumda

### 3. Toplam Hesaplama
- Her değişiklikte otomatik güncelleme
- Ara toplamları gösterin
- KDV hesaplaması (gerekirse)

### 4. Fiş Tasarımı
- Yazdırma dostu CSS
- Mağaza logosu (varsa)
- QR kod (opsiyonel)
- Temiz, profesyonel görünüm

## 📱 Responsive Tasarım

- Mobil uyumlu form tasarımı
- Tablet için optimize edilmiş liste görünümü
- Desktop için geniş ekran kullanımı

## 🔒 Güvenlik Kontrolleri

- Admin yetkisi kontrolü
- Form validasyonu
- XSS koruması
- CSRF token kullanımı

## 🧪 Test Senaryoları

### 1. Ürün Arama Testleri
- Boş arama
- Çok kısa arama (1 karakter)
- Sonuç bulunamayan arama
- Başarılı arama

### 2. Form Validasyon Testleri
- Boş form gönderimi
- Eksik alanlar
- Geçersiz değerler
- Stok yetersizliği

### 3. Fiş Oluşturma Testleri
- Başarılı satış
- Stok kontrolü
- Bakiye güncelleme
- Hata durumları

## 📋 Geliştirme Sırası Önerisi

1. **Hafta 1:** API entegrasyonu ve temel bileşenler
   - API service'leri
   - Ürün arama bileşeni
   - Temel form yapısı

2. **Hafta 2:** Form geliştirme
   - Ürün detay formu
   - Validasyon sistemi
   - Toplam hesaplama

3. **Hafta 3:** Liste ve fiş sayfaları
   - Manuel satış listesi
   - Fiş görüntüleme
   - Filtreleme sistemi

4. **Hafta 4:** İyileştirmeler ve testler
   - UI/UX iyileştirmeleri
   - Test yazımı
   - Bug düzeltmeleri

## 🔍 Debug ve Geliştirme İpuçları

### API Test Komutları
```bash
# Ürün arama testi
curl -X GET "http://localhost:3001/api/admin/manuel-satis/search-products?q=halı" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Manuel satış oluşturma testi
curl -X POST "http://localhost:3001/api/admin/manuel-satis/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "storeId": "store-uuid",
    "items": [{
      "productId": "product-uuid",
      "quantity": 1,
      "unitPrice": 1000
    }]
  }'
```

### Console Log'ları
- API yanıtlarını logla
- Form state değişikliklerini takip et
- Hata durumlarını detaylı logla

## 📞 Destek

Backend API'si ile ilgili sorularınız için:
- API endpoint'leri test edilmiş durumda
- Hata durumları handle edilmiş
- Stok kontrolü çalışıyor
- Fiş sistemi aktif

**Not:** Bu rehber backend implementasyonu tamamlandıktan sonra hazırlanmıştır. Tüm API endpoint'leri test edilmiş ve çalışır durumdadır.
