const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');

async function checkAdminPassword() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Admin kullanıcısının şifresini kontrol ediyorum...');
    
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' },
      select: {
        username: true,
        password: true,
        userType: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (!admin) {
      console.log('❌ Admin kullanıcısı bulunamadı');
      return;
    }
    
    console.log(`✅ Admin kullanıcısı bulundu: ${admin.username} (Tip: ${admin.userType.name})`);
    
    // Farklı şifreleri test et
    const testPasswords = ['123', 'admin', 'password', 'test123', 'admin123'];
    
    for (const testPassword of testPasswords) {
      try {
        const isMatch = await bcrypt.compare(testPassword, admin.password);
        if (isMatch) {
          console.log(`✅ Doğru şifre bulundu: "${testPassword}"`);
          return testPassword;
        }
      } catch (error) {
        console.log(`❌ Şifre "${testPassword}" test edilirken hata: ${error.message}`);
      }
    }
    
    console.log('❌ Test edilen şifrelerden hiçbiri doğru değil');
    console.log('Hash:', admin.password.substring(0, 20) + '...');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminPassword(); 