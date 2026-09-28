# Sipariş gönderici bilgileri

`GET /api/admin/orders/:orderId` yanıtındaki `data.sender_info`, gönderici ana mağazanın bilgilerini döndürür. Gönderici bölümü adres için `data.sender_info.address` kullanmalıdır.

Gönderici mağaza: `4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5`. Adres, bu mağazanın aktif varsayılan `StoreAddress` kaydından her istekte okunur; adres metni sabit değildir. Mağaza veya aktif varsayılan adres bulunamazsa `sender_info` null döner.

Alanlar: `store_id`, `kurum_adi`, `telefon`, `eposta`, `address_id`, `title`, `address`, `city`, `district`, `postal_code`.

Paylaşılan Ana Mağaza kaydı için `address_id` değeri `81de204a-5902-4c93-bb2d-bc055ab512d9`, `address` değeri `Güneşli, Mahmutbey Cd. No:145 D:147, 34212 Bağcılar/İstanbul` olur. `postal_code` null olabilir.

`data.address` siparişin teslimat adresidir; `data.store_info` siparişi veren müşterinin mağazasını gösterir. Bu alanların anlamı değişmez.
