# Toplu Sipariş Onaylama - Frontend Geliştirme Kılavuzu

## Genel Bakış
Bu döküman, mevcut backend'deki toplu sipariş onaylama API'sini kullanarak frontend'de gerekli değişiklikleri detaylandırmaktadır.

## Backend API Bilgisi

### Endpoint
```
POST /api/admin/orders/bulk-confirm
```

### Authorization
- **Gerekli Roller**: `admin`, `editor`
- **Headers**: `Authorization: Bearer <token>`

### Request Format
```json
{
  "orderIds": ["order-uuid-1", "order-uuid-2", "order-uuid-3"]
}
```

### Request Validasyon
- `orderIds` array olmalı ve en az 1 eleman içermeli
- Maksimum 50 sipariş aynı anda onaylanabilir
- Sadece `PENDING` durumundaki siparişler onaylanabilir

### Response Format
```json
{
  "success": true,
  "message": "3 sipariş başarıyla onaylandı, 0 sipariş başarısız",
  "data": {
    "success": [
      {
        "orderId": "order-uuid-1",
        "customerName": "Ahmet Yılmaz",
        "storeName": "ABC Mağaza",
        "amount": 1500.00,
        "qrCodeCount": 5,
        "message": "Sipariş başarıyla onaylandı ve QR kodları oluşturuldu"
      }
    ],
    "failed": [
      {
        "orderId": "order-uuid-2",
        "customerName": "Mehmet Demir",
        "error": "Sipariş bulunamadı veya PENDING durumunda değil"
      }
    ],
    "summary": {
      "total": 3,
      "successful": 2,
      "failed": 1,
      "totalAmount": 3000.00
    }
  }
}
```

## Frontend Geliştirme Gereksinimleri

### 1. Sipariş Listesi Sayfasında Değişiklikler

#### A. Çoklu Seçim Fonksiyonalitesi
```typescript
// State tanımlaması
const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
const [isSelectAllMode, setIsSelectAllMode] = useState(false);

// Tek sipariş seçimi
const handleOrderSelect = (orderId: string, isSelected: boolean) => {
  if (isSelected) {
    setSelectedOrders(prev => [...prev, orderId]);
  } else {
    setSelectedOrders(prev => prev.filter(id => id !== orderId));
  }
};

// Tümünü seç/seçimi kaldır
const handleSelectAll = () => {
  if (isSelectAllMode) {
    setSelectedOrders([]);
    setIsSelectAllMode(false);
  } else {
    // Sadece PENDING durumundaki siparişleri seç
    const pendingOrderIds = orders
      .filter(order => order.status === 'PENDING')
      .map(order => order.id);
    setSelectedOrders(pendingOrderIds);
    setIsSelectAllMode(true);
  }
};
```

#### B. UI Bileşenleri

**1. Header Bölümü**
```jsx
<div className="orders-header">
  <div className="selection-controls">
    <Checkbox
      checked={isSelectAllMode}
      onChange={handleSelectAll}
      label={`Tümünü Seç (${pendingOrdersCount} PENDING sipariş)`}
    />
    
    {selectedOrders.length > 0 && (
      <div className="bulk-actions">
        <Button
          variant="primary"
          onClick={handleBulkConfirm}
          disabled={isBulkConfirming}
          icon={isBulkConfirming ? "loading" : "check"}
        >
          {isBulkConfirming 
            ? `Onaylanıyor... (${selectedOrders.length})` 
            : `${selectedOrders.length} Siparişi Onayla`
          }
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => setSelectedOrders([])}
        >
          Seçimi Temizle
        </Button>
      </div>
    )}
  </div>
  
  <div className="selection-info">
    {selectedOrders.length > 0 && (
      <span className="selected-count">
        {selectedOrders.length} sipariş seçildi
      </span>
    )}
  </div>
</div>
```

**2. Sipariş Satırı Modifikasyonu**
```jsx
<tr className={`order-row ${selectedOrders.includes(order.id) ? 'selected' : ''}`}>
  <td className="select-cell">
    {order.status === 'PENDING' && (
      <Checkbox
        checked={selectedOrders.includes(order.id)}
        onChange={(isChecked) => handleOrderSelect(order.id, isChecked)}
      />
    )}
  </td>
  
  <td className="order-id">{order.id}</td>
  <td className="customer">{order.user.name} {order.user.surname}</td>
  <td className="store">{order.user.Store?.kurum_adi}</td>
  <td className="amount">{order.total_price} TL</td>
  <td className="status">
    <StatusBadge status={order.status} />
  </td>
  <td className="actions">
    {/* Mevcut action butonları */}
  </td>
</tr>
```

