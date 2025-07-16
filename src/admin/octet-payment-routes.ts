import express from 'express'
import { octetPaymentController } from './octet-payment-controller'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'

const router = express.Router()

// Tüm Octet admin rotaları için önce kimlik doğrulama ve yetkilendirme gerekiyor
router.use(authMiddleware)
router.use(authorizeRoles('admin'))

// Ödeme başlatma
router.post('/payments/initiate', octetPaymentController.initiatePayment)

// Taksit limitleri ayarlama
router.post('/installments/set', octetPaymentController.setInstallmentLimits)

// Mağaza taksit seçeneklerini getirme
router.get('/installments/options/:storeId', octetPaymentController.getInstallmentOptions)

export default router 