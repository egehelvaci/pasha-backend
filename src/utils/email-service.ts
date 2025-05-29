import nodemailer from 'nodemailer'

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    // SMTP yapılandırması - .env dosyasından alınacak
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  /**
   * Frontend URL'ini environment'a göre belirle
   */
  private getFrontendUrl(): string {
    // Öncelik sırası:
    // 1. FRONTEND_URL environment variable
    // 2. NODE_ENV'e göre otomatik belirleme
    // 3. Default local URL
    
    if (process.env.FRONTEND_URL) {
      return process.env.FRONTEND_URL
    }

    // Production ortamında (Vercel, Railway vs.)
    if (process.env.NODE_ENV === 'production') {
      // Vercel URL'i varsa kullan
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
      }
      // Railway URL'i varsa kullan
      if (process.env.RAILWAY_STATIC_URL) {
        return process.env.RAILWAY_STATIC_URL
      }
      // Genel production URL
      return process.env.PRODUCTION_FRONTEND_URL || 'https://pasha-frontend.vercel.app'
    }

    // Development ortamında
    return 'http://localhost:3000'
  }

  /**
   * Şifre sıfırlama email'i gönder
   */
  async sendPasswordResetEmail(email: string, resetToken: string, userName: string) {
    try {
      const frontendUrl = this.getFrontendUrl()
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`
      
      console.log(`Şifre sıfırlama linki oluşturuldu: ${resetUrl}`)
      
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Şifre Sıfırlama Talebi',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Şifre Sıfırlama Talebi</h2>
            <p>Merhaba ${userName},</p>
            <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Şifremi Sıfırla
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Bu bağlantı 1 saat boyunca geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu email'i görmezden gelebilirsiniz.
            </p>
            <p style="color: #666; font-size: 14px;">
              Bağlantı çalışmıyorsa, aşağıdaki URL'yi tarayıcınıza kopyalayabilirsiniz:<br>
              ${resetUrl}
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
            </p>
            <p style="color: #999; font-size: 12px;">
              Environment: ${process.env.NODE_ENV || 'development'} | Frontend: ${frontendUrl}
            </p>
          </div>
        `
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Şifre sıfırlama email\'i gönderildi:', result.messageId)
      return result
    } catch (error) {
      console.error('Email gönderme hatası:', error)
      throw new Error('Email gönderilemedi')
    }
  }

  /**
   * Email bağlantısını test et
   */
  async verifyConnection() {
    try {
      await this.transporter.verify()
      console.log('SMTP bağlantısı başarılı')
      return true
    } catch (error) {
      console.error('SMTP bağlantı hatası:', error)
      return false
    }
  }
}

export const emailService = new EmailService() 