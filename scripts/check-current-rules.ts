import prisma from '../src/utils/prisma';

async function checkCurrentRules() {
  try {
    console.log('Mevcut kurallar:');
    const rules = await prisma.productrules.findMany({
      include: {
        productsizeoptions: true,
        productrulecuttypes: {
          include: {
            cuttypes: true
          }
        }
      }
    });

    rules.forEach(rule => {
      console.log(`\n🔹 Kural: ${rule.name} (ID: ${rule.id})`);
      console.log(`   Saçak: ${rule.can_have_fringe ? 'Evet' : 'Hayır'}`);
      console.log(`   Açıklama: ${rule.description || 'Yok'}`);
      
      console.log('   Kesim Türleri:');
      rule.productrulecuttypes.forEach(ct => {
        console.log(`     - ${ct.cuttypes.name}`);
      });
      
      console.log('   Boyut Seçenekleri:');
      rule.productsizeoptions.forEach(size => {
        console.log(`     - ${size.width}x${size.height}${size.is_optional_height ? ' (opsiyonel yükseklik)' : ''}`);
      });
    });

    console.log('\n\nMevcut kesim türleri:');
    const cutTypes = await prisma.cuttypes.findMany();
    cutTypes.forEach(ct => {
      console.log(`- ${ct.name} (ID: ${ct.id})`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentRules(); 