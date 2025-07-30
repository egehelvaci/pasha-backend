import express from 'express'
import { EmployeeAssignmentController } from '../controllers/employeeAssignmentController'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'

const router = express.Router()
const employeeAssignmentController = new EmployeeAssignmentController()

// Tüm employee'leri getir
router.get('/employees', 
  authMiddleware, 
  authorizeRoles('admin', 'editor'), 
  employeeAssignmentController.getAllEmployees
)

// Sipariş için employee ata
router.post('/assign', 
  authMiddleware, 
  authorizeRoles('admin', 'editor'), 
  employeeAssignmentController.assignEmployeeToOrder
)

// Employee istatistiklerini getir
router.get('/stats/:employeeId?', 
  authMiddleware, 
  authorizeRoles('admin', 'editor'), 
  employeeAssignmentController.getEmployeeStats
)

// Sipariş için atanmış employee'yi getir
router.get('/order/:orderId', 
  authMiddleware, 
  authorizeRoles('admin', 'editor'), 
  employeeAssignmentController.getAssignedEmployeeForOrder
)

export default router 