import { PrismaClient } from '../../generated/prisma';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface DbyeWebhookData {
  NotificationId: string;
  TransactionType: number; // 1: Satış
  TransactionState: number; // 1: Başarısız, 2: İptal, 3: Başarılı
  PaymentAmount: number;
  OrderNumber: string; // Bu bizim sellerReference'ımız olacak
  PaymentDate: string;
  CardNumber?: string;
  ApprovalCode?: string;
  Hash: string;
  HashParameters: string;
}

export class WebhookService {
  
  // Admin store kontrolü - Database'den kontrol et
  private async isAdminStore(store: any): Promise<boolean> {
    try {
      const adminConfig = await prisma.adminStoreConfig.findUnique({
        where: {
          storeId: store.store_id
        }
      });
      
      // AdminStoreConfig tablosunda kayıt varsa ve isAdminStore true ise
      return adminConfig?.isAdminStore === true;
      
    } catch (error) {
      console.error('❌ Admin store kontrolü hatası:', error);
      return false;
    }
  }
  
  // Hash doğrulaması - Database'den secret key al
  private async validateHash(data: DbyeWebhookData): Promise<boolean> {
    try {
      // Database'den DBYE konfigürasyonunu al
      const dbyeConfig = await prisma.dbyeConfig.findUnique({
        where: { id: 1 }
      });
      
      if (!dbyeConfig || !dbyeConfig.isActive) {
        console.error('❌ DBYE konfigürasyonu bulunamadı veya aktif değil:', {
          configExists: !!dbyeConfig,
          isActive: dbyeConfig?.isActive,
          orderNumber: data.OrderNumber
        });
        return false;
      }
      
      // Hash parametrelerini al
      const hashParams = data.HashParameters.split('|');
      
      // Değerleri birleştir
      let hashString = '';
      hashParams.forEach(param => {
        switch(param.trim()) {
          case 'OrderNumber':
            hashString += data.OrderNumber + '|';
            break;
          case 'PaymentAmount':
            hashString += data.PaymentAmount.toString() + '|';
            break;
          case 'TransactionState':
            hashString += data.TransactionState.toString() + '|';
            break;
          case 'NotificationId':
            hashString += data.NotificationId + '|';
            break;
          case 'PaymentDate':
            hashString += data.PaymentDate + '|';
            break;
        }
      });
      
      // Son pipe'ı kaldır
      hashString = hashString.slice(0, -1);
      
      // Database'den alınan secret key ile hash oluştur
      const calculatedHash = crypto
        .createHmac('sha512', dbyeConfig.webhookSecret)
        .update(hashString)
        .digest('hex');
      
      // Debug bilgisi ekle
      console.log('🔍 Hash doğrulama detayları:', {
        webhookSecret: dbyeConfig.webhookSecret.substring(0, 20) + '...',
        hashParameters: data.HashParameters,
        hashString: hashString,
        calculatedHash: calculatedHash.substring(0, 20) + '...',
        receivedHash: data.Hash.substring(0, 20) + '...',
        isValid: calculatedHash === data.Hash
      });
      
      const isValid = calculatedHash === data.Hash;
      
      if (!isValid) {
        console.error('❌ Hash doğrulama başarısız!', {
          expected: calculatedHash,
          received: data.Hash,
          environment: process.env.NODE_ENV
        });
      }
      
      return isValid;
    } catch (error) {
      console.error('❌ Hash validation error:', error);
      return false;
    }
  }

