import { PrismaClient } from '../../generated/prisma'
import bcrypt from 'bcryptjs'

// Yeni admin kullanıcı bilgileri
const adminUser = {
  username: 'admin',
  password: 'admin123', // Bu güvenli bir şifre değildir, gerçek ortamda daha güçlü bir şifre kullanın
  name: 'Admin',
  surname: 'User',
  email: 'admin@example.com'
}

async function createAdminUser() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Admin kullanıcısı oluşturuluyor...')
    
    // Önce admin user type'ı bul
    let adminUserType = await prisma.userType.findFirst({
      where: {
        name: 'admin'
      }
    })
    
    // Admin user type yoksa oluştur
    if (!adminUserType) {
      console.log('Admin kullanıcı tipi bulunamadı, oluşturuluyor...')
      adminUserType = await prisma.userType.create({
        data: {
          name: 'admin'
        }
      })
      console.log('Admin kullanıcı tipi oluşturuldu.')
    }
    
    // Kullanıcı zaten var mı kontrol et
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: adminUser.username },
          { email: adminUser.email }
        ]
      }
    })
    
    if (existingUser) {
      console.log('Bu kullanıcı adı veya e-posta adresi ile bir kullanıcı zaten var.')
      return
    }
    
    // Şifreyi hashleme
    console.log('Şifre hashlemesi yapılıyor...')
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(adminUser.password, saltRounds)
    
    // Admin kullanıcıyı oluştur
    const newUser = await prisma.user.create({
      data: {
        username: adminUser.username,
        password: hashedPassword, // Hashlenmiş şifre
        name: adminUser.name,
        surname: adminUser.surname,
        email: adminUser.email,
        isActive: true,
        credit: 0,
        debit: 0,
        userTypeId: adminUserType.id
      }
    })
    
    console.log('Admin kullanıcı başarıyla oluşturuldu:')
    console.log({
      userId: newUser.userId,
      username: newUser.username,
      email: newUser.email,
      // Şifreyi log'a yazmıyoruz güvenlik nedeniyle
      userTypeId: newUser.userTypeId
    })
    
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Scripti çalıştır
createAdminUser()
  .then(() => {
    console.log('İşlem tamamlandı.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Beklenmeyen bir hata oluştu:', error)
    process.exit(1)
  }) 