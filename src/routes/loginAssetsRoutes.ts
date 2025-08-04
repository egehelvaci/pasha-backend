import { Router } from 'express';
import { LoginAssetsController } from '../controllers/loginAssetsController';

const router = Router();
const loginAssetsController = new LoginAssetsController();

/**
 * @route GET /api/login-assets/random
 * @desc 4 görselden rastgele birini döndür
 * @access Public
 */
router.get('/random', loginAssetsController.getRandomCarpetStoreImage.bind(loginAssetsController));

export default router;