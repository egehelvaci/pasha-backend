import { Router } from 'express';
import { authMiddleware } from '../auth/auth-middleware';
import { NotificationController } from '../controllers/notificationController';

const router = Router();
const notificationController = new NotificationController();

// User endpoints (auth gerektirir)
router.get('/user/:userId', authMiddleware, notificationController.getUserNotifications.bind(notificationController));
router.get('/user/:userId/unread-count', authMiddleware, notificationController.getUnreadCount.bind(notificationController));
router.put('/read/:notificationId', authMiddleware, notificationController.markAsRead.bind(notificationController));
router.put('/read-all/:userId', authMiddleware, notificationController.markAllAsRead.bind(notificationController));

export default router;