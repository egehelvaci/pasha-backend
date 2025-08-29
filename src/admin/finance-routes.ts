import { Router } from 'express';
import { financeController } from './finance-controller';
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware';

const router = Router();

// Tüm finance rotaları authentication ve admin yetkisi gerektirir
router.use(authMiddleware);
router.use(authorizeRoles('admin', 'editor'));

// Muhasebe hareketleri (döviz desteği ile)
router.get('/transactions', financeController.getTransactions);

// Sipariş özeti (döviz bazlı)
router.get('/orders-summary', financeController.getOrdersSummary);

// Döviz kurları
router.get('/exchange-rates', financeController.getExchangeRates);

// Döviz çevrimi
router.post('/convert', financeController.convertCurrency);

// YENI - Currency analizi
router.get('/currency-analysis', financeController.getCurrencyAnalysis);

export default router;