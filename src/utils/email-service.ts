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
    console.log('\n=== FRONTEND URL DEBUG ===')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL)
    console.log('VERCEL_URL:', process.env.VERCEL_URL)
    console.log('RAILWAY_STATIC_URL:', process.env.RAILWAY_STATIC_URL)
    console.log('==========================')
    
    // 1. Öncelik: FRONTEND_URL environment variable
    if (process.env.FRONTEND_URL) {
      const result = this.normalizeUrl(process.env.FRONTEND_URL)
      console.log('✅ Using FRONTEND_URL:', result)
      return result
    }

    // 2. Production ortamında platform-specific URL'leri kullan
    if (process.env.NODE_ENV === 'production') {
      // Vercel deployment
      if (process.env.VERCEL_URL) {
        const result = this.normalizeUrl(process.env.VERCEL_URL)
        console.log('✅ Using VERCEL_URL:', result)
        return result
      }
      
      // Railway deployment
      if (process.env.RAILWAY_STATIC_URL) {
        const result = this.normalizeUrl(process.env.RAILWAY_STATIC_URL)
        console.log('✅ Using RAILWAY_STATIC_URL:', result)
        return result
      }
      
      // Fallback production URL
      const fallbackUrl = process.env.PRODUCTION_FRONTEND_URL || 'https://pasha-frontend.vercel.app'
      console.log('⚠️ Using fallback production URL:', fallbackUrl)
      return fallbackUrl
    }

    // 3. Development ortamında
    const devUrl = 'http://localhost:3000'
    console.log('✅ Using development URL:', devUrl)
    return devUrl
  }

  /**
   * URL'yi normalize et (çift protokol sorununu düzelt)
   */
  private normalizeUrl(url: string): string {
    if (!url) return url
    
    console.log('🔧 normalizeUrl input:', url)
    
    // URL'yi temizle
    let result = url.trim()
    
    // Çift protokol sorununu düzelt
    // https://https:// veya http://https:// gibi durumları temizle
    result = result.replace(/^(https?:\/\/)+/g, 'https://')
    
    // Eğer hiç protokol yoksa https ekle
    if (!result.startsWith('http://') && !result.startsWith('https://')) {
      result = `https://${result}`
    }
    
    // Son slash'i kaldır (eğer varsa)
    result = result.replace(/\/$/, '')
    
    console.log('🔧 normalizeUrl final output:', result)
    return result
  }

  /**
   * Şifre sıfırlama email'i gönder
   */
  async sendPasswordResetEmailQueued(email: string, resetToken: string, userName: string): Promise<boolean> {
    try {
      await this.sendPasswordResetEmail(email, resetToken, userName);
      return true;
    } catch (error) {
      console.error('Email gönderme hatası:', error);
      return false;
    }
  }

  /**
   * Şifre sıfırlama email'i gönder (asıl işlem)
   */
  async sendPasswordResetEmail(email: string, resetToken: string, userName: string) {
    try {
      const frontendUrl = this.getFrontendUrl()
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`
      
      console.log('\n=== FINAL EMAIL URL ===')
      console.log('Frontend URL:', frontendUrl)
      console.log('Reset URL:', resetUrl)
      console.log('=======================\n')
      
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
      console.log('✅ Email gönderildi, messageId:', result.messageId)
      return result
    } catch (error) {
      console.error('❌ Email gönderme hatası:', error)
      throw new Error('Email gönderilemedi')
    }
  }

  /**
   * Email bağlantısını test et
   */
  async verifyConnection() {
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      return false
    }
  }
}

export const emailService = new EmailService() 