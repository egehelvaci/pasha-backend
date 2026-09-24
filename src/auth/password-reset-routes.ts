import { Router } from 'express'
import { passwordResetController } from './password-reset-controller'

const router = Router()

/**
 * Şifre sıfırlama talebi
 * POST /api/auth/forgot-password
 * Body: { email: string }
 */
router.post('/forgot-password', passwordResetController.requestPasswordReset)

/**
 * Token doğrulama
 * GET /api/auth/validate-reset-token/:token
 */
router.get('/validate-reset-token/:token', passwordResetController.validateResetToken)

/**
 * Şifre sıfırlama
 * POST /api/auth/reset-password
 * Body: { token: string, newPassword: string, confirmPassword: string }
 */
router.post('/reset-password', passwordResetController.resetPassword)

export default router 