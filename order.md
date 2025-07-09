# SİPARİŞ API ENDPOINT'LERİ

Bu dosya Pasha Backend sipariş sistemi API endpoint'lerini içerir.
Tüm endpoint'ler JWT authentication gerektirir.

## İŞ MANTIKLARI

### Sipariş Verme Şartları

1. **Fiyat Listesi Limiti**: Mağazaya ait fiyat listesi varsa, sadece o fiyat listesinin limit tutarı kadar alışveriş yapılabilir.
2. **Açık Hesap Limiti**: Mağazanın açık hesap limiti kontrol edilir:
   - **Sınırsız**: `limitsiz_acik_hesap = true` ise sipariş verilebilir
   - **Sınırlı**: `acik_hesap_tutari` limiti kontrol edilir
3. **Limit Aşımı**: Limitler aşılırsa uygun hata mesajı döner

### Sipariş Süreci

1. Kullanıcı sepetine ürün ekler
2. Sepet limiti kontrol edilir (opsiyonel)
3. Sepet onaylanır ve sipariş oluşturulur
4. **Otomatik Adres Bilgisi Ekleme**:
   - Mağaza adres bilgileri otomatik olarak siparişe eklenir
   - Teslimat adresi, kurum bilgileri, vergi bilgileri dahil edilir
5. **Sipariş Sonrası İşlemler** (otomatik):
   - Açık hesap tutarı sipariş tutarı kadar düşürülür
   - Fiyat listesi limiti sipariş tutarı kadar azaltılır
   - Fiyat listesi limiti biterse mağaza varsayılan fiyat listesine geçer
6. Sepet pasif duruma geçer

---

## AUTH GEREKSİNİMLERİ

Tüm isteklerde Authorization header'ı gereklidir:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## BASE URL

- **Local**: `http://localhost:3001/api/orders`
- **Production**: `https://your-domain.com/api/orders`

---

## ENDPOINT'LER

### 1. SEPET LİMİTİ KONTROLÜ

**Method**: `GET`  
**URL**: `/api/orders/check-limits`

Bu endpoint sipariş vermeden önce sepetteki ürünlerin limitleri aşıp aşmadığını kontrol eder.

