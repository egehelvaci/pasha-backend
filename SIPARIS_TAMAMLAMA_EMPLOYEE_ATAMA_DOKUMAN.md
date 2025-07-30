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

**Endpoint:** `/api/orders/scan-qr` (veya ilgili QR kod okuma endpointiniz)

**Başarılı response örneği:**
```json
{
  "success": true,
  "message": "Tüm QR kodlar tamamlandı! Employee seçimi için form açılmalı.",
  "needs_employee_assignment": true,
  "employees": [
    { "userId": "...", "name": "Ali", "surname": "Yılmaz", ... },
    { "userId": "...", "name": "Ayşe", "surname": "Demir", ... }
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

---

Herhangi bir sorunda veya ek geliştirme ihtiyacında bu dökümanı referans alabilirsiniz.