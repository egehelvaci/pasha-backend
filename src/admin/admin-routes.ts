import express from 'express'
import { AdminController } from './admin-controller'
import { adminOrderController } from './admin-order-controller'
import { adminStatisticsController } from './admin-statistics-controller'
import { AdminPaymentController } from './admin-payment-controller'
import { employeeStatsController } from '../employee-stats-controller'
import { getOrderReceipt, cancelOrder } from '../controllers/orderController'
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

// QR Kod okutma ve çalışan atama - Authentication gerektirmez (mobil uygulama için)
router.post('/scan-qr', adminOrderController.scanQRCode)
router.get('/scan-qr', adminOrderController.scanQRCode)
router.post('/orders/:orderId/assign-employee', adminOrderController.assignEmployeeToOrder)

// Tüm diğer admin rotaları için önce kimlik doğrulama gerekiyor
router.use(authMiddleware)

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
router.get('/orders/stats', authorizeRoles('admin', 'editor'), adminOrderController.getOrderStats)
router.get('/orders/:orderId', authorizeRoles('admin', 'editor'), adminOrderController.getOrderById)
router.get('/orders/:orderId/receipt', authorizeRoles('admin', 'editor'), getOrderReceipt)
router.put('/orders/:orderId/cancel', authorizeRoles('admin', 'editor'), cancelOrder)
router.post('/orders/:orderId/confirm', authorizeRoles('admin', 'editor'), adminOrderController.confirmOrder)
router.post('/orders/bulk-confirm', authorizeRoles('admin', 'editor'), adminOrderController.bulkConfirmOrders)

// Admin sipariş oluşturma rotaları - Editör ve Admin erişimi
router.post('/orders/create-for-store', authorizeRoles('admin', 'editor'), adminOrderController.createOrderForStore)
router.post('/orders/process-admin-order', authorizeRoles('admin', 'editor'), adminOrderController.processAdminOrder)

// QR Kod yönetimi rotaları - Editör ve Admin erişimi
router.post('/orders/:orderId/generate-qr', authorizeRoles('admin', 'editor'), adminOrderController.generateQRCodes);
router.post('/orders/:orderId/generate-qr-images', authorizeRoles('admin', 'editor'), adminOrderController.generateQRCodeImages);
router.get('/orders/:orderId/qrcodes', authorizeRoles('admin', 'editor'), adminOrderController.getOrderQRCodes)

// Barkod yönetimi rotaları - Editör ve Admin erişimi
router.post('/barcode/scan', authorizeRoles('admin', 'editor'), adminOrderController.scanBarcode)
router.post('/barcode/scan-multiple', authorizeRoles('admin', 'editor'), adminOrderController.scanMultipleBarcodes)
router.get('/orders/:orderId/barcodes', authorizeRoles('admin', 'editor'), adminOrderController.getOrderBarcodes)
router.post('/orders/:orderId/generate-barcode-images', authorizeRoles('admin', 'editor'), adminOrderController.generateBarcodeImages)
router.get('/barcode/stats', authorizeRoles('admin', 'editor'), adminOrderController.getBarcodeStats)
router.get('/orders/ready/with-barcodes', authorizeRoles('admin', 'editor'), adminOrderController.getReadyOrdersWithBarcodes)

// Sipariş durumu güncelleme - Editör ve Admin erişimi
router.put('/orders/:orderId/status', authorizeRoles('admin', 'editor'), adminOrderController.updateOrderStatus)

// İstatistik API'leri - Editör ve Admin erişimi
router.get('/statistics/top-stores', authorizeRoles('admin', 'editor'), adminStatisticsController.getTopStores)
router.get('/statistics/top-products', authorizeRoles('admin', 'editor'), adminStatisticsController.getTopProducts)
router.get('/statistics/orders-over-time', authorizeRoles('admin', 'editor'), adminStatisticsController.getOrdersOverTime)
router.get('/statistics/totals', authorizeRoles('admin', 'editor'), adminStatisticsController.getTotalStatistics)

// Çalışan istatistikleri API'leri - Editör ve Admin erişimi
router.get('/employees/stats', authorizeRoles('admin', 'editor'), employeeStatsController.getAllEmployeeStats)
router.get('/employees/:employeeId/stats', authorizeRoles('admin', 'editor'), employeeStatsController.getEmployeeStats)

// Kullanıcı yönetimi rotaları - Editör ve Admin erişimi
router.get('/user-types', authorizeRoles('admin', 'editor'), adminController.getUserTypes)
router.get('/users', authorizeRoles('admin', 'editor'), adminController.getAllUsers)
router.get('/users/:userId', authorizeRoles('admin', 'editor'), adminController.getUserById)
router.post('/users', authorizeRoles('admin', 'editor'), adminController.createUser)
router.put('/users/:userId', authorizeRoles('admin', 'editor'), adminController.updateUser)
router.delete('/users/:userId', authorizeRoles('admin', 'editor'), adminController.deleteUser)
router.post('/users/:userId/assign-store', authorizeRoles('admin', 'editor'), adminController.assignUserToStore)
router.delete('/users/:userId/remove-store', authorizeRoles('admin', 'editor'), adminController.removeUserFromStore)

// Excel Export API'leri - Editör ve Admin erişimi
router.get('/export/orders', authorizeRoles('admin', 'editor'), excelExportController.exportOrders)

// Payment API'leri - Editör ve Admin erişimi
router.get('/payments', authorizeRoles('admin', 'editor'), adminPaymentController.getAllPayments)

export default router 