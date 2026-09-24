# Frontend listesinde bulunmayan backend API'leri

> Bu dosya temizlik öncesi envanterdir. Güncel sonuç: [65 endpoint kaldırıldı, 173 endpoint korundu](api-cleanup.md).

Tarih: 24 Eylül 2026. Kaynak: paylaşılan frontend endpoint listesi ve mevcut master dalının Express rota envanteri (`docs/api-route-inventory.json`). Karşılaştırma HTTP metodu + yol üzerinden yapıldı. `:productId`, `:id` ve `{id}` gibi parametre adları eşdeğer kabul edildi; metotlar ve `/api` öneki korunarak karşılaştırıldı. Satın alma bölümündeki kısa yollara belirtilen prefix eklendi.

## Sonuç

| Ölçüm | İşlem sayısı |
| --- | ---: |
| Backend'de kayıtlı HTTP işlemleri | 238 |
| Frontend listesindeki HTTP işlemleri | 169 |
| Frontend ile eşleşen backend işlemleri | 152 |
| Entegrasyonu planlanan yeni işlem | 1 |
| Frontend listesinde bulunmayan diğer işlemler | 85 |
| Bunlar içinde dış/sistem kullanımından dolayı ayrıca değerlendirilenler | 14 |
| Frontend kullanım adayı inceleme listesi | 71 |
| Frontend listesinde olup backend'de birebir kayıtlı olmayan işlemler | 17 |

Bu rapor çağrı/trafik kayıtlarına dayanmıyor. “Listede yok” kesin olarak kullanılmıyor veya silinebilir anlamına gelmez. Mobil istemci, entegrasyon, ödeme sağlayıcısı, QR bağlantısı veya manuel kullanım ayrıca kontrol edilmelidir. Bu ön inceleme hazırlandığında hiçbir endpoint kaldırılmamıştı; sonraki temizlik ayrı raporda açıklanır. Swagger arayüzünün kendi rotaları ve statik dosyalar iş API envanterine dahil değildir.

## Entegre edilecek yeni API — kullanılmayan listesine alınmadı

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| POST | `/api/admin/orders/{orderId}/advance` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |

Siparişleri statüye göre sayfalayan `GET /api/admin/orders-v2` ve `GET /api/admin/orders-v2/statuses` ile site ayarları/banner API'leri gönderilen frontend listesinde zaten var; bunlar eşleşenler içinde sayıldı. Alış fiyatı düzeltmeleri mevcut listelenen API'lerin davranışına ait.

## Frontend listesinde bulunmayan 71 işlem

### products

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/products/rules` | [src/routes/productRoutes.ts](../src/routes/productRoutes.ts) |
| GET | `/api/products/by-collection/{collectionId}` | [src/routes/productRoutes.ts](../src/routes/productRoutes.ts) |
| POST | `/api/products/{id}/regenerate-variations` | [src/routes/productRoutes.ts](../src/routes/productRoutes.ts) |
| POST | `/api/products/regenerate-variations/rule/{ruleId}` | [src/routes/productRoutes.ts](../src/routes/productRoutes.ts) |
| POST | `/api/products/regenerate-variations/all` | [src/routes/productRoutes.ts](../src/routes/productRoutes.ts) |
| POST | `/api/products/test-create` | [src/routes/productRoutes.ts](../src/routes/productRoutes.ts) |
| PATCH | `/api/products/{id}/stock-hybrid` | [src/routes/productRoutes.ts](../src/routes/productRoutes.ts) |

### collections

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| PUT | `/api/collections/{id}` | [src/routes/collectionRoutes.ts](../src/routes/collectionRoutes.ts) |

### price-lists

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/price-lists/collections/list` | [src/routes/priceListRoutes.ts](../src/routes/priceListRoutes.ts) |
| DELETE | `/api/price-lists/store-assignments/{id}` | [src/routes/priceListRoutes.ts](../src/routes/priceListRoutes.ts) |

