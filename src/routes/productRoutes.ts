import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getProductPrice
} from '../controllers/productController';

const router = express.Router();

// Tüm ürünleri getir
router.get('/', getAllProducts);

// ID'ye göre ürün getir
router.get('/:id', getProductById);

// Yeni ürün oluştur (görsel yükleme ile)
router.post('/', uploadProductImage, createProduct);

// Ürün güncelle (görsel yükleme ile)
router.put('/:id', uploadProductImage, updateProduct);

// Ürün sil
router.delete('/:id', deleteProduct);

// Ürün fiyatını hesapla
router.get('/:id/price', getProductPrice);

export default router; 