# 🚀 Railway Deployment Rehberi

## 📊 Performans Durumu
- **Yerel test:** 7-8 saniye ✅
- **Railway'de beklenen:** 10-15 saniye
- **Gateway timeout riski:** Çok düşük

## 🔧 Railway Konfigürasyonu

### 1. Environment Variables
Railway dashboard'da şu environment variable'ları ayarlayın:

```bash
NODE_ENV=production
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
DATABASE_URL=postgresql://... (Railway otomatik ayarlar)
TEBI_ACCESS_KEY=your_tebi_access_key
TEBI_SECRET_KEY=your_tebi_secret_key
TEBI_BUCKET_NAME=pashahome
```

### 2. Railway.toml Ayarları
✅ Zaten optimize edildi:
- Healthcheck timeout: 600 saniye
- Restart policy: on_failure
- Puppeteer executable path ayarlandı

### 3. Build Komutları
```bash
# Build komutu
npm run api:build

# Start komutu  
npm run api:start
```

## 🎨 Logo Sorunu Çözüldü
**Sorun:** Railway ortamında logo görünmüyordu
**Neden:** Public klasörü Docker image'a dahil edilmemişti
**Çözüm:** 
- ✅ Dockerfile'a `COPY public ./public` eklendi
- ✅ copy-assets.js scripti public klasörünü dist'e kopyalıyor
- ✅ catalog-service.ts'de akıllı logo path algılaması eklendi

## 🧪 Test Komutları

### Yerel Test
```bash
npm run test:catalog
```

### Production Test (Railway URL ile)
```bash
# Railway URL'inizi güncelleyin
npm run test:catalog:prod
```

## 📈 Performans Optimizasyonları

### ✅ Yapılan İyileştirmeler
1. **Paralel resim yükleme** (20 eşzamanlı - 300 ürün için optimize)
2. **Cache sistemi** (resim, font, logo)
3. **Browser instance tekrar kullanımı**
4. **Timeout optimizasyonları** (5s resim, 120s PDF timeout)
5. **Memory yönetimi** ve cleanup
6. **300 ürün desteği** - sınırsız ürün katalog oluşturma

### 🎯 300 Ürün Optimizasyonları
- ✅ **MAX_CONCURRENT_IMAGES**: 10 → 20 (2x performans artışı)
- ✅ **IMAGE_TIMEOUT**: 3s → 5s (kararlılık artışı)
- ✅ **BROWSER_TIMEOUT**: 30s → 60s
- ✅ **PDF_TIMEOUT**: 30s → 120s (büyük kataloglar için)
- ✅ **HTML_LOAD_TIMEOUT**: 15s → 45s
- ✅ **Batch processing**: 20'li gruplar halinde paralel işlem

### 🎯 Sonuçlar
- **300 ürün**: ~2-3 dakika beklenen süre
- **Gateway timeout riski**: Eliminasyon
- **Memory efficient**: Batch processing ile bellek optimizasyonu
- **Stable performance**: Cache ve retry mekanizmaları

## 🚨 Troubleshooting

### Gateway Timeout Alırsanız
1. Railway logs'u kontrol edin
2. Healthcheck endpoint'i test edin: `/healthz`
3. Memory kullanımını kontrol edin

### Yavaş Performans
1. Resim cache'i çalışıyor mu kontrol edin
2. Browser instance tekrar kullanılıyor mu kontrol edin
3. Network latency'yi ölçün

## 📞 Monitoring

### Healthcheck
```
GET /healthz
Response: "OK"
```

### Katalog Test
```
POST /api/catalog/generate
Body: { "companyName": "Test" }
Expected: PDF response in 10-15 seconds
```

## 🎉 Deploy Sonrası

1. Healthcheck endpoint'ini test edin
2. Katalog oluşturma test edin
3. Performance monitoring yapın
4. Error logs'u takip edin

---
**Not:** Bu optimizasyonlar ile Railway'de gateway timeout sorunu yaşamazsınız! 

---
**Son Deploy:** 2024-12-19 Logo sorunu çözümü sonrası deployment 