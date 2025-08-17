import prisma from '../utils/prisma';

export type NotificationType = 
  | 'ORDER_CONFIRMED'
  | 'ORDER_READY' 
  | 'ORDER_SHIPPED'
  | 'ORDER_CANCELED'
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
      // Bildirim geçmişini kaydet
      await prisma.notificationHistory.create({
        data: {
          userId: data.userId,
          storeId: data.storeId,
          type: data.type,
          title: data.title,
          message: data.message,
          orderId: data.orderId,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          sentAt: new Date()
        }
      });

      // In-app notification oluştur (kullanıcı için)
      if (data.userId) {
        await prisma.inAppNotification.create({
          data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            orderId: data.orderId,
            metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            isRead: false,
            createdAt: new Date()
          }
        });
      }

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
   * Sipariş kargoya verildi bildirimi
   */
  async notifyOrderShipped(orderId: string, userId: string, orderNumber: string): Promise<boolean> {
    return await this.sendNotification({
      userId,
      type: 'ORDER_SHIPPED',
      title: 'Siparişiniz Kargoya Verildi',
      message: `${orderNumber} numaralı siparişiniz kargoya verildi ve size doğru yola çıktı.`,
      orderId,
      metadata: { orderNumber }
    });
  }

  /**
   * Sipariş iptal edildi bildirimi
   */
  async notifyOrderCanceled(orderId: string, userId: string, orderNumber: string, cancelReason?: string): Promise<boolean> {
    const message = cancelReason 
      ? `${orderNumber} numaralı siparişiniz iptal edildi. Sebep: ${cancelReason}`
      : `${orderNumber} numaralı siparişiniz iptal edildi.`;
      
    return await this.sendNotification({
      userId,
      type: 'ORDER_CANCELED',
      title: 'Siparişiniz İptal Edildi',
      message,
      orderId,
      metadata: { orderNumber, cancelReason }
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
   * Admin'e ödeme bildirimi (başarılı/başarısız)
   */
  async notifyPaymentToAdmin(isSuccess: boolean, customerName: string, amount: number, storeId: string): Promise<boolean> {
    try {
      // Admin kullanıcıları bul
      const adminUsers = await prisma.user.findMany({
        where: { 
          isActive: true,
          userType: { name: 'admin' }
        },
        select: { userId: true }
      });

      const title = isSuccess ? 'Ödeme Başarılı' : 'Ödeme Başarısız';
      const message = isSuccess 
        ? `${customerName} kullanıcısı ${amount.toFixed(2)} TL tutarında ödeme yaptı.`
        : `${customerName} kullanıcısının ${amount.toFixed(2)} TL tutarındaki ödemesi başarısız oldu.`;

      const notifications = await Promise.all(
        adminUsers.map(admin => 
          this.sendNotification({
            userId: admin.userId,
            type: isSuccess ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
            title,
            message,
            metadata: { customerName, amount, storeId, isSuccess }
          })
        )
      );

      const successCount = notifications.filter(n => n === true).length;
      console.log(`📢 ${isSuccess ? 'Başarılı' : 'Başarısız'} ödeme bildirimi: ${successCount}/${adminUsers.length} admin'e gönderildi`);
      
      return successCount > 0;
    } catch (error) {
      console.error('❌ Admin ödeme bildirim hatası:', error);
      return false;
    }
  }

  /**
   * Yeni stok bildirimi (tüm kullanıcılara)
   */
  async notifyNewStock(productName: string, stockCount: number, stockType: 'adet' | 'm2' = 'adet'): Promise<boolean> {
    try {
      // Tüm aktif kullanıcılara bildirim gönder
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { userId: true }
      });

      const stockMessage = stockType === 'm2' 
        ? `${stockCount}m² stok eklendi`
        : `Stok adedi: ${stockCount}`;

      const notifications = await Promise.all(
        users.map(user => 
          this.sendNotification({
            userId: user.userId,
            type: 'NEW_STOCK',
            title: 'Yeni Ürün Stoklarda',
            message: `${productName} ürünü stoklara eklendi. ${stockMessage}`,
            metadata: { productName, stockCount, stockType }
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
   * Yeni sipariş bildirimi (admin'e)
   */
  async notifyNewOrder(orderId: string, userId: string, orderTotal: number, customerName: string): Promise<boolean> {
    try {
      // Admin kullanıcıları bul
      const adminUsers = await prisma.user.findMany({
        where: { 
          isActive: true,
          userType: { name: 'admin' }
        },
        select: { userId: true }
      });

      const notifications = await Promise.all(
        adminUsers.map(admin => 
          this.sendNotification({
            userId: admin.userId,
            type: 'NEW_STOCK', // Şimdilik NEW_STOCK kullanıyoruz, ORDER_NEW eklenebilir
            title: 'Yeni Sipariş',
            message: `${customerName} kullanıcısı ${orderTotal.toFixed(2)} TL tutarında yeni sipariş verdi.`,
            orderId,
            metadata: { orderId, userId, orderTotal, customerName }
          })
        )
      );

      const successCount = notifications.filter(n => n === true).length;
      console.log(`📢 Yeni sipariş bildirimi: ${successCount}/${adminUsers.length} admin'e gönderildi`);
      
      return successCount > 0;
    } catch (error) {
      console.error('❌ Yeni sipariş bildirim hatası:', error);
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