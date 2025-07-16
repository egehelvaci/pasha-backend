import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAllAccountingTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, customer_id, product_id, transaction_type, is_expense, start_date, end_date } = req.query;

    // Sayfa ve limit validasyonu
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Filtre koşulları oluştur
    const whereConditions: any = {};

    if (customer_id) {
      whereConditions.customer_id = customer_id as string;
    }

    if (product_id) {
      whereConditions.product_id = product_id as string;
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
        product: {
          select: {
            productId: true,
            name: true,
            description: true
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
      customer_id,
      product_id,
      square_meters,
      transaction_type,
      amount,
      is_expense,
      transaction_date,
      description
    } = req.body;

    // Zorunlu alanları kontrol et
    if (!customer_id || !transaction_type || !amount || is_expense === undefined || !transaction_date || !description) {
      return res.status(400).json({
        success: false,
        message: 'Zorunlu alanlar eksik: customer_id, transaction_type, amount, is_expense, transaction_date, description'
      });
    }

    // Müşteri var mı kontrol et
    const customer = await prisma.user.findUnique({
      where: { userId: customer_id }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Müşteri bulunamadı'
      });
    }

    // Eğer product_id varsa, ürünün var olup olmadığını kontrol et
    if (product_id) {
      const product = await prisma.product.findUnique({
        where: { productId: product_id }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Ürün bulunamadı'
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

    // Muhasebe hareketi oluştur
    const accountingTransaction = await prisma.accountingTransaction.create({
      data: {
        customer_id,
        product_id: product_id || null,
        square_meters: square_meters || null,
        transaction_type,
        amount,
        is_expense,
        transaction_date: new Date(transaction_date),
        description
      },
      include: {
        customer: {
          select: {
            userId: true,
            name: true,
            surname: true,
            email: true
          }
        },
        product: {
          select: {
            productId: true,
            name: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Muhasebe hareketi başarıyla oluşturuldu',
      data: accountingTransaction
    });

  } catch (error) {
    console.error('Muhasebe hareketi oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
}; 