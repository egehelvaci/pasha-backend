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
      const { 
        page = 1, 
        limit = 20, 
        unreadOnly = false, 
        type, 
        startDate, 
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Validasyon
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit))); // Max 100 limit
      const skip = (pageNum - 1) * limitNum;

      const where: any = { userId };

      // Filtreler
      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      if (type && typeof type === 'string') {
        where.type = type;
      }

      // Tarih filtreleri
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate as string);
        }
      }

      // Sıralama
      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder as 'asc' | 'desc';

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.inAppNotification.findMany({
          where,
          orderBy,
          skip,
          take: limitNum
        }),
        prisma.inAppNotification.count({ where }),
        prisma.inAppNotification.count({ 
          where: { userId, isRead: false } 
        })
      ]);

      return res.json({
        success: true,
        data: notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasMore: skip + limitNum < total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        },
        summary: {
          unreadCount,
          totalCount: total,
          currentPageCount: notifications.length
        },
        filters: {
          unreadOnly: unreadOnly === 'true',
          type: type || null,
          startDate: startDate || null,
          endDate: endDate || null,
          sortBy,
          sortOrder
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

  /**
   * Tüm bildirimleri getir (Admin için)
   */
  async getAllNotifications(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        type, 
        userId,
        startDate, 
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Validasyon
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit))); // Max 100 limit
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      // Filtreler
      if (type && typeof type === 'string') {
        where.type = type;
      }

      if (userId && typeof userId === 'string') {
        where.userId = userId;
      }

      // Tarih filtreleri
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate as string);
        }
      }

      // Sıralama
      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder as 'asc' | 'desc';

      const [notifications, total] = await Promise.all([
        prisma.inAppNotification.findMany({
          where,
          orderBy,
          skip,
          take: limitNum,
          include: {
            user: {
              select: {
                name: true,
                surname: true,
                username: true
              }
            }
          }
        }),
        prisma.inAppNotification.count({ where })
      ]);

      // Tip bazında istatistikler
      const typeStats = await prisma.inAppNotification.groupBy({
        by: ['type'],
        where,
        _count: {
          type: true
        }
      });

      return res.json({
        success: true,
        data: notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasMore: skip + limitNum < total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        },
        statistics: {
          totalCount: total,
          currentPageCount: notifications.length,
          typeBreakdown: typeStats.reduce((acc: any, stat) => {
            acc[stat.type] = stat._count.type;
            return acc;
          }, {})
        },
        filters: {
          type: type || null,
          userId: userId || null,
          startDate: startDate || null,
          endDate: endDate || null,
          sortBy,
          sortOrder
        }
      });

    } catch (error) {
      console.error('❌ Tüm bildirim listeleme hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  }
}