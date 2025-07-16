import crypto from 'crypto';
import axios from 'axios';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

// Octet API konfigürasyonu
const OCTET_CONFIG = {
  apiUrl: process.env.OCTET_API_URL || 'https://your-octet-api-url.com',
  partnerCode: process.env.OCTET_PARTNER_CODE || '',
  secretKey: process.env.OCTET_SECRET_KEY || '',
  currency: 'TL',
  language: 'tr'
};

// Bakiye yükleme request tipi
export interface BalanceTopUpRequest {
  storeId: string;
  amount: number;
  description?: string;
}

// Admin için mağaza seçimi request tipi
export interface AdminBalanceTopUpRequest {
  storeId: string;
  amount: number;
  description?: string;
  adminUserId: string;
}

// Ödeme durumu response tipi
export interface PaymentStatusResponse {
  paymentReference: string;
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
  message: string;
  storeId: string;
  amount: number;
  paymentDetails?: any;
}

// Ödeme callback data tipi
export interface PaymentCallbackData {
  resultStatus: string;
  resultData: any;
  apiReferenceID: string;
  [key: string]: any;
}

// Mağaza bilgisi tipi
export interface StoreInfo {
  store_id: string;
  kurum_adi: string;
  vergi_numarasi?: string;
  vergi_dairesi?: string;
  tckn?: string;
  yetkili_adi?: string;
  yetkili_soyadi?: string;
  telefon?: string;
  eposta?: string;
  adres?: string;
  bakiye: number;
}

export class PaymentService {
  
  /**
   * Octet için güvenlik hash'i oluşturur
   * @param params - Hash hesaplanacak parametreler
   * @returns SHA-256 hash string
   */
  private generateSecurityHash(params: Record<string, any>): string {
    // Octet dokümanına göre parametreleri sırala ve hash oluştur
    const sortedKeys = Object.keys(params).sort();
    let hashString = '';
    
    for (const key of sortedKeys) {
      if (params[key] !== null && params[key] !== undefined) {
        hashString += params[key].toString();
      }
    }
    
    // Secret key'i sonuna ekle
    hashString += OCTET_CONFIG.secretKey;
    
    // SHA-256 hash oluştur
    return crypto.createHash('sha256').update(hashString, 'utf8').digest('hex').toUpperCase();
  }

  /**
   * Benzersiz ödeme referansı oluşturur
   * @param storeId - Mağaza ID'si
   * @returns Benzersiz ödeme referansı
   */
  private generatePaymentReference(storeId: string): string {
    const timestamp = Date.now();
    const shortStoreId = storeId.substring(0, 8);
    return `BALANCE-${shortStoreId}-${timestamp}`;
  }

  /**
   * Mağaza bilgilerini alır
   * @param storeId - Mağaza ID'si
   * @returns Mağaza bilgileri
   */
  async getStoreInfo(storeId: string): Promise<StoreInfo | null> {
    try {
      const store = await prisma.store.findUnique({
        where: { store_id: storeId }
      });

      if (!store) {
        return null;
      }

      return {
        store_id: store.store_id,
        kurum_adi: store.kurum_adi,
        vergi_numarasi: store.vergi_numarasi || undefined,
        vergi_dairesi: store.vergi_dairesi || undefined,
        tckn: store.tckn || undefined,
        yetkili_adi: store.yetkili_adi || undefined,
        yetkili_soyadi: store.yetkili_soyadi || undefined,
        telefon: store.telefon || undefined,
        eposta: store.eposta || undefined,
        adres: store.adres || undefined,
        bakiye: Number(store.bakiye || 0)
      };
    } catch (error) {
      console.error('❌ Mağaza bilgisi getirme hatası:', error);
      return null;
    }
  }

