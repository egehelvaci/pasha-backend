import { Router } from 'express'
import { ManuelSatisController } from './manuel-satis-controller'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'

const router = Router()
const manuelSatisController = new ManuelSatisController()

/**
 * Manuel Satış API Routes
 * Base path: /api/admin/manuel-satis
 */

// Ürün arama - yazarken filtreleme - Admin ve Editör erişimi
router.get('/search-products', authMiddleware, authorizeRoles('admin', 'editor'), manuelSatisController.searchProducts)

// Manuel satış oluştur - Admin ve Editör erişimi
router.post('/create', authMiddleware, authorizeRoles('admin', 'editor'), manuelSatisController.createManuelSatis)

// Ürün fiyatı hesapla - Admin ve Editör erişimi
router.post('/calculate-price', authMiddleware, authorizeRoles('admin', 'editor'), manuelSatisController.calculateProductPrice)

// Manuel satış listesi - Admin ve Editör erişimi
router.get('/list', authMiddleware, authorizeRoles('admin', 'editor'), manuelSatisController.getManuelSatisList)

// Manuel satış fişi al - Admin ve Editör erişimi
router.get('/receipt/:fisNumarasi', authMiddleware, authorizeRoles('admin', 'editor'), manuelSatisController.getManuelSatisReceipt)

// Manuel satış detayı getir - Admin ve Editör erişimi
router.get('/:fisNumarasi', authMiddleware, authorizeRoles('admin', 'editor'), manuelSatisController.getManuelSatisById)

// Manuel satış iptal et - Admin ve Editör erişimi
router.delete('/:fisNumarasi', authMiddleware, authorizeRoles('admin', 'editor'), manuelSatisController.cancelManuelSatis)

export default router
