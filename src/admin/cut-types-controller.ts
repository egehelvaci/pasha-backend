import { Request, Response } from 'express'
import prisma from '../utils/prisma'
import { Prisma } from '../../generated/prisma'

export class CutTypesController {
  constructor() {
    this.getAllCutTypes = this.getAllCutTypes.bind(this)
    this.getCutTypeById = this.getCutTypeById.bind(this)
    this.updateCutType = this.updateCutType.bind(this)
    this.deleteCutType = this.deleteCutType.bind(this)
  }

  /**
   * Tüm kesim türlerini listele
   */
  async getAllCutTypes(req: Request, res: Response) {
    try {
      const { search } = req.query
      
      let whereCondition: Prisma.cuttypesWhereInput = {}
      
      // Arama parametresi varsa
      if (search && typeof search === 'string') {
        whereCondition.name = {
          contains: search,
          mode: 'insensitive'
        }
      }
      
      const cutTypes = await prisma.cuttypes.findMany({
        where: whereCondition,
        include: {
          productrulecuttypes: {
            include: {
              productrules: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          productvariations: {
            select: {
              id: true,
              Product: {
                select: {
                  productId: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      })
      
      // Response formatını düzenle
      const formattedCutTypes = cutTypes.map(cutType => ({
        id: cutType.id,
        name: cutType.name,
        createdAt: cutType.created_at,
        updatedAt: cutType.updated_at,
        ruleCount: cutType.productrulecuttypes.length,
        rules: cutType.productrulecuttypes.map(prc => ({
          id: prc.productrules.id,
          name: prc.productrules.name
        })),
        variationCount: cutType.productvariations.length,
        usedInProducts: cutType.productvariations.map(pv => ({
          id: pv.Product?.productId,
          name: pv.Product?.name
        })).filter(p => p.id) // Null değerleri filtrele
      }))
      
      return res.status(200).json({
        success: true,
        count: formattedCutTypes.length,
        data: formattedCutTypes
      })
    } catch (error) {
      console.error('Kesim türleri listeleme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Kesim türleri listelenirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Belirli bir kesim türünü getir
   */
  async getCutTypeById(req: Request, res: Response) {
    try {
      const { cutTypeId } = req.params
      
      if (!cutTypeId || isNaN(parseInt(cutTypeId))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir kesim türü ID gönderilmelidir'
        })
      }
      
      const cutType = await prisma.cuttypes.findUnique({
        where: { id: parseInt(cutTypeId) },
        include: {
          productrulecuttypes: {
            include: {
              productrules: {
                select: {
                  id: true,
                  name: true,
                  description: true
                }
              }
            }
          },
          productvariations: {
            select: {
              id: true,
              width: true,
              height: true,
              has_fringe: true,
              stock_quantity: true,
              Product: {
                select: {
                  productId: true,
                  name: true
                }
              }
            }
          }
        }
      })
      
      if (!cutType) {
        return res.status(404).json({
          success: false,
          message: 'Kesim türü bulunamadı'
        })
      }
      
      const formattedCutType = {
        id: cutType.id,
        name: cutType.name,
        createdAt: cutType.created_at,
        updatedAt: cutType.updated_at,
        ruleCount: cutType.productrulecuttypes.length,
        rules: cutType.productrulecuttypes.map(prc => ({
          id: prc.productrules.id,
          name: prc.productrules.name,
          description: prc.productrules.description
        })),
        variationCount: cutType.productvariations.length,
        variations: cutType.productvariations.map(pv => ({
          id: pv.id,
          width: pv.width,
          height: pv.height,
          hasFringe: pv.has_fringe,
          stockQuantity: pv.stock_quantity,
          product: pv.Product ? {
            id: pv.Product.productId,
            name: pv.Product.name
          } : null
        }))
      }
      
      return res.status(200).json({
        success: true,
        data: formattedCutType
      })
    } catch (error) {
      console.error('Kesim türü getirme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Kesim türü getirilirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Kesim türünü güncelle
   */
  async updateCutType(req: Request, res: Response) {
    try {
      const { cutTypeId } = req.params
      const { name } = req.body
      
      if (!cutTypeId || isNaN(parseInt(cutTypeId))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir kesim türü ID gönderilmelidir'
        })
      }
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Kesim türü adı zorunludur ve boş olamaz'
        })
      }
      
      // Kesim türünün var olup olmadığını kontrol et
      const existingCutType = await prisma.cuttypes.findUnique({
        where: { id: parseInt(cutTypeId) }
      })
      
      if (!existingCutType) {
        return res.status(404).json({
          success: false,
          message: 'Güncellenecek kesim türü bulunamadı'
        })
      }
      
      // Aynı isimde başka bir kesim türü var mı kontrol et (kendisi hariç)
      if (name.trim() !== existingCutType.name) {
        const duplicateCutType = await prisma.cuttypes.findFirst({
          where: {
            name: name.trim(),
            id: { not: parseInt(cutTypeId) }
          }
        })
        
        if (duplicateCutType) {
          return res.status(400).json({
            success: false,
            message: 'Bu isimde başka bir kesim türü zaten mevcut'
          })
        }
      }
      
      // Kesim türünü güncelle
      const updatedCutType = await prisma.cuttypes.update({
        where: { id: parseInt(cutTypeId) },
        data: {
          name: name.trim()
        }
      })
      
      return res.status(200).json({
        success: true,
        message: 'Kesim türü başarıyla güncellendi',
        data: updatedCutType
      })
    } catch (error) {
      console.error('Kesim türü güncelleme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Kesim türü güncellenirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Kesim türünü sil
   */
  async deleteCutType(req: Request, res: Response) {
    try {
      const { cutTypeId } = req.params
      
      if (!cutTypeId || isNaN(parseInt(cutTypeId))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir kesim türü ID gönderilmelidir'
        })
      }
      
      // Kesim türünün var olup olmadığını kontrol et
      const existingCutType = await prisma.cuttypes.findUnique({
        where: { id: parseInt(cutTypeId) },
        include: {
          productrulecuttypes: {
            include: {
              productrules: {
                select: { id: true, name: true }
              }
            }
          },
          productvariations: {
            select: {
              id: true,
              Product: {
                select: { productId: true, name: true }
              }
            }
          }
        }
      })
      
      if (!existingCutType) {
        return res.status(404).json({
          success: false,
          message: 'Silinecek kesim türü bulunamadı'
        })
      }
      
      // Bu kesim türünü kullanan kural var mı kontrol et
      if (existingCutType.productrulecuttypes && existingCutType.productrulecuttypes.length > 0) {
        const usingRules = existingCutType.productrulecuttypes.map(prc => prc.productrules.name)
        return res.status(400).json({
          success: false,
          message: `Bu kesim türü ${existingCutType.productrulecuttypes.length} kural tarafından kullanılıyor. Önce kurallardan kaldırın.`,
          data: {
            ruleCount: existingCutType.productrulecuttypes.length,
            rules: usingRules
          }
        })
      }
      
      // Bu kesim türünü kullanan varyasyon var mı kontrol et
      if (existingCutType.productvariations && existingCutType.productvariations.length > 0) {
        const usingProducts = existingCutType.productvariations
          .map(pv => pv.Product?.name)
          .filter(name => name)
        
        return res.status(400).json({
          success: false,
          message: `Bu kesim türü ${existingCutType.productvariations.length} ürün varyasyonu tarafından kullanılıyor. Önce varyasyonları güncelleyin.`,
          data: {
            variationCount: existingCutType.productvariations.length,
            products: usingProducts
          }
        })
      }
      
      // Kesim türünü sil
      await prisma.cuttypes.delete({
        where: { id: parseInt(cutTypeId) }
      })
      
      return res.status(200).json({
        success: true,
        message: 'Kesim türü başarıyla silindi'
      })
    } catch (error) {
      console.error('Kesim türü silme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Kesim türü silinirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }
} 