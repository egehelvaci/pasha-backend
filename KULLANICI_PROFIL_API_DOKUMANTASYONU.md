# KULLANICI PROFİL YÖNETİMİ API DOKÜMANTASYONU

Bu dokümantasyon, kullanıcıların kendi profil bilgilerini ve mağaza bilgilerini güncelleyebilecekleri, ayrıca şifrelerini değiştirebilecekleri API endpoint'lerini detaylandırmaktadır.

## 📋 Genel Bakış

Bu API modülü üç ana işlevi kapsar:
1. **Profil Bilgilerini Görüntüleme** - Kullanıcı ve mağaza bilgilerini getirme
2. **Mağaza Bilgilerini Güncelleme** - Adres, telefon, vergi bilgileri vb.
3. **Şifre Değiştirme** - Güvenli şifre değişim işlemi

**Base URL:** `/api/profile`  
**Yetkilendirme:** JWT Token gerekli (tüm endpoint'ler için)

---

## 🔐 Yetkilendirme

Tüm isteklerde `Authorization` header'ı gereklidir:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 📡 API Endpoint'leri

### 1. PROFİL BİLGİLERİNİ GETİR

**Method:** `GET`  
**URL:** `/api/profile/me`  
**Açıklama:** Kullanıcının kendi bilgilerini ve mağaza bilgilerini getirir.

#### Request
```http
GET /api/profile/me
Authorization: Bearer <JWT_TOKEN>
```

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "abc-123-def-456",
      "name": "Ahmet",
      "surname": "Yılmaz",
      "username": "ahmet_yilmaz",
      "email": "ahmet@example.com",
      "phoneNumber": "+905551234567",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "userType": "viewer"
    },
    "store": {
      "store_id": "store-uuid-123",
      "kurum_adi": "ABC Halı Mağazası",
      "vergi_numarasi": "1234567890",
      "vergi_dairesi": "Kadıköy Vergi Dairesi",
      "tckn": "12345678901",
      "yetkili_adi": "Mehmet",
      "yetkili_soyadi": "Demir",
      "telefon": "0212 555 0123",
      "eposta": "info@abchali.com",
      "adres": "Atatürk Cad. No:123 Kadıköy/İstanbul",
      "faks_numarasi": "0212 555 0124",
      "is_active": true,
      "created_at": "2024-01-01T08:00:00.000Z"
    }
  }
}
```

#### Response (Mağaza Bilgisi Yok - 200)
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "abc-123-def-456",
      "name": "Ahmet",
      "surname": "Yılmaz",
      // ... diğer kullanıcı bilgileri
    },
    "store": null
  }
}
```

---

### 2. MAĞAZA BİLGİLERİNİ GÜNCELLE

**Method:** `PUT`  
**URL:** `/api/profile/store`  
**Açıklama:** Kullanıcının bağlı olduğu mağazanın bilgilerini günceller.

#### Request Body
```json
{
  "kurum_adi": "ABC Halı Mağazası Ltd. Şti.", // Zorunlu
  "vergi_numarasi": "1234567890", // Opsiyonel (10-11 haneli)
  "vergi_dairesi": "Kadıköy Vergi Dairesi", // Opsiyonel
  "tckn": "12345678901", // Opsiyonel (11 haneli)
  "yetkili_adi": "Mehmet", // Opsiyonel
  "yetkili_soyadi": "Demir", // Opsiyonel
  "telefon": "0212 555 0123", // Opsiyonel (Türkiye formatı)
  "eposta": "info@abchali.com", // Opsiyonel (email formatı)
  "adres": "Atatürk Cad. No:123 Kadıköy/İstanbul", // Opsiyonel
  "faks_numarasi": "0212 555 0124" // Opsiyonel
}
```

