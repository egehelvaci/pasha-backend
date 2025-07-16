import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAllAccountingTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, store_id, customer_id, collection_id, transaction_type, is_expense, start_date, end_date } = req.query;

    // Sayfa ve limit validasyonu
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Filtre koşulları oluştur
    const whereConditions: any = {};

    // store_id öncelikli, yoksa customer_id kullan (geriye dönük uyumluluk)
    const filterStoreId = store_id || customer_id;
    if (filterStoreId) {
      whereConditions.store_id = filterStoreId as string;
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
        customer: {
          select: {
            userId: true,
            name: true,
            surname: true,
            email: true,
            username: true
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

    // Tüm mağazaların bakiyelerini topla (negatif bakiyeler borç, pozitif bakiyeler alacak)
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

    // Toplam borç ve alacak hesapla
    let totalDebt = 0; // Toplam borç (negatif bakiyeler)
    let totalCredit = 0; // Toplam alacak (pozitif bakiyeler)
    let totalBalance = 0; // Net bakiye

    stores.forEach(store => {
      const balance = parseFloat(store.bakiye?.toString() || '0');
      totalBalance += balance;
      
      if (balance < 0) {
        totalDebt += Math.abs(balance); // Negatif bakiyeleri pozitif olarak borç hesabına ekle
      } else if (balance > 0) {
        totalCredit += balance; // Pozitif bakiyeleri alacak hesabına ekle
      }
    });

    // Net durum hesapla
    const netStatus = totalBalance >= 0 
      ? { type: 'ALACAK', amount: totalBalance }
      : { type: 'BORÇ', amount: Math.abs(totalBalance) };

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
        financial_summary: {
          total_stores: stores.length,
          total_debt: totalDebt, // Mağazaların toplam borcu
          total_credit: totalCredit, // Mağazaların toplam alacağı
          net_balance: totalBalance, // Net bakiye
          admin_status: {
            description: `Admin olarak ${netStatus.type.toLowerCase()} durumundasınız`,
            type: netStatus.type,
            amount: netStatus.amount
          },
          store_breakdown: stores.map(store => ({
            store_id: store.store_id,
            store_name: store.kurum_adi,
            balance: parseFloat(store.bakiye?.toString() || '0'),
            status: parseFloat(store.bakiye?.toString() || '0') >= 0 ? 'ALACAKLI' : 'BORÇLU'
          }))
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

export const createAccountingTransaction = async (req: Request, res: Response) => {
  try {
    const {
      store_id,
      customer_id, // Geriye dönük uyumluluk için
      collection_id,
      square_meters,
      transaction_type,
      amount,
      is_expense,
      transaction_date,
      description
    } = req.body;

    // store_id öncelikli, yoksa customer_id kullan (geriye dönük uyumluluk)
    const finalStoreId = store_id || customer_id;

    // Zorunlu alanları kontrol et
    if (!finalStoreId || !transaction_type || !amount || is_expense === undefined || !transaction_date || !description) {
      return res.status(400).json({
        success: false,
        message: 'Zorunlu alanlar eksik: store_id, transaction_type, amount, is_expense, transaction_date, description'
      });
    }

    // Mağazanın var olup olmadığını kontrol et ve mağazaya ait bir user bul
    const store = await prisma.store.findUnique({
      where: { store_id: finalStoreId },
      include: {
        User: {
          take: 1 // Mağazaya ait ilk user'ı al
        }
      }
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

    // Mağazaya ait user var mı kontrol et
    if (!store.User || store.User.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu mağazaya ait kullanıcı bulunamadı'
      });
    }

    const storeUser = store.User[0]; // İlk user'ı al

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

    // Transaction ile hem muhasebe hareketi oluştur hem de mağaza bakiyesini güncelle
    const result = await prisma.$transaction(async (tx) => {
      // Muhasebe hareketi oluştur
      const accountingTransaction = await tx.accountingTransaction.create({
        data: {
          customer_id: storeUser.userId, // Store'a ait user'ın ID'sini kullan
          store_id: finalStoreId,
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

      // Mağaza bakiyesini güncelle
      // is_expense true ise bakiyeden çıkar (borç), false ise bakiyeye ekle (alacak)
      const bakiyeGuncelleme = is_expense ? -amount : amount;
      
      await tx.store.update({
        where: { store_id: finalStoreId },
        data: {
          bakiye: {
            increment: bakiyeGuncelleme
          }
        }
      });

      return accountingTransaction;
    });

    res.status(200).json({
      success: true,
      message: 'Muhasebe hareketi başarıyla oluşturuldu ve mağaza bakiyesi güncellendi',
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