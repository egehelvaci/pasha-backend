import { Request, Response } from 'express'
import { userService } from '../user-service'
import prisma from '../utils/prisma'

export class AdminController {
  constructor() {
    this.getAllUsers = this.getAllUsers.bind(this)
    this.createUser = this.createUser.bind(this)
    this.updateUser = this.updateUser.bind(this)
    this.deleteUser = this.deleteUser.bind(this)
    this.getUserById = this.getUserById.bind(this)
    this.assignUserToStore = this.assignUserToStore.bind(this)
    this.removeUserFromStore = this.removeUserFromStore.bind(this)
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
            userType: true,
            Store: true
          }
        })
      } else {
        // Tüm kullanıcıları getir (pasif olanlar dahil)
        users = await prisma.user.findMany({
          include: {
            userType: true,
            Store: true
          }
        })
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
        include: { 
          userType: true,
          Store: true
        }
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
      const { 
        username, 
        password, 
        name, 
        surname, 
        email, 
        userTypeName, 
        credit = 0, 
        debit = 0, 
        phoneNumber,
        store_id
      } = req.body
      
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
      
      // Mağaza ID'si belirtilmişse mağazanın var olup olmadığını kontrol et
      if (store_id) {
        const store = await prisma.store.findUnique({
          where: { store_id }
        })
        
        if (!store) {
          return res.status(404).json({
            success: false,
            message: 'Belirtilen mağaza bulunamadı'
          })
        }
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
          store_id
        },
        include: {
          userType: true,
          Store: true
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
      const { 
        name, 
        surname, 
        email, 
        userTypeName, 
        isActive, 
        password, 
        credit, 
        debit, 
        phoneNumber,
        store_id
      } = req.body
      
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
      
      // Mağaza ID'si değiştirilecekse
      if (store_id !== undefined) {
        if (store_id === null) {
          // Mağaza ilişkisini kaldır
          updateData.store_id = null
        } else {
          // Mağazanın var olup olmadığını kontrol et
          const store = await prisma.store.findUnique({
            where: { store_id }
          })
          
          if (!store) {
            return res.status(404).json({
              success: false,
              message: 'Belirtilen mağaza bulunamadı'
            })
          }
          
          updateData.store_id = store_id
        }
      }
      
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
          userType: true,
          Store: true
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

  /**
   * Kullanıcıyı mağazaya ata
   */
  async assignUserToStore(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { storeId } = req.body
      
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Mağaza ID\'si zorunludur'
        })
      }
      
      // Kullanıcının var olup olmadığını kontrol et
      const user = await prisma.user.findUnique({
        where: { userId }
      })
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        })
      }
      
      // Mağazanın var olup olmadığını kontrol et
      const store = await prisma.store.findUnique({
        where: { store_id: storeId }
      })
      
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Mağaza bulunamadı'
        })
      }
      
      // Kullanıcıyı mağazaya ata
      const updatedUser = await userService.assignUserToStore(userId, storeId)
      
      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Kullanıcı mağazaya başarıyla atandı'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcı mağazaya atanırken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }
  
  /**
   * Kullanıcıyı mağazadan kaldır
   */
  async removeUserFromStore(req: Request, res: Response) {
    try {
      const { userId } = req.params
      
      // Kullanıcının var olup olmadığını kontrol et
      const user = await prisma.user.findUnique({
        where: { userId }
      })
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        })
      }
      
      // Kullanıcının mağaza ataması var mı kontrol et
      if (!user.store_id) {
        return res.status(400).json({
          success: false,
          message: 'Bu kullanıcının bir mağaza ataması bulunmuyor'
        })
      }
      
      // Kullanıcıyı mağazadan kaldır
      const updatedUser = await userService.removeUserFromStore(userId)
      
      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Kullanıcının mağaza ataması başarıyla kaldırıldı'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcı mağazadan kaldırılırken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }
} 