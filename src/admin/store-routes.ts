import express from 'express'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'
import { StoreController } from './store-controller'

const router = express.Router()
const storeController = new StoreController()

// Tüm mağaza rotaları için önce kimlik doğrulama ve yetkilendirme gerekiyor
router.use(authMiddleware)
router.use(authorizeRoles('admin', 'editor'))

// Mağaza yönetimi rotaları
router.get('/', storeController.getAllStores)
router.post('/', storeController.createStore)
router.put('/:storeId', storeController.updateStore)
router.delete('/:storeId', storeController.deleteStore)

// Mağaza-kullanıcı ilişkisi rotaları
router.get('/:storeId/users', storeController.getStoreUsers)

export default router 