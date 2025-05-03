import { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth-service'

const authService = new AuthService()

// JWT token bilgisini req objesine eklemek için Request tipini genişletiyoruz
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        username: string
        userType: string
      }
    }
  }
}

/**
 * JWT token'ı kontrol eden ve kullanıcı bilgilerini req objesine ekleyen middleware
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Authorization header'dan token'ı al
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme başarısız: Token bulunamadı'
      })
    }

    // "Bearer " önekini kaldır
    const token = authHeader.split(' ')[1]

    // Token'ı doğrula
    const decodedToken = authService.verifyToken(token)

    // Kullanıcı bilgilerini request'e ekle
    req.user = {
      userId: decodedToken.userId,
      username: decodedToken.username,
      userType: decodedToken.userType
    }

    // İşleme devam et
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Yetkilendirme başarısız: Geçersiz token'
    })
  }
}

/**
 * Belirli kullanıcı tiplerine göre erişim kontrolü yapan middleware
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme başarısız: Lütfen önce giriş yapın'
      })
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlemi yapmak için yetkiniz bulunmuyor'
      })
    }

    next()
  }
} 