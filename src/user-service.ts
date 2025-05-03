import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

export class UserService {
  /**
   * Kullanıcı kimlik doğrulama
   * @param username Kullanıcı adı
   * @param password Şifre
   * @returns Kimlik doğrulama başarılı ise true, değilse false
   */
  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          username,
          password,
          isActive: true
        }
      })
      
      return !!user // Kullanıcı bulundu ise true, bulunamadı ise false döner
    } catch (error) {
      console.error('Kullanıcı kimlik doğrulama hatası:', error)
      return false
    }
  }
  
  /**
   * Kullanıcı hesabını deaktif etme
   * @param userId Kullanıcı ID
   */
  async deactivate(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { userId },
        data: { isActive: false }
      })
      console.log(`${userId} ID'li kullanıcı deaktif edildi.`)
    } catch (error) {
      console.error('Kullanıcı deaktif etme hatası:', error)
      throw new Error('Kullanıcı deaktif edilemedi')
    }
  }
  
  /**
   * Tüm aktif kullanıcıları getir
   */
  async getAllActiveUsers() {
    return prisma.user.findMany({
      where: { isActive: true },
      include: {
        userType: true
      }
    })
  }
  
  /**
   * Belirli bir tipteki tüm kullanıcıları getir
   * @param typeName Kullanıcı tipi adı (admin, editor, viewer)
   */
  async getUsersByType(typeName: string) {
    return prisma.user.findMany({
      where: {
        userType: {
          name: typeName
        },
        isActive: true
      },
      include: {
        userType: true
      }
    })
  }
  
  /**
   * Kullanıcı kredisini güncelle
   */
  async updateCredit(userId: string, amount: number) {
    return prisma.user.update({
      where: { userId },
      data: {
        credit: {
          increment: amount
        }
      },
      include: {
        userType: true
      }
    })
  }
  
  /**
   * Kullanıcı tipini değiştir
   */
  async changeUserType(userId: string, newUserTypeName: string) {
    const userType = await prisma.userType.findFirst({
      where: { name: newUserTypeName }
    })
    
    if (!userType) {
      throw new Error(`${newUserTypeName} tipinde bir kullanıcı tipi bulunamadı`)
    }
    
    return prisma.user.update({
      where: { userId },
      data: {
        userTypeId: userType.id
      },
      include: {
        userType: true
      }
    })
  }
} 