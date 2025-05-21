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

// Fiyat listelerini getir - sadece admin erişebilir
router.get('/', authorizeRoles('admin'), getAllPriceLists);

// Koleksiyonları getir - fiyat listesi oluşturma formu için
router.get('/collections/list', getCollectionsForPriceList);

// Belirli bir fiyat listesini getir - tüm kullanıcılar erişebilir (giriş yapmış olması yeterli)
router.get('/:id', getPriceList);

// Mağazanın Fiyat Listesi Atamasını Getir - tüm kullanıcılar erişebilir (giriş yapmış olması yeterli)
router.get('/store-assignments/:storeId', getStorePriceLists);

// Admin yetkisi gerektiren rotalar
router.use(authorizeRoles('admin'));

// Yeni fiyat listesi oluştur - sadece admin
router.post('/', createPriceList);

// Fiyat listesini güncelle - sadece admin
router.put('/:id', updatePriceList);

// Fiyat listesini sil - sadece admin
router.delete('/:id', deletePriceList);

// Mağaza-fiyat listesi ilişkileri rotaları (oluşturma ve silme) - sadece admin
router.post('/store-assignments', assignPriceListToStore);
router.delete('/store-assignments/:id', removeStorePriceList);

export default router; 