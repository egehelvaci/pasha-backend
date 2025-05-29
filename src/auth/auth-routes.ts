import express from 'express'
import { AuthController } from './auth-controller'
import passwordResetRoutes from './password-reset-routes'

const router = express.Router()
const authController = new AuthController()

// Login route
router.post('/login', function(req, res) {
  return authController.login(req, res)
})

// Logout route
router.post('/logout', function(req, res) {
  return authController.logout(req, res)
})

// Şifre sıfırlama route'larını ekle
router.use('/', passwordResetRoutes)

export default router 