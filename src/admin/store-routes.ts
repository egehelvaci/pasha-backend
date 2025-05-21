import express from 'express'
import { StoreController } from './store-controller'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'

const router = express.Router()
const storeController = new StoreController()

// Tüm mağaza rotaları için önce kimlik doğrulama ve yetkilendirme gerekiyor
router.use(authMiddleware)
router.use(authorizeRoles('admin'))

// Mağaza yönetimi rotaları
router.get('/', storeController.getAllStores)
router.get('/:storeId', storeController.getStoreById)
router.post('/', storeController.createStore)
router.put('/:storeId', storeController.updateStore)
router.delete('/:storeId', storeController.deleteStore)

// Mağaza-fiyat listesi ilişkisi rotaları
router.get('/:storeId/price-lists', storeController.getStorePriceLists)
router.post('/:storeId/price-lists', storeController.assignPriceListToStore)
router.delete('/:storeId/price-lists/:priceListId', storeController.removePriceListFromStore)

// Mağaza-kullanıcı ilişkisi rotaları
router.get('/:storeId/users', storeController.getStoreUsers)

export default router 