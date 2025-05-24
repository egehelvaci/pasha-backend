import { PrismaClient } from '../../generated/prisma';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern ile Prisma Client'ı oluştur
const prisma = globalThis.__prisma || new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
});

// Development ortamında global değişkene ata (hot reload için)
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Uygulama kapanırken bağlantıyı kapat
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma; 