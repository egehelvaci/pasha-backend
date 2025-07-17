Muhasebe Hareketleri Yönetim Sistemi PRD
Versiyon: 1.0
Tarih: 17.07.2025
Yazar: Gemini

1. Amaç (Purpose)
Bu dokümanın amacı, bir "Admin" (Merkez) ile ona bağlı "Mağazalar" arasındaki tüm finansal işlemleri (gelir/gider) kaydetmek, takip etmek ve raporlamak için geliştirilecek olan "Muhasebe Hareketleri Admin API" sisteminin gereksinimlerini ve iş mantığını tanımlamaktır. Sistem, tüm muhasebe hareketlerinin merkezi bir noktadan yönetilmesini ve her bir mağazanın merkeze olan net borç/alacak durumunun (cari hesap) doğru bir şekilde hesaplanmasını sağlayacaktır.

2. Kapsam (Scope)
Kapsam Dahilinde Olanlar
Tüm muhasebe hareketlerinin listelenmesi için bir API (GET).

Yeni bir muhasebe hareketi eklemek için bir API (POST).

Yeni bir hareket eklendiğinde ilgili bakiyelerin (Admin Kasa ve Mağaza Cari) otomatik olarak güncellenmesi.

Admin'in mağazalardan olan toplam alacağının hesaplanması.

Kapsam Dışında Olanlar
Kullanıcı yetkilendirme ve kimlik doğrulama (Authentication/Authorization).

Mevcut muhasebe hareketlerini düzenleme (PUT/PATCH) veya silme (DELETE).

Detaylı kullanıcı arayüzü (UI) tasarımları.

3. Temel Kavramlar ve Varlıklar (Core Concepts & Entities)
Sistemin doğru çalışması için aşağıdaki kavramların net bir şekilde anlaşılması kritiktir:

Muhasebe Hareketi: Sisteme kaydedilen her bir finansal işlem (örn: fatura ödemesi, satış, maaş).

Admin: Tüm sistemi yöneten, paranın toplandığı ve dağıtıldığı merkezi varlık.

Mağaza: Admin'e bağlı, kendi operasyonlarını yürüten alt birimler.

Admin Kasa Bakiyesi: Admin'in (merkezin) elindeki toplam nakit varlığını ifade eden tek bir bakiye. Sisteme giren her para bu bakiyeyi artırır, çıkan her para azaltır.

Mağaza Cari Bakiyesi: Bir mağazanın Admin'e (merkeze) olan net borç/alacak durumunu gösterir. Bu, mağazanın kendi kasasındaki para değildir.

Negatif Bakiye (-): Mağaza, Admin'e borçludur.

Pozitif Bakiye (+): Mağaza, Admin'den alacaklıdır.

Sıfır Bakiye (0): Mağaza ile Admin arasında borç/alacak ilişkisi yoktur.

İşlem Türleri: Önceden tanımlanmış gelir (incomeTypes) ve gider (expenseTypes) kategorileri.

4. API Spesifikasyonları (API Specifications)
4.1. Tüm Muhasebe Hareketlerini Getir (GET)
Tüm muhasebe hareketlerinin listesini döner.

Endpoint: GET /api/admin/muhasebe-hareketleri

Başarılı Yanıt (200 OK):

JSON

[
  {
    "id": 1,
    "storeId": "store-001",
    "islemTuru": "Parekende Satış",
    "tutar": 2500.00,
    "harcama": false,
    "tarih": "2025-07-17T10:00:00Z",
    "aciklama": "Mağaza satışı"
  },
  {
    "id": 2,
    "storeId": "store-002",
    "islemTuru": "Kira / Aidat Giderleri",
    "tutar": 10000.00,
    "harcama": true,
    "tarih": "2025-07-17T11:30:00Z",
    "aciklama": "Depo kira ödemesi"
  }
]
4.2. Yeni Muhasebe Hareketi Ekle (POST)
Yeni bir muhasebe hareketi oluşturur ve ilgili bakiyeleri günceller.

Önemli Not: Request body'de harcama alanı bulunmamalıdır. Bu değer, seçilen islemTuru'ne göre sunucu tarafında otomatik olarak belirlenecektir. Bu, veri tutarlılığını garanti eder.

Endpoint: POST /api/admin/muhasebe-hareketleri

Request Body:

JSON

{
  "storeId": "store-003",
  "islemTuru": "Personel Maaş Ödemesi",
  "tutar": 15000.00,
  "tarih": "2025-07-17T14:00:00Z",
  "aciklama": "Ağustos ayı avans ödemesi"
}
Alan Doğrulama Kuralları:

storeId: Zorunlu, string.

islemTuru: Zorunlu, string. Sistemde tanımlı incomeTypes veya expenseTypes listelerinden birinde bulunmalıdır.

tutar: Zorunlu, numeric, 0'dan büyük olmalıdır.

tarih: Zorunlu, geçerli bir tarih formatı (ISO 8601).

aciklama: Zorunlu, string.

Başarılı Yanıt (201 Created):

JSON

{
  "id": 3,
  "storeId": "store-003",
  "islemTuru": "Personel Maaş Ödemesi",
  "tutar": 15000.00,
  "harcama": true, // Sunucu tarafından belirlendi
  "tarih": "2025-07-17T14:00:00Z",
  "aciklama": "Ağustos ayı avans ödemesi"
}
Hata Yanıtları:

400 Bad Request: Eksik veya geçersiz formatta alan gönderilirse.

