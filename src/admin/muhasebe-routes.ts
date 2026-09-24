import express from 'express'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'
import { muhasebeController } from './muhasebe-controller'

const router = express.Router()

// Tüm muhasebe rotaları için önce kimlik doğrulama ve yetkilendirme gerekiyor
router.use(authMiddleware)
router.use(authorizeRoles('admin', 'editor'))

// Ana muhasebe endpoint'leri
router.get('/muhasebe-hareketleri', muhasebeController.getAllMuhasebeHareketleri)
router.post('/muhasebe-hareketleri', muhasebeController.createMuhasebeHareketi)

// Yardımcı endpoint'ler
router.get('/muhasebe/income-types', muhasebeController.getIncomeTypes)
router.get('/muhasebe/expense-types', muhasebeController.getExpenseTypes)

// Mağaza bazlı muhasebe hareketleri
router.get('/muhasebe/store/:storeId', muhasebeController.getMuhasebeHareketleriByStore)

export default router 