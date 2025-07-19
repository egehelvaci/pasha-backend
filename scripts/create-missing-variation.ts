import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function createMissingVariation() {
  try {
    console.log('🔧 Eksik varyasyon oluşturuluyor...');
    
    const productId = '7a07c16b-a50b-46d2-8c32-69fcf41928a1'; // DENEME ürünü
    
    // Önce bu varyasyonun zaten var olup olmadığını kontrol et
    const existing = await prisma.productvariations.findFirst({
      where: {
        product_id: productId,
        width: 80,
        height: 1000,
        has_fringe: true
      }
    });
    
    if (existing) {
      console.log('✅ Bu varyasyon zaten mevcut:', existing.id);
      console.log('   Mevcut stok:', existing.stock_quantity);
      return;
    }
    
    // Varyasyonu oluştur
    const newVariation = await prisma.productvariations.create({
      data: {
        product_id: productId,
        width: 80,
        height: 1000,
        has_fringe: true,
        stock_quantity: 1000,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ Yeni varyasyon oluşturuldu:');
    console.log('   ID:', newVariation.id);
    console.log('   Boyut: 80x1000');
    console.log('   Saçak: true');
    console.log('   Stok: 1000');
    
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingVariation(); 