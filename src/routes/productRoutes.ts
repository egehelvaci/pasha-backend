import express from 'express';
import {
  getAllProducts,
  getProductById,
  getProductsByCollection,
  createProduct,
  createProductSimple,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  updateProductStock,
  getAllProductRules,
  getProductVariationOptions
} from '../controllers/productController';
import { verifyToken, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Sadece giriş yapmış kullanıcılar - Tüm ürünleri getir
router.get('/', verifyToken, getAllProducts);

// Herkes erişebilir - Tüm ürün kurallarını getir (dropdown için)
router.get('/rules', getAllProductRules);

// Sadece giriş yapmış kullanıcılar - Koleksiyona göre ürünleri getir
router.get('/by-collection/:collectionId', verifyToken, getProductsByCollection);

// Sadece admin erişebilir - Ürünün stok varyasyon seçeneklerini getir
router.get('/:id/variations', isAdmin, getProductVariationOptions);

// Sadece giriş yapmış kullanıcılar - ID'ye göre ürün getir
router.get('/:id', verifyToken, getProductById);

// Sadece admin erişebilir - Test amaçlı basit ürün oluşturma endpoint'i
router.post('/test-create', isAdmin, uploadProductImage, createProductSimple);

// Sadece admin erişebilir - Yeni ürün oluştur (görsel yükleme ile)
router.post('/', isAdmin, uploadProductImage, createProduct);

// Sadece admin erişebilir - Ürün güncelle (görsel yükleme ile)
router.put('/:id', isAdmin, uploadProductImage, updateProduct);

// Sadece admin erişebilir - Ürün sil
router.delete('/:id', isAdmin, deleteProduct);

// Sadece admin erişebilir - Stok güncelle
router.patch('/:id/stock', isAdmin, updateProductStock);

export default router; 