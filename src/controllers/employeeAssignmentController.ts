import { Request, Response } from 'express'
import { EmployeeAssignmentService } from '../services/employee-assignment-service'

const employeeAssignmentService = new EmployeeAssignmentService()

export class EmployeeAssignmentController {

  /**
   * Sipariş için employee ata
   */
  async assignEmployeeToOrder(req: Request, res: Response) {
    try {
      const { orderId, employeeId } = req.body

      if (!orderId || !employeeId) {
        return res.status(400).json({
          success: false,
          message: 'orderId ve employeeId gerekli'
        })
      }

      const result = await employeeAssignmentService.assignEmployeeToOrder(orderId, employeeId)
      
      res.json({
        success: true,
        message: result.message,
        data: result.assignment
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }
} 