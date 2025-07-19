import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkProductRule() {
  try {
    console.log('🔍 DENEME ürünü kural detayları kontrol ediliyor...');
    
    const productId = '7a07c16b-a50b-46d2-8c32-69fcf41928a1';
    
    // Ürün ve kuralını getir
    const product = await prisma.product.findUnique({
      where: { productId },
      include: {
        productrules: {
          include: {
            productsizeoptions: true
          }
        }
      }
    });
    
    if (!product) {
      console.log('❌ Ürün bulunamadı');
      return;
    }
    
    console.log('📦 Ürün:', product.name);
    console.log('🔧 Kural ID:', product.rule_id);
    
    if (product.productrules) {
      console.log('📋 Kural Adı:', product.productrules.name);
      console.log('📏 Boyut Seçenekleri:');
      
      product.productrules.productsizeoptions.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.width}x${option.height}`);
        console.log(`      Opsiyonel yükseklik: ${option.is_optional_height ? 'Evet' : 'Hayır'}`);
        if (option.is_optional_height) {
          console.log(`      Maksimum yükseklik: ${option.height} cm`);
        }
      });
    }
    
    console.log('\n🎯 80 genişlik için mevcut seçenek:');
    const width80Option = product.productrules?.productsizeoptions.find(opt => opt.width === 80);
    if (width80Option) {
      console.log(`   Genişlik: 80cm`);
      console.log(`   Maksimum yükseklik: ${width80Option.height} cm`);
      console.log(`   Opsiyonel: ${width80Option.is_optional_height ? 'Evet' : 'Hayır'}`);
      console.log(`   Siparişteki yükseklik: 1000cm`);
      console.log(`   Geçerli mi? ${width80Option.is_optional_height && 1000 <= width80Option.height ? '✅' : '❌'}`);
      
      if (width80Option.is_optional_height && 1000 <= width80Option.height) {
        console.log('\n✅ Sipariş geçerli! Opsiyonel yükseklik kuralına uygun.');
        console.log('   Stok düşürme için kullanılacak varyasyon boyutu:', `80x${width80Option.height}`);
      } else {
        console.log('\n❌ Sipariş geçersiz! Maksimum yüksekliği aşıyor.');
      }
    } else {
      console.log('   ❌ 80cm genişlik için seçenek bulunamadı');
    }
    
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductRule(); 