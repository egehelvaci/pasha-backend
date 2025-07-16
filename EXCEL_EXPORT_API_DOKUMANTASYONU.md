# Excel Export API Dokümantasyonu

Bu API'ler admin kullanıcıların sipariş ve muhasebe hareketlerini Excel formatında export etmelerini sağlar. Günlük, haftalık, aylık, yıllık raporlar veya belirli tarih aralıkları için kullanılabilir.

## Gereksinimler

- **Authentication**: Admin JWT token gerekli
- **Content-Type**: Excel dosyaları binary olarak döner
- **File Format**: `.xlsx` (Excel 2007+)

---

## 📊 Sipariş Excel Export

### Endpoint
**GET** `/api/admin/export/orders`

### Query Parametreleri

| Parametre | Tip | Zorunlu | Açıklama | Örnek Değerler |
|-----------|-----|---------|----------|----------------|
| `period` | string | Hayır | Zaman aralığı (varsayılan: custom) | `daily`, `weekly`, `monthly`, `yearly`, `custom` |
| `start_date` | string | Evet* | Başlangıç tarihi (custom için zorunlu) | `2024-01-01` |
| `end_date` | string | Evet* | Bitiş tarihi (custom için zorunlu) | `2024-12-31` |
| `status` | string | Hayır | Sipariş durumu filtresi | `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELED` |
| `format` | string | Hayır | Export formatı (varsayılan: summary) | `summary`, `detailed` |

*`period=custom` olduğunda zorunlu

### Zaman Aralığı Örnekleri

```bash
# Günlük (bugün)
GET /api/admin/export/orders?period=daily

# Haftalık (son 7 gün) 
GET /api/admin/export/orders?period=weekly

# Aylık (bu ay)
GET /api/admin/export/orders?period=monthly

# Yıllık (bu yıl)
GET /api/admin/export/orders?period=yearly

# Özel tarih aralığı
GET /api/admin/export/orders?period=custom&start_date=2024-01-01&end_date=2024-06-30
```

### Export Formatları

#### 1. Özet Format (`format=summary`)
Her sipariş için tek satır, genel bilgiler:

| Sütun | Açıklama |
|-------|----------|
| Sipariş ID | Benzersiz sipariş kimliği |
| Mağaza Adı | Siparişi veren mağaza |
| Müşteri Adı | Sipariş sahibi |
| Sipariş Tarihi | Oluşturulma tarihi |
| Durum | Mevcut sipariş durumu |
| Toplam Tutar (TL) | Sipariş toplam tutarı |
| Ürün Adedi | Toplam ürün adedi |
| Toplam Alan (m²) | Toplam metrekare |

#### 2. Detaylı Format (`format=detailed`)
Her sipariş kalemi için ayrı satır:

| Sütun | Açıklama |
|-------|----------|
| Sipariş ID | Benzersiz sipariş kimliği |
| Mağaza Adı | Siparişi veren mağaza |
| Müşteri Adı | Sipariş sahibi |
| Sipariş Tarihi | Oluşturulma tarihi |
| Durum | Mevcut sipariş durumu |
| Ürün Adı | Sipariş kalemi ürün adı |
| Koleksiyon | Ürün koleksiyonu |
| Adet | Sipariş edilen adet |
| En (cm) | Ürün eni |
| Boy (cm) | Ürün boyu |
| Alan (m²) | Kalem toplam alanı |
| Birim Fiyat (TL) | Kalem birim fiyatı |
| Toplam Fiyat (TL) | Kalem toplam fiyatı |
| Kesim Tipi | standart/oval/yuvarlak |
| Saçak | Evet/Hayır |

### Örnek Kullanım

```bash
# Özet format - bu ayın siparişleri
curl -X GET "http://localhost:3001/api/admin/export/orders?period=monthly&format=summary" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output "siparisler_ozet.xlsx"

# Detaylı format - belirli tarih aralığı
curl -X GET "http://localhost:3001/api/admin/export/orders?period=custom&start_date=2024-01-01&end_date=2024-06-30&format=detailed" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output "siparisler_detay.xlsx"

# Sadece onaylanmış siparişler
curl -X GET "http://localhost:3001/api/admin/export/orders?period=yearly&status=CONFIRMED" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output "onaylanmis_siparisler.xlsx"
```

### Response

