import { Router } from 'express';
import { LoginAssetsController } from '../controllers/loginAssetsController';

const router = Router();
const loginAssetsController = new LoginAssetsController();

/**
 * @route GET /api/login-assets/random
 * @desc Rastgele halı mağazası görseli döndür
 * @access Public
 */
router.get('/random', loginAssetsController.getRandomCarpetStoreImage.bind(loginAssetsController));

/**
 * @route GET /api/login-assets/multiple
 * @desc Birden fazla rastgele görsel döndür
 * @query count - Döndürülecek görsel sayısı (varsayılan: 5, maksimum: 10)
 * @access Public
 */
router.get('/multiple', loginAssetsController.getMultipleRandomImages.bind(loginAssetsController));

/**
 * @route GET /api/login-assets/all
 * @desc Tüm mevcut görselleri listele (admin için)
 * @access Public
 */
router.get('/all', loginAssetsController.getAllImages.bind(loginAssetsController));

/**
 * @route GET /api/login-assets/health
 * @desc Servis sağlık kontrolü
 * @access Public
 */
router.get('/health', loginAssetsController.healthCheck.bind(loginAssetsController));

export default router;