import { Router } from 'express'
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware'
import { usdMuhasebeController } from '../admin/usd-muhasebe-controller'

const router = Router()

// Tüm USD muhasebe rotaları admin/editor yetkisi gerektirir
router.use(authMiddleware)
router.use(authorizeRoles('admin', 'editor'))

// USD Muhasebe hareketleri routes
router.get('/hareketler', usdMuhasebeController.getAllUsdMuhasebeHareketleri)

router.get('/store/:storeId', usdMuhasebeController.getUsdMuhasebeHareketleriByStore)

router.post('/hareketler', usdMuhasebeController.createUsdMuhasebeHareketi)

router.get('/income-types', usdMuhasebeController.getUsdIncomeTypes)

router.get('/expense-types', usdMuhasebeController.getUsdExpenseTypes)

export default router
