import express from 'express';
import {
  getAllPriceLists,
  getPriceList,
  createPriceList,
  updatePriceList,
  deletePriceList,
  getCollectionsForPriceList,
  assignPriceListToStore,
  getStorePriceLists,
  getUserStorePriceLists,
  removeStorePriceList
} from '../controllers/priceListController';
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware';

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gerekli
router.use(authMiddleware);

// Fiyat listelerini getir - admin ve editör erişebilir
router.get('/', authorizeRoles('admin', 'editor'), getAllPriceLists);

// Koleksiyonları getir - fiyat listesi oluşturma formu için
router.get('/collections/list', getCollectionsForPriceList);

// Belirli bir fiyat listesini getir - tüm kullanıcılar erişebilir (giriş yapmış olması yeterli)
router.get('/:id', getPriceList);

// Kullanıcının Mağazasının Fiyat Listesini Getir - token'dan store_id alınır
router.get('/my-store/price-list', getUserStorePriceLists);

// Mağazanın Fiyat Listesi Atamasını Getir - tüm kullanıcılar erişebilir (giriş yapmış olması yeterli)
router.get('/store-assignments/:storeId', getStorePriceLists);

// Yeni fiyat listesi oluştur - admin ve editör erişebilir
router.post('/', authorizeRoles('admin', 'editor'), createPriceList);

// Fiyat listesini güncelle - admin ve editör erişebilir
router.put('/:id', authorizeRoles('admin', 'editor'), updatePriceList);

// Fiyat listesini sil - admin ve editör erişebilir
router.delete('/:id', authorizeRoles('admin', 'editor'), deletePriceList);

// Mağaza-fiyat listesi ilişkileri rotaları (oluşturma ve silme) - admin ve editör erişebilir
router.post('/store-assignments', authorizeRoles('admin', 'editor'), assignPriceListToStore);
router.delete('/store-assignments/:id', authorizeRoles('admin', 'editor'), removeStorePriceList);

export default router; 