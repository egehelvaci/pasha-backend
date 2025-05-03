import { PrismaClient } from '../../../generated/prisma'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

/**
 * JWT token oluştur
 */
const createJwtToken = (payload: any) => {
  const jwtSecret = process.env.JWT_SECRET || 'pasha-secret-key'
  const expiresIn = process.env.JWT_EXPIRES || '1d'
  
  // JS uyumlu olması için Secret type'ını string olarak cast ediyoruz
  return jwt.sign(payload, jwtSecret as jwt.Secret, { expiresIn })
}

/**
 * Şifre doğrulama (hash kontrolü)
 */
const validatePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Şifre hashleme
 */
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

export default {
  /**
   * Custom login endpoint
   */
  async login(ctx) {
    try {
      const { username, password } = ctx.request.body

      // Gerekli alanların kontrolü
      if (!username || !password) {
        return ctx.badRequest('Kullanıcı adı ve şifre gereklidir.')
      }

      // Kullanıcıyı veritabanında ara
      const user = await prisma.user.findFirst({
        where: {
          username,
          isActive: true
        },
        include: {
          userType: true
        }
      })

      // Kullanıcı bulunamadıysa hata döndür
      if (!user) {
        return ctx.badRequest('Geçersiz kullanıcı adı veya şifre.')
      }

      // Test veya gerçek ortama göre şifre kontrolü
      let isPasswordValid
      if (process.env.NODE_ENV === 'development') {
        // Development ortamında doğrudan karşılaştırma (basitleştirilmiş)
        isPasswordValid = user.password === password
      } else {
        // Production ortamında hash kontrolü
        isPasswordValid = await validatePassword(password, user.password)
      }

      // Şifre geçersizse hata döndür
      if (!isPasswordValid) {
        return ctx.badRequest('Geçersiz kullanıcı adı veya şifre.')
      }

      // Kullanıcı bilgilerinden hassas verileri çıkart
      const sanitizedUser = {
        id: user.userId,
        username: user.username,
        email: user.email,
        name: user.name,
        surname: user.surname,
        userType: user.userType.name,
        avatar: user.avatar
      }

      // JWT token oluştur
      const token = createJwtToken({
        id: user.userId,
        username: user.username,
        userType: user.userType.name
      })

      // Başarılı yanıt döndür
      return {
        token,
        user: sanitizedUser
      }
    } catch (error) {
      console.error('Login hatası:', error)
      return ctx.internalServerError('Giriş işlemi sırasında bir hata oluştu.')
    }
  },

  /**
   * Kullanıcı bilgilerini getir (token ile)
   */
  async getMe(ctx) {
    try {
      // JWT token'dan kullanıcı bilgilerini al
      const userId = ctx.state.user?.id

      if (!userId) {
        return ctx.unauthorized('Yetkilendirme geçersiz.')
      }

      // Kullanıcıyı veritabanında ara
      const user = await prisma.user.findUnique({
        where: { userId },
        include: {
          userType: true
        }
      })

      if (!user) {
        return ctx.notFound('Kullanıcı bulunamadı.')
      }

      // Kullanıcı bilgilerinden hassas verileri çıkart
      const sanitizedUser = {
        id: user.userId,
        username: user.username,
        email: user.email,
        name: user.name,
        surname: user.surname,
        phoneNumber: user.phoneNumber,
        userType: user.userType.name,
        avatar: user.avatar,
        credit: user.credit,
        createdAt: user.createdAt
      }

      // Başarılı yanıt döndür
      return sanitizedUser
    } catch (error) {
      console.error('Kullanıcı bilgileri getirme hatası:', error)
      return ctx.internalServerError('Kullanıcı bilgileri alınırken bir hata oluştu.')
    }
  }
} 