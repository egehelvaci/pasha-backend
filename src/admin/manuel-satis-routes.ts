import { Router } from 'express'
import { ManuelSatisController } from './manuel-satis-controller'
import { authMiddleware } from '../auth/auth-middleware'

const router = Router()
const manuelSatisController = new ManuelSatisController()

/**
 * Manuel Satış API Routes
 * Base path: /api/admin/manuel-satis
 */

// Ürün arama - yazarken filtreleme
router.get('/search-products', authMiddleware, manuelSatisController.searchProducts)

// Manuel satış oluştur
router.post('/create', authMiddleware, manuelSatisController.createManuelSatis)

// Ürün fiyatı hesapla
router.post('/calculate-price', authMiddleware, manuelSatisController.calculateProductPrice)

// Manuel satış listesi
router.get('/list', authMiddleware, manuelSatisController.getManuelSatisList)

// Manuel satış fişi al
router.get('/receipt/:fisNumarasi', authMiddleware, manuelSatisController.getManuelSatisReceipt)

// Manuel satış detayı getir
router.get('/:fisNumarasi', authMiddleware, manuelSatisController.getManuelSatisById)

// Manuel satış iptal et (gelecekte implementasyon)
router.delete('/:fisNumarasi', authMiddleware, manuelSatisController.cancelManuelSatis)

export default router
