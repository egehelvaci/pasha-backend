import { Request, Response } from 'express';
import { CatalogService } from '../catalog-service';

const catalogService = new CatalogService();

/**
 * 🚀 Optimize edilmiş HTML ve Puppeteer kullanarak PDF katalog oluşturur
 */
export const generateCatalog = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { productIds, companyName, companyLogoUrl } = req.body;
    
    console.log('🚀 Katalog oluşturma isteği alındı:', {
      productIds: productIds?.length || 'tüm ürünler',
      companyName,
      companyLogoUrl: companyLogoUrl ? 'var' : 'yok',
      timestamp: new Date().toISOString()
    });

    // Request timeout ayarla (10 dakika)
    req.setTimeout(600000, () => {
      console.error('❌ Request timeout - 10 dakika aşıldı');
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Katalog oluşturma işlemi zaman aşımına uğradı'
        });
      }
    });
    
    // Katalog oluştur
    const pdfBuffer = await catalogService.generateCatalog({
      productIds,
      companyName,
      companyLogoUrl
    });
    
    const totalTime = Date.now() - startTime;
    console.log(`🎉 Katalog başarıyla oluşturuldu! Controller toplam süre: ${totalTime}ms`);
    
    // PDF başlıklarını ayarla
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=urun-katalogu.pdf');
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    
    // PDF'i gönder
    return res.send(pdfBuffer);
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Katalog oluşturma hatası (${totalTime}ms):`, error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Katalog oluşturulamadı',
        duration: totalTime
      });
    }
  }
}; 