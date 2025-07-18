import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/utils/prisma';

interface ProductData {
  collection: string;
  name: string;
  ruleId: number;
}

async function main() {
  try {
    console.log('🚀 Ürün importu başlatılıyor...');
    
    // urunler.txt dosyasını oku
    const filePath = path.join(process.cwd(), 'urunler.txt');
    // Farklı encoding deneyelim
    let fileContent: string;
    try {
      fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
    } catch {
      // UTF-8 olmazsa latin1 deneyelim
      fileContent = fs.readFileSync(filePath, { encoding: 'latin1' });
    }
    

    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    
    // İlk satırı atla (başlık satırı)
    const dataLines = lines.slice(1);
    
    // Ürün verilerini parse et
    const products: ProductData[] = [];
    const collections = new Set<string>();
    
    for (const line of dataLines) {
      // \r karakterlerini temizle
      const cleanLine = line.replace(/\r/g, '').trim();
      
      // Son kısmı rule id olarak ayır (-1, -2, -3 gibi)
      const ruleIdMatch = cleanLine.match(/ -(\d+)$/);
      if (ruleIdMatch) {
        const ruleId = parseInt(ruleIdMatch[1]);
        const productPart = cleanLine.replace(/ -\d+$/, '');
        const parts = productPart.split(' - ');
        
        if (parts.length >= 2) {
          const collection = parts[0].trim();
          const name = parts.slice(1).join(' - ').trim(); // Birden fazla - olması durumunda
          
          if (collection && name && !isNaN(ruleId)) {
            products.push({ collection, name, ruleId });
            collections.add(collection);
          }
        }
      }
    }
    
    console.log(`📊 Toplam ${products.length} ürün ve ${collections.size} koleksiyon bulundu`);
    
    // Mevcut koleksiyonları bul
    console.log('📁 Mevcut koleksiyonlar kontrol ediliyor...');
    const collectionMap = new Map<string, string>();
    
    for (const collectionName of collections) {
      try {
        // Koleksiyon adına göre ara
        const existingCollection = await prisma.collection.findFirst({
          where: { 
            name: {
              contains: collectionName,
              mode: 'insensitive'
            }
          }
        });
        
        if (existingCollection) {
          console.log(`✅ Koleksiyon bulundu: ${collectionName} -> ${existingCollection.name}`);
          collectionMap.set(collectionName, existingCollection.collectionId);
        } else {
          console.log(`⚠️ Koleksiyon bulunamadı: ${collectionName}`);
        }
      } catch (error) {
        console.error(`❌ Koleksiyon arama hatası: ${collectionName}`, error);
      }
    }
    
    // Ürünleri oluştur
    console.log('🛍️ Ürünler oluşturuluyor...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        const collectionId = collectionMap.get(product.collection);
        
        if (!collectionId) {
          console.error(`❌ Koleksiyon bulunamadı: ${product.collection}`);
          errorCount++;
          continue;
        }
        
        // Ürün açıklamasını koleksiyon adı + ürün adı şeklinde oluştur
        const description = `${product.collection} - ${product.name}`;
        
        // Aynı isimde ürünün var olup olmadığını kontrol et
        const existingProduct = await prisma.product.findFirst({
          where: {
            name: product.name,
            collectionId: collectionId
          }
        });
        
        if (existingProduct) {
          console.log(`⚠️ Ürün zaten mevcut: ${product.name} (${product.collection})`);
          continue;
        }
        
        const newProduct = await prisma.product.create({
          data: {
            name: product.name,
            description: description,
            collectionId: collectionId,
            rule_id: product.ruleId
          }
        });
        
        console.log(`✅ Ürün oluşturuldu: ${product.name} (${product.collection})`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Ürün oluşturma hatası: ${product.name}`, error);
        errorCount++;
      }
    }
    
    console.log('🎉 İmport işlemi tamamlandı!');
    console.log(`✅ Başarılı: ${successCount} ürün`);
    console.log(`❌ Hatalı: ${errorCount} ürün`);
    console.log(`📁 Toplam koleksiyon: ${collections.size}`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
main().catch(console.error); 