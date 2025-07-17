import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// GELİR kategorisi (is_expense = false)
const incomeTypes = [
  'Parekende Satış',
  'Parekende Tahsilat', 
  'Alacak ve/veya Tahsilat',
  'Nakit, Döviz ve/veya Değerli Kağıt Tahsilatı',
  'Borç Tahsilatı',
  'Paşaoğlu Halı Moka Post Tahsilatı',
  'Devreden Alacak Bakiyesi'
];

// HARCAMA kategorisi (is_expense = true)
const expenseTypes = [
  'Araç Bakım / Yakıt / Araç Sigorta / HGS Giderleri',
  'Mutfak Gideri',
  'Mal ve/veya Tamir, Servis vb. Hizmet Alımı',
  'Nakit, Döviz ve/veya Değerli Kağıt Ödemesi',
  'Personel Maaş Ödemesi',
  'Nakliye ve/veya Kargo Ödemesi',
  'Borç Verme',
  'Elektrik / Su / Isınma / Telefon / İnternet Giderleri',
  'İşletme İçi Sarf Malzeme ve/veya Kırtasiye Giderleri',
  'Kira / Aidat Giderleri',
  'Vergi / SSK / Bağkur / Muhasebe Giderleri',
  'Seyahat ve/veya Konaklama Giderleri',
  'Bilgi İşlem ve/veya Yazılım Hizmet Ödemesi',
  'Personel Maaş Hakkedişi',
  'Personel İkramiye Hakkedişi',
  'Personel Mesai Hakkedişi',
  'Personel İkramiye Ödemesi',
  'Personel Mesai Ödemesi',
  'Mal ve/veya Tamir, Servis vb. Hizmet Ödemesi',
  'Devreden Borç Bakiyesi',
  'Ürün ve/veya Hizmet İadesi',
  'Bilgi İşlem ve/veya Yazılım Hizmet Hakedişi'
];

