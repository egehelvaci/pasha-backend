import { Request, Response } from 'express'
import { Prisma } from '../../generated/prisma'
import { ProductService } from '../product-service'
import prisma from '../utils/prisma'
import { normalizeSizeOption } from '../utils/product-size-option'

async function ruleWidthHasBalance(ruleId: number, width: number) {
  return !!(await prisma.productStockWidth.findFirst({
    where: {
      width,
      productStock: { product: { rule_id: ruleId } },
      OR: [{ availableAreaM2: { not: 0 } }, { reservedAreaM2: { not: 0 } }]
    },
    select: { id: true }
  }))
}

async function createRuleWidthPools(ruleId: number, width: number, tx: Prisma.TransactionClient | typeof prisma = prisma) {
  const stocks = await tx.productStock.findMany({
    where: { product: { rule_id: ruleId } },
    select: { id: true }
  })
  if (stocks.length) {
    await tx.productStockWidth.createMany({
      data: stocks.map(stock => ({ productStockId: stock.id, width })),
      skipDuplicates: true
    })
  }
}

async function deleteEmptyRuleWidthPools(ruleId: number, width: number, tx: Prisma.TransactionClient | typeof prisma = prisma) {
  await tx.productStockWidth.deleteMany({
    where: {
      productStock: { product: { rule_id: ruleId } },
      width,
      availableAreaM2: 0,
      reservedAreaM2: 0
    }
  })
}

export class ProductRulesController {
  private productService: ProductService

  constructor() {
    this.productService = new ProductService()
    this.getAllProductRules = this.getAllProductRules.bind(this)
    this.getProductRuleById = this.getProductRuleById.bind(this)
    this.createProductRule = this.createProductRule.bind(this)
    this.updateProductRule = this.updateProductRule.bind(this)
    this.deleteProductRule = this.deleteProductRule.bind(this)
    this.addSizeOption = this.addSizeOption.bind(this)
    this.updateSizeOption = this.updateSizeOption.bind(this)
    this.deleteSizeOption = this.deleteSizeOption.bind(this)
    this.assignCutTypes = this.assignCutTypes.bind(this)
    this.removeCutType = this.removeCutType.bind(this)
  }

