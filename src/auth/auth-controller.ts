import { Request, Response } from 'express'
import { AuthService } from './auth-service'

const authService = new AuthService()

export class AuthController {
  constructor() {
    // Metodu this bağlamına bağla
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
  }

  /**
   * Login işlemi
   */
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body

      // Giriş bilgilerinin validation kontrolü
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcı adı ve şifre zorunludur'
        })
      }

      // Login işlemini gerçekleştir
      const loginResult = await authService.login({ username, password })

      // Başarılı yanıt
      return res.status(200).json({
        success: true,
        data: {
          token: loginResult.token,
          user: loginResult.user
        }
      })
    } catch (error) {
      // İşlemde hata oluşursa
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'
      
      return res.status(401).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Logout işlemi
   */
  async logout(req: Request, res: Response) {
    try {
      // Token bilgisini al
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir token bulunamadı'
        })
      }
      
      const token = authHeader.split(' ')[1]
      
      // Logout işlemini gerçekleştir
      await authService.logout(token)
      
      return res.status(200).json({
        success: true,
        message: 'Başarıyla çıkış yapıldı'
      })
    } catch (error) {
      // İşlemde hata oluşursa
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'
      
      return res.status(400).json({
        success: false,
        message: errorMessage
      })
    }
  }
} 