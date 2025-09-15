import express from 'express';
import { PublicCatalogController } from '../controllers/publicCatalogController';

const router = express.Router();
const publicCatalogController = new PublicCatalogController();

// Public katalog rotaları - TOKEN GEREKTİRMEZ

// Tüm koleksiyonları ve ürünlerini getir
// GET /public/catalog/collections
router.get('/collections', publicCatalogController.getPublicCollections.bind(publicCatalogController));

// Belirli bir koleksiyonun detaylarını getir
// GET /public/catalog/collections/:collectionId
router.get('/collections/:collectionId', publicCatalogController.getPublicCollectionById.bind(publicCatalogController));

export default router;
