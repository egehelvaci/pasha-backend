const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    // Tüm kullanıcıları listele
    const users = await prisma.user.findMany({
      include: {
        userType: true
      }
    });
    
    console.log('Mevcut kullanıcılar:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.userType.name} - Aktif: ${user.isActive}`);
    });
    
    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'admin' },
          { userType: { name: 'admin' } }
        ]
      },
      include: {
        userType: true
      }
    });
    
    if (adminUser) {
      console.log('\nAdmin kullanıcısı bulundu:');
      console.log('Username:', adminUser.username);
      console.log('Email:', adminUser.email);
      console.log('UserType:', adminUser.userType.name);
      console.log('Aktif:', adminUser.isActive);
      
      // Şifre kontrolü
      const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
      console.log('Şifre doğru mu (admin123):', isPasswordValid);
    } else {
      console.log('\nAdmin kullanıcısı bulunamadı!');
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser(); 