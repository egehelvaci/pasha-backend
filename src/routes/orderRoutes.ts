import { Router } from 'express';
import {
  createOrderFromCart,
  getOrderById,
  checkCartLimits,
  getUserOrders,
  cancelOrder,
  getOrderReceipt,
  markReceiptPrinted
} from '../controllers/orderController';
import { authMiddleware } from '../auth/auth-middleware';

const router = Router();

// Kullanıcı authentication'ı gereken route'lar
router.use(authMiddleware);

// Sepet limiti kontrolü (sipariş vermeden önce)
router.get('/check-limits', checkCartLimits);

// Sepeti onayla ve sipariş oluştur
router.post('/create-from-cart', createOrderFromCart);

// Kullanıcının tüm siparişlerini listele
router.get('/my-orders', getUserOrders);

// Sipariş detayını getir
router.get('/:orderId', getOrderById);

// Siparişi iptal et (sadece PENDING durumundaki siparişler)
router.put('/:orderId/cancel', cancelOrder);

// Sipariş fişi al (onaylanan ve teslim edilenler için)
router.get('/:orderId/receipt', getOrderReceipt);

// Fiş yazdırma durumunu işaretle (sadece CONFIRMED ve DELIVERED siparişler için)
router.put('/:orderId/mark-printed', markReceiptPrinted);

export default router; 