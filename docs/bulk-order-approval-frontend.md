# Toplu Sipariş Onaylama - Frontend Rehberi

## Genel Bakış

Backend'de yeni eklenen toplu sipariş onaylama API'si (`/api/admin/orders/bulk-confirm`) için frontend entegrasyonu rehberi.

## API Endpoint Bilgileri

### Endpoint
```
POST /api/admin/orders/bulk-confirm
```

### Authentication
- Admin kimlik doğrulaması gerekli
- Authorization header'ında Bearer token

### Request Formatı
```json
{
  "orderIds": [
    "order-id-1",
    "order-id-2", 
    "order-id-3"
  ]
}
```

### Response Formatı
```json
{
  "success": true,
  "message": "3 sipariş başarıyla onaylandı, 0 sipariş başarısız",
  "data": {
    "success": [
      {
        "orderId": "order-id-1",
        "customerName": "Ahmet Yılmaz",
        "storeName": "ABC Mağaza",
        "amount": 1250.50,
        "qrCodeCount": 3,
        "message": "Sipariş başarıyla onaylandı ve QR kodları oluşturuldu"
      }
    ],
    "failed": [
      {
        "orderId": "order-id-2",
        "customerName": "Mehmet Kaya",
        "error": "Sipariş bulunamadı veya PENDING durumunda değil"
      }
    ],
    "summary": {
      "total": 3,
      "successful": 2,
      "failed": 1,
      "totalAmount": 2500.75
    }
  }
}
```

## Frontend'de Yapılacak Değişiklikler

### 1. Sipariş Listesi Sayfası

#### 1.1 Çoklu Seçim Özelliği
- [ ] Sipariş listesinde checkbox'lar ekle
- [ ] "Tümünü Seç" / "Hiçbirini Seçme" butonları
- [ ] Sadece PENDING durumundaki siparişleri seçilebilir yap
- [ ] Seçili sipariş sayısını göster

```jsx
// Örnek component yapısı
const OrderList = () => {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [orders, setOrders] = useState([]);

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    const pendingOrders = orders
      .filter(order => order.status === 'PENDING')
      .map(order => order.id);
    setSelectedOrders(pendingOrders);
  };

  return (
    // JSX implementation
  );
};
```

#### 1.2 Toplu Onaylama Butonu
- [ ] "Seçili Siparişleri Onayla" butonu ekle
- [ ] Buton sadece sipariş seçildiğinde aktif olsun
- [ ] Loading state göster
- [ ] Confirmation dialog ekle

```jsx
const BulkApprovalButton = ({ selectedOrders, onBulkApprove }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    const confirmed = confirm(
      `${selectedOrders.length} siparişi onaylamak istediğinizden emin misiniz?`
    );
    
    if (confirmed) {
      setIsLoading(true);
      await onBulkApprove(selectedOrders);
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={selectedOrders.length === 0 || isLoading}
      className="btn btn-primary"
    >
      {isLoading ? 'Onaylanıyor...' : `${selectedOrders.length} Siparişi Onayla`}
    </button>
  );
};
```

### 2. API Service Fonksiyonu

#### 2.1 Bulk Approval Service
```typescript
// services/orderService.ts
export const bulkApproveOrders = async (orderIds: string[]) => {
  try {
    const response = await fetch('/api/admin/orders/bulk-confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ orderIds })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Toplu onaylama başarısız');
    }
    
    return data;
  } catch (error) {
    console.error('Bulk approval error:', error);
    throw error;
  }
};
```

#### 2.2 Error Handling
```typescript
const handleBulkApproval = async (orderIds: string[]) => {
  try {
    const result = await bulkApproveOrders(orderIds);
    
    // Başarılı siparişleri listeden güncelle
    if (result.data.success.length > 0) {
      updateOrderStatuses(result.data.success.map(s => s.orderId), 'CONFIRMED');
    }
    
    // Sonuç bildirimini göster
    showBulkApprovalResult(result);
    
    // Seçimi temizle
    setSelectedOrders([]);
    
  } catch (error) {
    toast.error(error.message || 'Toplu onaylama sırasında hata oluştu');
  }
};
```

