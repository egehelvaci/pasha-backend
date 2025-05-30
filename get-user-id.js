const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function getUserId() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: 'kullanici'
      }
    });
    
    if (user) {
      console.log('Kullanici ID:', user.userId);
    } else {
      console.log('Kullanıcı bulunamadı');
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUserId(); 