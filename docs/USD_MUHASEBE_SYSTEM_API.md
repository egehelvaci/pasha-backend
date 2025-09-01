# USD Muhasebe Sistemi API Dokümantasyonu

USD mağazaları için ayrı muhasebe sistemi API'leri. Ana muhasebe sisteminden tamamen bağımsız çalışır.

## 🎯 Genel Bilgiler

- **Base URL**: `/api/admin/usd-muhasebe`
- **Authentication**: JWT Token gerekli
- **Content-Type**: `application/json`
- **Currency**: USD (Dolar) işlemleri

## 📊 API Endpoints

### 1. Tüm USD Muhasebe Hareketlerini Getir

**GET** `/api/admin/usd-muhasebe/hareketler`

USD mağazalarının tüm muhasebe hareketlerini listeler.

#### Query Parameters

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `limit` | number | Hayır | Sayfa başına kayıt sayısı (default: 50) |
| `offset` | number | Hayır | Atlama sayısı (default: 0) |
| `storeId` | string | Hayır | Belirli mağaza filtresi |
| `startDate` | string | Hayır | Başlangıç tarihi (ISO format) |
| `endDate` | string | Hayır | Bitiş tarihi (ISO format) |

#### Response

```json
{
  "success": true,
  "data": {
    "hareketler": [
      {
        "id": 1,
        "storeId": "uuid",
        "islemTuru": "Sanal POS Ödemesi",
        "tutar": 100.50,
        "harcama": false,
        "tarih": "2024-01-15T10:30:00Z",
        "aciklama": "Müşteri ödemesi",
        "display_amount": 95.25,
        "display_currency": "TRY",
        "original_amount": 95.25,
        "original_currency": "TRY",
        "exchange_rate": 1.0533,
        "store": {
          "store_id": "uuid",
          "kurum_adi": "USD Mağaza",
          "bakiye": -250.00,
          "durum": "BORCLU",
          "tutar": 250.00
        }
      }
    ],
    "magazaBakiyeleri": [
      {
        "store_id": "uuid",
        "kurum_adi": "USD Mağaza",
        "bakiye": -250.00,
        "durum": "BORCLU",
        "tutar": 250.00,
        "is_active": true,
        "currency": "USD"
      }
    ],
    "toplamAlacak": 1250.75,
    "adminAlacakliMagazaSayisi": 3,
    "adminVerecekMagazaSayisi": 1,
    "currency": "USD"
  }
}
```

### 2. Belirli USD Mağazasının Hareketlerini Getir

**GET** `/api/admin/usd-muhasebe/store/:storeId`

#### Path Parameters

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `storeId` | string | Evet | USD Mağaza ID'si |

#### Query Parameters

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `limit` | number | Hayır | Kayıt sayısı (default: 20) |
| `offset` | number | Hayır | Atlama sayısı (default: 0) |
| `startDate` | string | Hayır | Başlangıç tarihi |
| `endDate` | string | Hayır | Bitiş tarihi |

#### Response

```json
{
  "success": true,
  "data": {
    "store": {
      "store_id": "uuid",
      "kurum_adi": "USD Mağaza",
      "currency": "USD",
      "bakiye": -250.00,
      "is_active": true
    },
    "hareketler": [
      {
        "id": 1,
        "storeId": "uuid",
        "islemTuru": "Sanal POS Ödemesi",
        "tutar": 100.50,
        "harcama": false,
        "tarih": "2024-01-15T10:30:00Z",
        "aciklama": "Müşteri ödemesi",
        "original_amount": 95.25,
        "exchange_rate": 1.0533
      }
    ],
    "total": 1
  }
}
```

### 3. USD Muhasebe Hareketi Oluştur

**POST** `/api/admin/usd-muhasebe/hareketler`

Yeni USD muhasebe hareketi oluşturur.

#### Request Body

```json
{
  "storeId": "uuid",
  "islemTuru": "Sanal POS Ödemesi",
  "tutar": 100.50,
  "tarih": "2024-01-15T10:30:00Z",
  "aciklama": "Manuel ödeme kaydı",
  "currency": "USD"
}
```

#### Validation Rules

