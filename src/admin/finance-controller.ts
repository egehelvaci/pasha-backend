import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { exchangeRateService } from '../services/exchange-rate-service';

export class FinanceController {
  /**
   * Mağazanın muhasebe hareketlerini getir (Döviz desteği ile)
   * @route GET /api/admin/finance/transactions
   * @query storeId - Mağaza ID'si
   * @query currency - Para birimi filtresi (TRY, USD, veya boş)
   * @query convertTo - Çevrilecek para birimi (TRY veya USD)
   */
  async getTransactions(req: Request, res: Response) {
    try {
      const { storeId, currency, convertTo, separateCurrencies = false } = req.query;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID gerekli'
        });
      }

      // Mağaza bilgilerini al
      const store = await prisma.store.findUnique({
        where: { store_id: storeId as string },
        select: {
          store_id: true,
          kurum_adi: true,
          currency: true,
          bakiye: true
        }
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Mağaza bulunamadı'
        });
      }

      // Muhasebe hareketlerini getir
      const transactions = await prisma.muhasebeHareketleri.findMany({
        where: {
          storeId: storeId as string
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Currency separation opsiyonu kontrolü
      if (separateCurrencies === 'true' || separateCurrencies) {
        return this.getTransactionsWithCurrencySeparation(transactions, store, res);
      }

      // Para birimi bazlı işlemleri filtrele ve/veya çevir
      let processedTransactions = [];
      
      for (const transaction of transactions) {
        let amount = Number(transaction.tutar);
        let displayCurrency = store.currency || 'TRY';
        let originalAmount = amount;
        let convertedAmount = null;
        
        // İşlem açıklamasından para birimini tespit et
        const isUSDTransaction = transaction.aciklama?.includes('USD') || 
                                transaction.islemTuru?.includes('USD');
        const isTRYTransaction = !isUSDTransaction;
        
        // Orijinal para birimini belirle
        const originalCurrency = isUSDTransaction ? 'USD' : 'TRY';
        
        // Currency filtrelemesi
        if (currency) {
          if (currency === 'USD' && !isUSDTransaction) continue;
          if (currency === 'TRY' && !isTRYTransaction) continue;
        }
        
        // Para birimi çevirimi
        if (convertTo) {
          if (convertTo === 'USD' && originalCurrency === 'TRY') {
            convertedAmount = await exchangeRateService.convertTRYtoUSD(amount);
            displayCurrency = 'USD';
            amount = convertedAmount;
          } else if (convertTo === 'TRY' && originalCurrency === 'USD') {
            convertedAmount = await exchangeRateService.convertUSDtoTRY(amount);
            displayCurrency = 'TRY';
            amount = convertedAmount;
          }
        } else {
          displayCurrency = originalCurrency;
        }
        
        processedTransactions.push({
          id: transaction.id,
          storeId: transaction.storeId,
          islemTuru: transaction.islemTuru,
          tutar: amount,
          originalTutar: originalAmount,
          currency: displayCurrency,
          originalCurrency,
          harcama: transaction.harcama,
          tarih: transaction.tarih,
          aciklama: transaction.aciklama,
          createdAt: transaction.createdAt,
          isManuelSatis: transaction.isManuelSatis,
          fisNumarasi: transaction.fisNumarasi,
          converted: !!convertedAmount
        });
      }

      // Özet bilgileri hesapla
      const summary = {
        totalIncome: processedTransactions
          .filter(t => !t.harcama)
          .reduce((sum, t) => sum + t.tutar, 0),
        totalExpense: processedTransactions
          .filter(t => t.harcama)
          .reduce((sum, t) => sum + t.tutar, 0),
        balance: 0,
        currency: convertTo || store.currency || 'TRY',
        transactionCount: processedTransactions.length
      };
      
      summary.balance = summary.totalIncome - summary.totalExpense;

      return res.status(200).json({
        success: true,
        data: {
          store: {
            store_id: store.store_id,
            kurum_adi: store.kurum_adi,
            currency: store.currency,
            bakiye: store.bakiye
          },
          transactions: processedTransactions,
          summary
        }
      });

    } catch (error) {
      console.error('Muhasebe hareketleri getirme hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Muhasebe hareketleri getirilemedi'
      });
    }
  }

  /**
   * Döviz bazlı sipariş özeti
   * @route GET /api/admin/finance/orders-summary
   * @query storeId - Mağaza ID'si
   * @query currency - Para birimi (TRY veya USD)
   * @query startDate - Başlangıç tarihi
   * @query endDate - Bitiş tarihi
   */
  async getOrdersSummary(req: Request, res: Response) {
    try {
      const { storeId, currency, startDate, endDate } = req.query;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID gerekli'
        });
      }

      // Tarih filtreleri
      const whereConditions: any = {};
      if (startDate) {
        whereConditions.created_at = {
          ...whereConditions.created_at,
          gte: new Date(startDate as string)
        };
      }
      if (endDate) {
        whereConditions.created_at = {
          ...whereConditions.created_at,
          lte: new Date(endDate as string)
        };
      }

      // Mağaza kullanıcılarını bul
      const storeUsers = await prisma.user.findMany({
        where: { store_id: storeId as string },
        select: { userId: true }
      });

      const userIds = storeUsers.map(u => u.userId);

      // Siparişleri getir
      const orders = await prisma.order.findMany({
        where: {
          user_id: { in: userIds },
          ...whereConditions
        },
        include: {
          user: {
            include: {
              Store: true
            }
          }
        }
      });

      // Store bilgilerini al
      const store = await prisma.store.findUnique({
        where: { store_id: storeId as string },
        select: {
          currency: true,
          kurum_adi: true
        }
      });

      const storeCurrency = store?.currency || 'TRY';
      const targetCurrency = currency || storeCurrency;

      // Siparişleri işle ve çevir
      let processedOrders = [];
      let totalAmount = 0;

      for (const order of orders) {
        let amount = Number(order.total_price);
        
        // Para birimi çevirimi gerekiyorsa
        if (targetCurrency !== storeCurrency) {
          if (targetCurrency === 'USD' && storeCurrency === 'TRY') {
            amount = await exchangeRateService.convertTRYtoUSD(amount);
          } else if (targetCurrency === 'TRY' && storeCurrency === 'USD') {
            amount = await exchangeRateService.convertUSDtoTRY(amount);
          }
        }

        totalAmount += amount;

        processedOrders.push({
          id: order.id,
          user_name: `${order.user.name} ${order.user.surname}`,
          total_price: amount,
          currency: targetCurrency,
          status: order.status,
          created_at: order.created_at
        });
      }

      // Durum bazlı özet
      const statusSummary = {
        PENDING: 0,
        CONFIRMED: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELED: 0,
        READY: 0
      };

      for (const order of processedOrders) {
        if (statusSummary.hasOwnProperty(order.status)) {
          statusSummary[order.status as keyof typeof statusSummary] += order.total_price;
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          store: {
            store_id: storeId,
            kurum_adi: store?.kurum_adi,
            defaultCurrency: storeCurrency,
            displayCurrency: targetCurrency
          },
          orders: processedOrders,
          summary: {
            totalAmount,
            orderCount: processedOrders.length,
            currency: targetCurrency,
            statusSummary,
            averageOrderValue: processedOrders.length > 0 ? 
              (totalAmount / processedOrders.length).toFixed(2) : 0
          }
        }
      });

    } catch (error) {
      console.error('Sipariş özeti hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Sipariş özeti getirilemedi'
      });
    }
  }

  /**
   * Güncel döviz kurlarını getir
   * @route GET /api/admin/finance/exchange-rates
   */
  async getExchangeRates(req: Request, res: Response) {
    try {
      const rates = await exchangeRateService.getRates();
      
      // Veritabanından kayıtlı kurları da getir
      const dbRates = await prisma.exchangeRate.findMany({
        where: { is_active: true },
        orderBy: { updated_at: 'desc' }
      });

      return res.status(200).json({
        success: true,
        data: {
          live: {
            USD_TRY: rates.USD,
            TRY_USD: (1 / rates.USD).toFixed(4),
            source: 'TCMB/API',
            lastUpdate: new Date()
          },
          stored: dbRates.map(rate => ({
            source: rate.source_currency,
            target: rate.target_currency,
            rate: Number(rate.rate),
            updated_at: rate.updated_at
          }))
        }
      });

    } catch (error) {
      console.error('Döviz kuru hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Döviz kurları getirilemedi'
      });
    }
  }

  /**
   * Döviz çevrimi hesaplama
   * @route POST /api/admin/finance/convert
   */
  async convertCurrency(req: Request, res: Response) {
    try {
      const { amount, from, to } = req.body;

      if (!amount || !from || !to) {
        return res.status(400).json({
          success: false,
          message: 'amount, from ve to parametreleri gerekli'
        });
      }

      let result;
      
      if (from === 'TRY' && to === 'USD') {
        result = await exchangeRateService.convertTRYtoUSD(Number(amount));
      } else if (from === 'USD' && to === 'TRY') {
        result = await exchangeRateService.convertUSDtoTRY(Number(amount));
      } else if (from === to) {
        result = Number(amount);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Desteklenmeyen döviz çevrimi'
        });
      }

      const rates = await exchangeRateService.getRates();

      return res.status(200).json({
        success: true,
        data: {
          original: {
            amount: Number(amount),
            currency: from
          },
          converted: {
            amount: result,
            currency: to
          },
          rate: from === 'TRY' ? rates.USD : (1 / rates.USD),
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Döviz çevrimi hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Döviz çevrimi yapılamadı'
      });
    }
  }

  /**
   * Currency bazında ayrılmış işlemler
   */
  private async getTransactionsWithCurrencySeparation(
    transactions: any[],
    store: any,
    res: Response
  ) {
    // Currency bazında gruplama
    const groupedByCurrency: any = {
      TRY: [],
      USD: []
    };

    for (const transaction of transactions) {
      // Currency bilgisini al (yeni alan varsa kullan, yoksa varsayılan mantıkla belirle)
      const txCurrency = transaction.currency || 
        (transaction.aciklama?.includes('USD') || transaction.islemTuru?.includes('USD') ? 'USD' : 'TRY');
      
      if (groupedByCurrency[txCurrency]) {
        groupedByCurrency[txCurrency].push({
          ...transaction,
          currency: txCurrency,
          tutar: Number(transaction.tutar)
        });
      }
    }

    // Currency bazında özet hesapla
    const currencySummaries: any = {};
    
    for (const curr of ['TRY', 'USD']) {
      const currTransactions = groupedByCurrency[curr];
      currencySummaries[curr] = {
        totalIncome: currTransactions
          .filter((t: any) => !t.harcama)
          .reduce((sum: number, t: any) => sum + t.tutar, 0),
        totalExpense: currTransactions
          .filter((t: any) => t.harcama)
          .reduce((sum: number, t: any) => sum + t.tutar, 0),
        balance: 0,
        transactionCount: currTransactions.length,
        currency: curr
      };
      currencySummaries[curr].balance = 
        currencySummaries[curr].totalIncome - currencySummaries[curr].totalExpense;
    }

    return res.status(200).json({
      success: true,
      data: {
        store: {
          store_id: store.store_id,
          kurum_adi: store.kurum_adi,
          currency: store.currency,
          bakiye: store.bakiye
        },
        transactions: groupedByCurrency,
        summary: currencySummaries,
        separatedByCurrency: true
      }
    });
  }

  /**
   * Currency analizi endpoint'i
   * @route GET /api/admin/finance/currency-analysis
   */
  async getCurrencyAnalysis(req: Request, res: Response) {
    try {
      const { storeId, startDate, endDate } = req.query;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID gerekli'
        });
      }

      // Store bilgilerini al
      const store = await prisma.store.findUnique({
        where: { store_id: storeId as string },
        select: { 
          currency: true, 
          kurum_adi: true,
          store_id: true
        }
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Mağaza bulunamadı'
        });
      }

      // Tarih filtreleri
      const dateFilters: any = {};
      if (startDate) {
        dateFilters.created_at = {
          ...dateFilters.created_at,
          gte: new Date(startDate as string)
        };
      }
      if (endDate) {
        dateFilters.created_at = {
          ...dateFilters.created_at,
          lte: new Date(endDate as string)
        };
      }

      // Currency bazında siparişleri al
      const storeUsers = await prisma.user.findMany({
        where: { store_id: storeId as string },
        select: { userId: true }
      });

      const userIds = storeUsers.map(u => u.userId);

      const orders = await prisma.order.findMany({
        where: {
          user_id: { in: userIds },
          ...dateFilters
        },
        select: {
          id: true,
          total_price: true,
          order_currency: true,
          payment_currency: true,
          exchange_rate: true,
          original_amount: true,
          converted_amount: true,
          created_at: true,
          status: true
        }
      });

      // Currency bazında analiz
      const analysis = {
        store: {
          id: storeId,
          name: store.kurum_adi,
          defaultCurrency: store.currency || 'TRY'
        },
        summary: {
          TRY: {
            orderCount: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            orders: [] as any[]
          },
          USD: {
            orderCount: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            orders: [] as any[]
          }
        },
        exchangeRateStats: {
          average: 0,
          min: Number.MAX_VALUE,
          max: 0,
          rates: [] as number[]
        },
        period: {
          start: startDate || 'all',
          end: endDate || 'all'
        }
      };

      // Siparişleri analiz et
      for (const order of orders) {
        const orderCurrency = order.order_currency || 'TRY';
        const totalPrice = Number(order.total_price);
        
        if (orderCurrency === 'TRY' || orderCurrency === 'USD') {
          analysis.summary[orderCurrency].orderCount++;
          analysis.summary[orderCurrency].totalRevenue += totalPrice;
          analysis.summary[orderCurrency].orders.push({
            id: order.id,
            amount: totalPrice,
            date: order.created_at,
            status: order.status
          });
        }

        // Exchange rate istatistikleri
        if (order.exchange_rate) {
          const rate = Number(order.exchange_rate);
          analysis.exchangeRateStats.rates.push(rate);
          analysis.exchangeRateStats.min = Math.min(analysis.exchangeRateStats.min, rate);
          analysis.exchangeRateStats.max = Math.max(analysis.exchangeRateStats.max, rate);
        }
      }

      // Ortalama hesapla
      for (const curr of ['TRY', 'USD'] as const) {
        if (analysis.summary[curr].orderCount > 0) {
          analysis.summary[curr].averageOrderValue = 
            analysis.summary[curr].totalRevenue / analysis.summary[curr].orderCount;
        }
      }

      // Exchange rate ortalaması
      if (analysis.exchangeRateStats.rates.length > 0) {
        analysis.exchangeRateStats.average = 
          analysis.exchangeRateStats.rates.reduce((a, b) => a + b, 0) / 
          analysis.exchangeRateStats.rates.length;
      } else {
        analysis.exchangeRateStats.min = 0;
      }

      // Muhasebe hareketlerinden de currency bilgisi al
      const transactions = await prisma.muhasebeHareketleri.findMany({
        where: {
          storeId: storeId as string,
          createdAt: dateFilters.created_at
        },
        select: {
          currency: true,
          original_currency: true,
          tutar: true,
          harcama: true,
          exchange_rate: true
        }
      });

      // Transaction bazlı currency özeti
      const transactionSummary = {
        TRY: { income: 0, expense: 0, count: 0 },
        USD: { income: 0, expense: 0, count: 0 }
      };

      for (const tx of transactions) {
        const txCurrency = tx.currency || 'TRY';
        if (txCurrency === 'TRY' || txCurrency === 'USD') {
          transactionSummary[txCurrency].count++;
          if (tx.harcama) {
            transactionSummary[txCurrency].expense += Number(tx.tutar);
          } else {
            transactionSummary[txCurrency].income += Number(tx.tutar);
          }
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          ...analysis,
          transactionSummary
        }
      });

    } catch (error) {
      console.error('Currency analizi hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Currency analizi alınamadı'
      });
    }
  }
}

export const financeController = new FinanceController();