import { Router } from 'express';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  deleteCart,
  cleanOldCarts
} from '../controllers/cartController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Kullanıcı authentication'ı gereken route'lar
router.use(verifyToken);

// GET /cart - Kullanıcının sepetini getir
router.get('/', getCart);

// POST /cart/add - Sepete ürün ekle
router.post('/add', addToCart);

// PUT /cart/items/:cartItemId - Sepet öğesini güncelle
router.put('/items/:cartItemId', updateCartItem);

// DELETE /cart/items/:cartItemId - Sepetten ürün çıkar
router.delete('/items/:cartItemId', removeFromCart);

// DELETE /cart/clear - Sepeti temizle (öğeleri sil ama sepeti koru)
router.delete('/clear', clearCart);

// DELETE /cart - Sepeti tamamen sil
router.delete('/', deleteCart);

// POST /cart/admin/clean - Eski sepetleri temizle (admin endpoint)
router.post('/admin/clean', cleanOldCarts);

export default router; 