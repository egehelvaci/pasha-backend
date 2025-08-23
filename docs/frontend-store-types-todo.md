# Frontend Mağaza Türleri Sistemi - Yapılacaklar Listesi

## 🎯 Genel Bakış

Bu dokümantasyon, mağaza türleri sisteminin frontend'de implementasyonu için gerekli tüm değişiklikleri içerir.

## 📋 Ana Yapılacaklar

### 1. 🏪 **Mağaza Yönetimi Geliştirmeleri**

#### **1.1 Mağaza Oluşturma Formu**
- [ ] Mağaza türü seçimi dropdown'u ekle
  ```jsx
  <Select name="store_type" label="Mağaza Türü">
    <Option value="KARGO">Kargo</Option>
    <Option value="SERVIS">Servis</Option>
    <Option value="KENDI_ALAN">Kendi Alan</Option>
    <Option value="AMBAR">Ambar</Option>
  </Select>
  ```
- [ ] Form validasyonu ekle (mağaza türü zorunlu)
- [ ] Mağaza türü açıklamalarını tooltip olarak göster

#### **1.2 Mağaza Düzenleme Formu**
- [ ] Mevcut mağaza türünü göster
- [ ] Mağaza türü değiştirme özelliği ekle
- [ ] Değişiklik onay modalı ekle
  ```jsx
  <Modal title="Mağaza Türü Değişikliği">
    <p>Mağaza türünü değiştirmek QR kod ve fiş formatlarını etkileyecektir.</p>
    <p>Devam etmek istiyor musunuz?</p>
  </Modal>
  ```

#### **1.3 Mağaza Listesi**
- [ ] Mağaza türü kolonu ekle
- [ ] Mağaza türüne göre filtreleme ekle
- [ ] Mağaza türü badge'leri ekle (renk kodlu)
  ```jsx
  const storeTypeBadges = {
    KARGO: { color: 'blue', text: 'Kargo' },
    SERVIS: { color: 'green', text: 'Servis' },
    KENDI_ALAN: { color: 'purple', text: 'Kendi Alan' },
    AMBAR: { color: 'orange', text: 'Ambar' }
  };
  ```

### 2. 📱 **QR Kod Geliştirmeleri**

#### **2.1 QR Kod Yazdırma Sayfası**
- [ ] Mağaza türünü API'den al
- [ ] Mağaza türüne göre QR kod altına bilgi ekle

**KARGO/AMBAR için:**
```jsx
<div className="qr-info-kargo">
  <h3>Teslimat Bilgileri</h3>
  <p><strong>Mağaza:</strong> {qrData.magaza_adi}</p>
  <p><strong>Telefon:</strong> {qrData.telefon}</p>
  <p><strong>Adres:</strong> {qrData.adres}</p>
  <p><strong>Ürün:</strong> {qrData.urun_adi}</p>
  <p><strong>Ebat:</strong> {qrData.ebat}</p>
  <p><strong>Miktar:</strong> {qrData.miktar}</p>
</div>
```

**SERVIS/KENDI_ALAN için:**
```jsx
<div className="qr-info-servis">
  <h3>Sipariş Detayları</h3>
  <p><strong>Müşteri:</strong> {qrData.musteri_adi}</p>
  <p><strong>Ürün:</strong> {qrData.urun_adi}</p>
  <p><strong>Koleksiyon:</strong> {qrData.koleksiyon}</p>
  <p><strong>Ebat:</strong> {qrData.ebat}</p>
  <p><strong>Kesim Türü:</strong> {qrData.kesim_turu}</p>
  <p><strong>Saçak:</strong> {qrData.sacak}</p>
  <p><strong>Miktar:</strong> {qrData.miktar}</p>
</div>
```

#### **2.2 QR Kod Bileşeni**
- [ ] QRCodeWithInfo bileşeni oluştur
- [ ] Mağaza türüne göre dinamik layout
- [ ] Print-friendly CSS stilleri ekle

```jsx
const QRCodeWithInfo = ({ qrData, storeType }) => {
  const renderInfo = () => {
    switch (storeType) {
      case 'KARGO':
      case 'AMBAR':
        return <KargoInfo data={qrData} />;
      case 'SERVIS':
      case 'KENDI_ALAN':
        return <ServisInfo data={qrData} />;
      default:
        return <DefaultInfo data={qrData} />;
    }
  };

  return (
    <div className="qr-code-container">
      <QRCode value={JSON.stringify(qrData)} size={200} />
      {renderInfo()}
    </div>
  );
};
```

