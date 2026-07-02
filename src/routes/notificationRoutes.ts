import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authMiddleware, authorizeRoles } from '../auth/auth-middleware';

const router = Router();
const notificationController = new NotificationController();

// Ana bildirim endpoint'i (sadece admin/editor manuel bildirim gönderebilir;
// sistem bildirimleri notificationService üzerinden dahili olarak oluşturulur)
router.post('/send', authMiddleware, authorizeRoles('admin', 'editor'), notificationController.sendNotification.bind(notificationController));

// User endpoints (auth gerektirir)
router.get('/user/:userId', authMiddleware, notificationController.getUserNotifications.bind(notificationController));
router.get('/user/:userId/unread-count', authMiddleware, notificationController.getUnreadCount.bind(notificationController));
router.put('/read/:notificationId', authMiddleware, notificationController.markAsRead.bind(notificationController));
router.put('/read-all/:userId', authMiddleware, notificationController.markAllAsRead.bind(notificationController));

// Admin endpoints
router.get('/all', authMiddleware, authorizeRoles('admin', 'editor'), notificationController.getAllNotifications.bind(notificationController));

export default router;