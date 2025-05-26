const { CatalogService } = require('./dist/catalog-service');
const fs = require('fs');
const path = require('path');

async function testCatalog() {
  console.log('🧪 Katalog testi başlıyor...');
  
  try {
    const catalogService = new CatalogService();
    
    console.log('📋 Katalog oluşturuluyor...');
    const pdfBuffer = await catalogService.generateCatalog({
      companyName: 'PAŞA HOME',
      // productIds: [] // Boş bırakırsak tüm ürünleri alır
    });
    
    // Test PDF'ini kaydet
    const testDir = path.join(__dirname, 'test-output');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const pdfPath = path.join(testDir, `test-catalog-${Date.now()}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);
    
    console.log('✅ Katalog başarıyla oluşturuldu!');
    console.log(`📁 PDF kaydedildi: ${pdfPath}`);
    console.log(`📊 PDF boyutu: ${Math.floor(pdfBuffer.length / 1024)} KB`);
    
  } catch (error) {
    console.error('❌ Katalog testi başarısız:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Test'i çalıştır
testCatalog(); 