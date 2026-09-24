import { Router } from 'express';
import { OrderStatus, Prisma } from '../../generated/prisma';
import { authorizeRoles } from '../auth/auth-middleware';
import prisma from '../utils/prisma';

const router = Router();
router.use(authorizeRoles('admin', 'editor'));
const statuses = Object.values(OrderStatus);

function positiveInteger(value: unknown, fallback: number): number | null {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

router.get('/statuses', async (_req, res) => {
  try {
    const counts = await prisma.order.groupBy({ by: ['status'], _count: { id: true } });
    return res.json({ success: true, data: statuses.map(status => ({
      status, count: counts.find(row => row.status === status)?._count.id || 0
    })) });
  } catch (error) {
    console.error('Order status list v2 failed:', error);
    return res.status(500).json({ success: false, message: 'Sipariş durumları getirilemedi' });
  }
});

router.get('/', async (req, res) => {
  const { status, userId } = req.query;
  const page = positiveInteger(req.query.page, 1);
  const limit = positiveInteger(req.query.limit, 20);
  if (typeof status !== 'string' || !statuses.includes(status as OrderStatus)) {
    return res.status(400).json({ success: false, message: 'Geçerli bir status zorunludur', allowedStatuses: statuses });
  }
  if (page === null || limit === null || limit > 100 || !Number.isSafeInteger((page - 1) * limit) || (page - 1) * limit > 2147483647) {
    return res.status(400).json({ success: false, message: 'page pozitif tam sayı, limit 1–100 arasında olmalıdır' });
  }
  if (userId !== undefined && (typeof userId !== 'string' || !userId.trim())) {
    return res.status(400).json({ success: false, message: 'Geçerli bir userId giriniz' });
  }
  try {
    const where: Prisma.OrderWhereInput = { status: status as OrderStatus, ...(userId ? { user_id: userId as string } : {}) };
    const [orders, totalCount] = await prisma.$transaction([
      prisma.order.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        include: {
          user: { select: {
            userId: true, name: true, surname: true, username: true, email: true,
            phoneNumber: true, store_id: true, userType: true, Store: true
          } },
          items: { include: { product: true } },
          qr_codes: { include: { order_item: { include: { product: true } }, product: true } },
          barcodes: {
            include: { order_item: { include: { product: true } }, product: true },
            orderBy: { created_at: 'asc' }
          },
          address: true
        }
      }),
      prisma.order.count({ where })
    ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
    const totalPages = Math.ceil(totalCount / limit);
    const storeTypes: Record<string, string> = { KARGO: 'Kargo', SERVIS: 'Servis', KENDI_ALAN: 'Kendi Alan', AMBAR: 'Ambar' };
    return res.json({ success: true, data: {
      orders: orders.map(order => ({
        ...order,
        items: order.items.map(item => ({ ...item, cut_type: item.cut_type === 'rectangle' ? 'standart' : item.cut_type })),
        store_info: order.user.Store ? {
          store_id: order.user.Store.store_id,
          kurum_adi: order.user.Store.kurum_adi,
          store_type: order.user.Store.store_type || 'KARGO',
          store_type_display: storeTypes[order.user.Store.store_type || 'KARGO'] || 'Kargo',
          currency: order.user.Store.currency || 'TRY',
          is_active: order.user.Store.is_active,
          telefon: order.user.Store.telefon,
          eposta: order.user.Store.eposta
        } : null
      })),
      filters: { status, userId: userId || null },
      pagination: { page, limit, totalCount, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
    } });
  } catch (error) {
    console.error('Order list v2 failed:', error);
    return res.status(500).json({ success: false, message: 'Siparişler getirilemedi' });
  }
});

export default router;
