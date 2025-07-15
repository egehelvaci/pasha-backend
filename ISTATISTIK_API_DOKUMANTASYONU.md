# 📊 İstatistik API Dokümantasyonu

Bu dokümantasyon, Pasha Backend projesindeki tüm istatistik API'lerini kapsamlı bir şekilde açıklar.

## 📋 İçindekiler

1. [Genel Bilgiler](#genel-bilgiler)
2. [Admin İstatistik API'leri](#admin-istatistik-apileri)
3. [Mağaza İstatistik API'leri](#mağaza-istatistik-apileri)
4. [Kimlik Doğrulama](#kimlik-doğrulama)
5. [Hata Yönetimi](#hata-yönetimi)
6. [Örnek Kullanımlar](#örnek-kullanımlar)

---

## 🌐 Genel Bilgiler

**Base URL:** 
- Lokal: `http://localhost:3001`
- Canlı: `https://your-domain.com`

**Content-Type:** `application/json`

**Kimlik Doğrulama:** Bearer Token (JWT)

---

## 🔑 Kimlik Doğrulama

### Admin Girişi
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123"
}
```

### Mağaza Girişi
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "magaza_username",
  "password": "magaza_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "user-uuid",
      "username": "admin",
      "userType": "admin"
    }
  }
}
```

---

## 👑 Admin İstatistik API'leri

Admin kullanıcıları tüm sistemin istatistiklerini görebilir.

### 1. En Çok Sipariş Veren Mağazalar (TOP 5)

**GET** `/api/admin/statistics/top-stores`

**Query Parametreleri:**
- `period` (isteğe bağlı): `1_month` | `3_months` | `1_year` (varsayılan: `1_year`)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Örnek İstek:**
```bash
curl -X GET "http://localhost:3001/api/admin/statistics/top-stores?period=3_months" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "store_id": "store-uuid-1",
        "store_name": "ABC Halı Mağazası",
        "user_name": "Ahmet Yılmaz",
        "order_count": 25,
        "total_amount": 45750.50,
        "period": "3_months"
      },
      {
        "store_id": "store-uuid-2",
        "store_name": "XYZ Tekstil",
        "user_name": "Mehmet Özkan",
        "order_count": 18,
        "total_amount": 32100.25,
        "period": "3_months"
      }
    ],
    "period": "3_months",
    "total_stores": 2
  }
}
```

### 2. En Çok Sipariş Edilen Ürünler (TOP 5)

**GET** `/api/admin/statistics/top-products`

**Query Parametreleri:**
- `period` (isteğe bağlı): `1_month` | `3_months` | `1_year` (varsayılan: `1_year`)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "product_id": "product-uuid-1",
        "product_name": "Premium Anadolu Halısı",
        "collection_name": "Geleneksel Koleksiyon",
        "product_image": "https://example.com/images/hali1.jpg",
        "total_quantity": 45,
        "total_amount": 22750.50,
        "period": "1_year"
      }
    ],
    "period": "1_year",
    "total_products": 1
  }
}
```

### 3. Zaman Bazlı Sipariş Grafiği

**GET** `/api/admin/statistics/orders-over-time`

**Query Parametreleri:**
- `period` (isteğe bağlı): `1_month` | `3_months` | `1_year` (varsayılan: `1_year`)
- `groupBy` (isteğe bağlı): `day` | `week` | `month` (varsayılan: `month`)

**Response:**
```json
{
  "success": true,
  "data": {
    "chart_data": [
      {
        "time_period": "2024-01",
        "order_count": 45,
        "total_amount": 67500.75,
        "total_area_m2": 1250.5
      },
      {
        "time_period": "2024-02",
        "order_count": 52,
        "total_amount": 78650.25,
        "total_area_m2": 1456.8
      }
    ],
    "period": "1_year",
    "group_by": "month",
    "start_date": "2023-07-15T00:00:00.000Z",
    "end_date": "2024-07-15T00:00:00.000Z"
  }
}
```

### 4. Toplam İstatistikler

**GET** `/api/admin/statistics/totals`

**Query Parametreleri:**
- `period` (isteğe bağlı): `1_month` | `3_months` | `1_year` (varsayılan: `1_year`)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_orders": 245,
    "total_amount": 387650.75,
    "total_product_quantity": 1847,
    "total_area_m2": 12567.8,
    "period": "1_year",
    "start_date": "2023-07-15T00:00:00.000Z",
    "end_date": "2024-07-15T00:00:00.000Z"
  }
}
```

---

## 🏪 Mağaza İstatistik API'leri

Mağaza kullanıcıları sadece kendi istatistiklerini görebilir.

### 1. Mağaza Dashboard İstatistikleri

**GET** `/api/my-statistics/dashboard`

**Query Parametreleri:**
- `period` (isteğe bağlı): `1_month` | `3_months` | `1_year` (varsayılan: `1_year`)

**Headers:**
```
Authorization: Bearer <store_user_token>
```

**Örnek İstek:**
```bash
curl -X GET "http://localhost:3001/api/my-statistics/dashboard?period=1_month" \
  -H "Authorization: Bearer YOUR_STORE_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "1_month",
    "start_date": "2024-06-15T00:00:00.000Z",
    "end_date": "2024-07-15T00:00:00.000Z",
    "orders": {
      "total": 12,
      "pending": 2,
      "confirmed": 5,
      "delivered": 5
    },
    "financial": {
      "total_amount": 23450.75
    },
    "products": {
      "total_quantity": 45
    },
    "recent_orders": [
      {
        "id": "order-uuid-1",
        "total_price": 1250.50,
        "status": "CONFIRMED",
        "created_at": "2024-07-14T10:30:00.000Z",
        "total_items": 3
      },
      {
        "id": "order-uuid-2",
        "total_price": 2100.25,
        "status": "DELIVERED",
        "created_at": "2024-07-13T15:20:00.000Z",
        "total_items": 5
      }
    ]
  }
}
```

### 2. Mağaza Zaman Bazlı Sipariş Grafiği

**GET** `/api/my-statistics/orders-over-time`

**Query Parametreleri:**
- `period` (isteğe bağlı): `1_month` | `3_months` | `1_year` (varsayılan: `1_year`)
- `groupBy` (isteğe bağlı): `day` | `week` | `month` (varsayılan: `month`)

**Response:**
```json
{
  "success": true,
  "data": {
    "chart_data": [
      {
        "time_period": "2024-06",
        "order_count": 8,
        "total_amount": 15750.25,
        "total_area_m2": 245.5
      },
      {
        "time_period": "2024-07",
        "order_count": 12,
        "total_amount": 23450.75,
        "total_area_m2": 387.2
      }
    ],
    "period": "1_year",
    "group_by": "month",
    "start_date": "2023-07-15T00:00:00.000Z",
    "end_date": "2024-07-15T00:00:00.000Z"
  }
}
```

### 3. Mağazanın En Çok Sipariş Ettiği Ürünler

**GET** `/api/my-statistics/top-products`

**Query Parametreleri:**
- `period` (isteğe bağlı): `1_month` | `3_months` | `1_year` (varsayılan: `1_year`)
- `limit` (isteğe bağlı): Kaç ürün getirileceği (varsayılan: 5)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "product_id": "product-uuid-1",
        "product_name": "Premium Anadolu Halısı",
        "collection_name": "Geleneksel Koleksiyon",
        "product_image": "https://example.com/images/hali1.jpg",
        "total_quantity": 15,
        "total_amount": 7500.50,
        "period": "1_year"
      },
      {
        "product_id": "product-uuid-2",
        "product_name": "Modern Desenli Halı",
        "collection_name": "Modern Koleksiyon",
        "product_image": "https://example.com/images/hali2.jpg",
        "total_quantity": 12,
        "total_amount": 6200.75,
        "period": "1_year"
      }
    ],
    "period": "1_year",
    "total_products": 2
  }
}
```

### 4. Mağaza Toplam İstatistikleri

**GET** `/api/my-statistics/totals`

**Query Parametreleri:**
- `period` (isteğe bağlı): `1_month` | `3_months` | `1_year` (varsayılan: `1_year`)

**Response:**
```json
{
  "success": true,
  "data": {
    "store_info": {
      "store_name": "ABC Halı Mağazası",
      "store_id": "store-uuid-123"
    },
    "totals": {
      "total_orders": 45,
      "total_amount": 67850.75,
      "total_product_quantity": 287,
      "total_area_m2": 1245.8
    },
    "period": "1_year",
    "start_date": "2023-07-15T00:00:00.000Z",
    "end_date": "2024-07-15T00:00:00.000Z"
  }
}
```

---

## ⚠️ Hata Yönetimi

### Yetkisiz Erişim (401)
```json
{
  "success": false,
  "message": "Kullanıcı kimlik doğrulaması gerekli"
}
```

### Yetki Yetersiz (403)
```json
{
  "success": false,
  "message": "Bu işlem için admin yetkisi gerekli"
}
```

### Sunucu Hatası (500)
```json
{
  "success": false,
  "message": "İstatistikler alınırken bir hata oluştu"
}
```

---

## 📈 Örnek Kullanımlar

### JavaScript ile Veri Çekme

```javascript
// Admin İstatistikleri
class AdminStatsAPI {
  constructor(token) {
    this.token = token;
    this.baseURL = 'http://localhost:3001/api/admin/statistics';
  }

