import express from 'express'
import path from 'path'
import { EmployeeAssignmentController } from '../controllers/employeeAssignmentController'

const router = express.Router()
const employeeAssignmentController = new EmployeeAssignmentController()

// Employee atama HTML sayfasını göster
router.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/employee-assignment.html'))
})

// Sipariş için employee ata
router.post('/assign', employeeAssignmentController.assignEmployeeToOrder)

export default router 