  // Başarılı ödeme işlemi
  async handleSuccessfulPayment(webhookData: DbyeWebhookData): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🎯 DBYE Başarılı Ödeme Webhook İşleniyor:', {
        notificationId: webhookData.NotificationId,
        orderNumber: webhookData.OrderNumber,
        amount: webhookData.PaymentAmount,
        transactionState: webhookData.TransactionState
      });

      // Hash doğrulaması
      const hashValid = await this.validateHash(webhookData);
      if (!hashValid) {
        console.error('❌ Başarılı ödeme hash doğrulaması başarısız:', {
          orderNumber: webhookData.OrderNumber,
          receivedHash: webhookData.Hash.substring(0, 10) + '...',
          environment: process.env.NODE_ENV
        });
        return { success: false, message: 'Hash doğrulaması başarısız - güvenlik ihlali' };
      }

      // Transaction state kontrol et (3 = Başarılı olmalı)
      if (webhookData.TransactionState !== 3) {
        console.error('❌ Transaction state başarılı değil:', webhookData.TransactionState);
        return { success: false, message: 'Transaction başarılı değil' };
      }

      // Transaction'ı bul - OrderNumber hem UUID hem sellerReference olabilir
      const transaction = await prisma.paymentTransaction.findFirst({
        where: {
          OR: [
            { sellerReference: webhookData.OrderNumber },
            { id: webhookData.OrderNumber },
            { apiReferenceNumber: webhookData.OrderNumber }
          ],
          status: 'PENDING'
        },
        include: {
          store: true
        }
      });

      if (!transaction) {
        console.error('❌ PENDING transaction bulunamadı:', webhookData.OrderNumber);
        
        // Debug için tüm pending transaction'ları görelim
        const allPending = await prisma.paymentTransaction.findMany({
          where: { status: 'PENDING' },
          select: { id: true, sellerReference: true, apiReferenceNumber: true }
        });
        console.log('📋 Mevcut PENDING transaction\'lar:', allPending);
        
        return { success: false, message: 'Transaction bulunamadı' };
      }

      // Tutar kontrolü
      const transactionAmount = Number(transaction.amount);
      if (Math.abs(transactionAmount - webhookData.PaymentAmount) > 0.01) {
        console.error('❌ Tutar uyuşmazlığı:', {
          expected: transactionAmount,
          received: webhookData.PaymentAmount
        });
        return { success: false, message: 'Tutar uyuşmazlığı' };
      }

      // Transaction'ı güncelle
      const updatedTransaction = await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          paymentDate: new Date(webhookData.PaymentDate),
          octetPaymentId: webhookData.NotificationId,
          webhookData: JSON.stringify(webhookData)
        }
      });

      // Admin store kontrolü
      const isAdminStore = await this.isAdminStore(transaction.store);
      
      let updatedStore;
      if (isAdminStore) {
        // Admin store ise kasa bakiyesini artır
        await prisma.adminVarliklari.upsert({
          where: { id: 1 },
          update: {
            kasaBakiyesi: {
              increment: webhookData.PaymentAmount
            }
          },
          create: {
            id: 1,
            kasaBakiyesi: webhookData.PaymentAmount
          }
        });
        
        // Admin store bakiyesi değişmez, sadece transaction için store bilgisini al
        updatedStore = transaction.store;
        
        console.log('💰 Admin store ödemesi - Kasa bakiyesi artırıldı:', webhookData.PaymentAmount);
      } else {
        // Normal store ise store bakiyesini artır
        updatedStore = await prisma.store.update({
          where: { store_id: transaction.storeId },
          data: {
            bakiye: {
              increment: webhookData.PaymentAmount
            }
          }
        });
        
        console.log('💰 Normal store ödemesi - Store bakiyesi artırıldı:', webhookData.PaymentAmount);
      }

      // Muhasebe hareketi ekle
      await prisma.muhasebeHareketleri.create({
        data: {
          storeId: transaction.storeId,
          islemTuru: isAdminStore ? 'ADMIN_ÖDEME' : 'ÖDEME',
          tutar: webhookData.PaymentAmount,
          harcama: false, // Gelir
          tarih: new Date(webhookData.PaymentDate),
          aciklama: `DBYE ${isAdminStore ? 'Admin' : 'Store'} Ödeme - ${webhookData.OrderNumber} - Onay Kodu: ${webhookData.ApprovalCode || 'N/A'}`
        }
      });

      console.log('✅ Başarılı ödeme işlendi:', {
        transactionId: transaction.id,
        storeId: transaction.storeId,
        storeName: transaction.store.kurum_adi,
        isAdminStore,
        amount: webhookData.PaymentAmount,
        balanceUpdate: isAdminStore ? 'Kasa bakiyesi artırıldı' : `Store bakiyesi: ${updatedStore.bakiye}`
      });

      return { 
        success: true, 
        message: 'Ödeme başarıyla işlendi' 
      };

    } catch (error) {
      console.error('❌ Başarılı ödeme işlenirken hata:', error);
      return { 
        success: false, 
        message: 'İşlem sırasında hata oluştu' 
      };
    }
  }

  // Başarısız/İptal edilen ödeme işlemi
  async handleFailedPayment(webhookData: DbyeWebhookData): Promise<{ success: boolean; message: string }> {
    try {
      console.log('❌ DBYE Başarısız/İptal Ödeme Webhook İşleniyor:', {
        notificationId: webhookData.NotificationId,
        orderNumber: webhookData.OrderNumber,
        amount: webhookData.PaymentAmount,
        transactionState: webhookData.TransactionState
      });

      // Hash doğrulaması
      const hashValid = await this.validateHash(webhookData);
      if (!hashValid) {
        console.error('❌ Başarısız/İptal ödeme hash doğrulaması başarısız:', {
          orderNumber: webhookData.OrderNumber,
          receivedHash: webhookData.Hash.substring(0, 10) + '...',
          environment: process.env.NODE_ENV
        });
        return { success: false, message: 'Hash doğrulaması başarısız - güvenlik ihlali' };
      }

      // Transaction state kontrol et (1 = Başarısız, 2 = İptal)
      if (![1, 2].includes(webhookData.TransactionState)) {
        console.error('❌ Transaction state beklenmeyen:', webhookData.TransactionState);
        return { success: false, message: 'Beklenmeyen transaction state' };
      }

      // Transaction'ı bul - OrderNumber hem UUID hem sellerReference olabilir
      const transaction = await prisma.paymentTransaction.findFirst({
        where: {
          OR: [
            { sellerReference: webhookData.OrderNumber },
            { id: webhookData.OrderNumber },
            { apiReferenceNumber: webhookData.OrderNumber }
          ],
          status: 'PENDING'
        }
      });

      if (!transaction) {
        console.error('❌ PENDING transaction bulunamadı:', webhookData.OrderNumber);
        
        // Debug için tüm pending transaction'ları görelim
        const allPending = await prisma.paymentTransaction.findMany({
          where: { status: 'PENDING' },
          select: { id: true, sellerReference: true, apiReferenceNumber: true }
        });
        console.log('📋 Mevcut PENDING transaction\'lar:', allPending);
        
        return { success: false, message: 'Transaction bulunamadı' };
      }

      // Transaction'ı güncelle
      const status = webhookData.TransactionState === 1 ? 'FAILED' : 'CANCELLED';
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: status,
          paymentDate: new Date(webhookData.PaymentDate),
          octetPaymentId: webhookData.NotificationId,
          webhookData: JSON.stringify(webhookData)
        }
      });

      // Muhasebe hareketi ekle (gelir değil, sadece kayıt tutma amaçlı)
      const islemTuru = webhookData.TransactionState === 1 ? 'ÖDEME_BAŞARISIZ' : 'ÖDEME_İPTAL';
      await prisma.muhasebeHareketleri.create({
        data: {
          storeId: transaction.storeId,
          islemTuru,
          tutar: webhookData.PaymentAmount,
          harcama: false, // Harcama değil, sadece kayıt
          tarih: new Date(webhookData.PaymentDate),
          aciklama: `DBYE ${islemTuru} - ${webhookData.OrderNumber}`
        }
      });

      console.log(`✅ ${status} ödeme işlendi:`, {
        transactionId: transaction.id,
        storeId: transaction.storeId,
        amount: webhookData.PaymentAmount,
        finalStatus: status
      });

      return { 
        success: true, 
        message: `Ödeme ${status} olarak işlendi` 
      };

    } catch (error) {
      console.error('❌ Başarısız ödeme işlenirken hata:', error);
      return { 
        success: false, 
        message: 'İşlem sırasında hata oluştu' 
      };
    }
  }

  // Genel webhook işleyici
  async processWebhook(webhookData: DbyeWebhookData): Promise<{ success: boolean; message: string }> {
    try {
      // Transaction Type kontrolü (1 = Satış)
      if (webhookData.TransactionType !== 1) {
        return { success: false, message: 'Desteklenmeyen transaction type' };
      }

      // Transaction State'e göre işlem yap
      switch (webhookData.TransactionState) {
        case 3: // Başarılı
          return await this.handleSuccessfulPayment(webhookData);
        
        case 1: // Başarısız
        case 2: // İptal
          return await this.handleFailedPayment(webhookData);
        
        default:
          console.error('❌ Bilinmeyen transaction state:', webhookData.TransactionState);
          return { success: false, message: 'Bilinmeyen transaction state' };
      }

    } catch (error) {
      console.error('❌ Webhook işlenirken genel hata:', error);
      return { success: false, message: 'Genel webhook hatası' };
    }
  }
} 