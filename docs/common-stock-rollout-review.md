# Ortak stok düzeltmeleri ve veri geçişi

## Davranış

- Hazır/kesme eşleşmeleri aynı koleksiyon ve açık stok biçimi eki çıkarılmış aynı ad üzerinden bulunur. Benzer isimler tahmin edilerek birleştirilmez.
- Eski Product kayıtları ve sipariş/QR bağlantıları silinmez. `canonical_product_id` eski ID'yi ana ürüne yönlendirir. Listeler ana ürünleri, eski ID ile detay çağrısı ana ürünün detayını döndürür.
- Ana ürün için birleşik ölçü/kesim kuralı oluşturulur; paylaşılan eski kurallar değiştirilmez. Lotlar ve stok hareketleri korunarak tek havuza taşınır.
- Sipariş oluşturma, finansal kayıtlar, stok düşümü ve sepet kapatma tek transaction'dadır. İptal de aynı bütünlüğü kullanır. Bildirimler commit sonrasındadır.
- Sipariş/accounting transaction'ları advisory lock ile sıralanır. Bu sürüm doğruluğu önceler; yoğun trafikte kilit beklemesi ölçülmelidir.
- Sepet rezervasyonları SQL trigger'larıyla item ve sepet aktifliği değişikliklerine aynı transaction içinde bağlıdır. Eksi stok siparişine izin verildiğinden rezervasyonlar fiziksel stokla sınırlanmaz.
- Doğrudan satın alma ve satın alma sepeti ortak stoğu artırır. Manuel satış, stok okuma ve hibrit admin stok güncellemesi aynı m² kaynağını kullanır.
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

## Testler

`scripts/test-stock-migrations.cjs` migration ve normal sepet rezervasyonlarını transaction içinde deneyip rollback eder. `scripts/test-common-stock.cjs` yalnızca kendisinin UUID ile oluşturduğu geçici ürünlerde shortage tekrarını, negatif bakiye sonrası satın almayı, eş zamanlı tüketimi, FIFO iadesini ve hata halinde transaction rollback'ini sınar; sonunda bu geçici ürünleri kaldırır. `scripts/test-order-stock.cjs` normal/admin sepet ve doğrudan admin siparişlerini, rezervasyon çözülmesini, bakiye değişimini, iptal ve tekrar iptali sınar; tüm verisini geri alır.

Testler `.env` içindeki veritabanını kullanır; otomatik CI için ayrı test veritabanı ayarlanmalıdır. Gerçek siparişlerde deneme yapılmaz. Eski varyasyon sayıları birleşimden sonra stok kaynağı veya fiziksel stok toplamı olarak kullanılmamalıdır; `stock:verify` güncel kaynağı denetler.
