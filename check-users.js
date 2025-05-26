const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Veritabanı bağlantısı kontrol ediliyor...');
    
    const users = await prisma.user.findMany({
      include: {
        userType: true
      }
    });
    
    console.log(`Toplam kullanıcı sayısı: ${users.length}`);
    
    users.forEach(user => {
      console.log(`- ${user.username} (${user.userType?.name || 'Tip yok'}) - Aktif: ${user.isActive}`);
    });
    
    // Aktif kullanıcıları ayrı göster
    const activeUsers = users.filter(u => u.isActive);
    console.log(`\nAktif kullanıcı sayısı: ${activeUsers.length}`);
    
  } catch (error) {
    console.error('Veritabanı hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 