### 3. Sonuç Bildirimi

#### 3.1 Success/Error Toast
```jsx
const showBulkApprovalResult = (result) => {
  const { summary } = result.data;
  
  if (summary.successful > 0 && summary.failed === 0) {
    // Tümü başarılı
    toast.success(`${summary.successful} sipariş başarıyla onaylandı!`);
  } else if (summary.successful > 0 && summary.failed > 0) {
    // Karışık sonuç
    toast.warning(`${summary.successful} sipariş onaylandı, ${summary.failed} sipariş başarısız`);
  } else {
    // Tümü başarısız
    toast.error(`Hiçbir sipariş onaylanamadı. ${summary.failed} sipariş başarısız`);
  }
};
```

#### 3.2 Detaylı Sonuç Modal'ı
```jsx
const BulkApprovalResultModal = ({ isOpen, onClose, result }) => {
  if (!isOpen || !result) return null;

  const { success, failed, summary } = result.data;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bulk-approval-result">
        <h3>Toplu Onaylama Sonucu</h3>
        
        <div className="summary">
          <p>Toplam: {summary.total}</p>
          <p className="success">Başarılı: {summary.successful}</p>
          <p className="failed">Başarısız: {summary.failed}</p>
          <p>Toplam Tutar: {summary.totalAmount} TL</p>
        </div>

        {success.length > 0 && (
          <div className="successful-orders">
            <h4>Başarıyla Onaylanan Siparişler</h4>
            {success.map(order => (
              <div key={order.orderId} className="order-item success">
                <span>{order.orderId}</span>
                <span>{order.customerName}</span>
                <span>{order.amount} TL</span>
                <span>{order.qrCodeCount} QR kod</span>
              </div>
            ))}
          </div>
        )}

        {failed.length > 0 && (
          <div className="failed-orders">
            <h4>Başarısız Siparişler</h4>
            {failed.map(order => (
              <div key={order.orderId} className="order-item failed">
                <span>{order.orderId}</span>
                <span>{order.customerName}</span>
                <span className="error">{order.error}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
```

### 4. UI/UX İyileştirmeleri

#### 4.1 Progress Indicator
```jsx
const BulkApprovalProgress = ({ current, total }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span>{current}/{total} işlendi</span>
    </div>
  );
};
```

#### 4.2 Keyboard Shortcuts
- [ ] `Ctrl+A` - Tümünü seç
- [ ] `Ctrl+Shift+A` - Seçimi temizle
- [ ] `Ctrl+Enter` - Seçili siparişleri onayla

```jsx
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey) {
      if (e.key === 'a') {
        e.preventDefault();
        if (e.shiftKey) {
          setSelectedOrders([]);
        } else {
          handleSelectAll();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedOrders.length > 0) {
          handleBulkApproval(selectedOrders);
        }
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedOrders]);
```

### 5. Performans Optimizasyonları

#### 5.1 Debounced Selection
```jsx
const useDebouncedSelection = (orders, delay = 300) => {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [debouncedSelected, setDebouncedSelected] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSelected(selectedOrders);
    }, delay);

    return () => clearTimeout(timer);
  }, [selectedOrders, delay]);

  return [selectedOrders, setSelectedOrders, debouncedSelected];
};
```

#### 5.2 Virtual Scrolling (Büyük listeler için)
```jsx
import { FixedSizeList as List } from 'react-window';

const VirtualizedOrderList = ({ orders, onSelectOrder, selectedOrders }) => {
  const Row = ({ index, style }) => {
    const order = orders[index];
    return (
      <div style={style}>
        <OrderRow 
          order={order}
          isSelected={selectedOrders.includes(order.id)}
          onSelect={() => onSelectOrder(order.id)}
        />
      </div>
    );
  };

  return (
    <List
      height={600}
      itemCount={orders.length}
      itemSize={80}
    >
      {Row}
    </List>
  );
};
```

