# Admin Sipariş Listesi API v2

Mevcut `GET /api/admin/orders` ve diğer sipariş API'leri değiştirilmemiştir. Yeni API'ler veritabanında statü filtresi ve sayfalama uygular. Migration veya veri güncellemesi gerekmez.

## Yetkilendirme

Her iki endpoint `Authorization: Bearer <ACCESS_TOKEN>` başlığı ve `admin` veya `editor` rolü gerektirir.

## Sipariş listesi

`GET /api/admin/orders-v2?status=CONFIRMED&page=1&limit=20`

| Parametre | Zorunlu | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `status` | Evet | Yok | Aşağıdaki statülerden biri; büyük/küçük harfe duyarlı. |
| `page` | Hayır | `1` | Pozitif tam sayı. |
| `limit` | Hayır | `20` | Sayfa başına 1–100 sipariş. |
| `userId` | Hayır | Yok | Belirli kullanıcının siparişleriyle sınırlar. |

| Statü | Anlamı |
| --- | --- |
| `PENDING` | Bekleyen |
| `CONFIRMED` | Onaylanan |
| `READY` | Hazır |
| `SHIPPED` | Gönderilen |
| `DELIVERED` | Teslim edilen |
| `CANCELED` | İptal edilen |

`ALL`, küçük harfli statüler ve tekrarlı/dizi parametreleri desteklenmez. Sıralama sabittir: `created_at DESC, id DESC`. `sortBy` ve `sortOrder` desteklenmez.

### İstek örneği

```bash
curl --get 'https://<API_HOST>/api/admin/orders-v2' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --data-urlencode 'status=CONFIRMED' \
  --data-urlencode 'page=1' \
  --data-urlencode 'limit=20'
```

### Başarılı yanıt (HTTP 200)

Boş sonuç örneği:

```json
{
  "success": true,
  "data": {
    "orders": [],
    "filters": { "status": "CONFIRMED", "userId": null },
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalCount": 0,
      "totalPages": 0,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

Dolu sonuçlarda `orders` içindeki her kayıtta siparişin temel alanları (`id`, `status`, `total_price`, `created_at` vb.) ve aşağıdaki ilişkiler bulunur:

| Alan | İçerik |
| --- | --- |
| `user` | Kimlik, ad/soyad, kullanıcı adı, e-posta, telefon, mağaza kimliği, `userType`, `Store`. Şifre gönderilmez. |
| `items` | Kalemler ve `product` bilgileri. `cut_type: rectangle`, yanıtta `standart` olur. |
| `address` | Sipariş adresi; yoksa `null`. |
| `qr_codes` | QR kayıtları, `order_item` ve ürün bilgileri. |
| `barcodes` | Barkod kayıtları, `order_item` ve ürün bilgileri; oluşturulma tarihine göre artan sırada. |
| `store_info` | Mağaza kimliği/adı, tipi/gösterim adı, para birimi, aktifliği, telefon/e-posta; mağaza yoksa `null`. |

Decimal tutarlar JSON'da metin olarak dönebilir. Hesaplama ve biçimlendirme için uygun dönüşüm kullanılmalıdır.

`totalCount` ve `totalPages` seçilen statüye ve varsa kullanıcı filtresine aittir. Son sayfa aşıldığında HTTP 200 ve boş `orders` döner; istenen sayfa korunur. `hasPrev`, `page > 1` koşuludur. Tek yanıtın kayıtları ve sayısı aynı veritabanı snapshot'ından okunur. Ayrı istekler arasında sipariş eklenir veya statü değişirse sayfa içerikleri kayabilir.

## Statü seçenekleri ve adetleri

`GET /api/admin/orders-v2/statuses`

Örnek HTTP 200 yanıtı; sayılar temsilidir:

```json
{
  "success": true,
  "data": [
    { "status": "PENDING", "count": 0 },
    { "status": "CONFIRMED", "count": 13 },
    { "status": "SHIPPED", "count": 0 },
    { "status": "DELIVERED", "count": 190 },
    { "status": "CANCELED", "count": 16 },
    { "status": "READY", "count": 0 }
  ]
}
```

Sıfır adetli statüler dahil altı statünün tamamı döner. Adetler tüm siparişlere aittir; liste endpoint'indeki `userId` ve seçili statüden bağımsızdır. Bu endpoint filtre parametresi desteklemez.

## Hatalar

| HTTP | Durum |
| --- | --- |
| `400` | Eksik/geçersiz statü, sayfalama veya kullanıcı filtresi. |
| `401` | Token eksik veya geçersiz. |
| `403` | Rol admin/editor değil. |
| `500` | Sipariş/statü sorgusu tamamlanamadı. |

Geçersiz statü yanıtı:

```json
{
  "success": false,
  "message": "Geçerli bir status zorunludur",
  "allowedStatuses": ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED", "READY"]
}
```

Geçersiz sayfalama yanıtı:

```json
{
  "success": false,
  "message": "page pozitif tam sayı, limit 1–100 arasında olmalıdır"
}
```

Çok büyük sayfa ofsetleri de HTTP 400 ile reddedilir.

## Frontend entegrasyonu

1. Statü seçeneklerini ve rozet sayılarını `/orders-v2/statuses` üzerinden al.
2. Başlangıç statüsünü seçip `page=1&limit=20` ile listeyi getir.
3. Statü, kullanıcı filtresi veya sayfa boyutu değiştiğinde `page` değerini `1` yap.
4. Tabloyu `data.orders`, sayfalamayı `data.pagination` ile oluştur.
5. Hızlı statü değişimlerinde eski isteği iptal et veya eski yanıtını görmezden gel.
6. Sipariş statüsü güncellendikten sonra listeyi ve statü adetlerini yenile.

```javascript
async function getOrders({ apiBase, token, status, page = 1, limit = 20, userId, signal }) {
  const query = new URLSearchParams({ status, page: String(page), limit: String(limit) });
  if (userId) query.set('userId', userId);
  const response = await fetch(`${apiBase}/api/admin/orders-v2?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Siparişler getirilemedi');
  return result.data;
}
```

Yeni listede eski endpoint'in `data.statistics` alanı yoktur; statü adetleri ayrı endpoint'ten alınır. Eski API tüketicileri aynı endpoint'lerle çalışmaya devam edebilir.

## Testler

```bash
npm run api:build
node scripts/test-order-list-v2.cjs
```

HTTP regresyon testi izole veritabanı mock'u kullanır; veritabanına yazmaz. Yetki, parametre doğrulama, filtreleme, sayfalama, boş sonuç, kalem dönüşümü ve statü adetleri için 33 kontrol içerir. Altı statü gerçek veritabanında yalnızca okuma yapılarak ayrıca doğrulanmıştır.
