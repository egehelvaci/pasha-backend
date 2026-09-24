# Site yönetimi — frontend entegrasyonu

Bu servisler site genelinde bakiye/stok görünürlüğünü ve banner'ları yönetir. Mağaza veya kullanıcı bazında değildir. Mevcut sipariş, bakiye, stok ve giriş görseli API'leri değişmez.

`hideBalance` ve `hideStock` **arayüz görünürlüğü** ayarlarıdır; mevcut API'lerden ilgili verileri kaldırmaz. Frontend header, ürün listesi ve detay gibi ilgili alanlarda bu ayarları uygulamalıdır. Bunlar veri erişim yetkisi yerine kullanılmamalıdır.

## Frontend'in okuyacağı endpoint

`GET /api/site-settings` — token gerektirmez, `Cache-Control: no-store` döner.

```json
{
  "success": true,
  "data": {
    "hideBalance": false,
    "hideStock": false,
    "banners": [
      {
        "id": "banner-uuid",
        "title": "Yeni koleksiyon",
        "imageUrl": "https://cdn.example.com/banner.png",
        "mobileImageUrl": null,
        "linkUrl": "/collections",
        "altText": "Yeni koleksiyon ürünleri",
        "sortOrder": 0
      }
    ]
  }
}
```

Ayar kaydı henüz oluşturulmamışsa iki bayrak da `false` döner. Aktif banner yoksa `banners: []` gelir. Yalnızca aktif banner'lar döner; sıralama `sortOrder ASC, createdAt DESC, id ASC` şeklindedir.

```jsx
// Ayarlar yüklendikten sonra:
{!settings.hideBalance && <HeaderBalance />}
{!settings.hideStock && <ProductStock />}
{settings.banners.map(banner => (
  <Banner key={banner.id} {...banner} />
))}
```

Uygulama açılırken ayarları yükleyin. Ayarlar yüklenene kadar bakiye/stok bileşenlerini göstermemek, gizli bir alanın kısa süreli görünmesini önler. Hata olursa mevcut başarılı ayarı koruyup yeniden deneyin. Admin kaydından sonra ayar sorgusunun frontend cache'ini geçersiz kılın. Başka açık oturumların güncellenmesi için pencere odağına dönüldüğünde veya belirlediğiniz aralıkta tekrar sorgulayın; servis WebSocket bildirimi göndermez.

## Admin yetkisi

Aşağıdaki tüm endpoint'ler `Authorization: Bearer <TOKEN>` ve **admin** rolü gerektirir. Editor dahil diğer roller HTTP 403 alır. Admin panelindeki butonu gizlemek yeterli değildir; backend de bu kuralı uygular.

### Ayarları getir

`GET /api/admin/site-settings`

`data`: `id`, `hideBalance`, `hideStock`, `updatedAt`. Kayıt yoksa `id: 1`, bayraklar `false`, `updatedAt: null` döner. GET istekleri ayar kaydı oluşturmaz.

### Ayarları güncelle

`PATCH /api/admin/site-settings`

```json
{ "hideBalance": true, "hideStock": false }
```

Alanlar isteğe bağlıdır; en az biri gönderilmelidir. Gönderilmeyen alan korunur. Değerler JSON boolean olmalıdır; `"true"`, `1`, `null` kabul edilmez. Bilinmeyen alanlar reddedilir. Başarılı yanıt HTTP 200: `{ "success": true, "data": { ...güncelAyarlar } }`.

## Banner yönetimi

### Slider yapısı ve çoklu görsel

`banners` dizisindeki **her kayıt slider'ın bir slaytıdır**. Aynı slider için birden fazla banner kaydı oluşturun. Tek kayda iç içe `images` alanı eklenmez. Her slaytın görseli, mobil görseli, bağlantısı, aktifliği ve sırası bağımsızdır. Public endpoint aktif slaytları sıralı döndürür; frontend bu diziyi carousel/slider bileşenine verir. Tek görselli eski endpoint'ler de çalışmaya devam eder.

#### 1. Birden fazla görsel yükle

`POST /api/admin/site-settings/banner-images`

`multipart/form-data` içinde tekrarlanan **images** alanları gönderin. İstek başına 1–20 görsel, dosya başına en fazla 5 MB; PNG, JPEG ve WebP desteklenir. Dosyaların tamamı CDN yüklemesi başlamadan doğrulanır. Yanıt sırası, gönderim sırasıdır.

```javascript
const form = new FormData();
for (const file of selectedFiles) form.append('images', file);
const response = await fetch(`${apiBase}/api/admin/site-settings/banner-images`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: form
});
const result = await response.json();
if (!response.ok) throw new Error(result.message);
const images = result.data.images;
```

