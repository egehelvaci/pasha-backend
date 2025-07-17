import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function getStoreInfo() {
  try {
    const stores = await prisma.store.findMany({
      select: {
        store_id: true,
        kurum_adi: true,
        bakiye: true
      }
    });
    
    console.log('Available stores:');
    stores.forEach(store => {
      console.log(`- ID: ${store.store_id}`);
      console.log(`- Name: ${store.kurum_adi}`);
      console.log(`- Balance: ${store.bakiye} TL\n`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getStoreInfo(); 