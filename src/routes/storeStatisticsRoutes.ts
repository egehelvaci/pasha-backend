import express from 'express'
import { authMiddleware } from '../auth/auth-middleware'
import { storeStatisticsController } from '../controllers/storeStatisticsController'

const router = express.Router()

// Tüm rotalar için authentication gerekli
router.use(authMiddleware)

// Mağaza bakiye bilgileri
router.get('/balance', storeStatisticsController.getMyStoreBalance)

// Kullanıcı kendi istatistikleri
router.get('/user-stats', storeStatisticsController.getMyUserStatistics)

export default router 