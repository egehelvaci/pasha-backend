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
  robotoRegularFont: string;
  robotoBoldFont: string;
}

export class CatalogService {
  private collectionService = new CollectionService();
  private templatePath = path.resolve(__dirname, 'templates/catalog.hbs');
  private backgroundImagePath = path.join(__dirname, 'assets', 'images', 'catalog-bg.jpg');
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
    console.log('Arka plan görsel yolu:', this.backgroundImagePath);
    console.log('Görsel dizini mevcut mu:', fs.existsSync(path.dirname(this.backgroundImagePath)));
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
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security', // CORS engelini kaldırır
        '--disable-features=IsolateOrigins,site-per-process', // İzole edilmiş politikaları devre dışı bırakır
        '--allow-file-access-from-files'
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
      
      // Resim isteklerini her zaman kabul et
      await page.setRequestInterception(true);
      
      // Kaynakları izle ve daha fazla bilgi ekle
      const failedRequests: string[] = [];
      const successRequests: string[] = [];
      
      page.on('request', request => {
        // Tebi üzerindeki görsel isteklerinde özel başlıkları ayarla
        if (request.url().includes('tebi.io')) {
          console.log('Tebi.io isteği yakalandı:', request.url());
          request.continue({
            headers: {
              ...request.headers(),
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
              'Accept-Encoding': 'gzip, deflate, br',
              'Origin': 'https://pashahome.com',
              'Referer': 'https://pashahome.com/',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
        } else {
          request.continue();
        }
      });

      page.on('requestfinished', request => {
        const url = request.url();
        if (request.resourceType() === 'image') {
          console.log('✅ Resim başarıyla yüklendi:', url);
          successRequests.push(url);
        }
      });

      page.on('requestfailed', request => {
        const url = request.url();
        if (request.resourceType() === 'image') {
          console.log('❌ Resim yüklenemedi:', url, 'Hata:', request.failure()?.errorText);
          failedRequests.push(url);
        }
      });

      // HTML içeriğini yükle
      console.log('HTML içeriği yükleniyor...');
      await page.setContent(html, { 
        waitUntil: 'networkidle0', 
        timeout: 60000 // Timeout süresini artır
      });
      
      // JavaScript ile resimlerin tam yüklenmesini bekle
      await page.evaluate(() => {
        return new Promise((resolveAll) => {
          // Önce tüm img elementlerini toplayalım
          const images = Array.from(document.querySelectorAll('img'));
          console.log(`${images.length} resim elementi bulundu`);
          
          // Her resim yüklendiğinde veya yüklenemediğinde kontrol edeceğimiz sayaç
          let loaded = 0;
          
          // Hiç resim yoksa hemen tamamlandı olarak işaretle
          if (images.length === 0) {
            resolveAll(true);
            return;
          }
          
          // Her resim için yükleme işlemlerini kontrol et
          images.forEach(img => {
            // Resim zaten yüklenmişse sayacı artır
            if (img.complete) {
              loaded++;
              if (loaded === images.length) resolveAll(true);
              return;
            }
            
            // Resim yüklendiğinde
            img.addEventListener('load', () => {
              loaded++;
              if (loaded === images.length) resolveAll(true);
            });
            
            // Resim yüklenemediğinde
            img.addEventListener('error', () => {
              // Resmi gizle ve hata mesajını göster
              if (img instanceof HTMLImageElement) {
                img.style.display = 'none';
                const errorText = img.nextElementSibling;
                if (errorText instanceof HTMLElement) {
                  errorText.style.display = 'block';
                }
              }
              
              loaded++;
              if (loaded === images.length) resolveAll(true);
            });
          });
          
          // Zaman aşımı olursa yine de devam et
          setTimeout(() => resolveAll(false), 5000);
        });
      });
      
      // Resimlerin durumunu kontrol et
      const imagesResult = await page.evaluate(() => {
        const imgElements = Array.from(document.querySelectorAll('img'));
        return imgElements.map(img => ({
          src: img.src,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayed: img.style.display !== 'none',
          alt: img.alt
        }));
      });
      
      console.log('Resim durumları:', JSON.stringify(imagesResult, null, 2));
      console.log(`Başarılı resim istekleri: ${successRequests.length}, Başarısız: ${failedRequests.length}`);
      
      // Tüm içeriklerin yüklenmesi için biraz daha bekle
      await new Promise(resolve => setTimeout(resolve, 5000));
      
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
        preferCSSPageSize: true
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
    
    // Arka plan resmini ve fontları yükle
    const backgroundImage = await this.loadCatalogBackgroundImage();
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
      console.log('Arka plan resmini yüklüyorum:', this.backgroundImagePath);
      
      if (fs.existsSync(this.backgroundImagePath)) {
        console.log('Arka plan resmi bulundu, okunuyor...');
        const imageBuffer = fs.readFileSync(this.backgroundImagePath);
        const base64Image = imageBuffer.toString('base64');
        
        console.log(`Arka plan resmi başarıyla okundu: ${Math.floor(base64Image.length / 1024)} KB`);
        
        // Test: Arka plan görselini debug klasörüne kopyala
        try {
          const debugDir = path.join(__dirname, '..', 'debug');
          if (!fs.existsSync(debugDir)) {
            fs.mkdirSync(debugDir, { recursive: true });
          }
          fs.copyFileSync(this.backgroundImagePath, path.join(debugDir, 'catalog-bg-copy.jpg'));
          console.log('Arka plan resmi debug klasörüne kopyalandı');
        } catch (copyError) {
          console.error('Debug için kopya oluşturma hatası:', copyError);
        }
        
        return `data:image/jpeg;base64,${base64Image}`;
      } else {
        console.error('Arka plan resim dosyası bulunamadı:', this.backgroundImagePath);
        // Proje klasöründe mevcut resimleri listele
        try {
          const assetsDir = path.join(__dirname, 'assets');
          if (fs.existsSync(assetsDir)) {
            console.log('Assets klasörü içeriği:');
            const listFiles = (dir: string, depth = 0) => {
              const files = fs.readdirSync(dir);
              files.forEach(file => {
                const filePath = path.join(dir, file);
                const stats = fs.statSync(filePath);
                const relativePath = path.relative(path.join(__dirname, '..'), filePath);
                console.log(`${' '.repeat(depth * 2)}${stats.isDirectory() ? '📁' : '📄'} ${relativePath}`);
                if (stats.isDirectory()) {
                  listFiles(filePath, depth + 1);
                }
              });
            };
            listFiles(assetsDir);
          } else {
            console.log('Assets klasörü bulunamadı');
          }
        } catch (listError) {
          console.error('Dosya listeleme hatası:', listError);
        }
        
        // Varsayılan gradient döndür
        return 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
      }
    } catch (error) {
      console.error('Arka plan resmi yüklenirken hata:', error);
      return 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
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
}
