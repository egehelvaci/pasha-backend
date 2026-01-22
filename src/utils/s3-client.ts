import dotenv from 'dotenv';

dotenv.config();

// Bunny.net Storage yapılandırması
export const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE!;
export const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD!;
export const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME!;
export const BUNNY_STORAGE_URL = 'https://storage.bunnycdn.com';

// Geriye uyumluluk için eski isimler
export const BUCKET_NAME = BUNNY_STORAGE_ZONE;

// Eski Tebi bilgileri (migrasyon için gerekli)
export const TEBI_ACCESS_KEY = process.env.TEBI_ACCESS_KEY;
export const TEBI_SECRET_KEY = process.env.TEBI_SECRET_KEY;
export const TEBI_BUCKET_NAME = process.env.TEBI_BUCKET_NAME; 