import { Request, Response } from 'express'
import ExcelJS from 'exceljs'
import prisma from '../utils/prisma'
import { OrderStatus } from '../../generated/prisma'

export class ExcelExportController {
  constructor() {
    this.exportOrders = this.exportOrders.bind(this)
    this.exportAccountingTransactions = this.exportAccountingTransactions.bind(this)
  }

  /**
   * Siparişleri Excel olarak export et
   * Günlük, haftalık, aylık, yıllık veya belirli tarih aralığında
   */
  async exportOrders(req: Request, res: Response) {
    try {
      const { 
        period = 'custom', 
        start_date, 
        end_date,
        status,
        format = 'summary' // 'summary' veya 'detailed'
      } = req.query

      // Tarih aralığını belirle
      let startDate: Date
      let endDate: Date = new Date()
      
      if (period === 'custom' && start_date && end_date) {
        startDate = new Date(start_date as string)
        endDate = new Date(end_date as string)
        // End date'i günün sonuna ayarla
        endDate.setHours(23, 59, 59, 999)
      } else {
        const now = new Date()
        switch (period) {
          case 'daily':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
            break
          case 'weekly':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          default:
            startDate = new Date(now.getFullYear(), 0, 1) // Yıl başından itibaren
        }
      }

      // Where koşulları
      const whereConditions: any = {
        created_at: {
          gte: startDate,
          lte: endDate
        }
      }

      if (status) {
        whereConditions.status = status
      }

      // Siparişleri getir
      const orders = await prisma.order.findMany({
        where: whereConditions,
        include: {
          user: {
            include: {
              Store: true,
              userType: true
            }
          },
          items: {
            include: {
              product: {
                include: {
                  collection: true
                }
              }
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      })

      // Excel dosyası oluştur
      const workbook = new ExcelJS.Workbook()
      
      if (format === 'detailed') {
        await this.createDetailedOrdersExcel(workbook, orders, startDate, endDate)
      } else {
        await this.createSummaryOrdersExcel(workbook, orders, startDate, endDate)
      }

      // Excel dosyasını buffer olarak al
      const buffer = await workbook.xlsx.writeBuffer()

      // Dosya adını oluştur
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]
      const filename = `siparisler_${startDateStr}_${endDateStr}.xlsx`

      // Response headers ayarla
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.setHeader('Content-Length', (buffer as Buffer).length.toString())

      return res.send(buffer)

    } catch (error: any) {
      console.error('Sipariş Excel export hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Excel export sırasında hata oluştu'
      })
    }
  }

  /**
   * Muhasebe hareketlerini Excel olarak export et
   */
  async exportAccountingTransactions(req: Request, res: Response) {
    try {
      const { 
        period = 'custom', 
        start_date, 
        end_date,
        store_id,
        customer_id,
        transaction_type,
        is_expense
      } = req.query

      // Tarih aralığını belirle
      let startDate: Date
      let endDate: Date = new Date()
      
      if (period === 'custom' && start_date && end_date) {
        startDate = new Date(start_date as string)
        endDate = new Date(end_date as string)
        endDate.setHours(23, 59, 59, 999)
      } else {
        const now = new Date()
        switch (period) {
          case 'daily':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
            break
          case 'weekly':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          default:
            startDate = new Date(now.getFullYear(), 0, 1)
        }
      }

      // Where koşulları
      const whereConditions: any = {
        transaction_date: {
          gte: startDate,
          lte: endDate
        }
      }

      // store_id öncelikli, yoksa customer_id kullan (geriye dönük uyumluluk)
      const filterStoreId = store_id || customer_id;
      if (filterStoreId) {
        whereConditions.store_id = filterStoreId as string;
      }

      if (transaction_type) {
        whereConditions.transaction_type = {
          contains: transaction_type as string,
          mode: 'insensitive'
        }
      }

      if (is_expense !== undefined) {
        whereConditions.is_expense = is_expense === 'true'
      }

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
          store: {
            select: {
              store_id: true,
              kurum_adi: true
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
        }
      })

      // Excel dosyası oluştur
      const workbook = new ExcelJS.Workbook()
      await this.createAccountingTransactionsExcel(workbook, transactions, startDate, endDate)

      // Excel dosyasını buffer olarak al
      const buffer = await workbook.xlsx.writeBuffer()

      // Dosya adını oluştur
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]
      const filename = `muhasebe_hareketleri_${startDateStr}_${endDateStr}.xlsx`

      // Response headers ayarla
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.setHeader('Content-Length', (buffer as Buffer).length.toString())

      return res.send(buffer)

    } catch (error: any) {
      console.error('Muhasebe Excel export hatası:', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Excel export sırasında hata oluştu'
      })
    }
  }

  /**
   * Özet sipariş Excel'i oluştur
   */
  private async createSummaryOrdersExcel(workbook: ExcelJS.Workbook, orders: any[], startDate: Date, endDate: Date) {
    const worksheet = workbook.addWorksheet('Sipariş Özeti')

    // Başlık satırı
    const headerRow = worksheet.addRow([
      'Sipariş ID',
      'Mağaza Adı', 
      'Müşteri Adı',
      'Sipariş Tarihi',
      'Durum',
      'Toplam Tutar (TL)',
      'Ürün Adedi',
      'Toplam Alan (m²)'
    ])

    // Başlık stilini ayarla
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '366092' } }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      cell.alignment = { horizontal: 'center' }
    })

    // Veri satırları
    let totalAmount = 0
    let totalQuantity = 0
    let totalArea = 0

    orders.forEach((order) => {
      // Toplam ürün adedini hesapla
      const totalItems = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      
      // Toplam alanı hesapla
      const orderArea = order.items.reduce((sum: number, item: any) => {
        if (item.width && item.height) {
          return sum + (Number(item.width) * Number(item.height) * item.quantity) / 10000
        }
        return sum
      }, 0)

      const row = worksheet.addRow([
        order.id,
        order.user?.Store?.kurum_adi || 'Bilinmeyen Mağaza',
        `${order.user?.name || ''} ${order.user?.surname || ''}`.trim(),
        order.created_at.toLocaleDateString('tr-TR'),
        order.status,
        Number(order.total_price),
        totalItems,
        Math.round(orderArea * 100) / 100
      ])

      // Satır stilini ayarla
      row.eachCell((cell, index) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        
        if (index === 6) { // Tutar kolonu
          cell.numFmt = '#,##0.00₺'
        }
        if (index === 8) { // Alan kolonu
          cell.numFmt = '#,##0.00'
        }
      })

      totalAmount += Number(order.total_price)
      totalQuantity += totalItems
      totalArea += orderArea
    })

    // Toplam satırı
    const totalRow = worksheet.addRow([
      '', '', '', '', 'TOPLAM',
      totalAmount,
      totalQuantity,
      Math.round(totalArea * 100) / 100
    ])

    totalRow.eachCell((cell, index) => {
      cell.font = { bold: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      
      if (index === 6) { // Tutar kolonu
        cell.numFmt = '#,##0.00₺'
      }
      if (index === 8) { // Alan kolonu
        cell.numFmt = '#,##0.00'
      }
    })

    // Sütun genişliklerini ayarla
    worksheet.columns = [
      { width: 20 }, // Sipariş ID
      { width: 25 }, // Mağaza Adı
      { width: 20 }, // Müşteri Adı
      { width: 15 }, // Tarih
      { width: 12 }, // Durum
      { width: 15 }, // Tutar
      { width: 12 }, // Adet
      { width: 15 }  // Alan
    ]

    // Bilgi satırları ekle
    worksheet.insertRow(1, [`Sipariş Raporu (${startDate.toLocaleDateString('tr-TR')} - ${endDate.toLocaleDateString('tr-TR')})`])
    worksheet.insertRow(2, [`Toplam ${orders.length} sipariş`])
    worksheet.insertRow(3, []) // Boş satır

    // İlk satırı merge et ve stilini ayarla
    worksheet.mergeCells('A1:H1')
    const titleCell = worksheet.getCell('A1')
    titleCell.font = { size: 14, bold: true }
    titleCell.alignment = { horizontal: 'center' }
  }

  /**
   * Detaylı sipariş Excel'i oluştur
   */
  private async createDetailedOrdersExcel(workbook: ExcelJS.Workbook, orders: any[], startDate: Date, endDate: Date) {
    const worksheet = workbook.addWorksheet('Detaylı Sipariş Listesi')

    // Başlık satırı
    const headerRow = worksheet.addRow([
      'Sipariş ID',
      'Mağaza Adı',
      'Müşteri Adı',
      'Sipariş Tarihi',
      'Durum',
      'Ürün Adı',
      'Koleksiyon',
      'Adet',
      'En (cm)',
      'Boy (cm)',
      'Alan (m²)',
      'Birim Fiyat (TL)',
      'Toplam Fiyat (TL)',
      'Kesim Tipi',
      'Saçak'
    ])

    // Başlık stilini ayarla
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '366092' } }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      cell.alignment = { horizontal: 'center' }
    })

    // Veri satırları
    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        const area = item.width && item.height ? 
          (Number(item.width) * Number(item.height) * item.quantity) / 10000 : 0

        const row = worksheet.addRow([
          order.id,
          order.user?.Store?.kurum_adi || 'Bilinmeyen Mağaza',
          `${order.user?.name || ''} ${order.user?.surname || ''}`.trim(),
          order.created_at.toLocaleDateString('tr-TR'),
          order.status,
          item.product?.name || 'Bilinmeyen Ürün',
          item.product?.collection?.name || 'Bilinmeyen Koleksiyon',
          item.quantity,
          item.width || '',
          item.height || '',
          Math.round(area * 100) / 100,
          Number(item.unit_price || 0),
          Number(item.total_price || 0),
          item.cut_type === 'rectangle' ? 'standart' : item.cut_type,
          item.has_fringe ? 'Evet' : 'Hayır'
        ])

        // Satır stilini ayarla
        row.eachCell((cell, index) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          
          if (index === 12 || index === 13) { // Fiyat kolonları
            cell.numFmt = '#,##0.00₺'
          }
          if (index === 11) { // Alan kolonu
            cell.numFmt = '#,##0.00'
          }
        })
      })
    })

    // Sütun genişliklerini ayarla
    worksheet.columns = [
      { width: 20 }, // Sipariş ID
      { width: 25 }, // Mağaza Adı
      { width: 20 }, // Müşteri Adı
      { width: 15 }, // Tarih
      { width: 12 }, // Durum
      { width: 25 }, // Ürün Adı
      { width: 20 }, // Koleksiyon
      { width: 8 },  // Adet
      { width: 10 }, // En
      { width: 10 }, // Boy
      { width: 12 }, // Alan
      { width: 15 }, // Birim Fiyat
      { width: 15 }, // Toplam Fiyat
      { width: 12 }, // Kesim Tipi
      { width: 8 }   // Saçak
    ]

    // Bilgi satırları ekle
    worksheet.insertRow(1, [`Detaylı Sipariş Raporu (${startDate.toLocaleDateString('tr-TR')} - ${endDate.toLocaleDateString('tr-TR')})`])
    worksheet.insertRow(2, [`Toplam ${orders.length} sipariş`])
    worksheet.insertRow(3, []) // Boş satır

    // İlk satırı merge et ve stilini ayarla
    worksheet.mergeCells('A1:O1')
    const titleCell = worksheet.getCell('A1')
    titleCell.font = { size: 14, bold: true }
    titleCell.alignment = { horizontal: 'center' }
  }

  /**
   * Muhasebe hareketleri Excel'i oluştur
   */
  private async createAccountingTransactionsExcel(workbook: ExcelJS.Workbook, transactions: any[], startDate: Date, endDate: Date) {
    const worksheet = workbook.addWorksheet('Muhasebe Hareketleri')

    // Başlık satırı
    const headerRow = worksheet.addRow([
      'İşlem ID',
      'Mağaza Adı',
      'Müşteri Adı',
      'İşlem Tarihi',
      'İşlem Türü',
      'Tutar (TL)',
      'Tür',
      'Metrekare',
      'Ürün',
      'Açıklama'
    ])

    // Başlık stilini ayarla
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '366092' } }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      cell.alignment = { horizontal: 'center' }
    })

    // Veri satırları
    let totalIncome = 0
    let totalExpense = 0

    transactions.forEach((transaction) => {
      const row = worksheet.addRow([
        transaction.id,
        transaction.store?.kurum_adi || 'Bilinmeyen Mağaza',
        `${transaction.customer?.name || ''} ${transaction.customer?.surname || ''}`.trim(),
        transaction.transaction_date.toLocaleDateString('tr-TR'),
        transaction.transaction_type,
        Number(transaction.amount),
        transaction.is_expense ? 'GİDER' : 'GELİR',
        transaction.square_meters ? Number(transaction.square_meters) : '',
        transaction.product?.name || '',
        transaction.description
      ])

      // Satır stilini ayarla
      row.eachCell((cell, index) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        
        if (index === 6) { // Tutar kolonu
          cell.numFmt = '#,##0.00₺'
          
          // Gelir/Gider renklendirmesi
          if (transaction.is_expense) {
            cell.font = { color: { argb: 'FF0000' } } // Kırmızı (Gider)
            totalExpense += Number(transaction.amount)
          } else {
            cell.font = { color: { argb: '008000' } } // Yeşil (Gelir)
            totalIncome += Number(transaction.amount)
          }
        }
        
        if (index === 7) { // Tür kolonu
          if (transaction.is_expense) {
            cell.font = { color: { argb: 'FF0000' } }
          } else {
            cell.font = { color: { argb: '008000' } }
          }
        }

        if (index === 8) { // Metrekare kolonu
          cell.numFmt = '#,##0.00'
        }
      })
    })

    // Özet bilgileri için boş satır
    worksheet.addRow([])

    // Özet satırları
    const summaryStartRow = worksheet.rowCount + 1
    
    const incomeRow = worksheet.addRow(['', '', '', '', 'TOPLAM GELİR', totalIncome, 'GELİR', '', '', ''])
    incomeRow.getCell(6).numFmt = '#,##0.00₺'
    incomeRow.getCell(6).font = { bold: true, color: { argb: '008000' } }
    incomeRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E8' } }
    })

    const expenseRow = worksheet.addRow(['', '', '', '', 'TOPLAM GİDER', totalExpense, 'GİDER', '', '', ''])
    expenseRow.getCell(6).numFmt = '#,##0.00₺'
    expenseRow.getCell(6).font = { bold: true, color: { argb: 'FF0000' } }
    expenseRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8' } }
    })

    const netRow = worksheet.addRow(['', '', '', '', 'NET BAKIYE', totalIncome - totalExpense, totalIncome >= totalExpense ? 'ALACAK' : 'BORÇ', '', '', ''])
    netRow.getCell(6).numFmt = '#,##0.00₺'
    netRow.getCell(6).font = { bold: true, color: { argb: totalIncome >= totalExpense ? '008000' : 'FF0000' } }
    netRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } }
    })

    // Sütun genişliklerini ayarla
    worksheet.columns = [
      { width: 25 }, // İşlem ID
      { width: 25 }, // Mağaza Adı
      { width: 20 }, // Müşteri Adı
      { width: 15 }, // Tarih
      { width: 20 }, // İşlem Türü
      { width: 15 }, // Tutar
      { width: 10 }, // Tür
      { width: 12 }, // Metrekare
      { width: 25 }, // Ürün
      { width: 40 }  // Açıklama
    ]

    // Bilgi satırları ekle
    worksheet.insertRow(1, [`Muhasebe Hareketleri Raporu (${startDate.toLocaleDateString('tr-TR')} - ${endDate.toLocaleDateString('tr-TR')})`])
    worksheet.insertRow(2, [`Toplam ${transactions.length} hareket`])
    worksheet.insertRow(3, []) // Boş satır

    // İlk satırı merge et ve stilini ayarla
    worksheet.mergeCells('A1:J1')
    const titleCell = worksheet.getCell('A1')
    titleCell.font = { size: 14, bold: true }
    titleCell.alignment = { horizontal: 'center' }
  }
}

export const excelExportController = new ExcelExportController() 