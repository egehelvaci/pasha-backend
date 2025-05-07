import { S3Client } from '@aws-sdk/client-s3';

// Çevre değişkenlerini ve değerlerini konsola yazdıralım
console.log('TEBI CREDENTIALS:', {
  TEBI_ACCESS_KEY: process.env.TEBI_ACCESS_KEY,
  TEBI_SECRET_KEY: process.env.TEBI_SECRET_KEY?.substring(0, 5) + '...', // Güvenlik için kısmi gösterim
  TEBI_BUCKET_NAME: process.env.TEBI_BUCKET_NAME
});

// Çevre değişkenlerinden tırnak işaretlerini temizleyelim
const accessKey = process.env.TEBI_ACCESS_KEY?.replace(/["']/g, '') || '';
const secretKey = process.env.TEBI_SECRET_KEY?.replace(/["']/g, '') || '';
const bucketName = process.env.TEBI_BUCKET_NAME?.replace(/["']/g, '') || 'pashahome';

// Tebi.io S3 istemcisini yapılandır
export const s3Client = new S3Client({
  region: 'global', // Tebi.io için genellikle 'global' kullanılır
  endpoint: 'https://s3.tebi.io',
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey
  },
  forcePathStyle: true // S3 path stilini zorla
});

// Tebi.io bucket adı
export const BUCKET_NAME = bucketName; 