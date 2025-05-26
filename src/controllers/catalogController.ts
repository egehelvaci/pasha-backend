import { Request, Response } from 'express';
import { CatalogService } from '../catalog-service';

const catalogService = new CatalogService();

/**
 * 🚀 Railway için optimize edilmiş PDF katalog oluşturur
 */
export const generateCatalog = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { productIds, companyName, companyLogoUrl } = req.body;
    
    console.log('🚀 Railway katalog oluşturma isteği alındı:', {
      productIds: productIds?.length || 'tüm ürünler (max 50)',
      companyName,
      companyLogoUrl: companyLogoUrl ? 'var' : 'yok',
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage()
    });

    // Railway için agresif timeout (5 dakika)
    req.setTimeout(300000, () => {
      console.error('❌ Railway timeout - 5 dakika aşıldı');
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Railway katalog oluşturma işlemi zaman aşımına uğradı (5 dakika)',
          duration: Date.now() - startTime
        });
      }
    });
    
    // Memory monitoring
    const initialMemory = process.memoryUsage();
    console.log('🧠 Railway başlangıç memory:', {
      rss: Math.round(initialMemory.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(initialMemory.heapUsed / 1024 / 1024) + 'MB'
    });
    
    // Katalog oluştur
    const pdfBuffer = await catalogService.generateCatalog({
      productIds,
      companyName,
      companyLogoUrl
    });
    
    const totalTime = Date.now() - startTime;
    const finalMemory = process.memoryUsage();
    
    console.log(`🎉 Railway katalog başarıyla oluşturuldu!`, {
      duration: totalTime + 'ms',
      pdfSize: Math.round(pdfBuffer.length / 1024 / 1024) + 'MB',
      finalMemory: {
        rss: Math.round(finalMemory.rss / 1024 / 1024) + 'MB',
        heapUsed: Math.round(finalMemory.heapUsed / 1024 / 1024) + 'MB'
      }
    });
    
    // PDF başlıklarını ayarla
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=railway-katalog.pdf');
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.setHeader('Cache-Control', 'no-cache');
    
    // PDF'i gönder
    return res.send(pdfBuffer);
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    const errorMemory = process.memoryUsage();
    
    console.error(`❌ Railway katalog hatası (${totalTime}ms):`, {
      error: error.message,
      stack: error.stack?.substring(0, 500),
      memory: {
        rss: Math.round(errorMemory.rss / 1024 / 1024) + 'MB',
        heapUsed: Math.round(errorMemory.heapUsed / 1024 / 1024) + 'MB'
      }
    });
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Railway katalog oluşturulamadı: ' + error.message,
        duration: totalTime,
        errorType: error.name || 'UnknownError'
      });
    }
  }
}; 