### cart

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| DELETE | `/api/cart` | [src/routes/cartRoutes.ts](../src/routes/cartRoutes.ts) |
| POST | `/api/cart/admin/clean` | [src/routes/cartRoutes.ts](../src/routes/cartRoutes.ts) |

### Admin / orders

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| POST | `/api/admin/orders/{orderId}/assign-employee` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| GET | `/api/admin/orders/stats` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| GET | `/api/admin/orders/{orderId}/receipt` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| PUT | `/api/admin/orders/{orderId}/cancel` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| POST | `/api/admin/orders/{orderId}/confirm` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| POST | `/api/admin/orders/process-admin-order` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| POST | `/api/admin/orders/{orderId}/generate-qr` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| GET | `/api/admin/orders/{orderId}/qrcodes` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| GET | `/api/admin/orders/{orderId}/barcodes` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| POST | `/api/admin/orders/{orderId}/generate-barcode-images` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| GET | `/api/admin/orders/ready/with-barcodes` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |

### Admin / stores

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/admin/stores/{storeId}` | [src/admin/store-routes.ts](../src/admin/store-routes.ts) |
| DELETE | `/api/admin/stores/{storeId}` | [src/admin/store-routes.ts](../src/admin/store-routes.ts) |
| GET | `/api/admin/stores/{storeId}/price-lists` | [src/admin/store-routes.ts](../src/admin/store-routes.ts) |
| POST | `/api/admin/stores/{storeId}/price-lists` | [src/admin/store-routes.ts](../src/admin/store-routes.ts) |
| DELETE | `/api/admin/stores/{storeId}/price-lists/{priceListId}` | [src/admin/store-routes.ts](../src/admin/store-routes.ts) |

### Admin / product-rules

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| POST | `/api/admin/product-rules/{ruleId}/regenerate-variations` | [src/admin/product-rules-routes.ts](../src/admin/product-rules-routes.ts) |

### Admin / muhasebe

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/admin/muhasebe/admin-toplam` | [src/admin/muhasebe-routes.ts](../src/admin/muhasebe-routes.ts) |
| GET | `/api/admin/muhasebe/manuel-satislar` | [src/admin/muhasebe-routes.ts](../src/admin/muhasebe-routes.ts) |

### Admin / cart

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| POST | `/api/admin/cart/{targetUserId}/{storeId}/reset` | [src/admin/admin-cart-routes.ts](../src/admin/admin-cart-routes.ts) |

### Admin / barcode

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/admin/barcode/stats` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |

### Admin / employees

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/admin/employees/stats` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| GET | `/api/admin/employees/{employeeId}/stats` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |

### Admin / user-types

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/admin/user-types` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |

### Admin / export

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/admin/export/orders` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |

### auth

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| DELETE | `/api/auth/cleanup-tokens` | [src/auth/password-reset-routes.ts](../src/auth/password-reset-routes.ts) |

### stores

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/stores/{storeId}` | [src/admin/store-routes.ts](../src/admin/store-routes.ts) |
| GET | `/api/stores/{storeId}/price-lists` | [src/admin/store-routes.ts](../src/admin/store-routes.ts) |
| POST | `/api/stores/{storeId}/price-lists` | [src/admin/store-routes.ts](../src/admin/store-routes.ts) |
| DELETE | `/api/stores/{storeId}/price-lists/{priceListId}` | [src/admin/store-routes.ts](../src/admin/store-routes.ts) |
| GET | `/api/stores/{storeId}/users` | [src/admin/store-routes.ts](../src/admin/store-routes.ts) |

### Admin / manuel-satis

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/admin/manuel-satis/search-products` | [src/admin/manuel-satis-routes.ts](../src/admin/manuel-satis-routes.ts) |
| POST | `/api/admin/manuel-satis/create` | [src/admin/manuel-satis-routes.ts](../src/admin/manuel-satis-routes.ts) |
| POST | `/api/admin/manuel-satis/calculate-price` | [src/admin/manuel-satis-routes.ts](../src/admin/manuel-satis-routes.ts) |
| GET | `/api/admin/manuel-satis/list` | [src/admin/manuel-satis-routes.ts](../src/admin/manuel-satis-routes.ts) |
| GET | `/api/admin/manuel-satis/receipt/{fisNumarasi}` | [src/admin/manuel-satis-routes.ts](../src/admin/manuel-satis-routes.ts) |
| GET | `/api/admin/manuel-satis/{fisNumarasi}` | [src/admin/manuel-satis-routes.ts](../src/admin/manuel-satis-routes.ts) |
| DELETE | `/api/admin/manuel-satis/{fisNumarasi}` | [src/admin/manuel-satis-routes.ts](../src/admin/manuel-satis-routes.ts) |