  async getTopStores(period = '3_months') {
    const response = await fetch(`${this.baseURL}/top-stores?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.data.stores;
  }

  async getOrdersOverTime(period = '1_year', groupBy = 'month') {
    const response = await fetch(`${this.baseURL}/orders-over-time?period=${period}&groupBy=${groupBy}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.data.chart_data;
  }
}

// Mağaza İstatistikleri
class StoreStatsAPI {
  constructor(token) {
    this.token = token;
    this.baseURL = 'http://localhost:3001/api/my-statistics';
  }

  async getDashboard(period = '1_month') {
    const response = await fetch(`${this.baseURL}/dashboard?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.data;
  }

  async getMyTopProducts(period = '1_year', limit = 5) {
    const response = await fetch(`${this.baseURL}/top-products?period=${period}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.data.products;
  }
}
```

### Chart.js Entegrasyonu

```javascript
// Mağaza Dashboard için Grafik
async function createStoreDashboard(storeAPI) {
  // Dashboard verilerini al
  const dashboardData = await storeAPI.getDashboard('3_months');
  
  // Sipariş durumu pasta grafiği
  const statusCtx = document.getElementById('orderStatusChart').getContext('2d');
  new Chart(statusCtx, {
    type: 'doughnut',
    data: {
      labels: ['Bekleyen', 'Onaylanan', 'Teslim Edilen'],
      datasets: [{
        data: [
          dashboardData.orders.pending,
          dashboardData.orders.confirmed,
          dashboardData.orders.delivered
        ],
        backgroundColor: [
          '#ffc107',
          '#17a2b8',
          '#28a745'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Sipariş Durumları'
        }
      }
    }
  });

  // Zaman bazlı grafik
  const timeData = await storeAPI.getOrdersOverTime('3_months', 'month');
  const timeCtx = document.getElementById('ordersOverTimeChart').getContext('2d');
  new Chart(timeCtx, {
    type: 'line',
    data: {
      labels: timeData.map(item => item.time_period),
      datasets: [{
        label: 'Sipariş Sayısı',
        data: timeData.map(item => item.order_count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }, {
        label: 'Toplam Tutar (TL)',
        data: timeData.map(item => item.total_amount),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        yAxisID: 'y1'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Aylık Sipariş Trendi'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Sipariş Sayısı'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Tutar (TL)'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    }
  });
}
```

### PowerShell Test Script

```powershell
# Test Script
$adminToken = "your_admin_token_here"
$storeToken = "your_store_token_here"

# Admin testleri
Write-Host "=== ADMIN İSTATİSTİKLERİ ===" -ForegroundColor Green

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/admin/statistics/top-stores?period=1_year" -Method GET -Headers @{"Authorization"="Bearer $adminToken"}
$data = $response.Content | ConvertFrom-Json
Write-Host "En çok sipariş veren mağaza: $($data.data.stores[0].store_name)" -ForegroundColor Yellow

# Mağaza testleri
Write-Host "`n=== MAĞAZA İSTATİSTİKLERİ ===" -ForegroundColor Green

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/my-statistics/dashboard?period=1_month" -Method GET -Headers @{"Authorization"="Bearer $storeToken"}
$data = $response.Content | ConvertFrom-Json
Write-Host "Bu ay toplam sipariş: $($data.data.orders.total)" -ForegroundColor Yellow
Write-Host "Bu ay toplam tutar: $($data.data.financial.total_amount) TL" -ForegroundColor Yellow
```

---

## 📊 API Özeti

### Admin API'leri
- `GET /api/admin/statistics/top-stores` - En çok sipariş veren mağazalar
- `GET /api/admin/statistics/top-products` - En çok sipariş edilen ürünler  
- `GET /api/admin/statistics/orders-over-time` - Zaman bazlı sipariş grafiği
- `GET /api/admin/statistics/totals` - Sistem geneli toplam istatistikler

### Mağaza API'leri
- `GET /api/my-statistics/dashboard` - Mağaza dashboard istatistikleri
- `GET /api/my-statistics/orders-over-time` - Mağaza zaman bazlı grafik
- `GET /api/my-statistics/top-products` - Mağazanın en çok sipariş ettiği ürünler
- `GET /api/my-statistics/totals` - Mağaza toplam istatistikleri

### Ortak Özellikler
- ✅ JWT Authentication
- ✅ Zaman aralığı filtreleme (1 ay, 3 ay, 1 yıl)
- ✅ Grafik için uygun veri formatı
- ✅ Türkçe hata mesajları
- ✅ Metrekare bazlı hesaplamalar
- ✅ Gerçek zamanlı veriler

Bu API'ler ile admin paneli ve mağaza panellerinde kapsamlı dashboardlar oluşturabilirsiniz. 