import express from 'express'
import { AdminController } from './admin-controller'
import { adminOrderController } from './admin-order-controller'
import { adminStatisticsController } from './admin-statistics-controller'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'
import storeRoutes from './store-routes'
import productRulesRoutes from './product-rules-routes'
import cutTypesRoutes from './cut-types-routes'
import octetPaymentRoutes from './octet-payment-routes'

import { createAccountingTransaction, getAllAccountingTransactions, getTransactionTypes } from './accounting-transaction-controller'
import { excelExportController } from './excel-export-controller'

const router = express.Router()
const adminController = new AdminController()

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

// Octet ödeme sistemi rotalarını ekle
router.use('/octet', octetPaymentRoutes)

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

// Muhasebe hareketleri API'si
router.get('/accounting-transactions', getAllAccountingTransactions)
router.post('/accounting-transactions', createAccountingTransaction)
router.get('/accounting-transactions/types', getTransactionTypes)

// Excel Export API'leri
router.get('/export/orders', excelExportController.exportOrders)
router.get('/export/accounting-transactions', excelExportController.exportAccountingTransactions)

export default router 