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
      return this.normalizeUrl(process.env.FRONTEND_URL)
    }

    // Production ortamında (Vercel, Railway vs.)
    if (process.env.NODE_ENV === 'production') {
      // Vercel URL'i varsa kullan
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
      }
      // Railway URL'i varsa kullan
      if (process.env.RAILWAY_STATIC_URL) {
        return this.normalizeUrl(process.env.RAILWAY_STATIC_URL)
      }
      // Genel production URL
      return this.normalizeUrl(process.env.PRODUCTION_FRONTEND_URL || 'https://pasha-frontend.vercel.app')
    }

    // Development ortamında
    return 'http://localhost:3000'
  }

  /**
   * URL'yi normalize et (çift protokol sorununu düzelt)
   */
  private normalizeUrl(url: string): string {
    if (!url) return url
    
    // Çift protokol durumunu düzelt (https://https:// gibi)
    if (url.includes('://')) {
      // İlk protokolü bul
      const firstProtocolIndex = url.indexOf('://')
      const protocol = url.substring(0, firstProtocolIndex + 3)
      
      // Protokolden sonraki kısmı al
      let remaining = url.substring(firstProtocolIndex + 3)
      
      // Eğer remaining kısmında tekrar protokol varsa, onu kaldır
      if (remaining.startsWith('http://') || remaining.startsWith('https://')) {
        const secondProtocolIndex = remaining.indexOf('://')
        remaining = remaining.substring(secondProtocolIndex + 3)
      }
      
      // Temiz URL'yi oluştur
      return protocol + remaining
    }
    
    // Protokol yoksa https ekle
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    
    return url
  }

  /**
   * Şifre sıfırlama email'i gönder
   */
  async sendPasswordResetEmail(email: string, resetToken: string, userName: string) {
    try {
      const frontendUrl = this.getFrontendUrl()
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`
      
      console.log(`Frontend URL: ${frontendUrl}`)
      console.log(`Şifre sıfırlama linki oluşturuldu: ${resetUrl}`)
      
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Şifre Sıfırlama Talebi',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">Şifre Sıfırlama Talebi</h2>
            <p>Merhaba ${userName},</p>
            <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
            
            <!-- Buton ve Link -->
            <div style="text-align: center; margin: 30px 0;">
              <!-- Basit buton yaklaşımı -->
              <div style="display: inline-block; background-color: #007bff; border-radius: 5px; padding: 15px 30px;">
                <a href="${resetUrl}" 
                   style="color: white !important; text-decoration: none !important; font-weight: bold; font-size: 16px; display: block;">
                  Şifremi Sıfırla
                </a>
              </div>
              
              <!-- Alternatif: Sadece link -->
              <div style="margin-top: 15px;">
                <a href="${resetUrl}" 
                   style="color: #007bff; text-decoration: underline; font-weight: bold; font-size: 16px;">
                  → Şifre Sıfırlama Sayfasına Git
                </a>
              </div>
            </div>
            
            <!-- Açık URL -->
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Buton çalışmıyorsa, aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırın:</strong>
              </p>
              <p style="margin: 10px 0 0 0; word-break: break-all;">
                <a href="${resetUrl}" style="color: #007bff; text-decoration: underline;">${resetUrl}</a>
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              ⏰ Bu bağlantı <strong>1 saat</strong> boyunca geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu email'i görmezden gelebilirsiniz.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
            </p>
            <p style="color: #999; font-size: 12px; text-align: center;">
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