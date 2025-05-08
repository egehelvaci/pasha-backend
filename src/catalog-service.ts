// catalog-service.ts
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { ProductService } from './product-service';
import { CollectionService } from './collection-service';
import axios from 'axios';

interface ProductType {
  productId: string;
  name: string;
  description: string;
  productImage?: string | null;
  collectionId: string;
  collection_name: string | null;
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
}

export class CatalogService {
  private productService = new ProductService();
  private collectionService = new CollectionService();
  private templatePath = path.resolve(__dirname, 'templates/catalog.hbs');

  constructor() {
    // Handlebars yardımcı fonksiyonları
    handlebars.registerHelper('formatDate', () => {
      return new Date().toLocaleDateString('tr-TR');
    });

    handlebars.registerHelper('currentYear', () => {
      return new Date().getFullYear();
    });
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
        const productResults = await Promise.all(
          productIds.map(id => this.productService.getProductById(id))
        );
        products = productResults.filter(Boolean) as ProductType[];
      } else {
        products = await this.productService.getAllProducts() as unknown as ProductType[];
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
        collections: templateData.collections
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

    // Ürünleri koleksiyonlara göre grupla
    const productsByCollection: ProductsByCollection = {};
    
    // Her ürün için görsel yükleme işlemlerini hazırla
    const imageLoadPromises: Promise<void>[] = [];
    
    products.forEach(product => {
      if (!product) return;
      
      const collectionId = product.collectionId || 'uncategorized';
      const collectionName = product.collection_name || 'Kategorisiz Ürünler';
      
      if (!productsByCollection[collectionId]) {
        productsByCollection[collectionId] = {
          collectionName,
          products: [],
          pageNumber: 0,
        };
      }
      
      // Katalogda görüntülenecek ürün kopyasını oluşturalım
      const catalogProduct = { ...product };
      
      // Ürün resmi işleme
      if (product.productImage) {
        // Konsola ham URL'yi yazdır
        console.log(`${product.name} için ham resim URL:`, product.productImage);
        
        // Tebi URL'lerini işle
        if (product.productImage.includes('tebi.io')) {
          // Görseli yükleyip Data URL'ye dönüştürme promise'ini ekle
          const imagePromise = this.loadImageAsDataUrl(product.productImage)
            .then(dataUrl => {
              console.log(`✅ ${product.name} için görsel data URL'ye dönüştürüldü`);
              catalogProduct.productImage = dataUrl;
            })
            .catch(error => {
              console.error(`❌ ${product.name} için görsel yüklenemedi:`, error.message);
              catalogProduct.productImage = null;
            });
          
          imageLoadPromises.push(imagePromise);
        }
        // Strapi URL'lerini işle
        else if (product.productImage.startsWith('/uploads/') && process.env.STRAPI_URL) {
          const fullUrl = `${process.env.STRAPI_URL}${product.productImage}`;
          
          // Görseli yükleyip Data URL'ye dönüştürme promise'ini ekle
          const imagePromise = this.loadImageAsDataUrl(fullUrl)
            .then(dataUrl => {
              console.log(`✅ ${product.name} için görsel data URL'ye dönüştürüldü`);
              catalogProduct.productImage = dataUrl;
            })
            .catch(error => {
              console.error(`❌ ${product.name} için görsel yüklenemedi:`, error.message);
              catalogProduct.productImage = null;
            });
          
          imageLoadPromises.push(imagePromise);
        } else {
          catalogProduct.productImage = null;
        }
      } else {
        console.log(`${product.name} için resim yok`);
        catalogProduct.productImage = null;
      }
      
      productsByCollection[collectionId].products.push(catalogProduct);
    });
    
    // Tüm görsel yükleme işlemlerinin tamamlanmasını bekle
    if (imageLoadPromises.length > 0) {
      console.log(`${imageLoadPromises.length} görsel indiriliyor ve işleniyor...`);
      await Promise.all(imageLoadPromises);
    }
    
    // Koleksiyonları sırala ve sayfa numaralarını ata
    const collections = Object.values(productsByCollection).map((collection, index) => {
      return {
        collectionName: collection.collectionName,
        products: collection.products,
        pageNumber: index + 1
      };
    });
    
    const now = new Date();
    
    return {
      companyName: companyName || 'Ürün Kataloğu',
      companyLogoUrl,
      formatDate: now.toLocaleDateString('tr-TR'),
      currentYear: now.getFullYear(),
      collections
    };
  }
  
  /**
   * Bir görsel URL'sini yükleyip Data URL formatına dönüştürür
   */
  private async loadImageAsDataUrl(imageUrl: string): Promise<string> {
    try {
      // Tebi için kimlik doğrulama bilgilerini kontrol et
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      };
      
      // Tebi.io görselleri için kimlik doğrulama
      if (imageUrl.includes('tebi.io') && process.env.TEBI_ACCESS_KEY && process.env.TEBI_SECRET_KEY) {
        console.log(`Tebi.io erişim bilgileri kullanılıyor: Access Key: ${process.env.TEBI_ACCESS_KEY.substring(0, 4)}...`);
        
        // Direkt bucket URL'i yerine, kendi sunucumuzdan tebi servisini kullanarak, 
        // veya kendi servisimizden presign url alıp deneyelim
        const presignedUrl = await this.getPresignedUrl(imageUrl);
        if (presignedUrl) {
          console.log('Presigned URL ile devam ediliyor:', presignedUrl.substring(0, 30) + '...');
          imageUrl = presignedUrl;
        }
      }
      
      // Görseli indir
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        headers,
        timeout: 10000
      });
      
      // MIME tipini belirle
      let contentType = response.headers['content-type'];
      if (!contentType || contentType === 'application/octet-stream') {
        // MIME tipi yoksa veya bilinmiyorsa, dosya uzantısından tahmin et
        if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg')) {
          contentType = 'image/jpeg';
        } else if (imageUrl.endsWith('.png')) {
          contentType = 'image/png';
        } else if (imageUrl.endsWith('.gif')) {
          contentType = 'image/gif';
        } else if (imageUrl.endsWith('.webp')) {
          contentType = 'image/webp';
        } else {
          contentType = 'image/jpeg'; // Varsayılan olarak JPEG kabul et
        }
      }
      
      // Binary veriyi base64'e çevir
      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      
      // Data URL formatı: data:[<MIME-type>][;base64],<data>
      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      console.error(`Görsel yüklenemedi: ${imageUrl}`, error);
      
      // Hata durumunda varsayılan bir görsel döndür
      return this.getDefaultImageDataUrl();
    }
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
    // Basit 1x1 şeffaf PNG
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  }
}