### 2. Toplu Onaylama Fonksiyonu

```typescript
const [isBulkConfirming, setIsBulkConfirming] = useState(false);

const handleBulkConfirm = async () => {
  if (selectedOrders.length === 0) {
    toast.error('Lütfen en az bir sipariş seçin');
    return;
  }

  if (selectedOrders.length > 50) {
    toast.error('Aynı anda en fazla 50 sipariş onaylanabilir');
    return;
  }

  // Onay modalı göster
  const confirmed = await showConfirmDialog({
    title: 'Toplu Sipariş Onaylama',
    message: `${selectedOrders.length} siparişi onaylamak istediğinizden emin misiniz?`,
    details: 'Bu işlem geri alınamaz ve seçilen tüm siparişler için QR kodları oluşturulacaktır.',
    confirmText: 'Onayla',
    cancelText: 'İptal'
  });

  if (!confirmed) return;

  setIsBulkConfirming(true);

  try {
    const response = await fetch('/api/admin/orders/bulk-confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        orderIds: selectedOrders
      })
    });

    const result = await response.json();

    if (result.success) {
      // Başarılı sonuçları göster
      showBulkConfirmResult(result.data);
      
      // Listeyi yenile
      await fetchOrders();
      
      // Seçimi temizle
      setSelectedOrders([]);
      setIsSelectAllMode(false);
      
      toast.success(result.message);
    } else {
      toast.error(result.message || 'Toplu onaylama işlemi başarısız');
    }
  } catch (error) {
    console.error('Bulk confirm error:', error);
    toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
  } finally {
    setIsBulkConfirming(false);
  }
};
```

### 3. Sonuç Modal/Dialog Bileşeni

```jsx
const BulkConfirmResultModal = ({ isOpen, onClose, results }) => {
  const { success, failed, summary } = results;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <Modal.Header>
        <h2>Toplu Onaylama Sonucu</h2>
      </Modal.Header>
      
      <Modal.Body>
        {/* Özet Bilgiler */}
        <div className="result-summary">
          <div className="summary-grid">
            <div className="summary-item success">
              <Icon name="check-circle" />
              <div>
                <span className="number">{summary.successful}</span>
                <span className="label">Başarılı</span>
              </div>
            </div>
            
            <div className="summary-item failed">
              <Icon name="x-circle" />
              <div>
                <span className="number">{summary.failed}</span>
                <span className="label">Başarısız</span>
              </div>
            </div>
            
            <div className="summary-item total">
              <Icon name="currency" />
              <div>
                <span className="number">{summary.totalAmount.toLocaleString()} TL</span>
                <span className="label">Toplam Tutar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Başarılı Siparişler */}
        {success.length > 0 && (
          <div className="result-section">
            <h3 className="section-title success">
              ✅ Başarıyla Onaylanan Siparişler ({success.length})
            </h3>
            <div className="result-list">
              {success.map((item, index) => (
                <div key={index} className="result-item success">
                  <div className="item-info">
                    <span className="customer">{item.customerName}</span>
                    <span className="store">{item.storeName}</span>
                    <span className="amount">{item.amount.toLocaleString()} TL</span>
                  </div>
                  <div className="item-details">
                    <span className="qr-count">{item.qrCodeCount} QR kod oluşturuldu</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Başarısız Siparişler */}
        {failed.length > 0 && (
          <div className="result-section">
            <h3 className="section-title failed">
              ❌ Onaylanamayan Siparişler ({failed.length})
            </h3>
            <div className="result-list">
              {failed.map((item, index) => (
                <div key={index} className="result-item failed">
                  <div className="item-info">
                    <span className="customer">{item.customerName}</span>
                    <span className="order-id">#{item.orderId.substring(0, 8)}</span>
                  </div>
                  <div className="item-error">
                    <span className="error-message">{item.error}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button onClick={onClose} variant="primary">
          Kapat
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
```

### 4. CSS Stilleri

