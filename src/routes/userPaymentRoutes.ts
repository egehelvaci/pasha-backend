import express from 'express'
import { userPaymentController } from '../controllers/userPaymentController'
import { authMiddleware } from '../auth/auth-middleware'

const router = express.Router()

// Tüm user payment rotaları için kimlik doğrulama gerekiyor
router.use(authMiddleware)

// Ödeme başlatma
router.post('/payments/initiate', userPaymentController.initiatePayment)

// Ödeme geçmişi
router.get('/payments/history', userPaymentController.getMyPaymentHistory)

// Belirli ödeme detayı
router.get('/payments/:paymentId', userPaymentController.getMyPaymentById)

// Taksit seçeneklerini getirme
router.get('/installments/options', userPaymentController.getMyInstallmentOptions)

export default router 