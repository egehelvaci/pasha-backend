# Arakatman Ödeme Yönetim Sistemi - PRD

## 1. Amaç

Bu belge, Octet Ortak Ödeme Sayfası API'si kullanılarak geliştirilecek bir ödeme arakatmanı sisteminin işlevsel gereksinimlerini tanımlar. Sistem, taksitli ödeme desteğiyle birlikte admin panelinden ödeme başlatılmasını, mağaza seçimiyle işlem yapılmasını, mağaza bakiyelerinin güncellenmesini ve muhasebe hareketlerinin kaydını sağlar.

---

## 2. Kullanıcı Tipleri

- **Admin:** Ödeme başlatabilir, mağaza seçebilir, maksimum taksit sınırları tanımlayabilir.
- **Mağaza Kullanıcısı:** Kendisi için oluşturulmuş ödeme sayfası üzerinden ödeme yapabilir.

---

## 3. Özellikler

### 3.1. Admin Paneli

#### 3.1.1. Ödeme Oluşturma

- Admin, ödeme oluştururken aşağıdaki bilgileri girer:
  - Mağaza (dropdown)
  - Ödeme Tutarı
  - Para Birimi (TRY/USD/EUR)
  - Maksimum Taksit Seçeneği (1–12 arası)
  - Açıklama (opsiyonel)
- API üzerinden `CREATE_COMMON_PAYMENT_PAGE_REQUEST` çağrısı yapılır.
- Admin, mağaza adına ödeme oluşturabilir.

#### 3.1.2. Maksimum Taksit Belirleme

- Admin, her mağaza için maksimum taksit limiti tanımlar (örneğin: Mağaza A → max 6 taksit).
- Taksit bilgisi, Octet API'de:
  - `consumerCardInstallmentLimit`
  - `commercialCardInstallmentLimit`
  alanlarında iletilecek.
- API çağrısına ek olarak `&installmentStyle=ddl` eklenecek, taksit seçenekleri dropdown şeklinde sunulacak.

### 3.2. Mağaza Tarafı

#### 3.2.1. Ödeme Sayfası

- Mağazaya oluşturulan ödeme linki gönderilir.
- Mağaza kendi bilgileriyle ödeme yapar.
- Ödeme sayfasında:
  - Ad, Soyad, Telefon, Email vb. bilgiler otomatik dolu gelir.
  - Sadece admin tarafından tanımlanan maksimum taksite kadar seçenek gösterilir.

#### 3.2.2. Ödeme Sonrası

- Ödeme sonucu `returnPage` ile sunucuya POST edilir.
- Güvenlik amacıyla `GET_COMMON_PAYMENT_REQUEST` çağrısıyla ödeme teyit edilir.
- Başarılı işlemde:
  - İlgili mağaza bakiyesi güncellenir.
  - Muhasebe hareket tablosuna kayıt oluşturulur.

---

## 4. Veri Akışı

1. Admin → Ödeme oluşturur (`POST /api/payment/initiate`)
2. Sistem → Octet API'ye `CREATE_COMMON_PAYMENT_PAGE_REQUEST` gönderir.
3. Octet → `commonPaymentPageURL` döner.
4. Link mağazaya gönderilir / iframe ile açılır.
5. Mağaza → Ödeme yapar.
6. Octet → `returnPage` endpoint'ine ödeme sonucunu gönderir.
7. Sistem → `GET_COMMON_PAYMENT_REQUEST` ile doğrulama yapar.
8. Sistem → Mağaza bakiyesi günceller, muhasebe kaydını oluşturur.

---

## 5. API Uç Noktaları

### 5.1. POST /api/payment/initiate

#### Açıklama:
Admin tarafından ödeme oluşturmak için kullanılır.

#### İstek Parametreleri:
```json
{
  "storeId": "abc123",
  "amount": 1000.00,
  "currency": "TRY",
  "maxInstallment": 6,
  "description": "Nisan ödemesi"
}