#### Request
```http
GET /api/orders/check-limits
Authorization: Bearer <JWT_TOKEN>
```

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Limit kontrolü tamamlandı",
  "data": {
    "canProceed": true,
    "message": "Sipariş verilebilir",
    "requiresPayment": false,
    "cartTotal": "1250.75"
  }
}
```

#### Response (Fiyat Listesi Limiti Aşımı - 200)
```json
{
  "success": true,
  "message": "Limit kontrolü tamamlandı",
  "data": {
    "canProceed": false,
    "message": "Size uygun fiyat listesinden fazla miktarda alışveriş yapamazsınız",
    "requiresPayment": false,
    "cartTotal": "2500.00"
  }
}
```

#### Response (Açık Hesap Limiti Aşımı - 200)
```json
{
  "success": true,
  "message": "Limit kontrolü tamamlandı",
  "data": {
    "canProceed": false,
    "message": "Ödeme yapın",
    "requiresPayment": true,
    "cartTotal": "3000.00"
  }
}
```

#### Response (Sepet Boş - 400)
```json
{
  "success": false,
  "message": "Sepetiniz boş veya bulunamadı"
}
```

---

### 2. SEPETİ ONAYLA VE SİPARİŞ OLUŞTUR

**Method**: `POST`  
**URL**: `/api/orders/create-from-cart`

Kullanıcının aktif sepetini onaylayıp sipariş oluşturur.

#### Request
```http
POST /api/orders/create-from-cart
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "notes": "Özel teslimat talimatları (opsiyonel)"
}
```

#### Response (Success - 201)
```json
{
  "success": true,
  "message": "Sipariş başarıyla oluşturuldu",
  "data": {
    "order": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "user_id": "user-uuid",
      "cart_id": 15,
      "total_price": "1250.75",
      "status": "PENDING",
      
      // Mağaza adres bilgileri (otomatik eklenir)
      "delivery_address": "Atatürk Cad. No:123 Kadıköy/İstanbul",
      "store_name": "ABC Halı Mağazası",
      "store_tax_number": "1234567890",
      "store_tax_office": "Kadıköy",
      "store_phone": "+90 212 123 45 67",
      "store_email": "info@abchali.com",
      "store_fax": "+90 212 123 45 68",
      
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "items": [
        {
          "id": "item-uuid-1",
          "order_id": "550e8400-e29b-41d4-a716-446655440001",
          "product_id": "product-uuid",
          "quantity": 2,
          "unit_price": "45.50",
          "total_price": "273.00",
          "has_fringe": true,
          "width": "150.00",
          "height": "200.00",
          "cut_type": "rectangle",
          "product": {
            "productId": "product-uuid",
            "name": "Premium Halı",
            "description": "Yüksek kalite halı",
            "productImage": "https://example.com/image.jpg",
            "collection": {
              "collectionId": "col-123",
              "name": "Premium Koleksiyon",
              "code": "PREM"
            }
          }
        }
      ],
      "user": {
        "userId": "user-uuid",
        "name": "John",
        "surname": "Doe",
        "email": "john@example.com"
      },
      "cart": {
        "id": 15,
        "created_at": "2024-01-15T09:00:00.000Z"
      }
    }
  }
}
```

#### Response (Fiyat Listesi Limiti Aşımı - 400)
```json
{
  "success": false,
  "message": "Size uygun fiyat listesinden fazla miktarda alışveriş yapamazsınız",
  "requiresPayment": false
}
```

#### Response (Açık Hesap Limiti Aşımı - 400)
```json
{
  "success": false,
  "message": "Ödeme yapın",
  "requiresPayment": true
}
```

#### Response (Sepet Boş - 400)
```json
{
  "success": false,
  "message": "Sepet bulunamadı veya boş"
}
```

---

### 3. SİPARİŞ DETAYINI GETİR

**Method**: `GET`  
**URL**: `/api/orders/{orderId}`

Belirtilen sipariş ID'sine ait sipariş detaylarını getirir.

#### Request
```http
GET /api/orders/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <JWT_TOKEN>
```

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "user-uuid",
    "cart_id": 15,
    "total_price": "1250.75",
    "status": "PENDING",
    
    // Mağaza adres bilgileri (otomatik eklenir)
    "delivery_address": "Atatürk Cad. No:123 Kadıköy/İstanbul",
    "store_name": "ABC Halı Mağazası",
    "store_tax_number": "1234567890",
    "store_tax_office": "Kadıköy",
    "store_phone": "+90 212 123 45 67",
    "store_email": "info@abchali.com",
    "store_fax": "+90 212 123 45 68",
    
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "items": [
      {
        "id": "item-uuid-1",
        "product_id": "product-uuid",
        "quantity": 2,
        "unit_price": "45.50",
        "total_price": "273.00",
        "has_fringe": true,
        "width": "150.00",
        "height": "200.00",
        "cut_type": "rectangle",
        "product": {
          "productId": "product-uuid",
          "name": "Premium Halı",
          "description": "Yüksek kalite halı",
          "collection": {
            "name": "Premium Koleksiyon",
            "code": "PREM"
          }
        }
      }
    ],
    "user": {
      "name": "John",
      "surname": "Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Response (Sipariş Bulunamadı - 404)
```json
{
  "success": false,
  "message": "Sipariş bulunamadı"
}
```

#### Response (Yetkisiz Erişim - 403)
```json
{
  "success": false,
  "message": "Bu siparişi görme yetkiniz yok"
}
```

---

## ÖRNEK KULLANIM SENARYOLARI

### Senaryo 1: Başarılı Sipariş Verme

```bash
# 1. Sepet limitini kontrol et
curl -X GET "http://localhost:3001/api/orders/check-limits" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. Limit uygunsa sipariş oluştur
curl -X POST "http://localhost:3001/api/orders/create-from-cart" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Acil teslimat"
  }'

# 3. Sipariş detayını kontrol et
curl -X GET "http://localhost:3001/api/orders/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Senaryo 2: Fiyat Listesi Limiti Aşımı

```bash
# Limit kontrolü
curl -X GET "http://localhost:3001/api/orders/check-limits" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
# {
#   "success": true,
#   "data": {
#     "canProceed": false,
#     "message": "Size uygun fiyat listesinden fazla miktarda alışveriş yapamazsınız"
#   }
# }

# Bu durumda sipariş verilemez, sepetten ürün çıkarılması gerekir
```

### Senaryo 3: Açık Hesap Limiti Aşımı

```bash
# Limit kontrolü
curl -X GET "http://localhost:3001/api/orders/check-limits" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
# {
#   "success": true,
#   "data": {
#     "canProceed": false,
#     "message": "Ödeme yapın",
#     "requiresPayment": true
#   }
# }

# Bu durumda önce ödeme yapılması gerekir
```

---

## SİPARİŞ DURUMLAR

- **PENDING**: Bekleyen sipariş
- **CONFIRMED**: Onaylanmış sipariş
- **SHIPPED**: Kargoya verilmiş sipariş
- **DELIVERED**: Teslim edilmiş sipariş
- **CANCELED**: İptal edilmiş sipariş

---

## HATA KODLARI

- **200**: Başarılı işlem
- **201**: Başarılı sipariş oluşturma
- **400**: Geçersiz istek / Limit aşımı
- **401**: Kimlik doğrulama gerekli
- **403**: Yetkisiz erişim
- **404**: Sipariş bulunamadı
- **500**: Sunucu hatası

---

## ÖNEMLİ NOTLAR

1. **Sepet Durumu**: Sipariş oluşturulduktan sonra sepet otomatik olarak pasif duruma geçer.

