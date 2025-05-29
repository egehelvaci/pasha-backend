# 🔧 Şifre Sıfırlama URL Sorunu Çözümü

## ❌ Problem
Production ortamında şifre sıfırlama email'lerinde URL'ler şu şekilde oluşuyordu:
```
https://https://pasha-frontend.vercel.app/reset-password?token=2b991f16677514e8e18cc28dbefa483f3cb3fce0096ef87bca67d61b86e4c34
```

**Sorun:** Çift protokol (`https://https://`) nedeniyle link çalışmıyordu.

## ✅ Çözüm

### 1. URL Normalizasyon Fonksiyonu İyileştirildi
`src/utils/email-service.ts` dosyasında `normalizeUrl` fonksiyonu yeniden yazıldı:

```typescript
private normalizeUrl(url: string): string {
  if (!url) return url
  
  // URL'yi temizle
  let result = url.trim()
  
  // Çift protokol sorununu düzelt
  // https://https:// veya http://https:// gibi durumları temizle
  result = result.replace(/^(https?:\/\/)+/g, 'https://')
  
  // Eğer hiç protokol yoksa https ekle
  if (!result.startsWith('http://') && !result.startsWith('https://')) {
    result = `https://${result}`
  }
  
  // Son slash'i kaldır (eğer varsa)
  result = result.replace(/\/$/, '')
  
  return result
}
```

### 2. Frontend URL Belirleme Mantığı İyileştirildi
Environment variable öncelik sırası netleştirildi:

1. **FRONTEND_URL** (en yüksek öncelik)
2. **VERCEL_URL** (production'da)
3. **RAILWAY_STATIC_URL** (production'da)
4. **Fallback URL** (production'da)
5. **localhost:3000** (development'da)

### 3. Railway Konfigürasyonu Güncellendi
`railway.toml` dosyasına explicit frontend URL eklendi:

```toml
[environments.production]
NODE_ENV = "production"
PUPPETEER_EXECUTABLE_PATH = "/usr/bin/chromium-browser"
FRONTEND_URL = "https://pasha-frontend.vercel.app"
```

## 🚀 Hızlı Çözüm

Production ortamında şu environment variable'ı ayarlayın:

```env
FRONTEND_URL="https://pasha-frontend.vercel.app"
```

## 🧪 Test Etme

1. **Console Log'ları Kontrol Edin:**
```
=== FRONTEND URL DEBUG ===
NODE_ENV: production
FRONTEND_URL: https://pasha-frontend.vercel.app
✅ Using FRONTEND_URL: https://pasha-frontend.vercel.app

=== FINAL EMAIL URL ===
Frontend URL: https://pasha-frontend.vercel.app
Reset URL: https://pasha-frontend.vercel.app/reset-password?token=abc123...
```

2. **Email İçeriğini Kontrol Edin:**
Email'in alt kısmında environment bilgisi görünür:
```
Environment: production | Frontend: https://pasha-frontend.vercel.app
```

3. **Test API Çağrısı:**
```bash
curl -X POST https://pasha-backend-production.up.railway.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 📋 Desteklenen URL Formatları

Sistem artık şu sorunları otomatik olarak düzeltiyor:

| Giriş | Çıkış |
|-------|-------|
| `https://https://domain.com` | `https://domain.com` |
| `http://https://domain.com` | `https://domain.com` |
| `domain.com` | `https://domain.com` |
| `https://domain.com/` | `https://domain.com` |
| `https://domain.com` | `https://domain.com` ✅ |

## 🔍 Debug Bilgileri

Eğer hala sorun yaşıyorsanız, console log'larında şu bilgileri kontrol edin:

1. **Environment Variables:**
   - `NODE_ENV`
   - `FRONTEND_URL`
   - `VERCEL_URL`
   - `RAILWAY_STATIC_URL`

2. **URL Normalizasyon:**
   - Input URL
   - Final output URL

3. **Email Generation:**
   - Frontend URL
   - Final reset URL

## 📝 Notlar

- ✅ Çift protokol sorunu çözüldü
- ✅ URL normalizasyon eklendi
- ✅ Environment variable öncelik sırası netleştirildi
- ✅ Debug log'ları iyileştirildi
- ✅ Railway konfigürasyonu güncellendi

Bu değişikliklerden sonra şifre sıfırlama URL'leri doğru şekilde oluşturulacaktır. 