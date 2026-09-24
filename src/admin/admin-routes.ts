import express from 'express'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'
import { cancelOrder } from '../controllers/orderController'
import adminCartRoutes from './admin-cart-routes'
import { AdminController } from './admin-controller'
import { adminOrderController } from './admin-order-controller'
import { AdminPaymentController } from './admin-payment-controller'
import { adminStatisticsController } from './admin-statistics-controller'
import cutTypesRoutes from './cut-types-routes'
import muhasebeRoutes from './muhasebe-routes'
import { advanceOrder } from './order-fulfillment-controller'
import orderListV2Routes from './order-list-v2-routes'
import productRulesRoutes from './product-rules-routes'
import storeRoutes from './store-routes'


const router = express.Router()
const adminController = new AdminController()
const adminPaymentController = new AdminPaymentController()

// QR Kod okutma ve çalışan atama - Authentication gerektirmez (mobil uygulama için)
router.post('/scan-qr', adminOrderController.scanQRCode)
router.get('/scan-qr', adminOrderController.scanQRCode)
router.post('/orders/:orderId/assign-employee', adminOrderController.assignEmployeeToOrder)

// Tüm diğer admin rotaları için önce kimlik doğrulama gerekiyor
router.use(authMiddleware)
router.use('/orders-v2', orderListV2Routes)

// Editör ve admin için ayrı yetkilendirme gerektiren rotalar

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

// Sipariş yönetimi rotaları - Editör ve Admin erişimi
router.get('/orders', authorizeRoles('admin', 'editor'), adminOrderController.getAllOrders)
router.get('/orders/:orderId', authorizeRoles('admin', 'editor'), adminOrderController.getOrderById)
router.put('/orders/:orderId/cancel', authorizeRoles('admin', 'editor'), cancelOrder)
router.post('/orders/bulk-confirm', authorizeRoles('admin', 'editor'), adminOrderController.bulkConfirmOrders)

// Admin sipariş oluşturma rotaları - Editör ve Admin erişimi
router.post('/orders/create-for-store', authorizeRoles('admin', 'editor'), adminOrderController.createOrderForStore)
router.post('/orders/:orderId/generate-qr-images', authorizeRoles('admin', 'editor'), adminOrderController.generateQRCodeImages);

// Barkod yönetimi rotaları - Editör ve Admin erişimi
router.post('/barcode/scan', authorizeRoles('admin', 'editor'), adminOrderController.scanBarcode)
router.post('/barcode/scan-multiple', authorizeRoles('admin', 'editor'), adminOrderController.scanMultipleBarcodes)

// Sipariş durumu güncelleme - Editör ve Admin erişimi
router.put('/orders/:orderId/status', authorizeRoles('admin', 'editor'), adminOrderController.updateOrderStatus)
router.post('/orders/:orderId/advance', authorizeRoles('admin'), advanceOrder)

// İstatistik API'leri - Editör ve Admin erişimi
router.get('/statistics/top-stores', authorizeRoles('admin', 'editor'), adminStatisticsController.getTopStores)
router.get('/statistics/top-products', authorizeRoles('admin', 'editor'), adminStatisticsController.getTopProducts)
router.get('/statistics/orders-over-time', authorizeRoles('admin', 'editor'), adminStatisticsController.getOrdersOverTime)
router.get('/statistics/totals', authorizeRoles('admin', 'editor'), adminStatisticsController.getTotalStatistics)
router.get('/users', authorizeRoles('admin', 'editor'), adminController.getAllUsers)
router.get('/users/:userId', authorizeRoles('admin', 'editor'), adminController.getUserById)
router.post('/users', authorizeRoles('admin', 'editor'), adminController.createUser)
router.put('/users/:userId', authorizeRoles('admin', 'editor'), adminController.updateUser)
router.delete('/users/:userId', authorizeRoles('admin', 'editor'), adminController.deleteUser)
router.post('/users/:userId/assign-store', authorizeRoles('admin', 'editor'), adminController.assignUserToStore)
router.delete('/users/:userId/remove-store', authorizeRoles('admin', 'editor'), adminController.removeUserFromStore)

// Payment API'leri - Editör ve Admin erişimi
router.get('/payments', authorizeRoles('admin', 'editor'), adminPaymentController.getAllPayments)

export default router
