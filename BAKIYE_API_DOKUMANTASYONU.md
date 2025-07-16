# 💰 Mağaza Bakiye API Dokümantasyonu

Bu dokümantasyon, kullanıcıların mağaza bakiye bilgilerini alabileceği API endpoint'ini detaylı olarak açıklamaktadır.

## 📋 Genel Bilgiler

| Özellik | Değer |
|---------|-------|
| **Endpoint** | `GET /api/my-statistics/balance` |
| **Yetkilendirme** | Bearer Token (JWT) |
| **Content-Type** | `application/json` |
| **Versiyon** | v1.0 |

---

## 🚀 API Kullanımı

### Request

#### HTTP Method
```http
GET /api/my-statistics/balance
```

#### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Parameters
Bu endpoint herhangi bir parametre gerektirmez.

---

## 📤 Response Formatları

### ✅ Başarılı Yanıt (200 OK)

```json
{
  "success": true,
  "data": {
    "store_info": {
      "store_id": "abc-123-def-456",
      "kurum_adi": "ABC Mağaza Ltd. Şti.",
      "vergi_numarasi": "1234567890",
      "tckn": "12345678901",
      "telefon": "0212 555 0123",
      "eposta": "info@abcmagaza.com",
      "adres": "Kadıköy/İstanbul"
    },
    "balance_info": {
      "bakiye": 15000.00,
      "acik_hesap_tutari": 10000.00,
      "toplam_kullanilabilir": 25000.00,
      "maksimum_taksit": 12,
      "limitsiz_acik_hesap": false,
      "currency": "TRY"
    }
  }
}
```

### 📊 Response Alanları Detayı

#### `store_info` (Mağaza Bilgileri)

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `store_id` | `string` | ✅ | Mağaza benzersiz kimliği (UUID) |
| `kurum_adi` | `string` | ✅ | Mağaza/kurum adı |
| `vergi_numarasi` | `string` | ❌ | Vergi numarası (10-11 haneli) |
| `tckn` | `string` | ❌ | T.C. Kimlik Numarası (11 haneli) |
| `telefon` | `string` | ❌ | Telefon numarası |
| `eposta` | `string` | ❌ | E-posta adresi |
| `adres` | `string` | ❌ | Tam adres bilgisi |

#### `balance_info` (Bakiye Bilgileri)

| Alan | Tip | Açıklama |
|------|-----|----------|
| `bakiye` | `number` | **Mevcut bakiye** (TL cinsinden) |
| `acik_hesap_tutari` | `number` | **Açık hesap limiti** (TL cinsinden) |
| `toplam_kullanilabilir` | `number` | **Bakiye + Açık hesap toplamı** (TL) |
| `maksimum_taksit` | `number` | **Maksimum taksit sayısı** |
| `limitsiz_acik_hesap` | `boolean` | **Sınırsız açık hesap durumu** |
| `currency` | `string` | **Para birimi** (her zaman "TRY") |

---

## ❌ Hata Yanıtları

### 401 Unauthorized - Kimlik Doğrulama Hatası
```json
{
  "success": false,
  "message": "Kullanıcı kimlik doğrulaması gerekli"
}
```

### 400 Bad Request - Mağaza Bağlı Değil
```json
{
  "success": false,
  "message": "Kullanıcı bir mağazaya bağlı değil"
}
```

### 404 Not Found - Kullanıcı Bulunamadı
```json
{
  "success": false,
  "message": "Kullanıcı bulunamadı"
}
```

### 500 Internal Server Error - Sunucu Hatası
```json
{
  "success": false,
  "message": "Bakiye bilgileri alınırken bir hata oluştu"
}
```

---

## 💡 Bakiye Mantığı

### Toplam Kullanılabilir Tutar Hesaplaması

```
Toplam Kullanılabilir = Bakiye + Açık Hesap Limiti
```

### 📊 Örnek Senaryolar

#### Senaryo 1: Pozitif Bakiye
```
✅ Bakiye: 15,000 TL
✅ Açık Hesap Limiti: 10,000 TL
🎯 Toplam Kullanılabilir: 25,000 TL
📝 Durum: Mağaza kredi durumunda
```

#### Senaryo 2: Negatif Bakiye (Borçlu)
```
⚠️ Bakiye: -5,000 TL
✅ Açık Hesap Limiti: 10,000 TL
🎯 Toplam Kullanılabilir: 5,000 TL
📝 Durum: Mağaza borçlu ama hala sipariş verebilir
```

#### Senaryo 3: Sınırsız Açık Hesap
```
✅ Bakiye: Herhangi değer
🔄 limitsiz_acik_hesap: true
🎯 Toplam Kullanılabilir: Sınırsız
📝 Durum: Mağaza sınırsız kredi imkanı
```

---

## 💻 Frontend Kullanım Örnekleri

### JavaScript/React

```javascript
const getStoreBalance = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/my-statistics/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      const { store_info, balance_info } = data.data;
      
      // Bakiye bilgilerini kullan
      console.log('🏪 Mağaza:', store_info.kurum_adi);
      console.log('💰 Bakiye:', balance_info.bakiye.toLocaleString('tr-TR'), 'TL');
      console.log('📊 Kullanılabilir:', balance_info.toplam_kullanilabilir.toLocaleString('tr-TR'), 'TL');
      
      return balance_info;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('❌ API Hatası:', error);
    throw error;
  }
};

// Kullanım
getStoreBalance()
  .then(balance => {
    document.getElementById('bakiye').textContent = 
      balance.bakiye.toLocaleString('tr-TR') + ' TL';
  })
  .catch(error => {
    alert('Bakiye bilgisi alınamadı: ' + error.message);
  });
```