#### Validation Kuralları
- **kurum_adi**: Zorunlu, boş olamaz
- **tckn**: Opsiyonel, 11 haneli sayısal değer olmalıdır
- **vergi_numarasi**: 10-11 haneli sayısal değer (opsiyonel)
- **telefon**: Türkiye telefon formatı `0XXX XXX XX XX` veya `+90XXX XXX XX XX` (opsiyonel)
- **eposta**: Geçerli email formatı (opsiyonel)
- Diğer alanlar: String, maksimum uzunluk kontrolleri

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Mağaza bilgileri başarıyla güncellendi",
  "data": {
    "store_id": "store-uuid-123",
    "kurum_adi": "ABC Halı Mağazası Ltd. Şti.",
    "vergi_numarasi": "1234567890",
    "vergi_dairesi": "Kadıköy Vergi Dairesi",
    "yetkili_adi": "Mehmet",
    "yetkili_soyadi": "Demir",
    "telefon": "0212 555 0123",
    "eposta": "info@abchali.com",
    "adres": "Atatürk Cad. No:123 Kadıköy/İstanbul",
    "faks_numarasi": "0212 555 0124",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
}
```

#### Response (Validation Error - 400)
```json
{
  "success": false,
  "message": "Kurum adı zorunludur"
}
```

```json
{
  "success": false,
  "message": "Geçerli bir telefon numarası giriniz (örn: 0212 555 0123)"
}
```

#### Response (Mağaza Bağlı Değil - 400)
```json
{
  "success": false,
  "message": "Kullanıcı bir mağazaya bağlı değil"
}
```

---

### 3. ŞİFRE DEĞİŞTİR

**Method:** `PUT`  
**URL:** `/api/profile/change-password`  
**Açıklama:** Kullanıcının mevcut şifresini kontrol ederek yeni şifre belirler.

#### Request Body
```json
{
  "currentPassword": "eskiSifre123", // Zorunlu
  "newPassword": "yeniSifre456", // Zorunlu (min 6 karakter)
  "confirmPassword": "yeniSifre456" // Zorunlu (newPassword ile aynı)
}
```

#### Validation Kuralları
- **currentPassword**: Zorunlu, mevcut şifre ile eşleşmeli
- **newPassword**: Zorunlu, minimum 6 karakter
- **confirmPassword**: Zorunlu, newPassword ile tamamen aynı olmalı

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Şifreniz başarıyla değiştirildi"
}
```

#### Response (Validation Errors - 400)
```json
{
  "success": false,
  "message": "Mevcut şifre, yeni şifre ve şifre onayı gereklidir"
}
```

```json
{
  "success": false,
  "message": "Yeni şifre en az 6 karakter olmalıdır"
}
```

```json
{
  "success": false,
  "message": "Yeni şifre ve onay şifresi eşleşmiyor"
}
```

```json
{
  "success": false,
  "message": "Mevcut şifre hatalı"
}
```

---

## 🔧 Kullanım Örnekleri

### cURL ile Örnek İstekler

#### Profil Bilgilerini Getir
```bash
curl -X GET "http://localhost:3001/api/profile/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Mağaza Bilgilerini Güncelle
```bash
curl -X PUT "http://localhost:3001/api/profile/store" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "kurum_adi": "ABC Halı Mağazası Ltd. Şti.",
    "telefon": "0212 555 0123",
    "eposta": "info@abchali.com",
    "adres": "Yeni Adres Bilgisi"
  }'
```

#### Şifre Değiştir
```bash
curl -X PUT "http://localhost:3001/api/profile/change-password" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "eskiSifre123",
    "newPassword": "yeniSifre456",
    "confirmPassword": "yeniSifre456"
  }'
