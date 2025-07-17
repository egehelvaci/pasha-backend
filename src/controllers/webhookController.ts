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

      // Basit test webhook data'sı oluştur - sellerReference kullan (BAŞARILI)
      const mockWebhookData = {
        NotificationId: `TEST_SUCCESS_${Date.now()}`,
        TransactionType: 1,
        TransactionState: 3, // 3 = Başarılı ödeme
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
          <html lang="tr">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ödeme Başarılı</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
                width: 90%;
              }
              .icon {
                font-size: 4rem;
                margin-bottom: 1rem;
              }
              h1 {
                color: #2d3748;
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
                font-weight: 600;
              }
              p {
                color: #718096;
                font-size: 1rem;
                margin-bottom: 1.5rem;
                line-height: 1.5;
              }
              .redirect-info {
                background: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 1rem;
                font-size: 0.9rem;
                color: #4a5568;
              }
              .spinner {
                display: inline-block;
                animation: spin 1s linear infinite;
                margin-right: 0.5rem;
              }
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">✅</div>
              <h1>Ödeme Başarılı</h1>
              <p>Ödemeniz başarıyla tamamlandı.</p>
              <div class="redirect-info">
                <span class="spinner">⟳</span>
                3 saniye içinde yönlendirileceksiniz...
              </div>
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
          <html lang="tr">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ödeme Hatası</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
                width: 90%;
              }
              .icon {
                font-size: 4rem;
                margin-bottom: 1rem;
              }
              h1 {
                color: #2d3748;
                font-size: 1.5rem;
                margin-bottom: 1rem;
                font-weight: 600;
              }
              p {
                color: #718096;
                font-size: 1rem;
                line-height: 1.5;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">⚠️</div>
              <h1>Ödeme Hatası</h1>
              <p>${result.message}</p>
            </div>
          </body>
          </html>
        `);
      }

    } catch (error) {
      console.error('❌ Legacy success webhook hatası:', error);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sunucu Hatası</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
              width: 90%;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #2d3748;
              font-size: 1.5rem;
              margin-bottom: 1rem;
              font-weight: 600;
            }
            p {
              color: #718096;
              font-size: 1rem;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🔧</div>
            <h1>Sunucu Hatası</h1>
            <p>Ödeme işlemi sırasında bir hata oluştu.</p>
          </div>
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
        TransactionState: 1, // 1 = Başarısız ödeme
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
        <html lang="tr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ödeme Başarısız</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              background: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
              width: 90%;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #2d3748;
              font-size: 1.5rem;
              margin-bottom: 0.5rem;
              font-weight: 600;
            }
            p {
              color: #718096;
              font-size: 1rem;
              margin-bottom: 1.5rem;
              line-height: 1.5;
            }
            .redirect-info {
              background: #fef5e7;
              border: 1px solid #f6ad55;
              border-radius: 8px;
              padding: 1rem;
              font-size: 0.9rem;
              color: #c05621;
            }
            .spinner {
              display: inline-block;
              animation: spin 1s linear infinite;
              margin-right: 0.5rem;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>Ödeme Başarısız</h1>
            <p>Ödemeniz tamamlanamadı. Lütfen tekrar deneyiniz.</p>
            <div class="redirect-info">
              <span class="spinner">⟳</span>
              3 saniye içinde yönlendirileceksiniz...
            </div>
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