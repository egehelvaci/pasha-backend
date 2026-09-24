import { Router } from 'express';
import { authMiddleware } from '../auth/auth-middleware';
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem
} from '../controllers/cartController';

const router = Router();

// Kullanıcı authentication'ı gereken route'lar
router.use(authMiddleware);

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

export default router; 