import express from 'express';
import {
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection
} from '../controllers/collectionController';
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware';

const router = express.Router();

// Herkes erişebilir - Tüm koleksiyonları getir
router.get('/', getAllCollections);

// Herkes erişebilir - ID'ye göre koleksiyon getir
router.get('/:id', getCollectionById);

// Admin ve editör erişebilir - Yeni koleksiyon oluştur
router.post('/', authMiddleware, authorizeRoles('admin', 'editor'), createCollection);

// Admin ve editör erişebilir - Koleksiyon güncelle
router.put('/:id', authMiddleware, authorizeRoles('admin', 'editor'), updateCollection);

// Admin ve editör erişebilir - Koleksiyon sil
router.delete('/:id', authMiddleware, authorizeRoles('admin', 'editor'), deleteCollection);

export default router; 