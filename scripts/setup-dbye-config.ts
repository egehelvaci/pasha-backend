import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function setupDbyeConfig() {
  try {
    console.log('🔧 DBYE konfigürasyonu ayarlanıyor...');
    
    // Güvenli webhook secret oluştur
    const productionWebhookSecret = 'PASHA_DBYE_WEBHOOK_SECRET_2025_PROD_V1_' + Date.now();
    
    // DBYE konfigürasyonunu ayarla
    const dbyeConfig = await prisma.dbyeConfig.upsert({
      where: { id: 1 },
      update: {
        webhookSecret: productionWebhookSecret,
        backendUrl: 'https://pasha-backend-production.up.railway.app',
        isActive: true,
        description: 'DBYE webhook konfigürasyonu - Production ayarları'
      },
      create: {
        id: 1,
        webhookSecret: productionWebhookSecret,
        backendUrl: 'https://pasha-backend-production.up.railway.app',
        isActive: true,
        description: 'DBYE webhook konfigürasyonu - Production ayarları'
      }
    });
    
    console.log('✅ DBYE konfigürasyonu ayarlandı:');
    console.log(`- Webhook Secret: ${dbyeConfig.webhookSecret.substring(0, 30)}...`);
    console.log(`- Backend URL: ${dbyeConfig.backendUrl}`);
    console.log(`- Aktif: ${dbyeConfig.isActive}`);
    console.log(`- Açıklama: ${dbyeConfig.description}`);
    
    console.log('\n🔗 Webhook URL\'leri:');
    console.log(`- Ana Webhook: ${dbyeConfig.backendUrl}/api/payments/webhook/dbye`);
    
    console.log('\n⚠️  ÖNEMLİ NOTLAR:');
    console.log('• Bu webhook secret\'ı DBYE panelinde kullanın');
    console.log('• DBYE panelinde webhook URL\'ini şu şekilde ayarlayın:');
    console.log(`  ${dbyeConfig.backendUrl}/api/payments/webhook/dbye`);
    console.log('• Production ortamında SSL aktif olmalı (HTTPS)');
    
    console.log('\n📋 DBYE Panel Ayarları:');
    console.log(`Webhook URL: ${dbyeConfig.backendUrl}/api/payments/webhook/dbye`);
    console.log(`Webhook Secret: ${dbyeConfig.webhookSecret}`);
    
    // Production URL'i sabit tutuyoruz - development'ta da production webhook'ları test edebilmek için
    console.log('\n✅ Production URL sabit olarak ayarlandı');
    console.log('  Development ortamında da production webhook URL\'i kullanılacak');
    console.log('  Bu sayede DBYE panelindeki ayarları değiştirmek zorunda kalmazsınız');
    
  } catch (error) {
    console.error('❌ DBYE konfigürasyonu ayarlama hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDbyeConfig(); 