import express from 'express'
import { userProfileController } from '../controllers/userProfileController'
import { verifyToken } from '../middleware/authMiddleware'

const router = express.Router()

// Tüm rotalar için authentication gerekli
router.use(verifyToken)

/**
 * Kullanıcının kendi profil bilgilerini getir
 * GET /api/profile/me
 */
router.get('/me', userProfileController.getMyProfile)

/**
 * Kullanıcının mağaza bilgilerini güncelle
 * PUT /api/profile/store
 * Body: {
 *   kurum_adi: string (zorunlu),
 *   vergi_numarasi?: string,
 *   vergi_dairesi?: string,
 *   yetkili_adi?: string,
 *   yetkili_soyadi?: string,
 *   telefon?: string,
 *   eposta?: string,
 *   adres?: string,
 *   faks_numarasi?: string
 * }
 */
router.put('/store', userProfileController.updateStoreProfile)

/**
 * Kullanıcının şifresini değiştir
 * PUT /api/profile/change-password
 * Body: {
 *   currentPassword: string (zorunlu),
 *   newPassword: string (zorunlu, min 6 karakter),
 *   confirmPassword: string (zorunlu)
 * }
 */
router.put('/change-password', userProfileController.changePassword)

export default router 