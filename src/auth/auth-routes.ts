import { Router } from 'express'
import { AuthController } from './auth-controller'

const router = Router()
const authController = new AuthController()

// Login route
router.post('/login', authController.login)

export default router 