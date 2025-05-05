import express from 'express';
import {
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection
} from '../controllers/collectionController';

const router = express.Router();

// Tüm koleksiyonları getir
router.get('/', getAllCollections);

// ID'ye göre koleksiyon getir
router.get('/:id', getCollectionById);

// Yeni koleksiyon oluştur
router.post('/', createCollection);

// Koleksiyon güncelle
router.put('/:id', updateCollection);

// Koleksiyon sil
router.delete('/:id', deleteCollection);

export default router; 