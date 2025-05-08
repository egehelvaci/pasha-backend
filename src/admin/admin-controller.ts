import { Request, Response } from 'express'
import { UserService } from '../user-service'
import { PrismaClient } from '../../generated/prisma'

const userService = new UserService()
const prisma = new PrismaClient()

export class AdminController {
  constructor() {
    this.getAllUsers = this.getAllUsers.bind(this)
    this.createUser = this.createUser.bind(this)
    this.updateUser = this.updateUser.bind(this)
    this.deleteUser = this.deleteUser.bind(this)
    this.getUserById = this.getUserById.bind(this)
  }

  /**
   * Tüm kullanıcıları listele
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      // Kullanıcı tipine göre filtreleme seçeneği
      const { userType } = req.query
      
      let users
      if (userType) {
        // Kullanıcı tipine göre filtrele, ancak isActive şartını kaldır
        users = await prisma.user.findMany({
          where: {
            userType: {
              name: userType as string
            }
          },
          include: {
            userType: true
          }
        })
      } else {
        // Tüm kullanıcıları getir (pasif olanlar dahil)
        users = await userService.getAllUsers()
      }
      
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcılar listelenirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Belirli bir kullanıcının bilgilerini getir
   */
  async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params
      
      const user = await prisma.user.findUnique({
        where: { userId },
        include: { userType: true }
      })
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        })
      }
      
      return res.status(200).json({
        success: true,
        data: user
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcı bilgileri alınırken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Yeni kullanıcı oluştur
   */
  async createUser(req: Request, res: Response) {
    try {
      const { username, password, name, surname, email, userTypeName, credit = 0, debit = 0, phoneNumber, avatar } = req.body
      
      // Zorunlu alanların kontrolü
      if (!username || !password || !userTypeName || !name || !surname || !email) {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcı adı, şifre, ad, soyad, e-posta ve kullanıcı tipi zorunludur'
        })
      }

      // Kullanıcı adının benzersiz olup olmadığını kontrol et
      const existingUser = await prisma.user.findFirst({
        where: { username }
      })
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Bu kullanıcı adı zaten kullanılıyor'
        })
      }
      
      // Kullanıcı tipini bul
      const userType = await prisma.userType.findFirst({
        where: { name: userTypeName }
      })
      
      if (!userType) {
        return res.status(404).json({
          success: false,
          message: `${userTypeName} tipinde bir kullanıcı tipi bulunamadı`
        })
      }
      
      // Şifreyi hashle
      const hashedPassword = await userService.hashPassword(password)
      
      // Yeni kullanıcı oluştur
      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          name,
          surname,
          email,
          isActive: true,
          credit: parseFloat(credit),
          debit: parseFloat(debit),
          userTypeId: userType.id,
          phoneNumber,
          avatar
        },
        include: {
          userType: true
        }
      })
      
      return res.status(201).json({
        success: true,
        data: newUser
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcı oluşturulurken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }
  
  /**
   * Kullanıcı bilgilerini güncelle
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { name, surname, email, userTypeName, isActive, password, credit, debit, phoneNumber, avatar } = req.body
      
      // Güncellenecek kullanıcının var olup olmadığını kontrol et
      const existingUser = await prisma.user.findUnique({
        where: { userId }
      })
      
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Güncellenecek kullanıcı bulunamadı'
        })
      }
      
      // Güncelleme verileri
      const updateData: any = {}
      
      if (name !== undefined) updateData.name = name
      if (surname !== undefined) updateData.surname = surname
      if (email !== undefined) updateData.email = email
      if (isActive !== undefined) updateData.isActive = isActive
      
      // Şifre değiştirilecekse hashle
      if (password !== undefined) {
        updateData.password = await userService.hashPassword(password)
      }
      
      if (credit !== undefined) updateData.credit = parseFloat(credit)
      if (debit !== undefined) updateData.debit = parseFloat(debit)
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
      if (avatar !== undefined) updateData.avatar = avatar
      
      // Kullanıcı tipi değiştirilecekse
      if (userTypeName) {
        const userType = await prisma.userType.findFirst({
          where: { name: userTypeName }
        })
        
        if (!userType) {
          return res.status(404).json({
            success: false,
            message: `${userTypeName} tipinde bir kullanıcı tipi bulunamadı`
          })
        }
        
        updateData.userTypeId = userType.id
      }
      
      // Kullanıcıyı güncelle
      const updatedUser = await prisma.user.update({
        where: { userId },
        data: updateData,
        include: {
          userType: true
        }
      })
      
      return res.status(200).json({
        success: true,
        data: updatedUser
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcı güncellenirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }
  
  /**
   * Kullanıcıyı sil veya deaktif et
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { permanently = false } = req.body
      
      // Kullanıcının var olup olmadığını kontrol et
      const existingUser = await prisma.user.findUnique({
        where: { userId }
      })
      
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Silinecek kullanıcı bulunamadı'
        })
      }

      // Admin kendisini silemez
      if (req.user?.userId === userId) {
        return res.status(403).json({
          success: false,
          message: 'Kendi hesabınızı silemezsiniz'
        })
      }
      
      // Kalıcı silme işlemi
      if (permanently) {
        await prisma.user.delete({
          where: { userId }
        })
        
        return res.status(200).json({
          success: true,
          message: 'Kullanıcı kalıcı olarak silindi'
        })
      } 
      // Deaktif etme işlemi
      else {
        await userService.deactivate(userId)
        
        return res.status(200).json({
          success: true,
          message: 'Kullanıcı deaktif edildi'
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcı silinirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }
} 