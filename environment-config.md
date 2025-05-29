# Environment Yapılandırması

## Frontend URL Otomatik Algılama

Email servisimiz artık frontend URL'ini otomatik olarak algılıyor:

### 1. Development (Local)
```env
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"  # İsteğe bağlı, otomatik algılanır
```
**Sonuç:** `http://localhost:3000/reset-password?token=...`

### 2. Vercel Production
```env
NODE_ENV="production"
# VERCEL_URL otomatik olarak Vercel tarafından sağlanır
```
**Sonuç:** `https://your-app.vercel.app/reset-password?token=...`

### 3. Railway Production
```env
NODE_ENV="production"
# RAILWAY_STATIC_URL otomatik olarak Railway tarafından sağlanır
```
**Sonuç:** `https://your-app.railway.app/reset-password?token=...`

### 4. Custom Domain
```env
NODE_ENV="production"
FRONTEND_URL="https://your-custom-domain.com"
```
**Sonuç:** `https://your-custom-domain.com/reset-password?token=...`

## Öncelik Sırası

1. **FRONTEND_URL** environment variable (en yüksek öncelik)
2. **NODE_ENV === 'production'** ise:
   - VERCEL_URL varsa: `https://${VERCEL_URL}`
   - RAILWAY_STATIC_URL varsa: `RAILWAY_STATIC_URL`
   - PRODUCTION_FRONTEND_URL varsa: `PRODUCTION_FRONTEND_URL`
   - Hiçbiri yoksa: `https://your-frontend-domain.com`
3. **Development** ortamında: `http://localhost:3000`

## Farklı Ortamlar İçin .env Dosyaları

### Local Development (.env)
```env
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
SMTP_USER="egehelvaci@gmail.com"
SMTP_PASS="iwwa wprj iibs wtwx"
SMTP_FROM="egehelvaci@gmail.com"
```

### Vercel Production
Vercel dashboard'da environment variables:
```env
NODE_ENV="production"
SMTP_USER="egehelvaci@gmail.com"
SMTP_PASS="iwwa wprj iibs wtwx"
SMTP_FROM="egehelvaci@gmail.com"
# VERCEL_URL otomatik sağlanır
```

### Railway Production
Railway dashboard'da environment variables:
```env
NODE_ENV="production"
SMTP_USER="egehelvaci@gmail.com"
SMTP_PASS="iwwa wprj iibs wtwx"
SMTP_FROM="egehelvaci@gmail.com"
# RAILWAY_STATIC_URL otomatik sağlanır
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
Environment: production | Frontend: https://your-app.vercel.app
```

## Debugging

Console'da şifre sıfırlama linki de loglanır:
```
Şifre sıfırlama linki oluşturuldu: https://your-app.vercel.app/reset-password?token=abc123...
``` 