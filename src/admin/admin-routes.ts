import express from 'express'
import { AdminController } from './admin-controller'
import { adminOrderController } from './admin-order-controller'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'
import storeRoutes from './store-routes'

const router = express.Router()
const adminController = new AdminController()

// QR Kod okutma - Authentication gerektirmez (mobil uygulama için)
router.post('/scan-qr', adminOrderController.scanQRCode)

// Tüm diğer admin rotaları için önce kimlik doğrulama ve yetkilendirme gerekiyor
router.use(authMiddleware)
router.use(authorizeRoles('admin'))

// Mağaza yönetimi rotalarını ekle
router.use('/stores', storeRoutes)

// Sipariş yönetimi rotaları
router.get('/orders', adminOrderController.getAllOrders)
router.get('/orders/stats', adminOrderController.getOrderStats)
router.get('/orders/:orderId', adminOrderController.getOrderById)
router.post('/orders/:orderId/confirm', adminOrderController.confirmOrder)

// QR Kod yönetimi rotaları
router.post('/orders/:orderId/generate-qr', adminOrderController.generateQRCodes);
router.post('/orders/:orderId/generate-qr-images', adminOrderController.generateQRCodeImages);
router.get('/orders/:orderId/qrcodes', adminOrderController.getOrderQRCodes)

// Sipariş durumu güncelleme
router.put('/orders/:orderId/status', adminOrderController.updateOrderStatus)

// Kullanıcıları listeleme
router.get('/users', adminController.getAllUsers)

// Belirli bir kullanıcıyı getirme
router.get('/users/:userId', adminController.getUserById)

// Yeni kullanıcı oluşturma
router.post('/users', adminController.createUser)

// Kullanıcı bilgilerini güncelleme
router.put('/users/:userId', adminController.updateUser)

// Kullanıcı silme
router.delete('/users/:userId', adminController.deleteUser)

// Kullanıcıyı mağazaya ata
router.post('/users/:userId/assign-store', adminController.assignUserToStore)

// Kullanıcıyı mağazadan kaldır
router.delete('/users/:userId/remove-store', adminController.removeUserFromStore)

export default router 