import express from 'express'
import { ProductRulesController } from './product-rules-controller'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'

const router = express.Router()
const productRulesController = new ProductRulesController()

// Tüm product rules rotaları için önce kimlik doğrulama ve yetkilendirme gerekiyor
router.use(authMiddleware)
router.use(authorizeRoles('admin'))

// =========== PRODUCT RULES CRUD ===========

// Tüm ürün kurallarını listele
router.get('/', productRulesController.getAllProductRules)

// Belirli bir ürün kuralını getir
router.get('/:ruleId', productRulesController.getProductRuleById)

// Yeni ürün kuralı oluştur
router.post('/', productRulesController.createProductRule)

// Ürün kuralını güncelle
router.put('/:ruleId', productRulesController.updateProductRule)

// Ürün kuralını sil
router.delete('/:ruleId', productRulesController.deleteProductRule)

// =========== SIZE OPTIONS MANAGEMENT ===========

// Boyut seçeneği ekle
router.post('/:ruleId/size-options', productRulesController.addSizeOption)

// Boyut seçeneğini güncelle
router.put('/:ruleId/size-options/:sizeId', productRulesController.updateSizeOption)

// Boyut seçeneğini sil
router.delete('/:ruleId/size-options/:sizeId', productRulesController.deleteSizeOption)

// =========== CUT TYPES MANAGEMENT ===========

// Kesim türlerini ata
router.post('/:ruleId/cut-types', productRulesController.assignCutTypes)

// Kural bazlı varyasyon güncelleme
router.post('/:ruleId/regenerate-variations', productRulesController.regenerateVariationsForRule)

// Kesim türü atamasını kaldır
router.delete('/:ruleId/cut-types/:cutTypeId', productRulesController.removeCutType)

export default router 