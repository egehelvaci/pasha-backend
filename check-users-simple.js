const { PrismaClient } = require('./generated/prisma');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📋 Veritabanındaki kullanıcılar:');
    
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        username: true,
        email: true,
        name: true,
        surname: true,
        isActive: true,
        userType: {
          select: {
            name: true
          }
        }
      },
      take: 10
    });
    
    if (users.length === 0) {
      console.log('❌ Hiç kullanıcı bulunamadı');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email}) - ${user.name} ${user.surname} - Tip: ${user.userType.name} - Aktif: ${user.isActive}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 