2. **Limit Kontrolleri**:
   - Fiyat listesi limiti her zaman açık hesap limitinden önce kontrol edilir
   - Sınırsız açık hesap (`limitsiz_acik_hesap = true`) durumunda sadece fiyat listesi limiti kontrol edilir

3. **Güvenlik**: Kullanıcılar sadece kendi siparişlerini görebilir ve oluşturabilir.

4. **Performans**: Sepet limiti kontrolü endpoint'i sipariş oluşturmadan önce kontrole yarar, gereksiz sipariş oluşturma denemelerini önler.

5. **Sipariş Sonrası İşlemler**: 
   - Açık hesap tutarı otomatik düşürülür
   - Fiyat listesi limiti güncellenir
   - Limit biterse varsayılan fiyat listesine geçiş yapılır

6. **İş Akışı**: Sepet → Limit Kontrolü → Sipariş Oluşturma → Otomatik Güncellemeler → Sipariş Takibi

---

## SİPARİŞ SONRASI OTOMATİK İŞLEMLER

Sipariş başarıyla oluşturulduktan sonra sistem otomatik olarak şu işlemleri gerçekleştirir:

### 1. Açık Hesap Güncelleme
- Mağazanın `acik_hesap_tutari` sipariş tutarı kadar düşürülür
- Sınırsız açık hesaba sahip mağazalar (`limitsiz_acik_hesap = true`) bu işlemden etkilenmez

### 2. Fiyat Listesi Limit Güncelleme
- Mağazaya atanmış fiyat listesinin `limit_amount` değeri sipariş tutarı kadar azaltılır
- Limit 0 veya altına düşerse otomatik olarak bir sonraki adım tetiklenir

### 3. Varsayılan Fiyat Listesine Geçiş
Fiyat listesi limiti bittiğinde:
- Mevcut fiyat listesi ataması (`StorePriceList`) silinir
- Sistemde tanımlı varsayılan fiyat listesi (`is_default = true`) bulunur
- Mağaza varsayılan fiyat listesine otomatik olarak atanır

### Örnek Senaryo
```
Başlangıç:
- Mağaza A'nın açık hesap tutarı: 5000 TL
- Atanmış özel fiyat listesi limiti: 2000 TL

1500 TL'lik sipariş sonrası:
- Açık hesap tutarı: 3500 TL (5000 - 1500)
- Fiyat listesi limiti: 500 TL (2000 - 1500)

Sonraki 800 TL'lik sipariş sonrası:
- Açık hesap tutarı: 2700 TL (3500 - 800)
- Fiyat listesi limiti: 0 TL (500 - 800, minimum 0)
- Mağaza varsayılan fiyat listesine geçer
```

Bu işlemler **hata durumunda sipariş oluşumunu engellemez**. İşlemler başarısız olursa sadece log tutulur ve sipariş normal şekilde oluşturulur.

---

## OTOMATİK ADRES BİLGİSİ EKLEMESİ

Sipariş oluşturulurken mağaza bilgileri otomatik olarak siparişe eklenir. Bu sayede her sipariş kendi teslimat adres bilgilerine sahip olur.

### Eklenen Adres Alanları

| Alan | Açıklama | Kaynak |
|------|----------|--------|
| `delivery_address` | Teslimat adresi | `Store.adres` |
| `store_name` | Mağaza/Kurum adı | `Store.kurum_adi` |
| `store_tax_number` | Vergi numarası | `Store.vergi_numarasi` |
| `store_tax_office` | Vergi dairesi | `Store.vergi_dairesi` |
| `store_phone` | Telefon | `Store.telefon` |
| `store_email` | E-posta | `Store.eposta` |
| `store_fax` | Faks numarası | `Store.faks_numarasi` |

### Avantajları

1. **Tutarlılık**: Her sipariş kendi adres bilgilerine sahip olur
2. **Geçmiş Koruma**: Mağaza adresi değişse bile eski siparişlerin adresi korunur
3. **Fatura Hazırlığı**: Fatura için gerekli tüm bilgiler siparişte hazır bulunur
4. **Manuel Giriş Gereksiz**: Kullanıcı adres girmek zorunda kalmaz

### Örnek Sipariş Adres Bilgisi

```json
{
  "id": "order-uuid",
  "delivery_address": "Atatürk Cad. No:123 Kadıköy/İstanbul",
  "store_name": "ABC Halı Mağazası",
  "store_tax_number": "1234567890",
  "store_tax_office": "Kadıköy",
  "store_phone": "+90 212 123 45 67",
  "store_email": "info@abchali.com",
  "store_fax": "+90 212 123 45 68"
}
```

**Not**: Mağaza adres bilgileri eksikse (null), ilgili alanlar da null olarak kaydedilir.

---

## GELİŞTİRİCİ NOTLARI

- Tüm fiyat hesaplamaları Decimal tipinde yapılır
- Sipariş ID'leri UUID formatındadır
- Sepet ID'leri auto-increment integer'dır
- Veritabanı işlemleri transaction içinde yapılır
- Hata durumları detaylı loglanır 