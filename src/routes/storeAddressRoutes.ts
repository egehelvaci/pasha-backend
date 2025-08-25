import express from 'express'
import { storeAddressController } from '../controllers/storeAddressController'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'

const router = express.Router()

// Tüm rotalar için authentication gerekli
router.use(authMiddleware)

// Mağaza adres yönetimi rotaları - Viewer, Editör ve Admin erişimi
router.use(authorizeRoles('admin', 'editor', 'viewer'))

/**
 * Mağaza adreslerini listele
 * GET /api/store-addresses
 * Query params (admin için): ?storeId=xxx
 */
router.get('/', storeAddressController.getStoreAddresses)

/**
 * Yeni mağaza adresi oluştur
 * POST /api/store-addresses
 * Body: {
 *   title: string (zorunlu) - "Ana Mağaza", "Depo", vs.
 *   address: string (zorunlu) - Tam adres
 *   city?: string - Şehir
 *   district?: string - İlçe  
 *   postal_code?: string - Posta kodu
 *   is_default?: boolean - Varsayılan adres mi
 *   store_id?: string - (Sadece admin için)
 * }
 */
router.post('/', storeAddressController.createStoreAddress)

/**
 * Mağaza adresini güncelle
 * PUT /api/store-addresses/:addressId
 * Body: {
 *   title?: string,
 *   address?: string,
 *   city?: string,
 *   district?: string,
 *   postal_code?: string,
 *   is_default?: boolean,
 *   is_active?: boolean
 * }
 */
router.put('/:addressId', storeAddressController.updateStoreAddress)

/**
 * Varsayılan adresi değiştir
 * PUT /api/store-addresses/:addressId/set-default
 */
router.put('/:addressId/set-default', storeAddressController.setDefaultAddress)

/**
 * Mağaza adresini sil (soft delete)
 * DELETE /api/store-addresses/:addressId
 */
router.delete('/:addressId', storeAddressController.deleteStoreAddress)

export default router