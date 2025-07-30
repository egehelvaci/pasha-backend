import { Request, Response } from 'express'
import { EmployeeAssignmentService } from '../services/employee-assignment-service'

const employeeAssignmentService = new EmployeeAssignmentService()

export class EmployeeAssignmentController {
  /**
   * Tüm employee'leri getir
   */
  async getAllEmployees(req: Request, res: Response) {
    try {
      const result = await employeeAssignmentService.getAllEmployees()
      
      res.json({
        success: true,
        data: result.employees
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

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

  /**
   * Employee istatistiklerini getir
   */
  async getEmployeeStats(req: Request, res: Response) {
    try {
      const { employeeId } = req.params

      const result = await employeeAssignmentService.getEmployeeStats(employeeId || undefined)
      
      res.json({
        success: true,
        data: {
          stats: result.stats,
          totalStats: result.totalStats
        }
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

  /**
   * Sipariş için atanmış employee'yi getir
   */
  async getAssignedEmployeeForOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'orderId gerekli'
        })
      }

      const result = await employeeAssignmentService.getAssignedEmployeeForOrder(orderId)
      
      res.json({
        success: true,
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