#### **2.3 QR Kod Yazdırma Stilleri**
- [ ] Print CSS oluştur
- [ ] A4 sayfa düzeni optimize et
- [ ] QR kod + bilgi kombinasyonu için layout

```css
@media print {
  .qr-code-container {
    page-break-inside: avoid;
    margin: 10mm;
    border: 1px solid #000;
    padding: 5mm;
  }
  
  .qr-info-kargo {
    font-size: 12pt;
    line-height: 1.4;
  }
  
  .qr-info-servis {
    font-size: 11pt;
    line-height: 1.3;
  }
}
```

### 3. 🧾 **Fiş Çıktısı Geliştirmeleri**

#### **3.1 Fiş Görüntüleme Bileşeni**
- [ ] Mağaza türüne göre fiş template'i seç
- [ ] ReceiptViewer bileşeni güncelle

```jsx
const ReceiptViewer = ({ receiptData }) => {
  const storeType = receiptData.fis.magazaTuru;
  
  switch (storeType) {
    case 'KARGO':
    case 'AMBAR':
      return <KargoReceipt data={receiptData} />;
    case 'SERVIS':
    case 'KENDI_ALAN':
      return <ServisReceipt data={receiptData} />;
    default:
      return <DefaultReceipt data={receiptData} />;
  }
};
```

#### **3.2 KARGO/AMBAR Fiş Template'i**
- [ ] KargoReceipt bileşeni oluştur
- [ ] Teslimat odaklı layout
- [ ] Adres ve telefon bilgileri vurgusu

```jsx
const KargoReceipt = ({ data }) => (
  <div className="receipt-kargo">
    <div className="header">
      <h2>Teslimat Fişi</h2>
      <p>Fiş No: {data.fis.fisNumarasi}</p>
    </div>
    
    <div className="delivery-info">
      <h3>Teslimat Bilgileri</h3>
      <p><strong>Mağaza:</strong> {data.magaza.kurumAdi}</p>
      <p><strong>Telefon:</strong> {data.magaza.telefon}</p>
      <p><strong>Adres:</strong> {data.teslimatBilgileri.adres}</p>
    </div>
    
    <div className="products">
      <h3>Ürünler</h3>
      {data.urunler.map(urun => (
        <div key={urun.id} className="product-item">
          <p><strong>{urun.urunAdi}</strong></p>
          <p>Ebat: {urun.olculer.ebat}</p>
          <p>Miktar: {urun.miktar}</p>
          <p>Fiyat: {urun.toplamFiyat} TL</p>
        </div>
      ))}
    </div>
  </div>
);
```

#### **3.3 SERVIS/KENDI_ALAN Fiş Template'i**
- [ ] ServisReceipt bileşeni oluştur
- [ ] Müşteri odaklı layout
- [ ] Bakiye bilgileri dahil

```jsx
const ServisReceipt = ({ data }) => (
  <div className="receipt-servis">
    <div className="header">
      <h2>Servis Fişi</h2>
      <p>Fiş No: {data.fis.fisNumarasi}</p>
    </div>
    
    <div className="customer-info">
      <h3>Müşteri Bilgileri</h3>
      <p><strong>Ad Soyad:</strong> {data.musteri.tamAd}</p>
      <p><strong>Telefon:</strong> {data.musteri.telefon}</p>
      <p><strong>E-posta:</strong> {data.musteri.email}</p>
    </div>
    
    <div className="products-detailed">
      <h3>Ürün Detayları</h3>
      {data.urunler.map(urun => (
        <div key={urun.id} className="product-detailed">
          <p><strong>{urun.urunAdi}</strong></p>
          <p>Koleksiyon: {urun.koleksiyon}</p>
          <p>Ebat: {urun.olculer.ebat} ({urun.olculer.alanM2} m²)</p>
          <p>Kesim Türü: {urun.ozellikler.kesimTuru}</p>
          <p>Saçak: {urun.ozellikler.sasakVar}</p>
          <p>Miktar: {urun.miktar}</p>
          <p>Fiyat: {urun.toplamFiyat} TL</p>
        </div>
      ))}
    </div>
    
    <div className="balance-info">
      <h3>Bakiye Bilgileri</h3>
      <p>Sipariş Öncesi: {data.bakiye.siparisOncesi} TL</p>
      <p>Sipariş Tutarı: {data.bakiye.siparisKesintisi} TL</p>
      <p>Kalan Bakiye: {data.bakiye.siparisSonrasi} TL</p>
    </div>
  </div>
);
```

