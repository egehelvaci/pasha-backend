# Ortak Ürün Stoğu

Bu branch'te yeni oluşturulan ürünler tek ürün seviyesinde ortak m² stok kullanır. Hazır ebat, özel ölçü, kesim türü ve saçak seçimleri stok çeşidi değildir; seçilen alan ürünün ortak stoğundan düşer.

## Geçiş davranışı

`20260924020000_common_product_stock` migration'ı yalnızca yeni tabloları oluşturur. Mevcut ürünlere otomatik stok aktarımı yapmaz. Mevcut ürünler `productvariations` üzerindeki legacy stok mantığıyla çalışmaya devam eder. Yeni ürün oluşturulduğunda `product_stocks` kaydı otomatik açılır.

Mevcut ürünleri ileride aktarmadan önce aşağıdaki salt-okunur audit çalıştırılmalıdır:

```bash
npm run stock:audit
```

## Stok davranışı

- Ürün detayında `stock.availableAreaM2`, `stock.reservedAreaM2` ve `stock.consumableAreaM2` alanları döner.
- Hazır ebat için adet, ortak alanın seçilen ebat alanına bölünmesiyle hesaplanır.
- Sipariş ortak stoktan fazla olsa da oluşturulur; `availableAreaM2` negatif olabilir.
- FIFO lotları mevcut pozitif stoktan tüketilir. Açık kalan miktar negatif stok hareketi olarak audit edilir.
- Satın alma girişi önce negatif bakiyeyi kapatır, yalnızca kalan miktarı yeni FIFO lotu yapar.
- Sipariş iptali, siparişe ait alanı idempotent bir iade hareketiyle geri ekler.

Mevcut `stockQuantity` ve `stockAreaM2` alanları legacy istemciler için korunur; ortak stok etkin ürünlerde bu alanlar ortak m² üzerinden uyumluluk görünümü olarak hesaplanır.
