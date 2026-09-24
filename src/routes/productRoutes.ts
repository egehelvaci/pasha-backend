import express from 'express';
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getAllProductsWithoutPagination,
  getProductById,
  getProductVariationOptions,
  updateProduct,
  updateProductStock,
  updateProductStockAreaM2,
  uploadProductImage
} from '../controllers/productController';

const router = express.Router();

// Sadece giriş yapmış kullanıcılar - Tüm ürünleri getir
router.get('/', authMiddleware, getAllProducts);

// Sadece giriş yapmış kullanıcılar - Tüm ürünleri getir (pagination olmadan)
router.get('/all', authMiddleware, getAllProductsWithoutPagination);

// Admin ve editör erişebilir - Ürünün stok varyasyon seçeneklerini getir
router.get('/:id/variations', authMiddleware, authorizeRoles('admin', 'editor'), getProductVariationOptions);

// Sadece giriş yapmış kullanıcılar - ID'ye göre ürün getir
router.get('/:id', authMiddleware, getProductById);

// Admin ve editör erişebilir - Yeni ürün oluştur (görsel yükleme ile)
router.post('/', authMiddleware, authorizeRoles('admin', 'editor'), uploadProductImage, createProduct);

// Admin ve editör erişebilir - Ürün güncelle (görsel yükleme ile)
router.put('/:id', authMiddleware, authorizeRoles('admin', 'editor'), uploadProductImage, updateProduct);

// Admin ve editör erişebilir - Ürün sil
router.delete('/:id', authMiddleware, authorizeRoles('admin', 'editor'), deleteProduct);

// Admin ve editör erişebilir - Stok güncelle
router.patch('/:id/stock', authMiddleware, authorizeRoles('admin', 'editor'), updateProductStock);

// Admin ve editör erişebilir - M² bazlı stok güncelle
router.patch('/:id/stock-area', authMiddleware, authorizeRoles('admin', 'editor'), updateProductStockAreaM2);

export default router; 