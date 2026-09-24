# Kullanılmayan API temizliği

24 Eylül 2026. Kullanıcının tüm istemcileri kapsadığını doğruladığı frontend listesi esas alındı. Başlangıç sürümü: bfd388c.

238 kayıtlı HTTP işleminden 65'i kaldırıldı; 173 işlem korundu. Kaldırılan rotalara özel 59 controller handler'ı, bunların constructor bind'ları ve kullanılmayan import'ları temizlendi. Boşalan manuel satış router/controller dosyaları, kullanılmayan Excel export controller'ı ve eski admin çalışan istatistik controller'ı kaldırıldı. Kullanılan servis fonksiyonları ve veritabanı tabloları korunur; migration gerektirmez.

## Korunan bağımlılıklar

Önceki rapordaki 71 adaydan aşağıdaki 6 işlem korundu:

| Metot | Endpoint |
| --- | --- |
| POST | `/api/admin/orders/{orderId}/assign-employee` |
| PUT | `/api/admin/orders/{orderId}/cancel` |
| GET | `/api/employee-assignment/form` |
| POST | `/api/employee-assignment/assign` |
| DELETE | `/api/admin/stores/{storeId}` |
| GET | `/api/stores/{storeId}/users` |

- Admin çalışan atama endpoint'i, korunan QR okutma controller'ının döndürdüğü HTML içinden çağrılır.
- Çalışan atama formu backend tarafından sunulur ve kendi atama endpoint'ini çağırır. Bu iki rota birlikte korundu.
- Sipariş iptalinin gerçek backend adresi korundu: frontend listesindeki `POST /api/admin/orders/cancel` adresi zaten kayıtlı değildi; gerçek adres `PUT /api/admin/orders/{orderId}/cancel`.
- İki mağaza adresi kullanılan ortak router'ın diğer mount'larıdır. Ortak controller davranışını değiştirmemek için korundu.
- Önceki rapordaki 14 ödeme callback/webhook, QR okutma ve sistem endpoint'i korundu. Railway healthcheck ve yeni sipariş ilerletme API'si aktiftir.
- Yeni sipariş V2, site ayarları/banner ve alış fiyatı API'leri korunur. Fiş/QR/barkod/stok servisleri, endpoint'i kaldırılan bir controller'ın da kullanması nedeniyle silinmedi.

## Kaldırılan işlemler

