import { Router } from 'express';
import {
  getStores,
  getStoreById,
  initiateAdminBalanceTopUp,
  initiateStoreBalanceTopUp,
  paymentCallback,
  getPaymentStatus,
  getStorePaymentHistory
} from '../controllers/paymentController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * Mağaza listesi getirme (admin için)
 * GET /api/v1/payment/stores
 * Gerekli auth: Evet (Admin)
 */
router.get('/stores', verifyToken, getStores);

/**
 * Belirli bir mağaza bilgisi getirme (admin için)
 * GET /api/v1/payment/stores/:storeId
 * Gerekli auth: Evet (Admin)
 */
router.get('/stores/:storeId', verifyToken, getStoreById);

/**
 * Admin bakiye yükleme başlatma endpoint'i
 * POST /api/v1/payment/admin/initiate
 * Gerekli auth: Evet (Admin)
 * 
 * Body: {
 *   storeId: string,
 *   amount: number,
 *   description?: string
 * }
 */
router.post('/admin/initiate', verifyToken, initiateAdminBalanceTopUp);

/**
 * Mağaza sahibi bakiye yükleme endpoint'i
 * POST /api/v1/payment/store/initiate
 * Gerekli auth: Evet (Store User)
 * 
 * Body: {
 *   amount: number,
 *   description?: string
 * }
 */
router.post('/store/initiate', verifyToken, initiateStoreBalanceTopUp);

/**
 * Ödeme callback endpoint'i
 * POST /api/v1/payment/callback
 * Gerekli auth: Hayır (Octet'ten gelen callback)
 * 
 * Bu endpoint Octet tarafından çağrılır
 * Kullanıcıyı frontend'e yönlendirir
 */
router.post('/callback', paymentCallback);

/**
 * Ödeme durumu sorgulama endpoint'i
 * GET /api/v1/payment/status/:paymentReference
 * Gerekli auth: Evet
 * 
 * Params: {
 *   paymentReference: string
 * }
 */
router.get('/status/:paymentReference', verifyToken, getPaymentStatus);

/**
 * Mağaza ödeme geçmişi
 * GET /api/v1/payment/history/:storeId
 * Gerekli auth: Evet
 * 
 * Query: {
 *   limit?: number (default: 20)
 * }
 */
router.get('/history/:storeId', verifyToken, getStorePaymentHistory);

export default router; 