import { PrismaClient } from './generated/prisma';

async function testDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } }, log: [] });
  try {
    await prisma.$queryRaw`SELECT 1 AS test`;
    console.log('Database connection successful');
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection().catch(() => {
  console.error('Database connectivity check failed; check configuration securely.');
  process.exitCode = 1;
});

