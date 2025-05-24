import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from './s3-client';
import { randomUUID } from 'crypto';
import fs from 'fs';

export class UploadService {
  /**
   * Tebi.io'ya dosya yükle (Buffer ile)
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

  /**
   * Tebi.io'ya dosya yükle (Dosya yolu ile)
   * @param filePath Yüklenecek dosyanın yolu
   * @param mimetype Dosya MIME tipi
   * @param originalname Orijinal dosya adı
   * @returns Yüklenen dosyanın URL'si
   */
  async uploadFileFromPath(filePath: string, mimetype: string, originalname: string): Promise<string> {
    try {
      // Dosyayı oku
      const fileBuffer = fs.readFileSync(filePath);
      
      // Buffer ile yükleme fonksiyonunu kullan
      const result = await this.uploadFile(fileBuffer, mimetype, originalname);
      
      // Geçici dosyayı sil
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.warn('Geçici dosya silinemedi:', unlinkError);
      }
      
      return result;
    } catch (error) {
      console.error('Dosya yolu ile yükleme hatası:', error);
      throw new Error('Dosya yüklenirken bir hata oluştu');
    }
  }
} 