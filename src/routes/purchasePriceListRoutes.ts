import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware';
import {
  addToPurchaseCart,
  createPurchasePriceList,
  createSupplier,
  deactivateSupplier,
  getAllPurchasePriceLists,
  getAllPurchases,
  getAllSuppliers,
  getDefaultPurchasePriceList,
  getPurchaseCart,
  getPurchasePriceListById,
  getSupplierBalanceHistory,
  getSupplierBalanceSummary,
  getSupplierPurchaseSummary,
  purchaseFromCart,
  purchaseProductFromSupplier,
  removePurchaseCartItem,
  updateCollectionPrice,
  updatePurchaseCartItem,
  updatePurchasePriceList,
  updateSupplier,
  updateSupplierBalance
} from '../controllers/purchasePriceListController';

const router = Router();

// Tüm route'lar auth middleware ile korunmuş
// /api/admin/purchase-management altında olduğundan admin/editor yetkisi gerektirir
router.use(authMiddleware);
router.use(authorizeRoles('admin', 'editor'));

// Satıcı route'ları
router.get('/suppliers', getAllSuppliers);
router.get('/suppliers/balance-summary', getSupplierBalanceSummary);
router.post('/suppliers', createSupplier);
router.put('/suppliers/:id', updateSupplier);
router.put('/suppliers/:id/balance', updateSupplierBalance);
router.post('/suppliers/:supplier_id/purchase-product', purchaseProductFromSupplier);
router.get('/suppliers/:id/balance-history', getSupplierBalanceHistory);
router.delete('/suppliers/:id', deactivateSupplier);

// Alış fiyat listesi route'ları
router.get('/purchase-price-lists', getAllPurchasePriceLists);
router.get('/purchase-price-lists/default', getDefaultPurchasePriceList);
router.get('/purchase-price-lists/:id', getPurchasePriceListById);
router.post('/purchase-price-lists', createPurchasePriceList);
router.put('/purchase-price-lists/:id', updatePurchasePriceList);

// Koleksiyon fiyat güncelleme
router.put('/purchase-price-lists/:listId/collections/:collectionId', updateCollectionPrice);

// Alım sepeti route'ları
router.post('/suppliers/:supplier_id/purchase-cart/items', addToPurchaseCart); // Sepete ürün ekle
router.get('/suppliers/:supplier_id/purchase-cart', getPurchaseCart); // Sepeti getir
router.put('/suppliers/:supplier_id/purchase-cart/items/:item_id', updatePurchaseCartItem); // Sepet öğesini güncelle
router.delete('/suppliers/:supplier_id/purchase-cart/items/:item_id', removePurchaseCartItem); // Sepet öğesini sil
router.put('/suppliers/:supplier_id/purchase-from-cart', purchaseFromCart); // Sepetten satın alma işlemii

// Satın alım geçmişi ve raporlama route'ları
router.get('/purchases', getAllPurchases); // Belirli bir satın alımın detayını getir
router.get('/suppliers/:supplier_id/purchase-summary', getSupplierPurchaseSummary); // Dashboard için satın alım istatistiklerii

export default router;
