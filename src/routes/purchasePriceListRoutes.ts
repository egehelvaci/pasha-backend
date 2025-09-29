import { Router } from 'express';
import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deactivateSupplier,
  updateSupplierBalance,
  getSupplierBalanceHistory,
  getSupplierBalanceSummary,
  purchaseProductFromSupplier,
  getAllPurchasePriceLists,
  getPurchasePriceListById,
  createPurchasePriceList,
  updatePurchasePriceList,
  deactivatePurchasePriceList,
  updateCollectionPrice,
  getDefaultPurchasePriceList,
  addToPurchaseCart,
  getPurchaseCart,
  updatePurchaseCartItem,
  removePurchaseCartItem,
  purchaseFromCart,
  getAllPurchases,
  getPurchaseDetail,
  getSupplierPurchaseSummary,
  getPurchaseStatistics
} from '../controllers/purchasePriceListController';
import { authMiddleware } from '../auth/auth-middleware';

const router = Router();

// Tüm route'lar auth middleware ile korunmuş
router.use(authMiddleware);

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
router.delete('/purchase-price-lists/:id', deactivatePurchasePriceList);

// Koleksiyon fiyat güncelleme
router.put('/purchase-price-lists/:listId/collections/:collectionId', updateCollectionPrice);

// Alım sepeti route'ları
router.post('/suppliers/:supplier_id/purchase-cart/items', addToPurchaseCart); // Sepete ürün ekle
router.get('/suppliers/:supplier_id/purchase-cart', getPurchaseCart); // Sepeti getir
router.put('/suppliers/:supplier_id/purchase-cart/items/:item_id', updatePurchaseCartItem); // Sepet öğesini güncelle
router.delete('/suppliers/:supplier_id/purchase-cart/items/:item_id', removePurchaseCartItem); // Sepet öğesini sil
router.put('/suppliers/:supplier_id/purchase-from-cart', purchaseFromCart); // Sepetten satın alma işlemii

// Satın alım geçmişi ve raporlama route'ları
router.get('/purchases', getAllPurchases); // Tüm satın alımları listele (filtreleme ve pagination ile)
router.get('/purchases/:transaction_id', getPurchaseDetail); // Belirli bir satın alımın detayını getir
router.get('/suppliers/:supplier_id/purchase-summary', getSupplierPurchaseSummary); // Satıcı bazında satın alım özeti
router.get('/statistics/purchases', getPurchaseStatistics); // Dashboard için satın alım istatistiklerii

export default router;
