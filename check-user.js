const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const targetUserId = '4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5';
    
    const customer = await prisma.user.findUnique({
      where: { userId: targetUserId },
      include: {
        Store: true,
        userType: true
      }
    });

    if (customer) {
      console.log('✅ Kullanıcı bulundu:');
      console.log('- ID:', customer.userId);
      console.log('- Adı:', customer.name, customer.surname);
      console.log('- Email:', customer.email);
      console.log('- Username:', customer.username);
      console.log('- Durum:', customer.isActive ? 'Aktif' : 'Pasif');
      console.log('- User Type:', customer.userType?.name);
      console.log('- Store ID:', customer.store_id);
      if (customer.Store) {
        console.log('- Mağaza Adı:', customer.Store.kurum_adi);
        console.log('- Mağaza Durumu:', customer.Store.is_active ? 'Aktif' : 'Pasif');
      } else {
        console.log('- Mağaza: Atanmamış');
      }
    } else {
      console.log('❌ Kullanıcı bulunamadı!');
      
      // Benzer ID'ler var mı kontrol edelim
      const similarUsers = await prisma.user.findMany({
        where: {
          OR: [
            { userId: { startsWith: '4fdd87dd' } },
            { name: { contains: 'Serhat', mode: 'insensitive' } }
          ]
        },
        select: {
          userId: true,
          name: true,
          surname: true,
          email: true,
          isActive: true,
          store_id: true
        },
        take: 10
      });
      
      if (similarUsers.length > 0) {
        console.log('\n📋 Benzer kullanıcılar:');
        similarUsers.forEach(user => {
          console.log(`- ${user.userId}: ${user.name} ${user.surname} (${user.email}) - ${user.isActive ? 'Aktif' : 'Pasif'}`);
        });
      } else {
        console.log('\n🔍 Hiçbir benzer kullanıcı bulunamadı.');
        
        // Tüm aktif kullanıcıları göster
        const allUsers = await prisma.user.findMany({
          where: { isActive: true },
          select: {
            userId: true,
            name: true,
            surname: true,
            email: true,
            store_id: true
          },
          take: 5
        });
        
        console.log('\n📝 İlk 5 aktif kullanıcı:');
        allUsers.forEach(user => {
          console.log(`- ${user.userId}: ${user.name} ${user.surname} (${user.email})`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser(); 