import express from 'express'
import { AdminController } from './admin-controller'
import { adminOrderController } from './admin-order-controller'
import { adminStatisticsController } from './admin-statistics-controller'
import { AdminPaymentController } from './admin-payment-controller'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'
import storeRoutes from './store-routes'
import productRulesRoutes from './product-rules-routes'
import cutTypesRoutes from './cut-types-routes'
import muhasebeRoutes from './muhasebe-routes'
import adminCartRoutes from './admin-cart-routes'

import { excelExportController } from './excel-export-controller'

const router = express.Router()
const adminController = new AdminController()
const adminPaymentController = new AdminPaymentController()

// QR Kod okutma - Authentication gerektirmez (mobil uygulama için)
router.post('/scan-qr', adminOrderController.scanQRCode)
router.get('/scan-qr', adminOrderController.scanQRCode)

// Tüm diğer admin rotaları için önce kimlik doğrulama ve yetkilendirme gerekiyor
router.use(authMiddleware)
router.use(authorizeRoles('admin'))

// Mağaza yönetimi rotalarını ekle
router.use('/stores', storeRoutes)

// Ürün kuralları yönetimi rotalarını ekle
router.use('/product-rules', productRulesRoutes)

// Kesim türleri yönetimi rotalarını ekle
router.use('/cut-types', cutTypesRoutes)

// Muhasebe hareketleri rotalarını ekle
router.use('/', muhasebeRoutes)

// Admin sepet yönetimi rotalarını ekle
router.use('/cart', adminCartRoutes)

// Sipariş yönetimi rotaları
router.get('/orders', adminOrderController.getAllOrders)
router.get('/orders/stats', adminOrderController.getOrderStats)
router.get('/orders/:orderId', adminOrderController.getOrderById)
router.post('/orders/:orderId/confirm', adminOrderController.confirmOrder)

// Admin sipariş oluşturma rotaları
router.post('/orders/create-for-store', adminOrderController.createOrderForStore)
router.post('/orders/process-admin-order', adminOrderController.processAdminOrder)

// QR Kod yönetimi rotaları
router.post('/orders/:orderId/generate-qr', adminOrderController.generateQRCodes);
router.post('/orders/:orderId/generate-qr-images', adminOrderController.generateQRCodeImages);
router.get('/orders/:orderId/qrcodes', adminOrderController.getOrderQRCodes)

// Sipariş durumu güncelleme
router.put('/orders/:orderId/status', adminOrderController.updateOrderStatus)

// İstatistik API'leri
router.get('/statistics/top-stores', adminStatisticsController.getTopStores)
router.get('/statistics/top-products', adminStatisticsController.getTopProducts)
router.get('/statistics/orders-over-time', adminStatisticsController.getOrdersOverTime)
router.get('/statistics/totals', adminStatisticsController.getTotalStatistics)

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

// Excel Export API'leri
router.get('/export/orders', excelExportController.exportOrders)

// Payment API'leri
router.get('/payments', adminPaymentController.getAllPayments)

export default router 