## Validasyon Kuralları

### Frontend Validasyonu
- [ ] En az 1 sipariş seçilmeli
- [ ] En fazla 50 sipariş seçilebilir
- [ ] Sadece PENDING durumundaki siparişler seçilebilir
- [ ] Duplicate order ID kontrolü

```typescript
const validateBulkSelection = (selectedOrders: string[], orders: Order[]) => {
  if (selectedOrders.length === 0) {
    throw new Error('En az 1 sipariş seçmelisiniz');
  }
  
  if (selectedOrders.length > 50) {
    throw new Error('Aynı anda en fazla 50 sipariş onaylanabilir');
  }
  
  const pendingOrderIds = orders
    .filter(order => order.status === 'PENDING')
    .map(order => order.id);
    
  const invalidSelections = selectedOrders.filter(id => !pendingOrderIds.includes(id));
  
  if (invalidSelections.length > 0) {
    throw new Error('Sadece beklemede olan siparişler onaylanabilir');
  }
};
```

## State Management

### Redux/Zustand Store
```typescript
// store/orderStore.ts
interface OrderState {
  orders: Order[];
  selectedOrders: string[];
  bulkApprovalLoading: boolean;
  lastBulkResult: BulkApprovalResult | null;
}

const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrders: [],
  bulkApprovalLoading: false,
  lastBulkResult: null,
  
  setSelectedOrders: (orderIds: string[]) => 
    set({ selectedOrders: orderIds }),
    
  addSelectedOrder: (orderId: string) => 
    set(state => ({ 
      selectedOrders: [...state.selectedOrders, orderId] 
    })),
    
  removeSelectedOrder: (orderId: string) => 
    set(state => ({ 
      selectedOrders: state.selectedOrders.filter(id => id !== orderId) 
    })),
    
  bulkApprove: async (orderIds: string[]) => {
    set({ bulkApprovalLoading: true });
    try {
      const result = await bulkApproveOrders(orderIds);
      set({ 
        lastBulkResult: result,
        selectedOrders: [],
        bulkApprovalLoading: false
      });
      return result;
    } catch (error) {
      set({ bulkApprovalLoading: false });
      throw error;
    }
  }
}));
```

## Test Senaryoları

### Unit Tests
- [ ] Bulk approval API service test
- [ ] Selection validation test
- [ ] Component rendering test
- [ ] Keyboard shortcuts test

### Integration Tests
- [ ] Sipariş seçimi ve onaylama akışı
- [ ] Error handling senaryoları
- [ ] Toast notification'lar
- [ ] Modal açılma/kapanma

### E2E Tests
- [ ] Tam toplu onaylama akışı
- [ ] Karışık sonuç senaryoları
- [ ] Network error handling
- [ ] Performance testleri

## Güvenlik Considerations

- [ ] CSRF token kontrolü
- [ ] Rate limiting (frontend side)
- [ ] Input sanitization
- [ ] Authorization check

## Accessibility

- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] ARIA labels
- [ ] Focus management
- [ ] Color contrast

## Browser Compatibility

- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

---

## Geliştirme Sırası Önerisi

1. **Faz 1**: Temel seçim UI'ı ve API entegrasyonu
2. **Faz 2**: Sonuç gösterimi ve error handling
3. **Faz 3**: UX iyileştirmeleri ve optimizasyonlar
4. **Faz 4**: Test yazımı ve accessibility

## API Limitler

- **Maksimum sipariş sayısı**: 50 adet
- **Timeout**: 30 saniye
- **Rate limit**: 10 istek/dakika/kullanıcı

Bu rehber, toplu sipariş onaylama özelliğinin frontend entegrasyonu için kapsamlı bir kılavuz sağlar. Her bölüm ayrı ayrı implementen edilebilir ve test edilebilir.
