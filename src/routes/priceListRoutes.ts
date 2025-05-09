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

const router = express.Router();

// Tüm fiyat listelerini getir
router.get('/', getAllPriceLists);

// Fiyat listesi detaylarını getir
router.get('/:id', getPriceList);

// Yeni fiyat listesi oluştur
router.post('/', createPriceList);

// Fiyat listesi güncelle
router.put('/:id', updatePriceList);

// Fiyat listesi sil
router.delete('/:id', deletePriceList);

// Fiyat listesi oluştururken kullanılacak koleksiyonları getir
router.get('/collections/available', getCollectionsForPriceList);

// Kullanıcıya fiyat listesi ata
router.post('/user-assignments', assignPriceListToUser);

// Kullanıcı fiyat listesi atamalarını getir
router.get('/user-assignments/:userId', getUserPriceLists);

// Kullanıcı fiyat listesi atamasını kaldır
router.delete('/user-assignments/:id', removeUserPriceList);

export default router; 