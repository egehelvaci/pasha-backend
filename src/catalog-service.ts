// catalog-service.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { CollectionService } from './collection-service';
import axios from 'axios';
import { Prisma } from '../generated/prisma';
import { TebiService } from './utils/tebi-service';
import { ProductService } from './product-service';
import prisma from './utils/prisma';

interface ProductType {
  productId: string;
  name: string;
  description: string;
  productImage?: string | null;
  collectionId: string;
  collection: {
    name: string;
  };
  presignedImageUrl?: string;
}

interface CollectionProducts {
  collectionName: string;
  products: ProductType[];
  pageNumber: number;
}

interface ProductsByCollection {
  [collectionId: string]: CollectionProducts;
}

interface CatalogTemplateData {
  companyName: string;
  companyLogoUrl?: string;
  formatDate: string;
  currentYear: number;
  currentDate: string;
  collections: CollectionProducts[];
  backgroundImage: string;
  blackLogo: string;
  robotoRegularFont: string;
  robotoBoldFont: string;
}

export class CatalogService {
  private collectionService = new CollectionService();
  private templatePath = path.resolve(__dirname, 'templates/catalog.hbs');
  private backgroundImageUrl = 'https://s3.tebi.io/pashahome/pexels-meruyert-gonullu-7314471.jpg';
  private blackLogoPath = this.getLogoPath();
  private robotoRegularFontPath = path.resolve(__dirname, 'assets/fonts/Roboto-Regular.ttf');
  private robotoBoldFontPath = path.resolve(__dirname, 'assets/fonts/Roboto-Bold.ttf');
  
  // 🚀 Optimized settings for large catalogs (500+ products)
  private static browserInstance: Browser | null = null;
  private imageCache = new Map<string, string>();
  private readonly MAX_CONCURRENT_IMAGES = 10; // Reduced for memory
  private readonly IMAGE_TIMEOUT = 8000; // Increased timeout
  private readonly BROWSER_TIMEOUT = 120000; // 2 minutes
  private readonly PDF_TIMEOUT = 300000; // 5 minutes for large catalogs
  private readonly HTML_LOAD_TIMEOUT = 90000; // 1.5 minutes
  private readonly MAX_PRODUCTS_PER_BATCH = 50; // Process in batches
  private readonly MEMORY_CLEANUP_INTERVAL = 25; // Cleanup every 25 products

  constructor() {
    // Handlebars yardımcı fonksiyonları
    handlebars.registerHelper('formatDate', () => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      return `${day}/${month}/${year}`;
    });

    handlebars.registerHelper('currentYear', () => {
      return new Date().getFullYear();
    });
    
