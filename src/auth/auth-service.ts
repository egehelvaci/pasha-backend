import { PrismaClient } from '../../generated/prisma'
import jwt, { Secret, SignOptions } from 'jsonwebtoken'

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
  private readonly jwtExpiresIn: string

  constructor() {
    // .env dosyasından JWT yapılandırmaları
    this.jwtSecret = process.env.JWT_SECRET || 'c7fc1c9b27f84a9a9b74c78a5d3f9e72a3db1d19aef63bcb6bdf9f2c9e091d13'
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d'
  }

  /**
   * Kullanıcı adı ve şifre ile login işlemi
   */
  async login(credentials: LoginCredentials) {
    try {
      // Şimdilik şifre hashlemesi olmadan kullanıcı kontrolü
      const user = await prisma.user.findFirst({
        where: {
          username: credentials.username,
          password: credentials.password, // Normalde bu şekilde plain text saklanmamalı
          isActive: true
        },
        include: {
          userType: true
        }
      })

      if (!user) {
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
          userType: user.userType.name
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
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload
      return decoded
    } catch (error) {
      throw new Error('Geçersiz veya süresi dolmuş token')
    }
  }
} 