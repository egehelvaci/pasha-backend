import { BUNNY_CDN_HOSTNAME, BUCKET_NAME } from './s3-client';

export class TebiService {
  /**
   * Bunny.net CDN URL'si oluştur
   * NOT: Bunny.net CDN URL'leri public olduğundan presigned URL gerekli değil
   * @param key Dosya anahtarı (örn: 'products/12345.jpg')
   * @param expiresIn Kullanılmıyor (geriye uyumluluk için)
   * @returns CDN URL'si
   */
  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // Bunny CDN URL'leri doğrudan erişilebilir
    return `https://${BUNNY_CDN_HOSTNAME}/${key}`;
  }
  
  /**
   * Ürün URL'sinden CDN URL'si döndürür
   * @param productImageUrl Ürün görseli URL'si 
   * @returns CDN URL'si
   */
  async getPresignedUrlFromProductImage(productImageUrl: string): Promise<string> {
    try {
      // Eğer zaten Bunny CDN URL'si ise direkt döndür
      if (productImageUrl.includes(BUNNY_CDN_HOSTNAME)) {
        return productImageUrl;
      }
      
      // Eski Tebi URL'si ise Bunny URL'sine dönüştür
      if (productImageUrl.includes('tebi.io')) {
        const urlObj = new URL(productImageUrl);
        let key = '';
        
        if (productImageUrl.includes('s3.tebi.io')) {
          // Format: https://s3.tebi.io/pashahome/products/image.jpg
          const pathParts = urlObj.pathname.split('/');
          if (pathParts.length >= 3) {
            key = pathParts.slice(2).join('/');
          }
        } else if (productImageUrl.includes('.s3.tebi.io')) {
          // Format: https://pashahome.s3.tebi.io/products/image.jpg
          key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
        }
        
        if (key) {
          return `https://${BUNNY_CDN_HOSTNAME}/${key}`;
        }
      }
      
      // Diğer URL'leri direkt döndür
      return productImageUrl;
    } catch (error) {
      console.error('URL dönüştürme hatası:', error);
      return productImageUrl;
    }
  }
} 