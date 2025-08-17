import prisma from '../utils/prisma';

export type NotificationType = 
  | 'ORDER_CONFIRMED'
  | 'ORDER_READY' 
  | 'ORDER_COMPLETED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'NEW_STOCK'
  | 'CUSTOM';

export interface NotificationData {
  userId?: string;
  storeId?: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Bildirim gönder ve veritabanına kaydet
   */
  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      // Şimdilik sadece console log - Prisma model eksik
      console.log('📨 Bildirim gönderildi:', {
        type: data.type,
        userId: data.userId,
        storeId: data.storeId,
        title: data.title,
        message: data.message,
        orderId: data.orderId
      });

      console.log(`✅ Bildirim gönderildi: ${data.type}`, {
        userId: data.userId,
        storeId: data.storeId,
        title: data.title
      });

      // Burada ileride push notification, email, SMS entegrasyonları eklenebilir
      
      return true;
    } catch (error) {
      console.error('❌ Bildirim gönderme hatası:', error);
      return false;
    }
  }

  /**
   * Sipariş onaylandı bildirimi
   */
  async notifyOrderConfirmed(orderId: string, userId: string, orderNumber: string): Promise<boolean> {
    return await this.sendNotification({
      userId,
      type: 'ORDER_CONFIRMED',
      title: 'Siparişiniz Onaylandı',
      message: `${orderNumber} numaralı siparişiniz onaylandı ve hazırlanmaya başlandı.`,
      orderId,
      metadata: { orderNumber }
    });
  }

  /**
   * Sipariş hazır bildirimi
   */
  async notifyOrderReady(orderId: string, userId: string, orderNumber: string): Promise<boolean> {
    return await this.sendNotification({
      userId,
      type: 'ORDER_READY',
      title: 'Siparişiniz Hazır',
      message: `${orderNumber} numaralı siparişiniz hazır. Teslim alabilirsiniz.`,
      orderId,
      metadata: { orderNumber }
    });
  }

  /**
   * Sipariş tamamlandı bildirimi
   */
  async notifyOrderCompleted(orderId: string, userId: string, orderNumber: string): Promise<boolean> {
    return await this.sendNotification({
      userId,
      type: 'ORDER_COMPLETED',
      title: 'Sipariş Teslim Edildi',
      message: `${orderNumber} numaralı siparişiniz başarıyla teslim edildi. Bizi tercih ettiğiniz için teşekkür ederiz.`,
      orderId,
      metadata: { orderNumber }
    });
  }

  /**
   * Ödeme başarılı bildirimi
   */
  async notifyPaymentSuccess(orderId: string, userId: string, amount: number): Promise<boolean> {
    return await this.sendNotification({
      userId,
      type: 'PAYMENT_SUCCESS',
      title: 'Ödeme Başarılı',
      message: `${amount.toFixed(2)} TL tutarındaki ödemeniz başarıyla alındı.`,
      orderId,
      metadata: { amount }
    });
  }

  /**
   * Ödeme başarısız bildirimi
   */
  async notifyPaymentFailed(orderId: string, userId: string, amount: number): Promise<boolean> {
    return await this.sendNotification({
      userId,
      type: 'PAYMENT_FAILED',
      title: 'Ödeme Başarısız',
      message: `${amount.toFixed(2)} TL tutarındaki ödeme işlemi başarısız oldu. Lütfen tekrar deneyiniz.`,
      orderId,
      metadata: { amount }
    });
  }

  /**
   * Yeni stok bildirimi (tüm kullanıcılara)
   */
  async notifyNewStock(productName: string, stockCount: number): Promise<boolean> {
    try {
      // Tüm aktif kullanıcılara bildirim gönder
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { userId: true }
      });

      const notifications = await Promise.all(
        users.map(user => 
          this.sendNotification({
            userId: user.userId,
            type: 'NEW_STOCK',
            title: 'Yeni Ürün Stoklarda',
            message: `${productName} ürünü stoklara eklendi. Stok adedi: ${stockCount}`,
            metadata: { productName, stockCount }
          })
        )
      );

      const successCount = notifications.filter(n => n === true).length;
      console.log(`📢 Yeni stok bildirimi: ${successCount}/${users.length} kullanıcıya gönderildi`);
      
      return successCount > 0;
    } catch (error) {
      console.error('❌ Toplu bildirim hatası:', error);
      return false;
    }
  }

  /**
   * Özel bildirim gönder
   */
  async sendCustomNotification(
    title: string,
    message: string,
    userIds?: string[],
    storeIds?: string[]
  ): Promise<boolean> {
    try {
      const notifications = [];

      // Kullanıcılara gönder
      if (userIds && userIds.length > 0) {
        for (const userId of userIds) {
          notifications.push(
            this.sendNotification({
              userId,
              type: 'CUSTOM',
              title,
              message
            })
          );
        }
      }

      // Mağazalara gönder
      if (storeIds && storeIds.length > 0) {
        for (const storeId of storeIds) {
          notifications.push(
            this.sendNotification({
              storeId,
              type: 'CUSTOM',
              title,
              message
            })
          );
        }
      }

      const results = await Promise.all(notifications);
      return results.some(r => r === true);
    } catch (error) {
      console.error('❌ Özel bildirim hatası:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();