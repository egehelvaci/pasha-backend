import { PrismaClient } from '../generated/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

class UserService {
  /**
   * Tüm aktif kullanıcıları getir
   */
  async getAllUsers() {
    return await prisma.user.findMany({
      where: {
        isActive: true
      },
      include: {
        userType: true,
        Store: true
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
    return await prisma.user.update({
      where: {
        userId
      },
      data: {
        isActive: false
      }
    })
  }

  /**
   * Kullanıcıyı aktif et
   */
  async activate(userId: string) {
    return await prisma.user.update({
      where: {
        userId
      },
      data: {
        isActive: true
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