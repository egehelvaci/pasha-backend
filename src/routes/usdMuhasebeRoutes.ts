import { Router } from 'express'
import { authenticateJWT } from '../middlewares/authMiddleware'
import { usdMuhasebeController } from '../admin/usd-muhasebe-controller'

const router = Router()

// USD Muhasebe hareketleri routes
router.get(
  '/hareketler',
  authenticateJWT,
  usdMuhasebeController.getAllUsdMuhasebeHareketleri
)

router.get(
  '/store/:storeId',
  authenticateJWT,
  usdMuhasebeController.getUsdMuhasebeHareketleriByStore
)

router.post(
  '/hareketler',
  authenticateJWT,
  usdMuhasebeController.createUsdMuhasebeHareketi
)

router.get(
  '/income-types',
  authenticateJWT,
  usdMuhasebeController.getUsdIncomeTypes
)

router.get(
  '/expense-types',
  authenticateJWT,
  usdMuhasebeController.getUsdExpenseTypes
)

export default router
