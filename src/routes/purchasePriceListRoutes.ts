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
  getDefaultPurchasePriceList
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

export default router;
