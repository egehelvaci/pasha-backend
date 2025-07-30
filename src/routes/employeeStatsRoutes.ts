import express from 'express'
import { EmployeeStatsController } from '../controllers/employeeStatsController'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'

const router = express.Router()
const employeeStatsController = new EmployeeStatsController()

// Belirli bir çalışanın istatistiklerini getir
router.get('/:employeeId', 
  authMiddleware, 
  authorizeRoles('admin', 'editor'), 
  employeeStatsController.getEmployeeStats
)

export default router 