  /**
   * Aktif mağazaları listeler (admin için)
   * @returns Mağaza listesi
   */
  async getActiveStores(): Promise<StoreInfo[]> {
    try {
      const stores = await prisma.store.findMany({
        where: { is_active: true },
        orderBy: { kurum_adi: 'asc' }
      });

      return stores.map(store => ({
        store_id: store.store_id,
        kurum_adi: store.kurum_adi,
        vergi_numarasi: store.vergi_numarasi || undefined,
        vergi_dairesi: store.vergi_dairesi || undefined,
        tckn: store.tckn || undefined,
        yetkili_adi: store.yetkili_adi || undefined,
        yetkili_soyadi: store.yetkili_soyadi || undefined,
        telefon: store.telefon || undefined,
        eposta: store.eposta || undefined,
        adres: store.adres || undefined,
        bakiye: Number(store.bakiye || 0)
      }));
    } catch (error) {
      console.error('❌ Mağaza listesi getirme hatası:', error);
      return [];
    }
  }

  /**
   * Bakiye yükleme başlatma - Octet CREATE_COMMON_PAYMENT_PAGE_REQUEST
   * @param request - Bakiye yükleme isteği
   * @returns Ödeme URL'i
   */
  async initiateBalanceTopUp(request: BalanceTopUpRequest): Promise<{ success: boolean; paymentUrl?: string; paymentReference?: string; error?: string }> {
    try {
      console.log('🚀 Bakiye yükleme başlatılıyor:', request.storeId, request.amount);
      
      // Mağaza bilgilerini al
      const store = await this.getStoreInfo(request.storeId);
      if (!store) {
        return {
          success: false,
          error: 'Mağaza bulunamadı'
        };
      }

      // Benzersiz ödeme referansı oluştur
      const paymentReference = this.generatePaymentReference(request.storeId);
      const apiReferenceId = `${paymentReference}-${Date.now()}`;
      
      // Callback URL'lerini oluştur
      const baseUrl = process.env.PUBLIC_URL || 'http://localhost:3001';
      const returnPage = `${baseUrl}/api/v1/payment/callback`;
      
      // Alıcı bilgilerini mağaza bilgilerinden oluştur
      const buyerName = store.yetkili_adi && store.yetkili_soyadi 
        ? `${store.yetkili_adi} ${store.yetkili_soyadi}`
        : store.kurum_adi;
      
      const buyerEmail = store.eposta || 'info@' + store.kurum_adi.toLowerCase().replace(/\s+/g, '') + '.com';
      const buyerPhone = store.telefon || '00905551234567';
      const buyerTCKN = store.tckn || store.vergi_numarasi || '11111111111';

      // Octet API parametrelerini hazırla
      const octetParams = {
        action: 'CREATE_COMMON_PAYMENT_PAGE_REQUEST',
        partnerCode: OCTET_CONFIG.partnerCode,
        apiReferenceID: apiReferenceId,
        paymentAmount: request.amount.toFixed(2),
        currency: OCTET_CONFIG.currency,
        language: OCTET_CONFIG.language,
        buyerName: buyerName,
        buyerEmail: buyerEmail,
        buyerPhone: buyerPhone,
        buyerTCKN: buyerTCKN,
        returnPage: returnPage,
        productName: `${store.kurum_adi} - Bakiye Yükleme`,
        productDescription: request.description || `${store.kurum_adi} mağazası için ${request.amount} TL bakiye yükleme işlemi`
      };

      // Güvenlik hash'ini hesapla
      const securityKey = this.generateSecurityHash(octetParams);
      octetParams['securityKey'] = securityKey;

      console.log('📤 Octet API\'ye gönderilecek parametreler:', {
        ...octetParams,
        securityKey: '[MASKED]'
      });

      // Octet API'sine istek gönder
      const response = await axios.post(OCTET_CONFIG.apiUrl, octetParams, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000 // 30 saniye timeout
      });

      console.log('📥 Octet API yanıtı:', response.data);

      // Yanıtı kontrol et
      if (response.data && response.data.commonPaymentPageURL) {
        // Ödeme kaydını veritabanına ekle
        await this.savePaymentRecord({
          storeId: request.storeId,
          paymentReference: paymentReference,
          apiReferenceId: apiReferenceId,
          totalAmount: request.amount,
          status: 'INITIATED',
          description: request.description,
          octetResponse: response.data
        });

        return {
          success: true,
          paymentUrl: response.data.commonPaymentPageURL,
          paymentReference: paymentReference
        };
      } else {
        throw new Error('Octet API\'den geçerli ödeme URL\'i alınamadı');
      }

    } catch (error) {
      console.error('❌ Bakiye yükleme başlatma hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  }

  /**
   * Ödeme callback'ini işler
   * @param callbackData - Octet'ten gelen callback verisi
   * @returns İşlem sonucu
   */
  async handlePaymentCallback(callbackData: PaymentCallbackData): Promise<{ success: boolean; redirectUrl: string }> {
    try {
      console.log('📞 Ödeme callback alındı:', callbackData.apiReferenceID);
      
      // API reference ID'den ödeme referansını çıkar
      const paymentReference = callbackData.apiReferenceID.split('-').slice(0, 3).join('-'); // BALANCE-XXXXXXXX-TIMESTAMP
      
      // Ödeme kaydını güncelle
      await this.updatePaymentRecord(callbackData.apiReferenceID, {
        status: 'CALLBACK_RECEIVED',
        callback_data: callbackData,
        callback_time: new Date()
      });

      // Frontend'e yönlendirme URL'i
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/admin/bakiye-yukleme/sonuc?paymentRef=${paymentReference}`;

      console.log('🔄 Kullanıcı frontend\'e yönlendiriliyor:', redirectUrl);

      return {
        success: true,
        redirectUrl: redirectUrl
      };

    } catch (error) {
      console.error('❌ Callback işleme hatası:', error);
      
      // Hata durumunda da frontend'e yönlendir
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/admin/bakiye-yukleme/sonuc?error=callback_error`;
      
      return {
        success: false,
        redirectUrl: redirectUrl
      };
    }
  }

  /**
   * Ödeme durumunu sorgular - Octet GET_COMMON_PAYMENT_REQUEST
   * @param paymentReference - Ödeme referansı
   * @returns Ödeme durumu
   */
  async getPaymentStatus(paymentReference: string): Promise<PaymentStatusResponse> {
    try {
      console.log('🔍 Ödeme durumu sorgulanıyor:', paymentReference);
      
      // Veritabanından ödeme kaydını bul
      const paymentRecord = await this.getPaymentRecord(paymentReference);
      if (!paymentRecord) {
        return {
          paymentReference: paymentReference,
          status: 'ERROR',
          message: 'Ödeme kaydı bulunamadı',
          storeId: '',
          amount: 0
        };
      }

      // Octet API parametrelerini hazırla
      const queryParams = {
        action: 'GET_COMMON_PAYMENT_REQUEST',
        partnerCode: OCTET_CONFIG.partnerCode,
        apiReferenceID: paymentRecord.apiReferenceId
      };

      // Güvenlik hash'ini hesapla
      const securityKey = this.generateSecurityHash(queryParams);
      queryParams['securityKey'] = securityKey;

      console.log('📤 Ödeme durumu sorgusu:', {
        ...queryParams,
        securityKey: '[MASKED]'
      });

      // Octet API'sine sorgulama isteği gönder
      const response = await axios.post(OCTET_CONFIG.apiUrl, queryParams, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      });

      console.log('📥 Ödeme durumu yanıtı:', response.data);

      // Yanıtı analiz et
      let status: 'SUCCESS' | 'ERROR' | 'PENDING' = 'PENDING';
      let message = 'Ödeme durumu sorgulanıyor...';

      if (response.data) {
        if (response.data.resultStatus === 'SUCCESS') {
          status = 'SUCCESS';
          message = 'Ödeme başarıyla doğrulandı';
          
          // Mağaza bakiyesini artır
          await this.updateStoreBalance(paymentRecord.storeId, paymentRecord.totalAmount);
          
        } else if (response.data.resultStatus === 'ERROR') {
          status = 'ERROR';
          message = 'Ödeme işlemi başarısız';
        }

        // Ödeme kaydını güncelle
        await this.updatePaymentRecord(paymentRecord.apiReferenceId, {
          status: status,
          final_response: response.data,
          finalized_at: new Date()
        });
      }

      return {
        paymentReference: paymentReference,
        status: status,
        message: message,
        storeId: paymentRecord.storeId,
        amount: paymentRecord.totalAmount,
        paymentDetails: response.data
      };

    } catch (error) {
      console.error('❌ Ödeme durumu sorgulama hatası:', error);
      return {
        paymentReference: paymentReference,
        status: 'ERROR',
        message: 'Ödeme durumu sorgulanamadı',
        storeId: '',
        amount: 0
      };
    }
  }

  /**
   * Mağaza bakiyesini artırır
   * @param storeId - Mağaza ID'si
   * @param amount - Artırılacak miktar
   */
  private async updateStoreBalance(storeId: string, amount: number): Promise<void> {
    try {
      await prisma.store.update({
        where: { store_id: storeId },
        data: {
          bakiye: {
            increment: amount
          },
          updated_at: new Date()
        }
      });
      console.log('✅ Mağaza bakiyesi güncellendi:', storeId, '+', amount, 'TL');
    } catch (error) {
      console.error('❌ Mağaza bakiyesi güncellenemedi:', error);
      throw error;
    }
  }

  /**
   * Ödeme kaydını veritabanına ekler
   */
  private async savePaymentRecord(data: {
    storeId: string;
    paymentReference: string;
    apiReferenceId: string;
    totalAmount: number;
    status: string;
    description?: string;
    octetResponse: any;
  }): Promise<void> {
    try {
      await prisma.payment.create({
        data: {
          store_id: data.storeId,
          payment_reference: data.paymentReference,
          api_reference_id: data.apiReferenceId,
          total_amount: data.totalAmount,
          status: data.status as any,
          payment_type: 'BALANCE_TOP_UP',
          description: data.description,
          octet_response: data.octetResponse
        }
      });
      console.log('💾 Ödeme kaydı başarıyla saklandı:', data.paymentReference);
    } catch (error) {
      console.error('❌ Ödeme kaydı saklanamadı:', error);
      throw error;
    }
  }

  /**
   * Ödeme kaydını günceller
   */
  private async updatePaymentRecord(apiReferenceId: string, updates: any): Promise<void> {
    try {
      await prisma.payment.update({
        where: { api_reference_id: apiReferenceId },
        data: {
          ...updates,
          updated_at: new Date()
        }
      });
      console.log('🔄 Ödeme kaydı başarıyla güncellendi:', apiReferenceId);
    } catch (error) {
      console.error('❌ Ödeme kaydı güncellenemedi:', error);
      throw error;
    }
  }

  /**
   * Ödeme kaydını getirir
   */
  private async getPaymentRecord(paymentReference: string): Promise<any> {
    try {
      const payment = await prisma.payment.findFirst({
        where: { payment_reference: paymentReference },
        orderBy: { created_at: 'desc' }
      });
      
      if (payment) {
        return {
          apiReferenceId: payment.api_reference_id,
          paymentReference: payment.payment_reference,
          storeId: payment.store_id,
          status: payment.status,
          totalAmount: Number(payment.total_amount),
          description: payment.description,
          octetResponse: payment.octet_response,
          callbackData: payment.callback_data,
          finalResponse: payment.final_response
        };
      }
      
      console.log('🔍 Ödeme kaydı bulunamadı:', paymentReference);
      return null;
    } catch (error) {
      console.error('❌ Ödeme kaydı getirme hatası:', error);
      return null;
    }
  }

  /**
   * Mağaza ödeme geçmişini getirir
   * @param storeId - Mağaza ID'si
   * @param limit - Kayıt limiti
   */
  async getStorePaymentHistory(storeId: string, limit: number = 10): Promise<any[]> {
    try {
      const payments = await prisma.payment.findMany({
        where: { store_id: storeId },
        orderBy: { created_at: 'desc' },
        take: limit
      });

      return payments.map(payment => ({
        id: payment.id,
        paymentReference: payment.payment_reference,
        amount: Number(payment.total_amount),
        status: payment.status,
        description: payment.description,
        createdAt: payment.created_at,
        finalizedAt: payment.finalized_at
      }));
    } catch (error) {
      console.error('❌ Ödeme geçmişi getirme hatası:', error);
      return [];
    }
  }
} 