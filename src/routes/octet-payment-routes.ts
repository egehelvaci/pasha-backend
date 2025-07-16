import express from 'express'
import { octetPaymentController } from '../admin/octet-payment-controller'

const router = express.Router()

/**
 * PUBLIC ENDPOINT - Octet callback'i için auth gerektirmez
 * POST /api/payments/callback
 * Octet tarafından ödeme sonucu bildirilir
 */
router.post('/callback', octetPaymentController.handlePaymentCallback)

export default router 