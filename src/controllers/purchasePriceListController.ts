import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { PurchaseCartService } from '../purchase-cart-service';

// Tüm satıcıları getir
export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      include: {
        purchasePriceLists: {
          where: { is_active: true },
          select: {
            id: true,
            name: true,
            description: true,
            currency: true,
            created_at: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: suppliers,
      message: 'Satıcılar başarıyla getirildi'
    });
  } catch (error) {
    console.error('Satıcıları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Satıcılar getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Yeni satıcı oluştur
export const createSupplier = async (req: Request, res: Response) => {
  try {
    const {
      name,
      company_name,
      phone,
      address,
      notes,
      balance = 0,
      currency = 'USD',
      exchange_rate
    } = req.body;

    if (!name || !company_name) {
      return res.status(400).json({
        success: false,
        message: 'Satıcı adı ve firma adı zorunludur'
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı doğrulaması gerekli'
      });
    }

    // Eğer TRY bakiye girilmişse ve dolar kuru varsa, USD'ye çevir
    let usdBalance = balance;
    let originalAmount: number | null = null;
    let originalCurrency: string | null = null;
    let usedExchangeRate: number | null = null;

    if (balance !== 0 && exchange_rate && exchange_rate > 0) {
      console.log(`💱 Satıcı oluşturma kur hesaplaması: ${balance} TRY ÷ ${exchange_rate} kur = ${balance / exchange_rate} USD`);
      usdBalance = parseFloat((balance / exchange_rate).toFixed(2));
      console.log(`💰 Satıcı yuvarlanmış USD tutar: ${usdBalance}`);
      originalAmount = balance;
      originalCurrency = 'TRY';
      usedExchangeRate = exchange_rate;
    }

    // Transaction ile satıcı oluştur ve bakiye işlemi kaydet
    const result = await prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.create({
        data: {
          name,
          company_name,
          phone,
          address,
          notes,
          balance: usdBalance, // USD cinsinden bakiye
          currency
        }
      });

      // Eğer başlangıç bakiyesi 0 değilse, transaction kaydı oluştur
      if (balance !== 0) {
        await tx.supplierBalanceTransaction.create({
          data: {
            supplier_id: supplier.id,
            transaction_type: 'INITIAL_BALANCE',
            amount: usdBalance, // USD cinsinden tutar
            original_amount: originalAmount, // Orijinal TRY tutar
            exchange_rate: usedExchangeRate, // Dolar kuru
            original_currency: originalCurrency,
            previous_balance: 0,
            new_balance: usdBalance,
            description: originalAmount ? 
              `Başlangıç bakiyesi (${originalAmount} TRY → $${usdBalance} USD)` : 
              'Başlangıç bakiyesi',
            created_by: user.userId
          }
        });
      }

      return supplier;
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Satıcı başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Satıcı oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Satıcı oluşturulamadı',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Satıcı güncelle
export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: supplier,
      message: 'Satıcı başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Satıcı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Satıcı güncellenemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Satıcı sil (deaktif et)
export const deactivateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: { is_active: false }
    });

    res.json({
      success: true,
      data: supplier,
      message: 'Satıcı başarıyla deaktif edildi'
    });
  } catch (error) {
    console.error('Satıcı deaktif etme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Satıcı deaktif edilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Tüm alış fiyat listelerini getir
export const getAllPurchasePriceLists = async (req: Request, res: Response) => {
  try {
    const purchasePriceLists = await prisma.purchasePriceList.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company_name: true
          }
        },
        details: {
          include: {
            collection: {
              select: {
                collectionId: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: purchasePriceLists,
      message: 'Alış fiyat listeleri başarıyla getirildi'
    });
  } catch (error) {
    console.error('Alış fiyat listelerini getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Alış fiyat listeleri getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// ID'ye göre alış fiyat listesi getir
export const getPurchasePriceListById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const purchasePriceList = await prisma.purchasePriceList.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company_name: true
          }
        },
        details: {
          include: {
            collection: {
              select: {
                collectionId: true,
                name: true,
                code: true
              }
            }
          },
          orderBy: {
            collection: {
              name: 'asc'
            }
          }
        }
      }
    });

    if (!purchasePriceList) {
      return res.status(404).json({
        success: false,
        message: 'Alış fiyat listesi bulunamadı'
      });
    }

    res.json({
      success: true,
      data: purchasePriceList,
      message: 'Alış fiyat listesi başarıyla getirildi'
    });
  } catch (error) {
    console.error('Alış fiyat listesi getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Alış fiyat listesi getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Yeni alış fiyat listesi oluştur
export const createPurchasePriceList = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      supplier_id,
      currency = 'USD',
      collectionPrices
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Fiyat listesi adı zorunludur'
      });
    }

    // Transaction ile alış fiyat listesi ve detaylarını oluştur
    const result = await prisma.$transaction(async (tx) => {
      // Alış fiyat listesini oluştur
      const purchasePriceList = await tx.purchasePriceList.create({
        data: {
          name,
          description,
          supplier_id,
          currency
        }
      });

      // Koleksiyon fiyatları varsa detayları oluştur
      if (collectionPrices && Array.isArray(collectionPrices)) {
        for (const item of collectionPrices) {
          if (!item.collection_id || !item.price_per_square_meter) {
            throw new Error('Koleksiyon ID ve metrekare fiyatı zorunludur');
          }

          await tx.purchasePriceListDetail.create({
            data: {
              purchase_price_list_id: purchasePriceList.id,
              collection_id: item.collection_id,
              price_per_square_meter: item.price_per_square_meter
            }
          });
        }
      }

      return purchasePriceList;
    });

    // Oluşturulan fiyat listesini detaylarıyla birlikte getir
    const createdPriceList = await prisma.purchasePriceList.findUnique({
      where: { id: result.id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company_name: true
          }
        },
        details: {
          include: {
            collection: {
              select: {
                collectionId: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: createdPriceList,
      message: 'Alış fiyat listesi başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Alış fiyat listesi oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Alış fiyat listesi oluşturulamadı',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Alış fiyat listesi güncelle
export const updatePurchasePriceList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      supplier_id,
      currency,
      collectionPrices
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Alış fiyat listesi bilgilerini güncelle
      const purchasePriceList = await tx.purchasePriceList.update({
        where: { id },
        data: {
          name,
          description,
          supplier_id,
          currency
        }
      });

      // Eğer koleksiyon fiyatları gönderildiyse, mevcut detayları güncelle
      if (collectionPrices && Array.isArray(collectionPrices)) {
        for (const item of collectionPrices) {
          if (!item.collection_id || !item.price_per_square_meter) {
            throw new Error('Koleksiyon ID ve metrekare fiyatı zorunludur');
          }

          await tx.purchasePriceListDetail.upsert({
            where: {
              purchase_price_list_id_collection_id: {
                purchase_price_list_id: id,
                collection_id: item.collection_id
              }
            },
            update: {
              price_per_square_meter: item.price_per_square_meter
            },
            create: {
              purchase_price_list_id: id,
              collection_id: item.collection_id,
              price_per_square_meter: item.price_per_square_meter
            }
          });
        }
      }

      return purchasePriceList;
    });

    // Güncellenmiş fiyat listesini detaylarıyla birlikte getir
    const updatedPriceList = await prisma.purchasePriceList.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company_name: true
          }
        },
        details: {
          include: {
            collection: {
              select: {
                collectionId: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedPriceList,
      message: 'Alış fiyat listesi başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Alış fiyat listesi güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Alış fiyat listesi güncellenemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Alış fiyat listesi sil (deaktif et)
export const deactivatePurchasePriceList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const purchasePriceList = await prisma.purchasePriceList.update({
      where: { id },
      data: { is_active: false }
    });

    res.json({
      success: true,
      data: purchasePriceList,
      message: 'Alış fiyat listesi başarıyla deaktif edildi'
    });
  } catch (error) {
    console.error('Alış fiyat listesi deaktif etme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Alış fiyat listesi deaktif edilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Belirli bir koleksiyon için fiyat güncelle
export const updateCollectionPrice = async (req: Request, res: Response) => {
  try {
    const { listId, collectionId } = req.params;
    const { price_per_square_meter } = req.body;

    if (!price_per_square_meter || price_per_square_meter <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir metrekare fiyatı giriniz'
      });
    }

    const detail = await prisma.purchasePriceListDetail.upsert({
      where: {
        purchase_price_list_id_collection_id: {
          purchase_price_list_id: listId,
          collection_id: collectionId
        }
      },
      update: {
        price_per_square_meter
      },
      create: {
        purchase_price_list_id: listId,
        collection_id: collectionId,
        price_per_square_meter
      },
      include: {
        collection: {
          select: {
            collectionId: true,
            name: true,
            code: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: detail,
      message: 'Koleksiyon fiyatı başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Koleksiyon fiyatı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Koleksiyon fiyatı güncellenemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Varsayılan alış fiyat listesini getir
export const getDefaultPurchasePriceList = async (req: Request, res: Response) => {
  try {
    const defaultPriceList = await prisma.purchasePriceList.findFirst({
      where: { 
        name: 'Varsayılan Alış Fiyat Listesi',
        is_active: true 
      },
      include: {
        details: {
          include: {
            collection: {
              select: {
                collectionId: true,
                name: true,
                code: true
              }
            }
          },
          orderBy: {
            collection: {
              name: 'asc'
            }
          }
        }
      }
    });

    if (!defaultPriceList) {
      return res.status(404).json({
        success: false,
        message: 'Varsayılan alış fiyat listesi bulunamadı. Lütfen önce oluşturun.'
      });
    }

    res.json({
      success: true,
      data: defaultPriceList,
      message: 'Varsayılan alış fiyat listesi başarıyla getirildi'
    });
  } catch (error) {
    console.error('Varsayılan alış fiyat listesi getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Varsayılan alış fiyat listesi getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Satıcı bakiyesi güncelle
export const updateSupplierBalance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, transaction_type, description, reference_number, exchange_rate } = req.body;

    if (!amount || amount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir tutar giriniz'
      });
    }

    if (!transaction_type) {
      return res.status(400).json({
        success: false,
        message: 'İşlem türü zorunludur'
      });
    }

    if (!exchange_rate || exchange_rate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir dolar kuru giriniz'
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı doğrulaması gerekli'
      });
    }

    // USD cinsinden tutarı hesapla (TRY amount / dolar kuru)
    console.log(`💱 Kur hesaplaması: ${amount} TRY ÷ ${exchange_rate} kur = ${amount / exchange_rate} USD`);
    const usdAmount = parseFloat((amount / exchange_rate).toFixed(2));
    console.log(`💰 Yuvarlanmış USD tutar: ${usdAmount}`);

    // Transaction ile bakiye güncelle
    const result = await prisma.$transaction(async (tx) => {
      // Mevcut satıcıyı getir
      const supplier = await tx.supplier.findUnique({
        where: { id }
      });

      if (!supplier) {
        throw new Error('Satıcı bulunamadı');
      }

      const previousBalance = supplier.balance;
      console.log(`💰 Önceki bakiye: ${previousBalance}, Ödeme tutarı: +${usdAmount}`);
      const newBalance = previousBalance.plus(usdAmount);
      console.log(`💰 Yeni bakiye: ${newBalance}`);

      // Satıcı bakiyesini güncelle (USD cinsinden)
      const updatedSupplier = await tx.supplier.update({
        where: { id },
        data: { balance: newBalance }
      });

      // İşlem kaydı oluştur
      await tx.supplierBalanceTransaction.create({
        data: {
          supplier_id: id,
          transaction_type,
          amount: usdAmount, // USD cinsinden tutar
          original_amount: amount, // Orijinal TRY tutar
          exchange_rate: exchange_rate, // Dolar kuru
          original_currency: 'TRY',
          previous_balance: previousBalance,
          new_balance: newBalance,
          description,
          reference_number,
          created_by: user.userId
        }
      });

      return updatedSupplier;
    });

    res.json({
      success: true,
      data: {
        ...result,
        transaction_info: {
          original_amount: amount,
          exchange_rate: exchange_rate,
          usd_amount: usdAmount,
          original_currency: 'TRY'
        }
      },
      message: `Satıcı bakiyesi başarıyla güncellendi. ${amount} TRY (${exchange_rate} kurdan) = $${usdAmount} USD`
    });
  } catch (error) {
    console.error('Satıcı bakiye güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Satıcı bakiyesi güncellenemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Satıcı bakiye geçmişi getir
export const getSupplierBalanceHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      prisma.supplierBalanceTransaction.findMany({
        where: { supplier_id: id },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
        include: {
          supplier: {
            select: {
              name: true,
              company_name: true
            }
          }
        }
      }),
      prisma.supplierBalanceTransaction.count({
        where: { supplier_id: id }
      })
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      },
      message: 'Satıcı bakiye geçmişi başarıyla getirildi'
    });
  } catch (error) {
    console.error('Satıcı bakiye geçmişi getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Satıcı bakiye geçmişi getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Satıcı bakiye özeti ve borç raporu
export const getSupplierBalanceSummary = async (req: Request, res: Response) => {
  try {
    // Tüm satıcıların bakiye bilgilerini getir
    const suppliers = await prisma.supplier.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        company_name: true,
        balance: true,
        currency: true,
        updated_at: true
      },
      orderBy: { balance: 'asc' } // Borçlular önce gelsin
    });

    // Özet istatistikleri hesapla
    const summary = suppliers.reduce((acc, supplier) => {
      const balance = parseFloat(supplier.balance.toString());
      
      if (balance > 0) {
        acc.totalReceivable += balance;
        acc.receivableCount++;
      } else if (balance < 0) {
        acc.totalPayable += Math.abs(balance);
        acc.payableCount++;
      } else {
        acc.neutralCount++;
      }
      
      return acc;
    }, {
      totalReceivable: 0, // Toplam alacak
      totalPayable: 0,    // Toplam borç
      receivableCount: 0,
      payableCount: 0,
      neutralCount: 0
    });

    // Borçlu satıcılar (negatif bakiye)
    const debtors = suppliers.filter(s => parseFloat(s.balance.toString()) < 0);
    
    // Alacaklı satıcılar (pozitif bakiye)
    const creditors = suppliers.filter(s => parseFloat(s.balance.toString()) > 0);

    res.json({
      success: true,
      data: {
        summary: {
          ...summary,
          totalSuppliers: suppliers.length,
          netBalance: summary.totalReceivable - summary.totalPayable
        },
        debtors: debtors.map(s => ({
          ...s,
          debt: Math.abs(parseFloat(s.balance.toString()))
        })),
        creditors,
        allSuppliers: suppliers
      },
      message: 'Satıcı bakiye özeti başarıyla getirildi'
    });
  } catch (error) {
    console.error('Satıcı bakiye özeti getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Satıcı bakiye özeti getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Satıcıdan ürün alımı yap
export const purchaseProductFromSupplier = async (req: Request, res: Response) => {
  try {
    const { supplier_id } = req.params;
    const { 
      product_id, 
      quantity_m2, 
      description = 'Ürün alımı',
      reference_number 
    } = req.body;

    if (!product_id || !quantity_m2 || quantity_m2 <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Ürün ID ve geçerli m² miktarı zorunludur'
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı doğrulaması gerekli'
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Satıcıyı kontrol et
      const supplier = await tx.supplier.findUnique({
        where: { id: supplier_id }
      });

      if (!supplier || !supplier.is_active) {
        throw new Error('Satıcı bulunamadı veya aktif değil');
      }

      // Ürünü ve koleksiyonunu getir
      const product = await tx.product.findUnique({
        where: { productId: product_id },
        include: {
          collection: true
        }
      });

      if (!product) {
        throw new Error('Ürün bulunamadı');
      }

      // Bu koleksiyon için alış fiyatını getir
      const purchasePriceDetail = await tx.purchasePriceListDetail.findFirst({
        where: {
          collection_id: product.collectionId,
          purchasePriceList: {
            name: 'Varsayılan Alış Fiyat Listesi',
            is_active: true
          }
        },
        include: {
          purchasePriceList: true
        }
      });

      if (!purchasePriceDetail) {
        throw new Error(`${product.collection.name} koleksiyonu için alış fiyat bilgisi bulunamadı`);
      }

      // Toplam alış tutarını hesapla (USD cinsinden)
      const unitPriceUSD = parseFloat(purchasePriceDetail.price_per_square_meter.toString());
      const totalUSD = parseFloat((unitPriceUSD * quantity_m2).toFixed(2));

      // Satıcı bakiyesini güncelle (borç artışı - negatif)
      const previousBalance = supplier.balance;
      const newBalance = previousBalance.minus(totalUSD);

      const updatedSupplier = await tx.supplier.update({
        where: { id: supplier_id },
        data: { balance: newBalance }
      });

      // İşlem kaydı oluştur
      const transaction = await tx.supplierBalanceTransaction.create({
        data: {
          supplier_id: supplier_id,
          transaction_type: 'PRODUCT_PURCHASE',
          amount: -totalUSD, // Negatif (borç artışı) - USD cinsinden
          original_amount: null, // Orijinal tutar yok (direkt USD)
          exchange_rate: null, // Dolar kuru yok
          original_currency: null, // Orijinal para birimi yok
          previous_balance: previousBalance,
          new_balance: newBalance,
          description: `${description} - ${product.name} (${quantity_m2} m² x $${unitPriceUSD}/m²)`,
          reference_number,
          created_by: user.userId
        }
      });

      // Ürün stoklarını güncelle
      // Önce mevcut varyasyonları kontrol et
      const existingVariations = await tx.productvariations.findMany({
        where: { product_id: product_id }
      });

      if (existingVariations.length > 0) {
        // Mevcut varyasyonlar varsa, ilk varyasyona stok ekle
        const firstVariation = existingVariations[0];
        await tx.productvariations.update({
          where: { id: firstVariation.id },
          data: {
            stock_area_m2: {
              increment: quantity_m2
            }
          }
        });
      } else {
        // Varyasyon yoksa yeni bir tane oluştur
        await tx.productvariations.create({
          data: {
            product_id: product_id,
            cut_type_id: 1, // Varsayılan kesim tipi
            has_fringe: false,
            width: 100, // Varsayılan boyutlar
            height: 100,
            stock_quantity: 1,
            stock_area_m2: quantity_m2
          }
        });
      }

      return {
        supplier: updatedSupplier,
        product: product,
        transaction: transaction,
        purchase_details: {
          quantity_m2: quantity_m2,
          unit_price_usd: unitPriceUSD,
          total_usd: totalUSD
        }
      };
    });

    res.json({
      success: true,
      data: result,
      message: `Satıcıdan ${quantity_m2} m² ürün alımı başarıyla gerçekleştirildi. Toplam: $${result.purchase_details.total_usd} USD`
    });

  } catch (error) {
    console.error('Satıcıdan ürün alımı hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün alımı gerçekleştirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

const purchaseCartService = new PurchaseCartService();

// Satıcı alım sepetine ürün ekleme
export const addToPurchaseCart = async (req: Request, res: Response) => {
  try {
    const { supplier_id } = req.params;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    const { productId, quantity, width, height, hasFringe, cutType, notes } = req.body;

    // Zorunlu alanları kontrol et
    if (!productId || !quantity || !width || !height || hasFringe === undefined || !cutType) {
      return res.status(400).json({
        success: false,
        message: 'productId, quantity, width, height, hasFringe ve cutType zorunlu alanlarıdır'
      });
    }

    // Sayısal değerleri kontrol et
    if (quantity <= 0 || width <= 0 || height <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Miktar, genişlik ve yükseklik pozitif değerler olmalıdır'
      });
    }

    const cartItem = await purchaseCartService.addToPurchaseCart({
      supplierId: supplier_id,
      userId,
      productId,
      quantity: Number(quantity),
      width: Number(width),
      height: Number(height),
      hasFringe: Boolean(hasFringe),
      cutType,
      notes
    });

    res.status(201).json({
      success: true,
      data: cartItem,
      message: 'Ürün alım sepetine eklendi'
    });
  } catch (error) {
    console.error('Alım sepetine ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün alım sepetine eklenirken hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Satıcı alım sepetini getir
export const getPurchaseCart = async (req: Request, res: Response) => {
  try {
    const { supplier_id } = req.params;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    const cart = await purchaseCartService.getPurchaseCart(supplier_id, userId);
    const total = await purchaseCartService.calculatePurchaseCartTotal(supplier_id, userId);

    res.json({
      success: true,
      data: {
        cart,
        total: {
          amount: total,
          currency: 'USD',
          formatted: `$${total.toFixed(2)}`
        }
      },
      message: 'Alım sepeti başarıyla getirildi'
    });
  } catch (error) {
    console.error('Alım sepeti getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Alım sepeti getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Alım sepeti öğesini güncelle
export const updatePurchaseCartItem = async (req: Request, res: Response) => {
  try {
    const { item_id } = req.params;
    const { quantity, width, height, hasFringe, cutType, notes } = req.body;

    const updatedItem = await purchaseCartService.updatePurchaseCartItem({
      purchaseCartItemId: parseInt(item_id),
      quantity: quantity ? Number(quantity) : undefined,
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      hasFringe: hasFringe !== undefined ? Boolean(hasFringe) : undefined,
      cutType,
      notes
    });

    res.json({
      success: true,
      data: updatedItem,
      message: 'Alım sepeti öğesi başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Alım sepeti öğesi güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Alım sepeti öğesi güncellenemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Alım sepeti öğesini sil
export const removePurchaseCartItem = async (req: Request, res: Response) => {
  try {
    const { item_id } = req.params;

    await purchaseCartService.removePurchaseCartItem(parseInt(item_id));

    res.json({
      success: true,
      message: 'Alım sepeti öğesi başarıyla silindi'
    });
  } catch (error) {
    console.error('Alım sepeti öğesi silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Alım sepeti öğesi silinemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Alım sepetinden satın alma işlemi - Ana API fonksiyonu
export const purchaseFromCart = async (req: Request, res: Response) => {
  try {
    const { supplier_id } = req.params;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli'
      });
    }

    // Kullanıcı bilgilerini kontrol et
    const user = await prisma.user.findUnique({
      where: { userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Alım sepetini getir
    const cart = await purchaseCartService.getPurchaseCart(supplier_id, userId);
    
    if (!cart || !cart.items.length) {
      return res.status(400).json({
        success: false,
        message: 'Alım sepeti boş veya bulunamadı'
      });
    }

    // Satıcıyı kontrol et
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplier_id, is_active: true }
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Satıcı bulunamadı veya aktif değil'
      });
    }

    // Toplam tutarı hesapla
    const totalAmount = await purchaseCartService.calculatePurchaseCartTotal(supplier_id, userId);

    const result = await prisma.$transaction(async (tx) => {
      // Satıcı bakiyesini güncelle (borç artışı - negatif)
      const previousBalance = supplier.balance;
      const newBalance = previousBalance.minus(totalAmount);

      const updatedSupplier = await tx.supplier.update({
        where: { id: supplier_id },
        data: { balance: newBalance }
      });

      // Satıcı bakiye işlemi kaydı oluştur
      const transaction = await tx.supplierBalanceTransaction.create({
        data: {
          supplier_id: supplier_id,
          transaction_type: 'CART_PURCHASE',
          amount: -totalAmount, // Negatif (borç artışı) - USD cinsinden
          original_amount: null, // Orijinal tutar yok (direkt USD)
          exchange_rate: null, // Dolar kuru yok
          original_currency: null, // Orijinal para birimi yok
          previous_balance: previousBalance,
          new_balance: newBalance,
          description: `Alım sepetinden toplu satın alma - ${cart.items.length} ürün`,
          reference_number: `CART-${Date.now()}`,
          created_by: userId
        }
      });

      // Her sepet öğesi için stok güncelleme (sipariş mantığının tersi - stok artırma)
      const stockUpdates = [];
      for (const item of cart.items) {
        console.log(`🔄 Stok artırma işlemi başlıyor: ${item.product_id}`);
        console.log(`📦 Miktar: ${item.quantity}, Boyut: ${item.width}x${item.height}cm, Saçak: ${item.has_fringe}`);

        // Ürün bilgilerini ve kurallarını getir
        const product = await tx.product.findUnique({
          where: { productId: item.product_id },
          include: {
            productrules: {
              include: {
                productsizeoptions: true
              }
            }
          }
        });

        if (!product) {
          console.log(`❌ Ürün bulunamadı: ${item.product_id}`);
          continue;
        }

        // Satın alınan ürünün gerçek ölçüleri
        const itemWidth = parseFloat(item.width.toString());
        const itemHeight = parseFloat(item.height.toString());
        const itemHasFringe = item.has_fringe || false;

        console.log(`📏 Alınan ürün ölçüleri: ${itemWidth}x${itemHeight}cm, Saçak: ${itemHasFringe}`);

        // Cut type mapping
        const cutTypeMapping: { [key: string]: number } = {
          'rectangle': 1,
          'round': 2,
          'oval': 3,
          'hexagon': 4,
          'star': 5
        };
        const itemCutType = (item.cut_type as string) || 'rectangle';
        const cutTypeId = cutTypeMapping[itemCutType] || 1;

        // Size options varsa hedef boyutları belirle
        let targetWidth = itemWidth;
        let targetHeight = itemHeight;

        if (product.productrules?.productsizeoptions) {
          const sizeOptions = product.productrules.productsizeoptions;
          
          // En yakın size option'ı bul
          const sizeOption = sizeOptions.find((so: any) => 
            so.width === itemWidth && (so.height === itemHeight || so.is_optional_height)
          );

          if (sizeOption) {
            targetWidth = sizeOption.width;
            if (sizeOption.is_optional_height) {
              // Opsiyonel yükseklik: hedef yükseklik size option'dan gelir
              targetHeight = sizeOption.height;
            } else {
              // Sabit yükseklik: alınan ürün yüksekliği kullanılır
              targetHeight = itemHeight;
            }
            console.log(`🎯 Size option bulundu: ${targetWidth}x${targetHeight}cm (optional_height: ${sizeOption.is_optional_height})`);
          }
        }

        // En spesifik eşleşme: tam boyut + saçak durumu + kesim tipi
        let variations = await tx.productvariations.findMany({
          where: {
            product_id: item.product_id,
            width: targetWidth,
            height: targetHeight,
            has_fringe: itemHasFringe,
            cut_type_id: cutTypeId
          }
        });

        console.log(`📊 Spesifik eşleşme (${targetWidth}x${targetHeight}, saçak:${itemHasFringe}, cut:${cutTypeId}): ${variations.length} varyasyon`);

        // Kesim tipi esnek eşleşme
        if (variations.length === 0) {
          variations = await tx.productvariations.findMany({
            where: {
              product_id: item.product_id,
              width: targetWidth,
              height: targetHeight,
              has_fringe: itemHasFringe
            }
          });
          console.log(`📊 Kesim tipi esnek eşleşme (${targetWidth}x${targetHeight}, saçak:${itemHasFringe}): ${variations.length} varyasyon`);
        }

        // Saçak durumu esnek eşleşme
        if (variations.length === 0) {
          variations = await tx.productvariations.findMany({
            where: {
              product_id: item.product_id,
              width: targetWidth,
              height: targetHeight
            }
          });
          console.log(`📊 Saçak esnek eşleşme (${targetWidth}x${targetHeight}): ${variations.length} varyasyon`);
        }

        // Stok artırma işlemi
        if (variations.length > 0) {
          const variation = variations[0];
          
          // Ürünün opsiyonel yükseklik olup olmadığını kontrol et
          const sizeOptions = product.productrules?.productsizeoptions || [];
          const isOptionalHeight = sizeOptions.some((so: any) => 
            so.width === variation.width && so.is_optional_height
          );
          
          let updateData: any = {};
          
          if (isOptionalHeight) {
            // Opsiyonel yükseklik: Sadece m² artır
            const actualPieceAreaM2 = (itemWidth * itemHeight) / 10000;
            const addedAreaM2 = item.quantity * actualPieceAreaM2;
            const currentAreaM2 = Number(variation.stock_area_m2 || 0);
            const newAreaM2 = currentAreaM2 + addedAreaM2; // Artırıyoruz
            
            updateData.stock_area_m2 = newAreaM2;
            console.log(`📦 Opsiyonel yükseklik stok artırıldı: ${currentAreaM2} + ${addedAreaM2} = ${newAreaM2} m²`);
            
            stockUpdates.push({
              product_id: item.product_id,
              variation_id: variation.id,
              variation_match: 'optional_height',
              size: `${targetWidth}x${targetHeight}cm`,
              actual_size: `${itemWidth}x${itemHeight}cm`,
              has_fringe: itemHasFringe,
              cut_type: item.cut_type,
              added_m2: addedAreaM2,
              added_quantity: 0, // Opsiyonel yükseklikte adet artmaz
              old_area_m2: currentAreaM2,
              new_area_m2: newAreaM2
            });
          } else {
            // Hazır kesim: Sadece adet artır, m² artırma
            const currentQuantity = Number(variation.stock_quantity || 0);
            const currentAreaM2 = Number(variation.stock_area_m2 || 0);
            const newQuantity = currentQuantity + item.quantity;
            // m² değeri değişmez (hazır ebat mantığı)
            
            updateData.stock_quantity = newQuantity;
            // updateData.stock_area_m2 = currentAreaM2; // Değişmez, güncelleme yapma
            console.log(`📦 Hazır kesim stok artırıldı: ${currentQuantity} + ${item.quantity} = ${newQuantity} adet, m² değişmedi: ${currentAreaM2} m²`);
            
            stockUpdates.push({
              product_id: item.product_id,
              variation_id: variation.id,
              variation_match: 'exact',
              size: `${targetWidth}x${targetHeight}cm`,
              has_fringe: itemHasFringe,
              cut_type: item.cut_type,
              added_m2: 0, // Hazır ebatlarda m² artmaz
              added_quantity: item.quantity,
              old_quantity: currentQuantity,
              new_quantity: newQuantity,
              old_area_m2: currentAreaM2,
              new_area_m2: currentAreaM2 // Değişmez
            });
          }

          // Varyasyonu güncelle
          await tx.productvariations.update({
            where: { id: variation.id },
            data: updateData
          });

          console.log(`✅ Varyasyon ${variation.id} güncellendi`);
        } else {
          // Hiçbir varyasyon bulunamadı - hata at, yeni varyasyon oluşturma
          console.log(`❌ ${itemWidth}x${itemHeight}cm boyutunda uygun varyasyon bulunamadı`);
          throw new Error(`${product.name} ürünü için ${itemWidth}x${itemHeight}cm boyutunda uygun varyasyon bulunamadı. Lütfen önce bu boyutta stok ekleyin veya mevcut varyasyonları kullanın.`);
        }
      }

      // Sepeti temizle
      await tx.purchaseCartItems.deleteMany({
        where: { purchase_cart_id: cart.id }
      });

      await tx.purchaseCarts.update({
        where: { id: cart.id },
        data: { is_active: false }
      });

      return {
        supplier: updatedSupplier,
        transaction,
        stockUpdates,
        purchasedItems: cart.items,
        totalAmount
      };
    });

    res.json({
      success: true,
      data: result,
      message: `Alım sepetinden ${cart.items.length} ürün başarıyla satın alındı. Toplam: $${totalAmount.toFixed(2)} USD`
    });

  } catch (error) {
    console.error('Alım sepetinden satın alma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Alım sepetinden satın alma işlemi gerçekleştirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Tüm satın alımları getir (pagination olmadan)
export const getAllPurchases = async (req: Request, res: Response) => {
  try {
    const { 
      supplier_id, 
      transaction_type, 
      start_date, 
      end_date 
    } = req.query;

    // Filtreleme koşulları
    const whereCondition: any = {};
    
    if (supplier_id) {
      whereCondition.supplier_id = supplier_id as string;
    }
    
    if (transaction_type) {
      whereCondition.transaction_type = transaction_type as string;
    }
    
    if (start_date || end_date) {
      whereCondition.created_at = {};
      if (start_date) {
        whereCondition.created_at.gte = new Date(start_date as string);
      }
      if (end_date) {
        whereCondition.created_at.lte = new Date(end_date as string);
      }
    }

    const [transactions, allSuppliers] = await Promise.all([
      prisma.supplierBalanceTransaction.findMany({
        where: whereCondition,
        orderBy: { created_at: 'desc' },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              company_name: true,
              currency: true,
              balance: true
            }
          }
        }
      }),
      // Tüm aktif satıcıların bakiye bilgilerini getir
      prisma.supplier.findMany({
        where: { is_active: true },
        select: {
          id: true,
          name: true,
          company_name: true,
          currency: true,
          balance: true,
          created_at: true,
          updated_at: true
        },
        orderBy: { name: 'asc' }
      })
    ]);

    // İşlem türü açıklamaları
    const getTransactionTypeDescription = (type: string) => {
      const descriptions: { [key: string]: string } = {
        'INITIAL_BALANCE': 'Başlangıç Bakiyesi',
        'PAYMENT': 'Ödeme',
        'PURCHASE': 'Tek Ürün Alımı',
        'CART_PURCHASE': 'Sepetten Toplu Alım',
        'PRODUCT_PURCHASE': 'Ürün Alımı',
        'ADJUSTMENT': 'Düzeltme',
        'REFUND': 'İade',
        'DISCOUNT': 'İndirim'
      };
      return descriptions[type] || type;
    };

    // Satın alım istatistikleri
    const stats = await prisma.supplierBalanceTransaction.aggregate({
      where: whereCondition,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Satıcı bakiyelerini formatla
    const suppliersWithBalances = allSuppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      company_name: supplier.company_name,
      currency: supplier.currency,
      balance: parseFloat(supplier.balance.toString()),
      balance_formatted: `$${parseFloat(supplier.balance.toString()).toFixed(2)}`,
      balance_status: parseFloat(supplier.balance.toString()) < 0 ? 'debt' : 'credit',
      created_at: supplier.created_at,
      updated_at: supplier.updated_at
    }));

    res.json({
      success: true,
      data: {
        transactions: transactions.map(transaction => ({
          ...transaction,
          transaction_type_description: getTransactionTypeDescription(transaction.transaction_type),
          amount_formatted: `$${Math.abs(parseFloat(transaction.amount.toString())).toFixed(2)}`,
          balance_change: parseFloat(transaction.amount.toString()) < 0 ? 'increase_debt' : 'decrease_debt'
        })),
        suppliers: suppliersWithBalances,
        stats: {
          totalTransactions: stats._count.id || 0,
          totalAmount: parseFloat(stats._sum.amount?.toString() || '0'),
          totalAmountFormatted: `$${Math.abs(parseFloat(stats._sum.amount?.toString() || '0')).toFixed(2)}`,
          totalSuppliers: allSuppliers.length,
          totalSupplierDebt: allSuppliers.reduce((sum, supplier) => {
            const balance = parseFloat(supplier.balance.toString());
            return balance < 0 ? sum + Math.abs(balance) : sum;
          }, 0),
          totalSupplierCredit: allSuppliers.reduce((sum, supplier) => {
            const balance = parseFloat(supplier.balance.toString());
            return balance > 0 ? sum + balance : sum;
          }, 0)
        }
      },
      message: 'Satın alım geçmişi ve satıcı bakiyeleri başarıyla getirildi'
    });
  } catch (error) {
    console.error('Satın alım geçmişi getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Satın alım geçmişi getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Belirli bir satın alımın detayını getir
export const getPurchaseDetail = async (req: Request, res: Response) => {
  try {
    const { transaction_id } = req.params;

    const transaction = await prisma.supplierBalanceTransaction.findUnique({
      where: { id: transaction_id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company_name: true,
            phone: true,
            address: true,
            currency: true,
            balance: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Satın alım işlemi bulunamadı'
      });
    }

    // Eğer bu bir sepet alımıysa, ilgili ürün detaylarını bulmaya çalış
    let purchaseDetails = null;
    if (transaction.transaction_type === 'CART_PURCHASE') {
      // Referans numarasından sepet ID'sini çıkar
      const cartReference = transaction.reference_number;
      if (cartReference && cartReference.startsWith('CART-')) {
        // Bu durumda detaylı bilgi transaction description'da olacak
        purchaseDetails = {
          type: 'cart_purchase',
          description: 'Alım sepetinden toplu satın alma',
          note: 'Detaylı ürün bilgileri transaction sırasında sepet temizlendiği için mevcut değil'
        };
      }
    } else if (transaction.transaction_type === 'PRODUCT_PURCHASE') {
      // Açıklamadan ürün bilgisini çıkarmaya çalış
      purchaseDetails = {
        type: 'single_product',
        description: transaction.description
      };
    }

    // İşlem türü açıklaması
    const getTransactionTypeDescription = (type: string) => {
      const descriptions: { [key: string]: string } = {
        'INITIAL_BALANCE': 'Başlangıç Bakiyesi',
        'PAYMENT': 'Ödeme',
        'PURCHASE': 'Tek Ürün Alımı',
        'CART_PURCHASE': 'Sepetten Toplu Alım',
        'PRODUCT_PURCHASE': 'Ürün Alımı',
        'ADJUSTMENT': 'Düzeltme',
        'REFUND': 'İade',
        'DISCOUNT': 'İndirim'
      };
      return descriptions[type] || type;
    };

    // Bakiye değişimi
    const balanceChange = parseFloat(transaction.amount.toString());
    const isDebtIncrease = balanceChange < 0;

    res.json({
      success: true,
      data: {
        transaction: {
          ...transaction,
          transaction_type_description: getTransactionTypeDescription(transaction.transaction_type),
          amount_formatted: `$${Math.abs(balanceChange).toFixed(2)}`,
          balance_change_type: isDebtIncrease ? 'debt_increase' : 'debt_decrease',
          balance_change_description: isDebtIncrease ? 'Borç Artışı' : 'Borç Azalması',
          previous_balance_formatted: `$${parseFloat(transaction.previous_balance.toString()).toFixed(2)}`,
          new_balance_formatted: `$${parseFloat(transaction.new_balance.toString()).toFixed(2)}`,
          created_at_formatted: new Date(transaction.created_at).toLocaleString('tr-TR'),
          purchase_details: purchaseDetails
        }
      },
      message: 'Satın alım detayı başarıyla getirildi'
    });
  } catch (error) {
    console.error('Satın alım detayı getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Satın alım detayı getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Satıcı bazında satın alım özeti
export const getSupplierPurchaseSummary = async (req: Request, res: Response) => {
  try {
    const { supplier_id } = req.params;
    const { start_date, end_date } = req.query;

    // Tarih filtreleri
    const whereCondition: any = {
      supplier_id: supplier_id
    };

    if (start_date || end_date) {
      whereCondition.created_at = {};
      if (start_date) {
        whereCondition.created_at.gte = new Date(start_date as string);
      }
      if (end_date) {
        whereCondition.created_at.lte = new Date(end_date as string);
      }
    }

    // Satıcı bilgilerini getir
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplier_id },
      select: {
        id: true,
        name: true,
        company_name: true,
        phone: true,
        address: true,
        balance: true,
        currency: true
      }
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Satıcı bulunamadı'
      });
    }

    // İşlem istatistikleri
    const [
      totalStats,
      purchaseStats,
      paymentStats,
      cartPurchaseStats,
      recentTransactions
    ] = await Promise.all([
      // Toplam işlemler
      prisma.supplierBalanceTransaction.aggregate({
        where: whereCondition,
        _sum: { amount: true },
        _count: { id: true }
      }),
      // Sadece alım işlemleri (negatif)
      prisma.supplierBalanceTransaction.aggregate({
        where: {
          ...whereCondition,
          amount: { lt: 0 }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      // Sadece ödeme işlemleri (pozitif)
      prisma.supplierBalanceTransaction.aggregate({
        where: {
          ...whereCondition,
          amount: { gt: 0 }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      // Sepet alımları
      prisma.supplierBalanceTransaction.aggregate({
        where: {
          ...whereCondition,
          transaction_type: 'CART_PURCHASE'
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      // Tüm işlemler (detaylı)
      prisma.supplierBalanceTransaction.findMany({
        where: whereCondition,
        orderBy: { created_at: 'desc' }
      })
    ]);

    // İşlem türlerine göre grupla
    const transactionsByType = await prisma.supplierBalanceTransaction.groupBy({
      by: ['transaction_type'],
      where: whereCondition,
      _sum: { amount: true },
      _count: { id: true }
    });

    // Tüm satın alma türlerindeki işlemler için ürün detaylarını getir
    const purchaseTransactions = await prisma.supplierBalanceTransaction.findMany({
      where: {
        ...whereCondition,
        transaction_type: { in: ['CART_PURCHASE', 'PRODUCT_PURCHASE', 'BULK_PRODUCT_PURCHASE'] }
      },
      orderBy: { created_at: 'desc' }
    });

    // Önce CART_PURCHASE işlemlerini işle
    const cartPurchaseTransactions = purchaseTransactions.filter(t => t.transaction_type === 'CART_PURCHASE');
    
    // Her sepet alımı için ürün detaylarını bul
    const cartPurchasesWithProducts = await Promise.all(
      cartPurchaseTransactions.map(async (transaction) => {
        // Reference number'dan timestamp'i çıkar (CART-1704895470123 formatında)
        const timestamp = transaction.reference_number?.replace('CART-', '');
        if (!timestamp) {
          return {
            transaction,
            products: []
          };
        }

        // O zamana yakın oluşturulan ve sonra temizlenen purchase cart'ları bul
        // Timestamp'den 1 dakika öncesi ve sonrası aralığında ara
        const searchDate = new Date(parseInt(timestamp));
        const beforeDate = new Date(searchDate.getTime() - 60000); // 1 dakika önce
        const afterDate = new Date(searchDate.getTime() + 60000);  // 1 dakika sonra

        const purchaseCarts = await prisma.purchaseCarts.findMany({
          where: {
            supplier_id: supplier_id,
            is_active: false, // Satın alma tamamlandıktan sonra false yapılır
            updated_at: {
              gte: beforeDate,
              lte: afterDate
            }
          },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    collection: {
                      select: {
                        name: true,
                        code: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { updated_at: 'desc' },
          take: 1
        });

        const purchaseCart = purchaseCarts[0];
        if (!purchaseCart) {
          return {
            transaction,
            products: []
          };
        }

        // Ürün detaylarını formatla
        const products = purchaseCart.items.map(item => {
          const singlePieceAreaM2 = parseFloat(item.area_m2.toString()); // Tek parça m²
          const totalAreaM2 = singlePieceAreaM2 * item.quantity; // Toplam m²
          const unitPrice = parseFloat(item.unit_price.toString());
          const totalPrice = parseFloat(item.total_price.toString());
          
          return {
            // Temel ürün bilgileri
            product_id: item.product_id,
            product_name: item.product?.name || 'Bilinmeyen Ürün',
            product_description: item.product?.description || '',
            collection_name: item.product?.collection?.name || 'Koleksiyon Yok',
            collection_code: item.product?.collection?.code || '',
            
            // Miktar ve boyut bilgileri
            quantity: item.quantity,
            width: parseFloat(item.width.toString()),
            height: parseFloat(item.height.toString()),
            width_cm: parseFloat(item.width.toString()),
            height_cm: parseFloat(item.height.toString()),
            size_info: `${parseFloat(item.width.toString())}x${parseFloat(item.height.toString())}cm`,
            
            // Alan bilgileri
            area_m2_per_piece: singlePieceAreaM2, // Tek parça m²
            total_area_m2: totalAreaM2, // Toplam m²
            area_m2_per_piece_formatted: `${singlePieceAreaM2.toFixed(2)} m²`,
            total_area_m2_formatted: `${totalAreaM2.toFixed(2)} m²`,
            
            // Fiyat bilgileri
            unit_price: unitPrice, // Birim fiyat (USD)
            total_price: totalPrice, // Toplam fiyat (USD)
            unit_price_formatted: `$${unitPrice.toFixed(2)}`,
            total_price_formatted: `$${totalPrice.toFixed(2)}`,
            
            // M² başına fiyat
            price_per_m2: singlePieceAreaM2 > 0 ? 
              parseFloat((unitPrice / singlePieceAreaM2).toFixed(2)) : 0,
            price_per_m2_formatted: singlePieceAreaM2 > 0 ? 
              `$${(unitPrice / singlePieceAreaM2).toFixed(2)}/m²` : '$0.00/m²',
            
            // Adet başına fiyat
            price_per_piece: unitPrice,
            price_per_piece_formatted: `$${unitPrice.toFixed(2)}/adet`,
            
            // Ürün özellikleri
            has_fringe: item.has_fringe,
            fringe_status: item.has_fringe ? 'Saçaklı' : 'Saçaksız',
            cut_type: item.cut_type,
            cut_type_turkish: item.cut_type === 'rectangle' ? 'Dikdörtgen' : 
                             item.cut_type === 'round' ? 'Yuvarlak' :
                             item.cut_type === 'oval' ? 'Oval' :
                             item.cut_type === 'custom' ? 'Özel' : 
                             (item.cut_type || 'Bilinmeyen'),
            notes: item.notes || '',
            
            // Para birimi bilgisi
            currency: 'USD',
            
            // Hesaplanan değerler
            total_items_count: item.quantity,
            average_price_per_m2: singlePieceAreaM2 > 0 ? 
              parseFloat((totalPrice / totalAreaM2).toFixed(2)) : 0
          };
        });

        return {
          transaction,
          products,
          total_items: purchaseCart.items.length,
          total_quantity: purchaseCart.items.reduce((sum, item) => sum + item.quantity, 0),
          total_area_m2: purchaseCart.items.reduce((sum, item) => 
            sum + (parseFloat(item.area_m2.toString()) * item.quantity), 0) // Tek parça m² × quantity
        };
      })
    );

    // PRODUCT_PURCHASE ve BULK_PRODUCT_PURCHASE işlemlerini işle
    const productPurchaseTransactions = purchaseTransactions.filter(t => 
      t.transaction_type === 'PRODUCT_PURCHASE' || t.transaction_type === 'BULK_PRODUCT_PURCHASE'
    );

    // Her ürün alımı için ürün detaylarını description'dan çıkarmaya çalış
    const productPurchasesWithProducts = productPurchaseTransactions.map(transaction => {
      const products: any[] = [];
      
      try {
        // Description'dan ürün bilgilerini parse etmeye çalış
        const description = transaction.description || '';
        
        // Çeşitli formatları kontrol et
        if (description.includes(' - ') && description.includes(' adet ')) {
          // Örnek: "PİRAMİT LOOP VİZON - 4 adet (80x100cm) - PİRAMİT LOOP - PİRAMİT LOOP VİZON (0.8 m² x $5/m²)"
          const parts = description.split(' - ');
          
          if (parts.length >= 2) {
            const productName = parts[0].trim();
            const quantityPart = parts[1].trim();
            
            // Adet bilgisini çıkar
            const quantityMatch = quantityPart.match(/(\d+)\s+adet/);
            const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
            
            // Boyut bilgisini çıkar (80x100cm formatında)
            const sizeMatch = description.match(/\((\d+)x(\d+)cm\)/);
            const width = sizeMatch ? parseFloat(sizeMatch[1]) : 0;
            const height = sizeMatch ? parseFloat(sizeMatch[2]) : 0;
            
            // Alan bilgisini çıkar (0.8 m² formatında)
            const areaMatch = description.match(/\(([0-9.]+)\s*m²/);
            const areaPerPiece = areaMatch ? parseFloat(areaMatch[1]) : (width * height / 10000);
            
            // Fiyat bilgisini çıkar ($5/m² formatında)
            const priceMatch = description.match(/\$([0-9.]+)\/m²\)/);
            const pricePerM2 = priceMatch ? parseFloat(priceMatch[1]) : 0;
            
            // Koleksiyon bilgisini çıkar
            const collectionMatch = description.match(/ - ([^-]+?) - /);
            const collectionName = collectionMatch ? collectionMatch[1].trim() : '';
            
            const totalPrice = Math.abs(parseFloat(transaction.amount.toString()));
            const unitPrice = quantity > 0 ? totalPrice / quantity : totalPrice;
            const totalArea = areaPerPiece * quantity;
            
            products.push({
              // Temel ürün bilgileri (mock)
              product_id: `mock-${transaction.id}`,
              product_name: productName,
              product_description: description,
              collection_name: collectionName || 'Bilinmeyen Koleksiyon',
              collection_code: '',
              
              // Miktar ve boyut bilgileri
              quantity: quantity,
              width: width,
              height: height,
              width_cm: width,
              height_cm: height,
              size_info: width && height ? `${width}x${height}cm` : 'Bilinmeyen',
              
              // Alan bilgileri
              area_m2_per_piece: areaPerPiece,
              total_area_m2: totalArea,
              area_m2_per_piece_formatted: `${areaPerPiece.toFixed(2)} m²`,
              total_area_m2_formatted: `${totalArea.toFixed(2)} m²`,
              
              // Fiyat bilgileri
              unit_price: unitPrice,
              total_price: totalPrice,
              unit_price_formatted: `$${unitPrice.toFixed(2)}`,
              total_price_formatted: `$${totalPrice.toFixed(2)}`,
              
              // M² başına fiyat
              price_per_m2: pricePerM2 || (areaPerPiece > 0 ? unitPrice / areaPerPiece : 0),
              price_per_m2_formatted: pricePerM2 ? 
                `$${pricePerM2.toFixed(2)}/m²` : 
                (areaPerPiece > 0 ? `$${(unitPrice / areaPerPiece).toFixed(2)}/m²` : '$0.00/m²'),
              
              // Adet başına fiyat
              price_per_piece: unitPrice,
              price_per_piece_formatted: `$${unitPrice.toFixed(2)}/adet`,
              
              // Varsayılan özellikler
              has_fringe: false,
              fringe_status: 'Bilinmeyen',
              cut_type: 'rectangle',
              cut_type_turkish: 'Dikdörtgen',
              notes: '',
              
              // Para birimi bilgisi
              currency: 'USD',
              
              // Hesaplanan değerler
              total_items_count: quantity,
              average_price_per_m2: areaPerPiece > 0 ? totalPrice / totalArea : 0
            });
          }
        }
      } catch (error) {
        console.error('PRODUCT_PURCHASE description parse hatası:', error);
      }
      
      return {
        transaction,
        products,
        total_items: products.length,
        total_quantity: products.reduce((sum, p) => sum + p.quantity, 0),
        total_area_m2: products.reduce((sum, p) => sum + p.total_area_m2, 0)
      };
    });

    // Tüm satın alımları birleştir
    const allPurchasesWithProducts = [...cartPurchasesWithProducts, ...productPurchasesWithProducts];

    // Tüm satın alınan ürünleri topla (tüm satın alma türlerinden)
    const allPurchasedItems: any[] = [];
    
    for (const purchaseWithProducts of allPurchasesWithProducts) {
      if (purchaseWithProducts.products && purchaseWithProducts.products.length > 0) {
        const itemsWithTransactionInfo = purchaseWithProducts.products.map(product => ({
          ...product,
          transaction_id: purchaseWithProducts.transaction.id,
          transaction_date: purchaseWithProducts.transaction.created_at,
          transaction_reference: purchaseWithProducts.transaction.reference_number,
          transaction_description: purchaseWithProducts.transaction.description,
          transaction_type: purchaseWithProducts.transaction.transaction_type
        }));
        allPurchasedItems.push(...itemsWithTransactionInfo);
      }
    }

    res.json({
      success: true,
      data: {
        supplier,
        summary: {
          period: {
            start_date: start_date as string || 'Başlangıç',
            end_date: end_date as string || 'Bugün'
          },
          totals: {
            transaction_count: totalStats._count.id || 0,
            total_amount: parseFloat(totalStats._sum.amount?.toString() || '0'),
            total_amount_formatted: `$${Math.abs(parseFloat(totalStats._sum.amount?.toString() || '0')).toFixed(2)}`
          },
          purchases: {
            count: purchaseStats._count.id || 0,
            amount: Math.abs(parseFloat(purchaseStats._sum.amount?.toString() || '0')),
            amount_formatted: `$${Math.abs(parseFloat(purchaseStats._sum.amount?.toString() || '0')).toFixed(2)}`
          },
          payments: {
            count: paymentStats._count.id || 0,
            amount: parseFloat(paymentStats._sum.amount?.toString() || '0'),
            amount_formatted: `$${parseFloat(paymentStats._sum.amount?.toString() || '0').toFixed(2)}`
          },
          cart_purchases: {
            count: cartPurchaseStats._count.id || 0,
            amount: Math.abs(parseFloat(cartPurchaseStats._sum.amount?.toString() || '0')),
            amount_formatted: `$${Math.abs(parseFloat(cartPurchaseStats._sum.amount?.toString() || '0')).toFixed(2)}`
          },
          by_transaction_type: transactionsByType.map(group => ({
            transaction_type: group.transaction_type,
            count: group._count.id,
            amount: parseFloat(group._sum.amount?.toString() || '0'),
            amount_formatted: `$${Math.abs(parseFloat(group._sum.amount?.toString() || '0')).toFixed(2)}`
          }))
        },
        // Ürün istatistikleri (tüm satın alma türlerinden hesaplanır)
        items_summary: {
          total_unique_products: allPurchasedItems.length,
          total_quantity: allPurchasedItems.reduce((sum, item) => sum + item.quantity, 0),
          total_area_m2: allPurchasedItems.reduce((sum, item) => sum + item.total_area_m2, 0),
          total_area_m2_formatted: `${allPurchasedItems.reduce((sum, item) => sum + item.total_area_m2, 0).toFixed(2)} m²`,
          total_value: allPurchasedItems.reduce((sum, item) => sum + item.total_price, 0),
          total_value_formatted: `$${allPurchasedItems.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}`,
          average_price_per_m2: allPurchasedItems.length > 0 ? 
            (allPurchasedItems.reduce((sum, item) => sum + item.total_price, 0) / 
             allPurchasedItems.reduce((sum, item) => sum + item.total_area_m2, 0)).toFixed(2) : '0.00',
          average_price_per_m2_formatted: allPurchasedItems.length > 0 ? 
            `$${(allPurchasedItems.reduce((sum, item) => sum + item.total_price, 0) / 
                 allPurchasedItems.reduce((sum, item) => sum + item.total_area_m2, 0)).toFixed(2)}/m²` : '$0.00/m²',
          average_quantity_per_product: allPurchasedItems.length > 0 ? 
            (allPurchasedItems.reduce((sum, item) => sum + item.quantity, 0) / allPurchasedItems.length).toFixed(1) : '0.0',
          currency: 'USD',
          // Koleksiyon bazında gruplandırma
          by_collection: allPurchasedItems.reduce((acc, item) => {
            const collectionName = item.collection_name || 'Tanımsız Koleksiyon';
            if (!acc[collectionName]) {
              acc[collectionName] = {
                collection_name: collectionName,
                collection_code: item.collection_code || '',
                product_count: 0,
                total_quantity: 0,
                total_area_m2: 0,
                total_value: 0
              };
            }
            acc[collectionName].product_count += 1;
            acc[collectionName].total_quantity += item.quantity;
            acc[collectionName].total_area_m2 += item.total_area_m2;
            acc[collectionName].total_value += item.total_price;
            return acc;
          }, {} as any)
        },
        all_transactions: await Promise.all(recentTransactions.map(async (tx) => {
          const baseTransaction = {
            ...tx,
            amount_formatted: `$${Math.abs(parseFloat(tx.amount.toString())).toFixed(2)}`,
            balance_change: parseFloat(tx.amount.toString()) < 0 ? 'debt_increase' : 'debt_decrease'
          };

          // CART_PURCHASE işlemleri için description'dan ürün bilgilerini parse et
          if (tx.transaction_type === 'CART_PURCHASE') {
            // Description'dan ürün sayısını çıkar: "Alım sepetinden toplu satın alma - X ürün"
            const description = tx.description || '';
            const productCountMatch = description.match(/(\d+)\s+ürün/);
            const productCount = productCountMatch ? parseInt(productCountMatch[1]) : 1;
            
            // Toplam tutarı al
            const totalAmount = Math.abs(parseFloat(tx.amount.toString()));
            
            // Mock ürün bilgisi oluştur (gerçek ürün bilgileri cart'tan silinmiş)
            const products = [{
              product_id: `cart-${tx.id}`,
              product_name: `Sepet Alımı (${productCount} ürün)`,
              product_description: description,
              collection_name: 'Sepet Alımı',
              collection_code: 'CART',
              quantity: productCount,
              width_cm: 0,
              height_cm: 0,
              size_info: 'Çeşitli',
              area_m2_per_piece: 0,
              total_area_m2: 0,
              area_m2_per_piece_formatted: '0.00 m²',
              total_area_m2_formatted: '0.00 m²',
              unit_price: productCount > 0 ? totalAmount / productCount : totalAmount,
              total_price: totalAmount,
              unit_price_formatted: `$${(productCount > 0 ? totalAmount / productCount : totalAmount).toFixed(2)}`,
              total_price_formatted: `$${totalAmount.toFixed(2)}`,
              price_per_m2: 0,
              price_per_m2_formatted: '$0.00/m²',
              has_fringe: false,
              fringe_status: 'Bilinmeyen',
              cut_type: 'unknown',
              cut_type_turkish: 'Bilinmeyen',
              currency: 'USD'
            }];

            return {
              ...baseTransaction,
              items: products,
              items_count: products.length,
              total_quantity: productCount,
              total_area_m2: 0,
              total_value: totalAmount
            };
          }

          return baseTransaction;
        })),
      },
      message: 'Satıcı satın alım özeti ve ürün detayları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Satıcı satın alım özeti getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Satıcı satın alım özeti getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

// Satın alım istatistikleri (dashboard için)
export const getPurchaseStatistics = async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query; // Son X gün
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const whereCondition = {
      created_at: {
        gte: startDate
      }
    };

    const [
      totalPurchases,
      totalPayments,
      cartPurchases,
      supplierCount,
      dailyStats
    ] = await Promise.all([
      // Toplam alımlar (negatif işlemler)
      prisma.supplierBalanceTransaction.aggregate({
        where: {
          ...whereCondition,
          amount: { lt: 0 }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      // Toplam ödemeler (pozitif işlemler)
      prisma.supplierBalanceTransaction.aggregate({
        where: {
          ...whereCondition,
          amount: { gt: 0 }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      // Sepet alımları
      prisma.supplierBalanceTransaction.aggregate({
        where: {
          ...whereCondition,
          transaction_type: 'CART_PURCHASE'
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      // Aktif satıcı sayısı
      prisma.supplier.count({
        where: { is_active: true }
      }),
      // Günlük istatistikler (son 7 gün)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as transaction_count,
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as purchase_amount,
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as payment_amount
        FROM supplier_balance_transactions 
        WHERE created_at >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 7
      `
    ]);

    // En çok alım yapılan satıcılar
    const topSuppliers = await prisma.supplierBalanceTransaction.groupBy({
      by: ['supplier_id'],
      where: {
        ...whereCondition,
        amount: { lt: 0 }
      },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: {
        _sum: {
          amount: 'asc' // En negatif değer (en çok alım)
        }
      },
      take: 5
    });

    // Satıcı isimlerini getir
    const supplierIds = topSuppliers.map(s => s.supplier_id);
    const suppliers = await prisma.supplier.findMany({
      where: { id: { in: supplierIds } },
      select: { id: true, name: true, company_name: true }
    });

    const topSuppliersWithNames = topSuppliers.map(stat => {
      const supplier = suppliers.find(s => s.id === stat.supplier_id);
      return {
        supplier_id: stat.supplier_id,
        supplier_name: supplier?.name || 'Bilinmeyen',
        company_name: supplier?.company_name || '',
        transaction_count: stat._count.id,
        purchase_amount: Math.abs(parseFloat(stat._sum.amount?.toString() || '0')),
        purchase_amount_formatted: `$${Math.abs(parseFloat(stat._sum.amount?.toString() || '0')).toFixed(2)}`
      };
    });

    res.json({
      success: true,
      data: {
        period: {
          days: days,
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString()
        },
        overview: {
          total_purchases: {
            count: totalPurchases._count.id || 0,
            amount: Math.abs(parseFloat(totalPurchases._sum.amount?.toString() || '0')),
            amount_formatted: `$${Math.abs(parseFloat(totalPurchases._sum.amount?.toString() || '0')).toFixed(2)}`
          },
          total_payments: {
            count: totalPayments._count.id || 0,
            amount: parseFloat(totalPayments._sum.amount?.toString() || '0'),
            amount_formatted: `$${parseFloat(totalPayments._sum.amount?.toString() || '0').toFixed(2)}`
          },
          cart_purchases: {
            count: cartPurchases._count.id || 0,
            amount: Math.abs(parseFloat(cartPurchases._sum.amount?.toString() || '0')),
            amount_formatted: `$${Math.abs(parseFloat(cartPurchases._sum.amount?.toString() || '0')).toFixed(2)}`
          },
          active_suppliers: supplierCount
        },
        daily_stats: dailyStats,
        top_suppliers: topSuppliersWithNames
      },
      message: 'Satın alım istatistikleri başarıyla getirildi'
    });
  } catch (error) {
    console.error('Satın alım istatistikleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Satın alım istatistikleri getirilemedi',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};
