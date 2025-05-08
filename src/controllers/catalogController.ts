import { Request, Response } from 'express';
import { CatalogService } from '../catalog-service';

const catalogService = new CatalogService();

/**
 * HTML ve Puppeteer kullanarak PDF katalog oluşturur
 */
export const generateCatalog = async (req: Request, res: Response) => {
  try {
    const { productIds, companyName, companyLogoUrl } = req.body;
    
    console.log('Katalog oluşturma isteği alındı:', {
      productIds: productIds?.length || 'tüm ürünler',
      companyName,
      companyLogoUrl: companyLogoUrl ? 'var' : 'yok'
    });
    
    // Katalog oluştur
    const pdfBuffer = await catalogService.generateCatalog({
      productIds,
      companyName,
      companyLogoUrl
    });
    
    // PDF başlıklarını ayarla
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=urun-katalogu.pdf');
    
    // PDF'i gönder
    return res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Katalog oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Katalog oluşturulamadı'
    });
  }
}; 