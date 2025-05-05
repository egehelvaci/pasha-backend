import express from 'express'
import { AuthController } from './auth-controller'

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

export default router 