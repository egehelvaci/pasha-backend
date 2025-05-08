import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME } from './s3-client';

export class TebiService {
  /**
   * Belirtilen dosya için imzalı URL oluştur
   * @param key Dosya anahtarı (örn: 'products/12345.jpg')
   * @param expiresIn Saniye cinsinden geçerlilik süresi (varsayılan: 3600 - 1 saat)
   * @returns İmzalı URL
   */
  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      console.log(`İmzalı URL oluşturuluyor: ${BUCKET_NAME}/${key}`);
      
      // GetObject komutu oluştur
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      
      // Komutu imzala ve geçici URL oluştur
      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: expiresIn,
      });
      
      console.log(`İmzalı URL oluşturuldu: ${presignedUrl.substring(0, 50)}...`);
      
      return presignedUrl;
    } catch (error) {
      console.error('İmzalı URL oluşturma hatası:', error);
      throw new Error('İmzalı URL oluşturulurken bir hata oluştu');
    }
  }
  
  /**
   * Ürün URL'sinden imzalı URL oluşturur
   * @param productImageUrl Ürün görseli URL'si 
   * @returns İmzalı URL
   */
  async getPresignedUrlFromProductImage(productImageUrl: string): Promise<string> {
    try {
      // URL'yi parse et
      const urlObj = new URL(productImageUrl);
      let key = '';
      
      // URL formatını kontrol et
      if (productImageUrl.includes('s3.tebi.io')) {
        // Format: https://s3.tebi.io/pashahome/products/image.jpg
        const pathParts = urlObj.pathname.split('/');
        
        // İlk eleman boş string olacak (/ karakterinden dolayı)
        // İkinci eleman bucket adı olacak
        // Geri kalanı key'i oluşturur
        if (pathParts.length >= 3) {
          // Bucket name'i kontrol et ve key'i oluştur
          const urlBucketName = pathParts[1];
          if (urlBucketName === BUCKET_NAME) {
            // bucket/products/image.jpg formatındaki path'i alıp bucket kısmını çıkarıyoruz
            key = pathParts.slice(2).join('/');
          } else {
            console.warn(`URL'deki bucket adı (${urlBucketName}) yapılandırmadaki bucket adından (${BUCKET_NAME}) farklı`);
            // Farklı bucket adı olsa da işleme devam et
            key = pathParts.slice(2).join('/');
          }
        }
      } else if (productImageUrl.includes('.s3.tebi.io')) {
        // Format: https://pashahome.s3.tebi.io/products/image.jpg
        // Hostname'den bucket adını çıkar
        const hostParts = urlObj.hostname.split('.');
        const urlBucketName = hostParts[0];
        
        // Path'ten key'i çıkar (başlangıçtaki / karakterini kaldır)
        key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
        
        // Bucket adını kontrol et
        if (urlBucketName !== BUCKET_NAME) {
          console.warn(`URL'deki bucket adı (${urlBucketName}) yapılandırmadaki bucket adından (${BUCKET_NAME}) farklı`);
        }
      } else {
        // Desteklenmeyen URL formatı
        throw new Error(`Desteklenmeyen URL formatı: ${productImageUrl}`);
      }
      
      if (!key) {
        throw new Error(`URL'den dosya anahtarı çıkarılamadı: ${productImageUrl}`);
      }
      
      console.log(`Ürün görselinden çıkarılan key: ${key}`);
      
      // İmzalı URL oluştur
      return this.generatePresignedUrl(key);
    } catch (error) {
      console.error('Ürün görseli için imzalı URL oluşturma hatası:', error);
      throw new Error('İmzalı URL oluşturulurken bir hata oluştu');
    }
  }
} 