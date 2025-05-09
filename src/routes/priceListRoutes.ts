import express from 'express';
import {
  getAllPriceLists,
  getPriceList,
  createPriceList,
  updatePriceList,
  deletePriceList,
  getCollectionsForPriceList,
  assignPriceListToUser,
  getUserPriceLists,
  removeUserPriceList
} from '../controllers/priceListController';
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware';

const router = express.Router();

// Tüm rotalar için auth middleware'i ekle
router.use(authMiddleware);

// Tüm fiyat listelerini getir
router.get('/', getAllPriceLists);

// Fiyat listesi oluştururken kullanılacak koleksiyonları getir
router.get('/collections/available', getCollectionsForPriceList);

// Kullanıcıya fiyat listesi ata (sadece admin)
router.post('/user-assignments', authorizeRoles('admin'), assignPriceListToUser);

// Kullanıcı fiyat listesi atamalarını getir
router.get('/user-assignments/:userId', getUserPriceLists);

// Kullanıcı fiyat listesi atamasını kaldır (sadece admin)
router.delete('/user-assignments/:id', authorizeRoles('admin'), removeUserPriceList);

// Yeni fiyat listesi oluştur (sadece admin)
router.post('/', authorizeRoles('admin'), createPriceList);

// Fiyat listesi detaylarını getir
router.get('/:id', getPriceList);

// Fiyat listesi güncelle (sadece admin)
router.put('/:id', authorizeRoles('admin'), updatePriceList);

// Fiyat listesi sil (sadece admin)
router.delete('/:id', authorizeRoles('admin'), deletePriceList);

export default router; 