import express from 'express'
import { storeStatisticsController } from '../controllers/storeStatisticsController'
import { verifyToken } from '../middleware/authMiddleware'

const router = express.Router()

// Tüm rotalar için authentication gerekli
router.use(verifyToken)

// Mağaza bakiye bilgileri
router.get('/balance', storeStatisticsController.getMyStoreBalance)

// Mağaza genel istatistikleri
router.get('/dashboard', storeStatisticsController.getMyStoreStats)

// Mağaza zaman bazlı sipariş grafiği
router.get('/orders-over-time', storeStatisticsController.getMyOrdersOverTime)

// Mağazanın en çok sipariş ettiği ürünler
router.get('/top-products', storeStatisticsController.getMyTopProducts)

// Mağaza toplam istatistikleri
router.get('/totals', storeStatisticsController.getMyTotalStats)

export default router 