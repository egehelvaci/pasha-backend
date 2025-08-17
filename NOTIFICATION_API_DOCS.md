# 🔔 Bildirim Sistemi API Dokümantasyonu

## 📋 Genel Bakış

Pasha Backend basit bildirim sistemi, kullanıcılara uygulama içi bildirimler gönderir ve veritabanında saklar. Sistem tamamen senkron çalışır ve aşağıdaki durumlarda otomatik bildirim gönderir:

### 🚀 Otomatik Bildirimler

1. **Yeni Stok** - Admin ürün eklediğinde (tüm kullanıcılara)
2. **Ödeme Durumu** - Ödeme başarılı/başarısız olduğunda
3. **Sipariş Onaylandı** - Admin sipariş onayladığında
4. **Sipariş Hazır** - Tüm QR kodlar okutulduğunda
5. **Sipariş Teslim Edildi** - Sipariş tamamlandığında

## 📡 API Endpoints

### 1. Tek Bildirim Gönder (Internal Use)
```http
POST /api/notifications/send
```

**Kullanım Amacı:** İç sistemde otomatik çağrılır, manuel kullanım için değil.

**Request Body:**
```json
{
  "type": "ORDER_CONFIRMED",
  "userId": "user_123",
  "title": "Sipariş Onaylandı",
  "message": "Siparişiniz onaylandı ve hazırlanmaya başlandı.",
  "orderId": "order_456",
  "metadata": {
    "orderNumber": "ORD-2024-001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bildirim başarıyla gönderildi"
}
```

2

## 🔄 Otomatik Bildirim Tetikleyicileri

### 1. Yeni Stok Bildirimi
**Tetikleyici:** Admin yeni ürün eklediğinde
**Dosya:** `src/controllers/productController.ts`
```javascript
// createProduct ve createProductSimple fonksiyonlarında
await notificationService.notifyNewStock(name, 1);
```

**Bildirim Detayları:**
- **Kime:** Tüm aktif kullanıcılara
- **Başlık:** "Yeni Ürün Stoklarda"
- **Mesaj:** "{ProductName} ürünü stoklara eklendi. Stok adedi: {StockCount}"

### 2. Ödeme Bildirimleri
**Tetikleyici:** Webhook'tan ödeme sonucu geldiğinde
**Dosya:** `src/controllers/webhookController.ts`
```javascript
// DBYE webhook işlendiğinde
if (isPaymentSuccessful) {
  await notificationService.notifyPaymentSuccess(orderId, userId, amount);
} else {
  await notificationService.notifyPaymentFailed(orderId, userId, amount);
}
```

**Bildirim Detayları:**
- **Başarılı:** "Ödeme Başarılı" - "{Amount} TL tutarındaki ödemeniz başarıyla alındı."
- **Başarısız:** "Ödeme Başarısız" - "{Amount} TL tutarındaki ödeme işlemi başarısız oldu."

### 3. Sipariş Onaylandı
**Tetikleyici:** Admin sipariş onayladığında
**Dosya:** `src/admin/admin-order-controller.ts`
```javascript
// confirmOrder ve updateOrderStatus fonksiyonlarında
await notificationService.notifyOrderConfirmed(orderId, userId, orderNumber);
```

**Bildirim Detayları:**
- **Başlık:** "Siparişiniz Onaylandı"
- **Mesaj:** "{OrderNumber} numaralı siparişiniz onaylandı ve hazırlanmaya başlandı."

### 4. Sipariş Hazır
**Tetikleyici:** Tüm QR kodlar ilk kez okutulduğunda
**Dosya:** `src/services/qr-code-service.ts`
```javascript
// scanQRCode fonksiyonunda, sipariş READY durumuna geçerken
await notificationService.notifyOrderReady(orderId, userId, orderNumber);
```

**Bildirim Detayları:**
- **Başlık:** "Siparişiniz Hazır"
- **Mesaj:** "{OrderNumber} numaralı siparişiniz hazır. Teslim alabilirsiniz."

### 5. Sipariş Teslim Edildi
**Tetikleyici:** Sipariş DELIVERED durumuna geçtiğinde
**Dosya:** `src/admin/admin-order-controller.ts`
```javascript
// updateOrderStatus fonksiyonunda
await notificationService.notifyOrderCompleted(orderId, userId, orderNumber);
```

