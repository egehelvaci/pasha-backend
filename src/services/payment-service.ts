import prisma from '../utils/prisma';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { OctetLoginService } from './octet-login-service';

export interface CreatePaymentRequestInput {
  storeId: string;
  userId: string;
  amount: number;
  aciklama?: string;
}

export interface CreateCheckoutInput {
  storeId: string;
  userId: string;
  amount: number;
  aciklama?: string;
  channel?: 'web' | 'mobile';
  idempotencyKey?: string;
  orderId?: string;
}

export interface PaymentRequestData {
  expireDate: string;
  amount: number;
  languageCode: string;
  currencyCode: string;
  sellerReference: string;
  productTypes: number[];
  paymentRequestCommonDetail: {
    isDocumentsShown: boolean;
    apiReferenceNumber: string;
    referenceInformation: string;
    buyerReference: string;
    installmentCount: number;
    okUrl: string;
    failUrl: string;
  };
  paymentRequestBuyerInformation: {
    identityNumber: string;
    firstName: string;
    lastName: string;
    phoneCode: string;
    phoneNumber: string;
    email: string;
    companyName: string;
    taxNumber: string;
    taxOffice: string;
  };
}

export interface OctetPaymentResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export class PaymentService {
  private octetLoginService: OctetLoginService;

  constructor() {
    this.octetLoginService = new OctetLoginService();
  }

  /**
   * Store bilgilerini veritabanından alır
   */
  private async getStoreInfo(storeId: string) {
    const store = await prisma.store.findUnique({
      where: { store_id: storeId },
      select: {
        kurum_adi: true,
        vergi_numarasi: true,
        vergi_dairesi: true,
        tckn: true,
        yetkili_adi: true,
        yetkili_soyadi: true,
        telefon: true,
        eposta: true,
        maksimum_taksit: true,
        is_active: true
      }
    });

    if (!store) {
      throw new Error(`Store bulunamadı: ${storeId}`);
    }

    if (!store.is_active) {
      throw new Error('Store aktif değil');
    }

    return store;
  }

