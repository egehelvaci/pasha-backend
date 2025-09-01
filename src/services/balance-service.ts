import prisma from '../utils/prisma';
import { exchangeRateService } from './exchange-rate-service';
import { Decimal } from '@prisma/client/runtime/library';

export interface BalanceUpdateInput {
  storeId: string;
  amount: number;
  currencyCode: 'TRY' | 'USD';
  operation: 'add' | 'subtract';
  description?: string;
  isPaymentCurrency?: boolean; // Ödeme para biriminde mi işlem yapılacak
}

export class BalanceService {
  /**
   * Mağaza bakiyesini güncelle (döviz desteği ile)
   */
  async updateBalance(input: BalanceUpdateInput): Promise<{
    success: boolean;
    message: string;
    balance?: number;
    storeCurrency?: string;
  }> {
    try {
      // Mağazayı al
      const store = await prisma.store.findUnique({
        where: { store_id: input.storeId },
        select: {
          store_id: true,
          kurum_adi: true,
          currency: true,
          bakiye: true
        }
      });

      if (!store) {
        return {
          success: false,
          message: 'Mağaza bulunamadı'
        };
      }

      const currentBalance = Number(store.bakiye || 0);
      let newBalance = currentBalance;

      // Mağazanın para birimi
      const storeCurrency = store.currency || 'TRY';

      // İşlem yapılacak tutarı hesapla
      let effectiveAmount = input.amount;
      
      // Eğer ödeme para birimi mağaza para biriminden farklıysa çevir
      if (input.currencyCode !== storeCurrency) {
        if (input.currencyCode === 'USD' && storeCurrency === 'TRY') {
          // USD ödeme, TRY bakiye - USD'yi TRY'ye çevir
          effectiveAmount = await exchangeRateService.convertUSDtoTRY(input.amount);
          console.log(`💱 Döviz çevrimi: ${input.amount} USD = ${effectiveAmount.toFixed(2)} TRY`);
        } else if (input.currencyCode === 'TRY' && storeCurrency === 'USD') {
          // TRY ödeme, USD bakiye - TRY'yi USD'ye çevir
          effectiveAmount = await exchangeRateService.convertTRYtoUSD(input.amount);
          console.log(`💱 Döviz çevrimi: ${input.amount} TRY = ${effectiveAmount.toFixed(2)} USD`);
        }
      }

      // Bakiyeyi güncelle
      if (input.operation === 'add') {
        newBalance = currentBalance + effectiveAmount;
      } else {
        newBalance = currentBalance - effectiveAmount;
      }

      // Veritabanını güncelle
      await prisma.store.update({
        where: { store_id: input.storeId },
        data: {
          bakiye: new Decimal(newBalance)
        }
      });

      // Muhasebe kaydı oluştur - USD mağazaları için muhasebe kaydı yaratılmaz
      if (storeCurrency !== ('USD' as any)) {
        const islemTuru = input.description || 
          `${input.currencyCode} ${input.operation === 'add' ? 'Ekleme' : 'Düşme'} İşlemi`;
        
        await prisma.muhasebeHareketleri.create({
          data: {
            storeId: input.storeId,
            islemTuru,
            tutar: new Decimal(effectiveAmount), // Mağaza currency'sinde tutar
            harcama: input.operation === 'subtract',
            tarih: new Date(),
            aciklama: `${input.amount} ${input.currencyCode} ${input.operation === 'add' ? 'eklendi' : 'düşüldü'}`,
            // Currency tracking alanları
            currency: storeCurrency as any,
            original_currency: input.currencyCode as any,
            original_amount: new Decimal(input.amount), // Orijinal tutar
            exchange_rate: input.currencyCode !== storeCurrency ? 
              (input.currencyCode === 'USD' ? new Decimal(1 / effectiveAmount * input.amount) : new Decimal(effectiveAmount / input.amount)) 
              : null
          }
        });
        console.log('📝 Muhasebe kaydı oluşturuldu');
      } else {
        console.log('📝 USD mağazası için muhasebe kaydı oluşturulmadı - ayrı sistemde takip edilir');
      }

      const operationText = input.operation === 'add' ? 'eklendi' : 'düşüldü';
      
      console.log(`✅ Bakiye güncellendi:`, {
        store: store.kurum_adi,
        operation: `${input.amount} ${input.currencyCode} ${operationText}`,
        effectiveAmount: effectiveAmount.toFixed(2),
        newBalance: newBalance.toFixed(2),
        storeCurrency
      });

      return {
        success: true,
        message: `${input.amount} ${input.currencyCode} başarıyla ${operationText}`,
        balance: newBalance,
        storeCurrency
      };

    } catch (error) {
      console.error('Bakiye güncelleme hatası:', error);
      return {
        success: false,
        message: 'Bakiye güncellenirken hata oluştu'
      };
    }
  }

  /**
   * Ödeme sonrası bakiye güncelleme (webhook'tan çağrılır)
   */
  async processPaymentBalance(
    storeId: string, 
    amount: number, 
    currencyCode: 'TRY' | 'USD',
    description?: string
  ): Promise<void> {
    await this.updateBalance({
      storeId,
      amount,
      currencyCode,
      operation: 'add',
      description: description || 'Ödeme alındı'
    });
  }

  /**
   * Sipariş sonrası bakiye düşürme
   */
  async processOrderBalance(
    storeId: string,
    amount: number,
    currencyCode: 'TRY' | 'USD',
    orderId: string
  ): Promise<void> {
    await this.updateBalance({
      storeId,
      amount,
      currencyCode,
      operation: 'subtract',
      description: `Sipariş #${orderId.substring(0, 8)}`
    });
  }

  /**
   * Sipariş iptali sonrası bakiye iadesi
   */
  async refundOrderBalance(
    storeId: string,
    amount: number,
    currencyCode: 'TRY' | 'USD',
    orderId: string
  ): Promise<void> {
    await this.updateBalance({
      storeId,
      amount,
      currencyCode,
      operation: 'add',
      description: `Sipariş İptali #${orderId.substring(0, 8)}`
    });
  }
}

// Singleton instance
export const balanceService = new BalanceService();