422 Unprocessable Entity: islemTuru sistemde tanımlı değilse.

5. İş Mantığı ve Akışlar (Business Logic and Flows)
5.1. Yeni Hareket Oluşturma Akışı
Bir POST isteği geldiğinde sistem arka planda şu adımları izlemelidir:

Girdi Doğrulama: Gelen isteğin gövdesindeki tüm alanların zorunluluk, tür ve format kurallarına uyup uymadığını kontrol et. Hata varsa 400 Bad Request dön.

İşlem Türü Kontrolü: Gelen islemTuru'nün incomeTypes veya expenseTypes listelerinden birinde olup olmadığını kontrol et. Değilse 422 Unprocessable Entity dön.

harcama Değerini Belirle:

Eğer islemTuru expenseTypes listesindeyse, harcama = true olarak ayarla.

Eğer islemTuru incomeTypes listesindeyse, harcama = false olarak ayarla.

Veritabanı Kaydı: MuhasebeHareketi tablosuna yeni kaydı oluştur.

Bakiyeleri Güncelle: Aşağıdaki "Bakiye Güncelleme Mantığı"na göre ilgili bakiyeleri güncelle.

Yanıt Dön: Oluşturulan yeni muhasebe hareketini 201 Created durumuyla yanıt olarak dön.

5.2. Bakiye Güncelleme Mantığı (En Kritik Bölüm)
Her işlem, hem Admin Kasa Bakiyesi'ni hem de ilgili Mağaza Cari Bakiyesi'ni etkiler.

Senaryo A: Mağaza için yapılan bir HARCAMA (Örn: Elektrik Faturası)
İşlem: store-001 için 500 TL'lik Elektrik Gideri hareketi ekleniyor.

API İsteği: {"storeId": "store-001", "islemTuru": "Elektrik...", "tutar": 500, ...}

Arka Plan Mantığı:

Bu bir harcamadır (harcama: true).

Para Admin'in kasasından çıkar. Admin Kasa Bakiyesi -= 500.

Bu harcama store-001 adına yapıldığı için mağaza Admin'e borçlanır. store-001 Cari Bakiye -= 500. (Bakiyesi daha da negatif olur).

Senaryo B: Mağazadan gelen bir GELİR (Örn: Parekende Satış)
İşlem: store-001 2.000 TL'lik Parekende Satış yapıyor.

API İsteği: {"storeId": "store-001", "islemTuru": "Parekende Satış", "tutar": 2000, ...}

Arka Plan Mantığı:

Bu bir gelirdir (harcama: false).

Para Admin'in kasasına girer. Admin Kasa Bakiyesi += 2000.

Bu gelir store-001 aracılığıyla elde edildiği için mağazanın Admin'deki alacağı artar. store-001 Cari Bakiye += 2000. (Bakiyesi daha da pozitif olur veya borcu azalır).

Senaryo C: Mağazaya BORÇ VERME
İşlem: Admin, store-002'ye 10.000 TL borç veriyor. islemTuru: 'Borç Verme' (expenseTypes içinde).

Arka Plan Mantığı: Bu işlem, Senaryo A ile tamamen aynıdır.

Para Admin kasasından çıkar: Admin Kasa Bakiyesi -= 10000.

store-002 Admin'e borçlanır: store-002 Cari Bakiye -= 10000.

Senaryo D: Mağazadan BORÇ TAHSİLATI
İşlem: Admin, store-002'den 3.000 TL borç tahsil ediyor. islemTuru: 'Borç Tahsilatı' (incomeTypes içinde).

Arka Plan Mantığı: Bu işlem, Senaryo B ile tamamen aynıdır.

Para Admin kasasına girer: Admin Kasa Bakiyesi += 3000.

store-002'nin Admin'e olan borcu azalır: store-002 Cari Bakiye += 3000.

6. Hesaplamalar (Calculations)
6.1. Admin'in Toplam Alacağı
Admin'in tüm mağazalardan olan toplam alacağını hesaplamak için:

Tüm mağazaların Mağaza Cari Bakiyesi değerlerini al.

Sadece negatif olan bakiyeleri seç.

Bu negatif bakiyelerin mutlak değerlerini (abs()) topla.

Formül: Toplam Alacak = Σ |bakiye|  (tüm bakiye < 0 olanlar için)

7. Veritabanı Modeli Önerisi (Suggested Database Model)
SQL

-- Muhasebe hareketlerinin tutulduğu ana tablo
CREATE TABLE MuhasebeHareketleri (
    id INT PRIMARY KEY AUTO_INCREMENT,
    storeId VARCHAR(255) NOT NULL,
    islemTuru VARCHAR(255) NOT NULL,
    tutar DECIMAL(10, 2) NOT NULL,
    harcama BOOLEAN NOT NULL,
    tarih DATETIME NOT NULL,
    aciklama TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mağazaların ve Admin'e olan cari bakiyelerinin tutulduğu tablo
CREATE TABLE Magazalar (
    id VARCHAR(255) PRIMARY KEY,
    magazaAdi VARCHAR(255) NOT NULL,
    cari_bakiye DECIMAL(12, 2) NOT NULL DEFAULT 0.00 -- Mağazanın Admin'e olan net borç/alacak durumu
);

-- Admin'in ana kasa bakiyesini tutmak için basit bir tablo
CREATE TABLE AdminVarliklari (
    id INT PRIMARY KEY,
    kasa_bakiyesi DECIMAL(15, 2) NOT NULL DEFAULT 0.00
);