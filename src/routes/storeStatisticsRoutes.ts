import express from 'express'
import { storeStatisticsController } from '../controllers/storeStatisticsController'
import { authMiddleware } from '../auth/auth-middleware'

const router = express.Router()

// Tüm rotalar için authentication gerekli
router.use(authMiddleware)

// Mağaza bakiye bilgileri
router.get('/balance', storeStatisticsController.getMyStoreBalance)

// Kullanıcı kendi istatistikleri
router.get('/user-stats', storeStatisticsController.getMyUserStatistics)

// Mağaza genel istatistikleri
router.get('/dashboard', storeStatisticsController.getMyStoreStats)

// Mağaza zaman bazlı sipariş grafiği
router.get('/orders-over-time', storeStatisticsController.getMyOrdersOverTime)

// Mağazanın en çok sipariş ettiği ürünler
router.get('/top-products', storeStatisticsController.getMyTopProducts)

// Mağaza toplam istatistikleri
router.get('/totals', storeStatisticsController.getMyTotalStats)

export default router 