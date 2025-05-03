import * as jwt from 'jsonwebtoken'
import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

/**
 * JWT token doğrulama middleware'i
 */
export default async (ctx, next) => {
  try {
    // Authorization header'dan token'ı al
    const authHeader = ctx.request.header.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.unauthorized('Yetkilendirme başlığı geçersiz.')
    }
    
    const token = authHeader.substring(7) // 'Bearer ' kısmını çıkart
    const jwtSecret = process.env.JWT_SECRET || 'pasha-secret-key'
    
    // Token'ı doğrula
    try {
      const decoded = jwt.verify(token, jwtSecret as jwt.Secret) as jwt.JwtPayload
      
      // Token içinden kullanıcı bilgilerini al
      if (!decoded || !decoded.id) {
        return ctx.unauthorized('Geçersiz token.')
      }
      
      // Kullanıcının veritabanında olduğunu doğrula
      const user = await prisma.user.findUnique({
        where: { userId: decoded.id },
        include: {
          userType: true
        }
      })
      
      if (!user || !user.isActive) {
        return ctx.unauthorized('Kullanıcı bulunamadı veya devre dışı.')
      }
      
      // Kullanıcı bilgilerini context'e ekle
      ctx.state.user = {
        id: user.userId,
        username: user.username,
        userType: user.userType.name
      }
      
      // Sonraki middleware'e geç
      return await next()
    } catch (error) {
      console.error('Token doğrulama hatası:', error)
      return ctx.unauthorized('Token doğrulanamadı.')
    }
  } catch (error) {
    console.error('Middleware hatası:', error)
    return ctx.internalServerError('Yetkilendirme işlemi sırasında bir hata oluştu.')
  }
} 