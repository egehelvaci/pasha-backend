import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/utils/prisma';

interface ImageMatch {
  filename: string;
  productName: string;
  productId?: string;
  matchType: string;
}

async function main() {
  try {
    console.log('🔍 Resim-ürün eşleştirme testi başlatılıyor...');
    
    // Resimler klasöründeki dosyaları oku
    const imagesDir = path.join(process.cwd(), 'resimler');
    const imageFiles = fs.readdirSync(imagesDir).filter(file => 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg') || 
      file.toLowerCase().endsWith('.png')
    );
    
    console.log(`📁 ${imageFiles.length} resim dosyası bulundu`);
    
    // Tüm ürünleri veritabanından getir
    const products = await prisma.product.findMany({
      include: {
        collection: true
      }
    });
    
    console.log(`🛍️ ${products.length} ürün bulundu`);
    
    // Resim eşleştirmeleri
    const matches: ImageMatch[] = [];
    
    for (const imageFile of imageFiles) {
      const imageName = imageFile.replace(/\.(jpg|jpeg|png)$/i, '');
      let productMatch = null;
      let matchType = 'EŞLEŞMEDİ';
      
      // Türkçe karakter normalizasyonu
      const normalizeText = (text: string) => {
        return text.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/İ/g, 'i')
          .replace(/Ğ/g, 'g')
          .replace(/Ü/g, 'u')
          .replace(/Ş/g, 's')
          .replace(/Ö/g, 'o')
          .replace(/Ç/g, 'c');
      };
      
      const imageNameClean = normalizeText(imageName);
      
      // 1. Tam eşleşme ara
      productMatch = products.find(product => {
        const productNameClean = normalizeText(product.name);
        return productNameClean === imageNameClean;
      });
      
      if (productMatch) {
        matchType = 'TAM_EŞLEŞME';
      } else {
        // 2. İçerik eşleşmesi
        productMatch = products.find(product => {
          const productNameClean = normalizeText(product.name);
          return productNameClean.includes(imageNameClean) || imageNameClean.includes(productNameClean);
        });
        
        if (productMatch) {
          matchType = 'İÇERİK_EŞLEŞME';
        } else {
          // 3. Kelime bazlı eşleşme
          const imageNameParts = imageNameClean.split(/[-_\s]/);
          productMatch = products.find(product => {
            const productNameParts = normalizeText(product.name).split(/[-_\s]/);
            
            let matchCount = 0;
            for (const imagePart of imageNameParts) {
              for (const productPart of productNameParts) {
                if (imagePart.length > 2 && productPart.length > 2) {
                  if (imagePart === productPart || 
                      imagePart.includes(productPart) || 
                      productPart.includes(imagePart)) {
                    matchCount++;
                    break;
                  }
                }
              }
            }
            
            return matchCount >= 2;
          });
          
          if (productMatch) {
            matchType = 'KELİME_EŞLEŞME';
          }
        }
      }
      
      matches.push({
        filename: imageFile,
        productName: productMatch ? productMatch.name : 'EŞLEŞMEDİ',
        productId: productMatch ? productMatch.productId : undefined,
        matchType
      });
    }
    
    // Eşleşme sonuçlarını göster
    console.log('\n📊 Eşleşme Sonuçları:');
    const matchedCount = matches.filter(m => m.productId).length;
    const unmatchedCount = matches.length - matchedCount;
    
    console.log(`✅ Toplam eşleşen: ${matchedCount}`);
    console.log(`❌ Toplam eşleşmeyen: ${unmatchedCount}`);
    
    // Eşleşme tiplerini göster
    const matchTypes = ['TAM_EŞLEŞME', 'İÇERİK_EŞLEŞME', 'KELİME_EŞLEŞME'];
    matchTypes.forEach(type => {
      const count = matches.filter(m => m.matchType === type).length;
      if (count > 0) {
        console.log(`   ${type}: ${count}`);
      }
    });
    
    // Eşleşmeleri detaylı göster
    console.log('\n✅ BAŞARILI EŞLEŞMELER:');
    matches.filter(m => m.productId).forEach(match => {
      console.log(`   ${match.matchType.padEnd(15)} | ${match.filename.padEnd(30)} -> ${match.productName}`);
    });
    
    if (unmatchedCount > 0) {
      console.log('\n❌ EŞLEŞMEYEN RESİMLER:');
      matches.filter(m => !m.productId).forEach(match => {
        console.log(`   - ${match.filename}`);
      });
    }
    
    // Özet
    console.log('\n📈 ÖZET:');
    console.log(`🖼️ Toplam resim: ${imageFiles.length}`);
    console.log(`🛍️ Toplam ürün: ${products.length}`);
    console.log(`✅ Eşleşen: ${matchedCount} (${Math.round(matchedCount/imageFiles.length*100)}%)`);
    console.log(`❌ Eşleşmeyen: ${unmatchedCount} (${Math.round(unmatchedCount/imageFiles.length*100)}%)`);
    
  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
main().catch(console.error); 