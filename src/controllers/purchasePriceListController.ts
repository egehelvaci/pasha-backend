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
      usdBalance = parseFloat((balance / exchange_rate).toFixed(2));
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
    const usdAmount = parseFloat((amount / exchange_rate).toFixed(2));

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
      const newBalance = previousBalance.plus(usdAmount);

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

      // Her sepet öğesi için stok güncelleme
      const stockUpdates = [];
      for (const item of cart.items) {
        // Mevcut varyasyonları kontrol et
        const existingVariations = await tx.productvariations.findMany({
          where: { product_id: item.product_id }
        });

        if (existingVariations.length > 0) {
          // Mevcut varyasyonlar varsa, ilk varyasyona stok ekle
          const firstVariation = existingVariations[0];
          const updatedVariation = await tx.productvariations.update({
            where: { id: firstVariation.id },
            data: {
              stock_area_m2: {
                increment: parseFloat(item.area_m2.toString()) * item.quantity
              }
            }
          });
          stockUpdates.push({
            product_id: item.product_id,
            variation_id: firstVariation.id,
            added_m2: parseFloat(item.area_m2.toString()) * item.quantity
          });
        } else {
          // Varyasyon yoksa yeni bir tane oluştur
          const newVariation = await tx.productvariations.create({
            data: {
              product_id: item.product_id,
              cut_type_id: 1, // Varsayılan kesim tipi
              has_fringe: item.has_fringe || false,
              width: parseFloat(item.width.toString()),
              height: parseFloat(item.height.toString()),
              stock_quantity: item.quantity,
              stock_area_m2: parseFloat(item.area_m2.toString()) * item.quantity
            }
          });
          stockUpdates.push({
            product_id: item.product_id,
            variation_id: newVariation.id,
            added_m2: parseFloat(item.area_m2.toString()) * item.quantity
          });
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
