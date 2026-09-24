# Swagger / OpenAPI

Backend adresinin sonuna `/api/docs/` ekleyerek Swagger UI açılır. OpenAPI JSON: `/api/openapi.json`. Aynı JSON dosyası repoda `src/docs/openapi.json` konumundadır; Postman veya başka OpenAPI araçlarına aktarılabilir.

Doküman, sunucuda kayıtlı 238 HTTP işlemini (188 yol) kapsar. Eski API'ler, yeni statü filtreli sipariş listeleme, site ayarları/banner ve admin sipariş ilerletme API'si birlikte listelenir. Sunucuya bağlanmamış route dosyaları kapsam dışındadır. Swagger'ın kendi dosya servisleri envantere dahil değildir.

## Frontend kullanımı

1. `/api/auth/login` ile giriş yapın.
2. Swagger'da **Authorize** düğmesine yalnızca JWT değerini girin; `Bearer` öneki otomatik eklenir.
3. İlgili işlemin query/path parametrelerini veya request body alanlarını doldurun.
4. **Try it out / Execute** gerçek backend isteği gönderir. Yazma işlemleri çalıştırılan ortamın verisini değiştirir.

Sunucu adresi aynı origin üzerinden belirlenir. Token tarayıcıda kalıcı saklanmaz. Arayüz açılması kendi başına sipariş, stok veya bakiye işlemi başlatmaz. Swagger dosyaları herkese açıktır; API'lerin mevcut JWT ve rol kontrolleri geçerliliğini korur.

Multipart dosya yüklemeleri, JSON gövdeleri, yetkiler, parametreler ve yanıt şemaları tanımlıdır. Kaynak koddan çıkarılamayan dinamik yanıt alanları açık nesne olarak gösterilir. Şemalar runtime doğrulama katmanı değildir; controller kuralları geçerlidir.

Yeni güvenli sipariş ilerletme isteğinin ayrıntıları: [order-fulfillment.md](order-fulfillment.md). Eski statü değiştirme endpoint'i de geriye uyumluluk için listede bulunur.

## Geliştirme

```sh
npm run docs:generate
npm run docs:check
npm run api:build
```

Üretici Express mount'larını ve TypeScript controller'larını statik olarak okur. Dinamik gövdeler ve özel sözleşmeler `scripts/openapi-overrides.cjs` dosyasında tamamlanır. API değişikliklerinde JSON ve `docs/api-route-inventory.json` yeniden üretilip commit edilmelidir.

Kontrol komutu OpenAPI standardını doğrular, gerçek Express kayıtlarıyla endpoint kapsamını karşılaştırır ve yerel HTTP üzerinden Swagger HTML, JavaScript ve JSON sunumunu test eder. İş API'lerine istek göndermez. Swagger eklenmesi veritabanı migration'ı gerektirmez; sipariş ilerletme API'sinin ayrı migration'ı kendi dokümanında açıklanmıştır.