HTTP 201 örneği:

```json
{
  "success": true,
  "data": {
    "images": [
      { "imageUrl": "https://cdn.example.com/slide-1.png", "sortOrder": 0 },
      { "imageUrl": "https://cdn.example.com/slide-2.png", "sortOrder": 1 }
    ]
  }
}
```

Bu aşama veritabanı kaydı oluşturmaz. `sortOrder`, yeni seçimin içindeki sıra önerisidir. Mevcut slider'a ekleme yapılıyorsa sıraları mevcut kayıtları da dikkate alarak belirleyin. CDN hatasında HTTP 500 döner; o ana kadar yüklenen dosyalar CDN'de kalabilir, banner kayıtları oluşmaz.

#### 2. Slaytları tek istekte kaydet

`POST /api/admin/site-settings/banners/bulk`

```json
{
  "banners": [
    { "title": "İlk slayt", "imageUrl": "https://cdn.example.com/slide-1.png", "sortOrder": 0, "isActive": true },
    { "title": "İkinci slayt", "imageUrl": "https://cdn.example.com/slide-2.png", "sortOrder": 1, "linkUrl": "/collections", "isActive": true }
  ]
}
```

1–20 slayt gönderilebilir. Her kayıt tekil oluşturma ile aynı alan kurallarını kullanır. Tüm kayıtlar tek transaction'da oluşturulur; bir kayıt geçersizse hiçbiri eklenmez. HTTP 201 yanıtı `{ "success": true, "data": [ ...oluşturulanSlaytlar ] }` biçimindedir. Oluşturma tekrar çağrılırsa yeni kayıtlar ekler; otomatik tekrar göndermeyin.

#### 3. Sürükle-bırak sırasını kaydet

`PATCH /api/admin/site-settings/banners/reorder`

```json
{
  "items": [
    { "id": "ikinci-slaytin-id-degeri", "sortOrder": 0 },
    { "id": "ilk-slaytin-id-degeri", "sortOrder": 1 }
  ]
}
```

1–200 kayıt gönderilebilir. İstek içinde ID'ler ve sıra değerleri benzersiz olmalıdır. Sıralar negatif olmayan tam sayıdır. Güncelleme atomiktir: herhangi bir ID bulunamazsa HTTP 404 döner ve hiçbir sıra değişmez. Gönderilmeyen slaytlar korunur. Diğer slaytlarla sıra çakışmaması için mevcut listenin tamamını yeni sırayla gönderin. Eşit sıraların bağlayıcı sıralaması `createdAt DESC, id ASC` olur.

```javascript
const items = reorderedSlides.map((slide, sortOrder) => ({ id: slide.id, sortOrder }));
// PATCH body: JSON.stringify({ items })
```

HTTP 200: `{ "success": true, "data": [ ...güncellenenSlaytlar ] }`; yanıt `sortOrder` artan sıradadır. Kayıttan sonra admin listesini ve public site ayarlarını yenileyin. Çoklu slider desteği mevcut banner tablosunu kullanır; ek migration gerektirmez.

### Listeleme

`GET /api/admin/site-settings/banners`

Aktif ve pasif tüm banner'lar sıralı olarak `data` dizisinde döner. Admin kayıtları public alanlara ek olarak `isActive`, `createdAt`, `updatedAt` içerir.

### Görsel yükleme

`POST /api/admin/site-settings/banner-image`

`multipart/form-data` ile tek dosya gönderin. Alan adı **image**, üst sınır **5 MB**. PNG, JPEG ve WebP desteklenir; SVG kabul edilmez. Dosya uzantısı yerine dosya başlangıç imzası kontrol edilir. Görsel mevcut Bunny CDN yükleme servisiyle `banners` klasörüne yüklenir.

```javascript
const body = new FormData();
body.append('image', file);
const response = await fetch(`${apiBase}/api/admin/site-settings/banner-image`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body
});
// Content-Type başlığını elle vermeyin; tarayıcı multipart boundary eklemeli.
const result = await response.json();
if (!response.ok) throw new Error(result.message);
const imageUrl = result.data.imageUrl;
```

HTTP 201: `{ "success": true, "data": { "imageUrl": "https://..." } }`.
Yükleme kendi başına banner kaydı oluşturmaz. Dönen URL'yi aşağıdaki oluşturma veya güncelleme isteğine ekleyin. Mobil görseli aynı endpoint ile ayrıca yükleyebilirsiniz.

### Oluşturma

`POST /api/admin/site-settings/banners`

