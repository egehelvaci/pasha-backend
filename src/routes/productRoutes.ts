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
  updateProductStockAreaM2,
  updateProductStockHybrid,
  getAllProductRules,
  getProductVariationOptions,
  regenerateProductVariations,
  regenerateVariationsForRule,
  regenerateAllVariations
} from '../controllers/productController';
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware';

const router = express.Router();

// Sadece giriş yapmış kullanıcılar - Tüm ürünleri getir
router.get('/', authMiddleware, getAllProducts);

// Herkes erişebilir - Tüm ürün kurallarını getir (dropdown için)
router.get('/rules', getAllProductRules);

// Sadece giriş yapmış kullanıcılar - Koleksiyona göre ürünleri getir
router.get('/by-collection/:collectionId', authMiddleware, getProductsByCollection);

// Admin ve editör erişebilir - Ürünün stok varyasyon seçeneklerini getir
router.get('/:id/variations', authMiddleware, authorizeRoles('admin', 'editor'), getProductVariationOptions);

// Admin ve editör erişebilir - Ürünün varyasyonlarını yeniden oluştur
router.post('/:id/regenerate-variations', authMiddleware, authorizeRoles('admin', 'editor'), regenerateProductVariations);

// Sadece admin erişebilir - Belirli kurala sahip ürünlerin varyasyonlarını yeniden oluştur
router.post('/regenerate-variations/rule/:ruleId', authMiddleware, authorizeRoles('admin'), regenerateVariationsForRule);

// Sadece admin erişebilir - Tüm ürünlerin varyasyonlarını yeniden oluştur
router.post('/regenerate-variations/all', authMiddleware, authorizeRoles('admin'), regenerateAllVariations);

// Sadece giriş yapmış kullanıcılar - ID'ye göre ürün getir
router.get('/:id', authMiddleware, getProductById);

// Admin ve editör erişebilir - Test amaçlı basit ürün oluşturma endpoint'i
router.post('/test-create', authMiddleware, authorizeRoles('admin', 'editor'), uploadProductImage, createProductSimple);

// Admin ve editör erişebilir - Yeni ürün oluştur (görsel yükleme ile)
router.post('/', authMiddleware, authorizeRoles('admin', 'editor'), uploadProductImage, createProduct);

// Admin ve editör erişebilir - Ürün güncelle (görsel yükleme ile)
router.put('/:id', authMiddleware, authorizeRoles('admin', 'editor'), uploadProductImage, updateProduct);

// Sadece admin erişebilir - Ürün sil
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteProduct);

// Admin ve editör erişebilir - Stok güncelle
router.patch('/:id/stock', authMiddleware, authorizeRoles('admin', 'editor'), updateProductStock);

// Admin ve editör erişebilir - M² bazlı stok güncelle
router.patch('/:id/stock-area', authMiddleware, authorizeRoles('admin', 'editor'), updateProductStockAreaM2);

// Admin ve editör erişebilir - Hibrit stok güncelle
router.patch('/:id/stock-hybrid', authMiddleware, authorizeRoles('admin', 'editor'), updateProductStockHybrid);

export default router; 