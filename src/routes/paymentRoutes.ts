import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { WebhookController } from '../controllers/webhookController';
import { AdminPaymentController } from '../admin/admin-payment-controller';
import { authMiddleware } from '../auth/auth-middleware';

const router = Router();
const paymentController = new PaymentController();
const webhookController = new WebhookController();
const adminPaymentController = new AdminPaymentController();

// Ana ödeme endpoint'leri
router.post('/process', paymentController.processPayment.bind(paymentController));
router.post('/create-request', paymentController.createPaymentRequest.bind(paymentController));

// DBYE Ana Webhook Endpoint'i
router.post('/webhook/dbye', webhookController.handleDbyeWebhook.bind(webhookController));

// Test/Eski webhook endpoint'leri (geriye uyumluluk için)
router.get('/webhook/success', webhookController.handleSuccessWebhookLegacy.bind(webhookController));
router.post('/webhook/success', webhookController.handleSuccessWebhookLegacy.bind(webhookController));
router.get('/webhook/failure', webhookController.handleFailureWebhookLegacy.bind(webhookController));
router.post('/webhook/failure', webhookController.handleFailureWebhookLegacy.bind(webhookController));

// Transaction sorgulama
router.get('/status/:sellerReference', webhookController.getTransactionStatus.bind(webhookController));

// Mağaza ödeme geçmişi (kimlik doğrulaması gerekli)
router.get('/my-store-payments', authMiddleware, adminPaymentController.getStorePayments.bind(adminPaymentController));

export default router; 