  /**
   * Kullanıcı ve mağaza bilgilerini veritabanından alır
   */
  private async getUserAndStoreInfo(userId: string, storeId: string) {
    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        Store: {
          select: {
            store_id: true,
            kurum_adi: true,
            vergi_numarasi: true,
            vergi_dairesi: true,
            tckn: true,
            yetkili_adi: true,
            yetkili_soyadi: true,
            telefon: true,
            eposta: true,
            maksimum_taksit: true,
            is_active: true
          }
        },
        userType: {
          select: {
            name: true
          }
        }
      }
    });

    if (!user) {
      throw new Error(`Kullanıcı bulunamadı: ${userId}`);
    }

    // Admin kullanıcılar için farklı davranış
    if (user.userType?.name === 'admin') {
      // Admin kullanıcılar için belirtilen mağazayı al
      const targetStore = await this.getStoreInfo(storeId);
      console.log(`👑 Admin kullanıcı (${userId}) farklı mağaza (${storeId}) için ödeme işlemi yapıyor`);
      return { user, store: targetStore };
    }

    // Normal kullanıcılar için mevcut kontrolü yap
    if (!user.Store) {
      throw new Error('Kullanıcı bir mağazaya bağlı değil');
    }

    if (!user.Store.is_active) {
      throw new Error('Kullanıcının mağazası aktif değil');
    }

    if (user.Store.store_id !== storeId) {
      throw new Error('Kullanıcının mağazası ile ödeme mağazası uyuşmuyor');
    }

    return { user, store: user.Store };
  }

  /**
   * Benzersiz referans numaraları üretir
   */
  private generateUniqueReferences() {
    const timestamp = Date.now();
    const shortUuid = uuidv4().substring(0, 8).toUpperCase();
    
    return {
      sellerReference: `PASHA-${timestamp}-${shortUuid}`,
      apiReferenceNumber: `PASHA-ODEME-${timestamp}-${shortUuid}`
    };
  }

  /**
   * Telefon numarasını temizler (+90 kaldırır)
   */
  private cleanPhoneNumber(phone: string | null): string {
    if (!phone) return '5000000000'; // Default telefon
    
    // +90 varsa kaldır, boşlukları ve tire'leri temizle
    let cleaned = phone.replace(/^\+90/, '').replace(/[\s-]/g, '');
    
    // Eğer 0 ile başlıyorsa kaldır
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // 10 haneli olmalı
    if (cleaned.length !== 10) {
      return '5000000000'; // Default telefon
    }
    
    return cleaned;
  }

  /**
   * Payment request oluşturur
   */
  async createPaymentRequest(input: CreatePaymentRequestInput): Promise<PaymentRequestData> {
    // Kullanıcı ve mağaza bilgilerini al
    const { user, store } = await this.getUserAndStoreInfo(input.userId, input.storeId);

    // Benzersiz referansları üret
    const { sellerReference, apiReferenceNumber } = this.generateUniqueReferences();

    // Expire date (24 saat sonra - Türkiye saati)
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 27); // UTC+3 için +24 saat + 3 saat

    // Kullanıcının telefon numarasını temizle, yoksa mağaza telefonu
    const userPhone = user.phoneNumber || store.telefon;
    const cleanPhone = this.cleanPhoneNumber(userPhone);

    // Payment request data'sını oluştur
    const paymentRequest: PaymentRequestData = {
      expireDate: expireDate.toISOString(),
      amount: input.amount,
      languageCode: "TUR",
      currencyCode: "TRY",
      sellerReference,
      productTypes: [1],
      paymentRequestCommonDetail: {
        isDocumentsShown: true,
        apiReferenceNumber,
        referenceInformation: input.aciklama || "Ödeme",
        buyerReference: "PASHA-HOME",
        installmentCount: store.maksimum_taksit || 1,
        okUrl: `${process.env.PRODUCTION_FRONTEND_URL || 'http://localhost:3000'}/dashboard/odemeler`,
        failUrl: `${process.env.PRODUCTION_FRONTEND_URL || 'http://localhost:3000'}/dashboard/odemeler`
      },
      paymentRequestBuyerInformation: {
        identityNumber: store.tckn || store.vergi_numarasi || "11111111111",
        firstName: user.name || store.yetkili_adi || "Yetkili",
        lastName: user.surname || store.yetkili_soyadi || "Kişi",
        phoneCode: "+90",
        phoneNumber: cleanPhone,
        email: user.email || store.eposta || "bilgi@example.com",
        companyName: store.kurum_adi,
        taxNumber: store.vergi_numarasi || "1111111111",
        taxOffice: store.vergi_dairesi || "Merkez"
      }
    };

    console.log('Payment request oluşturuldu:', {
      storeId: input.storeId,
      amount: input.amount,
      sellerReference,
      apiReferenceNumber
    });

    return paymentRequest;
  }

  /**
   * Octet API'ye payment request gönderir (retry mantığı ile)
   */
  async sendPaymentRequestToOctet(paymentRequest: PaymentRequestData, retryCount: number = 0): Promise<OctetPaymentResponse> {
    try {
      // Octet login token'ını al (retry durumunda force refresh)
      const token = await this.octetLoginService.getAuthToken(retryCount > 0);

      console.log(`Octet API'ye payment request gönderiliyor... (Attempt: ${retryCount + 1})`);

      // Octet API'ye istek gönder
      const response = await axios.post(
        'https://portalapi.octet.com.tr/payments/common',
        paymentRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Token': token
          },
          timeout: 30000 // 30 saniye timeout
        }
      );

      console.log('Octet API yanıtı alındı:', {
        status: response.status,
        sellerReference: paymentRequest.sellerReference
      });

      return {
        success: true,
        data: response.data,
        message: 'Payment request başarıyla gönderildi'
      };

    } catch (error) {
      console.error('Octet API hatası:', error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // 401 hatası ve retry yapılmamışsa, token'ı yenile ve tekrar dene
          if (error.response.status === 401 && retryCount === 0) {
            console.log('401 hatası alındı, token yenileniyor ve tekrar deneniyor...');
            this.octetLoginService.clearToken(); // Mevcut token'ı temizle
            return this.sendPaymentRequestToOctet(paymentRequest, retryCount + 1);
          }

          const errorMessage = error.response.data?.message || 
                             error.response.data?.Errors?.[0] ||
                             error.response.data?.error ||
                             `API Hatası: ${error.response.status}`;
          
          return {
            success: false,
            message: errorMessage,
            data: error.response.data
          };
        } else if (error.request) {
          return {
            success: false,
            message: 'Octet API\'ye bağlanılamadı - ağ hatası'
          };
        }
      }

      return {
        success: false,
        message: 'Payment request gönderilirken beklenmeyen hata'
      };
    }
  }

  /**
   * Payment transaction kaydı oluşturur
   */
  private async createPaymentTransaction(paymentRequest: PaymentRequestData, storeId: string): Promise<string> {
    // Güvenlik token'ı oluştur
    const webhookToken = uuidv4();

    const transaction = await prisma.paymentTransaction.create({
      data: {
        storeId,
        sellerReference: paymentRequest.sellerReference,
        apiReferenceNumber: paymentRequest.paymentRequestCommonDetail.apiReferenceNumber,
        amount: paymentRequest.amount,
        description: paymentRequest.paymentRequestCommonDetail.referenceInformation,
        status: 'PENDING',
        webhookToken
      }
    });

    console.log('💾 Payment transaction kaydı oluşturuldu:', {
      id: transaction.id,
      sellerReference: transaction.sellerReference,
      amount: transaction.amount
    });

    return webhookToken;
  }

  /**
   * Yeni checkout endpoint'i - Kanal desteği ile
   */
  async checkout(input: CreateCheckoutInput): Promise<{
    success: boolean;
    checkoutUrl?: string;
    paymentSessionId?: string;
    message?: string;
  }> {
    try {
      const channel = input.channel || 'web';
      
      // İdempotency kontrolü
      if (input.idempotencyKey) {
        const existingSession = await prisma.paymentSession.findUnique({
          where: { idempotencyKey: input.idempotencyKey }
        });
        
        if (existingSession) {
          return {
            success: true,
            checkoutUrl: existingSession.paymentUrl || undefined,
            paymentSessionId: existingSession.id
          };
        }
      }

      // Payment session oluştur
      const sessionId = uuidv4();
      const webhookToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 saat sonra expire

      const session = await prisma.paymentSession.create({
        data: {
          id: sessionId,
          orderId: input.orderId,
          channel: channel.toUpperCase() as any,
          storeId: input.storeId,
          amount: input.amount,
          description: input.aciklama,
          idempotencyKey: input.idempotencyKey,
          webhookToken,
          expiresAt
        }
      });

      // Payment request oluştur
      const paymentRequest = await this.createPaymentRequest({
        storeId: input.storeId,
        userId: input.userId,
        amount: input.amount,
        aciklama: input.aciklama
      });

      // Redirect URL'lerini kanala göre oluştur
      const backendUrl = process.env.PUBLIC_URL || 'https://pasha-backend-production.up.railway.app';
      const { successUrl, failUrl } = this.buildUrls(channel, sessionId, backendUrl);
      
      paymentRequest.paymentRequestCommonDetail.okUrl = successUrl;
      paymentRequest.paymentRequestCommonDetail.failUrl = failUrl;

      // Octet API'ye gönder
      const result = await this.sendPaymentRequestToOctet(paymentRequest);

      if (result.success && result.data?.commonPaymentPageUrl) {
        // Session'ı payment URL ile güncelle
        await prisma.paymentSession.update({
          where: { id: sessionId },
          data: { 
            paymentUrl: result.data.commonPaymentPageUrl,
            status: 'PROCESSING'
          }
        });

        return {
          success: true,
          checkoutUrl: result.data.commonPaymentPageUrl,
          paymentSessionId: sessionId
        };
      } else {
        throw new Error('Octet\'ten geçerli payment URL alınamadı');
      }

    } catch (error) {
      console.error('❌ Checkout hatası:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Ödeme başlatılırken hata oluştu'
      };
    }
  }

  /**
   * Kanala göre redirect URL'lerini oluştur
   */
  private buildUrls(channel: string, sessionId: string, backendUrl: string): {
    successUrl: string;
    failUrl: string;
  } {
    if (channel === 'mobile') {
      return {
        successUrl: `${backendUrl}/api/payments/mobile/3ds/callback?session=${sessionId}&status=success`,
        failUrl: `${backendUrl}/api/payments/mobile/3ds/callback?session=${sessionId}&status=fail`
      };
    } else {
      // Web default
      return {
        successUrl: `${backendUrl}/api/payments/web/callback?session=${sessionId}&status=success`,
        failUrl: `${backendUrl}/api/payments/web/callback?session=${sessionId}&status=fail`
      };
    }
  }

  /**
   * Tam payment işlemi: Request oluştur, transaction kaydet ve Octet'e gönder
   */
  async processPayment(input: CreatePaymentRequestInput): Promise<OctetPaymentResponse> {
    try {
      // Payment request oluştur
      const paymentRequest = await this.createPaymentRequest(input);

      // Transaction kaydı oluştur ve webhook token al
      const webhookToken = await this.createPaymentTransaction(paymentRequest, input.storeId);

      // Webhook URL'lerini güvenli hale getir
      const backendUrl = process.env.PUBLIC_URL || 'https://pasha-backend-production.up.railway.app';
      paymentRequest.paymentRequestCommonDetail.okUrl = `${backendUrl}/api/payments/webhook/success?token=${webhookToken}`;
      paymentRequest.paymentRequestCommonDetail.failUrl = `${backendUrl}/api/payments/webhook/failure?token=${webhookToken}`;

      // Octet API'ye gönder
      const result = await this.sendPaymentRequestToOctet(paymentRequest);

      // Başarılı ise sadece payment URL'ini döndür
      if (result.success && result.data?.commonPaymentPageUrl) {
        result.data = {
          paymentUrl: result.data.commonPaymentPageUrl,
          sellerReference: paymentRequest.sellerReference,
          apiReferenceNumber: paymentRequest.paymentRequestCommonDetail.apiReferenceNumber,
          amount: paymentRequest.amount
        };
      }

      return result;

    } catch (error) {
      console.error('Payment işlemi hatası:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment işlemi başarısız'
      };
    }
  }
} 