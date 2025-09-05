# PASHA BACKEND SİSTEM DOKÜMANTASYONU

## 📋 Genel Bakış

**Pasha Backend**, Express.js ve Prisma ORM kullanarak geliştirilmiş, PostgreSQL veritabanı üzerinde çalışan kapsamlı bir e-ticaret ve mağaza yönetim sistemidir. Sistem, çoklu döviz desteği, gelişmiş stok yönetimi, barkod/QR kod takibi ve entegre ödeme çözümleri sunar.

## 🏗️ Sistem Mimarisi

### Teknoloji Stack'i

- **Runtime**: Node.js (v18.x)
- **Framework**: Express.js (v4.18.2)
- **Veritabanı**: PostgreSQL
- **ORM**: Prisma (v6.7.0)
- **Programlama Dili**: TypeScript (v5)
- **Kimlik Doğrulama**: JWT (jsonwebtoken)
- **Dosya Depolama**: Tebi S3-uyumlu Object Storage
- **Barkod/QR**: bwip-js (CODE128, EAN13), qrcode

### Proje Yapısı

```
pasha-backend/
├── src/
│   ├── admin/           # Admin panel işlemleri
│   ├── auth/            # Kimlik doğrulama servisleri
│   ├── controllers/     # İş mantığı kontrolörleri
│   ├── routes/          # API endpoint tanımları
│   ├── services/        # İş mantığı servisleri
│   ├── utils/           # Yardımcı araçlar
│   ├── tools/           # CLI araçları
│   └── scripts/         # Bakım scriptleri
├── prisma/
│   └── schema.prisma    # Veritabanı şeması
├── generated/           # Prisma client
├── uploads/            # Yerel dosya yüklemeleri
└── public/             # Statik dosyalar
```

## 💾 Veritabanı Modelleri

### Temel Modeller

#### 1. **User (Kullanıcı)**
- Farklı kullanıcı tipleri: Admin, Mağaza Kullanıcısı, Çalışan
- JWT tabanlı kimlik doğrulama
- Mağaza ilişkilendirmesi
- Fiyat görme yetkisi kontrolü

#### 2. **Store (Mağaza)**
- Çoklu döviz desteği (TRY, USD, EUR)
- Açık hesap ve limit yönetimi
- Taksit limitleri
- Mağaza tipleri: KARGO, SERVIS, KENDI_ALAN, AMBAR
- Bakiye takibi ve muhasebe entegrasyonu

#### 3. **Product (Ürün)**
- Koleksiyon bazlı organizasyon
- Çoklu varyasyon desteği (ebat, kesim tipi, saçak)
- Dinamik fiyatlandırma kuralları
- Stok yönetimi (m² bazlı)

#### 4. **Order (Sipariş)**
- Çoklu durum yönetimi: PENDING, CONFIRMED, SHIPPED, DELIVERED, READY, CANCELED
- Döviz kuru takibi
- QR kod ve barkod entegrasyonu
- Adres yönetimi

#### 5. **Cart (Sepet)**
- Normal ve admin sepet sistemi
- Ürün detaylı hesaplamalar (en, boy, m², birim fiyat)
- Kesim tipi ve saçak seçenekleri

### Finansal Modeller

#### 6. **PriceList (Fiyat Listesi)**
- Koleksiyon bazlı fiyatlandırma
- Döviz bazlı fiyat listeleri
- Geçerlilik tarihi yönetimi
- Limit tutarları

#### 7. **MuhasebeHareketleri**
- Tüm finansal işlemlerin kaydı
- Manuel satış desteği
- Döviz kuru takibi
- Fiş numarası sistemi

#### 8. **PaymentTransaction**
- Octet ödeme gateway entegrasyonu
- Webhook tabanlı durum güncelleme
- Döviz çevrimi desteği

### Takip Sistemleri

#### 9. **QRCode**
- Sipariş bazlı QR kod üretimi
- İki aşamalı okutma sistemi
- Çalışan takibi

#### 10. **Barcode**
- EAN13 ve CODE128 formatları
- Benzersiz barkod üretimi (869 Türkiye kodu)
- Çoklu okutma desteği

## 🔐 Güvenlik ve Kimlik Doğrulama

### JWT Token Sistemi
- Bearer token authentication
- Token blacklist mekanizması
- Rol bazlı yetkilendirme (RBAC)
- Otomatik token yenileme

### Middleware'ler
- `authMiddleware`: Token doğrulama
- `authorizeRoles`: Rol bazlı erişim kontrolü
- CORS koruması
- Rate limiting (hazır altyapı)

### Şifre Yönetimi
- Bcrypt ile şifre hashleme
- Şifre sıfırlama token sistemi
- E-posta ile şifre yenileme

## 🚀 API Endpoint'leri

