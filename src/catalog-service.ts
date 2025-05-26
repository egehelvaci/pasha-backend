// catalog-service.ts
import puppeteer from 'puppeteer';
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
  private blackLogoPath = path.join(process.cwd(), 'public', 'black-logo.svg');
  private robotoRegularFontPath = path.resolve(__dirname, 'assets/fonts/Roboto-Regular.ttf');
  private robotoBoldFontPath = path.resolve(__dirname, 'assets/fonts/Roboto-Bold.ttf');

  constructor() {
    // Handlebars yardımcı fonksiyonları
    handlebars.registerHelper('formatDate', () => {
      return new Date().toLocaleDateString('tr-TR');
    });

    handlebars.registerHelper('currentYear', () => {
      return new Date().getFullYear();
    });
    
    // Konsol loglarına çalışma dizinini ekle
    console.log('Çalışma dizini (CWD):', process.cwd());
    console.log('Arka plan görsel URL:', this.backgroundImageUrl);
    console.log('Black logo yolu:', this.blackLogoPath);
  }

  async generateCatalog(options: {
    productIds?: string[];
    companyName?: string;
    companyLogoUrl?: string;
  }): Promise<Buffer> {
    const { productIds, companyName = "Şirket Adı", companyLogoUrl } = options;
    
    try {
      // Ürünleri getir
      let products: ProductType[] = [];
      if (productIds?.length) {
        // Ürün servisi olmadığı için doğrudan Prisma ile sorgulama yapıyoruz
        const productResults = await Promise.all(
          productIds.map(id => this.getProductById(id))
        );
        // Filter out nulls and cast to ProductType
        products = productResults.filter(Boolean) as unknown as ProductType[];
      } else {
        // Tüm ürünleri doğrudan Prisma ile getir
        products = await this.getAllProducts();
      }
      
      console.log(`${products.length} ürün alındı`);
      
      // Şablon verisini hazırla
      const templateData = await this.prepareTemplateData(products, companyName, companyLogoUrl);
      
      // Handlebars şablonunu oku
      const templatePath = path.join(__dirname, 'templates', 'catalog.hbs');
      console.log('Şablon dosyası yolu:', templatePath);
      
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);
      
      // Şablonu verilerle birleştir
      const html = template({
        companyName: templateData.companyName,
        formatDate: templateData.formatDate,
        currentYear: templateData.currentYear,
        collections: templateData.collections,
        backgroundImage: templateData.backgroundImage,
        blackLogo: templateData.blackLogo,
        robotoRegularFont: templateData.robotoRegularFont,
        robotoBoldFont: templateData.robotoBoldFont
      });
      
      // Test için HTML dosyasını diske yaz (hata ayıklama)
      const debugDir = path.join(__dirname, '..', 'debug');
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }
      fs.writeFileSync(path.join(debugDir, 'catalog-debug.html'), html);
      console.log('Debug HTML dosyası oluşturuldu:', path.join(debugDir, 'catalog-debug.html'));
      
      // HTML içeriğini PDF'e dönüştür
      console.log('HTML oluşturuldu, PDF dönüştürme işlemi başlıyor...');
      const pdfBuffer = await this.generatePDFFromHTML(html);
      
      return pdfBuffer;
    } catch (error: any) {
      console.error('Katalog oluşturma hatası:', error);
      throw new Error(`Katalog oluşturulurken bir hata oluştu: ${error.message}`);
    }
  }

  /**
   * HTML içeriğini PDF'e dönüştürür
   */
  private async generatePDFFromHTML(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--allow-file-access-from-files',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-translate',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--force-color-profile=generic-rgb',
        '--enable-print-browser'
      ],
      headless: true
    });
    
    try {
      const page = await browser.newPage();
      
      // Sayfanın viewport ölçülerini ayarla
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 1
      });
      
      // Resim isteklerini izle (basit versiyon)
      await page.setRequestInterception(true);
      
      page.on('request', request => {
        // Sadece tebi.io isteklerini özel olarak işle
        if (request.url().includes('tebi.io')) {
          request.continue({
            headers: {
              ...request.headers(),
              'Accept': 'image/*,*/*;q=0.8',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
        } else {
          request.continue();
        }
      });

      page.on('requestfailed', request => {
        if (request.resourceType() === 'image') {
          console.log('❌ Resim yüklenemedi:', request.url().substring(0, 100) + '...');
        }
      });

      // HTML içeriğini yükle
      console.log('HTML içeriği yükleniyor...');
      
      // Önce basit HTML'i yükle, sonra kaynakları kontrol et
      await page.setContent(html, { 
        waitUntil: 'domcontentloaded', // daha hızlı yükleme
        timeout: 30000 // timeout'u azalt
      });
      
      console.log('HTML DOM yüklendi, kaynaklar kontrol ediliyor...');
      
      // Print için CSS ayarlarını inject et
      await page.addStyleTag({
        content: `
          @media screen {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
          
          @page {
            margin: 10mm;
            size: A4;
          }
        `
      });
      
      // Resimlerin durumunu kontrol et (basit versiyon)
      try {
        const imagesResult = await page.evaluate(() => {
          const imgElements = Array.from(document.querySelectorAll('img'));
          return {
            totalImages: imgElements.length,
            loadedImages: imgElements.filter(img => img.complete && img.naturalWidth > 0).length
          };
        });
        
        console.log(`Resim durumu: ${imagesResult.loadedImages}/${imagesResult.totalImages} yüklendi`);
      } catch (evalError) {
        console.warn('Resim durum kontrolü atlandı:', evalError);
      }
      
      // PDF hazırlığı için kısa bekleme
      console.log('PDF hazırlığı için bekleniyor...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // PDF olarak dışa aktar
      console.log('PDF oluşturuluyor...');
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
        omitBackground: false
      });
      
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * Katalog için data hazırla
   */
  private async prepareTemplateData(
    products: ProductType[], 
    companyName: string, 
    companyLogoUrl?: string
  ): Promise<CatalogTemplateData> {
    console.log(`Katalog için ${products.length} ürün hazırlanıyor...`);

    // Önce tüm ürün resimlerini paralel olarak yükle
    console.log('🚀 Ürün resimleri paralel olarak yükleniyor...');
    const imageLoadPromises = products.map(async (product) => {
      if (product.productImage) {
        try {
          console.log(`⏳ Resim yükleniyor: ${product.name}`);
          product.productImage = await this.loadImageAsDataUrl(product.productImage);
          console.log(`✅ Resim yüklendi: ${product.name}`);
        } catch (error) {
          console.error(`❌ Resim yüklenemedi: ${product.name}`, error instanceof Error ? error.message : String(error));
          product.productImage = this.getDefaultImageDataUrl();
        }
      } else {
        product.productImage = this.getDefaultImageDataUrl();
      }
      return product;
    });

    // Tüm resimlerin yüklenmesini bekle
    const productsWithImages = await Promise.allSettled(imageLoadPromises);
    console.log('📸 Tüm ürün resimleri işlendi');

    // Ürünleri koleksiyonlara göre grupla
    const productsByCollection: ProductsByCollection = {};
    
    // Ürünleri koleksiyonlara göre grupla
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
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
    let pageCounter = 1; // İçerik sayfaları 1'den başlar (kapak sayfa 0)
    
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
          pageNumber: pageCounter++ // Her içerik sayfası için artan numara
        });
        
        console.log(`📄 Sayfa oluşturuldu: ${collection.collectionName} - Sayfa ${pageCounter - 1} (${pageProducts.length} ürün)`);
      }
    }
    
    console.log(`📋 Toplam ${collections.length} sayfa oluşturuldu (Kapak + ${collections.length} içerik sayfası)`);
    
    // Arka plan resmini ve fontları yükle
    const backgroundImage = await this.loadCatalogBackgroundImage();
    const blackLogo = await this.loadBlackLogo();
    const robotoRegularFont = await this.loadFontAsBase64(this.robotoRegularFontPath);
    const robotoBoldFont = await this.loadFontAsBase64(this.robotoBoldFontPath);
    
    const now = new Date();
    
    return {
      companyName: companyName || 'PAŞA HOME',
      companyLogoUrl,
      formatDate: now.toLocaleDateString('tr-TR'),
      currentYear: now.getFullYear(),
      collections,
      backgroundImage,
      blackLogo,
      robotoRegularFont,
      robotoBoldFont
    };
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
}