import { Request, Response } from 'express';
import { notificationService } from '../services/notification-service';
import prisma from '../utils/prisma';

export class NotificationController {
  /**
   * Tek bildirim API - tüm bildirimler buradan gönderilir
   */
  async sendNotification(req: Request, res: Response) {
    try {
      const { type, userId, storeId, title, message, orderId, metadata } = req.body;

      // Validasyon
      if (!type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: 'type, title ve message alanları zorunludur'
        });
      }

      // Bildirim gönder
      const result = await notificationService.sendNotification({
        type,
        userId,
        storeId,
        title,
        message,
        orderId,
        metadata
      });

      if (result) {
        return res.json({
          success: true,
          message: 'Bildirim başarıyla gönderildi'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Bildirim gönderilemedi'
        });
      }

    } catch (error) {
      console.error('❌ Bildirim API hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  }

  /**
   * Kullanıcının bildirimlerini getir
   */
  async getUserNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = { userId };

      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      const [notifications, total] = await Promise.all([
        prisma.inAppNotification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.inAppNotification.count({ where })
      ]);

      return res.json({
        success: true,
        data: notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('❌ Bildirim listeleme hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  }

  /**
   * Bildirimi okundu olarak işaretle
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;

      const notification = await prisma.inAppNotification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });

      return res.json({
        success: true,
        message: 'Bildirim okundu olarak işaretlendi',
        data: notification
      });

    } catch (error) {
      console.error('❌ Bildirim güncelleme hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  }

  /**
   * Tüm bildirimleri okundu olarak işaretle
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await prisma.inAppNotification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: { isRead: true }
      });

      return res.json({
        success: true,
        message: `${result.count} bildirim okundu olarak işaretlendi`
      });

    } catch (error) {
      console.error('❌ Toplu güncelleme hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  }

  /**
   * Okunmamış bildirim sayısını getir
   */
  async getUnreadCount(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const count = await prisma.inAppNotification.count({
        where: {
          userId,
          isRead: false
        }
      });

      return res.json({
        success: true,
        data: { unreadCount: count }
      });

    } catch (error) {
      console.error('❌ Okunmamış sayı hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  }
}