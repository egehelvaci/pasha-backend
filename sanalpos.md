Proje: Octet Ödeme Entegrasyonu için Ara Katman Servisi
Doküman Sürümü: 1.0
Tarih: 16 Temmuz 2025

1. Proje Özeti
Bu doküman, mevcut e-ticaret platformumuzun ödeme altyapısını Octet Ortak Ödeme Sayfası API'si ile entegre etmek amacıyla geliştirilecek olan ara katman (middleware) servisinin gereksinimlerini tanımlar. Bu servis, frontend (web/mobil) uygulamalarımız ile Octet API'si arasında bir köprü görevi görecek; güvenlik, konfigürasyon ve iş mantığını merkezileştirecektir.

2. Amaç ve Gerekçe
Mevcut durumda, ödeme altyapısını doğrudan frontend'den yönetmek çeşitli riskler ve zorluklar barındırmaktadır.

Güvenlik: Octet API'sinin gerektirdiği partnerCode ve özellikle secretKey gibi hassas bilgilerin frontend tarafında bulunması ciddi bir güvenlik açığı oluşturur. 

secretKey asla istemci tarafında bilinmemeli ve gizli tutulmalıdır.


Karmaşıklık: securityKey hash'inin oluşturulması gibi işlemlerin frontend'de yapılması, iş mantığının dağıtılmasına ve bakımın zorlaşmasına neden olur. 

Esneklik: Gelecekte ödeme sağlayıcısını değiştirmek veya yeni kurallar eklemek, frontend kodunda büyük değişiklikler gerektirecektir.

Bu ara katman servisi, tüm bu işlemleri kendi bünyesinde toplayarak frontend'in sadece basit ve güvenli endpoint'leri çağırmasını sağlayacak, böylece daha güvenli, yönetilebilir ve esnek bir mimari oluşturacaktır.

3. Hedefler
Frontend'in doğrudan Octet API'si ile iletişim kurmasını engellemek.


secretKey ve diğer hassas konfigürasyon bilgilerini güvenli bir şekilde backend'de saklamak.

Başarılı ve başarısız ödeme senaryolarını yönetmek ve doğrulamak.

Frontend geliştirme sürecini basitleştirmek.

4. Kullanıcı Akışları
4.1. Başarılı Ödeme Akışı
Kullanıcı, frontend'de sepetini onaylar ve "Ödeme Yap" butonuna tıklar.

Frontend, sepet bilgileri ve kullanıcı bilgileri ile ara katman servisinin /initiate-payment endpoint'ine bir istek gönderir.

Ara katman servisi, bu bilgilerle Octet'in 

CREATE_COMMON_PAYMENT_PAGE_REQUEST metodunu çağırır.

Ara katman servisi, Octet'ten dönen 

commonPaymentPageURL'i frontend'e yanıt olarak döner.

Frontend, kullanıcıyı bu URL'e yönlendirir.

Kullanıcı, Octet ödeme sayfasında bilgilerini girer ve ödemeyi tamamlar.

Octet, kullanıcıyı talepte belirtilen 

returnPage (ara katman servisindeki /payment-callback adresi) adresine yönlendirir.

Ara katman servisi (/payment-callback), Octet'ten gelen ilk bilgiyi kaydeder ve kullanıcıyı frontend'deki "Ödeme Alındı, Doğrulanıyor..." gibi bir sayfaya yönlendirir.

Frontend'deki bu sayfa, ara katman servisinin /payment-status endpoint'ini periyodik olarak çağırarak ödemenin nihai durumunu sorgular.

Ara katman servisi (

/payment-status), Octet'in GET_COMMON_PAYMENT_REQUEST metodunu kullanarak ödemenin durumunu güvenli bir şekilde sunucudan sunucuya teyit eder.



Ödeme onaylandığında, frontend kullanıcıya "Ödemeniz Başarıyla Alındı" mesajını gösterir.

5. Ara Katman API Gereksinimleri
Endpoint 1: Ödeme Başlatma
Metot: POST

Endpoint: /api/v1/payment/initiate

Amaç: Frontend'den gelen sepet ve kullanıcı bilgileriyle Octet üzerinde bir ödeme oturumu başlatmak.

Frontend'den Gelen Request Body (Örnek):

JSON

{
  "items": [
    {"name": "Ürün A", "price": 150.75, "quantity": 1},
    {"name": "Ürün B", "price": 50.00, "quantity": 2}
  ],
  "buyerInfo": {
    "name": "Ahmet",
    "surname": "Yılmaz",
    "email": "ahmet.yilmaz@example.com",
    "phone": "00905551234567",
    "tckn": "12345678901"
  },
  "orderId": "SIPARIS-12345"
}
İş Mantığı:

