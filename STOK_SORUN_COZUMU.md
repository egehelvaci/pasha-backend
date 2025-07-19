# 📦 STOK DÜŞMEME SORUNU ÇÖZÜMÜ

## 🚨 Sorun Tanımı

Sipariş onaylandığında (CONFIRMED durumuna geçtiğinde) ürün varyasyonlarından stok düşmüyor. Bu sorunun ana nedenleri:

1. **Varyasyon Eşleşme Problemi**: Sipariş öğesinin boyut/saçak bilgileri ile ürün varyasyonları eşleşmiyor
2. **Stok Düşürme Fonksiyonu Çağrılmıyor**: QR kod oluşturulurken stok düşürme işlemi atlanıyor
3. **Eksik Varyasyonlar**: Sipariş edilen boyut/saçak kombinasyonu için varyasyon tanımlanmamış

## 🔧 Debug ve Çözüm Scriptleri

### 1. Problem Teşhisi: `debug-stock-issue.ts`

Bu script detaylı analiz yapar ve sorunun kaynağını bulur.

```bash
# Sadece analiz yap (hiçbir şey değiştirme)
npm run debug-stock

# Gerçekten sipariş onaylamayı test et (stoklar düşecek!)
npm run debug-stock-exec
```

**Bu script şunları yapar:**
- PENDING siparişleri bulur
- Her sipariş öğesi için uygun varyasyonları arar
- Eşleşme problemlerini tespit eder
- Stok düşürme simülasyonu yapar
- Eksik varyasyonları listeler

### 2. Otomatik Çözüm: `fix-stock-issue.ts`

Bu script CONFIRMED ama stok düşmemiş siparişleri bulur ve düzeltir.

```bash
# Sadece analiz yap
npm run fix-stock

# Sorunlu siparişlerde stok düşürmeyi tekrar dene
npm run fix-stock -- --fix

# Sorunlu siparişleri PENDING durumuna al (tekrar onaylanabilir)
npm run fix-stock -- --reset-to-pending

# Eksik varyasyonları otomatik oluştur
npm run fix-stock -- --create-variations
```

## 📋 Sorun Çözme Adımları

### Adım 1: Problemi Teşhis Et
```bash
npm run debug-stock
```

### Adım 2: Mevcut CONFIRMED Siparişleri Kontrol Et
```bash
npm run fix-stock
```

### Adım 3: Çözüm Uygula

**Seçenek A: Stok Düşürmeyi Tekrar Dene**
```bash
npm run fix-stock -- --fix
```

**Seçenek B: Siparişleri Sıfırla (Önerilen)**
```bash
npm run fix-stock -- --reset-to-pending
# Sonra admin panelden siparişleri tekrar onayla
```

**Seçenek C: Eksik Varyasyonları Oluştur**
```bash
npm run fix-stock -- --create-variations
```

## 🔍 Teknik Detaylar

### Stok Düşürme Mantığı (`QRCodeService.reduceStockForOrder`)

1. **İlk Eşleşme**: Tam boyut + saçak durumu eşleşmesi
```typescript
const variations = await prisma.productvariations.findMany({
  where: {
    product_id: item.product_id,
    width: Math.round(Number(item.width)),
    height: Math.round(Number(item.height)),
    has_fringe: item.has_fringe || false
  }
});
```

2. **Alternatif Eşleşme**: Boyut eşleşir ama saçak farklı
```typescript
if (variations.length === 0) {
  variations = await prisma.productvariations.findMany({
    where: {
      product_id: item.product_id,
      width: Math.round(Number(item.width)),
      height: Math.round(Number(item.height)),
      has_fringe: !(item.has_fringe || false)
    }
  });
}
```

3. **Stok Güncelleme**:
```typescript
const newStock = Math.max(0, variation.stock_quantity - item.quantity);
await prisma.productvariations.update({
  where: { id: variation.id },
  data: { stock_quantity: newStock }
});
```

### Sipariş Onaylama Süreci

1. **Admin Sipariş Onaylama** (`AdminOrderController.confirmOrder`):
   - QR kod oluştur
   - **Stok düşür** ← Bu adım kritik!
   - Sipariş durumunu CONFIRMED yap

2. **Sipariş Durumu Güncelleme** (`AdminOrderController.updateOrderStatus`):
   - CONFIRMED durumuna geçerken QR kod oluştur
   - **Stok düşür** ← Bu adım da kritik!

## ⚠️ Yaygın Sorunlar ve Çözümleri

### 1. Varyasyon Bulunamıyor
**Sebep**: Sipariş öğesinin boyut/saçak bilgileri ile varyasyon eşleşmiyor
**Çözüm**: Eksik varyasyonları oluştur
```bash
npm run fix-stock -- --create-variations
```

### 2. Stok Düşürme Fonksiyonu Çağrılmıyor
**Sebep**: Admin controller'da stok düşürme adımı atlanıyor
**Çözüm**: Kod seviyesinde `qrCodeService.reduceStockForOrder()` çağrısını kontrol et

### 3. Yanlış Veri Tipleri
**Sebep**: `item.width` ve `item.height` Decimal, varyasyon width/height Integer
**Çözüm**: `Math.round(Number())` ile dönüşüm yapılıyor

### 4. Saçak Durumu Eşleşmiyor
**Sebep**: `item.has_fringe` null/undefined, varyasyon boolean
**Çözüm**: `item.has_fringe || false` ile varsayılan değer

## 📊 Monitoring

### Stok Düşme Kontrolü
```sql
-- Stok 1000'den az olan varyasyonlar (düşmüş)
SELECT 
  pv.product_id,
  p.name,
  pv.width,
  pv.height,
  pv.has_fringe,
  pv.stock_quantity
FROM productvariations pv
JOIN product p ON p.productId = pv.product_id
WHERE pv.stock_quantity < 1000
ORDER BY pv.stock_quantity ASC;
```

### CONFIRMED Ama Stok Düşmemiş Siparişler
```bash
npm run fix-stock
```

## 🚀 Önerilen Çözüm Sırası

1. **Hızlı Teşhis**: `npm run debug-stock`
2. **Sorunlu Siparişleri Bul**: `npm run fix-stock`
3. **Siparişleri Sıfırla**: `npm run fix-stock -- --reset-to-pending`
4. **Eksik Varyasyonları Oluştur**: `npm run fix-stock -- --create-variations`
5. **Admin Panelden Tekrar Onayla**: Siparişler artık düzgün stok düşürecek

---

**Not**: Bu scriptler test amaçlıdır. Production'da çalıştırmadan önce backup alın! 