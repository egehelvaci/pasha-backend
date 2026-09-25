# Ortak Ürün Stoğu

Tüm ürünler en bazlı ortak m² stok kullanır. Enler ürünün `productsizeoptions` kuralından dinamik gelir. Aynı endeki hazır ebat ve özel boy tek havuzu paylaşır; farklı enler bağımsızdır. Kesim türü ve saçak stok çeşidi değildir.

## Geçiş davranışı

`20260924020000_common_product_stock` migration'ı ortak stok tablolarını, `20260924030000_migrate_legacy_product_stock` ürün toplamlarını, `20260924080000_width_based_product_stock` ise en havuzlarını oluşturur. Varyasyon satırları silinmez. Aynı fiziksel genişlik/yükseklik birden fazla kesim veya saçak varyasyonunda bulunuyorsa yalnızca en yüksek değer aktarılır; sonra aynı en altındaki ölçüler toplanır. Migration ürün toplamının en toplamına eşit olmadığını görürse transaction'ı durdurur.

Migration öncesi veya sonrasında aktarım toplamını kontrol etmek için aşağıdaki salt-okunur audit çalıştırılabilir:

```bash
npm run stock:audit
```

## Stok davranışı

- Ürün detayında geriye dönük uyumlu toplamlar ile `stock.widths[]` en bakiyeleri döner.
- Hazır ebat için adet, kendi en havuzunun alanının seçilen ebat alanına bölünmesiyle hesaplanır.
- Sipariş ortak stoktan fazla olsa da oluşturulur; `availableAreaM2` negatif olabilir.
- FIFO lotları mevcut pozitif stoktan tüketilir. Açık kalan miktar negatif stok hareketi olarak audit edilir.
- Satın alma girişi önce negatif bakiyeyi kapatır, yalnızca kalan miktarı yeni FIFO lotu yapar.
- Sipariş iptali, siparişe ait alanı idempotent bir iade hareketiyle geri ekler.

Mevcut `stockQuantity` ve `stockAreaM2` alanları legacy istemciler için korunur; değerleri ilgili en havuzundan hesaplanır. Ürün toplam alanları tüm enlerin toplamıdır.
