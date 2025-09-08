const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function showFixOptions() {
  const storeId = 'dc3301dd-2ed2-421d-8afb-70c3a0a4740b';
  
  console.log('🔧 BAKİYE DÜZELTME SEÇENEKLERİ\n');
  
  console.log('SEÇENEK 1: Sıfırdan Yeniden Hesaplama');
  console.log('─'.repeat(50));
  console.log('• Bakiyeyi 0 yap');
  console.log('• Tüm hareketleri kronolojik sırada uygula');
  console.log('• Sonuç: -475 USD (teorik doğru bakiye)');
  console.log('• Risk: Büyük değişiklik\n');
  
  console.log('SEÇENEK 2: Manuel Düzeltme');
  console.log('─'.repeat(50));
  console.log('• Mevcut bakiye: 10 USD');
  console.log('• Olması gereken: -475 USD');
  console.log('• Düzeltme: -485 USD ekle');
  console.log('• Risk: Minimal\n');
  
  console.log('SEÇENEK 3: Hiçbir Şey Yapma');
  console.log('─'.repeat(50));
  console.log('• Yeni hareketler doğru çalışacak');
  console.log('• Eski tutarsızlık kalacak');
  console.log('• Risk: Raporlama problemleri\n');
  
  console.log('HANGİSİNİ TERCİH EDERSİNİZ?');
}

showFixOptions();
