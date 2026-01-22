# Lokal Geliştirme Ortamı Kurulumu

## Sorun: Railway Database'e Lokal Makineden Bağlanılamıyor

Railway PostgreSQL database'i sadece Railway platformu içinden (internal network) erişilebilir durumda. Bu yüzden lokal makinenizden `yamabiko.proxy.rlwy.net:17072` adresine bağlanamıyorsunuz.

## Çözüm Seçenekleri

### Seçenek 1: Docker ile Lokal PostgreSQL (ÖNERİLEN)

En hızlı ve kolay çözüm Docker kullanmaktır:

```bash
# PostgreSQL container'ı başlat
docker run --name pasha-postgres -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_DB=pasha_local -p 5432:5432 -d postgres:14

# Çalıştığını kontrol et
docker ps

# .env dosyasını güncelle
# DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/pasha_local?schema=public"
```

Sonra migration ve seed çalıştır:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Seçenek 2: Lokal PostgreSQL Kurulumu

1. PostgreSQL'i indirin: https://www.postgresql.org/download/windows/
2. Kurulumu yapın (varsayılan port: 5432)
3. pgAdmin ile "pasha_local" database'i oluşturun
4. .env dosyasını güncelleyin:
   ```
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/pasha_local?schema=public"
   ```
5. Migration ve seed çalıştırın

### Seçenek 3: Railway Database'i Production'dan Dump Alıp Restore Etme

Railway database'inden export alıp lokal database'e import edebilirsiniz:

```bash
# Railway CLI kur
npm i -g @railway/cli

# Railway'e login ol
railway login

# Database dump al
railway run pg_dump > backup.sql

# Lokal database'e restore et
psql -h localhost -U postgres -d pasha_local < backup.sql
```

### Seçenek 4: Railway Private Network Kullanımı (İleri Seviye)

Railway'in private network özelliğini kullanarak lokal makinenizden erişim sağlayabilirsiniz, ancak bu ücretli planda mevcut.

## Ödeme API Testini Lokal Yapmak İçin

1. Yukarıdaki seçeneklerden birini uygulayın
2. Lokal database'i hazırlayın
3. DBYE ödeme login bilgilerini ekleyin:

```sql
INSERT INTO dbye_odeme_login (id, email, password, url, created_at, updated_at)
VALUES (
  1,
  'your-octet-email@example.com',
  'your-octet-password',
  'https://portalapi.octet.com.tr/auth/login',
  NOW(),
  NOW()
);
```

4. Test scriptini çalıştırın:
```bash
npx ts-node test-payment-specific-store.ts
```

## Önerilen Workflow

**Geliştirme (Development):**
- Lokal PostgreSQL kullan
- `npm run api:dev` ile geliştir
- Lokal test yap

**Production:**
- Railway'de otomatik deploy
- Railway PostgreSQL kullan
- Production'da test et

## Mevcut Durum Özeti

✅ Railway'e ping atılabiliyor (66.33.22.235)
❌ Railway PostgreSQL portuna (17072) bağlanılamıyor
⚠️  Railway database sadece internal network'ten erişilebilir
💡 Lokal geliştirme için lokal PostgreSQL gerekiyor

## Hızlı Başlangıç (Docker ile)

```powershell
# 1. Docker PostgreSQL başlat
docker run --name pasha-postgres -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=pasha_local -p 5432:5432 -d postgres:14

# 2. .env dosyasını güncelle (DATABASE_URL)
# DATABASE_URL="postgresql://postgres:123456@localhost:5432/pasha_local?schema=public"

# 3. Prisma migrate
npx prisma migrate deploy

# 4. Seed data
npx prisma db seed

# 5. Test
npx ts-node test-payment-specific-store.ts
```