### 4. 🎨 **UI/UX Geliştirmeleri**

#### **4.1 Mağaza Türü İkonları**
- [ ] Her mağaza türü için ikon seç
  ```jsx
  const storeTypeIcons = {
    KARGO: <TruckIcon />,
    SERVIS: <ToolIcon />,
    KENDI_ALAN: <HomeIcon />,
    AMBAR: <WarehouseIcon />
  };
  ```

#### **4.2 Renk Kodlaması**
- [ ] Mağaza türleri için renk paleti
  ```css
  .store-type-kargo { background: #3b82f6; }
  .store-type-servis { background: #10b981; }
  .store-type-kendi-alan { background: #8b5cf6; }
  .store-type-ambar { background: #f59e0b; }
  ```

#### **4.3 Responsive Tasarım**
- [ ] Mobil uyumlu QR kod görüntüleme
- [ ] Tablet uyumlu fiş çıktısı
- [ ] Print preview özelliği

### 5. 🔧 **API Entegrasyonu**

#### **5.1 Store API Güncellemeleri**
- [ ] Store oluşturma API'sine store_type ekle
- [ ] Store güncelleme API'sine store_type ekle
- [ ] Store listesi API'sinden store_type al

```javascript
// Store oluşturma
const createStore = async (storeData) => {
  const response = await fetch('/admin/stores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...storeData,
      store_type: storeData.storeType
    })
  });
  return response.json();
};

// Store güncelleme
const updateStore = async (storeId, updates) => {
  const response = await fetch(`/admin/stores/${storeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  return response.json();
};
```

#### **5.2 QR Kod API Entegrasyonu**
- [ ] QR kod verilerini mağaza türü ile al
- [ ] QR kod formatını parse et

```javascript
const getQRCodeData = async (orderId) => {
  const response = await fetch(`/orders/${orderId}/qr-codes`);
  const data = await response.json();
  
  return data.qrCodes.map(qr => ({
    ...JSON.parse(qr.qr_code),
    storeType: qr.storeType
  }));
};
```

#### **5.3 Fiş API Entegrasyonu**
- [ ] Fiş verilerini mağaza türü ile al
- [ ] Fiş yazdırma durumunu güncelle

```javascript
const getReceipt = async (orderId) => {
  const response = await fetch(`/orders/${orderId}/receipt`);
  const data = await response.json();
  return data.data; // Mağaza türü data.fis.magazaTuru'nda
};

