# Ortak Ürün Stoğu

Bu branch'te yeni oluşturulan ürünler tek ürün seviyesinde ortak m² stok kullanır. Hazır ebat, özel ölçü, kesim türü ve saçak seçimleri stok çeşidi değildir; seçilen alan ürünün ortak stoğundan düşer.

## Geçiş davranışı

`20260924020000_common_product_stock` migration'ı ortak stok tablolarını oluşturur. `20260924030000_migrate_legacy_product_stock` migration'ı mevcut ürünlerin legacy varyasyon stoklarını ürün seviyesinde m² stoğuna aktarır. Varyasyon satırları silinmez; ortak stok kaydı oluşturulduktan sonra stok kaynağı `product_stocks` olur. Aynı fiziksel genişlik/yükseklik birden fazla kesim veya saçak varyasyonunda bulunuyorsa yalnızca en yüksek değer aktarılır.

Migration öncesi veya sonrasında aktarım toplamını kontrol etmek için aşağıdaki salt-okunur audit çalıştırılabilir:

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
