import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'pasha-secret-key';

// Token doğrulama middleware
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Bearer token'ı al
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Erişim yetkiniz yok. Giriş yapmalısınız.'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // req.user'a kullanıcı ID'sini ekle
    (req as any).user = {
      userId: decoded.userId
    };
    
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Geçersiz veya süresi dolmuş token'
    });
  }
};

// Opsiyonel token doğrulama - token varsa kullanıcı bilgisini ekler, yoksa geçer
export const optionalVerifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Bearer token'ı al
  const authHeader = req.headers.authorization;
  
  // Token yoksa veya format uygun değilse, kullanıcı bilgisi olmadan devam et
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // req.user'a kullanıcı ID'sini ekle
    (req as any).user = {
      userId: decoded.userId
    };
  } catch (error) {
    // Token geçersiz olsa bile, kullanıcı bilgisi olmadan devam et
    console.warn('Geçersiz token algılandı, anonim kullanıcı olarak devam ediliyor');
  }
  
  // Her durumda işleme devam et
  next();
};

// Admin kullanıcı kontrolü middleware
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Önce token doğrulaması yap
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Erişim yetkiniz yok. Giriş yapmalısınız.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // req.user'a kullanıcı ID'sini ekle
      (req as any).user = {
        userId: decoded.userId
      };
      
      // Kullanıcı bilgilerini getir ve admin kontrolü yap
      const userId = decoded.userId;
      const user = await prisma.user.findUnique({
        where: { userId },
        include: { userType: true }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }
      
      // Kullanıcı türü admin mi kontrol et (userTypeId = 1 admin kullanıcı tipidir)
      if (user.userTypeId !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Bu işlemi yapmak için admin yetkiniz yok'
        });
      }
      
      // Admin ise işleme devam et
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      });
    }
  } catch (error) {
    console.error('Admin yetki kontrolü hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
}; 