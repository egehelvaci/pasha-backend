import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook-service';
import { notificationService } from '../services/notification-service';

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

      // Webhook'u senkron işle
      const result = await webhookService.processWebhook(webhookData);
      
      if (result.success) {
        console.log('✅ Webhook başarıyla işlendi');

        // Ödeme sonucu bildirimi gönder
        try {
          // Webhook result'tan order bilgilerini almaya çalış
          const isPaymentSuccessful = webhookData.TransactionState === 3; // 3 = Başarılı
          
          // Şimdilik sadece log - webhook service'den data gelmeyebilir
          console.log(`🔔 Ödeme ${isPaymentSuccessful ? 'başarılı' : 'başarısız'} webhook alındı`, {
            orderNumber: webhookData.OrderNumber,
            amount: webhookData.PaymentAmount
          });
          
          // TODO: Order ID ve User ID'yi webhook'tan alıp bildirim gönder
          // await notificationService.notifyPaymentSuccess/Failed(orderId, userId, amount);
        } catch (notificationError) {
          console.error('❌ Ödeme bildirimi hatası:', notificationError);
          // Bildirim hatası webhook işlemini etkilemesin
        }

        return res.status(200).json({
          success: true,
          message: 'Webhook başarıyla işlendi'
        });
      } else {
        console.error('❌ Webhook işlenemedi:', result.message);
        return res.status(500).json({
          success: false,
          message: result.message || 'Webhook işlenemedi'
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

      // Test webhook data'sı oluştur - gerçek hash ile (BAŞARILI)
      const notificationId = `SUCCESS_${Date.now()}`;
      const paymentDate = new Date().toISOString();
      const hashParameters = 'OrderNumber|PaymentAmount|TransactionState';
      
      // Hash hesapla
      const { PrismaClient: PrismaClientType } = require('../../generated/prisma');
      const tempPrisma = new PrismaClientType();
      const dbyeConfig = await tempPrisma.dbyeConfig.findUnique({ where: { id: 1 } });
      await tempPrisma.$disconnect();
      
      let calculatedHash = 'test-hash'; // Fallback
      if (dbyeConfig && dbyeConfig.webhookSecret) {
        const crypto = require('crypto');
        const hashString = `${transaction.sellerReference}|${Number(transaction.amount)}|3`;
        calculatedHash = crypto
          .createHmac('sha512', dbyeConfig.webhookSecret)
          .update(hashString)
          .digest('hex');
      }
      
      const mockWebhookData = {
        NotificationId: notificationId,
        TransactionType: 1,
        TransactionState: 3, // 3 = Başarılı ödeme
        PaymentAmount: Number(transaction.amount),
        OrderNumber: transaction.sellerReference, // sellerReference kullan
        PaymentDate: paymentDate,
        Hash: calculatedHash,
        HashParameters: hashParameters
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
                window.location.href = '${process.env.PRODUCTION_FRONTEND_URL || 'http://localhost:3000'}/dashboard/odemeler';
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

      // Test webhook data'sı oluştur - gerçek hash ile (BAŞARISIZ)
      const notificationId = `FAIL_${Date.now()}`;
      const paymentDate = new Date().toISOString();
      const hashParameters = 'OrderNumber|PaymentAmount|TransactionState';
      
      // Hash hesapla
      const { PrismaClient: PrismaClientType } = require('../../generated/prisma');
      const tempPrisma = new PrismaClientType();
      const dbyeConfig = await tempPrisma.dbyeConfig.findUnique({ where: { id: 1 } });
      await tempPrisma.$disconnect();
      
      let calculatedHash = 'test-hash'; // Fallback
      if (dbyeConfig && dbyeConfig.webhookSecret) {
        const crypto = require('crypto');
        const hashString = `${transaction.sellerReference}|${Number(transaction.amount)}|1`;
        calculatedHash = crypto
          .createHmac('sha512', dbyeConfig.webhookSecret)
          .update(hashString)
          .digest('hex');
      }
      
      const mockWebhookData = {
        NotificationId: notificationId,
        TransactionType: 1,
        TransactionState: 1, // 1 = Başarısız ödeme
        PaymentAmount: Number(transaction.amount),
        OrderNumber: transaction.sellerReference, // sellerReference kullan
        PaymentDate: paymentDate,
        Hash: calculatedHash,
        HashParameters: hashParameters
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
              window.location.href = '${process.env.PRODUCTION_FRONTEND_URL || 'http://localhost:3000'}/dashboard/odemeler';
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
   * Mobile 3DS callback endpoint'i
   */
  async handleMobile3dsCallback(req: Request, res: Response) {
    try {
      const { session, status } = req.query;
      
      if (!session || typeof session !== 'string') {
        return res.status(400).send(this.generateMobileCallbackHtml('fail', '', 'Geçersiz session ID'));
      }

      // Session'ı bul
      const { PrismaClient } = require('../../generated/prisma');
      const prisma = new PrismaClient();
      
      const paymentSession = await prisma.paymentSession.findUnique({
        where: { id: session }
      });
      
      if (!paymentSession) {
        await prisma.$disconnect();
        return res.status(404).send(this.generateMobileCallbackHtml('fail', '', 'Session bulunamadı'));
      }

      // Session süresi kontrol
      if (new Date() > paymentSession.expiresAt) {
        await prisma.paymentSession.update({
          where: { id: session },
          data: { status: 'EXPIRED' }
        });
        await prisma.$disconnect();
        return res.status(410).send(this.generateMobileCallbackHtml('fail', paymentSession.orderId || '', 'Session süresi dolmuş'));
      }

      // Gateway imza doğrulaması burada yapılmalı
      // Bu örnek için basit status kontrolü yapıyoruz
      const paymentStatus = status === 'success' ? 'success' : 'fail';
      const finalStatus = paymentStatus === 'success' ? 'COMPLETED' : 'FAILED';

      // Session durumunu güncelle
      await prisma.paymentSession.update({
        where: { id: session },
        data: { 
          status: finalStatus,
          updatedAt: new Date()
        }
      });

      await prisma.$disconnect();

      // Cache-control header'ları ekle
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      // Mobile uyumlu HTML döndür
      return res.send(this.generateMobileCallbackHtml(paymentStatus, paymentSession.orderId || '', ''));

    } catch (error) {
      console.error('❌ Mobile 3DS callback hatası:', error);
      return res.status(500).send(this.generateMobileCallbackHtml('fail', '', 'Sunucu hatası'));
    }
  }

  /**
   * Web callback endpoint'i
   */
  async handleWebCallback(req: Request, res: Response) {
    try {
      const { session, status } = req.query;
      
      if (!session || typeof session !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz session ID'
        });
      }

      // Session'ı bul
      const { PrismaClient } = require('../../generated/prisma');
      const prisma = new PrismaClient();
      
      const paymentSession = await prisma.paymentSession.findUnique({
        where: { id: session }
      });
      
      if (!paymentSession) {
        await prisma.$disconnect();
        return res.status(404).json({
          success: false,
          message: 'Session bulunamadı'
        });
      }

      // Session süresi kontrol
      if (new Date() > paymentSession.expiresAt) {
        await prisma.paymentSession.update({
          where: { id: session },
          data: { status: 'EXPIRED' }
        });
        await prisma.$disconnect();
        return res.status(410).json({
          success: false,
          message: 'Session süresi dolmuş'
        });
      }

      // Gateway imza doğrulaması burada yapılmalı
      const paymentStatus = status === 'success' ? 'success' : 'fail';
      const finalStatus = paymentStatus === 'success' ? 'COMPLETED' : 'FAILED';

      // Session durumunu güncelle
      await prisma.paymentSession.update({
        where: { id: session },
        data: { 
          status: finalStatus,
          updatedAt: new Date()
        }
      });

      await prisma.$disconnect();

      // Web için JSON response döndür veya redirect yap
      const frontendUrl = process.env.PRODUCTION_FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/dashboard/odemeler?status=${paymentStatus}&orderId=${paymentSession.orderId || ''}`);

    } catch (error) {
      console.error('❌ Web callback hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  }

  /**
   * Polling endpoint'i - Payment durumu sorgulaması
   */
  async getPaymentResult(req: Request, res: Response) {
    try {
      const { session } = req.query;
      
      if (!session || typeof session !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz session ID'
        });
      }

      // Session'ı bul
      const { PrismaClient } = require('../../generated/prisma');
      const prisma = new PrismaClient();
      
      const paymentSession = await prisma.paymentSession.findUnique({
        where: { id: session }
      });
      
      await prisma.$disconnect();

      if (!paymentSession) {
        return res.status(404).json({
          success: false,
          message: 'Session bulunamadı'
        });
      }

      // Session süresi kontrol
      if (new Date() > paymentSession.expiresAt) {
        return res.status(410).json({
          success: false,
          message: 'Session süresi dolmuş',
          status: 'EXPIRED'
        });
      }

      return res.json({
        success: true,
        data: {
          sessionId: paymentSession.id,
          orderId: paymentSession.orderId,
          status: paymentSession.status,
          amount: Number(paymentSession.amount),
          channel: paymentSession.channel,
          createdAt: paymentSession.createdAt,
          expiresAt: paymentSession.expiresAt
        }
      });

    } catch (error) {
      console.error('❌ Payment result sorgulama hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  }

  /**
   * Mobile callback için HTML generator
   */
  private generateMobileCallbackHtml(status: string, orderId: string, errorMessage?: string): string {
    const isSuccess = status === 'success';
    
    return `<!doctype html>
<meta charset="utf-8">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<title>Processing…</title>
<script>
(function () {
  var payload = { 
    type: 'PAYMENT_RESULT', 
    status: '${isSuccess ? 'success' : 'fail'}', 
    orderId: '${orderId}',
    ${errorMessage ? `errorMessage: '${errorMessage}',` : ''}
    timestamp: new Date().toISOString()
  };
  
  try { 
    window.ReactNativeWebView.postMessage(JSON.stringify(payload)); 
  } catch(e) {
    console.log('ReactNativeWebView postMessage failed:', e);
  }
  
  try { 
    location.replace('myapp://payment-result?status=' + payload.status + '&orderId=' + payload.orderId); 
  } catch(e) {
    console.log('Deep link failed:', e);
  }
  
  setTimeout(function(){ 
    try {
      location.replace('about:blank'); 
    } catch(e) {
      console.log('About:blank redirect failed:', e);
    }
  }, 600);
})();
</script>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 20px;">
  <h2>Ödeme sonucu işleniyor…</h2>
  <p style="color: #666;">Lütfen bekleyiniz, uygulamaya yönlendiriliyorsunuz.</p>
  ${errorMessage ? `<p style="color: #d32f2f; font-size: 14px;">${errorMessage}</p>` : ''}
</body>`;
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