### Axios ile Kullanım

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token'ı interceptor ile ekle
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Bakiye bilgisi al
const getStoreBalance = async () => {
  try {
    const response = await api.get('/my-statistics/balance');
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token geçersiz, yeniden giriş yap
      window.location.href = '/login';
    }
    throw new Error(error.response?.data?.message || 'Bakiye alınamadı');
  }
};

// React Hook örneği
const useStoreBalance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStoreBalance()
      .then(data => {
        setBalance(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { balance, loading, error, refetch: () => getStoreBalance() };
};
```

### Vue.js ile Kullanım

```javascript
// Vue 3 Composition API
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const storeBalance = ref(null);
    const loading = ref(true);
    const error = ref(null);

    const fetchBalance = async () => {
      try {
        loading.value = true;
        const token = localStorage.getItem('authToken');
        
        const response = await fetch('/api/my-statistics/balance', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (data.success) {
          storeBalance.value = data.data;
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchBalance);

    return {
      storeBalance,
      loading,
      error,
      fetchBalance
    };
  }
};
```

---

## 🔧 cURL Örnekleri

### Basit İstek
```bash
curl -X GET \
  'http://localhost:3000/api/my-statistics/balance' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json'
```

### Detaylı cURL (Headers ile)
```bash
curl -X GET \
  'http://localhost:3000/api/my-statistics/balance' \
  -H 'Authorization: Bearer <your_jwt_token>' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'User-Agent: MyApp/1.0' \
  --compressed \
  --show-error \
  --fail
```

### jq ile JSON Parse
```bash
curl -s -X GET \
  'http://localhost:3000/api/my-statistics/balance' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  | jq '.data.balance_info.bakiye'
```

---

## 🛡️ Güvenlik ve Best Practices

### 🔐 Token Güvenliği
- JWT token'ı `localStorage` yerine `httpOnly cookie` kullanın
- Token süresini kontrol edin ve gerektiğinde yenileyin
- HTTPS kullanımı zorunludur (production)

### 🚦 Rate Limiting
```javascript
// Aynı endpoint'e fazla istek atmaktan kaçının
const rateLimiter = {
  lastCall: 0,
  minInterval: 5000, // 5 saniye

  async callAPI() {
    const now = Date.now();
    if (now - this.lastCall < this.minInterval) {
      throw new Error('Çok sık istek gönderiyorsunuz');
    }
    this.lastCall = now;
    return await getStoreBalance();
  }
};
```

### 🔒 Hassas Veri Güvenliği
```javascript
// Bakiye bilgilerini güvenli şekilde göster
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(amount);
};

// Bakiye bilgisini DOM'a yazmadan önce sanitize et
const displayBalance = (balance) => {
  const sanitized = parseFloat(balance).toFixed(2);
  return formatCurrency(sanitized);
};
```

---

## 📊 Monitoring ve Logging

### Frontend Logging
```javascript
const logAPICall = (endpoint, response, duration) => {
  console.log(`[API] ${endpoint}`, {
    success: response.success,
    duration: duration + 'ms',
    timestamp: new Date().toISOString()
  });
};

// Performance monitoring
const getStoreBalanceWithMonitoring = async () => {
  const startTime = performance.now();
  
  try {
    const response = await getStoreBalance();
    const duration = performance.now() - startTime;
    
    logAPICall('/my-statistics/balance', { success: true }, duration);
    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    logAPICall('/my-statistics/balance', { success: false }, duration);
    throw error;
  }
};
```

---

## 🔗 İlgili API Endpoint'leri

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/my-statistics/dashboard` | Mağaza genel istatistikleri |
| `GET /api/my-statistics/totals` | Mağaza toplam istatistikleri |
| `GET /api/my-statistics/orders-over-time` | Zaman bazlı sipariş grafiği |
| `GET /api/orders/check-limits` | Sipariş limit kontrolü |
| `GET /api/auth/login` | Kullanıcı girişi (token alma) |

---

## �� Changelog

### v1.1.0 (2024)
- 🐛 **Floating Point Precision Düzeltmesi**: `limitAmount` değerlerinde ondalık hassasiyet sorunu çözüldü
- ✅ Para tutarları artık 2 ondalık basamakla yuvarlanıyor
- ✅ `2220.800000000003` gibi değerler artık `2220.80` olarak döndürülüyor
- ✅ Yeni `number-utils` modülü eklendi (para hesaplamaları için)

### v1.0.0 (2024)
- ✅ Mağaza bakiye bilgileri API'si eklendi
- ✅ Store modeli bakiye alanları eklendi
- ✅ Kullanıcı-mağaza ilişkisi üzerinden bakiye sorgusu
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Türkçe hata mesajları

---

## 🆘 Troubleshooting

### Sık Karşılaşılan Hatalar

#### 401 Unauthorized
**Sebep**: Token geçersiz veya süresi dolmuş
**Çözüm**: Yeniden giriş yapın ve yeni token alın

#### 400 Bad Request
**Sebep**: Kullanıcı mağazaya bağlı değil
**Çözüm**: Admin ile iletişime geçin, mağaza ataması yapılsın

#### 500 Internal Server Error
**Sebep**: Sunucu hatası
**Çözüm**: Sistem yöneticisi ile iletişime geçin

### Debug İpuçları
```javascript
// Token'ı decode et ve kontrol et
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Token decode hatası:', error);
    return null;
  }
};

// Token süresini kontrol et
const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};
```

---

## 📞 Destek

- **API Dokümantasyonu**: Bu dosya
- **Backend Repo**: `pasha-backend`
- **Teknik Destek**: Backend geliştirme ekibi

---

*Son güncelleme: 2024* 