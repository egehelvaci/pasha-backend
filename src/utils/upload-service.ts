import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from './s3-client';
import { randomUUID } from 'crypto';

export class UploadService {
  /**
   * Tebi.io'ya dosya yükle
   * @param file Yüklenecek dosya Buffer'ı
   * @param mimetype Dosya MIME tipi
   * @param originalname Orijinal dosya adı
   * @returns Yüklenen dosyanın URL'si
   */
  async uploadFile(file: Buffer, mimetype: string, originalname: string): Promise<string> {
    try {
      const fileExtension = originalname.split('.').pop() || '';
      const randomName = `${randomUUID()}.${fileExtension}`;
      const key = `products/${randomName}`;

      // S3'e yükleme işlemi
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: mimetype
      };

      // Yükleme komutunu çalıştır
      await s3Client.send(new PutObjectCommand(uploadParams));

      // Dosya URL'sini oluştur - Doğru formatı kullan (s3.tebi.io/bucketname/key)
      return `https://s3.tebi.io/${BUCKET_NAME}/${key}`;
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      throw new Error('Dosya yüklenirken bir hata oluştu');
    }
  }
} 