export const getAllAccountingTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, store_id, collection_id, transaction_type, is_expense, start_date, end_date } = req.query;
    
    // Admin'in kendi mağaza ID'si
    const adminStoreId = req.user?.store_id;

    // Sayfa ve limit validasyonu
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Filtre koşulları oluştur
    const whereConditions: any = {};

    if (store_id) {
      whereConditions.store_id = store_id as string;
    }

    if (collection_id) {
      whereConditions.collection_id = collection_id as string;
    }

    if (transaction_type) {
      whereConditions.transaction_type = {
        contains: transaction_type as string,
        mode: 'insensitive'
      };
    }

    if (is_expense !== undefined) {
      whereConditions.is_expense = is_expense === 'true';
    }

    // Tarih aralığı filtresi
    if (start_date || end_date) {
      whereConditions.transaction_date = {};
      if (start_date) {
        whereConditions.transaction_date.gte = new Date(start_date as string);
      }
      if (end_date) {
        whereConditions.transaction_date.lte = new Date(end_date as string);
      }
    }

    // Toplam kayıt sayısını al
    const totalCount = await prisma.accountingTransaction.count({
      where: whereConditions
    });

    // Muhasebe hareketlerini getir
    const transactions = await prisma.accountingTransaction.findMany({
      where: whereConditions,
      include: {
        store: {
          select: {
            store_id: true,
            kurum_adi: true,
            vergi_numarasi: true,
            telefon: true,
            eposta: true
          }
        },
        collection: {
          select: {
            collectionId: true,
            name: true,
            description: true,
            code: true
          }
        }
      },
      orderBy: {
        transaction_date: 'desc'
      },
      skip,
      take: limitNum
    });

    // Toplam sayfa sayısını hesapla
    const totalPages = Math.ceil(totalCount / limitNum);

    // Tüm mağazaların bakiyelerini al
    const stores = await prisma.store.findMany({
      where: {
        is_active: true
      },
      select: {
        store_id: true,
        kurum_adi: true,
        bakiye: true
      }
    });

    // Financial summary hesapla
    const financialSummary = calculateFinancialSummary(stores, adminStoreId);

    res.status(200).json({
      success: true,
      message: 'Muhasebe hareketleri başarıyla getirildi',
      data: {
        transactions,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        financial_summary: financialSummary,
        transaction_types: {
          income: incomeTypes,
          expense: expenseTypes
        }
      }
    });

  } catch (error) {
    console.error('Muhasebe hareketleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

function calculateFinancialSummary(stores: any[], adminStoreId?: string) {
  let adminOwnStoreBalance = 0; // Admin'in kendi mağaza bakiyesi
  let otherStoresDebt = 0;      // Diğer mağazaların admin'e borcu (negatif bakiyeler)
  let otherStoresCredit = 0;    // Diğer mağazaların admin'den alacağı (pozitif bakiyeler)

  stores.forEach(store => {
    const balance = parseFloat(store.bakiye?.toString() || '0');
    
    if (adminStoreId && store.store_id === adminStoreId) {
      // Admin'in kendi mağazası
      adminOwnStoreBalance = balance;
    } else {
      // Diğer mağazalar
      if (balance < 0) {
        // Negatif bakiye = Mağaza admin'e borçlu = Admin alacaklı
        otherStoresDebt += Math.abs(balance);
      } else if (balance > 0) {
        // Pozitif bakiye = Mağaza admin'den alacaklı = Admin borçlu
        otherStoresCredit += balance;
      }
    }
  });

  // Admin'in net durumu = Kendi mağaza bakiyesi + Diğer mağazalardan alacak - Diğer mağazalara borç
  const netAdminBalance = adminOwnStoreBalance + otherStoresDebt - otherStoresCredit;
  
  // Admin'in kendi mağaza bilgisi
  let adminStoreInfo = null;
  if (adminStoreId) {
    const adminStore = stores.find(store => store.store_id === adminStoreId);
    if (adminStore) {
      adminStoreInfo = {
        store_id: adminStore.store_id,
        store_name: adminStore.kurum_adi,
        balance: adminOwnStoreBalance,
        status: adminOwnStoreBalance >= 0 ? 'ALACAKLI' : 'BORÇLU'
      };
    }
  }

  return {
    total_stores: stores.length,
    admin_own_store_balance: adminOwnStoreBalance,
    other_stores_debt: otherStoresDebt,
    other_stores_credit: otherStoresCredit,
    net_admin_balance: netAdminBalance,
    admin_status: {
      description: `Admin olarak ${netAdminBalance >= 0 ? 'alacaklı' : 'borçlu'} durumundasınız`,
      type: netAdminBalance >= 0 ? 'ALACAKLI' : 'BORÇLU',
      amount: Math.abs(netAdminBalance)
    },
    admin_store: adminStoreInfo,
    store_breakdown: stores.map(store => {
      const storeBalance = parseFloat(store.bakiye?.toString() || '0');
      return {
        store_id: store.store_id,
        store_name: store.kurum_adi,
        balance: storeBalance,
        status: storeBalance < 0 ? 'BORÇLU' : storeBalance > 0 ? 'ALACAKLI' : 'NÖTR',
        is_admin_store: adminStoreId === store.store_id
      };
    })
  };
}

export const createAccountingTransaction = async (req: Request, res: Response) => {
  try {
    const {
      store_id,
      collection_id,
      square_meters,
      transaction_type,
      amount,
      is_expense,
      transaction_date,
      description
    } = req.body;

    // Admin'in kendi mağaza ID'si
    const adminStoreId = req.user?.store_id;

    // Zorunlu alanları kontrol et
    if (!store_id || !transaction_type || !amount || is_expense === undefined || !transaction_date || !description) {
      return res.status(400).json({
        success: false,
        message: 'Zorunlu alanlar eksik: store_id, transaction_type, amount, is_expense, transaction_date, description'
      });
    }

    // İşlem tipinin doğru kategoride olup olmadığını kontrol et
    const validTypes = is_expense ? expenseTypes : incomeTypes;
    if (!validTypes.includes(transaction_type)) {
      return res.status(400).json({
        success: false,
        message: `Geçersiz işlem tipi. ${is_expense ? 'Gider' : 'Gelir'} kategorisinden seçiniz.`,
        valid_types: validTypes
      });
    }

    // Mağazanın var olup olmadığını kontrol et
    const store = await prisma.store.findUnique({
      where: { store_id: store_id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Mağaza bulunamadı'
      });
    }

    // Mağaza aktif mi kontrol et
    if (!store.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Mağaza aktif değil'
      });
    }

    // Eğer collection_id varsa, koleksiyonun var olup olmadığını kontrol et
    if (collection_id) {
      const collection = await prisma.collection.findUnique({
        where: { collectionId: collection_id }
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Koleksiyon bulunamadı'
        });
      }
    }

    // Tutar pozitif olmalı
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Tutar pozitif bir değer olmalıdır'
      });
    }

    // Metrekare varsa pozitif olmalı
    if (square_meters && square_meters <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Metrekare pozitif bir değer olmalıdır'
      });
    }

    // Transaction ile hem muhasebe hareketi oluştur hem de bakiyeleri güncelle
    const result = await prisma.$transaction(async (tx) => {
      // Muhasebe hareketi oluştur
      const accountingTransaction = await tx.accountingTransaction.create({
        data: {
          customer_id: null,
          store_id: store_id,
          collection_id: collection_id || null,
          square_meters: square_meters || null,
          transaction_type,
          amount,
          is_expense,
          transaction_date: new Date(transaction_date),
          description
        },
        include: {
          store: {
            select: {
              store_id: true,
              kurum_adi: true
            }
          },
          collection: {
            select: {
              collectionId: true,
              name: true,
              code: true
            }
          }
        }
      });

      // Bakiye güncellemelerini yap
      await updateBalances(tx, store_id, amount, is_expense, adminStoreId);

      return accountingTransaction;
    });

    res.status(200).json({
      success: true,
      message: 'Muhasebe hareketi başarıyla oluşturuldu ve bakiyeler güncellendi',
      data: result
    });

  } catch (error) {
    console.error('Muhasebe hareketi oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

async function updateBalances(tx: any, storeId: string, amount: number, isExpense: boolean, adminStoreId?: string) {
  const isAdminOwnStore = adminStoreId === storeId;

  if (isAdminOwnStore) {
    // Admin kendi mağazası için işlem yapıyor
    if (isExpense) {
      // Admin gider yapıyor: Mağaza bakiyesi azalır (gider)
      await tx.store.update({
        where: { store_id: storeId },
        data: {
          bakiye: {
            decrement: amount  // Gider = bakiye azalır
          }
        }
      });
    } else {
      // Admin gelir elde ediyor: Mağaza bakiyesi artar (gelir)
      await tx.store.update({
        where: { store_id: storeId },
        data: {
          bakiye: {
            increment: amount  // Gelir = bakiye artar
          }
        }
      });
    }
  } else {
    // Admin diğer mağaza için işlem yapıyor
    if (isExpense) {
      // Admin diğer mağazaya borç veriyor: Mağaza bakiyesi azalır (borçlu olur)
      await tx.store.update({
        where: { store_id: storeId },
        data: {
          bakiye: {
            decrement: amount  // Borç alma = bakiye azalır (negatif = borçlu)
          }
        }
      });
    } else {
      // Admin diğer mağazadan tahsilat yapıyor: Mağaza bakiyesi artar
      await tx.store.update({
        where: { store_id: storeId },
        data: {
          bakiye: {
            increment: amount  // Ödeme = bakiye artar (pozitife çıkabilir)
          }
        }
      });
    }
  }
}

// İşlem tiplerini döndüren endpoint
export const getTransactionTypes = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        income_types: incomeTypes,
        expense_types: expenseTypes
      }
    });
  } catch (error) {
    console.error('İşlem tipleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
}; 