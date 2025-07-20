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

// Sadece admin erişebilir - Ürünün stok varyasyon seçeneklerini getir
router.get('/:id/variations', authMiddleware, authorizeRoles('admin'), getProductVariationOptions);

// Sadece admin erişebilir - Ürünün varyasyonlarını yeniden oluştur
router.post('/:id/regenerate-variations', authMiddleware, authorizeRoles('admin'), regenerateProductVariations);

// Sadece admin erişebilir - Belirli kurala sahip ürünlerin varyasyonlarını yeniden oluştur
router.post('/regenerate-variations/rule/:ruleId', authMiddleware, authorizeRoles('admin'), regenerateVariationsForRule);

// Sadece admin erişebilir - Tüm ürünlerin varyasyonlarını yeniden oluştur
router.post('/regenerate-variations/all', authMiddleware, authorizeRoles('admin'), regenerateAllVariations);

// Sadece giriş yapmış kullanıcılar - ID'ye göre ürün getir
router.get('/:id', authMiddleware, getProductById);

// Sadece admin erişebilir - Test amaçlı basit ürün oluşturma endpoint'i
router.post('/test-create', authMiddleware, authorizeRoles('admin'), uploadProductImage, createProductSimple);

// Sadece admin erişebilir - Yeni ürün oluştur (görsel yükleme ile)
router.post('/', authMiddleware, authorizeRoles('admin'), uploadProductImage, createProduct);

// Sadece admin erişebilir - Ürün güncelle (görsel yükleme ile)
router.put('/:id', authMiddleware, authorizeRoles('admin'), uploadProductImage, updateProduct);

// Sadece admin erişebilir - Ürün sil
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteProduct);

// Sadece admin erişebilir - Stok güncelle
router.patch('/:id/stock', authMiddleware, authorizeRoles('admin'), updateProductStock);

// Sadece admin erişebilir - M² bazlı stok güncelle
router.patch('/:id/stock-area', authMiddleware, authorizeRoles('admin'), updateProductStockAreaM2);

// Sadece admin erişebilir - Hibrit stok güncelle
router.patch('/:id/stock-hybrid', authMiddleware, authorizeRoles('admin'), updateProductStockHybrid);

export default router; 