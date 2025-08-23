import { Request, Response } from 'express'
import prisma from '../utils/prisma'

export class StoreAddressController {
  constructor() {
    this.getStoreAddresses = this.getStoreAddresses.bind(this)
    this.createStoreAddress = this.createStoreAddress.bind(this)
    this.updateStoreAddress = this.updateStoreAddress.bind(this)
    this.deleteStoreAddress = this.deleteStoreAddress.bind(this)
    this.setDefaultAddress = this.setDefaultAddress.bind(this)
  }

  /**
   * Mağazanın adreslerini listele
   */
  async getStoreAddresses(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId
      const userType = (req as any).user?.userType

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      let storeId: string

      if (userType === 'admin') {
        // Admin için önce kendi store_id'sini kontrol et
        const adminUser = await prisma.user.findUnique({
          where: { userId },
          select: { store_id: true }
        })

        // Params veya query'den store_id belirtilmişse onu kullan
        storeId = req.params.storeId || req.query.storeId as string
        
        // Eğer store_id belirtilmemişse admin'in kendi store_id'sini kullan
        if (!storeId && adminUser?.store_id) {
          storeId = adminUser.store_id
        }
        
        // Hala store_id yoksa hata ver
        if (!storeId) {
          return res.status(400).json({
            success: false,
            message: 'Admin kullanıcısı için store_id gerekli veya admin kullanıcısının bir mağazaya bağlı olması gerekli'
          })
        }
      } else {
        // Normal kullanıcı için kendi mağaza ID'sini al
        const user = await prisma.user.findUnique({
          where: { userId },
          select: { store_id: true }
        })

        if (!user?.store_id) {
          return res.status(404).json({
            success: false,
            message: 'Kullanıcının mağaza bilgisi bulunamadı'
          })
        }

        storeId = user.store_id
      }

      const addresses = await prisma.storeAddress.findMany({
        where: {
          store_id: storeId,
          is_active: true
        },
        orderBy: [
          { is_default: 'desc' },
          { created_at: 'asc' }
        ]
      })

      return res.status(200).json({
        success: true,
        data: addresses
      })

    } catch (error: any) {
      console.error('Mağaza adresleri listeleme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Adresler getirilemedi'
      })
    }
  }

  /**
   * Yeni mağaza adresi oluştur
   */
  async createStoreAddress(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId
      const userType = (req as any).user?.userType
      const { title, address, city, district, postal_code, is_default } = req.body

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      if (!title || !address) {
        return res.status(400).json({
          success: false,
          message: 'Başlık ve adres alanları zorunludur'
        })
      }

      let storeId: string

      if (userType === 'admin') {
        // Admin için önce kendi store_id'sini kontrol et
        const adminUser = await prisma.user.findUnique({
          where: { userId },
          select: { store_id: true }
        })

        // Body'den veya params'dan store_id belirtilmişse onu kullan
        storeId = req.body.store_id || req.params.storeId
        
        // Eğer store_id belirtilmemişse admin'in kendi store_id'sini kullan
        if (!storeId && adminUser?.store_id) {
          storeId = adminUser.store_id
        }
        
        // Hala store_id yoksa hata ver
        if (!storeId) {
          return res.status(400).json({
            success: false,
            message: 'Admin kullanıcısı için store_id gerekli veya admin kullanıcısının bir mağazaya bağlı olması gerekli'
          })
        }
      } else {
        const user = await prisma.user.findUnique({
          where: { userId },
          select: { store_id: true }
        })

        if (!user?.store_id) {
          return res.status(404).json({
            success: false,
            message: 'Kullanıcının mağaza bilgisi bulunamadı'
          })
        }

        storeId = user.store_id
      }

      // Eğer varsayılan adres olarak işaretlendiyse, diğerlerini varsayılan olmaktan çıkar
      if (is_default) {
        await prisma.storeAddress.updateMany({
          where: {
            store_id: storeId,
            is_default: true
          },
          data: {
            is_default: false
          }
        })
      }

      // Yeni adres oluştur
      const newAddress = await prisma.storeAddress.create({
        data: {
          store_id: storeId,
          title: title.trim(),
          address: address.trim(),
          city: city?.trim() || null,
          district: district?.trim() || null,
          postal_code: postal_code?.trim() || null,
          is_default: is_default || false,
          is_active: true
        }
      })

      return res.status(201).json({
        success: true,
        message: 'Yeni adres başarıyla oluşturuldu',
        data: newAddress
      })

    } catch (error: any) {
      console.error('Mağaza adresi oluşturma hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Adres oluşturulamadı'
      })
    }
  }

  /**
   * Mağaza adresini güncelle
   */
  async updateStoreAddress(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId
      const userType = (req as any).user?.userType
      const addressId = req.params.addressId
      const { title, address, city, district, postal_code, is_default, is_active } = req.body

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      if (!addressId) {
        return res.status(400).json({
          success: false,
          message: 'Adres ID gerekli'
        })
      }

      // Adresi bul
      const existingAddress = await prisma.storeAddress.findUnique({
        where: { id: addressId },
        include: {
          store: true
        }
      })

      if (!existingAddress) {
        return res.status(404).json({
          success: false,
          message: 'Adres bulunamadı'
        })
      }

      // Yetki kontrolü
      if (userType !== 'admin') {
        const user = await prisma.user.findUnique({
          where: { userId },
          select: { store_id: true }
        })

        if (!user?.store_id || user.store_id !== existingAddress.store_id) {
          return res.status(403).json({
            success: false,
            message: 'Bu adresi güncelleme yetkiniz yok'
          })
        }
      }

      // Eğer varsayılan adres olarak işaretlendiyse, diğerlerini varsayılan olmaktan çıkar
      if (is_default && !existingAddress.is_default) {
        await prisma.storeAddress.updateMany({
          where: {
            store_id: existingAddress.store_id,
            is_default: true
          },
          data: {
            is_default: false
          }
        })
      }

      // Adresi güncelle
      const updatedAddress = await prisma.storeAddress.update({
        where: { id: addressId },
        data: {
          title: title?.trim() || existingAddress.title,
          address: address?.trim() || existingAddress.address,
          city: city?.trim() || existingAddress.city,
          district: district?.trim() || existingAddress.district,
          postal_code: postal_code?.trim() || existingAddress.postal_code,
          is_default: is_default !== undefined ? is_default : existingAddress.is_default,
          is_active: is_active !== undefined ? is_active : existingAddress.is_active
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Adres başarıyla güncellendi',
        data: updatedAddress
      })

    } catch (error: any) {
      console.error('Mağaza adresi güncelleme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Adres güncellenemedi'
      })
    }
  }

  /**
   * Varsayılan adresi değiştir
   */
  async setDefaultAddress(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId
      const userType = (req as any).user?.userType
      const addressId = req.params.addressId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      if (!addressId) {
        return res.status(400).json({
          success: false,
          message: 'Adres ID gerekli'
        })
      }

      // Adresi bul
      const existingAddress = await prisma.storeAddress.findUnique({
        where: { id: addressId }
      })

      if (!existingAddress) {
        return res.status(404).json({
          success: false,
          message: 'Adres bulunamadı'
        })
      }

      // Yetki kontrolü
      if (userType !== 'admin') {
        const user = await prisma.user.findUnique({
          where: { userId },
          select: { store_id: true }
        })

        if (!user?.store_id || user.store_id !== existingAddress.store_id) {
          return res.status(403).json({
            success: false,
            message: 'Bu adresi varsayılan yapma yetkiniz yok'
          })
        }
      }

      // Mevcut varsayılan adresi kaldır ve yeni varsayılan adresi belirle
      await prisma.$transaction([
        prisma.storeAddress.updateMany({
          where: {
            store_id: existingAddress.store_id,
            is_default: true
          },
          data: {
            is_default: false
          }
        }),
        prisma.storeAddress.update({
          where: { id: addressId },
          data: {
            is_default: true,
            is_active: true // Varsayılan adres aktif olmalı
          }
        })
      ])

      const updatedAddress = await prisma.storeAddress.findUnique({
        where: { id: addressId }
      })

      return res.status(200).json({
        success: true,
        message: 'Varsayılan adres başarıyla değiştirildi',
        data: updatedAddress
      })

    } catch (error: any) {
      console.error('Varsayılan adres değiştirme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Varsayılan adres değiştirilemedi'
      })
    }
  }

  /**
   * Mağaza adresini sil (soft delete)
   */
  async deleteStoreAddress(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId
      const userType = (req as any).user?.userType
      const addressId = req.params.addressId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı kimlik doğrulaması gerekli'
        })
      }

      if (!addressId) {
        return res.status(400).json({
          success: false,
          message: 'Adres ID gerekli'
        })
      }

      // Adresi bul
      const existingAddress = await prisma.storeAddress.findUnique({
        where: { id: addressId }
      })

      if (!existingAddress) {
        return res.status(404).json({
          success: false,
          message: 'Adres bulunamadı'
        })
      }

      // Yetki kontrolü
      if (userType !== 'admin') {
        const user = await prisma.user.findUnique({
          where: { userId },
          select: { store_id: true }
        })

        if (!user?.store_id || user.store_id !== existingAddress.store_id) {
          return res.status(403).json({
            success: false,
            message: 'Bu adresi silme yetkiniz yok'
          })
        }
      }

      // Varsayılan adres silinmeye çalışılıyorsa kontrol et
      if (existingAddress.is_default) {
        const otherAddresses = await prisma.storeAddress.count({
          where: {
            store_id: existingAddress.store_id,
            is_active: true,
            id: {
              not: addressId
            }
          }
        })

        if (otherAddresses === 0) {
          return res.status(400).json({
            success: false,
            message: 'Son adres silinemez. Önce başka bir adres ekleyin.'
          })
        }

        // Başka bir adresi varsayılan yap - en eski adresi bul ve varsayılan yap
        const firstAddress = await prisma.storeAddress.findFirst({
          where: {
            store_id: existingAddress.store_id,
            is_active: true,
            id: {
              not: addressId
            }
          },
          orderBy: {
            created_at: 'asc'
          }
        })
        
        if (firstAddress) {
          await prisma.storeAddress.update({
            where: { id: firstAddress.id },
            data: {
              is_default: true
            }
          })
        }
      }

      // Soft delete
      await prisma.storeAddress.update({
        where: { id: addressId },
        data: {
          is_active: false,
          is_default: false
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Adres başarıyla silindi'
      })

    } catch (error: any) {
      console.error('Mağaza adresi silme hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Adres silinemedi'
      })
    }
  }
}

export const storeAddressController = new StoreAddressController()