**Başarılı (200)**
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="siparisler_2024-01-01_2024-12-31.xlsx"`
- **Body**: Excel dosyası binary data

**Hata (500)**
```json
{
  "success": false,
  "message": "Excel export sırasında hata oluştu"
}
```

---

## 💰 Muhasebe Hareketleri Excel Export

### Endpoint
**GET** `/api/admin/export/accounting-transactions`

### Query Parametreleri

| Parametre | Tip | Zorunlu | Açıklama | Örnek Değerler |
|-----------|-----|---------|----------|----------------|
| `period` | string | Hayır | Zaman aralığı (varsayılan: custom) | `daily`, `weekly`, `monthly`, `yearly`, `custom` |
| `start_date` | string | Evet* | Başlangıç tarihi (custom için zorunlu) | `2024-01-01` |
| `end_date` | string | Evet* | Bitiş tarihi (custom için zorunlu) | `2024-12-31` |
| `store_id` | string | Hayır | Mağaza ID filtresi | `store-uuid-123` |
| `transaction_type` | string | Hayır | İşlem türü filtresi | `OCTET_PAYMENT`, `BALANCE_UPDATE` |
| `is_expense` | string | Hayır | Gelir/Gider filtresi | `true`, `false` |

### Excel Format

Muhasebe hareketleri Excel'i şu kolonları içerir:

| Sütun | Açıklama |
|-------|----------|
| İşlem ID | Benzersiz işlem kimliği |
| Mağaza Adı | İşlem yapılan mağaza |
| Müşteri Adı | İşlem sahibi |
| İşlem Tarihi | İşlem gerçekleşme tarihi |
| İşlem Türü | İşlem kategorisi |
| Tutar (TL) | İşlem tutarı (renkli) |
| Tür | GELİR/GİDER (renkli) |
| Metrekare | İlgili alan bilgisi |
| Koleksiyon | İlişkili koleksiyon (varsa) |
| Açıklama | İşlem detayı |

### Özel Özellikler

1. **Renk Kodlaması**:
   - 🟢 Yeşil: Gelir kalemleri
   - 🔴 Kırmızı: Gider kalemleri

2. **Otomatik Hesaplamalar**:
   - Toplam Gelir
   - Toplam Gider  
   - Net Bakiye

3. **Özet Satırları**:
   Excel'in sonunda renk kodlu özet satırları eklenir.

### Örnek Kullanım

```bash
# Bu ayın tüm hareketleri
curl -X GET "http://localhost:3001/api/admin/export/accounting-transactions?period=monthly" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output "muhasebe_hareketleri.xlsx"

# Belirli mağazanın hareketleri
curl -X GET "http://localhost:3001/api/admin/export/accounting-transactions?period=custom&start_date=2024-01-01&end_date=2024-12-31&store_id=store-123" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output "magaza_hareketleri.xlsx"

# Sadece gelir kalemleri
curl -X GET "http://localhost:3001/api/admin/export/accounting-transactions?period=yearly&is_expense=false" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output "gelir_kayitlari.xlsx"

# Octet ödemeleri
curl -X GET "http://localhost:3001/api/admin/export/accounting-transactions?period=yearly&transaction_type=OCTET_PAYMENT" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output "octet_odemeler.xlsx"
```

---

## 📁 Dosya Adlandırma

Otomatik oluşturulan dosya adları:

### Sipariş Raporları
- **Format**: `siparisler_{start_date}_{end_date}.xlsx`
- **Örnek**: `siparisler_2024-01-01_2024-12-31.xlsx`

### Muhasebe Raporları  
- **Format**: `muhasebe_hareketleri_{start_date}_{end_date}.xlsx`
- **Örnek**: `muhasebe_hareketleri_2024-01-01_2024-12-31.xlsx`

---

## 🎨 Excel Stil Özellikleri

### Genel Özellikler
- **Başlık Satırı**: Mavi arka plan, beyaz yazı, kalın
- **Veri Satırları**: İnce kenarlık, otomatik genişlik
- **Toplam Satırları**: Gri arka plan, kalın yazı
- **Sayı Formatları**: TL için Türk Lirası sembolü

### Sipariş Excel'i
- **Tutar Kolonları**: `#,##0.00₺` formatı
- **Alan Kolonları**: `#,##0.00` formatı (m² birimi)
- **Tarih Kolonları**: Türkçe tarih formatı