- `storeId`: Zorunlu, geçerli USD mağaza ID'si
- `islemTuru`: Zorunlu, geçerli işlem türlerinden biri
- `tutar`: Zorunlu, pozitif sayı
- `tarih`: Zorunlu, geçerli tarih formatı
- `aciklama`: Zorunlu, string
- `currency`: Opsiyonel, default "USD"

#### Response

```json
{
  "success": true,
  "message": "USD Muhasebe hareketi başarıyla oluşturuldu",
  "data": {
    "id": 1,
    "storeId": "uuid",
    "islemTuru": "Sanal POS Ödemesi",
    "tutar": 100.50,
    "harcama": false,
    "tarih": "2024-01-15T10:30:00Z",
    "aciklama": "Manuel ödeme kaydı",
    "currency": "USD",
    "store": {
      "store_id": "uuid",
      "kurum_adi": "USD Mağaza",
      "currency": "USD"
    }
  }
}
```

### 4. USD Gelir Türlerini Getir

**GET** `/api/admin/usd-muhasebe/income-types`

#### Response

```json
{
  "success": true,
  "data": [
    "Parekende Satış",
    "Toptan Satış",
    "Hizmet Geliri",
    "Sanal POS Ödemesi",
    "Faiz Geliri",
    "Kira Geliri",
    "Diğer Gelirler",
    "Borç Tahsilatı"
  ]
}
```

### 5. USD Gider Türlerini Getir

**GET** `/api/admin/usd-muhasebe/expense-types`

#### Response

```json
{
  "success": true,
  "data": [
    "Kira / Aidat Giderleri",
    "Elektrik / Su / Doğalgaz",
    "Telefon / İnternet",
    "Personel Maaş Ödemesi",
    "SGK Primleri",
    "Vergi Ödemeleri",
    "Nakliye Giderleri",
    "Ofis Malzemeleri",
    "Temizlik Giderleri",
    "Bakım Onarım",
    "Reklamı Pazarlama",
    "Danışmanlık Giderleri",
    "Sigortalar",
    "Bankacılık Giderleri",
    "Diğer Giderler"
  ]
}
```

## 🔐 Authentication

Tüm endpoint'ler JWT authentication gerektirir:

```
Authorization: Bearer <jwt_token>
```

## ❌ Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token gerekli"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Bu mağaza USD currency'sine sahip değil"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Mağaza bulunamadı"
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "message": "Geçersiz işlem türü: InvalidType"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "USD Muhasebe hareketleri getirilemedi"
}
```

## 🎯 Özellikler

### Currency Conversion
- Otomatik TRY → USD dönüşüm
- Merkez Bankası kuru kullanımı
- Original amount tracking

### Payment Integration
- Sadece COMPLETED ödemeler gösterilir
- FAILED ödemeler filtrelenir
- Webhook entegrasyonu

### Display Logic
- `display_amount`: Gösterim tutarı
- `display_currency`: Gösterim para birimi
- `original_amount`: Orijinal tutar
- `exchange_rate`: Döviz kuru

### Security
- USD mağaza kontrolü
- JWT authentication
- Store ownership validation

## 🔄 Ana Sistem ile Farklar

| Özellik | Ana Sistem | USD Sistemi |
|---------|------------|-------------|
| Currency | TRY | USD |
| Filtreleme | USD mağazalar hariç | Sadece USD mağazalar |
| Exchange Rate | Gösterim için | Otomatik hesaplama |
| Admin Store | Ayrı işlem | Normal işlem |
| Payment Filter | COMPLETED only | COMPLETED only |

## 📝 Notlar

1. USD mağazaları ana muhasebe sisteminde **görünmez**
2. Tüm işlemler USD cinsinden yapılır
3. TRY ödemeler otomatik USD'ye çevrilir
4. Exchange rate bilgileri saklanır
5. Orijinal tutar ve currency bilgileri korunur

## 🧪 Test Örnekleri

### Curl Examples

```bash
# Tüm USD hareketleri
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/admin/usd-muhasebe/hareketler"

# Belirli mağaza
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/admin/usd-muhasebe/store/{storeId}"

# Yeni hareket oluştur
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"storeId":"uuid","islemTuru":"Sanal POS Ödemesi","tutar":100,"tarih":"2024-01-15","aciklama":"Test"}' \
  "http://localhost:3001/api/admin/usd-muhasebe/hareketler"
```
