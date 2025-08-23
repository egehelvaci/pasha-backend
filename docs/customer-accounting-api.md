# Müşteri Muhasebe Detayları API

## Endpoint
`GET /api/profile/accounting`

## Açıklama
Müşterilerin kendi muhasebe hareketlerini, siparişlerini ve ödeme geçmişlerini görüntüleyebilecekleri tek bir endpoint.

## Yetkilendirme
Bearer Token (JWT) gereklidir.
```
Authorization: Bearer {token}
```

## Yanıt İçeriği

### Özet Bilgiler
- **guncelBakiye**: Mağazanın güncel bakiyesi
- **toplamHarcama**: Toplam harcama tutarı
- **toplamOdeme**: Toplam ödeme tutarı
- **toplamSiparisTutari**: Tüm siparişlerin toplam tutarı
- **toplamSiparisSayisi**: Toplam sipariş sayısı
- **bekleyenSiparisler**: Bekleyen sipariş sayısı
- **teslimEdilenSiparisler**: Teslim edilen sipariş sayısı

### Muhasebe Hareketleri (Son 100 kayıt)
- İşlem türü, tutar, tarih
- Harcama/gelir ayrımı
- Açıklama bilgisi

### Siparişler (Son 50 sipariş)
- Sipariş detayları ve durumu
- Ürün bilgileri (koleksiyon, ölçüler, fiyat)
- Kesim tipi ve sasak bilgisi

### Ödemeler (Son 50 ödeme)
- Ödeme tutarı ve durumu
- Ödeme tarihi
- Referans numarası

## Örnek Yanıt
```json
{
  "success": true,
  "data": {
    "ozet": {
      "guncelBakiye": 15000.00,
      "toplamHarcama": 50000.00,
      "toplamOdeme": 65000.00,
      "toplamSiparisTutari": 45000.00,
      "toplamSiparisSayisi": 25,
      "bekleyenSiparisler": 3,
      "teslimEdilenSiparisler": 20
    },
    "muhasebeHareketleri": [...],
    "siparisler": [...],
    "odemeler": [...]
  }
}
```

## Hata Kodları
- `401`: Kimlik doğrulama hatası
- `404`: Mağaza bilgisi bulunamadı
- `500`: Sunucu hatası