**Bildirim Detayları:**
- **Başlık:** "Sipariş Teslim Edildi"
- **Mesaj:** "{OrderNumber} numaralı siparişiniz başarıyla teslim edildi. Bizi tercih ettiğiniz için teşekkür ederiz."

## 📊 Bildirim Tipleri

| Tip | Açıklama | Tetikleyici |
|-----|----------|-------------|
| `ORDER_CONFIRMED` | Sipariş onaylandı | Admin sipariş onayı |
| `ORDER_READY` | Sipariş hazır | QR kod okutma |
| `ORDER_COMPLETED` | Sipariş teslim edildi | Durum güncelleme |
| `PAYMENT_SUCCESS` | Ödeme başarılı | Webhook |
| `PAYMENT_FAILED` | Ödeme başarısız | Webhook |
| `NEW_STOCK` | Yeni stok eklendi | Ürün ekleme |
| `CUSTOM` | Özel bildirim | Manuel gönderim |

## 💾 Veritabanı Yapısı

### InAppNotification Tablosu
```sql
- id (string)
- userId (string)
- type (string)
- title (string)
- message (string)
- orderId (string, nullable)
- metadata (string, nullable)
- isRead (boolean)
- createdAt (datetime)
```

### NotificationHistory Tablosu
```sql
- id (string)
- userId (string, nullable)
- storeId (string, nullable)
- type (string)
- title (string)
- message (string)
- orderId (string, nullable)
- metadata (string, nullable)
- sentAt (datetime)
```

## 🔧 Frontend Entegrasyonu

### Bildirim Listesi Getirme
```javascript
const getNotifications = async (userId, page = 1) => {
  const response = await fetch(`/api/notifications/user/${userId}?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### Okunmamış Sayı Badge
```javascript
const getUnreadCount = async (userId) => {
  const response = await fetch(`/api/notifications/user/${userId}/unread-count`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data.unreadCount;
};
```

### Bildirim Okundu İşaretleme
```javascript
const markAsRead = async (notificationId) => {
  await fetch(`/api/notifications/read/${notificationId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
```

### Tümünü Okundu İşaretle
```javascript
const markAllAsRead = async (userId) => {
  await fetch(`/api/notifications/read-all/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
```

## 🎯 Kullanım Senaryoları

### 1. Yeni Ürün Eklendiğinde
```
Admin Panel → Ürün Ekle → createProduct() → notifyNewStock() → Tüm kullanıcılara bildirim
```

### 2. Ödeme Yapıldığında
```
Frontend → Ödeme → DBYE Gateway → Webhook → notifyPaymentSuccess/Failed() → Kullanıcıya bildirim
```

### 3. Sipariş Süreci
```
1. Sipariş Oluştur → (henüz bildirim yok)
2. Admin Onayla → notifyOrderConfirmed() → "Sipariş Onaylandı"
3. QR Okut → notifyOrderReady() → "Sipariş Hazır"
4. Teslim Et → notifyOrderCompleted() → "Sipariş Teslim Edildi"
```

## 🛡️ Güvenlik

1. **Authentication:** Kullanıcı endpoint'leri JWT token gerektirir
2. **Authorization:** Kullanıcı sadece kendi bildirimlerini görebilir
3. **Validation:** Tüm input'lar validate edilir
4. **Error Handling:** Bildirim hataları ana işlemi etkilemez

## 📱 Error Handling

Tüm bildirim fonksiyonları try-catch ile sarılıdır:

```javascript
try {
  await notificationService.notifyOrderConfirmed(orderId, userId, orderNumber);
  console.log('✅ Bildirim gönderildi');
} catch (notificationError) {
  console.error('❌ Bildirim hatası:', notificationError);
  // Ana işlem devam eder
}
```

## 🔮 Gelecek Özellikler

1. **Push Notifications** - FCM/APNS entegrasyonu
2. **Email Notifications** - SMTP entegrasyonu
3. **SMS Notifications** - SMS provider entegrasyonu
4. **Rich Notifications** - Resim ve action button desteği
5. **Notification Preferences** - Kullanıcı bildirim ayarları

## 📝 Notlar

- Sistem tamamen senkron çalışır, queue sistemi yoktur
- Bildirimler sadece veritabanında saklanır (in-app)
- Her bildirim hem InAppNotification hem de NotificationHistory'ye kaydedilir
- Bildirim hatası ana işlemleri etkilemez
- Metadata JSON string olarak saklanır