  /**
   * Tüm ürün kurallarını listele
   */
  async getAllProductRules(req: Request, res: Response) {
    try {
      const { isActive, search } = req.query
      
      let whereCondition: Prisma.productrulesWhereInput = {}
      
      // isActive parametresi varsa filtreleme yap
      if (isActive !== undefined) {
        whereCondition.is_active = isActive === 'true'
      }
      
      // Arama parametresi varsa
      if (search && typeof search === 'string') {
        whereCondition.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }
      
      const rules = await prisma.productrules.findMany({
        where: whereCondition,
        include: {
          productsizeoptions: {
            orderBy: [
              { width: 'asc' },
              { height: 'asc' }
            ]
          },
          productrulecuttypes: {
            include: {
              cuttypes: true
            }
          },
          Product: {
            select: {
              productId: true,
              name: true
            }
          }
        },
        orderBy: { name: 'asc' }
      })
      
      // Response formatını düzenle
      const formattedRules = rules.map(rule => ({
        id: Number(rule.id),
        name: rule.name,
        description: rule.description,
        canHaveFringe: rule.can_have_fringe,
        isActive: rule.is_active,
        createdAt: rule.created_at,
        updatedAt: rule.updated_at,
        sizeOptions: rule.productsizeoptions.map(size => ({
          id: Number(size.id),
          width: Number(size.width),
          height: Number(size.height),
          isOptionalHeight: size.is_optional_height
        })),
        cutTypes: rule.productrulecuttypes.map(ct => ({
          id: Number(ct.cuttypes.id),
          name: ct.cuttypes.name
        })),
        productCount: rule.Product.length,
        products: rule.Product
      }))
      
      return res.status(200).json({
        success: true,
        count: formattedRules.length,
        data: formattedRules
      })
    } catch (error) {
      console.error('Ürün kuralları listeleme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ürün kuralları listelenirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Belirli bir ürün kuralını getir
   */
  async getProductRuleById(req: Request, res: Response) {
    try {
      const { ruleId } = req.params
      
      if (!ruleId || isNaN(parseInt(ruleId))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir kural ID gönderilmelidir'
        })
      }
      
      const rule = await prisma.productrules.findUnique({
        where: { id: parseInt(ruleId) },
        include: {
          productsizeoptions: {
            orderBy: [
              { width: 'asc' },
              { height: 'asc' }
            ]
          },
          productrulecuttypes: {
            include: {
              cuttypes: true
            }
          },
          Product: {
            select: {
              productId: true,
              name: true
            }
          }
        }
      })
      
      if (!rule) {
        return res.status(404).json({
          success: false,
          message: 'Ürün kuralı bulunamadı'
        })
      }
      
      const formattedRule = {
        id: Number(rule.id),
        name: rule.name,
        description: rule.description,
        canHaveFringe: rule.can_have_fringe,
        isActive: rule.is_active,
        createdAt: rule.created_at,
        updatedAt: rule.updated_at,
        sizeOptions: rule.productsizeoptions.map(size => ({
          id: Number(size.id),
          width: Number(size.width),
          height: Number(size.height),
          isOptionalHeight: size.is_optional_height
        })),
        cutTypes: rule.productrulecuttypes.map(ct => ({
          id: Number(ct.cuttypes.id),
          name: ct.cuttypes.name
        })),
        productCount: rule.Product.length,
        products: rule.Product
      }
      
      return res.status(200).json({
        success: true,
        data: formattedRule
      })
    } catch (error) {
      console.error('Ürün kuralı getirme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ürün kuralı getirilirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Yeni ürün kuralı oluştur
   */
  async createProductRule(req: Request, res: Response) {
    try {
      const { 
        name, 
        description, 
        canHaveFringe, 
        sizeOptions, 
        cutTypeIds 
      } = req.body
      
      // Zorunlu alanların kontrolü
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Kural adı zorunludur ve boş olamaz'
        })
      }
      
      let normalizedSizes: ReturnType<typeof normalizeSizeOption>[] = []
      try {
        if (sizeOptions !== undefined && !Array.isArray(sizeOptions)) throw new Error('sizeOptions bir liste olmalıdır')
        normalizedSizes = (sizeOptions || []).map((size: any) => normalizeSizeOption(size))
        const keys = normalizedSizes.map(size => JSON.stringify(size))
        if (new Set(keys).size !== keys.length) throw new Error('Aynı boyut seçeneği birden fazla eklenemez')
      } catch (error) {
        return res.status(400).json({ success: false, message: (error as Error).message })
      }

      // Aynı isimde kural var mı kontrol et
      const existingRule = await prisma.productrules.findUnique({
        where: { name: name.trim() }
      })
      
      if (existingRule) {
        return res.status(400).json({
          success: false,
          message: 'Bu isimde bir kural zaten mevcut'
        })
      }
      
      // Transaction ile oluştur
      const result = await prisma.$transaction(async (tx) => {
        // Ana kuralı oluştur
        const newRule = await tx.productrules.create({
          data: {
            name: name.trim(),
            description: description?.trim() || null,
            can_have_fringe: canHaveFringe === true,
            is_active: true
          }
        })
        
        // Boyut seçeneklerini ekle
        if (normalizedSizes.length > 0) {
          for (const size of normalizedSizes) {
            await tx.productsizeoptions.create({
              data: {
                rule_id: newRule.id,
                ...size
              }
            })
          }
        }
        
        // Kesim türlerini ata
        if (cutTypeIds && Array.isArray(cutTypeIds) && cutTypeIds.length > 0) {
          for (const cutTypeId of cutTypeIds) {
            if (cutTypeId && !isNaN(parseInt(cutTypeId))) {
              // Kesim türünün var olup olmadığını kontrol et
              const cutType = await tx.cuttypes.findUnique({
                where: { id: parseInt(cutTypeId) }
              })
              
              if (cutType) {
                await tx.productrulecuttypes.create({
                  data: {
                    rule_id: newRule.id,
                    cut_type_id: parseInt(cutTypeId)
                  }
                })
              }
            }
          }
        }
        
        return newRule
      })
      
      // Oluşturulan kuralı detaylarıyla birlikte getir
      const createdRule = await prisma.productrules.findUnique({
        where: { id: result.id },
        include: {
          productsizeoptions: {
            orderBy: [
              { width: 'asc' },
              { height: 'asc' }
            ]
          },
          productrulecuttypes: {
            include: {
              cuttypes: true
            }
          }
        }
      })
      
      return res.status(201).json({
        success: true,
        message: 'Ürün kuralı başarıyla oluşturuldu',
        data: createdRule
      })
    } catch (error) {
      console.error('Ürün kuralı oluşturma hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ürün kuralı oluşturulurken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Ürün kuralını güncelle
   */
  async updateProductRule(req: Request, res: Response) {
    try {
      const { ruleId } = req.params
      const { name, description, canHaveFringe, isActive } = req.body
      
      if (!ruleId || isNaN(parseInt(ruleId))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir kural ID gönderilmelidir'
        })
      }
      
      // Kuralın var olup olmadığını kontrol et
      const existingRule = await prisma.productrules.findUnique({
        where: { id: parseInt(ruleId) }
      })
      
      if (!existingRule) {
        return res.status(404).json({
          success: false,
          message: 'Güncellenecek kural bulunamadı'
        })
      }
      
      // Aynı isimde başka bir kural var mı kontrol et (kendisi hariç)
      if (name && name.trim() !== existingRule.name) {
        const duplicateRule = await prisma.productrules.findFirst({
          where: {
            name: name.trim(),
            id: { not: parseInt(ruleId) }
          }
        })
        
        if (duplicateRule) {
          return res.status(400).json({
            success: false,
            message: 'Bu isimde başka bir kural zaten mevcut'
          })
        }
      }
      
      // Güncellenecek verileri hazırla
      const updateData: any = {}
      if (name !== undefined) updateData.name = name.trim()
      if (description !== undefined) updateData.description = description?.trim() || null
      if (canHaveFringe !== undefined) updateData.can_have_fringe = canHaveFringe === true
      if (isActive !== undefined) updateData.is_active = isActive === true
      
      // Kuralı güncelle
      const updatedRule = await prisma.productrules.update({
        where: { id: parseInt(ruleId) },
        data: updateData,
        include: {
          productsizeoptions: {
            orderBy: [
              { width: 'asc' },
              { height: 'asc' }
            ]
          },
          productrulecuttypes: {
            include: {
              cuttypes: true
            }
          }
        }
      })
      
      return res.status(200).json({
        success: true,
        message: 'Ürün kuralı başarıyla güncellendi',
        data: updatedRule
      })
    } catch (error) {
      console.error('Ürün kuralı güncelleme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ürün kuralı güncellenirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Ürün kuralını sil
   */
  async deleteProductRule(req: Request, res: Response) {
    try {
      const { ruleId } = req.params
      
      if (!ruleId || isNaN(parseInt(ruleId))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir kural ID gönderilmelidir'
        })
      }
      
      // Kuralın var olup olmadığını kontrol et
      const existingRule = await prisma.productrules.findUnique({
        where: { id: parseInt(ruleId) },
        include: {
          Product: {
            select: { productId: true, name: true }
          }
        }
      })
      
      if (!existingRule) {
        return res.status(404).json({
          success: false,
          message: 'Silinecek kural bulunamadı'
        })
      }
      
      // Bu kurala bağlı ürün var mı kontrol et
      if (existingRule.Product && existingRule.Product.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Bu kural ${existingRule.Product.length} ürün tarafından kullanılıyor. Önce ürünlerden kural atamasını kaldırın.`,
          data: {
            productCount: existingRule.Product.length,
            products: existingRule.Product
          }
        })
      }
      
      // Transaction ile sil (ilişkili veriler cascade ile silinir)
      await prisma.$transaction(async (tx) => {
        // Productrulecuttypes ilişkileri cascade ile silinir
        // Productsizeoptions kayıtları cascade ile silinir
        
        // Ana kuralı sil
        await tx.productrules.delete({
          where: { id: parseInt(ruleId) }
        })
      })
      
      return res.status(200).json({
        success: true,
        message: 'Ürün kuralı başarıyla silindi'
      })
    } catch (error) {
      console.error('Ürün kuralı silme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ürün kuralı silinirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Boyut seçeneği ekle
   */
  async addSizeOption(req: Request, res: Response) {
    try {
      const { ruleId } = req.params
      const { width, height, isOptionalHeight } = req.body
      
      if (!ruleId || isNaN(parseInt(ruleId))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir kural ID gönderilmelidir'
        })
      }
      
      let normalizedSize: ReturnType<typeof normalizeSizeOption>
      try { normalizedSize = normalizeSizeOption({ width, height, isOptionalHeight }) }
      catch (error) { return res.status(400).json({ success: false, message: (error as Error).message }) }
      
      // Kuralın var olup olmadığını kontrol et
      const rule = await prisma.productrules.findUnique({
        where: { id: parseInt(ruleId) }
      })
      
      if (!rule) {
        return res.status(404).json({
          success: false,
          message: 'Kural bulunamadı'
        })
      }
      
      // Aynı boyutun zaten var olup olmadığını kontrol et
      const existingSize = await prisma.productsizeoptions.findFirst({
        where: {
          rule_id: parseInt(ruleId),
          width: normalizedSize.width,
          ...(normalizedSize.is_optional_height ? {} : { height: normalizedSize.height }),
          is_optional_height: normalizedSize.is_optional_height
        }
      })
      
      if (existingSize) {
        return res.status(400).json({
          success: false,
          message: 'Bu boyut seçeneği zaten mevcut'
        })
      }
      
      // Yeni boyut seçeneği ekle
      const newSizeOption = await prisma.$transaction(async tx => {
        const created = await tx.productsizeoptions.create({
          data: { rule_id: parseInt(ruleId), ...normalizedSize }
        })
        await createRuleWidthPools(parseInt(ruleId), normalizedSize.width, tx)
        return created
      })
      
      return res.status(201).json({
        success: true,
        message: 'Boyut seçeneği başarıyla eklendi',
        data: newSizeOption
      })
    } catch (error) {
      console.error('Boyut seçeneği ekleme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Boyut seçeneği eklenirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Boyut seçeneğini güncelle
   */
  async updateSizeOption(req: Request, res: Response) {
    try {
      const { ruleId, sizeId } = req.params
      const { width, height, isOptionalHeight } = req.body
      
      if (!ruleId || isNaN(parseInt(ruleId)) || !sizeId || isNaN(parseInt(sizeId))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli kural ID ve boyut ID gönderilmelidir'
        })
      }
      
      // Boyut seçeneğinin var olup olmadığını kontrol et
      const existingSize = await prisma.productsizeoptions.findFirst({
        where: {
          id: parseInt(sizeId),
          rule_id: parseInt(ruleId)
        }
      })
      
      if (!existingSize) {
        return res.status(404).json({
          success: false,
          message: 'Güncellenecek boyut seçeneği bulunamadı'
        })
      }
      
      // Güncellenecek verileri hazırla
      let updateData: ReturnType<typeof normalizeSizeOption>
      try { updateData = normalizeSizeOption({ width, height, isOptionalHeight }, existingSize) }
      catch (error) { return res.status(400).json({ success: false, message: (error as Error).message }) }

      if (updateData.width !== existingSize.width) {
        const otherSameWidth = await prisma.productsizeoptions.count({ where: { rule_id: parseInt(ruleId), width: existingSize.width, id: { not: existingSize.id } } })
        if (!otherSameWidth && await ruleWidthHasBalance(parseInt(ruleId), existingSize.width)) {
          return res.status(409).json({ success: false, message: `${existingSize.width} cm stok havuzunda bakiye veya rezervasyon bulunduğu için genişlik değiştirilemez` })
        }
      }
      
      // Eğer boyut değerleri güncelleniyorsa, aynı boyutun zaten var olup olmadığını kontrol et
      if (updateData.width || updateData.height) {
        const finalWidth = updateData.width || existingSize.width
        const finalHeight = updateData.height
        const finalOptional = updateData.is_optional_height !== undefined ? updateData.is_optional_height : existingSize.is_optional_height
        
        const duplicateSize = await prisma.productsizeoptions.findFirst({
          where: {
            rule_id: parseInt(ruleId),
            width: finalWidth,
            ...(finalOptional ? {} : { height: finalHeight }),
            is_optional_height: finalOptional,
            id: { not: parseInt(sizeId) }
          }
        })
        
        if (duplicateSize) {
          return res.status(400).json({
            success: false,
            message: 'Bu boyut seçeneği zaten mevcut'
          })
        }
      }
      
      // Boyut seçeneğini güncelle
      const updatedSizeOption = await prisma.$transaction(async tx => {
        const updated = await tx.productsizeoptions.update({ where: { id: parseInt(sizeId) }, data: updateData })
        await createRuleWidthPools(parseInt(ruleId), updated.width, tx)
        if (updated.width !== existingSize.width) {
          const oldWidthStillUsed = await tx.productsizeoptions.count({ where: { rule_id: parseInt(ruleId), width: existingSize.width } })
          if (!oldWidthStillUsed) await deleteEmptyRuleWidthPools(parseInt(ruleId), existingSize.width, tx)
        }
        return updated
      })
      
      return res.status(200).json({
        success: true,
        message: 'Boyut seçeneği başarıyla güncellendi',
        data: updatedSizeOption
      })
    } catch (error) {
      console.error('Boyut seçeneği güncelleme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Boyut seçeneği güncellenirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Boyut seçeneğini sil
   */
  async deleteSizeOption(req: Request, res: Response) {
    try {
      const { ruleId, sizeId } = req.params
      
      if (!ruleId || isNaN(parseInt(ruleId)) || !sizeId || isNaN(parseInt(sizeId))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli kural ID ve boyut ID gönderilmelidir'
        })
      }
      
      // Boyut seçeneğinin var olup olmadığını kontrol et
      const existingSize = await prisma.productsizeoptions.findFirst({
        where: {
          id: parseInt(sizeId),
          rule_id: parseInt(ruleId)
        }
      })
      
      if (!existingSize) {
        return res.status(404).json({
          success: false,
          message: 'Silinecek boyut seçeneği bulunamadı'
        })
      }

      const otherSameWidth = await prisma.productsizeoptions.count({ where: { rule_id: parseInt(ruleId), width: existingSize.width, id: { not: existingSize.id } } })
      if (!otherSameWidth && await ruleWidthHasBalance(parseInt(ruleId), existingSize.width)) {
        return res.status(409).json({ success: false, message: `${existingSize.width} cm stok havuzunda bakiye veya rezervasyon bulunduğu için son ölçü seçeneği silinemez` })
      }
      
      // Boyut seçeneğini sil
      await prisma.$transaction(async tx => {
        await tx.productsizeoptions.delete({ where: { id: parseInt(sizeId) } })
        if (!otherSameWidth) await deleteEmptyRuleWidthPools(parseInt(ruleId), existingSize.width, tx)
      })
      
      return res.status(200).json({
        success: true,
        message: 'Boyut seçeneği başarıyla silindi'
      })
    } catch (error) {
      console.error('Boyut seçeneği silme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Boyut seçeneği silinirken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Kesim türlerini ata
   */
  async assignCutTypes(req: Request, res: Response) {
    try {
      const { ruleId } = req.params
      const { cutTypeIds } = req.body
      
      if (!ruleId || isNaN(parseInt(ruleId))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir kural ID gönderilmelidir'
        })
      }
      
      if (!cutTypeIds || !Array.isArray(cutTypeIds) || cutTypeIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'En az bir kesim türü ID gönderilmelidir'
        })
      }
      
      // Kuralın var olup olmadığını kontrol et
      const rule = await prisma.productrules.findUnique({
        where: { id: parseInt(ruleId) }
      })
      
      if (!rule) {
        return res.status(404).json({
          success: false,
          message: 'Kural bulunamadı'
        })
      }
      
      // Transaction ile kesim türlerini ata
      const result = await prisma.$transaction(async (tx) => {
        const assignedCutTypes = []
        
        for (const cutTypeId of cutTypeIds) {
          if (cutTypeId && !isNaN(parseInt(cutTypeId))) {
            // Kesim türünün var olup olmadığını kontrol et
            const cutType = await tx.cuttypes.findUnique({
              where: { id: parseInt(cutTypeId) }
            })
            
            if (cutType) {
              // Zaten atanmış mı kontrol et
              const existing = await tx.productrulecuttypes.findFirst({
                where: {
                  rule_id: parseInt(ruleId),
                  cut_type_id: parseInt(cutTypeId)
                }
              })
              
              if (!existing) {
                await tx.productrulecuttypes.create({
                  data: {
                    rule_id: parseInt(ruleId),
                    cut_type_id: parseInt(cutTypeId)
                  }
                })
                assignedCutTypes.push(cutType)
              }
            }
          }
        }
        
        return assignedCutTypes
      })
      
      return res.status(200).json({
        success: true,
        message: `${result.length} kesim türü başarıyla atandı`,
        data: result
      })
    } catch (error) {
      console.error('Kesim türü atama hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Kesim türleri atanırken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }

  /**
   * Kesim türü atamasını kaldır
   */
  async removeCutType(req: Request, res: Response) {
    try {
      const { ruleId, cutTypeId } = req.params
      
      if (!ruleId || isNaN(parseInt(ruleId)) || !cutTypeId || isNaN(parseInt(cutTypeId))) {
        return res.status(400).json({
          success: false,
          message: 'Geçerli kural ID ve kesim türü ID gönderilmelidir'
        })
      }
      
      // İlişkinin var olup olmadığını kontrol et
      const existingRelation = await prisma.productrulecuttypes.findFirst({
        where: {
          rule_id: parseInt(ruleId),
          cut_type_id: parseInt(cutTypeId)
        }
      })
      
      if (!existingRelation) {
        return res.status(404).json({
          success: false,
          message: 'Kaldırılacak kesim türü ataması bulunamadı'
        })
      }
      
      // İlişkiyi sil
      await prisma.productrulecuttypes.delete({
        where: {
          rule_id_cut_type_id: {
            rule_id: parseInt(ruleId),
            cut_type_id: parseInt(cutTypeId)
          }
        }
      })
      
      return res.status(200).json({
        success: true,
        message: 'Kesim türü ataması başarıyla kaldırıldı'
      })
    } catch (error) {
      console.error('Kesim türü atama kaldırma hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Kesim türü ataması kaldırılırken bir hata oluştu'
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      })
    }
  }
}
