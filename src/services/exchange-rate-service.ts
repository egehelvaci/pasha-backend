import axios from 'axios';
import prisma from '../utils/prisma';

export interface ExchangeRateData {
  USD: number;
  EUR?: number;
}

export class ExchangeRateService {
  private static instance: ExchangeRateService;
  private cachedRates: ExchangeRateData | null = null;
  private cacheExpiry: Date | null = null;
  private readonly CACHE_DURATION_MINUTES = 60; // 1 saat cache

  private constructor() {}

  public static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService();
    }
    return ExchangeRateService.instance;
  }

  /**
   * TCMB'den güncel döviz kurlarını al
   */
  private async fetchRatesFromTCMB(): Promise<ExchangeRateData> {
    try {
      // TCMB XML API
      const response = await axios.get('https://www.tcmb.gov.tr/kurlar/today.xml', {
        timeout: 5000,
        headers: {
          'Accept': 'application/xml'
        }
      });

      // XML'i parse et (basit regex ile)
      const xmlData = response.data;
      
      // USD alış kuru
      const usdMatch = xmlData.match(/<Currency.*?Code="USD".*?>(.*?)<\/Currency>/s);
      let usdRate = 0;
      
      if (usdMatch) {
        const forexBuyingMatch = usdMatch[0].match(/<ForexBuying>([\d.]+)<\/ForexBuying>/);
        if (forexBuyingMatch) {
          usdRate = parseFloat(forexBuyingMatch[1]);
        }
      }

      // Eğer TCMB'den alamazsak, alternatif kaynak
      if (usdRate === 0) {
        console.log('TCMB kurları alınamadı, alternatif API deneniyor...');
        return this.fetchRatesFromAlternative();
      }

      console.log(`📈 TCMB Döviz Kurları: USD = ${usdRate} TL`);
      return { USD: usdRate };

    } catch (error) {
      console.error('TCMB API hatası:', error);
      return this.fetchRatesFromAlternative();
    }
  }

  /**
   * Alternatif kaynak: ExchangeRate-API (ücretsiz tier)
   */
  private async fetchRatesFromAlternative(): Promise<ExchangeRateData> {
    try {
      // Ücretsiz API (günlük limit var)
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/TRY', {
        timeout: 5000
      });

      const usdRate = 1 / response.data.rates.USD;
      console.log(`📈 Alternatif API Döviz Kurları: USD = ${usdRate} TL`);
      
      return { USD: usdRate };

    } catch (error) {
      console.error('Alternatif API hatası:', error);
      // Fallback değer (veritabanından son kaydedileni al)
      return this.getStoredRates();
    }
  }

  /**
   * Veritabanından son kaydedilen kurları al
   */
  private async getStoredRates(): Promise<ExchangeRateData> {
    try {
      const storedRate = await prisma.exchangeRate.findUnique({
        where: {
          source_currency_target_currency: {
            source_currency: 'TRY',
            target_currency: 'USD'
          }
        }
      });

      if (storedRate) {
        const usdRate = parseFloat(storedRate.rate.toString());
        console.log(`💾 Veritabanından Döviz Kuru: USD = ${usdRate} TL`);
        return { USD: usdRate };
      }

      // Hiç kayıt yoksa varsayılan değer
      console.warn('⚠️ Döviz kuru bulunamadı, varsayılan değer kullanılıyor');
      return { USD: 32.0 }; // Varsayılan kur

    } catch (error) {
      console.error('Veritabanı hatası:', error);
      return { USD: 32.0 };
    }
  }

  /**
   * Güncel döviz kurlarını al (cache ile)
   */
  public async getRates(): Promise<ExchangeRateData> {
    // Cache kontrol
    if (this.cachedRates && this.cacheExpiry && this.cacheExpiry > new Date()) {
      console.log('📦 Döviz kurları cache\'den alındı');
      return this.cachedRates;
    }

    // Yeni kurları al
    const rates = await this.fetchRatesFromTCMB();

    // Cache güncelle
    this.cachedRates = rates;
    this.cacheExpiry = new Date();
    this.cacheExpiry.setMinutes(this.cacheExpiry.getMinutes() + this.CACHE_DURATION_MINUTES);

    // Veritabanına kaydet (async, beklemiyoruz)
    this.saveRatesToDatabase(rates).catch(err => 
      console.error('Kurlar veritabanına kaydedilemedi:', err)
    );

    return rates;
  }

  /**
   * Kurları veritabanına kaydet
   */
  private async saveRatesToDatabase(rates: ExchangeRateData): Promise<void> {
    try {
      await prisma.exchangeRate.upsert({
        where: {
          source_currency_target_currency: {
            source_currency: 'TRY',
            target_currency: 'USD'
          }
        },
        update: {
          rate: rates.USD,
          updated_at: new Date()
        },
        create: {
          source_currency: 'TRY',
          target_currency: 'USD',
          rate: rates.USD
        }
      });
      console.log('✅ Döviz kurları veritabanına kaydedildi');
    } catch (error) {
      console.error('Döviz kurları kayıt hatası:', error);
    }
  }

  /**
   * TL'den USD'ye çevir
   */
  public async convertTRYtoUSD(amountTRY: number): Promise<number> {
    const rates = await this.getRates();
    return amountTRY / rates.USD;
  }

  /**
   * USD'den TL'ye çevir
   */
  public async convertUSDtoTRY(amountUSD: number): Promise<number> {
    const rates = await this.getRates();
    return amountUSD * rates.USD;
  }

  /**
   * Cache'i temizle (manuel güncelleme için)
   */
  public clearCache(): void {
    this.cachedRates = null;
    this.cacheExpiry = null;
    console.log('🗑️ Döviz kuru cache temizlendi');
  }
}

// Singleton instance export
export const exchangeRateService = ExchangeRateService.getInstance();