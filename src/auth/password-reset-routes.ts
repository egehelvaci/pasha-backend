import { Router } from 'express'
import { passwordResetController } from './password-reset-controller'
import { authMiddleware } from './auth-middleware'

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

/**
 * Süresi dolmuş token'ları temizle (Admin endpoint)
 * DELETE /api/auth/cleanup-tokens
 * Requires authentication
 */
router.delete('/cleanup-tokens', authMiddleware, passwordResetController.cleanupExpiredTokens)

export default router 