import { Router } from 'express'
import { authMiddleware } from '../auth/auth-middleware'
import { usdMuhasebeController } from '../admin/usd-muhasebe-controller'

const router = Router()

// USD Muhasebe hareketleri routes
router.get(
  '/hareketler',
  authMiddleware,
  usdMuhasebeController.getAllUsdMuhasebeHareketleri
)

router.get(
  '/store/:storeId',
  authMiddleware,
  usdMuhasebeController.getUsdMuhasebeHareketleriByStore
)

router.post(
  '/hareketler',
  authMiddleware,
  usdMuhasebeController.createUsdMuhasebeHareketi
)

router.get(
  '/income-types',
  authMiddleware,
  usdMuhasebeController.getUsdIncomeTypes
)

router.get(
  '/expense-types',
  authMiddleware,
  usdMuhasebeController.getUsdExpenseTypes
)

export default router
