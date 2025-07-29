import express from 'express';
import { AdminCartController } from './admin-cart-controller';

const router = express.Router();
const adminCartController = new AdminCartController();

// Admin için kullanıcı admin sepetine ürün ekleme
// POST /admin/cart/add-to-admin-cart
router.post('/add-to-admin-cart', adminCartController.addToAdminCart);

// Admin için kullanıcı admin sepetini getirme
// GET /admin/cart/:targetUserId/:storeId
router.get('/:targetUserId/:storeId', adminCartController.getAdminCart);

// Admin için kullanıcı admin sepetini temizleme
// DELETE /admin/cart/:targetUserId/:storeId/clear
router.delete('/:targetUserId/:storeId/clear', adminCartController.clearAdminCart);

// Admin için kullanıcı admin sepetinden ürün çıkarma
// DELETE /admin/cart/:targetUserId/:storeId/item/:adminCartItemId
router.delete('/:targetUserId/:storeId/item/:adminCartItemId', adminCartController.removeFromAdminCart);

// Admin için kullanıcı admin sepetinden sipariş oluşturma
// POST /admin/cart/create-order-from-admin-cart
router.post('/create-order-from-admin-cart', adminCartController.createOrderFromAdminCart);

export default router; 