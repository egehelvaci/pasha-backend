# Admin sipariş filtreleri

`GET /api/admin/orders?page=1&limit=20&store_id=<STORE_UUID>&order_statu=delivered`

- `store_id`: Opsiyonel mağaza UUID'si (`store_info.store_id`). Siparişi veren kullanıcının mağazası üzerinden filtreler. `1234` gibi UUID olmayan değerler HTTP 400 döner.
- `order_statu`: Opsiyonel sipariş durumu. `PENDING`, `CONFIRMED`, `READY`, `SHIPPED`, `DELIVERED`, `CANCELED` değerlerini büyük/küçük harf ayrımı olmadan kabul eder.
- Mevcut `status` parametresi de desteklenir. `status` ve `order_statu` birlikte gönderilirse aynı durumu belirtmelidir.
- Mağaza, durum ve mevcut `userId` filtreleri birlikte uygulanabilir. Filtreyi kaldırmak için ilgili parametreyi göndermeyin. Boş, tekrarlı/dizi veya geçersiz filtre değerleri HTTP 400 döner.

Filtreleme veritabanında, sayfalamadan önce uygulanır. `data.pagination.totalCount` ve `totalPages` filtrelenmiş sonuçlara aittir. Eşleşme yoksa `orders: []`, `totalCount: 0` ve `totalPages: 0` döner.

Mevcut yanıt yapısı korunur. `data.statistics` önceki gibi tüm siparişlerin genel durum sayılarını içerir; filtrelerden bağımsızdır. Yetkilendirme değişmez: admin/editor rolü gerekir.

Frontend filtre değiştiğinde `page=1` ile yeniden istek atmalı, tabloyu `data.orders` ve sayfalamayı `data.pagination` üzerinden oluşturmalıdır. Filtreleme yalnızca eldeki 20 kayıt üzerinde yapılmamalıdır.

Örnekler:

```text
/api/admin/orders?page=1&limit=20&order_statu=delivered
/api/admin/orders?page=1&limit=20&store_id=4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5
/api/admin/orders?page=2&limit=20&store_id=4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5&order_statu=delivered
```

Doğrulama: `npm run api:build` ve `node scripts/test-admin-order-filters.cjs`. Testler izole mock kullanır; veritabanına bağlanmaz.
