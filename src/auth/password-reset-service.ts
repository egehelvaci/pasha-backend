import crypto from 'crypto'
import bcrypt from 'bcrypt'
import prisma from '../utils/prisma'
import { emailService } from '../utils/email-service'

export class PasswordResetService {
  /**
   * Şifre sıfırlama token'ı oluştur ve email gönder
   */
  async requestPasswordReset(email: string) {
    try {
      // Kullanıcıyı email ile bul
      const user = await prisma.user.findUnique({
        where: {
          email: email,
          isActive: true
        }
      })

      if (!user) {
        // Güvenlik nedeniyle kullanıcı bulunamasa bile başarılı mesajı döndür
        return {
          success: true,
          message: 'Eğer bu email adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir.'
        }
      }

      // Mevcut aktif token'ları pasif yap
      await prisma.passwordResetToken.updateMany({
        where: {
          userId: user.userId,
          isUsed: false,
          expiresAt: {
            gt: new Date()
          }
        },
        data: {
          isUsed: true
        }
      })

      // Yeni token oluştur
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 saat sonra

      // Token'ı veritabanına kaydet
      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: user.userId,
          expiresAt: expiresAt
        }
      })

      // Email gönder
      await emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        `${user.name} ${user.surname}`
      )

      console.log(`Şifre sıfırlama talebi oluşturuldu: ${user.email}`)

      return {
        success: true,
        message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.'
      }
    } catch (error) {
      console.error('Şifre sıfırlama talebi hatası:', error)
      throw new Error('Şifre sıfırlama talebi işlenirken bir hata oluştu')
    }
  }

  /**
   * Token'ı doğrula
   */
  async validateResetToken(token: string) {
    try {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: {
          token: token
        },
        include: {
          user: true
        }
      })

      if (!resetToken) {
        return {
          valid: false,
          message: 'Geçersiz token'
        }
      }

      if (resetToken.isUsed) {
        return {
          valid: false,
          message: 'Bu token daha önce kullanılmış'
        }
      }

      if (resetToken.expiresAt < new Date()) {
        return {
          valid: false,
          message: 'Token\'ın süresi dolmuş'
        }
      }

      if (!resetToken.user.isActive) {
        return {
          valid: false,
          message: 'Kullanıcı hesabı aktif değil'
        }
      }

      return {
        valid: true,
        userId: resetToken.userId,
        email: resetToken.user.email
      }
    } catch (error) {
      console.error('Token doğrulama hatası:', error)
      throw new Error('Token doğrulanırken bir hata oluştu')
    }
  }

  /**
   * Şifreyi sıfırla
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      // Token'ı doğrula
      const validation = await this.validateResetToken(token)
      
      if (!validation.valid) {
        throw new Error(validation.message)
      }

      // Şifreyi hash'le
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Kullanıcının şifresini güncelle
      await prisma.user.update({
        where: {
          userId: validation.userId
        },
        data: {
          password: hashedPassword
        }
      })

      // Token'ı kullanılmış olarak işaretle
      await prisma.passwordResetToken.update({
        where: {
          token: token
        },
        data: {
          isUsed: true
        }
      })

      console.log(`Şifre başarıyla sıfırlandı: ${validation.email}`)

      return {
        success: true,
        message: 'Şifreniz başarıyla güncellendi'
      }
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error)
      throw error
    }
  }

  /**
   * Süresi dolmuş token'ları temizle
   */
  async cleanupExpiredTokens() {
    try {
      const result = await prisma.passwordResetToken.deleteMany({
        where: {
          OR: [
            {
              expiresAt: {
                lt: new Date()
              }
            },
            {
              isUsed: true,
              createdAt: {
                lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 saat öncesi
              }
            }
          ]
        }
      })

      console.log(`${result.count} adet süresi dolmuş token temizlendi`)
      return result.count
    } catch (error) {
      console.error('Token temizleme hatası:', error)
      throw new Error('Token temizlenirken bir hata oluştu')
    }
  }
}

export const passwordResetService = new PasswordResetService() 