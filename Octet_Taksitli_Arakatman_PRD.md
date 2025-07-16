# Octet Entegre Taksitli Arakatman Ödeme Sistemi - Ürün Gereksinim Dokümanı (PRD)

## 1. Amaç

Bu doküman, Octet Ortak Ödeme Sayfası API'si ile entegre olan, taksitli ödeme destekli bir arakatman sisteminin ürün gereksinimlerini içerir. Admin kullanıcılar, mağaza adına ödeme başlatabilir, taksit sınırları tanımlayabilir, mağaza bakiyesi ve muhasebe kayıtları sistem tarafından otomatik güncellenir.

---

## 2. Kullanıcı Rolleri

### 2.1. Admin
- Mağaza adına ödeme başlatabilir
- Mağaza başı taksit limiti tanımlar
- Ödemeleri ve muhasebe geçmişini görüntüler

### 2.2. Mağaza
- Kendi adına oluşturulmuş ödeme bağlantısı ile ödeme yapar
- Maksimum taksit seçeneği admin tarafından tanımlıdır

---

## 3. Temel Özellikler

### 3.1. Ödeme Başlatma (Admin)
- Admin, mağaza adına ödeme talebi oluşturur
- Taksit limitlerini (örnek: 1,3,6,9) belirleyebilir
- Octet API’ye ödeme linki oluşturma isteği gönderilir
- Dönen `commonPaymentPageURL` linki mağaza ile paylaşılır

### 3.2. Otomatik Taksit Seçimi
- Link sonuna `&installmentStyle=ddl` eklenerek dropdown taksit listesi gösterilir
- Admin’in tanımladığı taksit sayısına kadar seçenek gösterilir

### 3.3. Otomatik Bilgi Dolumu (Mağaza)
- Ödeme sayfası mağazaya özel bilgileri (isim, telefon, mail vs) otomatik içerir

### 3.4. Ödeme Sonrası İşlemler
- Octet tarafından `returnPage` endpoint’ine POST yapılır
- Sistem, `GET_COMMON_PAYMENT_REQUEST` çağrısı ile işlemi doğrular
- Mağaza bakiyesi güncellenir
- Muhasebe hareket kaydı oluşturulur

---

## 4. Octet API Entegrasyonu

### 4.1. Ödeme Talebi Oluşturma

**Action:** `CREATE_COMMON_PAYMENT_PAGE_REQUEST`

**İstek Tipi:** `POST`  
**Content-Type:** `application/x-www-form-urlencoded`  
**Gerekli Parametreler:**

| Alan | Açıklama | Tip |
|------|----------|-----|
| action | `CREATE_COMMON_PAYMENT_PAGE_REQUEST` | string |
| partnerCode | Octet tarafından verilen kod | string |
| sellerReference | Mağaza ID veya referansı | string |
| paymentAmount | Ondalıklı tutar (örn. `1250.00`) | string |
| currency | TRY, USD, EUR | string |
| expireDateTime | Ödeme linki bitiş tarihi (`yyyy-MM-dd HH:mm:ss`) | string |
| buyerName | Mağaza adı | string |
| buyerSurname | Sistemsel olarak `"."` veya `"-"` | string |
| buyerMobilePhone | 00 ile başlayan GSM numarası | string |
| buyerEmail | Email adresi | string |
| buyerTCKN | (Opsiyonel) | string |
| buyerCompanyName | Unvan | string |
| language | TR veya EN | string |
| apiReferenceID | UUID gibi benzersiz bir değer | string |
| returnPage | Sunucunun dinlediği endpoint | string |
| consumerCardInstallmentLimit | Örn: `1,3,6,9` | string |
| commercialCardInstallmentLimit | Örn: `1,3,6,9` | string |
| securityKey | SHA1 ile hesaplanan güvenlik değeri | string |

**Yanıt:**
```json
{
  "resultStatus": "SUCCESS",
  "resultCode": "0",
  "resultData": {
    "commonPaymentPageURL": "https://octet.com/payment?xyz&installmentStyle=ddl"
  }
}
```

### 4.2. Ödeme Doğrulama

**Action:** `GET_COMMON_PAYMENT_REQUEST`

**Gerekli Parametreler:**
| Alan | Açıklama |
|------|----------|
| action | `GET_COMMON_PAYMENT_REQUEST` |
| partnerCode | Octet partner kodu |
| apiReferenceID | Daha önce gönderilen ID |
| securityKey | SHA1 ile oluşturulmuş imza |

**Yanıt:**
```json
{
  "resultStatus": "SUCCESS",
  "resultData": {
    "paymentAmount": "1500.00",
    "currency": "TRY",
    "paymentDate": "2025-07-16 14:00",
    "installmentCount": "6",
    "paymentToSellerAmount": "1475.00"
  }
}
```

---

## 5. Backend API'leri

### 5.1. POST `/api/admin/payments/initiate`
Admin, mağaza adına ödeme başlatır.

**İstek:**
```json
{
  "storeId": "store_001",
  "amount": 1500.00,
  "currency": "TRY",
  "maxInstallments": [1, 3, 6],
  "expireDateTime": "2025-07-17 23:59:59",
  "adminId": "admin_001"
}
```

**Yanıt:**
```json
{
  "paymentLink": "https://octet.com/payment/abc123&installmentStyle=ddl"
}
```

### 5.2. POST `/api/payments/callback`
Octet `returnPage` adresine ödeme sonucu gönderir

**Payload (Octet gönderisi):**
```json
{
  "resultStatus": "SUCCESS",
  "resultCode": "0",
  "resultData": {
    "apiReferenceID": "abc123",
    "paymentAmount": "1500.00",
    "installmentCount": "6",
    "paymentDate": "2025-07-16 14:12"
  }
}
```

**İşlem:** ödeme doğrulanır → bakiye artırılır → muhasebe kaydı oluşturulur

### 5.3. POST `/api/admin/installments/set`
Admin mağaza başı taksit limiti belirler.

**İstek:**
```json
{
  "storeId": "store_001",
  "consumerLimits": [1, 3, 6],
  "commercialLimits": [1, 2]
}
```

**Yanıt:**
```json
{ "status": "ok" }
```

### 5.4. GET `/api/admin/installments/options/:storeId`
Mağazaya tanımlı taksit seçeneklerini döner.

**Yanıt:**
```json
{
  "consumerCardInstallmentLimit": [1, 3, 6],
  "commercialCardInstallmentLimit": [1, 2]
}
```

---

## 6. Veri Tabanı Tasarımı

| Tablo | Açıklama |
|-------|----------|
| `stores` | Mağaza bilgileri |
| `installment_limits` | Mağaza başı taksit limiti |
| `payments` | Başlatılan ödeme talepleri |
| `store_balances` | Güncel bakiye tutarları |
| `accounting_logs` | Muhasebe kayıtları |

---

## 7. Güvenlik

- Octet istekleri `SHA1` hash ile imzalanır
- Ödeme sonucu doğrulama zorunludur (`GET_COMMON_PAYMENT_REQUEST`)
- Admin işlemleri sadece yetkili kullanıcılar tarafından yapılabilir

---

## 8. Geliştirme Planı

- [ ] Octet test ortamı için mock servis entegrasyonu
- [ ] Admin UI için ödeme başlatma ve listeleme ekranı
- [ ] Webhook endpoint için doğrulama servisi
- [ ] Background task ile otomatik muhasebe işlemleri
- [ ] Taksitli ödeme geçmişi ve analiz sayfası

---