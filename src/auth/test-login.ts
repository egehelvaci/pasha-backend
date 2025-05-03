import { AuthService } from './auth-service'
import { PrismaClient } from '../../generated/prisma'

const authService = new AuthService()
const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('Login testi başlatılıyor...')
    
    // Test için kullanıcı adı ve şifre
    const testCredentials = {
      username: 'testkullanici',  // Bu kullanıcı test-user-types.ts içinde oluşturulmuştu
      password: 'gizli123'
    }
    
    console.log('Test kullanıcı bilgileri:', testCredentials)
    
    // Login işlemini dene
    const loginResult = await authService.login(testCredentials)
    console.log('Login başarılı!')
    console.log('Token:', loginResult.token)
    console.log('Kullanıcı bilgileri:', loginResult.user)
    
    // Token doğrulamasını test et
    console.log('\nToken doğrulama testi:')
    const decodedToken = authService.verifyToken(loginResult.token)
    console.log('Çözümlenmiş token bilgileri:', decodedToken)
    
  } catch (error) {
    console.error('Login testi sırasında hata oluştu:', error)
    
    // Eğer kullanıcı bulunamadıysa, yeni bir test kullanıcısı oluştur
    if (error instanceof Error && error.message === 'Kullanıcı adı veya şifre hatalı') {
      console.log('\nTest kullanıcısı oluşturuluyor...')
      
      // Önce admin user type'ı kontrol et
      const adminUserType = await prisma.userType.findFirst({
        where: { name: 'admin' }
      })
      
      if (!adminUserType) {
        throw new Error('Admin kullanıcı tipi bulunamadı. Önce seed-user-types.ts çalıştırılmalı.')
      }
      
      // Test kullanıcısı oluştur
      const testUser = await prisma.user.create({
        data: {
          username: 'testkullanici',
          userTypeId: adminUserType.id,
          name: 'Test',
          surname: 'Kullanıcı',
          email: 'test@example.com',
          password: 'gizli123',
          phoneNumber: '5551234567'
        },
        include: {
          userType: true
        }
      })
      
      console.log('Test kullanıcısı oluşturuldu:', testUser)
      console.log('Lütfen testi tekrar çalıştırın.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testLogin() 