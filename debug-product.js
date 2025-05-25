const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function debugProduct() {
  try {
    const productId = 'eea687b8-7663-426f-823a-ad2131dcbe48';
    
    console.log('Ürün aranıyor:', productId);
    
    // Ürünü bul
    const product = await prisma.product.findUnique({
      where: { productId },
      include: {
        productrules: true
      }
    });
    
    if (!product) {
      console.log('Ürün bulunamadı!');
      return;
    }
    
    console.log('Ürün bulundu:');
    console.log('- ID:', product.productId);
    console.log('- Name:', product.name);
    console.log('- Rule ID:', product.rule_id);
    
    if (product.rule_id) {
      console.log('\nSize options aranıyor...');
      const sizeOptions = await prisma.productsizeoptions.findMany({
        where: { rule_id: product.rule_id }
      });
      
      console.log('Size options:');
      sizeOptions.forEach(so => {
        console.log(`- ${so.width}x${so.height} (optional_height: ${so.is_optional_height})`);
      });
      
      // Mevcut varyasyonları da göster
      console.log('\nMevcut varyasyonlar:');
      const variations = await prisma.productvariations.findMany({
        where: { product_id: productId }
      });
      
      variations.forEach(v => {
        console.log(`- ${v.width}x${v.height} (stock: ${v.stock_quantity})`);
      });
    } else {
      console.log('Bu ürünün rule_id\'si yok');
    }
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProduct(); 