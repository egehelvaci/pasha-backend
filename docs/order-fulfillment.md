# Admin sipariş ilerletme / teslim tamamlama API'si

## Endpoint

```http
POST /api/admin/orders/:orderId/advance
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

Bu endpoint admin'in QR/barkod okutma yerine siparişi onaylayarak ilerletmesi içindir. Token rolü ve veritabanındaki kullanıcının aktif admin olması kontrol edilir. Editor ve müşteri kullanamaz. Mevcut statü, onaylama, okutma ve fiş endpoint'leri korunmuştur.

```json
{
  "requestId": "c6b52d54-9e57-4b26-a4cd-7199fe33a7d9",
  "expectedStatus": "PENDING",
  "targetStatus": "DELIVERED",
  "reason": "Admin panelinden teslimat tamamlandı"
}
```

| Alan | Açıklama |
| --- | --- |
| `requestId` | Zorunlu UUID. Kullanıcı eylemi başına bir kez üretin. Ağ hatası/yeniden denemede aynı ID ve aynı gövdeyi kullanın. |
| `expectedStatus` | Zorunlu; frontend'de son görülen sipariş statüsü. Güncel statü farklıysa 409 döner. |
| `targetStatus` | `CONFIRMED`, `READY`, `SHIPPED`, `DELIVERED`. |
| `reason` | İsteğe bağlı açıklama, en fazla 500 karakter. İşlem kaydında tutulur. |

Sıra `PENDING → CONFIRMED → READY → SHIPPED → DELIVERED` şeklindedir. Admin ileri aşamaları atlayabilir; örneğin `PENDING → DELIVERED` desteklenir. Geriye geçiş veya `CANCELED` sipariş üzerinde işlem reddedilir. `SHIPPED` zorunlu ara aşama değildir. Güncel statü hedef statüyle aynıysa eksik etiketleri tamamlama desteklenir; `expectedStatus` yine güncel durum olmalıdır.

## Yapılan işlemler

1. Admin yetkisi, istek kimliği, statü ve kalem/etiket tutarlılığı kontrol edilir.
2. Her sipariş kalemi için eksik QR/barkod ve görseller hazırlanır. Mevcut kod kimlikleri ve dolu görsel URL'leri korunur. Yeni barkodlar geçerli kontrol basamaklı EAN13'tür.
3. Görseller mevcut Bunny CDN'e yüklenir. Yükleme başarısızsa sipariş/statü/etiket kayıtlarına yazılmaz.
4. Transaction içinde sipariş, kalem ve mevcut etiket satırları kilitlenir. Hazırlık sırasında sipariş veya etiketler değişmişse 409 döner.
5. Eksik etiketler kalem bazında eklenir. `READY` ve sonrası için hazırlama alanları tamamlanır; `DELIVERED` için QR/barkod tamamlanma bayrakları ve sayaçları kalem miktarına eşitlenir. Mevcut okutma aktörleri/tarihleri korunur, boş tamamlanma alanlarında admin ve işlem zamanı kullanılır.
6. Statü güncellenir. Mevcut çalışan ataması korunur; varsa çalışan istatistiğinin statü/hazırlanan/teslim edilen alanları güncellenir. Otomatik çalışan ataması yapılmaz.
7. Mevcut fiş formatlayıcısıyla fiş verisi aynı transaction içinde hazırlanır. Fiş hazırlanamazsa statü ve etiket yazımları geri alınır.
8. İşlemi yapan admin, önceki/hedef statü, açıklama ve yanıt `order_fulfillment_actions` tablosuna kaydedilir.

Tamamlanmış sayaçlar bu endpoint'te fiziksel okutma yapıldığı anlamına gelmez. `manualCompletion: true` ve işlem tablosu admin tamamlamasını belirtir.

### Stok ve bakiye

Mevcut sistem stok düşümünü ve mali işlemleri sipariş oluşturulurken yapar. Bu endpoint stok, mağaza bakiyesi veya muhasebe tutarlarını yeniden değiştirmez; çift stok düşümüne veya ikinci tahsilata yol açmaz. `stockChanged: false` bunu ifade eder.

Eski siparişlerin stok düşümünü kanıtlayan ayrı bir hareket kaydı bulunmadığından bu endpoint geçmişte başarısız olmuş stok düşümlerini otomatik tahmin edip düzeltmez. Böyle bir sipariş için stok/muhasebe incelemesi ayrı yapılmalıdır.

### Fiş ve etiket görselleri

Fiş, yanıtta JSON olarak hazırlanır; frontend mevcut fiş şablonuyla yazdırır. Bu işlem PDF veya fiziksel çıktı üretmez ve `receipt_printed` değerini otomatik `true` yapmaz. Önceden yazdırılmış fiş bilgisi korunur.

Gerçek yazdırmadan sonra mevcut `PUT /api/orders/:orderId/mark-printed` kullanılabilir. Yeni fiş almak için `GET /api/admin/orders/:orderId/receipt` kullanılabilir. Fişin bakiye alanları mevcut fiş servisinin hesaplama kurallarını kullanır; geçmiş bir bakiye hareketinin birebir snapshot'ı olduğu varsayılmamalıdır.

Görseller dış depoda, kayıtlar veritabanında olduğundan CDN ve DB tek transaction değildir. CDN yüklemesinden sonra DB hatası veya eşzamanlılık çatışması olursa kullanılmayan görsel dosyaları kalabilir; sipariş işlemi kısmen kaydedilmez. Eksik görseller için yapılandırılmış `PUBLIC_URL` ve Bunny erişimi gereklidir.

## Başarılı yanıt

HTTP 200. Aşağıda sadece temel alanlar gösterilmiştir; `receipt`, `qr_codes` ve `barcodes` gerçek yanıtta içerikleriyle döner.

```json
{
  "success": true,
  "data": {
    "requestId": "c6b52d54-9e57-4b26-a4cd-7199fe33a7d9",
    "previousStatus": "PENDING",
    "manualCompletion": true,
    "stockChanged": false,
    "replayed": false,
    "order": {
      "id": "siparis-id",
      "status": "DELIVERED",
      "receipt_printed": false,
      "receipt_printed_at": null,
      "qr_codes": [],
      "barcodes": []
    },
    "receipt": {}
  }
}
```

`qr_codes[*].qrCodeImageUrl` ve `barcodes[*].barcode_image_url` görsellerin adresleridir.

## Tekrar istek ve eşzamanlılık

Aynı `requestId`, aynı admin/sipariş ve aynı gövdeyle tekrar çağrılırsa saklanan başarılı sonuç `replayed: true` ile döner. Tekrar stok, bakiye, etiket veya statü işlemi yapılmaz. Aynı ID farklı istek için kullanılırsa HTTP 409 döner. Saklanan sonuç o eylemin sonucudur; sonraki işlemlerden sonra güncel statü için siparişi yeniden okuyun.

Yeni endpoint'in eşzamanlı çağrıları sipariş kilidiyle sıraya alınır. Etiket hazırlığı sırasında değişiklik olursa işlem reddedilir. Eski statü/okutma API'lerinin tümü bu geçiş kurallarını uygulamaz; aynı sipariş için frontend'in paralel eski ve yeni tamamlama akışları çalıştırmaması gerekir. Bu yeni API eski API'lerin mevcut kusurlarını geriye dönük olarak düzeltmez.

```javascript
const body = {
  requestId: crypto.randomUUID(),
  expectedStatus: order.status,
  targetStatus: 'DELIVERED',
  reason: 'Admin teslim onayı'
};
// Yeniden denemelerde body nesnesini/aynı requestId'yi koruyun.
const response = await fetch(`${apiBase}/api/admin/orders/${order.id}/advance`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});
const result = await response.json();
if (!response.ok) throw new Error(result.message);
// Sipariş listesini ve statü adetlerini yenileyin; result.data.receipt yazdırılabilir.
```

## Hatalar

| HTTP / kod | Açıklama |
| --- | --- |
| 400 `INVALID_REQUEST` | UUID/statü/alan doğrulaması başarısız. |
| 401 | Token eksik veya geçersiz. |
| 403 `ADMIN_REQUIRED` | Kullanıcı aktif admin değil. |
| 404 `ORDER_NOT_FOUND` | Sipariş yok. |
| 409 `ORDER_CANCELED` / `BACKWARD_TRANSITION` | İptal edilmiş sipariş veya geriye geçiş. |
| 409 `STATUS_CONFLICT` / `ORDER_CHANGED` | Veri değişmiş; siparişi yenileyip yeni eylem başlatın. |
| 409 `IDEMPOTENCY_CONFLICT` | requestId başka istek için kullanılmış. |
| 409 `LABEL_CONFLICT` | Sahipsiz/mükerrer/yanlış ürünle eşleşen etiket veya fazla okutma sayacı. Kayıtlar incelenmeli. |
| 409 `CONCURRENT_CHANGE` | Eşzamanlı işlem; aynı istekle yeniden deneyin. |
| 502 `LABEL_IMAGE_FAILED` | Görsel üretimi/yüklemesi başarısız; veritabanı değiştirilmedi. |
| 500 | İşlem/fiş hatası; transaction geri alınır. Bağlantı sonucu belirsizse aynı requestId ile tekrar sorgulanabilir. |

## Migration ve test

Yeni işlem tablosu için `prisma/migrations/20260924010000_order_fulfillment/migration.sql` hazırlanmıştır. Reset veya stok/bakiye veri dönüşümü gerektirmez. Hedef ortamda yeni API kullanılmadan önce migration kontrollü uygulanmalı ve Prisma client üretilmelidir. Eski migration geçmişi doğrulanmadan topluca migration çalıştırılmamalıdır.

```bash
npx prisma generate
node scripts/apply-order-fulfillment-migration.cjs
node scripts/apply-order-fulfillment-migration.cjs --apply
npm run api:build
node scripts/test-order-fulfillment.cjs --run
```

Entegrasyon testi benzersiz bir PostgreSQL test şeması oluşturur; mevcut şemaları veya siparişleri değiştirmez. Gerçek transaction, eşzamanlı HTTP isteği, kısmi etiket tamamlama, hata halinde rollback, idempotency, fiş ve stok/bakiye korunmasını test eder. CDN yüklemeleri taklit edilir; ayrıca QR/barkod PNG üretimi çalıştırılır. Test sonunda yalnızca kendisinin oluşturduğu şema silinir.
