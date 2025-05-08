import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Prisma Client ile veritabanına bağlanma ve kullanma örneği
  try {
    // Veritabanı bağlantısını test et
    await prisma.$connect()
    console.log('PostgreSQL veritabanına bağlantı başarılı!')

    // Admin kullanıcı tipini al
    const adminUserType = await prisma.userType.findFirst({
      where: { name: 'admin' }
    })

    if (!adminUserType) {
      throw new Error('Admin kullanıcı tipi bulunamadı! Önce seed-user-types.ts çalıştırılmalı.')
    }

    // Örnek bir kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        username: 'testkullanici',
        userTypeId: adminUserType.id, // UserType ile ilişki
        name: 'Test',
        surname: 'Kullanıcı',
        email: 'test@example.com',
        phoneNumber: '5551234567',
        password: 'gizli123',
        credit: 100.00,
        debit: 0.00
      },
      include: {
        userType: true // İlişkili UserType bilgisini de getir
      }
    })
    console.log('Kullanıcı oluşturuldu:', user)

    // Tüm kullanıcıları listele (user type bilgisiyle birlikte)
    const allUsers = await prisma.user.findMany({
      include: {
        userType: true
      }
    })
    console.log('Tüm kullanıcılar:', allUsers)
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    // Bağlantıyı kapat
    await prisma.$disconnect()
  }
}

main() 