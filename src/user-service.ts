import bcrypt from 'bcrypt'
import { Prisma } from '../generated/prisma'
import prisma from './utils/prisma'
import jwt from 'jsonwebtoken'

export class UserService {
  /**
   * Tüm kullanıcıları getir (aktif ve deaktif)
   */
  async getAllUsers() {
    return await prisma.user.findMany({
      include: {
        userType: true,
        Store: true
      },
      orderBy: [
        { isActive: 'desc' }, // Aktif kullanıcılar önce
        { createdAt: 'desc' }
      ]
    })
  }

  /**
   * Sadece aktif kullanıcıları getir
   */
  async getActiveUsers() {
    return await prisma.user.findMany({
      where: {
        isActive: true
      },
      include: {
        userType: true,
        Store: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  /**
   * Kullanıcı adına göre kullanıcı getir
   */
  async getUserByUsername(username: string) {
    return await prisma.user.findUnique({
      where: {
        username
      },
      include: {
        userType: true,
        Store: true
      }
    })
  }

  /**
   * ID'ye göre kullanıcı getir
   */
  async getUserById(userId: string) {
    return await prisma.user.findUnique({
      where: {
        userId
      },
      include: {
        userType: true,
        Store: true
      }
    })
  }

  /**
   * Yeni kullanıcı oluştur
   */
  async createUser(userData: any) {
    const hashedPassword = await this.hashPassword(userData.password)
    
    return await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      },
      include: {
        userType: true,
        Store: true
      }
    })
  }

  /**
   * Kullanıcı bilgilerini güncelle
   */
  async updateUser(userId: string, userData: any) {
    // Şifre güncellenecekse hash'le
    if (userData.password) {
      userData.password = await this.hashPassword(userData.password)
    }
    
    return await prisma.user.update({
      where: {
        userId
      },
      data: userData,
      include: {
        userType: true,
        Store: true
      }
    })
  }

  /**
   * Kullanıcıyı deaktif et
   */
  async deactivate(userId: string) {
    // Önce kullanıcının mevcut bilgilerini al
    const existingUser = await prisma.user.findUnique({
      where: { userId }
    })
    
    if (!existingUser) {
      throw new Error('Kullanıcı bulunamadı')
    }
    
    // Username ve email'i değiştir ve deaktif et
    const timestamp = Date.now()
    return await prisma.user.update({
      where: { userId },
      data: {
        isActive: false,
        username: `${existingUser.username}_deactivated_${timestamp}`,
        email: `${existingUser.email}_deactivated_${timestamp}`
      }
    })
  }

  /**
   * Kullanıcıyı aktif et
   */
  async activate(userId: string) {
    // Önce kullanıcının mevcut bilgilerini al
    const existingUser = await prisma.user.findUnique({
      where: { userId }
    })
    
    if (!existingUser) {
      throw new Error('Kullanıcı bulunamadı')
    }
    
    // Eğer username ve email deactivated suffix'i içeriyorsa, orijinal halini geri yükle
    let originalUsername = existingUser.username
    let originalEmail = existingUser.email
    
    if (existingUser.username.includes('_deactivated_')) {
      originalUsername = existingUser.username.split('_deactivated_')[0]
    }
    
    if (existingUser.email.includes('_deactivated_')) {
      originalEmail = existingUser.email.split('_deactivated_')[0]
    }
    
    // Orijinal username ve email'in başka aktif kullanıcı tarafından kullanılıp kullanılmadığını kontrol et
    const conflictingUser = await prisma.user.findFirst({
      where: {
        AND: [
          {
            OR: [
              { username: originalUsername },
              { email: originalEmail }
            ]
          },
          { isActive: true },
          { userId: { not: userId } } // Kendisi hariç
        ]
      }
    })
    
    if (conflictingUser) {
      throw new Error('Bu kullanıcı adı veya email başka bir aktif kullanıcı tarafından kullanılıyor')
    }
    
    return await prisma.user.update({
      where: { userId },
      data: {
        isActive: true,
        username: originalUsername,
        email: originalEmail
      }
    })
  }

  /**
   * Kullanıcıyı sil
   */
  async deleteUser(userId: string) {
    return await prisma.user.delete({
      where: {
        userId
      }
    })
  }

  /**
   * Şifre hash'leme
   */
  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  }

  /**
   * Şifre doğrulama
   */
  async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword)
  }

  /**
   * JWT token oluştur
   */
  generateToken(user: any) {
    const payload = {
      userId: user.userId,
      username: user.username,
      userType: user.userType.name
    }
    
    const secret = process.env.JWT_SECRET || 'default_secret_key'
    const expiresIn = '24h'
    
    return jwt.sign(payload, secret, { expiresIn })
  }

  /**
   * Kullanıcıyı mağazaya ata
   */
  async assignUserToStore(userId: string, storeId: string) {
    return await prisma.user.update({
      where: {
        userId
      },
      data: {
        store_id: storeId
      },
      include: {
        Store: true
      }
    })
  }

  /**
   * Kullanıcıyı mağazadan kaldır
   */
  async removeUserFromStore(userId: string) {
    return await prisma.user.update({
      where: {
        userId
      },
      data: {
        store_id: null
      }
    })
  }
}

export const userService = new UserService() 