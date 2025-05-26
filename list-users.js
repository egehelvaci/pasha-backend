const { PrismaClient } = require('./generated/prisma');

async function listUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Veritabanındaki kullanıcılar:');
    console.log('='.repeat(50));
    
    const users = await prisma.user.findMany({
      include: {
        userType: true,
        Store: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Toplam kullanıcı sayısı: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Kullanıcı:`);
      console.log(`   Kullanıcı Adı: ${user.username}`);
      console.log(`   Ad Soyad: ${user.name} ${user.surname}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Telefon: ${user.phoneNumber || 'Belirtilmemiş'}`);
      console.log(`   Kullanıcı Tipi: ${user.userType?.name || 'Belirtilmemiş'}`);
      console.log(`   Aktif: ${user.isActive ? 'Evet' : 'Hayır'}`);
      console.log(`   Şifre: ${user.password.substring(0, 20)}...`);
      console.log(`   Şifre Tipi: ${user.password.startsWith('$2') ? 'Hash\'lenmiş' : 'Düz Metin'}`);
      console.log(`   Oluşturma Tarihi: ${user.createdAt}`);
      if (user.Store) {
        console.log(`   Mağaza: ${user.Store.kurum_adi}`);
      }
      console.log('   ' + '-'.repeat(40));
    });
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers(); 