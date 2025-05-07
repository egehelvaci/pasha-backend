import express from 'express'
import { AdminController } from './admin-controller'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'

const router = express.Router()
const adminController = new AdminController()

// Tüm admin rotaları için önce kimlik doğrulama ve yetkilendirme gerekiyor
router.use(authMiddleware)
router.use(authorizeRoles('admin'))

// Kullanıcıları listeleme
router.get('/users', adminController.getAllUsers)

// Belirli bir kullanıcıyı getirme
router.get('/users/:userId', adminController.getUserById)

// Yeni kullanıcı oluşturma
router.post('/users', adminController.createUser)

// Kullanıcı bilgilerini güncelleme
router.put('/users/:userId', adminController.updateUser)

// Kullanıcı silme
router.delete('/users/:userId', adminController.deleteUser)

export default router 