```

### JavaScript/Fetch ile Örnek İstekler

#### Profil Bilgilerini Getir
```javascript
const getProfile = async () => {
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch('/api/profile/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('Profil Bilgileri:', data.data)
      return data.data
    } else {
      console.error('Hata:', data.message)
    }
  } catch (error) {
    console.error('İstek hatası:', error)
  }
}
```

#### Mağaza Bilgilerini Güncelle
```javascript
const updateStoreProfile = async (storeData) => {
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch('/api/profile/store', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(storeData)
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('Güncelleme başarılı:', data.message)
      return data.data
    } else {
      console.error('Hata:', data.message)
    }
  } catch (error) {
    console.error('İstek hatası:', error)
  }
}

// Kullanım
updateStoreProfile({
  kurum_adi: "ABC Halı Mağazası Ltd. Şti.",
  telefon: "0212 555 0123",
  eposta: "info@abchali.com",
  adres: "Yeni Adres Bilgisi"
})
```

#### Şifre Değiştir
```javascript
const changePassword = async (passwordData) => {
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch('/api/profile/change-password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData)
    })
    
    const data = await response.json()
    
    if (data.success) {
      alert('Şifreniz başarıyla değiştirildi!')
      return true
    } else {
      alert('Hata: ' + data.message)
      return false
    }
  } catch (error) {
    console.error('İstek hatası:', error)
    alert('Şifre değiştirme işleminde hata oluştu')
    return false
  }
}

// Kullanım
changePassword({
  currentPassword: "eskiSifre123",
  newPassword: "yeniSifre456",
  confirmPassword: "yeniSifre456"
})
```

---

## 🚀 Frontend Entegrasyonu

### React Component Örnekleri

#### 1. Profil Bilgileri Component'i
```jsx
import React, { useState, useEffect } from 'react'

const UserProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
      }
    } catch (error) {
      console.error('Profil alınırken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Yükleniyor...</div>

  return (
    <div className="user-profile">
      <div className="user-info">
        <h2>{profile.user.name} {profile.user.surname}</h2>
        <p>Email: {profile.user.email}</p>
        <p>Telefon: {profile.user.phoneNumber}</p>
        <p>Kullanıcı Adı: {profile.user.username}</p>
      </div>

      {profile.store && (
        <div className="store-info">
          <h3>Mağaza Bilgileri</h3>
          <p>Kurum Adı: {profile.store.kurum_adi}</p>
          <p>Telefon: {profile.store.telefon}</p>
          <p>Email: {profile.store.eposta}</p>
          <p>Adres: {profile.store.adres}</p>
        </div>
      )}
    </div>
  )
}

export default UserProfile
```

#### 2. Mağaza Güncelleme Form'u
```jsx
import React, { useState, useEffect } from 'react'

const StoreProfileForm = () => {
  const [formData, setFormData] = useState({
    kurum_adi: '',
    vergi_numarasi: '',
    vergi_dairesi: '',
    yetkili_adi: '',
    yetkili_soyadi: '',
    telefon: '',
    eposta: '',
    adres: '',
    faks_numarasi: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Mevcut bilgileri getir
    fetchCurrentStoreData()
  }, [])

  const fetchCurrentStoreData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      if (data.success && data.data.store) {
        setFormData({
          kurum_adi: data.data.store.kurum_adi || '',
          vergi_numarasi: data.data.store.vergi_numarasi || '',
          vergi_dairesi: data.data.store.vergi_dairesi || '',
          yetkili_adi: data.data.store.yetkili_adi || '',
          yetkili_soyadi: data.data.store.yetkili_soyadi || '',
          telefon: data.data.store.telefon || '',
          eposta: data.data.store.eposta || '',
          adres: data.data.store.adres || '',
          faks_numarasi: data.data.store.faks_numarasi || ''
        })
      }
    } catch (error) {
      console.error('Mağaza bilgileri alınırken hata:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/store', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage('Mağaza bilgileri başarıyla güncellendi!')
      } else {
        setMessage('Hata: ' + data.message)
      }
    } catch (error) {
      setMessage('Güncelleme sırasında hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="store-profile-form">
      <h2>Mağaza Bilgilerini Güncelle</h2>
      
      <div className="form-group">
        <label>Kurum Adı *</label>
        <input
          type="text"
          name="kurum_adi"
          value={formData.kurum_adi}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Vergi Numarası</label>
        <input
          type="text"
          name="vergi_numarasi"
          value={formData.vergi_numarasi}
          onChange={handleChange}
          placeholder="10-11 haneli sayısal değer"
        />
      </div>

      <div className="form-group">
        <label>Vergi Dairesi</label>
        <input
          type="text"
          name="vergi_dairesi"
          value={formData.vergi_dairesi}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Yetkili Adı</label>
          <input
            type="text"
            name="yetkili_adi"
            value={formData.yetkili_adi}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Yetkili Soyadı</label>
          <input
            type="text"
            name="yetkili_soyadi"
            value={formData.yetkili_soyadi}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Telefon</label>
        <input
          type="tel"
          name="telefon"
          value={formData.telefon}
          onChange={handleChange}
          placeholder="0212 555 0123"
        />
      </div>

      <div className="form-group">
        <label>E-posta</label>
        <input
          type="email"
          name="eposta"
          value={formData.eposta}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Adres</label>
        <textarea
          name="adres"
          value={formData.adres}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Faks Numarası</label>
        <input
          type="tel"
          name="faks_numarasi"
          value={formData.faks_numarasi}
          onChange={handleChange}
        />
      </div>

      {message && (
        <div className={`message ${message.startsWith('Hata') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Güncelleniyor...' : 'Güncelle'}
      </button>
    </form>
  )
}

export default StoreProfileForm
```

#### 3. Şifre Değiştirme Form'u
```jsx
import React, { useState } from 'react'

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Frontend validasyonu
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Yeni şifre ve onay şifresi eşleşmiyor')
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setMessage('Yeni şifre en az 6 karakter olmalıdır')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage('Şifreniz başarıyla değiştirildi!')
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setMessage('Hata: ' + data.message)
      }
    } catch (error) {
      setMessage('Şifre değiştirme sırasında hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="change-password-form">
      <h2>Şifre Değiştir</h2>
      
      <div className="form-group">
        <label>Mevcut Şifre *</label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Yeni Şifre *</label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          required
          minLength={6}
        />
        <small>En az 6 karakter olmalıdır</small>
      </div>

      <div className="form-group">
        <label>Yeni Şifre Onayı *</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      {message && (
        <div className={`message ${message.startsWith('Hata') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Değiştiriliyor...' : 'Şifre Değiştir'}
      </button>
    </form>
  )
}

export default ChangePasswordForm
```

---

## 🎨 CSS Stilleri Örnekleri

```css
/* Form stilleri */
.store-profile-form,
.change-password-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-group small {
  color: #666;
  font-size: 12px;
}

/* Mesaj stilleri */
.message {
  padding: 10px;
  margin: 15px 0;
  border-radius: 4px;
  font-weight: bold;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Buton stilleri */
button {
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

/* Profil bilgileri */
.user-profile {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.user-info,
.store-info {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-info h2,
.store-info h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.user-info p,
.store-info p {
  margin: 8px 0;
  color: #666;
}
```

---

## ✅ Best Practices

### 1. Güvenlik Önlemleri
```javascript
// Token kontrolü
const checkTokenValidity = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    window.location.href = '/login'
    return false
  }
  return true
}

// Her API çağrısından önce kontrol
const makeAuthenticatedRequest = async (url, options = {}) => {
  if (!await checkTokenValidity()) return null
  
  const token = localStorage.getItem('token')
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
}
```

### 2. Error Handling
```javascript
const handleApiError = (response, data) => {
  if (response.status === 401) {
    // Token süresi dolmuş
    localStorage.removeItem('token')
    window.location.href = '/login'
    return
  }
  
  if (response.status === 403) {
    alert('Bu işlem için yetkiniz bulunmuyor')
    return
  }
  
  if (response.status >= 500) {
    alert('Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin')
    return
  }
  
  // Diğer hatalar için mesajı göster
  alert(data.message || 'Bir hata oluştu')
}
```

### 3. Form Validation
```javascript
const validateStoreForm = (formData) => {
  const errors = {}
  
  if (!formData.kurum_adi.trim()) {
    errors.kurum_adi = 'Kurum adı zorunludur'
  }
  
  if (formData.eposta && !/\S+@\S+\.\S+/.test(formData.eposta)) {
    errors.eposta = 'Geçerli bir e-posta adresi giriniz'
  }
  
  if (formData.telefon && !/^(\+90|0)?[1-9][0-9]{9}$/.test(formData.telefon.replace(/[\s\-\(\)]/g, ''))) {
    errors.telefon = 'Geçerli bir telefon numarası giriniz'
  }
  
  if (formData.vergi_numarasi && !/^[0-9]{10,11}$/.test(formData.vergi_numarasi.replace(/\s/g, ''))) {
    errors.vergi_numarasi = 'Vergi numarası 10-11 haneli sayısal değer olmalıdır'
  }
  
  return errors
}
```

### 4. Loading States
```javascript
const [loading, setLoading] = useState({
  profile: false,
  store: false,
  password: false
})

const updateLoadingState = (key, value) => {
  setLoading(prev => ({ ...prev, [key]: value }))
}

// Kullanım
updateLoadingState('store', true)
// ... API çağrısı
updateLoadingState('store', false)
```

---

## 🔧 Troubleshooting

### Yaygın Hatalar ve Çözümleri

#### 1. Token Süresi Dolmuş
**Hata:** 401 Unauthorized  
**Çözüm:** Kullanıcıyı login sayfasına yönlendir

#### 2. Validation Hataları
**Neden:** Frontend'de eksik validasyon  
**Çözüm:** Form gönderiminden önce client-side validation

#### 3. Mağaza Bağlı Değil
**Neden:** Kullanıcının mağaza ataması yok  
**Çözüm:** UI'da mağaza bilgilerini gizle veya admin ile iletişim mesajı

#### 4. Şifre Değiştirme Başarısız
**Neden:** Mevcut şifre hatalı  
**Çözüm:** Kullanıcıya açık hata mesajı göster

---

## 📈 Performans Optimizasyonu

### 1. Debouncing (Form Validasyonu)
```javascript
import { useMemo } from 'react'
import { debounce } from 'lodash'

const debouncedValidation = useMemo(
  () => debounce((formData) => {
    const errors = validateStoreForm(formData)
    setFormErrors(errors)
  }, 300),
  []
)

// Form değişikliklerinde kullan
useEffect(() => {
  debouncedValidation(formData)
}, [formData, debouncedValidation])
```

### 2. Memoization
```javascript
import { memo, useMemo } from 'react'

const UserProfile = memo(({ profile }) => {
  const formattedProfile = useMemo(() => ({
    fullName: `${profile.user.name} ${profile.user.surname}`,
    storeAddress: profile.store?.adres || 'Adres belirtilmemiş'
  }), [profile])

  return (
    <div>
      <h2>{formattedProfile.fullName}</h2>
      <p>{formattedProfile.storeAddress}</p>
    </div>
  )
})
```

### 3. Caching
```javascript
// Simple cache implementation
const profileCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika

const getCachedProfile = () => {
  const cached = profileCache.get('userProfile')
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }
  return null
}

const setCachedProfile = (data) => {
  profileCache.set('userProfile', {
    data,
    timestamp: Date.now()
  })
}
```

---

Bu API sayesinde kullanıcılar kendi profil bilgilerini güvenli bir şekilde yönetebilir, mağaza bilgilerini güncelleyebilir ve şifrelerini değiştirebilirler. Tüm işlemler JWT token ile korunmakta ve kapsamlı validasyon kuralları uygulanmaktadır. 