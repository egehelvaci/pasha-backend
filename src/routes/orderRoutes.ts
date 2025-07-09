import { Router } from 'express';
import {
  createOrderFromCart,
  getOrderById,
  checkCartLimits
} from '../controllers/orderController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Kullanıcı authentication'ı gereken route'lar
router.use(verifyToken);

// Sepet limiti kontrolü (sipariş vermeden önce)
router.get('/check-limits', checkCartLimits);

// Sepeti onayla ve sipariş oluştur
router.post('/create-from-cart', createOrderFromCart);

// Sipariş detayını getir
router.get('/:orderId', getOrderById);

export default router; 