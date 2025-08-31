import express from 'express'
import { muhasebeController } from './muhasebe-controller'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'

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
router.get('/muhasebe/admin-toplam', muhasebeController.getAdminToplam)

// Manuel satış endpoint'leri
router.get('/muhasebe/manuel-satislar', muhasebeController.getManuelSatislar)

// Mağaza bazlı muhasebe hareketleri
router.get('/muhasebe/store/:storeId', muhasebeController.getMuhasebeHareketleriByStore)

export default router 