### Muhasebe Excel'i
- **Gelir Tutarları**: Yeşil renk (#008000)
- **Gider Tutarları**: Kırmızı renk (#FF0000)
- **Özet Satırları**: Renkli arka planlar
- **Net Bakiye**: Durum bazlı renklendirme

---

## 🔧 Frontend Entegrasyonu

### JavaScript Örneği

```javascript
// Sipariş export
async function exportOrders(period, startDate, endDate, format = 'summary') {
  const params = new URLSearchParams({
    period,
    format,
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate })
  });

  const response = await fetch(`/api/admin/export/orders?${params}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siparisler_${startDate}_${endDate}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

// Muhasebe export
async function exportAccounting(period, startDate, endDate, filters = {}) {
  const params = new URLSearchParams({
    period,
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
    ...filters
  });

  const response = await fetch(`/api/admin/export/accounting-transactions?${params}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muhasebe_${startDate}_${endDate}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

// Kullanım örnekleri
exportOrders('monthly', null, null, 'summary');
exportOrders('custom', '2024-01-01', '2024-06-30', 'detailed');
exportAccounting('yearly', null, null, { is_expense: 'false' });
```

### React Komponenti Örneği

```jsx
import React, { useState } from 'react';

const ExportManager = ({ adminToken }) => {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExportOrders = async (format) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        format,
        ...(period === 'custom' && { start_date: startDate, end_date: endDate })
      });

      const response = await fetch(`/api/admin/export/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `siparisler_${startDate || 'current'}_${endDate || 'now'}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-manager">
      <h3>Excel Export</h3>
      
      <div className="period-selector">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="daily">Günlük</option>
          <option value="weekly">Haftalık</option>
          <option value="monthly">Aylık</option>
          <option value="yearly">Yıllık</option>
          <option value="custom">Özel Tarih</option>
        </select>
      </div>

      {period === 'custom' && (
        <div className="date-range">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Başlangıç Tarihi"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Bitiş Tarihi"
          />
        </div>
      )}

      <div className="export-buttons">
        <button 
          onClick={() => handleExportOrders('summary')}
          disabled={loading}
        >
          {loading ? 'Hazırlanıyor...' : 'Sipariş Özeti Export'}
        </button>
        
        <button 
          onClick={() => handleExportOrders('detailed')}
          disabled={loading}
        >
          {loading ? 'Hazırlanıyor...' : 'Detaylı Sipariş Export'}
        </button>
      </div>
    </div>
  );
};

export default ExportManager;
```

---

## 🔒 Güvenlik ve Yetkilendirme

### Gerekli Yetkiler
- **Admin Role**: Tüm export işlemleri için admin yetkisi gerekli
- **JWT Token**: Geçerli admin JWT token zorunlu
- **Rate Limiting**: Büyük raporlar için uygun timeout ayarları

### Güvenlik Önlemleri
1. **Input Validation**: Tarih formatları doğrulanır
2. **SQL Injection**: Prisma ORM koruması
3. **Memory Management**: Büyük dosyalar için stream kullanımı
4. **File Size Limits**: Çok büyük raporlar için uyarı

---

## 📈 Performans Optimizasyonu

### Veritabanı Optimizasyonu
- **İndeksler**: Tarih ve durum kolonlarında indeks kullanımı
- **Pagination**: Büyük veri setleri için sayfalama
- **Select Optimizasyonu**: Sadece gerekli kolonları seçme

### Memory Yönetimi
- **Streaming**: Büyük dosyalar için streaming export
- **Garbage Collection**: Excel buffer'ları için otomatik temizlik
- **Timeout Handling**: Uzun süren işlemler için timeout

---

## ❗ Hata Durumları

### Yaygın Hatalar

1. **Geçersiz Tarih Formatı**
   ```json
   {
     "success": false,
     "message": "Geçersiz tarih formatı"
   }
   ```

2. **Yetki Hatası**
   ```json
   {
     "success": false,
     "message": "Admin yetkisi gerekli"
   }
   ```

3. **Veri Bulunamadı**
   ```json
   {
     "success": false,
     "message": "Belirtilen tarih aralığında veri bulunamadı"
   }
   ```

4. **Sunucu Hatası**
   ```json
   {
     "success": false,
     "message": "Excel export sırasında hata oluştu"
   }
   ```

### Troubleshooting
- **Büyük dosyalar**: Tarih aralığını küçültün
- **Timeout**: Request timeout süresini artırın
- **Memory issues**: Detaylı format yerine özet format kullanın

---

Bu API'ler ile admin kullanıcılar kapsamlı Excel raporları oluşturabilir ve muhasebe takiplerini kolaylaştırabilirler. Hem sipariş hem de finansal veriler için profesyonel formatlı Excel dosyaları sağlanır. 