```css
/* Seçim kontrolleri */
.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.selection-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bulk-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.selected-count {
  font-weight: 600;
  color: #0066cc;
}

/* Tablo satırları */
.order-row.selected {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.select-cell {
  width: 40px;
  text-align: center;
}

/* Sonuç modalı */
.result-summary {
  margin-bottom: 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
}

.summary-item.success {
  background: #e8f5e8;
  border: 2px solid #4caf50;
}

.summary-item.failed {
  background: #ffebee;
  border: 2px solid #f44336;
}

.result-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-item {
  padding: 1rem;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-item.success {
  background: #e8f5e8;
  border-left: 4px solid #4caf50;
}

.result-item.failed {
  background: #ffebee;
  border-left: 4px solid #f44336;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.customer {
  font-weight: 600;
}

.store, .amount, .qr-count {
  font-size: 0.9rem;
  color: #666;
}

.error-message {
  font-size: 0.9rem;
  color: #d32f2f;
  font-style: italic;
}
```

### 5. TypeScript Tip Tanımları

```typescript
interface BulkConfirmRequest {
  orderIds: string[];
}

interface BulkConfirmSuccessItem {
  orderId: string;
  customerName: string;
  storeName: string;
  amount: number;
  qrCodeCount: number;
  message: string;
}

interface BulkConfirmFailedItem {
  orderId: string;
  customerName: string;
  error: string;
}

interface BulkConfirmSummary {
  total: number;
  successful: number;
  failed: number;
  totalAmount: number;
}

interface BulkConfirmResponse {
  success: boolean;
  message: string;
  data: {
    success: BulkConfirmSuccessItem[];
    failed: BulkConfirmFailedItem[];
    summary: BulkConfirmSummary;
  };
}
```

### 6. Test Senaryoları

#### A. Pozitif Test Durumları
1. **Tek sipariş seçimi**: 1 PENDING sipariş seçerek onaylama
2. **Çoklu sipariş seçimi**: 3-5 PENDING sipariş seçerek onaylama
3. **Tümünü seç**: Sayfadaki tüm PENDING siparişleri seçerek onaylama
4. **Karışık durum**: Bazı siparişler başarılı, bazıları başarısız olacak şekilde test

#### B. Negatif Test Durumları
1. **Boş seçim**: Hiç sipariş seçmeden onaylama butonu tıklama
2. **Limit aşımı**: 50'den fazla sipariş seçmeye çalışma
3. **Geçersiz durum**: CONFIRMED/SHIPPED durumundaki siparişleri seçmeye çalışma
4. **Network hatası**: API erişim hatası durumu
5. **Yetki hatası**: Yetkisiz kullanıcı ile erişim

### 7. Kullanıcı Deneyimi İyileştirmeleri

#### A. Loading States
- Toplu onaylama sırasında progress indicator
- Seçim yapılırken hafif animasyonlar
- Buton durumlarında loading spinners

#### B. Feedback Mekanizmaları
- Her sipariş seçiminde görsel feedback
- Başarılı/başarısız işlemler için toast bildirimleri
- Detaylı sonuç modalı

#### C. Performans Optimizasyonları
- Büyük listelerde virtual scrolling
- Debounced selection handling
- Lazy loading for order details

### 8. Güvenlik Considerations

#### A. Frontend Validasyon
```typescript
// Sipariş seçimi validasyonu
const validateOrderSelection = (orderIds: string[]): string | null => {
  if (orderIds.length === 0) {
    return 'En az bir sipariş seçilmelidir';
  }
  
  if (orderIds.length > 50) {
    return 'Aynı anda en fazla 50 sipariş onaylanabilir';
  }
  
  // UUID format kontrolü
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const invalidIds = orderIds.filter(id => !uuidRegex.test(id));
  
  if (invalidIds.length > 0) {
    return 'Geçersiz sipariş ID formatı tespit edildi';
  }
  
  return null;
};
```

#### B. Authorization Kontrolü
```typescript
// Kullanıcı yetki kontrolü
const canPerformBulkConfirm = (userRole: string): boolean => {
  return ['admin', 'editor'].includes(userRole);
};
```

### 9. Gelecek Geliştirmeler

#### A. Gelişmiş Filtreleme
- Tarih aralığına göre toplu onaylama
- Mağazaya göre toplu onaylama
- Tutar aralığına göre toplu onaylama

#### B. Toplu İşlemler
- Toplu iptal etme
- Toplu durum değiştirme
- Toplu rapor oluşturma

#### C. Bildirimler
- Real-time progress updates
- Email bildirimleri
- Push notifications

Bu dokümantasyon, mevcut backend API'sini kullanarak frontend'de toplu sipariş onaylama özelliğinin tam olarak nasıl implement edileceğini detaylandırmaktadır. Her adımda kullanıcı deneyimi ve güvenlik göz önünde bulundurulmuştur.