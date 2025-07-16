# Admin İstatistik API'leri Düzeltmeleri

## Sorun Analizi

Admin istatistik API'lerinde şu sorunlar tespit edilmişti:

1. **Yanlış Sipariş Durumları**: PENDING durumundaki siparişler de toplam ciroya dahil ediliyordu
2. **Metrekare Hesaplama Sorunu**: Cart tablosundan metrekare hesaplanmaya çalışılıyordu
3. **Tutarsız Ciro Hesaplaması**: Order ve OrderItem tablolarından farklı sonuçlar alınabiliyordu

## Yapılan Düzeltmeler

### 1. Sipariş Durum Filtresi
```typescript
// ÖNCE: Tüm durumlar dahil (PENDING hariç)
status: { not: 'CANCELED' }

// SONRA: Sadece onaylanmış siparişler
status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] }
```

### 2. Metrekare Hesaplama
```typescript
// ÖNCE: Cart tablosundan alan hesaplama
// Raw SQL ile cart_items tablosundan

// SONRA: OrderItem tablosundan alan hesaplama
const areaM2 = (Number(item.width) * Number(item.height) * item.quantity) / 10000
```

### 3. Ciro Doğrulama
```typescript
// Hem Order hem OrderItem tablolarından toplam tutar alınıyor
const totalAmount = Number(totalAmountFromOrders._sum?.total_price || 0)
const totalAmountFromItems = Number(totalAmountFromOrderItems._sum?.total_price || 0)

// Farkı debug bilgilerinde gösteriliyor
debug: {
  amount_difference: Math.abs(totalAmount - totalAmountFromItems)
}
```

## Etkilenen API Endpoint'leri

### 1. `/api/admin/statistics/totals`
- ✅ Sadece onaylanmış siparişlerin toplamı
- ✅ OrderItem tablosundan metrekare hesaplama
- ✅ Debug bilgileri eklendi
- ✅ Dahil edilen durumlar response'da belirtiliyor

### 2. `/api/admin/statistics/top-stores`
- ✅ Sadece onaylanmış siparişler sayılıyor

### 3. `/api/admin/statistics/top-products`
- ✅ Sadece onaylanmış siparişlerdeki ürünler sayılıyor

### 4. `/api/admin/statistics/orders-over-time`
- ✅ Sadece onaylanmış siparişler dahil
- ✅ OrderItem tablosundan metrekare hesaplama

## Test Etme

Test scripti ile kontrol edebilirsiniz:
```powershell
powershell -ExecutionPolicy Bypass -File final-stats-test.ps1
```

## Beklenen Sonuçlar

### Değişen Değerler
- **Toplam Ciro**: PENDING siparişler çıkarıldığı için azalacak
- **Sipariş Sayısı**: PENDING siparişler çıkarıldığı için azalacak
- **Metrekare**: Daha doğru hesaplanacak (OrderItem'lardan)

### Debug Bilgileri
Response'da şu debug bilgileri eklendi:
- `included_statuses`: Hangi durumlar dahil edildi
- `area_calculated_items`: Kaç item'dan metrekare hesaplandı
- `amount_difference`: Order vs OrderItem tutar farkı

## Güvenlik
- Sadece admin yetkisine sahip kullanıcılar bu API'lere erişebilir
- Authentication middleware korundu
- Validation mantığı değişmedi

## Geriye Uyumluluk
- API endpoint'leri değişmedi
- Response formatı aynı kaldı (sadece yeni debug alanları eklendi)
- Mevcut frontend uygulamaları etkilenmeyecek

---

*Düzeltme Tarihi: 2025-01-27*
*Düzelten: Claude Sonnet* 