import crypto from 'crypto'
import prisma from '../utils/prisma'
import { OctetPaymentStatus } from '../../generated/prisma'

interface CreatePaymentRequest {
  storeId?: string // Admin için zorunlu, user için optional (otomatik)
  amount: number
  currency: string
  maxInstallments: number[]
  expireDateTime: string
  adminId?: string // Admin işlemi için
  userId?: string // User işlemi için
}

interface CreateOctetPaymentPageRequest {
  action: string
  partnerCode: string
  sellerReference: string
  paymentAmount: string
  currency: string
  expireDateTime: string
  buyerName: string
  buyerSurname: string
  buyerMobilePhone: string
  buyerEmail: string
  buyerTCKN?: string
  buyerCompanyName?: string
  language: string
  apiReferenceID: string
  returnPage: string
  consumerCardInstallmentLimit: string
  commercialCardInstallmentLimit: string
  securityKey: string
}

interface GetPaymentStatusRequest {
  action: string
  partnerCode: string
  apiReferenceID: string
  securityKey: string
}

interface OctetApiResponse {
  resultStatus: string
  resultCode: string
  resultData?: {
    commonPaymentPageURL?: string
    paymentAmount?: string
    currency?: string
    paymentDate?: string
    installmentCount?: string
    paymentToSellerAmount?: string
  }
  errorMessage?: string
}

export class OctetPaymentService {
  private readonly apiUrl: string
  private readonly partnerCode: string
  private readonly secretKey: string
  private readonly callbackUrl: string

  constructor() {
    this.apiUrl = process.env.OCTET_API_URL || ''
    this.partnerCode = process.env.OCTET_PARTNER_CODE || ''
    this.secretKey = process.env.OCTET_SECRET_KEY || ''
    this.callbackUrl = process.env.OCTET_CALLBACK_URL || 'http://localhost:3000/payment-result'
    
    if (!this.apiUrl || !this.partnerCode || !this.secretKey || !this.callbackUrl) {
      console.warn('⚠️ Octet API konfigürasyonu eksik. .env dosyasını kontrol edin.')
    }
  }

  /**
   * SHA1 hash ile güvenlik anahtarı oluştur
   */
  private generateSecurityKey(data: string): string {
    return crypto.createHash('sha1').update(data).digest('hex')
  }