| Metot | Endpoint |
| --- | --- |
| GET | `/api/products/rules` |
| GET | `/api/products/by-collection/{collectionId}` |
| POST | `/api/products/{id}/regenerate-variations` |
| POST | `/api/products/regenerate-variations/rule/{ruleId}` |
| POST | `/api/products/regenerate-variations/all` |
| POST | `/api/products/test-create` |
| PATCH | `/api/products/{id}/stock-hybrid` |
| PUT | `/api/collections/{id}` |
| GET | `/api/price-lists/collections/list` |
| DELETE | `/api/price-lists/store-assignments/{id}` |
| DELETE | `/api/cart` |
| POST | `/api/cart/admin/clean` |
| GET | `/api/admin/orders/stats` |
| GET | `/api/admin/orders/{orderId}/receipt` |
| POST | `/api/admin/orders/{orderId}/confirm` |
| POST | `/api/admin/orders/process-admin-order` |
| POST | `/api/admin/orders/{orderId}/generate-qr` |
| GET | `/api/admin/orders/{orderId}/qrcodes` |
| GET | `/api/admin/orders/{orderId}/barcodes` |
| POST | `/api/admin/orders/{orderId}/generate-barcode-images` |
| GET | `/api/admin/barcode/stats` |
| GET | `/api/admin/orders/ready/with-barcodes` |
| GET | `/api/admin/employees/stats` |
| GET | `/api/admin/employees/{employeeId}/stats` |
| GET | `/api/admin/user-types` |
| GET | `/api/admin/export/orders` |
| GET | `/api/admin/stores/{storeId}` |
| GET | `/api/stores/{storeId}` |
| GET | `/api/admin/stores/{storeId}/price-lists` |
| GET | `/api/stores/{storeId}/price-lists` |
| POST | `/api/admin/stores/{storeId}/price-lists` |
| POST | `/api/stores/{storeId}/price-lists` |
| DELETE | `/api/admin/stores/{storeId}/price-lists/{priceListId}` |
| DELETE | `/api/stores/{storeId}/price-lists/{priceListId}` |
| POST | `/api/admin/product-rules/{ruleId}/regenerate-variations` |
| GET | `/api/admin/muhasebe/admin-toplam` |
| GET | `/api/admin/muhasebe/manuel-satislar` |
| POST | `/api/admin/cart/{targetUserId}/{storeId}/reset` |
| DELETE | `/api/auth/cleanup-tokens` |
| GET | `/api/admin/manuel-satis/search-products` |
| POST | `/api/admin/manuel-satis/create` |
| POST | `/api/admin/manuel-satis/calculate-price` |
| GET | `/api/admin/manuel-satis/list` |
| GET | `/api/admin/manuel-satis/receipt/{fisNumarasi}` |
| GET | `/api/admin/manuel-satis/{fisNumarasi}` |
| DELETE | `/api/admin/manuel-satis/{fisNumarasi}` |
| GET | `/api/my-statistics/dashboard` |
| GET | `/api/my-statistics/orders-over-time` |
| GET | `/api/my-statistics/top-products` |
| GET | `/api/my-statistics/totals` |
| POST | `/api/payments/checkout` |
| POST | `/api/payments/create-request` |
| GET | `/api/payments/result` |
| GET | `/api/payments/status/{sellerReference}` |
| GET | `/api/employee-assignment/employees` |
| GET | `/api/employee-assignment/stats` |
| GET | `/api/employee-assignment/stats/{employeeId}` |
| GET | `/api/employee-assignment/order/{orderId}` |
| POST | `/api/notifications/send` |
| GET | `/api/notifications/all` |
| DELETE | `/api/admin/purchase-management/purchase-price-lists/{id}` |
| GET | `/api/admin/purchase-management/purchases/{transaction_id}` |
| GET | `/api/admin/purchase-management/statistics/purchases` |
| GET | `/api/public/catalog/collections/{collectionId}` |
| GET | `/api/contact/test-smtp` |

## Doğrulama

- Kalan 173 API'nin parametre, request body, response, JWT ve rol sözleşmeleri başlangıç sürümüyle karşılaştırılır.
- Değişen dosyalardaki korunan 123 fonksiyonun gövdesi başlangıç sürümüyle birebir aynı doğrulandı (satır sonu farkları hariç).
- Gerçek Express rota kayıtları Swagger ile karşılaştırılır; rota sırası nedeniyle başka bir handler'ın arkasında kalan endpoint kontrolü yapılır.
- Swagger HTML/JavaScript/OpenAPI JSON HTTP testleri ve TypeScript derlemesi çalıştırılır.
- Sipariş V2 için 33 kontrol; sipariş ilerletme için izole PostgreSQL şemasında 67 kontrol çalıştırılır. Testler mevcut siparişleri teslim etmez veya canlı CDN'e görsel yüklemez.

~~~sh
npm run api:build
npm run test:api-cleanup
node scripts/test-order-list-v2.cjs
node scripts/test-order-fulfillment.cjs --run
~~~

`docs/api-cleanup-contract.json`, temizlikten önce alınan sözleşme özeti ve kaldırılan rota listesidir. Bilinçli yeni API/sözleşme değişikliklerinde bu baseline ayrıca gözden geçirilmelidir; test hatasını susturmak için otomatik güncellenmemelidir.

Paylaşılan listede backend'de zaten bulunmayan 17 işlem bu temizliğin sonucu değildir; ayrıntılar [ön inceleme raporundadır](frontend-unused-api-report.md). Gerçek frontend kaynak kodu ve canlı trafik bu çalışmada mevcut olmadığından uçtan uca tüm istemciler için mutlak sıfır risk iddiası yapılmaz. Üretim veritabanında şema/veri değişikliği gerekmez.
