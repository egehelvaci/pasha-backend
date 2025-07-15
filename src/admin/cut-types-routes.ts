import express from 'express'
import { CutTypesController } from './cut-types-controller'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'

const router = express.Router()
const cutTypesController = new CutTypesController()

// Tüm cut types rotaları için önce kimlik doğrulama ve yetkilendirme gerekiyor
router.use(authMiddleware)
router.use(authorizeRoles('admin'))

// =========== CUT TYPES CRUD ===========

// Tüm kesim türlerini listele
router.get('/', cutTypesController.getAllCutTypes)

// Belirli bir kesim türünü getir
router.get('/:cutTypeId', cutTypesController.getCutTypeById)

// Yeni kesim türü oluştur
router.post('/', cutTypesController.createCutType)

// Kesim türünü güncelle
router.put('/:cutTypeId', cutTypesController.updateCutType)

// Kesim türünü sil
router.delete('/:cutTypeId', cutTypesController.deleteCutType)

export default router 