  /**
   * Ödeme başlat (Admin veya User)
   */
  async initiatePayment(request: CreatePaymentRequest): Promise<{ paymentLink: string }> {
    try {
      let store: any
      let initiatorUser: any
      let isAdminPayment = false

      // Admin işlemi mi user işlemi mi belirle
      if (request.adminId) {
        // Admin işlemi
        isAdminPayment = true
        
        if (!request.storeId) {
          throw new Error('Admin işleminde storeId zorunludur')
        }

        // Mağaza bilgilerini al
        store = await prisma.store.findUnique({
          where: { store_id: request.storeId },
          include: { installmentLimits: true }
        })

        if (!store) {
          throw new Error('Mağaza bulunamadı')
        }

        // Admin bilgilerini kontrol et
        initiatorUser = await prisma.user.findUnique({
          where: { userId: request.adminId },
          include: { userType: true }
        })

        if (!initiatorUser || initiatorUser.userType.name !== 'admin') {
          throw new Error('Sadece admin kullanıcılar mağaza seçerek ödeme başlatabilir')
        }
      } else if (request.userId) {
        // User işlemi
        isAdminPayment = false

        // User bilgilerini al
        initiatorUser = await prisma.user.findUnique({
          where: { userId: request.userId },
          include: { userType: true, Store: { include: { installmentLimits: true } } }
        })

        if (!initiatorUser) {
          throw new Error('Kullanıcı bulunamadı')
        }

        if (!initiatorUser.Store) {
          throw new Error('Kullanıcının mağaza bilgisi bulunamadı')
        }

        store = initiatorUser.Store
      } else {
        throw new Error('adminId veya userId belirtilmelidir')
      }

      // Taksit limitlerini belirle
      const installmentLimits = store.installmentLimits?.[0]
      const consumerLimit = installmentLimits?.consumer_installment_limit || '1'
      const commercialLimit = installmentLimits?.commercial_installment_limit || '1'

      // Benzersiz API referans ID oluştur
      const apiReferenceID = crypto.randomUUID()

      // Mağaza telefon numarasını formatla (00 ile başlamalı)
      let formattedPhone = store.telefon || ''
      if (formattedPhone.startsWith('+90')) {
        formattedPhone = '00' + formattedPhone.substring(3)
      } else if (formattedPhone.startsWith('0')) {
        formattedPhone = '0090' + formattedPhone.substring(1)
      } else if (!formattedPhone.startsWith('00')) {
        formattedPhone = '0090' + formattedPhone
      }

              // Octet API parametrelerini hazırla
        const octetRequest: CreateOctetPaymentPageRequest = {
          action: 'CREATE_COMMON_PAYMENT_PAGE_REQUEST',
          partnerCode: this.partnerCode,
          sellerReference: store.store_id,
          paymentAmount: request.amount.toFixed(2),
          currency: request.currency,
          expireDateTime: request.expireDateTime,
          buyerName: store.kurum_adi,
          buyerSurname: '.',
          buyerMobilePhone: formattedPhone,
          buyerEmail: store.eposta || '',
          buyerTCKN: store.vergi_numarasi || store.tckn || '',
          buyerCompanyName: store.kurum_adi,
          language: 'TR',
          apiReferenceID,
          returnPage: this.callbackUrl,
          consumerCardInstallmentLimit: consumerLimit,
          commercialCardInstallmentLimit: commercialLimit,
          securityKey: '' // Daha sonra hesaplanacak
        }

      // Güvenlik anahtarını oluştur
      const securityData = `${octetRequest.action}${octetRequest.partnerCode}${octetRequest.sellerReference}${octetRequest.paymentAmount}${octetRequest.currency}${octetRequest.expireDateTime}${octetRequest.apiReferenceID}${this.secretKey}`
      octetRequest.securityKey = this.generateSecurityKey(securityData)

      // Octet API'sine istek gönder
      const response = await this.sendOctetRequest(octetRequest)

      if (response.resultStatus !== 'SUCCESS') {
        throw new Error(response.errorMessage || 'Octet API hatası')
      }

      const paymentUrl = response.resultData?.commonPaymentPageURL
      if (!paymentUrl) {
        throw new Error('Ödeme linki oluşturulamadı')
      }

      // Taksit dropdown'u için URL'yi güncelle
      const finalPaymentUrl = paymentUrl.includes('installmentStyle=ddl') 
        ? paymentUrl 
        : `${paymentUrl}&installmentStyle=ddl`

      // Veritabanına kaydet
      await prisma.octetPayment.create({
        data: {
          store_id: store.store_id,
          admin_id: isAdminPayment ? request.adminId! : request.userId!,
          amount: request.amount,
          currency: request.currency,
          api_reference_id: apiReferenceID,
          common_payment_url: finalPaymentUrl,
          consumer_installment_limit: consumerLimit,
          commercial_installment_limit: commercialLimit,
          buyer_name: store.kurum_adi,
          buyer_email: store.eposta || '',
          buyer_phone: formattedPhone,
          buyer_company_name: store.kurum_adi,
          buyer_tckn: store.vergi_numarasi || store.tckn,
          status: OctetPaymentStatus.PENDING,
          expire_date_time: new Date(request.expireDateTime)
        }
      })

      return { paymentLink: finalPaymentUrl }

    } catch (error: any) {
      console.error('Octet ödeme başlatma hatası:', error)
      throw new Error(error.message || 'Ödeme başlatılamadı')
    }
  }

  /**
   * Ödeme durumunu Octet API'den doğrula
   */
  async verifyPayment(apiReferenceID: string): Promise<OctetApiResponse> {
    try {
      const request: GetPaymentStatusRequest = {
        action: 'GET_COMMON_PAYMENT_REQUEST',
        partnerCode: this.partnerCode,
        apiReferenceID,
        securityKey: ''
      }

      // Güvenlik anahtarını oluştur
      const securityData = `${request.action}${request.partnerCode}${request.apiReferenceID}${this.secretKey}`
      request.securityKey = this.generateSecurityKey(securityData)

      return await this.sendOctetRequest(request)

    } catch (error: any) {
      console.error('Octet ödeme doğrulama hatası:', error)
      throw new Error('Ödeme doğrulanamadı')
    }
  }

