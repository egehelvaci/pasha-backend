# Ortak stok düzeltmeleri ve veri geçişi

## Davranış

- Hazır/kesme eşleşmeleri aynı koleksiyon ve açık stok biçimi eki çıkarılmış aynı ad üzerinden bulunur. Benzer isimler tahmin edilerek birleştirilmez.
- Eski Product kayıtları ve sipariş/QR bağlantıları silinmez. `canonical_product_id` eski ID'yi ana ürüne yönlendirir. Listeler ana ürünleri, eski ID ile detay çağrısı ana ürünün detayını döndürür.
- Ana ürün için birleşik ölçü/kesim kuralı oluşturulur; paylaşılan eski kurallar değiştirilmez. Lotlar ve stok hareketleri korunarak tek havuza taşınır.
- Sipariş oluşturma, finansal kayıtlar, stok düşümü ve sepet kapatma tek transaction'dadır. İptal de aynı bütünlüğü kullanır. Bildirimler commit sonrasındadır.
- Sipariş/accounting transaction'ları advisory lock ile sıralanır. Bu sürüm doğruluğu önceler; yoğun trafikte kilit beklemesi ölçülmelidir.
- Sepet rezervasyonları SQL trigger'larıyla item ve sepet aktifliği değişikliklerine aynı transaction içinde bağlıdır. Eksi stok siparişine izin verildiğinden rezervasyonlar fiziksel stokla sınırlanmaz.
- Doğrudan satın alma ve satın alma sepeti ortak stoğu artırır. Manuel satış, stok okuma ve hibrit admin stok güncellemesi aynı m² kaynağını kullanır.
- `20260924080000_width_based_product_stock` ile kaynak m² stok ürün kuralındaki enlere ayrılır. Hazır ve özel boy aynı eni kullanıyorsa aynı FIFO havuzunu tüketir; farklı enler birbirini etkilemez. Eksi stok her en için ayrı izlenir.
- Migration eski ürünleri de dönüştürür, ürün toplamını korur ve toplam ile en havuzları uyuşmazsa rollback olur. Kullanıcı, koleksiyon, mağaza, sipariş ve sipariş kalemi tablolarına yazmaz.
- Tekrar tüketimde hem FIFO lotu hem shortage referansı kontrol edilir. İade kayıtlı tüketim miktarını ve eski FIFO lotlarını kullanır. Geçişten eski siparişlerde ortak tüketim geçmişi bulunmadığından ölçü/adet alanı iade edilir.

## Güvenli geçiş sırası

1. `prisma migrate deploy`: additive alias alanı ve rezervasyon trigger'ları.
2. Yeni backend sürümünün canlı ürün cevabında `canonicalProductId` alanının bulunduğunu doğrula.
3. `npm run stock:verify -- --baseline`: stok/lot/hareket/rezervasyon eşitliği ve korunan iş kayıtlarının içerik özetleri.
4. `npm run stock:merge`: yalnızca plan ve hash üretir.
5. `npm run stock:merge -- --rehearse --expected-hash=<hash>`: tüm birleşimi uygular, doğrular, transaction'ı geri alır.
6. `npm run stock:merge -- --apply --expected-hash=<hash>`: değişmemiş planı kilit altında kalıcı uygular.
7. `npm run stock:verify -- --compare`: kullanıcı/koleksiyon/mağaza/sipariş/kalem içeriklerinin ve toplam stokun korunduğunu karşılaştırır.
8. Eski ID detayını, ana ürün listesini ve hazır/özel ölçü seçeneklerini canlı API'den doğrula.

## 24 Eylül 2026 canlı geçiş sonucu

- Backend: `https://pashahomeapps.up.railway.app`; yeni sürümün alias alanını döndürdüğü doğrulandıktan sonra veri geçişi uygulandı.
- Üç SİSAL PLUS hazır/kesme çifti birleştirildi. Fiziksel Product kayıt sayısı 169 kaldı; görünür ana ürün sayısı 166, eski ID yönlendirmesi sayısı 3 oldu.
- Toplam stok geçiş öncesi ve sonrası `762290.64 m²`. Stok hareketi, FIFO lotu ve aktif rezervasyon eşitliği kontrolünde hata bulunmadı.
- 208 kullanıcı, 35 koleksiyon, 190 mağaza, 223 sipariş ve 445 sipariş kaleminin satır içerik özetleri başlangıç kaydıyla aynı kaldı.
- Veritabanı resetlenmedi; eski ürün ve geçmiş işlem kayıtları silinmedi. `.env` commitlenmedi.

PowerShell/npm sürümüne göre `npm run ... -- --apply` parametreleri aktarılmayabilir. Çıktıdaki `apply` alanını mutlaka kontrol edin. Doğrudan çalıştırma:

```powershell
node node_modules/ts-node/dist/bin.js src/scripts/merge-common-products.ts --apply --expected-hash=<dry-run-hash>
node scripts/verify-common-rollout.cjs --compare
```

## Test kapsamı

`scripts/test-stock-migrations.cjs` migration ve normal sepet rezervasyonlarını transaction içinde deneyip rollback eder. `scripts/test-common-stock.cjs` yalnızca kendisinin UUID ile oluşturduğu geçici ürünlerde shortage tekrarını, negatif bakiye sonrası satın almayı, eş zamanlı tüketimi, FIFO iadesini ve hata halinde transaction rollback'ini sınar; sonunda bu geçici ürünleri kaldırır. `scripts/test-order-stock.cjs` normal/admin sepet ve doğrudan admin siparişlerini, rezervasyon çözülmesini, bakiye değişimini, iptal ve tekrar iptali sınar; tüm verisini geri alır.

Testler `.env` içindeki veritabanını kullanır; otomatik CI için ayrı test veritabanı ayarlanmalıdır. Gerçek siparişlerde deneme yapılmaz. Eski varyasyon sayıları birleşimden sonra stok kaynağı veya fiziksel stok toplamı olarak kullanılmamalıdır; `stock:verify` güncel kaynağı denetler.
