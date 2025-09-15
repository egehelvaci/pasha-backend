# Contact Form API Dokümantasyonu

## Genel Bakış

Contact Form API, müşterilerin iletişim taleplerini gönderebileceği ve admin panelinden yönetilebileceği endpoint'lerdir. Sistem otomatik e-posta onayı gönderir ve admin tarafından takip edilebilir.

## Base URL

```
https://your-domain.com/api
```

## Özellikler

✅ **Public Form Submission** - Token gerektirmeden form gönderilebilir  
✅ **Otomatik E-posta Onayı** - Müşteriye onay e-postası gönderilir  
✅ **Admin Yönetim Paneli** - Tüm talepler admin tarafından görülebilir  
✅ **Filtreleme ve Arama** - Talepler filtrelenebilir ve aranabilir  
✅ **Durum Takibi** - Okundu/İletişim kuruldu durumları  
✅ **Talep Silme** - Admin talepler silebilir  

---

## Database Schema

```sql
CREATE TABLE contact_forms (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL,
  authority_name VARCHAR(100) NOT NULL,
  authority_surname VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_contacted BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Public Endpoints (Token Gerektirmez)

### 1. İletişim Formu Gönder

Yeni bir iletişim talebi oluşturur ve müşteriye onay e-postası gönderir.

#### Request

```http
POST /api/contact/submit
```

#### Headers

```http
Content-Type: application/json
```

#### Request Body

```json
{
  "companyName": "Örnek Firma Ltd.",
  "authorityName": "Ahmet",
  "authoritySurname": "Yılmaz",
  "email": "ahmet@ornekfirma.com",
  "phone": "+90 532 123 45 67",
  "address": "Atatürk Cad. No:123 Çankaya/ANKARA"
}
```

#### Validation Rules

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `companyName` | string | ✅ | Firma adı |
| `authorityName` | string | ✅ | Yetkili adı |
| `authoritySurname` | string | ✅ | Yetkili soyadı |
| `email` | string | ✅ | Geçerli e-posta formatı |
| `phone` | string | ✅ | Minimum 10 karakter, sayı/özel karakter |
| `address` | string | ✅ | Firma adresi |

#### Response

**Success (201)**

```json
{
  "success": true,
  "message": "İletişim talebiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.",
  "data": {
    "id": 123,
    "submittedAt": "2025-09-15T12:30:00.000Z"
  }
}
```

**Validation Error (400)**

```json
{
  "success": false,
  "message": "Tüm alanlar zorunludur (Firma Adı, Yetkili Ad-Soyad, E-posta, Telefon, Adres)"
}
```

```json
{
  "success": false,
  "message": "Geçerli bir e-posta adresi giriniz"
}
```

```json
{
  "success": false,
  "message": "Geçerli bir telefon numarası giriniz"
}
```

**Server Error (500)**

```json
{
  "success": false,
  "message": "İletişim formu gönderilirken bir hata oluştu"
}
```

---

## Admin Endpoints (Token Gerektirir)

### Authentication

Tüm admin endpoint'leri için `Authorization` header'ı gereklidir:

```http
Authorization: Bearer <admin_token>
```

Admin veya Editor yetkisi gereklidir.

---

### 2. Tüm İletişim Formlarını Getir

Admin paneli için tüm iletişim taleplerini listeler.

#### Request

```http
GET /api/admin/contact-forms
```

#### Query Parameters

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| `page` | number | 1 | Sayfa numarası |
| `limit` | number | 20 | Sayfa başına öğe (max: 100) |
| `isRead` | boolean | - | Okunma durumu filtresi |
| `isContacted` | boolean | - | İletişim durumu filtresi |
| `search` | string | - | Firma/yetkili/e-posta arama |

#### Example Request

```http
GET /api/admin/contact-forms?page=1&limit=10&isRead=false&search=ahmet
```

#### Response

**Success (200)**

```json
{
  "success": true,
  "message": "İletişim formları başarıyla getirildi",
  "data": {
    "contactForms": [
      {
        "id": 123,
        "companyName": "Örnek Firma Ltd.",
        "authorityName": "Ahmet",
        "authoritySurname": "Yılmaz",
        "authorityFullName": "Ahmet Yılmaz",
        "email": "ahmet@ornekfirma.com",
        "phone": "+90 532 123 45 67",
        "address": "Atatürk Cad. No:123 Çankaya/ANKARA",
        "isRead": false,
        "isContacted": false,
        "notes": null,
        "createdAt": "2025-09-15T12:30:00.000Z",
        "updatedAt": "2025-09-15T12:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 3. İletişim Formu Durumunu Güncelle

Bir iletişim talebinin okunma durumunu, iletişim durumunu veya notlarını günceller.

#### Request

```http
PUT /api/admin/contact-forms/{id}
```

#### Path Parameters

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| `id` | number | İletişim formu ID'si |

#### Request Body

```json
{
  "isRead": true,
  "isContacted": true,
  "notes": "Müşteri ile görüşüldü, teklif gönderildi."
}
```

#### Body Parameters

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `isRead` | boolean | ❌ | Okundu durumu |
| `isContacted` | boolean | ❌ | İletişim kuruldu durumu |
| `notes` | string | ❌ | Admin notları |

#### Response

**Success (200)**

```json
{
  "success": true,
  "message": "İletişim formu başarıyla güncellendi",
  "data": {
    "id": 123,
    "companyName": "Örnek Firma Ltd.",
    "authorityName": "Ahmet",
    "authoritySurname": "Yılmaz",
    "email": "ahmet@ornekfirma.com",
    "phone": "+90 532 123 45 67",
    "address": "Atatürk Cad. No:123 Çankaya/ANKARA",
    "isRead": true,
    "isContacted": true,
    "notes": "Müşteri ile görüşüldü, teklif gönderildi.",
    "createdAt": "2025-09-15T12:30:00.000Z",
    "updatedAt": "2025-09-15T13:45:00.000Z"
  }
}
```

**Not Found (404)**

```json
{
  "success": false,
  "message": "İletişim formu bulunamadı"
}
```

---

### 4. İletişim Formunu Sil

Bir iletişim talebini sistemden tamamen kaldırır.

#### Request

```http
DELETE /api/admin/contact-forms/{id}
```

#### Path Parameters

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| `id` | number | İletişim formu ID'si |

#### Response

**Success (200)**

```json
{
  "success": true,
  "message": "İletişim formu başarıyla silindi",
  "data": {
    "deletedForm": {
      "id": 123,
      "companyName": "Örnek Firma Ltd.",
      "authorityName": "Ahmet Yılmaz",
      "email": "ahmet@ornekfirma.com"
    }
  }
}
```

**Not Found (404)**

```json
{
  "success": false,
  "message": "İletişim formu bulunamadı"
}
```

---

## E-posta Konfigürasyonu

### Environment Variables

`.env` dosyasında aşağıdaki değişkenleri tanımlayın:

```env
# SMTP E-posta Ayarları
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@your-domain.com
```

### Gmail Kullanımı

Gmail kullanıyorsanız:

1. **2FA'yı etkinleştirin**
2. **App Password oluşturun**
3. `SMTP_PASS` olarak app password kullanın

### E-posta Template

Müşteriye gönderilen onay e-postası şunları içerir:

- ✅ Kişiselleştirilmiş selamlama
- ✅ Gönderilen bilgilerin özeti  
- ✅ Profesyonel HTML tasarım
- ✅ Otomatik e-posta uyarısı

---

## Kullanım Örnekleri

### Frontend Form Implementation

```html
<!-- HTML Form -->
<form id="contactForm">
  <input type="text" name="companyName" placeholder="Firma Adı" required>
  <input type="text" name="authorityName" placeholder="Yetkili Adı" required>
  <input type="text" name="authoritySurname" placeholder="Yetkili Soyadı" required>
  <input type="email" name="email" placeholder="E-posta" required>
  <input type="tel" name="phone" placeholder="Telefon" required>
  <textarea name="address" placeholder="Adres" required></textarea>
  <button type="submit">Gönder</button>
</form>
```

```javascript
// JavaScript Form Handler
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  
  try {
    const response = await fetch('/api/contact/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Talebiniz başarıyla gönderildi!');
      e.target.reset();
    } else {
      alert('Hata: ' + result.message);
    }
  } catch (error) {
    console.error('Form gönderme hatası:', error);
    alert('Bir hata oluştu, lütfen tekrar deneyin.');
  }
});
```

### React Form Component

```jsx
import React, { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    companyName: '',
    authorityName: '',
    authoritySurname: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Talebiniz başarıyla gönderildi!');
        setFormData({
          companyName: '',
          authorityName: '',
          authoritySurname: '',
          email: '',
          phone: '',
          address: ''
        });
      } else {
        alert('Hata: ' + result.message);
      }
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      alert('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <input
        type="text"
        name="companyName"
        value={formData.companyName}
        onChange={handleChange}
        placeholder="Firma Adı"
        required
      />
      <input
        type="text"
        name="authorityName"
        value={formData.authorityName}
        onChange={handleChange}
        placeholder="Yetkili Adı"
        required
      />
      <input
        type="text"
        name="authoritySurname"
        value={formData.authoritySurname}
        onChange={handleChange}
        placeholder="Yetkili Soyadı"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="E-posta"
        required
      />
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Telefon"
        required
      />
      <textarea
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Adres"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Gönderiliyor...' : 'Gönder'}
      </button>
    </form>
  );
}
```

### Admin Panel Integration

```javascript
// Admin: İletişim formlarını getir
async function getContactForms(page = 1, filters = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '20',
    ...filters
  });

  const response = await fetch(`/api/admin/contact-forms?${params}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
}

// Admin: Form durumunu güncelle
async function updateContactForm(id, updates) {
  const response = await fetch(`/api/admin/contact-forms/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  return response.json();
}

// Admin: Formu sil
async function deleteContactForm(id) {
  const response = await fetch(`/api/admin/contact-forms/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
}
```

---

## Güvenlik

### Rate Limiting

Production ortamında form endpoint'ine rate limiting uygulanması önerilir:

```javascript
// nginx.conf veya cloudflare rules
location /api/contact/submit {
    limit_req zone=contact_form burst=5 nodelay;
}
```

### Spam Koruması

- ✅ **E-posta format kontrolü**
- ✅ **Telefon format kontrolü**  
- ✅ **Zorunlu alan kontrolü**
- ⚠️ **Captcha entegrasyonu** önerilir (Google reCAPTCHA)
- ⚠️ **Honeypot alanları** eklenebilir

### CORS Ayarları

```javascript
// Specific origins için CORS
app.use('/api/contact', cors({
  origin: ['https://your-website.com'],
  methods: ['POST'],
  credentials: false
}));
```

---

## Monitoring ve Analytics

### Önemli Metrikler

- 📊 **Günlük form sayısı**
- 📊 **Yanıt oranı** (contacted / total)
- 📊 **E-posta başarı oranı**
- 📊 **Ortalama yanıt süresi**

### Log Örnekleri

```javascript
// Başarılı form gönderimi
console.log('📝 Yeni iletişim formu alındı:', {
  companyName: 'Örnek Firma',
  authorityName: 'Ahmet Yılmaz',
  email: 'ahmet@example.com',
  phone: '+90 532 123 45 67'
});

// E-posta gönderimi
console.log('✅ Onay e-postası gönderildi:', 'ahmet@example.com');

// Admin işlemleri
console.log('✅ İletişim formu güncellendi: 123', { isRead: true });
console.log('🗑️ İletişim formu silindi: 123 - Örnek Firma');
```

---

## Hata Kodları

| HTTP Status | Açıklama |
|-------------|----------|
| `201` | Form başarıyla gönderildi |
| `200` | Admin işlem başarılı |
| `400` | Geçersiz veri/parametre |
| `401` | Kimlik doğrulama gerekli |
| `403` | Yetki yetersiz |
| `404` | Form bulunamadı |
| `500` | Sunucu hatası |

---

## Changelog

### v1.0.0 (2025-09-15)
- ✨ İlk sürüm yayınlandı
- ✅ Public form submission endpoint'i
- ✅ Otomatik e-posta onayı
- ✅ Admin yönetim paneli
- ✅ Filtreleme ve arama
- ✅ Durum takibi (okundu/iletişim kuruldu)
- ✅ Talep silme özelliği

---

## Destek

Bu API ile ilgili sorularınız için:
- 📧 **E-posta**: support@your-domain.com
- 📚 **Dokümantasyon**: Bu dosya
- 🐛 **Bug Report**: GitHub Issues