```json
{
  "title": "Yeni koleksiyon",
  "imageUrl": "https://cdn.example.com/banner.png",
  "mobileImageUrl": null,
  "linkUrl": "/collections",
  "altText": "Yeni koleksiyon ürünleri",
  "sortOrder": 0,
  "isActive": true
}
```

| Alan | Kural / varsayılan |
| --- | --- |
| `title` | Zorunlu, boş olamaz, en fazla 200 karakter. |
| `imageUrl` | Zorunlu HTTP/HTTPS URL, en fazla 2048 karakter. |
| `mobileImageUrl` | HTTP/HTTPS URL veya `null`; varsayılan `null`. |
| `linkUrl` | HTTP/HTTPS URL, `/collections` gibi site içi yol veya `null`; varsayılan `null`. `javascript:`, `//host` ve ters eğik çizgi kabul edilmez. |
| `altText` | En fazla 300 karakter, varsayılan boş metin. |
| `sortOrder` | 0–2147483647 arasında tam sayı, varsayılan `0`. Küçük değer önce görünür. |
| `isActive` | Boolean, varsayılan `true`. Taslak için `false` gönderin. |

HTTP 201 yanıtı: `{ "success": true, "data": { ...banner } }`.

### Düzenleme / sıralama / yayından kaldırma

`PATCH /api/admin/site-settings/banners/:id`

Oluşturmadaki alanların herhangi bir alt kümesi gönderilir. En az bir alan gereklidir; gönderilmeyen alanlar korunur. `mobileImageUrl` ve `linkUrl`, `null` ile temizlenebilir. ID ve tarih alanları değiştirilemez.

```json
{ "isActive": false }
```

```json
{ "sortOrder": 2, "title": "Güncellenen başlık", "linkUrl": null }
```

HTTP 200 yanıtı güncel banner'ı `data` içinde döndürür. Pasifleştirme sonrası bir sonraki public okumada banner görünmez.

### Silme

`DELETE /api/admin/site-settings/banners/:id`

HTTP 200: `{ "success": true, "message": "Banner silindi" }`.

Bu işlem banner veritabanı kaydını siler. Görsel değiştirme veya banner silme CDN dosyasını silmez; böylece aynı görseli kullanan diğer içerikler etkilenmez.

## Hatalar

| HTTP | Anlamı |
| --- | --- |
| 400 | Geçersiz/eksik alan, desteklenmeyen dosya veya hatalı multipart istek. |
| 401 | Token yok veya geçersiz. |
| 403 | Admin yetkisi yok. |
| 404 | Güncellenecek/silinecek banner bulunamadı. |
| 413 | Dosya 5 MB sınırını aşıyor. |
| 500 | Veritabanı/CDN işlemi tamamlanamadı. |

Hata yanıtları `{ "success": false, "message": "..." }` biçimindedir. Frontend başarısız kaydı başarı mesajıyla kapatmamalıdır.

## Veritabanı ve yayınlama

Yeni tablolar: `site_settings`, `site_banners`.
Migration: `prisma/migrations/20260924000000_site_settings/migration.sql`.

Bu migration sadece yeni tabloları oluşturur. Eski tabloları ve iş verilerini değiştirmez. Uygulama başlangıcında otomatik DDL çalıştırılmaz. API kullanılmadan önce hedef ortamda migration uygulanmalı ve yeni Prisma client üretilmelidir. Migration SQL'i bir kez uygulanır; tekrar çalıştırmak mevcut tablo hatası verir.

Mevcut projenin migration geçmişi hedef veritabanıyla uyumluysa standart migration sürecini kullanın. Geçmiş doğrulanmadan tüm bekleyen migration'ları prod'a uygulamayın. Yalnızca bu SQL dosyasını uygulamak mevcut Prisma migration geçmişini otomatik güncellemez; kullanılan deployment süreciyle kayıt durumu birlikte yönetilmelidir.

CDN yüklemesi mevcut `BUNNY_STORAGE_ZONE`, `BUNNY_STORAGE_PASSWORD`, `BUNNY_CDN_HOSTNAME` yapılandırmasını kullanır. Bu değerler frontend'e gönderilmez.

```bash
npx prisma generate
npm run api:build
node scripts/test-site-settings.cjs --run
```

Entegrasyon testi benzersiz bir PostgreSQL şemasında migration'ı ve HTTP akışlarını çalıştırır; başarıda ve hatada transaction geri alınır. Mevcut tablolara yazmaz, CDN yüklemesini taklit eder ve test şemasının kaldırıldığını doğrular. Test hesabının geçici şema oluşturma yetkisi bulunmalıdır.