### Kimlik Doğrulama
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Çıkış
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/forgot-password` - Şifre sıfırlama
- `POST /api/auth/reset-password` - Şifre yenileme

### Ürün Yönetimi
- `GET /api/products` - Ürün listesi
- `GET /api/products/:id` - Ürün detayı
- `POST /api/products` - Ürün ekleme (Admin)
- `PUT /api/products/:id` - Ürün güncelleme (Admin)
- `DELETE /api/products/:id` - Ürün silme (Admin)

### Sepet İşlemleri
- `GET /api/cart` - Sepet görüntüleme
- `POST /api/cart/add` - Sepete ürün ekleme
- `PUT /api/cart/update/:id` - Sepet öğesi güncelleme
- `DELETE /api/cart/remove/:id` - Sepetten çıkarma
- `POST /api/cart/clear` - Sepeti temizleme

### Sipariş Yönetimi
- `GET /api/orders` - Sipariş listesi
- `GET /api/orders/:id` - Sipariş detayı
- `POST /api/orders/create` - Sipariş oluşturma
- `PUT /api/orders/:id/status` - Durum güncelleme
- `POST /api/orders/:id/cancel` - Sipariş iptali
- `GET /api/orders/:id/receipt` - Fiş oluşturma

### Mağaza İşlemleri
- `GET /api/stores` - Mağaza listesi
- `GET /api/stores/:id` - Mağaza detayı
- `POST /api/stores` - Mağaza ekleme (Admin)
- `PUT /api/stores/:id/balance` - Bakiye güncelleme
- `GET /api/stores/:id/statistics` - İstatistikler

### Ödeme İşlemleri
- `POST /api/payments/checkout` - Ödeme başlatma
- `POST /api/payments/webhook` - Ödeme webhook
- `GET /api/payments/status/:id` - Ödeme durumu

### Admin Panel
- `GET /api/admin/dashboard` - Dashboard verileri
- `GET /api/admin/users` - Kullanıcı yönetimi
- `GET /api/admin/statistics` - Genel istatistikler
- `POST /api/admin/manuel-satis` - Manuel satış
- `GET /api/admin/muhasebe` - Muhasebe raporları
- `POST /api/admin/excel-export` - Excel dışa aktarım

### Bildirimler
- `GET /api/notifications` - Bildirim listesi
- `PUT /api/notifications/:id/read` - Okundu işaretle
- `DELETE /api/notifications/:id` - Bildirim silme

### QR/Barkod İşlemleri
- `POST /api/orders/:id/generate-qr` - QR kod oluştur
- `POST /api/orders/:id/generate-barcode` - Barkod oluştur
- `POST /api/scan/qr/:code` - QR kod okut
- `POST /api/scan/barcode/:code` - Barkod okut

## 💼 Servis Katmanı

### Temel Servisler

#### 1. **BarcodeService**
- EAN13 barkod üretimi (869 ülke kodu)
- CODE128 alternatif format desteği
- SVG görsel oluşturma
- Tebi'ye otomatik yükleme
- Çoklu okutma takibi

#### 2. **QRCodeService**
- Sipariş bazlı QR kod üretimi
- İki aşamalı okutma (hazırlama/teslim)
- Stok yönetimi entegrasyonu
- Çalışan performans takibi

#### 3. **PaymentService**
- Octet Payment Gateway entegrasyonu
- Web ve mobil kanal desteği
- Idempotency key yönetimi
- Webhook güvenliği
- Retry mekanizması

#### 4. **NotificationService**
- In-app bildirimler
- Sipariş durumu bildirimleri
- Ödeme bildirimleri
- Stok güncelleme bildirimleri
- Genişletilebilir yapı (SMS/Email/Push ready)

#### 5. **BalanceService**
- Mağaza bakiye yönetimi
- Döviz kuru desteği
- Otomatik bakiye güncelleme
- Sipariş iptali iade işlemleri
- USD mağaza özel mantığı

#### 6. **ExchangeRateService**
- TCMB kur entegrasyonu
- Alternatif API desteği
- 24 saatlik cache sistemi
- TRY ↔ USD/EUR çevrimleri

#### 7. **AuthService**
- JWT token yönetimi
- Bcrypt şifre hashleme
- Token blacklist kontrolü
- Kullanıcı oturum yönetimi

#### 8. **CartService**
- Normal ve admin sepet yönetimi
- Ürün validasyonu
- Fiyat hesaplamaları
- Sepet birleştirme

#### 9. **OrderService**
- Sipariş oluşturma ve validasyon
- Limit kontrolleri
- Bakiye kontrolleri
- Stok rezervasyonu
- Fiş formatları (mağaza tipine göre)

## 🔧 Özel Özellikler

### 1. **Çoklu Döviz Desteği**
- Mağaza bazlı döviz tanımı
- Otomatik kur çevrimi
- Muhasebe kayıtlarında döviz takibi
- USD mağazalar için özel limit bypass

### 2. **Admin Sepet Sistemi**
- Admin kullanıcıların müşteriler adına sepet oluşturması
- Sepet onaylama ve dönüştürme
- Not ve açıklama ekleme

### 3. **Manuel Satış**
- Kasa üzerinden direkt satış
- Fiş numarası sistemi
- Detaylı ürün kayıtları
- Muhasebe entegrasyonu

### 4. **Stok Yönetimi**
- m² bazlı stok takibi
- Varyasyon bazlı stok
- Otomatik stok düşürme/geri yükleme
- Kritik stok bildirimleri

### 5. **Çalışan Performans Takibi**
- QR kod okutma kayıtları
- Sipariş hazırlama istatistikleri
- Günlük/haftalık/aylık raporlar
- m² bazlı performans metrikleri

### 6. **Mağaza Tipleri ve Fiş Formatları**
- **KARGO**: Adres, telefon ve ürün bilgileri
- **SERVIS**: Müşteri adı, ürün, ebat, kesim türü
- **KENDI_ALAN**: Müşteri self-servis
- **AMBAR**: Depo yönetimi formatı

## 🔌 Entegrasyonlar

### 1. **Tebi Object Storage**
- S3 uyumlu API
- Görsel ve dosya yükleme
- CDN desteği
- Presigned URL'ler

### 2. **Octet Payment Gateway**
- Güvenli ödeme altyapısı
- Webhook bildirimleri
- Taksit seçenekleri
- PCI DSS uyumlu

### 3. **TCMB Döviz Kurları**
- Günlük kur güncellemeleri
- XML API entegrasyonu
- Fallback mekanizması

### 4. **Puppeteer**
- PDF oluşturma
- Dinamik fiş ve fatura üretimi
- Görsel raporlar

## 📊 İstatistik ve Raporlama

### Dashboard Metrikleri
- Toplam satışlar (günlük/haftalık/aylık)
- Mağaza bazlı analizler
- Ürün performansları
- Çalışan verimlilikleri

### Muhasebe Raporları
- Gelir/gider takibi
- Döviz bazlı raporlar
- Manuel satış kayıtları
- Bakiye mutabakatları

### Excel Dışa Aktarım
- Dinamik rapor oluşturma
- Çoklu sheet desteği
- Filtreleme ve sıralama
- Özelleştirilebilir kolonlar

## 🚦 Sistem Limitleri ve Performans

### Teknik Limitler
- Maximum dosya boyutu: 10MB
- Sepet öğe limiti: 100 ürün
- API rate limit: 100 req/dakika (hazır altyapı)
- Token süresi: 24 saat

### Performans Optimizasyonları
- Database indexing
- Query optimization (Prisma)
- Cache mekanizmaları
- Lazy loading
- Memory management (GC optimizasyonu)
- Large catalog support (15 dakika timeout)

## 🛠️ Bakım ve Yönetim

### CLI Araçları
- `create-admin-user`: Admin kullanıcı oluşturma
- `fix-qrcode-employee`: QR kod düzeltmeleri
- `deleteOrdersByDate`: Tarih bazlı sipariş silme
- `generateBarcodesForOldOrders`: Geriye dönük barkod üretimi

### Çevre Değişkenleri
```env
# Veritabanı
DATABASE_URL=postgresql://...

