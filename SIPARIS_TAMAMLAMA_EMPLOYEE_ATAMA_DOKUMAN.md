# Sipariş Tamamlama ve Employee Atama Dökümanı

## Genel Akış

1. Siparişe ait tüm QR kodlar okutulduğunda, backend otomatik olarak siparişin tamamlandığını algılar.
2. Son QR kod okutulunca API response'unda `needs_employee_assignment: true` ve tüm aktif employee kullanıcılarının listesi döner.
3. Frontend bu listeyle bir form açar ve kullanıcıdan siparişi tamamlayan employee'yi seçmesini ister.
4. Seçim yapılıp kaydedilince, backend'e `/api/employee-assignment/assign` endpointi ile `orderId` ve `employeeId` gönderilir.
5. Backend, seçilen employee'yi siparişe atar ve istatistik kaydeder.

---

## API Endpointleri

### 1. Son QR Kod Okutulunca

**Endpoint:** `/api/admin/scan-qr` (QR kod okuma endpointi)

**HTML Form Sayfası:** `/api/employee-assignment/form?orderId=...&employees=...&orderData=...`

**Başarılı response örneği:**
```json
{
  "success": true,
     "message": "Ürünler tamamlandı! Siparişi tamamlamak için lütfen çalışan seçin.",
  "qrCode": { ... },
  "order": { ... },
  "deliveryInfo": {
    "completed_qr_codes": 3,
    "total_qr_codes": 3,
    "is_order_completed": true,
    "completion_percentage": 100,
    "order_status": "DELIVERED",
    "needs_employee_assignment": true,
    "qr_details": [ ... ]
  },
  "employees": [
    { "userId": "...", "name": "Ali", "surname": "Yılmaz", "email": "...", "phoneNumber": "..." },
    { "userId": "...", "name": "Ayşe", "surname": "Demir", "email": "...", "phoneNumber": "..." }
  ],
  "orderId": "..."
}
```

### 2. Employee Atama

**Endpoint:** `POST /api/employee-assignment/assign`

**Body:**
```json
{
  "orderId": "...",
  "employeeId": "..."
}
```

**Başarılı response:**
```json
{
  "success": true,
  "message": "Employee başarıyla atandı",
  "data": { ... }
}
```

### 3. Employee İstatistikleri

**Endpoint:** `GET /api/employee-assignment/stats/:employeeId?`

**Döner:**
- O employee'nin tamamladığı sipariş sayısı
- Toplam m2
- Toplam TL tutarı
- Sipariş detayları

---

## Önemli Notlar
- Employee listesi sadece aktif ve tipi `employee` olan kullanıcıları içerir.
- Bir siparişe sadece bir employee atanabilir.
- Sipariş tamamlanmadan atama yapılamaz.
- Tüm iş mantığı backendde, frontend sadece formu gösterir ve seçimi API'ye gönderir.
- Employee assignment form sayfası token gerektirmez, QR kod tarama sonrası doğrudan erişilebilir.

---

## Admin API - Kullanıcı Oluşturma

### Kullanıcı Tiplerini Listeleme

**Endpoint:** `GET /api/admin/user-types`

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "admin" },
    { "id": 3, "name": "editor" },
    { "id": 4, "name": "employee" }
  ]
}
```

### Employee Kullanıcısı Oluşturma

**Endpoint:** `POST /api/admin/users`

**Body:**
```json
{
  "username": "calisan1",
  "email": "calisan1@example.com",
  "password": "sifre123",
  "name": "Ali",
  "surname": "Yılmaz",
  "phoneNumber": "+905551234567",
  "userTypeName": "employee"
}
```

**Not:** `userTypeName: "employee"` ile employee kullanıcısı oluşturulabilir.

### Test Çalışanları

Sistemde test amaçlı 4 çalışan bulunmaktadır:

1. **Ahmet Yılmaz** - calisan1@pasha.com - +905551234567
2. **Ayşe Demir** - calisan2@pasha.com - +905551234568  
3. **Mehmet Kaya** - calisan3@pasha.com - +905551234569
4. **Fatma Özkan** - calisan4@pasha.com - +905551234570

**Şifre:** Tüm test çalışanlarının şifresi `123456`'dır.

---

## Kullanım Örneği

### 1. QR Kod Okutma
Son QR kod okutulduğunda API response'unda `employees` listesi döner.

### 2. HTML Form Açma
Son QR kod okutulduğunda otomatik olarak employee seçim formu açılır:
```
/api/employee-assignment/form?orderId=123&employees=[...]&orderData={...}
```

**Gösterilen Mesaj:** "Ürünler Tamamlandı! Siparişi tamamlamak için lütfen çalışan seçin."

### 3. Employee Seçimi
Kullanıcı dropdown'dan çalışan seçer ve "Çalışanı Kaydet" butonuna basar.

### 4. Atama İşlemi
Form, seçilen çalışanı backend'e gönderir ve atama tamamlanır. Başarılı atama sonrası "Çalışan başarıyla atandı!" mesajı gösterilir.

---

Herhangi bir sorunda veya ek geliştirme ihtiyacında bu dökümanı referans alabilirsiniz.