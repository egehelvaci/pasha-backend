import { UserService } from './user-service'

// Kullanıcı servisi örneği oluştur
const userService = new UserService()

async function testUserService() {
  try {
    // Tüm aktif kullanıcıları listele
    console.log('Aktif kullanıcılar:')
    const activeUsers = await userService.getAllActiveUsers()
    console.log(activeUsers)
    
    // İlk kullanıcı varsa kullanıcı adı ve şifre ile kimlik doğrulama yap
    if (activeUsers.length > 0) {
      const testUser = activeUsers[0]
      
      // Kimlik doğrulama
      console.log('\nKimlik doğrulama testi:')
      const isAuthenticated = await userService.authenticate(testUser.username, testUser.password)
      console.log(`Kimlik doğrulama sonucu: ${isAuthenticated ? 'Başarılı' : 'Başarısız'}`)
      
      // Kredi güncelleme
      console.log('\nKredi güncelleme testi:')
      const oldCredit = testUser.credit
      console.log(`Eski kredi: ${oldCredit}`)
      
      const updatedUser = await userService.updateCredit(testUser.userId, 50)
      console.log(`Yeni kredi: ${updatedUser.credit}`)
      
      // Hesabı deaktif etme
      console.log('\nHesap deaktif etme testi:')
      await userService.deactivate(testUser.userId)
      
      // Tekrar aktif kullanıcıları kontrol et
      const remainingActiveUsers = await userService.getAllActiveUsers()
      console.log(`Kalan aktif kullanıcı sayısı: ${remainingActiveUsers.length}`)
    } else {
      console.log('Test için aktif kullanıcı bulunamadı!')
    }
  } catch (error) {
    console.error('Test sırasında hata oluştu:', error)
  }
}

// Testi çalıştır
testUserService() 