# Sunucu
PORT=3001
PUBLIC_URL=https://api.example.com
NODE_ENV=production

# JWT
JWT_SECRET=your-secret-key

# Tebi Storage
TEBI_ACCESS_KEY=...
TEBI_SECRET_KEY=...
TEBI_BUCKET_NAME=pashahome
TEBI_ENDPOINT=https://s3.tebi.io
TEBI_REGION=global

# Octet Payment
OCTET_API_URL=https://api.octet.com.tr
OCTET_WEBHOOK_SECRET=...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...

# TCMB
EXCHANGE_API_KEY=...
```

## 📈 Gelecek Geliştirmeler

### Planlanan Özellikler
- Push notification entegrasyonu
- SMS bildirimleri
- Gelişmiş raporlama dashboard'u
- Mobil uygulama API'leri
- Webhook yönetim paneli
- Otomatik backup sistemi
- Elasticsearch entegrasyonu
- Redis cache layer
- GraphQL endpoint'leri
- Mikroservis mimarisine geçiş

## 📝 Notlar

- Sistem production ortamında Railway.app üzerinde deploy edilmektedir
- PostgreSQL veritabanı bulut üzerinde barındırılmaktadır
- Görsel dosyalar Tebi Object Storage'da saklanmaktadır
- Sistem 24/7 uptime için optimize edilmiştir
- Tüm kritik işlemler loglama sistemine sahiptir

---

**Versiyon**: 0.1.0  
**Son Güncelleme**: Eylül 2024  
**Lisans**: Private