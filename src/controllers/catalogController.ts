import { Request, Response } from 'express';
import { CatalogService } from '../catalog-service';

const catalogService = new CatalogService();

/**
 * 🚀 Optimize edilmiş büyük kataloglar için PDF oluşturma
 */
export const generateCatalog = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { productIds, companyName, companyLogoUrl } = req.body;
    
    console.log('🚀 Large Catalog oluşturma isteği alındı:', {
      productIds: productIds?.length || 'tüm ürünler',
      companyName,
      companyLogoUrl: companyLogoUrl ? 'var' : 'yok',
      timestamp: new Date().toISOString()
    });

    // Validate input
    if (productIds && (!Array.isArray(productIds) || productIds.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'ProductIds bir dizi olmalı ve boş olmamalıdır'
      });
    }

    // Check if too many products for single request
    const totalProductsWarning = productIds?.length || 'tüm ürünler';
    if (productIds && productIds.length > 500) {
      console.warn(`⚠️ Çok fazla ürün seçildi: ${productIds.length}. Bu işlem uzun sürebilir.`);
    }

    // Extended timeout for large catalogs (15 minutes)
    const extendedTimeout = 900000;
    req.setTimeout(extendedTimeout, () => {
      console.error(`❌ Request timeout - ${extendedTimeout/1000} saniye aşıldı`);
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Katalog oluşturma işlemi zaman aşımına uğradı. Lütfen daha az ürün seçerek tekrar deneyin.'
        });
      }
    });

    // Set initial response headers for streaming
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=urun-katalogu.pdf');
    
    // Progress tracking
    let progressSent = false;
    const progressInterval = setInterval(() => {
      if (!res.headersSent && !progressSent) {
        console.log('⏳ Katalog oluşturma devam ediyor...');
      }
    }, 30000); // Every 30 seconds
    
    try {
      // Generate catalog with progress monitoring
      const pdfBuffer = await catalogService.generateCatalog({
        productIds,
        companyName,
        companyLogoUrl
      });
      
      clearInterval(progressInterval);
      
      const totalTime = Date.now() - startTime;
      console.log(`🎉 Large Catalog başarıyla oluşturuldu! Controller toplam süre: ${totalTime}ms`);
      console.log(`📊 PDF boyutu: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
      
      // Set final headers
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.setHeader('X-Catalog-Generation-Time', totalTime.toString());
      res.setHeader('X-Catalog-Size', pdfBuffer.length.toString());
      
      // Send PDF
      return res.send(pdfBuffer);
      
    } catch (catalogError) {
      clearInterval(progressInterval);
      throw catalogError;
    }
    
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Katalog oluşturma hatası (${totalTime}ms):`, error);
    
    // Determine error type and appropriate message
    let errorMessage = 'Katalog oluşturulamadı';
    let statusCode = 500;
    
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      errorMessage = 'Katalog oluşturma işlemi zaman aşımına uğradı. Lütfen daha az ürün seçerek tekrar deneyin.';
      statusCode = 408;
    } else if (error.message?.includes('memory') || error.message?.includes('Memory')) {
      errorMessage = 'Katalog oluşturma işlemi için yeterli bellek yok. Lütfen daha az ürün seçerek tekrar deneyin.';
      statusCode = 507; // Insufficient Storage
    } else if (error.message?.includes('PDF oluşturulamadı')) {
      errorMessage = 'PDF oluşturma hatası. Lütfen tekrar deneyin.';
      statusCode = 422; // Unprocessable Entity
    }
    
    if (!res.headersSent) {
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        duration: totalTime,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } else {
      // If headers already sent, log the error
      console.error('Headers already sent, cannot send error response');
    }
  }
}; 