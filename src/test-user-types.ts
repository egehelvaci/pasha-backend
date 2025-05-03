import { PrismaClient } from '../generated/prisma'
import { UserService } from './user-service'

const prisma = new PrismaClient()
const userService = new UserService()

async function testUserTypes() {
  try {
    console.log('Kullanıcı Tipleri Testi Başlatılıyor...')
    
    // Tüm kullanıcı tiplerini getir
    const userTypes = await prisma.userType.findMany()
    console.log('Mevcut kullanıcı tipleri:', userTypes)
    
    // Admin tipi kullanıcıları listele
    const adminUsers = await userService.getUsersByType('admin')
    console.log('\nAdmin kullanıcıları:', adminUsers)
    
    // Editor tipi kullanıcıları listele
    const editorUsers = await userService.getUsersByType('editor')
    console.log('\nEditor kullanıcıları:', editorUsers)
    
    // Viewer tipi kullanıcıları listele
    const viewerUsers = await userService.getUsersByType('viewer')
    console.log('\nViewer kullanıcıları:', viewerUsers)
    
    // Yeni bir kullanıcı oluştur (editor tipi)
    const editorType = userTypes.find(type => type.name === 'editor')
    if (!editorType) {
      throw new Error('Editor tipi bulunamadı!')
    }
    
    const editorUser = await prisma.user.create({
      data: {
        username: 'editorkullanci',
        userTypeId: editorType.id,
        name: 'Editor',
        surname: 'Test',
        email: 'editor@example.com',
        password: 'editorgizli',
        phoneNumber: '5559876543'
      },
      include: {
        userType: true
      }
    })
    console.log('\nEditor kullanıcısı oluşturuldu:', editorUser)
    
    // Kullanıcı tipini değiştirme testi
    console.log('\nKullanıcı tipi değiştiriliyor...')
    const updatedUser = await userService.changeUserType(editorUser.userId, 'viewer')
    console.log('Kullanıcı tipi güncellendi:', updatedUser)
    
    // Tekrar tüm viewer kullanıcılarını listele
    const updatedViewerUsers = await userService.getUsersByType('viewer')
    console.log('\nGüncel viewer kullanıcıları:', updatedViewerUsers)
    
  } catch (error) {
    console.error('Test sırasında hata oluştu:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUserTypes() 