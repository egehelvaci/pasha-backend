import { Request, Response } from 'express'
import { passwordResetService } from './password-reset-service'

export class PasswordResetController {
  /**
   * Şifre sıfırlama talebi
   * POST /api/auth/forgot-password
   */
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body

      // Email validasyonu
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email adresi gereklidir'
        })
      }

      // Email format kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir email adresi giriniz'
        })
      }

      const result = await passwordResetService.requestPasswordReset(email.toLowerCase().trim())

      res.status(200).json(result)
    } catch (error) {
      console.error('Şifre sıfırlama talebi hatası:', error)
      res.status(500).json({
        success: false,
        message: 'Sunucu hatası oluştu'
      })
    }
  }

  /**
   * Token doğrulama
   * GET /api/auth/validate-reset-token/:token
   */
  async validateResetToken(req: Request, res: Response) {
    try {
      const { token } = req.params

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token gereklidir'
        })
      }

      const result = await passwordResetService.validateResetToken(token)

      if (result.valid) {
        res.status(200).json({
          success: true,
          message: 'Token geçerli',
          email: result.email
        })
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        })
      }
    } catch (error) {
      console.error('Token doğrulama hatası:', error)
      res.status(500).json({
        success: false,
        message: 'Sunucu hatası oluştu'
      })
    }
  }

  /**
   * Şifre sıfırlama
   * POST /api/auth/reset-password
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword, confirmPassword } = req.body

      // Gerekli alanları kontrol et
      if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token, yeni şifre ve şifre onayı gereklidir'
        })
      }

      // Şifre eşleşme kontrolü
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Şifreler eşleşmiyor'
        })
      }

      // Şifre uzunluk kontrolü
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Şifre en az 6 karakter olmalıdır'
        })
      }

      const result = await passwordResetService.resetPassword(token, newPassword)

      res.status(200).json(result)
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error)
      
      // Hata mesajını kullanıcıya ilet
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Sunucu hatası oluştu'
        })
      }
    }
  }

  /**
   * Süresi dolmuş token'ları temizle (Admin endpoint)
   * DELETE /api/auth/cleanup-tokens
   */
  async cleanupExpiredTokens(req: Request, res: Response) {
    try {
      const count = await passwordResetService.cleanupExpiredTokens()

      res.status(200).json({
        success: true,
        message: `${count} adet süresi dolmuş token temizlendi`,
        count
      })
    } catch (error) {
      console.error('Token temizleme hatası:', error)
      res.status(500).json({
        success: false,
        message: 'Sunucu hatası oluştu'
      })
    }
  }
}

export const passwordResetController = new PasswordResetController() 