### my-statistics

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/my-statistics/dashboard` | [src/routes/storeStatisticsRoutes.ts](../src/routes/storeStatisticsRoutes.ts) |
| GET | `/api/my-statistics/orders-over-time` | [src/routes/storeStatisticsRoutes.ts](../src/routes/storeStatisticsRoutes.ts) |
| GET | `/api/my-statistics/top-products` | [src/routes/storeStatisticsRoutes.ts](../src/routes/storeStatisticsRoutes.ts) |
| GET | `/api/my-statistics/totals` | [src/routes/storeStatisticsRoutes.ts](../src/routes/storeStatisticsRoutes.ts) |

### payments

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| POST | `/api/payments/checkout` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |
| POST | `/api/payments/create-request` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |
| GET | `/api/payments/result` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |
| GET | `/api/payments/status/{sellerReference}` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |

### employee-assignment

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/employee-assignment/form` | [src/routes/employeeAssignmentRoutes.ts](../src/routes/employeeAssignmentRoutes.ts) |
| GET | `/api/employee-assignment/employees` | [src/routes/employeeAssignmentRoutes.ts](../src/routes/employeeAssignmentRoutes.ts) |
| POST | `/api/employee-assignment/assign` | [src/routes/employeeAssignmentRoutes.ts](../src/routes/employeeAssignmentRoutes.ts) |
| GET | `/api/employee-assignment/stats` | [src/routes/employeeAssignmentRoutes.ts](../src/routes/employeeAssignmentRoutes.ts) |
| GET | `/api/employee-assignment/stats/{employeeId}` | [src/routes/employeeAssignmentRoutes.ts](../src/routes/employeeAssignmentRoutes.ts) |
| GET | `/api/employee-assignment/order/{orderId}` | [src/routes/employeeAssignmentRoutes.ts](../src/routes/employeeAssignmentRoutes.ts) |

### notifications

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| POST | `/api/notifications/send` | [src/routes/notificationRoutes.ts](../src/routes/notificationRoutes.ts) |
| GET | `/api/notifications/all` | [src/routes/notificationRoutes.ts](../src/routes/notificationRoutes.ts) |

### Admin / purchase-management

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| DELETE | `/api/admin/purchase-management/purchase-price-lists/{id}` | [src/routes/purchasePriceListRoutes.ts](../src/routes/purchasePriceListRoutes.ts) |
| GET | `/api/admin/purchase-management/purchases/{transaction_id}` | [src/routes/purchasePriceListRoutes.ts](../src/routes/purchasePriceListRoutes.ts) |
| GET | `/api/admin/purchase-management/statistics/purchases` | [src/routes/purchasePriceListRoutes.ts](../src/routes/purchasePriceListRoutes.ts) |

