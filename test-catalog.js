const { CatalogService } = require('./dist/catalog-service.js');
const fs = require('fs');

async function testCatalog() {
  try {
    console.log('Katalog servisi test ediliyor...');
    const catalogService = new CatalogService();
    
    const pdfBuffer = await catalogService.generateCatalog({
      companyName: 'PAŞA HOME',
      companyLogoUrl: null
    });
    
    fs.writeFileSync('test-catalog.pdf', pdfBuffer);
    console.log('Test kataloğu oluşturuldu: test-catalog.pdf');
    console.log('Dosya boyutu:', Math.round(pdfBuffer.length / 1024), 'KB');
  } catch (error) {
    console.error('Test hatası:', error.message);
  }
}

testCatalog(); 