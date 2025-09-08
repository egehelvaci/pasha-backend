const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function monitorChanges() {
  const storeId = 'dc3301dd-2ed2-421d-8afb-70c3a0a4740b';
  
  console.log('👀 REAL-TIME MONITOR BAŞLADI\n');
  console.log('Lütfen şimdi frontend\'den Serhat Halı\'ya 1 USD borç tahsilatı ekleyin...\n');
  
  let lastCheck = new Date();
  let lastHareketCount = 0;
  let lastBalance = 0;
  
  // İlk durumu al
  const initialData = await getStoreData(storeId);
  lastHareketCount = initialData.hareketCount;
  lastBalance = initialData.balance;
  
  console.log(`📊 BAŞLANGIÇ DURUMU:`);
  console.log(`   Bakiye: ${lastBalance} USD`);
  console.log(`   Hareket Sayısı: ${lastHareketCount}`);
  console.log(`   Zaman: ${lastCheck.toLocaleTimeString()}\n`);
  
  // Her 2 saniyede kontrol et
  const interval = setInterval(async () => {
    try {
      const currentData = await getStoreData(storeId);
      
      if (currentData.hareketCount !== lastHareketCount || currentData.balance !== lastBalance) {
        console.log(`🔄 DEĞİŞİKLİK TESPİT EDİLDİ! ${new Date().toLocaleTimeString()}`);
        console.log(`   Eski Bakiye: ${lastBalance} USD → Yeni Bakiye: ${currentData.balance} USD`);
        console.log(`   Eski Hareket: ${lastHareketCount} → Yeni Hareket: ${currentData.hareketCount}`);
        
        if (currentData.hareketCount > lastHareketCount) {
          console.log(`   ✅ ${currentData.hareketCount - lastHareketCount} yeni hareket eklendi`);
        }
        
        if (currentData.balance !== lastBalance) {
          console.log(`   ✅ Bakiye değişti: ${currentData.balance - lastBalance > 0 ? '+' : ''}${currentData.balance - lastBalance} USD`);
        } else {
          console.log(`   ⚠️  Hareket eklendi ama bakiye değişmedi!`);
        }
        
        lastHareketCount = currentData.hareketCount;
        lastBalance = currentData.balance;
        console.log('');
      } else {
        process.stdout.write('.');
      }
      
    } catch (error) {
      console.error('❌ Monitoring hatası:', error.message);
    }
  }, 2000);
  
  // 60 saniye sonra durdur
  setTimeout(() => {
    clearInterval(interval);
    console.log('\n\n⏰ Monitoring tamamlandı (60 saniye)');
    prisma.$disconnect();
  }, 60000);
}

async function getStoreData(storeId) {
  const store = await prisma.store.findUnique({
    where: { store_id: storeId },
    select: { bakiye: true }
  });
  
  const hareketCount = await prisma.muhasebeHareketleri.count({
    where: { storeId: storeId }
  });
  
  return {
    balance: Number(store.bakiye),
    hareketCount
  };
}

monitorChanges();
