import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook-service';

const webhookService = new WebhookService();

export class WebhookController {
  
  /**
   * DBYE ana webhook endpoint'i - tüm webhook'lar buraya gelecek
   */
  async handleDbyeWebhook(req: Request, res: Response) {
    try {
      console.log('📨 DBYE Webhook alındı:', {
        method: req.method,
        body: req.body,
        headers: {
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent']
        }
      });

      // Request body'yi kontrol et
      const webhookData = req.body;
      
      if (!webhookData || typeof webhookData !== 'object') {
        console.error('❌ Geçersiz webhook data');
        return res.status(400).json({
          success: false,
          message: 'Geçersiz webhook data'
        });
      }

      // Gerekli alanları kontrol et
      const requiredFields = [
        'NotificationId', 
        'TransactionType', 
        'TransactionState', 
        'PaymentAmount', 
        'OrderNumber', 
        'PaymentDate', 
        'Hash', 
        'HashParameters'
      ];

      for (const field of requiredFields) {
        if (!webhookData[field]) {
          console.error(`❌ Eksik alan: ${field}`);
          return res.status(400).json({
            success: false,
            message: `Eksik alan: ${field}`
          });
        }
      }

      // Webhook'u işle
      const result = await webhookService.processWebhook(webhookData);
      
      // DBYE'ye response dön
      if (result.success) {
        console.log('✅ Webhook başarıyla işlendi');
        return res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        console.error('❌ Webhook işleme başarısız:', result.message);
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      console.error('❌ Webhook işlenirken hata:', error);
      return res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  }

  /**
   * Eski webhook endpoint'leri (geriye uyumluluk için)
   * Bu endpoint'ler test amaçlı kullanılabilir
   */
  async handleSuccessWebhookLegacy(req: Request, res: Response) {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Hata</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1>❌ Geçersiz Token</h1>
            <p>Ödeme doğrulama token'ı bulunamadı.</p>
          </body>
          </html>
        `);
      }

      // Token ile transaction'ı bul
      const { PrismaClient } = require('../../generated/prisma');
      const prisma = new PrismaClient();
      
      const transaction = await prisma.paymentTransaction.findFirst({
        where: { webhookToken: token }
      });
      
      if (!transaction) {
        await prisma.$disconnect();
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Transaction Bulunamadı</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1>❌ Transaction Bulunamadı</h1>
            <p>Geçersiz webhook token'ı.</p>
          </body>
          </html>
        `);
      }

      // Basit test webhook data'sı oluştur - sellerReference kullan
      const mockWebhookData = {
        NotificationId: `TEST_${Date.now()}`,
        TransactionType: 1,
        TransactionState: 3,
        PaymentAmount: Number(transaction.amount),
        OrderNumber: transaction.sellerReference, // sellerReference kullan
        PaymentDate: new Date().toISOString(),
        Hash: 'test-hash',
        HashParameters: 'OrderNumber|PaymentAmount|TransactionState'
      };
      
      await prisma.$disconnect();

      const result = await webhookService.processWebhook(mockWebhookData);
      
      if (result.success) {
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Ödeme Başarılı</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .success { color: #28a745; }
              .loading { animation: spin 1s linear infinite; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="success">
              <h1>✅ Ödeme Başarılı!</h1>
              <p>Ödemeniz başarıyla tamamlandı.</p>
              <p class="loading">🔄 Yönlendiriliyor...</p>
            </div>
            <script>
              setTimeout(() => {
                window.location.href = 'https://pasha-frontend.vercel.app/dashboard/odemeler';
              }, 3000);
            </script>
          </body>
          </html>
        `);
      } else {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Ödeme Hatası</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1>❌ Ödeme Hatası</h1>
            <p>${result.message}</p>
          </body>
          </html>
        `);
      }

    } catch (error) {
      console.error('❌ Legacy success webhook hatası:', error);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sunucu Hatası</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>❌ Sunucu Hatası</h1>
          <p>Ödeme işlemi sırasında bir hata oluştu.</p>
        </body>
        </html>
      `);
    }
  }

  async handleFailureWebhookLegacy(req: Request, res: Response) {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Hata</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1>❌ Geçersiz Token</h1>
            <p>Ödeme doğrulama token'ı bulunamadı.</p>
          </body>
          </html>
        `);
      }

      // Token ile transaction'ı bul
      const { PrismaClient } = require('../../generated/prisma');
      const prisma = new PrismaClient();
      
      const transaction = await prisma.paymentTransaction.findFirst({
        where: { webhookToken: token }
      });
      
      if (!transaction) {
        await prisma.$disconnect();
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Transaction Bulunamadı</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1>❌ Transaction Bulunamadı</h1>
            <p>Geçersiz webhook token'ı.</p>
          </body>
          </html>
        `);
      }

      // Basit test webhook data'sı oluştur (başarısız) - sellerReference kullan
      const mockWebhookData = {
        NotificationId: `TEST_FAIL_${Date.now()}`,
        TransactionType: 1,
        TransactionState: 1, // Başarısız
        PaymentAmount: Number(transaction.amount),
        OrderNumber: transaction.sellerReference, // sellerReference kullan
        PaymentDate: new Date().toISOString(),
        Hash: 'test-hash',
        HashParameters: 'OrderNumber|PaymentAmount|TransactionState'
      };
      
      await prisma.$disconnect();

      const result = await webhookService.processWebhook(mockWebhookData);
      
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ödeme Başarısız</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #dc3545; }
            .loading { animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Ödeme Başarısız</h1>
            <p>Ödemeniz tamamlanamadı. Lütfen tekrar deneyiniz.</p>
            <p class="loading">🔄 Yönlendiriliyor...</p>
          </div>
          <script>
            setTimeout(() => {
              window.location.href = 'https://pasha-frontend.vercel.app/dashboard/odemeler';
            }, 3000);
          </script>
        </body>
        </html>
      `);

    } catch (error) {
      console.error('❌ Legacy failure webhook hatası:', error);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sunucu Hatası</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>❌ Sunucu Hatası</h1>
          <p>Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.</p>
        </body>
        </html>
      `);
    }
  }

  /**
   * Transaction durumunu sorgular
   */
  async getTransactionStatus(req: Request, res: Response) {
    try {
      const { sellerReference } = req.params;
      
      if (!sellerReference) {
        return res.status(400).json({
          success: false,
          message: 'sellerReference gerekli'
        });
      }

      // Transaction'ı bul
      const { PrismaClient } = require('../../generated/prisma');
      const prisma = new PrismaClient();
      
      const transaction = await prisma.paymentTransaction.findFirst({
        where: { sellerReference },
        include: {
          store: {
            select: {
              kurum_adi: true,
              store_id: true
            }
          }
        }
      });

      await prisma.$disconnect();

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction bulunamadı'
        });
      }

      return res.json({
        success: true,
        data: {
          id: transaction.id,
          sellerReference: transaction.sellerReference,
          apiReferenceNumber: transaction.apiReferenceNumber,
          amount: Number(transaction.amount),
          status: transaction.status,
          description: transaction.description,
          paymentDate: transaction.paymentDate,
          octetPaymentId: transaction.octetPaymentId,
          store: transaction.store,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt
        }
      });

    } catch (error) {
      console.error('❌ Transaction sorgulama hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Transaction sorgulanırken hata'
      });
    }
  }
} 