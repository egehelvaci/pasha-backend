import { randomUUID } from 'crypto';
import { BUNNY_STORAGE_ZONE, BUNNY_STORAGE_PASSWORD, BUNNY_STORAGE_URL, BUNNY_CDN_HOSTNAME } from './s3-client';

export class UploadService {
  /**
   * Bunny.net'e dosya yükle
   * @param file Yüklenecek dosya Buffer'ı
   * @param mimetype Dosya MIME tipi
   * @param originalname Orijinal dosya adı
   * @param folder Yüklenecek klasör (varsayılan: 'products')
   * @returns Yüklenen dosyanın URL'si
   */
  async uploadFile(file: Buffer, mimetype: string, originalname: string, folder: string = 'products'): Promise<string> {
    try {
      const fileExtension = originalname.split('.').pop() || '';
      const randomName = `${randomUUID()}.${fileExtension}`;
      const key = `${folder}/${randomName}`;

      // Bunny.net Storage API'sine yükle
      const uploadUrl = `${BUNNY_STORAGE_URL}/${BUNNY_STORAGE_ZONE}/${key}`;
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'AccessKey': BUNNY_STORAGE_PASSWORD,
          'Content-Type': mimetype,
        },
        body: file,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Bunny.net yükleme hatası:', response.status, errorText);
        throw new Error(`Bunny.net yükleme hatası: ${response.status}`);
      }

      // CDN URL'sini döndür
      return `https://${BUNNY_CDN_HOSTNAME}/${key}`;
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      throw new Error('Dosya yüklenirken bir hata oluştu');
    }
  }
} 