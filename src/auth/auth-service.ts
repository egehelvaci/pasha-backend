import { PrismaClient } from '../../generated/prisma'
import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface LoginCredentials {
  username: string
  password: string
}

interface TokenPayload {
  userId: string
  username: string
  userType: string
}

export class AuthService {
  private readonly jwtSecret: Secret
  private readonly jwtExpiresIn: number
  // Logout olan tokenları takip etmek için blacklist
  private tokenBlacklist: Set<string>

  constructor() {
    // .env dosyasından JWT yapılandırmaları
    this.jwtSecret = process.env.JWT_SECRET || 'c7fc1c9b27f84a9a9b74c78a5d3f9e72a3db1d19aef63bcb6bdf9f2c9e091d13'
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 60 * 60 * 24 * 7 // 7 gün
    this.tokenBlacklist = new Set<string>()
  }

  /**
   * Kullanıcı adı ve şifre ile login işlemi
   */
  async login(credentials: LoginCredentials) {
    try {
      // Kullanıcıyı bul (şifre kontrolü olmadan)
      const user = await prisma.user.findFirst({
        where: {
          username: credentials.username,
          isActive: true
        },
        include: {
          userType: true
        }
      })

      if (!user) {
        throw new Error('Kullanıcı adı veya şifre hatalı')
      }

      // Şifre kontrolü - bcrypt ile karşılaştırma
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
      if (!isPasswordValid) {
        throw new Error('Kullanıcı adı veya şifre hatalı')
      }

      // Token payload
      const payload: TokenPayload = {
        userId: user.userId,
        username: user.username,
        userType: user.userType.name
      }

      // JWT token oluştur
      const options: SignOptions = { expiresIn: this.jwtExpiresIn }
      const token = jwt.sign(payload, this.jwtSecret, options)

      return {
        token,
        user: {
          userId: user.userId,
          username: user.username,
          name: user.name,
          surname: user.surname,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isActive: user.isActive,
          createdAt: user.createdAt,
          avatar: user.avatar,
          credit: user.credit,
          debit: user.debit,
          userType: user.userType.name,
          userTypeId: user.userTypeId
        }
      }
    } catch (error) {
      console.error('Login hatası:', error)
      throw error
    }
  }

  /**
   * JWT token doğrulama
   */
  verifyToken(token: string): TokenPayload {
    try {
      // Eğer token blacklist'te ise hata fırlat
      if (this.isTokenBlacklisted(token)) {
        throw new Error('Token geçersiz kılınmış')
      }

      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload
      return decoded
    } catch (error) {
      throw new Error('Geçersiz veya süresi dolmuş token')
    }
  }

  /**
   * Logout işlemi - tokeni blacklist'e ekler
   */
  async logout(token: string): Promise<void> {
    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload
      
      // Token'ı blacklist'e ekle
      this.tokenBlacklist.add(token)
      
      console.log(`Kullanıcı çıkış yaptı: ${decoded.username}`)
    } catch (error) {
      console.error('Logout hatası:', error)
      throw new Error('Logout işlemi sırasında bir hata oluştu')
    }
  }

  /**
   * Token'ın blacklist'te olup olmadığını kontrol et
   */
  private isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token)
  }
} 