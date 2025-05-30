import { Request, Response } from 'express'
import { userService } from '../user-service'
import prisma from '../utils/prisma'

export class AdminController {
  constructor() {
    this.getAllUsers = this.getAllUsers.bind(this)
    this.getActiveUsers = this.getActiveUsers.bind(this)
    this.createUser = this.createUser.bind(this)
    this.updateUser = this.updateUser.bind(this)
    this.deleteUser = this.deleteUser.bind(this)
    this.getUserById = this.getUserById.bind(this)
    this.assignUserToStore = this.assignUserToStore.bind(this)
    this.removeUserFromStore = this.removeUserFromStore.bind(this)
    this.activateUser = this.activateUser.bind(this)
  }

  /**
   * Tüm kullanıcıları listele
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers()
      
      return res.status(200).json({
        success: true,
        data: users
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Kullanıcılar getirilemedi'
      })
    }
  }

  /**
   * Sadece aktif kullanıcıları listele
   */
  async getActiveUsers(req: Request, res: Response) {
    try {
      const users = await userService.getActiveUsers()
      
      return res.status(200).json({
        success: true,
        data: users
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Aktif kullanıcılar getirilemedi'
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
        email, 
        password, 
        name, 
        surname, 
        phoneNumber, 
        userTypeId, 
        userTypeName, 
        storeId, 
        store_id,
        credit,
        debit 
      } = req.body
      
      // Zorunlu alanları kontrol et
      if (!username || !email || !password || !name || !surname) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, password, name ve surname zorunlu alanlarıdır'
        })
      }

      // UserType ID'sini belirle (userTypeName varsa name'e göre ID bul)
      let finalUserTypeId = userTypeId;
      if (userTypeName && !userTypeId) {
        const userType = await prisma.userType.findFirst({
          where: { name: userTypeName }
        });
        
        if (!userType) {
          return res.status(400).json({
            success: false,
            message: `Geçersiz kullanıcı tipi: ${userTypeName}`
          });
        }
        
        finalUserTypeId = userType.id;
      }

      if (!finalUserTypeId) {
        return res.status(400).json({
          success: false,
          message: 'userTypeId veya userTypeName belirtilmelidir'
        });
      }
      
      // Kullanıcı adı ve email benzersizlik kontrolü - sadece aktif kullanıcılar için
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            {
              OR: [
                { username },
                { email }
              ]
            },
            { isActive: true } // Sadece aktif kullanıcıları kontrol et
          ]
        }
      })
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Bu kullanıcı adı veya email zaten kullanılıyor'
        })
      }
      
      // Şifreyi hashle
      const hashedPassword = await userService.hashPassword(password)
      
      // Store ID'sini belirle (hem storeId hem store_id desteği)
      const finalStoreId = storeId || store_id || null;
      
      // Yeni kullanıcı oluştur
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          name,
          surname,
          phoneNumber: phoneNumber || null,
          userTypeId: parseInt(finalUserTypeId),
          store_id: finalStoreId,
          credit: credit ? parseFloat(credit) : 0,
          debit: debit ? parseFloat(debit) : 0
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
    } catch (error: any) {
      console.error('Kullanıcı oluşturma hatası:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Kullanıcı oluşturulamadı'
      })
    }
  }
  
  /**
   * Kullanıcı bilgilerini güncelle
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { username, email, password, name, surname, phoneNumber, userTypeId, store_id } = req.body
      
      // Güncellenecek verileri hazırla
      const updateData: any = {}
      if (username !== undefined) updateData.username = username
      if (email !== undefined) updateData.email = email
      if (name !== undefined) updateData.name = name
      if (surname !== undefined) updateData.surname = surname
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
      if (userTypeId !== undefined) updateData.userTypeId = parseInt(userTypeId)
      if (store_id !== undefined) updateData.store_id = store_id
      
      // Şifre değiştirilecekse hashle
      if (password !== undefined) {
        updateData.password = await userService.hashPassword(password)
      }
      
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Kullanıcı güncellenemedi'
      })
    }
  }
  
  /**
   * Kullanıcıyı sil veya deaktif et
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { permanent } = req.query
      
      // Kalıcı silme işlemi
      if (permanent === 'true') {
        // Önce kullanıcının mevcut bilgilerini al
        const existingUser = await prisma.user.findUnique({
          where: { userId }
        })
        
        if (!existingUser) {
          return res.status(404).json({
            success: false,
            message: 'Kullanıcı bulunamadı'
          })
        }
        
        // Username ve email'i değiştir (gelecekte aynı bilgilerle yeni kullanıcı oluşturulabilsin)
        const timestamp = Date.now()
        await prisma.user.update({
          where: { userId },
          data: {
            username: `${existingUser.username}_deleted_${timestamp}`,
            email: `${existingUser.email}_deleted_${timestamp}`,
            isActive: false
          }
        })
        
        // Şimdi kullanıcıyı sil
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
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Kullanıcı silinemedi'
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
          message: 'Mağaza ID gereklidir'
        })
      }
      
      // Kullanıcıyı mağazaya ata
      const updatedUser = await userService.assignUserToStore(userId, storeId)
      
      return res.status(200).json({
        success: true,
        data: updatedUser
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Kullanıcı mağazaya atanamadı'
      })
    }
  }
  
  /**
   * Kullanıcıyı mağazadan kaldır
   */
  async removeUserFromStore(req: Request, res: Response) {
    try {
      const { userId } = req.params
      
      // Kullanıcıyı mağazadan kaldır
      const updatedUser = await userService.removeUserFromStore(userId)
      
      return res.status(200).json({
        success: true,
        data: updatedUser
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Kullanıcı mağazadan kaldırılamadı'
      })
    }
  }

  /**
   * Kullanıcıyı aktif et
   */
  async activateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params
      
      await userService.activate(userId)
      
      return res.status(200).json({
        success: true,
        message: 'Kullanıcı aktif edildi'
      })
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Kullanıcı aktif edilemedi'
      })
    }
  }
} 