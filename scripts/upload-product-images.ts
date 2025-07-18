import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/utils/prisma';
import { UploadService } from '../src/utils/upload-service';

const uploadService = new UploadService();

interface ImageMatch {
  filename: string;
  productName: string;
  productId?: string;
  uploadedUrl?: string;
}

async function main() {
  try {
    console.log('🖼️ Ürün resim upload işlemi başlatılıyor...');
    
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
      
      // Önce tam eşleşme ara
      productMatch = products.find(product => {
        const productName = product.name.toLowerCase()
          .replace(/\s/g, '_')
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/İ/g, 'I')
          .replace(/Ğ/g, 'G')
          .replace(/Ü/g, 'U')
          .replace(/Ş/g, 'S')
          .replace(/Ö/g, 'O')
          .replace(/Ç/g, 'C');
        
        const imageNameClean = imageName.toLowerCase()
          .replace(/\s/g, '_')
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/İ/g, 'I')
          .replace(/Ğ/g, 'G')
          .replace(/Ü/g, 'U')
          .replace(/Ş/g, 'S')
          .replace(/Ö/g, 'O')
          .replace(/Ç/g, 'C');
        
        return productName === imageNameClean || 
               productName.includes(imageNameClean) ||
               imageNameClean.includes(productName);
      });
      
      // Daha esnek eşleşme dene
      if (!productMatch) {
        const imageNameParts = imageName.toLowerCase().split(/[-_\s]/);
        productMatch = products.find(product => {
          const productNameParts = product.name.toLowerCase().split(/[-_\s]/);
          
          // En az 2 kelime eşleşmesi
          let matchCount = 0;
          for (const imagePart of imageNameParts) {
            for (const productPart of productNameParts) {
              if (imagePart.length > 2 && productPart.length > 2) {
                if (imagePart.includes(productPart) || productPart.includes(imagePart)) {
                  matchCount++;
                  break;
                }
              }
            }
          }
          
          return matchCount >= 2;
        });
      }
      
      matches.push({
        filename: imageFile,
        productName: productMatch ? productMatch.name : 'EŞLEŞMEDİ',
        productId: productMatch ? productMatch.productId : undefined
      });
    }
    
    // Eşleşme sonuçlarını göster
    console.log('\n📊 Eşleşme Sonuçları:');
    const matchedCount = matches.filter(m => m.productId).length;
    const unmatchedCount = matches.length - matchedCount;
    
    console.log(`✅ Eşleşen: ${matchedCount}`);
    console.log(`❌ Eşleşmeyen: ${unmatchedCount}`);
    
    if (unmatchedCount > 0) {
      console.log('\n❌ Eşleşmeyen resimler:');
      matches.filter(m => !m.productId).forEach(match => {
        console.log(`   - ${match.filename}`);
      });
    }
    
    // Upload işlemi
    console.log('\n🚀 Resim upload işlemi başlatılıyor...');
    let uploadedCount = 0;
    let errorCount = 0;
    
    for (const match of matches) {
      if (!match.productId) continue;
      
      try {
        const imagePath = path.join(imagesDir, match.filename);
        const imageBuffer = fs.readFileSync(imagePath);
        const mimeType = `image/${path.extname(match.filename).substring(1)}`;
        
        console.log(`📤 Upload ediliyor: ${match.filename} -> ${match.productName}`);
        
        // Tebi'ye upload et
        const uploadedUrl = await uploadService.uploadFile(
          imageBuffer,
          mimeType,
          match.filename
        );
        
        // Ürünü güncelle
        await prisma.product.update({
          where: { productId: match.productId },
          data: { productImage: uploadedUrl }
        });
        
        match.uploadedUrl = uploadedUrl;
        uploadedCount++;
        
        console.log(`✅ Başarılı: ${match.filename}`);
        
        // Rate limiting için 500ms bekle
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Hata: ${match.filename}`, error);
        errorCount++;
      }
    }
    
    // Sonuçları göster
    console.log('\n🎉 Upload işlemi tamamlandı!');
    console.log(`✅ Başarılı upload: ${uploadedCount}`);
    console.log(`❌ Hatalı upload: ${errorCount}`);
    console.log(`📊 Toplam eşleşme: ${matchedCount}`);
    console.log(`🖼️ Toplam resim: ${imageFiles.length}`);
    
    // Başarılı uploadlar listesi
    const successfulUploads = matches.filter(m => m.uploadedUrl);
    if (successfulUploads.length > 0) {
      console.log('\n✅ Başarılı Upload Edilen Ürünler:');
      successfulUploads.forEach(match => {
        console.log(`   - ${match.productName}: ${match.filename}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Upload hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
main().catch(console.error); 