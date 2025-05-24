import { PrismaClient } from '../../generated/prisma';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern ile tek bir Prisma client instance'ı
const prisma = globalThis.__prisma || new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown için process event'leri
process.on('beforeExit', async () => {
  console.log('Process beforeExit - Prisma bağlantısı kapatılıyor...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('SIGINT sinyali alındı - Prisma bağlantısı kapatılıyor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM sinyali alındı - Prisma bağlantısı kapatılıyor...');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma; 