const markReceiptPrinted = async (orderId) => {
  const response = await fetch(`/orders/${orderId}/mark-printed`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  return response.json();
};
```

### 6. 📱 **Sayfa/Bileşen Güncellemeleri**

#### **6.1 Admin Panel - Mağaza Yönetimi**
- [ ] `/admin/stores` - Mağaza listesi sayfası
- [ ] `/admin/stores/new` - Yeni mağaza sayfası
- [ ] `/admin/stores/:id/edit` - Mağaza düzenleme sayfası

#### **6.2 Sipariş Yönetimi**
- [ ] `/orders/:id` - Sipariş detay sayfası
- [ ] `/orders/:id/qr-codes` - QR kod yazdırma sayfası
- [ ] `/orders/:id/receipt` - Fiş görüntüleme sayfası

#### **6.3 Yeni Bileşenler**
- [ ] `StoreTypeSelector` - Mağaza türü seçici
- [ ] `StoreTypeBadge` - Mağaza türü rozeti
- [ ] `QRCodeWithInfo` - Bilgili QR kod
- [ ] `ReceiptViewer` - Fiş görüntüleyici
- [ ] `KargoReceipt` - Kargo fiş template'i
- [ ] `ServisReceipt` - Servis fiş template'i

### 7. 🧪 **Test Senaryoları**

#### **7.1 Mağaza Yönetimi Testleri**
- [ ] Mağaza türü seçerek mağaza oluşturma
- [ ] Mağaza türü güncelleme
- [ ] Mağaza türüne göre filtreleme
- [ ] Geçersiz mağaza türü hata kontrolü

#### **7.2 QR Kod Testleri**
- [ ] KARGO türü QR kod yazdırma
- [ ] SERVIS türü QR kod yazdırma
- [ ] QR kod bilgilerinin doğru gösterimi
- [ ] Print preview kontrolü

#### **7.3 Fiş Testleri**
- [ ] KARGO türü fiş görüntüleme
- [ ] SERVIS türü fiş görüntüleme
- [ ] Fiş yazdırma işaretleme
- [ ] Admin fiş yazdırma yetkisi

### 8. 📋 **Validasyon ve Hata Yönetimi**

#### **8.1 Form Validasyonları**
```javascript
const storeValidationSchema = {
  kurum_adi: { required: true, minLength: 2 },
  store_type: { 
    required: true, 
    enum: ['KARGO', 'SERVIS', 'KENDI_ALAN', 'AMBAR'] 
  },
  telefon: { required: true, pattern: /^[0-9\s\-\+\(\)]+$/ }
};
```

#### **8.2 Hata Mesajları**
```javascript
const errorMessages = {
  'INVALID_STORE_TYPE': 'Geçersiz mağaza türü seçildi',
  'STORE_TYPE_REQUIRED': 'Mağaza türü seçimi zorunludur',
  'RECEIPT_PRINT_FAILED': 'Fiş yazdırma işlemi başarısız',
  'QR_CODE_GENERATION_FAILED': 'QR kod oluşturma başarısız'
};
```

### 9. 🎯 **Performans Optimizasyonları**

#### **9.1 Lazy Loading**
- [ ] QR kod bileşenlerini lazy load et
- [ ] Fiş template'lerini lazy load et

```javascript
const KargoReceipt = lazy(() => import('./KargoReceipt'));
const ServisReceipt = lazy(() => import('./ServisReceipt'));
```

#### **9.2 Caching**
- [ ] Mağaza türü bilgilerini cache'le
- [ ] QR kod verilerini session storage'da sakla

### 10. 📱 **Mobil Uyumluluk**

#### **10.1 Responsive Tasarım**
- [ ] QR kod yazdırma mobil uyumlu
- [ ] Fiş görüntüleme tablet uyumlu
- [ ] Touch-friendly butonlar

#### **10.2 PWA Özellikleri**
- [ ] Offline QR kod görüntüleme
- [ ] Print özelliği mobilde

## 🚀 **Öncelik Sırası**

### **Yüksek Öncelik (Hemen)**
1. Mağaza oluşturma/düzenleme formlarına store_type ekle
2. QR kod yazdırma sayfasına mağaza türü bilgileri ekle
3. Fiş görüntüleme bileşenini mağaza türüne göre güncelle

### **Orta Öncelik (1-2 Hafta)**
1. Mağaza listesine türe göre filtreleme ekle
2. Print CSS optimizasyonları
3. Responsive tasarım iyileştirmeleri

### **Düşük Öncelik (Gelecek)**
1. PWA özellikleri
2. Gelişmiş animasyonlar
3. Bulk operations

## 📋 **Checklist**

### **Mağaza Yönetimi**
- [ ] Store type selector component
- [ ] Store creation form update
- [ ] Store edit form update
- [ ] Store list filtering
- [ ] Store type badges

### **QR Kod Sistemi**
- [ ] QR code with info component
- [ ] Store type based QR info
- [ ] Print styles for QR codes
- [ ] QR code generation API integration

### **Fiş Sistemi**
- [ ] Receipt viewer component
- [ ] Kargo receipt template
- [ ] Servis receipt template
- [ ] Receipt printing functionality
- [ ] Print styles for receipts

### **API Entegrasyonu**
- [ ] Store CRUD operations
- [ ] QR code data fetching
- [ ] Receipt data fetching
- [ ] Receipt print marking

### **Test & Validasyon**
- [ ] Form validations
- [ ] Error handling
- [ ] Unit tests
- [ ] Integration tests

Bu liste tamamlandığında, mağaza türleri sistemi frontend'de tamamen entegre edilmiş olacak! 🎉
