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
  removeStorePriceList
} from '../controllers/priceListController';
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware';

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gerekli
router.use(authMiddleware);

// Fiyat listelerini getir - tüm kullanıcılar erişebilir
router.get('/', getAllPriceLists);

// Belirli bir fiyat listesini getir - tüm kullanıcılar erişebilir
router.get('/:id', getPriceList);

// Koleksiyonları getir - fiyat listesi oluşturma formu için
router.get('/collections/list', getCollectionsForPriceList);

// Admin yetkisi gerektiren rotalar
router.use(authorizeRoles('admin'));

// Yeni fiyat listesi oluştur - sadece admin
router.post('/', createPriceList);

// Fiyat listesini güncelle - sadece admin
router.put('/:id', updatePriceList);

// Fiyat listesini sil - sadece admin
router.delete('/:id', deletePriceList);

// Mağaza-fiyat listesi ilişkileri rotaları
router.post('/store-assignments', assignPriceListToStore);
router.get('/store-assignments/:storeId', getStorePriceLists);
router.delete('/store-assignments/:id', removeStorePriceList);

export default router; 