    handlebars.registerHelper('currentDate', () => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      return `${day}/${month}/${year}`;
    });
    
    console.log('🚀 Optimized CatalogService başlatıldı (Large Catalog Support)');
    console.log('Çalışma dizini (CWD):', process.cwd());
    
    // Memory monitoring
    this.logMemoryUsage('Constructor');
  }

  async generateCatalog(options: {
    productIds?: string[];
    companyName?: string;
    companyLogoUrl?: string;
  }): Promise<Buffer> {
    const { productIds, companyName = "Şirket Adı", companyLogoUrl } = options;
    
    const startTime = Date.now();
    console.log('🚀 Large Catalog oluşturma başladı...');
    this.logMemoryUsage('Start');
    
    try {
      // 1. Get products with pagination approach
      let products: ProductType[] = [];
      if (productIds?.length) {
        products = await this.getProductsByIdsOptimized(productIds);
      } else {
        products = await this.getAllProductsOptimized();
      }
      
      console.log(`✅ ${products.length} ürün alındı (${Date.now() - startTime}ms)`);
      this.logMemoryUsage('Products Loaded');
      
      // 2. Split into smaller batches for memory management
      const batches = this.splitIntoBatches(products, this.MAX_PRODUCTS_PER_BATCH);
      console.log(`📦 ${batches.length} batch'e bölündü (batch başına ${this.MAX_PRODUCTS_PER_BATCH} ürün)`);
      
      // 3. Process batches sequentially to prevent memory overflow
      const processedBatches: ProductType[][] = [];
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`⚡ Batch ${i + 1}/${batches.length} işleniyor (${batch.length} ürün)...`);
        
        const processedBatch = await this.processBatchOptimized(batch);
        processedBatches.push(processedBatch);
        
        // Memory cleanup between batches
        if (i % this.MEMORY_CLEANUP_INTERVAL === 0) {
          await this.performMemoryCleanup();
          this.logMemoryUsage(`After Batch ${i + 1}`);
        }
      }
      
      // 4. Combine all processed products
      const allProcessedProducts = processedBatches.flat();
      console.log(`✅ Tüm batch'ler işlendi (${Date.now() - startTime}ms)`);
      
      // 5. Prepare template data with optimized approach
      const templateData = await this.prepareTemplateDataMemoryOptimized(
        allProcessedProducts, 
        companyName, 
        companyLogoUrl
      );
      console.log(`✅ Template data hazırlandı (${Date.now() - startTime}ms)`);
      this.logMemoryUsage('Template Ready');
      
      // 6. Generate HTML with streaming approach
      const html = await this.generateHTML(templateData);
      console.log(`✅ HTML oluşturuldu (${Date.now() - startTime}ms)`);
      
      // 7. Generate PDF with optimized settings
      const pdfBuffer = await this.generatePDFFromHTMLMemoryOptimized(html);
      
      const totalTime = Date.now() - startTime;
      console.log(`🎉 Large Catalog başarıyla oluşturuldu! Toplam süre: ${totalTime}ms`);
      this.logMemoryUsage('Complete');
      
      return pdfBuffer;
    } catch (error: any) {
      console.error('❌ Katalog oluşturma hatası:', error);
      this.logMemoryUsage('Error');
      throw new Error(`Katalog oluşturulurken bir hata oluştu: ${error.message}`);
    } finally {
      // Final cleanup
      await this.performMemoryCleanup();
    }
  }

  /**
   * 🚀 Optimize edilmiş HTML'den PDF oluşturma
   */
  private async generatePDFFromHTMLOptimized(html: string): Promise<Buffer> {
    let browser = CatalogService.browserInstance;
    
    // Browser instance yoksa oluştur
    if (!browser || !browser.isConnected()) {
      console.log('🚀 Yeni browser instance oluşturuluyor...');
      browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-gpu',
          '--no-first-run',
          '--disable-default-apps',
          '--disable-extensions',
          '--disable-translate',
          '--disable-background-timer-throttling'
        ],
        headless: true,
        timeout: this.BROWSER_TIMEOUT
      });
      CatalogService.browserInstance = browser;
    }
    
    const page = await browser.newPage();
    
    try {
      // Viewport ayarla
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 1
      });
      
      // Request interception'ı basitleştir
      await page.setRequestInterception(true);
      page.on('request', (request: any) => {
        const resourceType = request.resourceType();
        // Sadece gerekli kaynakları yükle
        if (['document', 'stylesheet', 'image', 'font'].includes(resourceType)) {
          request.continue();
        } else {
          request.abort();
        }
      });

      // HTML'i hızlı yükle - 300 ürün için timeout artırıldı
      await page.setContent(html, { 
        waitUntil: 'domcontentloaded',
        timeout: this.HTML_LOAD_TIMEOUT // 45 saniye timeout (15'ten artırıldı)
      });
      
      // CSS inject et
      await page.addStyleTag({
        content: `
          @media screen {
            * { -webkit-print-color-adjust: exact !important; }
          }
          @page { margin: 10mm; size: A4; }
        `
      });
      
      // Daha uzun bekleme (300 ürün için)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 500ms'den 2s'ye artırıldı
      
      // PDF oluştur - 300 ürün için timeout artırıldı
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        },
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        timeout: this.PDF_TIMEOUT // 120 saniye PDF timeout (30'dan artırıldı)
      });
      
      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
      // Browser'ı açık bırak (tekrar kullanım için)
    }
  }

  /**
   * 🚀 Optimize edilmiş template data hazırlama
   */
  private async prepareTemplateDataOptimized(
    products: ProductType[], 
    companyName: string, 
    companyLogoUrl?: string
  ): Promise<CatalogTemplateData> {
    console.log(`🚀 ${products.length} ürün için optimize edilmiş template hazırlanıyor...`);

    // Paralel işlemler için promise'ları hazırla
    const [
      productsWithImages,
      backgroundImage,
      blackLogo,
      fonts
    ] = await Promise.all([
      // 1. Ürün resimlerini paralel yükle
      this.loadProductImagesInBatches(products),
      // 2. Arka plan resmini yükle
      this.loadCatalogBackgroundImageCached(),
      // 3. Logo'yu yükle
      this.loadBlackLogoCached(),
      // 4. Fontları yükle
      Promise.all([
        this.loadFontAsBase64Cached(this.robotoRegularFontPath),
        this.loadFontAsBase64Cached(this.robotoBoldFontPath)
      ])
    ]);

    const [robotoRegularFont, robotoBoldFont] = fonts;

    // Ürünleri koleksiyonlara grupla
    const collections = this.groupProductsByCollection(productsWithImages);
    
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const currentDate = `${day}/${month}/${year}`;
    
    return {
      companyName: companyName || 'PAŞA HOME',
      companyLogoUrl,
      formatDate: currentDate,
      currentYear: now.getFullYear(),
      currentDate: currentDate,
      collections,
      backgroundImage,
      blackLogo,
      robotoRegularFont,
      robotoBoldFont
    };
  }

  /**
   * 🚀 Ürün resimlerini batch'ler halinde paralel yükle
   */
  private async loadProductImagesInBatches(products: ProductType[]): Promise<ProductType[]> {
    console.log(`🚀 ${products.length} ürün resmi batch'ler halinde yükleniyor...`);
    
    const results: ProductType[] = [];
    
    // Batch'ler halinde işle
    for (let i = 0; i < products.length; i += this.MAX_CONCURRENT_IMAGES) {
      const batch = products.slice(i, i + this.MAX_CONCURRENT_IMAGES);
      
      const batchPromises = batch.map(async (product) => {
        if (product.productImage) {
          try {
            product.productImage = await this.loadImageAsDataUrlCached(product.productImage);
          } catch (error) {
            console.warn(`⚠️ Resim yüklenemedi: ${product.name}`);
            product.productImage = this.getDefaultImageDataUrl();
          }
        } else {
          product.productImage = this.getDefaultImageDataUrl();
        }
        return product;
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      const successfulResults = batchResults
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<ProductType>).value);
      
      results.push(...successfulResults);
      
      console.log(`✅ Batch ${Math.floor(i / this.MAX_CONCURRENT_IMAGES) + 1} tamamlandı (${successfulResults.length}/${batch.length})`);
    }
    
    return results;
  }

  /**
   * 🚀 Cache'li resim yükleme
   */
  private async loadImageAsDataUrlCached(imageUrl: string): Promise<string> {
    // Cache'de var mı kontrol et
    if (this.imageCache.has(imageUrl)) {
      return this.imageCache.get(imageUrl)!;
    }
    
    try {
      // Timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), this.IMAGE_TIMEOUT);
      });
      
      let dataUrl: string;
      if (imageUrl.includes('tebi.io')) {
        dataUrl = await Promise.race([this.loadTebiImageOptimized(imageUrl), timeoutPromise]);
      } else {
        dataUrl = await Promise.race([this.loadRegularImageOptimized(imageUrl), timeoutPromise]);
      }
      
      // Cache'e kaydet
      this.imageCache.set(imageUrl, dataUrl);
      return dataUrl;
      
    } catch (error) {
      const defaultImage = this.getDefaultImageDataUrl();
      this.imageCache.set(imageUrl, defaultImage);
      return defaultImage;
    }
  }

  /**
   * 🚀 Optimize edilmiş Tebi resim yükleme
   */
  private async loadTebiImageOptimized(imageUrl: string): Promise<string> {
    // Sadece orijinal URL'yi dene (presigned URL işlemini atla)
    const attempts = [
      imageUrl,
      imageUrl.replace('http://', 'https://')
    ];
    
    for (const url of attempts) {
      try {
        return await this.loadRegularImageOptimized(url);
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Tebi resim yüklenemedi');
  }

  /**
   * 🚀 Optimize edilmiş normal resim yükleme
   */
  private async loadRegularImageOptimized(imageUrl: string): Promise<string> {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CatalogBot/1.0)',
        'Accept': 'image/*'
      },
      timeout: this.IMAGE_TIMEOUT,
      maxRedirects: 2
    });
    
    if (!response.data || response.data.length === 0) {
      throw new Error('Boş resim verisi');
    }
    
    // MIME tipini belirle
    let contentType = response.headers['content-type'] || this.detectImageMimeType(imageUrl, response.data);
    
    // Base64'e çevir
    const base64 = Buffer.from(response.data).toString('base64');
    
    return `data:${contentType};base64,${base64}`;
  }

  /**
   * 🚀 HTML oluşturma
   */
  private async generateHTML(templateData: CatalogTemplateData): Promise<string> {
    const templatePath = path.join(__dirname, 'templates', 'catalog.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    
    return template(templateData);
  }

  /**
   * 🚀 Ürünleri koleksiyonlara grupla
   */
  private groupProductsByCollection(products: ProductType[]): CollectionProducts[] {
    const productsByCollection: ProductsByCollection = {};
    
    // Ürünleri koleksiyonlara göre grupla
    for (const product of products) {
      const collectionId = product.collectionId || 'uncategorized';
      const collectionName = product.collection.name || 'Kategorisiz Ürünler';
      
      if (!productsByCollection[collectionId]) {
        productsByCollection[collectionId] = {
          collectionName,
          products: [],
          pageNumber: 0
        };
      }
      
      productsByCollection[collectionId].products.push(product);
    }
    
    // Koleksiyonları diziye dönüştür ve sayfalara böl
    const collections: CollectionProducts[] = [];
    let pageCounter = 1;
    
    const sortedCollections = Object.values(productsByCollection)
      .filter(collection => collection.products.length > 0)
      .sort((a, b) => a.collectionName.localeCompare(b.collectionName, 'tr'));
    
    // Her koleksiyonu sayfalara böl (her sayfada maksimum 9 ürün)
    for (const collection of sortedCollections) {
      const productsPerPage = 9;
      const totalProducts = collection.products.length;
      const totalPages = Math.ceil(totalProducts / productsPerPage);
      
      for (let page = 0; page < totalPages; page++) {
        const startIndex = page * productsPerPage;
        const endIndex = Math.min(startIndex + productsPerPage, totalProducts);
        const pageProducts = collection.products.slice(startIndex, endIndex);
        
        collections.push({
          collectionName: collection.collectionName,
          products: pageProducts,
          pageNumber: pageCounter++
        });
      }
    }
    
    return collections;
  }

  /**
   * 🚀 Cache'li arka plan resmi yükleme
   */
  private async loadCatalogBackgroundImageCached(): Promise<string> {
    const cacheKey = 'background_image';
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }
    
    try {
      const backgroundImage = await this.loadImageAsDataUrlCached(this.backgroundImageUrl);
      this.imageCache.set(cacheKey, backgroundImage);
      return backgroundImage;
    } catch (error) {
      const defaultBg = 'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="1200" height="1600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f8f9fa"/>
              <stop offset="100%" style="stop-color:#e9ecef"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg)"/>
        </svg>
      `).toString('base64');
      this.imageCache.set(cacheKey, defaultBg);
      return defaultBg;
    }
  }

  /**
   * 🚀 Cache'li logo yükleme
   */
  private async loadBlackLogoCached(): Promise<string> {
    const cacheKey = 'black_logo';
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }
    
    try {
      if (fs.existsSync(this.blackLogoPath)) {
        const svgContent = fs.readFileSync(this.blackLogoPath, 'utf8');
        const base64Svg = Buffer.from(svgContent).toString('base64');
        const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
        this.imageCache.set(cacheKey, dataUrl);
        return dataUrl;
      }
    } catch (error) {
      console.error('Logo yüklenemedi:', error);
    }
    
    const emptyLogo = '';
    this.imageCache.set(cacheKey, emptyLogo);
    return emptyLogo;
  }

  /**
   * 🚀 Cache'li font yükleme
   */
  private async loadFontAsBase64Cached(fontPath: string): Promise<string> {
    const cacheKey = `font_${fontPath}`;
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }
    
    try {
      if (fs.existsSync(fontPath)) {
        const fontBuffer = fs.readFileSync(fontPath);
        const base64Font = fontBuffer.toString('base64');
        this.imageCache.set(cacheKey, base64Font);
        return base64Font;
      }
    } catch (error) {
      console.error('Font yüklenemedi:', error);
    }
    
    this.imageCache.set(cacheKey, '');
    return '';
  }

  /**
   * 🚀 Optimize edilmiş çoklu ürün getirme
   */
  private async getProductsByIds(productIds: string[]): Promise<ProductType[]> {
    try {
      const products = await prisma.product.findMany({
        where: { 
          productId: { 
            in: productIds 
          } 
        },
        include: {
          collection: true
        }
      });
      
      return products as ProductType[];
    } catch (error) {
      console.error('Ürünleri getirme hatası:', error);
      return [];
    }
  }

  /**
   * Browser instance'ını temizle
   */
  static async cleanup(): Promise<void> {
    if (CatalogService.browserInstance) {
      try {
        await CatalogService.browserInstance.close();
        CatalogService.browserInstance = null;
        console.log('🧹 Browser instance temizlendi');
      } catch (error) {
        console.error('Browser temizleme hatası:', error);
      }
    }
  }
  
  /**
   * Bir görsel URL'sini yükleyip Data URL formatına dönüştürür
   */
  private async loadImageAsDataUrl(imageUrl: string): Promise<string> {
    try {
      console.log(`Görsel yükleniyor: ${imageUrl}`);
      
      // 5 saniye timeout ekle
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
      
      // Tebi.io URL'leri için özel işlem
      if (imageUrl.includes('tebi.io')) {
        return await Promise.race([this.loadTebiImage(imageUrl), timeoutPromise]);
      }
      
      // Diğer URL'ler için normal işlem
      return await Promise.race([this.loadRegularImage(imageUrl), timeoutPromise]);
      
    } catch (error) {
      console.error(`Görsel yüklenemedi (${error instanceof Error ? error.message : 'timeout'}): ${imageUrl}`);
      return this.getDefaultImageDataUrl();
    }
  }

  /**
   * Tebi.io görsellerini yükler
   */
  private async loadTebiImage(imageUrl: string): Promise<string> {
    console.log('Tebi.io görseli yükleniyor:', imageUrl);
    
    // Önce presigned URL ile deneyelim
    try {
      const presignedUrl = await this.getPresignedUrl(imageUrl);
      if (presignedUrl && presignedUrl !== imageUrl) {
        console.log('Presigned URL ile deneniyor...');
        return await this.loadRegularImage(presignedUrl);
      }
    } catch (presignError) {
      console.warn('Presigned URL alınamadı:', presignError);
    }
    
    // Presigned URL başarısızsa, farklı yöntemler deneyelim
    const attempts = [
      // 1. Orijinal URL
      imageUrl,
      // 2. HTTPS zorla
      imageUrl.replace('http://', 'https://'),
      // 3. Tebi.io public URL formatı
      imageUrl.replace(/^https?:\/\/[^\/]+\//, 'https://s3.tebi.io/pasha-home-bucket/')
    ];
    
    for (const url of attempts) {
      try {
        console.log(`Tebi URL denemesi: ${url}`);
        return await this.loadRegularImage(url);
      } catch (error) {
        console.warn(`Tebi URL başarısız: ${url}`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }
    
    throw new Error('Tüm Tebi URL denemeleri başarısız');
  }
  
  /**
   * Normal görsel URL'lerini yükler
   */
  private async loadRegularImage(imageUrl: string): Promise<string> {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    
    // Tebi.io için özel header'lar
    if (imageUrl.includes('tebi.io')) {
      headers['Origin'] = 'https://pashahome.com';
      headers['Referer'] = 'https://pashahome.com/';
      
      // Eğer environment variable'lar varsa ekle
      if (process.env.TEBI_ACCESS_KEY && process.env.TEBI_SECRET_KEY) {
        console.log('Tebi erişim bilgileri kullanılıyor...');
        // AWS S3 tarzı authorization header'ı eklenebilir
      }
    }
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers,
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400
    });
    
    if (!response.data || response.data.length === 0) {
      throw new Error('Boş görsel verisi alındı');
    }
    
    // MIME tipini belirle
    let contentType = response.headers['content-type'];
    if (!contentType || contentType === 'application/octet-stream') {
      contentType = this.detectImageMimeType(imageUrl, response.data);
    }
    
    // Binary veriyi base64'e çevir
    const base64 = Buffer.from(response.data).toString('base64');
    
    console.log(`Görsel başarıyla yüklendi: ${Math.floor(base64.length / 1024)} KB, MIME: ${contentType}`);
    
    return `data:${contentType};base64,${base64}`;
  }
  
  /**
   * Görsel MIME tipini tespit eder
   */
  private detectImageMimeType(url: string, data: ArrayBuffer): string {
    // Dosya uzantısından tahmin et
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
      return 'image/jpeg';
    } else if (urlLower.includes('.png')) {
      return 'image/png';
    } else if (urlLower.includes('.gif')) {
      return 'image/gif';
    } else if (urlLower.includes('.webp')) {
      return 'image/webp';
    } else if (urlLower.includes('.svg')) {
      return 'image/svg+xml';
    }
    
    // Binary veriden magic number'lara bakarak tespit et
    const bytes = new Uint8Array(data.slice(0, 12));
    
    // JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return 'image/jpeg';
    }
    
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return 'image/png';
    }
    
    // GIF: 47 49 46 38
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return 'image/gif';
    }
    
    // WebP: 52 49 46 46 ... 57 45 42 50
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return 'image/webp';
    }
    
    // Varsayılan olarak JPEG
    return 'image/jpeg';
  }
  
  /**
   * Tebi.io için imzalı URL oluşturma işlemi
   */
  private async getPresignedUrl(originalUrl: string): Promise<string | null> {
    try {
      console.log("Presigned URL alınıyor:", originalUrl);
      
      // Tebi servisi var mı diye kontrol edelim
      try {
        // Tebi servisini dinamik olarak import edelim
        const { TebiService } = require('./utils/tebi-service');
        if (TebiService) {
          console.log('Tebi servisi bulundu, presign URL oluşturuluyor...');
          const tebiService = new TebiService();
          
          // Doğrudan URL'yi kullanarak Presigned URL oluştur
          const presignedUrl = await tebiService.getPresignedUrlFromProductImage(originalUrl);
          if (presignedUrl) {
            console.log('Tebi servisi ile presign URL oluşturuldu');
            return presignedUrl;
          }
        }
      } catch (importError) {
        console.error('Tebi servisi bulunamadı veya yüklenemedi:', importError);
        console.log('Diğer metodlarla devam ediliyor');
      }
      
      // Tebi servisi bulunamadı, direkt olarak URL'i kullanmaya çalışalım
      console.log('Orijinal URL ile devam ediliyor');
      return originalUrl;
    } catch (error) {
      console.error('Presigned URL oluşturulamadı:', error);
      return null;
    }
  }
  
  /**
   * Varsayılan görsel için data URL döndürür
   */
  private getDefaultImageDataUrl(): string {
    // Daha görünür bir placeholder - gri arka plan üzerinde "Resim Yok" yazısı
    const svgPlaceholder = `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="300" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
        <text x="150" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#999">
          Resim Yok
        </text>
        <text x="150" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#bbb">
          No Image
        </text>
        <circle cx="150" cy="100" r="20" fill="none" stroke="#ccc" stroke-width="2"/>
        <path d="M140 90 L160 90 M150 80 L150 100 M145 105 L155 105" stroke="#ccc" stroke-width="2" fill="none"/>
      </svg>
    `;
    
    const base64Svg = Buffer.from(svgPlaceholder).toString('base64');
    return `data:image/svg+xml;base64,${base64Svg}`;
  }

  /**
   * Katalog arka plan resmini yükler
   */
  private async loadCatalogBackgroundImage(): Promise<string> {
    try {
      console.log('Arka plan resmini yüklüyorum:', this.backgroundImageUrl);
      
      // URL'den görsel yükle
      const backgroundImageDataUrl = await this.loadImageAsDataUrl(this.backgroundImageUrl);
      
      console.log('Arka plan resmi başarıyla yüklendi');
      return backgroundImageDataUrl;
      
    } catch (error) {
      console.error('Arka plan resmi yüklenemedi:', error);
      // Hata durumunda varsayılan bir arka plan rengi döndür
      return 'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="1200" height="1600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f8f9fa"/>
              <stop offset="100%" style="stop-color:#e9ecef"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg)"/>
        </svg>
      `).toString('base64');
    }
  }
  
  /**
   * Font dosyasını base64 formatında kodlar
   */
  private async loadFontAsBase64(fontPath: string): Promise<string> {
    try {
      if (fs.existsSync(fontPath)) {
        const fontBuffer = fs.readFileSync(fontPath);
        return fontBuffer.toString('base64');
      } else {
        console.error(`Font dosyası bulunamadı: ${fontPath}`);
        return '';
      }
    } catch (error) {
      console.error('Font dosyası yüklenirken hata:', error);
      return '';
    }
  }

  /**
   * ID'ye göre ürün getir (Product service yerine)
   */
  private async getProductById(productId: string): Promise<ProductType | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { productId },
        include: {
          collection: true
        }
      });
      
      if (product) {
        // Görsel için presigned URL oluştur
        let presignedImageUrl = undefined;
        if (product.productImage && product.productImage.includes('tebi.io')) {
          try {
            presignedImageUrl = await this.getPresignedUrl(product.productImage);
          } catch (error) {
            console.error('Presigned URL oluşturma hatası:', error);
          }
        }
        
        return {
          ...product,
          presignedImageUrl
        } as ProductType;
      }
      
      return null;
    } catch (error) {
      console.error('Ürün getirme hatası:', error);
      return null;
    }
  }

  /**
   * Tüm ürünleri getir (Product service yerine)
   */
  private async getAllProducts(): Promise<ProductType[]> {
    try {
      const products = await prisma.product.findMany({
        include: {
          collection: true
        }
      });
      
      // Presigned URL'ler ekle
      const productsWithUrls = await Promise.all(
        products.map(async (product) => {
          let presignedImageUrl = undefined;
          if (product.productImage && product.productImage.includes('tebi.io')) {
            try {
              presignedImageUrl = await this.getPresignedUrl(product.productImage);
            } catch (error) {
              console.error(`Ürün ID ${product.productId} için presigned URL oluşturulamadı:`, error);
            }
          }
          
          return {
            ...product,
            presignedImageUrl
          } as ProductType;
        })
      );
      
      return productsWithUrls;
    } catch (error) {
      console.error('Ürünleri getirme hatası:', error);
      return [];
    }
  }

  /**
   * Black logo SVG'sini yükler
   */
  private async loadBlackLogo(): Promise<string> {
    try {
      console.log('Black logo yükleniyor:', this.blackLogoPath);
      
      if (fs.existsSync(this.blackLogoPath)) {
        console.log('Black logo bulundu, okunuyor...');
        const svgContent = fs.readFileSync(this.blackLogoPath, 'utf8');
        const base64Svg = Buffer.from(svgContent).toString('base64');
        
        console.log(`Black logo başarıyla okundu: ${Math.floor(base64Svg.length / 1024)} KB`);
        
        return `data:image/svg+xml;base64,${base64Svg}`;
      } else {
        console.error('Black logo dosyası bulunamadı:', this.blackLogoPath);
        return '';
      }
    } catch (error) {
      console.error('Black logo yüklenemedi:', error);
      return '';
    }
  }

  private getLogoPath(): string {
    // Production'da (dist klasöründe çalışırken) veya development'da çalışacak şekilde path belirle
    const possiblePaths = [
      // Production: dist klasöründen public erişimi
      path.join(__dirname, 'public', 'black-logo.svg'),
      // Development: root'tan public erişimi  
      path.join(process.cwd(), 'public', 'black-logo.svg'),
    ];
    
    for (const logoPath of possiblePaths) {
      if (fs.existsSync(logoPath)) {
        console.log('Logo bulundu:', logoPath);
        return logoPath;
      }
    }
    
    // Fallback: process.cwd() + public
    const fallbackPath = path.join(process.cwd(), 'public', 'black-logo.svg');
    console.warn('Logo dosyası bulunamadı, fallback kullanılıyor:', fallbackPath);
    return fallbackPath;
  }

  /**
   * Memory-optimized PDF generation
   */
  private async generatePDFFromHTMLMemoryOptimized(html: string): Promise<Buffer> {
    let browser: Browser | null = null;
    let page: Page | null = null;
    
    try {
      console.log('🚀 Memory-optimized PDF oluşturuluyor...');
      
      // Launch browser with memory optimization
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--memory-pressure-off',
          '--max-old-space-size=2048', // Limit memory usage
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        timeout: this.BROWSER_TIMEOUT
      });
      
      page = await browser.newPage();
      
      // Set memory limits
      await page.setDefaultNavigationTimeout(this.HTML_LOAD_TIMEOUT);
      await page.setDefaultTimeout(this.HTML_LOAD_TIMEOUT);
      
      // Set content with error handling
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: this.HTML_LOAD_TIMEOUT 
      });
      
      console.log('📄 HTML içeriği yüklendi, PDF oluşturuluyor...');
      
      // Generate PDF with optimization
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5cm',
          right: '0.5cm',
          bottom: '0.5cm',
          left: '0.5cm'
        },
        timeout: this.PDF_TIMEOUT
      });
      
      console.log(`✅ PDF oluşturuldu (${pdfBuffer.length} bytes)`);
      return pdfBuffer;
      
    } catch (error) {
      console.error('❌ PDF oluşturma hatası:', error);
      throw new Error(`PDF oluşturulamadı: ${error.message}`);
    } finally {
      // Always cleanup
      try {
        if (page) await page.close();
        if (browser) await browser.close();
      } catch (cleanupError) {
        console.warn('⚠️ Cleanup hatası:', cleanupError);
      }
    }
  }

  /**
   * Memory-optimized template data preparation
   */
  private async prepareTemplateDataMemoryOptimized(
    products: ProductType[], 
    companyName: string, 
    companyLogoUrl?: string
  ): Promise<CatalogTemplateData> {
    console.log(`🚀 Memory-optimized template hazırlanıyor (${products.length} ürün)...`);

    // Load shared resources once
    const [backgroundImage, blackLogo, fonts] = await Promise.all([
      this.loadCatalogBackgroundImageCached(),
      this.loadBlackLogoCached(),
      Promise.all([
        this.loadFontAsBase64Cached(this.robotoRegularFontPath),
        this.loadFontAsBase64Cached(this.robotoBoldFontPath)
      ])
    ]);

    const [robotoRegularFont, robotoBoldFont] = fonts;

    // Group products by collection (memory efficient)
    const collections = this.groupProductsByCollectionOptimized(products);
    
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const currentDate = `${day}/${month}/${year}`;
    
    return {
      companyName: companyName || 'PAŞA HOME',
      companyLogoUrl,
      formatDate: currentDate,
      currentYear: now.getFullYear(),
      currentDate: currentDate,
      collections,
      backgroundImage,
      blackLogo,
      robotoRegularFont,
      robotoBoldFont
    };
  }

  /**
   * Optimized collection grouping with memory management
   */
  private groupProductsByCollectionOptimized(products: ProductType[]): CollectionProducts[] {
    const productsByCollection: { [key: string]: { name: string; products: ProductType[] } } = {};
    
    // Group products by collection
    for (const product of products) {
      const collectionId = product.collectionId || 'uncategorized';
      const collectionName = product.collection?.name || 'Kategorisiz Ürünler';
      
      if (!productsByCollection[collectionId]) {
        productsByCollection[collectionId] = {
          name: collectionName,
          products: []
        };
      }
      
      productsByCollection[collectionId].products.push(product);
    }
    
    // Convert to array and paginate
    const collections: CollectionProducts[] = [];
    let pageCounter = 1;
    
    const sortedCollectionIds = Object.keys(productsByCollection).sort();
    
    for (const collectionId of sortedCollectionIds) {
      const collection = productsByCollection[collectionId];
      const productsPerPage = 6; // Reduced for better layout and memory
      const totalProducts = collection.products.length;
      const totalPages = Math.ceil(totalProducts / productsPerPage);
      
      for (let page = 0; page < totalPages; page++) {
        const startIndex = page * productsPerPage;
        const endIndex = Math.min(startIndex + productsPerPage, totalProducts);
        const pageProducts = collection.products.slice(startIndex, endIndex);
        
        collections.push({
          collectionName: collection.name,
          products: pageProducts,
          pageNumber: pageCounter++
        });
      }
    }
    
    return collections;
  }

  /**
   * Memory-optimized product fetching
   */
  private async getAllProductsOptimized(): Promise<ProductType[]> {
    try {
      console.log('🔍 Tüm ürünler optimize edilmiş şekilde getiriliyor...');
      
      const products = await prisma.product.findMany({
        select: {
          productId: true,
          name: true,
          description: true,
          productImage: true,
          collectionId: true,
          createdAt: true,
          collection: {
            select: {
              name: true,
              code: true
            }
          }
        },
        orderBy: [
          { collectionId: 'asc' },
          { name: 'asc' }
        ]
      });
      
      return products as ProductType[];
    } catch (error) {
      console.error('Ürünleri getirme hatası:', error);
      return [];
    }
  }

  /**
   * Optimized product fetching by IDs
   */
  private async getProductsByIdsOptimized(productIds: string[]): Promise<ProductType[]> {
    try {
      console.log(`🔍 ${productIds.length} ürün ID'sine göre getiriliyor...`);
      
      const products = await prisma.product.findMany({
        where: { 
          productId: { 
            in: productIds 
          } 
        },
        select: {
          productId: true,
          name: true,
          description: true,
          productImage: true,
          collectionId: true,
          createdAt: true,
          collection: {
            select: {
              name: true,
              code: true
            }
          }
        },
        orderBy: [
          { collectionId: 'asc' },
          { name: 'asc' }
        ]
      });
      
      return products as ProductType[];
    } catch (error) {
      console.error('Ürünleri getirme hatası:', error);
      return [];
    }
  }

  /**
   * Split products into manageable batches
   */
  private splitIntoBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Process a batch of products optimally
   */
  private async processBatchOptimized(batch: ProductType[]): Promise<ProductType[]> {
    try {
      // Load images for this batch only
      const batchWithImages = await this.loadProductImagesInBatchesOptimized(batch);
      
      // Clear any temporary data
      if (global.gc) {
        global.gc();
      }
      
      return batchWithImages;
    } catch (error) {
      console.error('Batch processing hatası:', error);
      // Return batch without images rather than failing
      return batch.map(product => ({
        ...product,
        presignedImageUrl: null
      }));
    }
  }

  /**
   * Optimized product image loading with smaller concurrent limits
   */
  private async loadProductImagesInBatchesOptimized(products: ProductType[]): Promise<ProductType[]> {
    const results: ProductType[] = [];
    
    // Process images in smaller chunks to prevent memory overload
    const chunks = this.splitIntoBatches(products, 5); // Very small chunks for image loading
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (product) => {
        let presignedImageUrl = null;
        
        if (product.productImage) {
          try {
            const cacheKey = `image_${product.productId}`;
            
            // Check cache first
            if (this.imageCache.has(cacheKey)) {
              presignedImageUrl = this.imageCache.get(cacheKey);
            } else {
              presignedImageUrl = await Promise.race([
                this.getPresignedUrl(product.productImage),
                new Promise<null>((_, reject) => 
                  setTimeout(() => reject(new Error('Image timeout')), this.IMAGE_TIMEOUT)
                )
              ]);
              
              // Cache the result (limit cache size)
              if (this.imageCache.size < 100) {
                this.imageCache.set(cacheKey, presignedImageUrl);
              }
            }
          } catch (error) {
            console.warn(`⚠️ Resim yüklenemedi: ${product.name}`);
            presignedImageUrl = null;
          }
        }
        
        return {
          ...product,
          presignedImageUrl
        };
      });
      
      const chunkResults = await Promise.allSettled(chunkPromises);
      
      // Extract successful results
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          // Add product without image if failed
          results.push({
            ...chunk[index],
            presignedImageUrl: null
          });
        }
      });
      
      // Small delay between chunks to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * Memory usage logging
   */
  private logMemoryUsage(stage: string): void {
    const used = process.memoryUsage();
    console.log(`🧠 Memory [${stage}]: RSS: ${Math.round(used.rss / 1024 / 1024)}MB, Heap: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);
  }

  /**
   * Perform memory cleanup
   */
  private async performMemoryCleanup(): Promise<void> {
    try {
      // Clear image cache if too large
      if (this.imageCache.size > 50) {
        this.imageCache.clear();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Small delay to allow cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.warn('⚠️ Memory cleanup warning:', error);
    }
  }
}