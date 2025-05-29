# Environment Yapılandırması

## ⚠️ ÖNEMLİ: Çift Protokol Sorunu Çözüldü

Production ortamında şifre sıfırlama URL'lerinde `https://https://` gibi çift protokol sorunu yaşanıyordu. Bu sorun çözülmüştür.

## Frontend URL Otomatik Algılama

Email servisimiz artık frontend URL'ini otomatik olarak algılıyor ve çift protokol sorunlarını düzeltiyor:

### 1. Development (Local)
```env
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"  # İsteğe bağlı, otomatik algılanır
```
**Sonuç:** `http://localhost:3000/reset-password?token=...`

### 2. Vercel Production
```env
NODE_ENV="production"
FRONTEND_URL="https://pasha-frontend.vercel.app"  # Önerilen
# VERCEL_URL otomatik olarak Vercel tarafından sağlanır (fallback)
```
**Sonuç:** `https://pasha-frontend.vercel.app/reset-password?token=...`

### 3. Railway Production
```env
NODE_ENV="production"
FRONTEND_URL="https://pasha-frontend.vercel.app"  # Önerilen
# RAILWAY_STATIC_URL otomatik olarak Railway tarafından sağlanır (fallback)
```
**Sonuç:** `https://pasha-frontend.vercel.app/reset-password?token=...`

### 4. Custom Domain
```env
NODE_ENV="production"
FRONTEND_URL="https://your-custom-domain.com"
```
**Sonuç:** `https://your-custom-domain.com/reset-password?token=...`

## Öncelik Sırası

1. **FRONTEND_URL** environment variable (en yüksek öncelik) ✅
2. **NODE_ENV === 'production'** ise:
   - VERCEL_URL varsa: normalize edilmiş URL
   - RAILWAY_STATIC_URL varsa: normalize edilmiş URL
   - Hiçbiri yoksa: `https://pasha-frontend.vercel.app`
3. **Development** ortamında: `http://localhost:3000`

## URL Normalizasyon

Sistem artık şu sorunları otomatik olarak düzeltiyor:
- ✅ `https://https://domain.com` → `https://domain.com`
- ✅ `http://https://domain.com` → `https://domain.com`
- ✅ `domain.com` → `https://domain.com`
- ✅ `https://domain.com/` → `https://domain.com`

## Farklı Ortamlar İçin .env Dosyaları

### Local Development (.env)
```env
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
SMTP_USER="egehelvaci@gmail.com"
SMTP_PASS="iwwa wprj iibs wtwx"
SMTP_FROM="egehelvaci@gmail.com"
```

### Railway Production (Önerilen)
Railway dashboard'da environment variables:
```env
NODE_ENV="production"
FRONTEND_URL="https://pasha-frontend.vercel.app"
SMTP_USER="egehelvaci@gmail.com"
SMTP_PASS="iwwa wprj iibs wtwx"
SMTP_FROM="egehelvaci@gmail.com"
```

### Vercel Production
Vercel dashboard'da environment variables:
```env
NODE_ENV="production"
FRONTEND_URL="https://pasha-frontend.vercel.app"
SMTP_USER="egehelvaci@gmail.com"
SMTP_PASS="iwwa wprj iibs wtwx"
SMTP_FROM="egehelvaci@gmail.com"
```

### Custom Domain ile Production
```env
NODE_ENV="production"
FRONTEND_URL="https://pasha.yourdomain.com"
SMTP_USER="egehelvaci@gmail.com"
SMTP_PASS="iwwa wprj iibs wtwx"
SMTP_FROM="egehelvaci@gmail.com"
```

## Test Etme

Email'de hangi URL'in kullanıldığını görmek için email'in alt kısmında environment bilgisi yer alır:

```
Environment: development | Frontend: http://localhost:3000
Environment: production | Frontend: https://pasha-frontend.vercel.app
```

## Debugging

Console'da şifre sıfırlama linki de loglanır:
```
=== FRONTEND URL DEBUG ===
NODE_ENV: production
FRONTEND_URL: https://pasha-frontend.vercel.app
VERCEL_URL: undefined
RAILWAY_STATIC_URL: undefined
==========================
✅ Using FRONTEND_URL: https://pasha-frontend.vercel.app

=== FINAL EMAIL URL ===
Frontend URL: https://pasha-frontend.vercel.app
Reset URL: https://pasha-frontend.vercel.app/reset-password?token=abc123...
=======================
```

## Hızlı Çözüm

Production ortamında şu environment variable'ı ayarlayın:
```env
FRONTEND_URL="https://pasha-frontend.vercel.app"
```

Bu, tüm URL sorunlarını çözecektir. 