import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authMiddleware } from '../auth/auth-middleware';

const router = Router();
const notificationController = new NotificationController();

// Ana bildirim endpoint'i (internal use - auth gerektirmez)
router.post('/send', notificationController.sendNotification.bind(notificationController));

// User endpoints (auth gerektirir)
router.get('/user/:userId', authMiddleware, notificationController.getUserNotifications.bind(notificationController));
router.get('/user/:userId/unread-count', authMiddleware, notificationController.getUnreadCount.bind(notificationController));
router.put('/read/:notificationId', authMiddleware, notificationController.markAsRead.bind(notificationController));
router.put('/read-all/:userId', authMiddleware, notificationController.markAllAsRead.bind(notificationController));

// Admin endpoints (auth gerektirir)
router.get('/all', authMiddleware, notificationController.getAllNotifications.bind(notificationController));

export default router;