Request body'deki verileri alır.

Toplam ödeme tutarını (paymentAmount) hesaplar.

orderId'yi Octet apiReferenceID alanı için kullanır. Bu değer tekil olmalıdır.

Gerekli tüm parametreleri (partnerCode, buyerName, currency vb.) birleştirerek Octet için 

CREATE_COMMON_PAYMENT_PAGE_REQUEST isteğini hazırlar.


Backend'de saklanan 

secretKey ile securityKey hash'ini hesaplar.

Octet API'sine isteği gönderir.

Octet'ten gelen 

commonPaymentPageURL'i ayıklar.

Başarılı Response (200 OK):

JSON

{
  "paymentUrl": "https://<octet-url>/..."
}
Endpoint 2: Ödeme Sonucu Geri Bildirimi (Callback)
Metot: POST

Endpoint: /api/v1/payment/callback


Amaç: Octet'in ödeme sonrası kullanıcıyı ve veriyi yönlendireceği returnPage adresi olmak.

İş Mantığı:

Bu endpoint, Octet 

CREATE... isteğindeki returnPage parametresine set edilmelidir.

Octet tarafından POST edilen verileri alır (

resultStatus, resultData vb.).

apiReferenceID (bizim orderId'miz) ile ilgili siparişin durumunu veritabanında "Doğrulama Bekliyor" olarak günceller.

Kullanıcıyı, ödeme sonucunu gösterecek olan frontend sayfasına yönlendirir (örn: https://bizimsite.com/odeme-sonuc?orderId=SIPARIS-12345).


ÖNEMLİ: Bu adımdaki verilere güvenilerek sipariş "Tamamlandı" olarak işaretlenmemelidir. Asıl doğrulama sunucudan sunucuya yapılmalıdır.



Endpoint 3: Ödeme Durumu Sorgulama
Metot: GET

Endpoint: /api/v1/payment/status/:orderId


Amaç: Bir siparişin ödeme durumunu güvenli bir şekilde sorgulayıp frontend'e bildirmek.

İş Mantığı:

URL'den orderId'yi alır (:orderId -> apiReferenceID).

Octet'in 

GET_COMMON_PAYMENT_REQUEST metodu için gerekli parametreleri hazırlar (action, partnerCode, apiReferenceID).

Backend'de saklanan 

secretKey ile bu isteğe özel securityKey hash'ini hesaplar.

Octet API'sine sunucudan sunucuya (S2S) isteği gönderir.

Octet'ten dönen nihai ve güvenilir sonucu (

resultStatus, resultData vb.) alır.

Veritabanındaki sipariş durumunu bu güvenilir sonuca göre günceller ("Başarılı", "Hatalı" vb.).

Başarılı Response (200 OK):

JSON

{
  "orderId": "SIPARIS-12345",
  "status": "SUCCESS", // veya "ERROR", "PENDING"
  "message": "Ödeme başarıyla doğrulandı."
}
6. Teknik ve Güvenlik Gereksinimleri
Gizli Anahtar Yönetimi: partnerCode ve secretKey gibi bilgiler, servis yapılandırmasında (örn: environment variables) güvenli bir şekilde saklanmalıdır. Asla istemciye gönderilmemelidir.


İstek Doğrulama: Octet'e gönderilecek her istek için securityKey hash'i, dokümanda belirtilen formata uygun olarak sunucu tarafında oluşturulmalıdır.


Sunucudan Sunucuya Onay: Siparişin nihai durumu, sadece ve sadece GET_COMMON_PAYMENT_REQUEST metodu ile yapılacak sunucudan sunucuya doğrulama sonrasında kesinleşmelidir.


Loglama: Tüm istek ve yanıtlar (hem iç sistem hem de Octet ile olanlar), hata ayıklama ve takip için detaylı bir şekilde loglanmalıdır. Hassas veriler (kart numarası vb.) loglarda maskelenmelidir.

7. Kapsam Dışı
Para iadesi (Refund) işlemleri bu fazın kapsamı dışındadır.

Ödeme sayfasının arayüz (UI) tasarımı.

Birden fazla ödeme sağlayıcı yönetimi.

8. Dış Bağımlılıklar
Octet Ortak Ödeme API'sinin çalışır ve erişilebilir durumda olması.

Octet tarafından sağlanan 

API URL, partnerCode ve secretKey bilgileri.