  /**
   * Ödeme callback'ini işle ve mağaza bakiyesini güncelle
   */
  async handlePaymentCallback(callbackData: any): Promise<void> {
    try {
      const { apiReferenceID } = callbackData.resultData || callbackData

      if (!apiReferenceID) {
        throw new Error('API referans ID bulunamadı')
      }

      // Ödemeyi veritabanından bul
      const payment = await prisma.octetPayment.findUnique({
        where: { api_reference_id: apiReferenceID },
        include: { store: true, admin: true }
      })

      if (!payment) {
        throw new Error('Ödeme kaydı bulunamadı')
      }

      // Octet API'den ödeme durumunu doğrula
      const verificationResult = await this.verifyPayment(apiReferenceID)

      if (verificationResult.resultStatus === 'SUCCESS' && verificationResult.resultData) {
        const { paymentAmount, paymentDate, installmentCount, paymentToSellerAmount } = verificationResult.resultData

        // Mağazaya geçecek tutarı hesapla
        const amountToAdd = paymentToSellerAmount ? parseFloat(paymentToSellerAmount) : payment.amount

        // Ödeme başarılı, veritabanını güncelle
        await prisma.$transaction(async (tx) => {
          // Ödeme kaydını güncelle
          await tx.octetPayment.update({
            where: { id: payment.id },
            data: {
              status: OctetPaymentStatus.COMPLETED,
              payment_date: paymentDate ? new Date(paymentDate) : new Date(),
              installment_count: installmentCount ? parseInt(installmentCount) : 1,
              payment_to_seller_amount: amountToAdd,
              octet_transaction_id: apiReferenceID
            }
          })

          // Mağaza bakiyesini artır
          await tx.store.update({
            where: { store_id: payment.store_id },
            data: {
              bakiye: {
                increment: amountToAdd
              }
            }
          })

          // Muhasebe hareketi kaydı oluştur
          await tx.muhasebeHareketleri.create({
            data: {
              storeId: payment.store_id,
              islemTuru: 'Diğer Gelirler',
              tutar: amountToAdd,
              harcama: false, // Gelir
              tarih: new Date(),
              aciklama: `Octet ödeme sistemi ile bakiye yükleme - ${installmentCount || 1} taksit`,
            }
          })

          // Admin kasa bakiyesini güncelle
          const adminVarliklar = await tx.adminVarliklari.findFirst({
            where: { id: 1 }
          })

          if (!adminVarliklar) {
            await tx.adminVarliklari.create({
              data: {
                id: 1,
                kasaBakiyesi: amountToAdd
              }
            })
          } else {
            await tx.adminVarliklari.update({
              where: { id: 1 },
              data: {
                kasaBakiyesi: {
                  increment: amountToAdd
                }
              }
            })
          }

          // Not: Mağaza bakiyesi zaten yukarıda güncellendi, cari_bakiye artık kullanılmıyor
        })

        console.log(`✅ Ödeme başarıyla işlendi: ${payment.buyer_name} - ${amountToAdd} ${payment.currency}`)
      } else {
        // Ödeme başarısız
        await prisma.octetPayment.update({
          where: { api_reference_id: apiReferenceID },
          data: { status: OctetPaymentStatus.FAILED }
        })

        throw new Error('Ödeme doğrulanamadı')
      }

    } catch (error: any) {
      console.error('Ödeme callback işleme hatası:', error)
      throw error
    }
  }

  /**
   * Mağaza için taksit limitlerini ayarla
   */
  async setInstallmentLimits(storeId: string, consumerLimits: number[], commercialLimits: number[]): Promise<void> {
    try {
      const consumerLimitStr = consumerLimits.join(',')
      const commercialLimitStr = commercialLimits.join(',')

      await prisma.storeInstallmentLimit.upsert({
        where: { store_id: storeId },
        update: {
          consumer_installment_limit: consumerLimitStr,
          commercial_installment_limit: commercialLimitStr,
          is_active: true
        },
        create: {
          store_id: storeId,
          consumer_installment_limit: consumerLimitStr,
          commercial_installment_limit: commercialLimitStr,
          is_active: true
        }
      })

    } catch (error: any) {
      console.error('Taksit limiti ayarlama hatası:', error)
      throw new Error('Taksit limitleri ayarlanamadı')
    }
  }

  /**
   * Mağazanın taksit limitlerini getir
   */
  async getInstallmentLimits(storeId: string) {
    try {
      const limits = await prisma.storeInstallmentLimit.findUnique({
        where: { store_id: storeId }
      })

      if (!limits) {
        return {
          consumerCardInstallmentLimit: [1],
          commercialCardInstallmentLimit: [1]
        }
      }

      return {
        consumerCardInstallmentLimit: limits.consumer_installment_limit.split(',').map(Number),
        commercialCardInstallmentLimit: limits.commercial_installment_limit.split(',').map(Number)
      }

    } catch (error: any) {
      console.error('Taksit limitleri getirme hatası:', error)
      throw new Error('Taksit limitleri alınamadı')
    }
  }

  /**
   * Octet API'sine HTTP isteği gönder
   */
  private async sendOctetRequest(requestData: any): Promise<OctetApiResponse> {
    try {
      const formData = new URLSearchParams()
      Object.keys(requestData).forEach(key => {
        formData.append(key, requestData[key])
      })

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result

    } catch (error: any) {
      console.error('Octet API isteği hatası:', error)
      throw new Error(`API isteği başarısız: ${error.message}`)
    }
  }
}

export const octetPaymentService = new OctetPaymentService() 