### public

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/public/catalog/collections/{collectionId}` | [src/routes/publicCatalogRoutes.ts](../src/routes/publicCatalogRoutes.ts) |

### contact

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| GET | `/api/contact/test-smtp` | [src/routes/contactFormRoutes.ts](../src/routes/contactFormRoutes.ts) |

### Ortak handler / alternatif URL ayrımı

`/api/stores` ile `/api/admin/stores` aynı store router'ını kullanıyor. Bir URL'nin listede bulunmaması ortak controller'ın kullanılmadığını göstermez. Örneğin `DELETE /api/admin/stores/{storeId}` listede yokken `DELETE /api/stores/:storeId` listede var; kullanıcı listeleme için de tersi geçerli. Bu rapor endpoint adreslerini sayar, kullanılmayan controller fonksiyonlarını saymaz.

## Frontend'den çağrılmasa da korunması gereken veya ayrıca kontrol edilecek 14 işlem

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| POST | `/api/admin/scan-qr` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| GET | `/api/admin/scan-qr` | [src/admin/admin-routes.ts](../src/admin/admin-routes.ts) |
| POST | `/api/payments/webhook/dbye` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |
| GET | `/api/payments/mobile/3ds/callback` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |
| POST | `/api/payments/mobile/3ds/callback` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |
| GET | `/api/payments/web/callback` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |
| POST | `/api/payments/web/callback` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |
| GET | `/api/payments/webhook/success` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |
| POST | `/api/payments/webhook/success` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |
| GET | `/api/payments/webhook/failure` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |
| POST | `/api/payments/webhook/failure` | [src/routes/paymentRoutes.ts](../src/routes/paymentRoutes.ts) |
| GET | `/` | [src/server.ts](../src/server.ts) |
| GET | `/healthz` | [src/server.ts](../src/server.ts) |
| GET | `/api` | [src/server.ts](../src/server.ts) |

- Ödeme servisindeki callback ve legacy success/failure adresleri `src/services/payment-service.ts` içinde ödeme sağlayıcısına verilen URL'lere yazılıyor. DBYE webhook'u sağlayıcı çağrıları için tanımlı; sağlayıcı ayarları ve trafik incelenmeden kaldırılmamalı.
- `/api/admin/scan-qr`, hem mevcut QR üretim servisinde hem yeni sipariş tamamlama servisinde QR görsellerine yazılan bağlantının hedefi. Özellikle GET rotası frontend listesinden bağımsız kullanılır; POST alternatifi ayrıca değerlendirilir.
- `GET /healthz`, `railway.toml` içindeki aktif healthcheck hedefidir. Kök ve `/api` rotaları sistem/API durum yanıtlarıdır; frontend ekran çağrılarından ayrı değerlendirilir.

## Frontend listesinde olup backend'de birebir bulunmayan 17 işlem

| Metot | Endpoint | Kaynak |
| --- | --- | --- |
| POST | `/api/products/by-ids` | — |
| GET | `/api/user-addresses` | — |
| POST | `/api/user-addresses` | — |
| PUT | `/api/user-addresses/:addressId` | — |
| DELETE | `/api/user-addresses/:addressId` | — |
| PUT | `/api/user-addresses/:addressId/set-default` | — |
| POST | `/api/admin/orders/cancel` | — |
| POST | `/api/admin/cut-types` | — |
| POST | `/products` | — |
| GET | `/products/:id` | — |
| PUT | `/products/:id` | — |
| DELETE | `/products/:id` | — |
| GET | `/collections/:collectionId/products` | — |
| GET | `/products/:productId/prices` | — |
| POST | `/prices` | — |
| PUT | `/prices/:priceId` | — |
| DELETE | `/prices/:priceId` | — |

- `POST /api/admin/orders/cancel` yerine backend'de `PUT /api/admin/orders/{orderId}/cancel` var. Mevcut frontend iptal akışında metot ve yol kontrol edilmeli.
- `POST /api/admin/cut-types` kayıtlı değil; kesim tipi router'ında GET/PUT/DELETE var.
- `POST /api/products/by-ids` ve `/api/user-addresses` yolları mevcut sunucu mount'larında bulunmuyor.
- Son bölümdeki `/api` öneksiz ürün/fiyat yolları birebir mevcut değil. Frontend HTTP istemcisinin baseURL veya proxy ile önek ekleyip eklemediği paylaşılmış listeden doğrulanamaz. Bu dokuz işlem için gerçek ağ isteği URL'si kontrol edilmeli; otomatik olarak `/api` eklenip eşleştirilmedi.
- Dinamik `/:id` rotasına yanlışlıkla düşmek, ilgili sabit endpoint'in uygulandığı anlamına gelmez.
