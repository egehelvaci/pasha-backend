# 🚀 Railway Deployment Rehberi - 502 Hata Çözümü

## 🚨 502 Gateway Error Çözümü

### 📊 Optimizasyon Durumu
- **Yerel test:** 7-8 saniye ✅
- **Railway hedef:** 30-60 saniye
- **502 hata riski:** Minimize edildi

## 🔧 Railway Konfigürasyonu

### 1. Environment Variables
Railway dashboard'da şu environment variable'ları ayarlayın:

```bash
NODE_ENV=production
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
NODE_OPTIONS=--max-old-space-size=512
RAILWAY_STATIC_URL=true
DATABASE_URL=postgresql://... (Railway otomatik ayarlar)
TEBI_ACCESS_KEY=your_tebi_access_key
TEBI_SECRET_KEY=your_tebi_secret_key
TEBI_BUCKET_NAME=pashahome
```

### 2. Railway.toml Ayarları
✅ 502 hata için optimize edildi:
- Healthcheck timeout: 300 saniye (5 dakika)
- Restart policy: on_failure (5 retry)
- Memory limit: 512MB
- Puppeteer executable path ayarlandı

### 3. Build Komutları
```bash
# Build komutu
npm run api:build

# Start komutu  
npm run api:start
```

## 🧪 Test Komutları

### Railway Test
```bash
# Railway production test
npm run test:catalog:railway

# Yerel test
npm run test:catalog:local
```

## 🚀 502 Hata Çözüm Optimizasyonları

### 1. **Memory Optimizasyonu**
- ✅ Browser instance tekrar kullanımı
- ✅ Memory limit: 512MB
- ✅ Ürün limiti: 50 ürün/katalog
- ✅ Resim cache sistemi

### 2. **Timeout Optimizasyonu**
- ✅ Request timeout: 5 dakika (300s)
- ✅ Browser timeout: 20 saniye
- ✅ Resim timeout: 2 saniye
- ✅ PDF timeout: 15 saniye

### 3. **Resim Optimizasyonu**
- ✅ Paralel resim yükleme: 5 concurrent
- ✅ Timeout durumunda default resim
- ✅ Batch processing (100ms aralar)
- ✅ Viewport küçültüldü: 800x1000

### 4. **PDF Optimizasyonu**
- ✅ Minimal margin: 5mm
- ✅ Request interception optimize
- ✅ Sadece gerekli kaynaklar yüklenir
- ✅ CSS inline injection

## 📊 Railway Performans Metrikleri

### Beklenen Performans
- **İlk çalıştırma:** 60-120 saniye (cold start)
- **Sonraki çalıştırmalar:** 30-60 saniye
- **Memory kullanımı:** 300-500MB
- **PDF boyutu:** 5-20MB

### 502 Hata Tetikleyicileri
❌ **Kaçınılması gerekenler:**
- 50+ ürün katalog
- 5 dakika+ işlem süresi
- 512MB+ memory kullanımı
- Büyük resim dosyaları (>2MB)

## 🔧 Railway Debug

### Log Monitoring
```bash
# Railway logs
railway logs

# Memory monitoring
railway logs --filter="memory"

# Error monitoring  
railway logs --filter="error"
```

### Performance Monitoring
```bash
# Katalog test
npm run test:catalog:railway

# Memory test
node -e "console.log(process.memoryUsage())"
```

## 🚨 Acil Durum Çözümleri

### 502 Hata Alıyorsanız:
1. **Railway restart:** `railway restart`
2. **Memory temizle:** Browser cache temizle
3. **Ürün sayısını azaltın:** Max 25 ürün test edin
4. **Timeout artırın:** Railway dashboard'da timeout ayarları

### Memory Overflow:
1. **NODE_OPTIONS:** `--max-old-space-size=1024` deneyin
2. **Browser cleanup:** Her işlem sonrası browser kapat
3. **Image cache:** Cache boyutunu sınırlayın

### Timeout Issues:
1. **Healthcheck:** 600 saniyeye çıkarın
2. **Request timeout:** 10 dakikaya çıkarın
3. **Resim skip:** Timeout durumunda resimleri atla

## 📈 Railway Deployment Checklist

- [ ] Environment variables ayarlandı
- [ ] Railway.toml optimize edildi
- [ ] Memory limitleri ayarlandı
- [ ] Timeout ayarları yapıldı
- [ ] Test scripti çalıştırıldı
- [ ] Log monitoring aktif
- [ ] 502 hata çözümleri uygulandı

## 🎯 Başarı Kriterleri

✅ **Başarılı deployment:**
- Katalog 5 dakika içinde oluşuyor
- Memory 512MB altında kalıyor
- 502 hatası almıyorsunuz
- PDF başarıyla indiriliyor

🚀 **Railway'de artık katalog servisiniz optimize edildi ve 502 hatası riski minimize edildi!** 