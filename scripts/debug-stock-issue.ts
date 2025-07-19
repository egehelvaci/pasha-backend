import { PrismaClient } from '../generated/prisma';
import { QRCodeService } from '../src/services/qr-code-service';

const prisma = new PrismaClient();
const qrCodeService = new QRCodeService();

async function debugStockIssue() {
  try {
    console.log('🚨 STOKtan DÜŞMEME SORUNU DEBUGGİNG 🚨');
    console.log('═'.repeat(50));
    
    // 1. PENDING sipariş bul veya oluştur
    let pendingOrder = await prisma.order.findFirst({
      where: { status: 'PENDING' },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          include: {
            Store: true
          }
        }
      }
    });
    
    if (!pendingOrder) {
      console.log('❌ PENDING sipariş bulunamadı!');
      return;
    }
    
    console.log(`\n📦 Test Siparişi: ${pendingOrder.id}`);
    console.log(`📅 Tarih: ${pendingOrder.created_at}`);
    console.log(`👤 Kullanıcı: ${pendingOrder.user.name} ${pendingOrder.user.surname}`);
    console.log(`🏪 Mağaza: ${pendingOrder.user.Store?.kurum_adi || 'Yok'}`);
    console.log(`💰 Toplam: ${pendingOrder.total_price} TL`);
    console.log(`📋 Öğe Sayısı: ${pendingOrder.items.length}`);
    
    // 2. HER SIPARIŞ ÖĞESİ İÇİN DETAYLI STOK ANALİZİ
    console.log('\n🔍 DETAYLI STOK ANALİZİ:');
    console.log('═'.repeat(50));
    
    for (let i = 0; i < pendingOrder.items.length; i++) {
      const item = pendingOrder.items[i];
      console.log(`\n📦 ÖĞKE ${i + 1}: ${item.product.name}`);
      console.log(`   ├─ Ürün ID: ${item.product_id}`);
      console.log(`   ├─ Boyut: ${item.width}x${item.height}`);
      console.log(`   ├─ Saçak: ${item.has_fringe}`);
      console.log(`   ├─ Miktar: ${item.quantity}`);
      console.log(`   └─ Birim Fiyat: ${item.unit_price} TL`);
      
      // Bu ürünün TÜM varyasyonlarını getir
      const allVariations = await prisma.productvariations.findMany({
        where: { product_id: item.product_id },
        orderBy: [
          { width: 'asc' },
          { height: 'asc' },
          { has_fringe: 'asc' }
        ]
      });
      
      console.log(`\n   📊 ÜRÜN VARYASYONLARI (${allVariations.length} adet):`);
      allVariations.forEach((v, idx) => {
        const isMatch = (
          v.width === (item.width ? Math.round(Number(item.width)) : undefined) &&
          v.height === (item.height ? Math.round(Number(item.height)) : undefined) &&
          v.has_fringe === (item.has_fringe || false)
        );
        console.log(`   ${isMatch ? '🎯' : '   '} ${idx + 1}. ${v.width}x${v.height} - Saçak:${v.has_fringe} - Stok:${v.stock_quantity} ${isMatch ? '← EŞLEŞME!' : ''}`);
      });
      
      // Eşleşen varyasyonları test et
      const exactMatches = allVariations.filter(v => 
        v.width === (item.width ? Math.round(Number(item.width)) : undefined) &&
        v.height === (item.height ? Math.round(Number(item.height)) : undefined) &&
        v.has_fringe === (item.has_fringe || false)
      );
      
      console.log(`\n   🎯 TAM EŞLEŞME: ${exactMatches.length} adet`);
      if (exactMatches.length > 0) {
        exactMatches.forEach((v, idx) => {
          console.log(`      ${idx + 1}. ID:${v.id} - Stok:${v.stock_quantity} - Yeni Stok:${v.stock_quantity - item.quantity}`);
        });
      }
      
      // Alternatif eşleşmeleri test et (saçak farklı)
      const alternativeMatches = allVariations.filter(v => 
        v.width === (item.width ? Math.round(Number(item.width)) : undefined) &&
        v.height === (item.height ? Math.round(Number(item.height)) : undefined) &&
        v.has_fringe === !(item.has_fringe || false)
      );
      
      if (alternativeMatches.length > 0) {
        console.log(`\n   🔄 ALTERNATİF EŞLEŞME (ters saçak): ${alternativeMatches.length} adet`);
        alternativeMatches.forEach((v, idx) => {
          console.log(`      ${idx + 1}. ID:${v.id} - Saçak:${v.has_fringe} - Stok:${v.stock_quantity}`);
        });
      }
      
      if (exactMatches.length === 0 && alternativeMatches.length === 0) {
        console.log('   ❌ HİÇBİR UYGUN VARYASYON BULUNAMADI!');
      }
    }
    
    // 3. STOK DÜŞÜRME TESTİ (KENDİ MANTĞIMIZLA)
    console.log('\n🧪 STOK DÜŞÜRME TESTİ (KENDİ MANTIĞIMIZLA):');
    console.log('═'.repeat(50));
    
    for (const item of pendingOrder.items) {
      console.log(`\n🔍 ${item.product.name} için stok düşürme simülasyonu:`);
      console.log(`   Aranan: ${item.width}x${item.height}, Saçak:${item.has_fringe}, Miktar:${item.quantity}`);
      
      // 1. Tam eşleşme ara
      let variations = await prisma.productvariations.findMany({
        where: {
          product_id: item.product_id,
          width: item.width ? Math.round(Number(item.width)) : undefined,
          height: item.height ? Math.round(Number(item.height)) : undefined,
          has_fringe: item.has_fringe || false
        }
      });
      
      console.log(`   1️⃣ Tam eşleşme sorgusu: ${variations.length} sonuç`);
      
      // 2. Eğer bulunamazsa alternatif ara
      if (variations.length === 0) {
        variations = await prisma.productvariations.findMany({
          where: {
            product_id: item.product_id,
            width: item.width ? Math.round(Number(item.width)) : undefined,
            height: item.height ? Math.round(Number(item.height)) : undefined,
            has_fringe: !(item.has_fringe || false)
          }
        });
        console.log(`   2️⃣ Alternatif eşleşme sorgusu: ${variations.length} sonuç`);
      }
      
      if (variations.length > 0) {
        const variation = variations[0];
        const oldStock = variation.stock_quantity;
        const newStock = Math.max(0, oldStock - item.quantity);
        console.log(`   ✅ Seçilen varyasyon: ID ${variation.id}`);
        console.log(`   📦 Eski stok: ${oldStock}`);
        console.log(`   📦 Yeni stok: ${newStock}`);
        console.log(`   📉 Fark: ${oldStock - newStock}`);
        
        // DRY RUN - gerçekte güncelleme yapmayacağız
        console.log(`   🔄 Güncelleme sorgusu hazır (DRY RUN)`);
      } else {
        console.log(`   ❌ Hiçbir varyasyon bulunamadı!`);
      }
    }
    
    // 4. GERÇEKTETESABİRİŞ ONAYLAMA TEST
    console.log('\n🚀 GERÇEKTETESİPARİŞ ONAYLAMA TESTİ:');
    console.log('═'.repeat(50));
    
    const userInput = process.argv[2]; // komut satırından parametre al
    
    if (userInput === '--execute') {
      console.log('⚠️  GERÇEKTEN ÇALIŞTIRILIYOR! Stoklar düşecek!');
      
      try {
        // QR kod oluştur
        console.log('\n📱 QR kod oluşturuluyor...');
        const qrResult = await qrCodeService.generateQRCodesForOrder(pendingOrder.id);
        console.log(`✅ ${qrResult.totalQRCodes} QR kod oluşturuldu`);
        
        // Stok düşür
        console.log('\n📦 Stok düşürülüyor...');
        await qrCodeService.reduceStockForOrder(pendingOrder.id);
        console.log('✅ Stok düşürme tamamlandı');
        
        // Sonuç kontrolü
        console.log('\n📊 SONUÇ KONTROLÜ:');
        for (const item of pendingOrder.items) {
          const variations = await prisma.productvariations.findMany({
            where: {
              product_id: item.product_id,
              width: item.width ? Math.round(Number(item.width)) : undefined,
              height: item.height ? Math.round(Number(item.height)) : undefined,
              has_fringe: item.has_fringe || false
            }
          });
          
          if (variations.length > 0) {
            const variation = variations[0];
            console.log(`${item.product.name}: ${variation.stock_quantity} (düştü mü: ${variation.stock_quantity < 1000 ? '✅' : '❌'})`);
          }
        }
        
      } catch (error) {
        console.error('❌ Sipariş onaylama hatası:', error);
      }
      
    } else {
      console.log('ℹ️  DRY RUN MODU - Hiçbir şey değiştirilmeyecek');
      console.log('ℹ️  Gerçekten çalıştırmak için: npm run ts-node scripts/debug-stock-issue.ts -- --execute');
    }
    
    // 5. MEVCUT SORUNLARI LİSTELE
    console.log('\n🔧 TESPIT EDİLEN MUHTEMEL SORUNLAR:');
    console.log('═'.repeat(50));
    
    let issueCount = 0;
    
    for (const item of pendingOrder.items) {
      const hasExactMatch = await prisma.productvariations.count({
        where: {
          product_id: item.product_id,
          width: item.width ? Math.round(Number(item.width)) : undefined,
          height: item.height ? Math.round(Number(item.height)) : undefined,
          has_fringe: item.has_fringe || false
        }
      });
      
      if (hasExactMatch === 0) {
        issueCount++;
        console.log(`❌ SORUN ${issueCount}: ${item.product.name} için tam eşleşen varyasyon yok`);
        console.log(`   Aranan: ${item.width}x${item.height}, Saçak: ${item.has_fringe}`);
        
        const allVars = await prisma.productvariations.findMany({
          where: { product_id: item.product_id }
        });
        console.log(`   Mevcut varyasyonlar (${allVars.length} adet):`);
        allVars.slice(0, 5).forEach((v, i) => {
          console.log(`      ${i + 1}. ${v.width}x${v.height}, Saçak: ${v.has_fringe}`);
        });
        if (allVars.length > 5) {
          console.log(`      ... ve ${allVars.length - 5} tane daha`);
        }
      }
    }
    
    if (issueCount === 0) {
      console.log('✅ Hiçbir sorun tespit edilmedi - tüm öğeler için uygun varyasyon mevcut');
    }
    
    console.log('\n🏁 DEBUG TAMAMLANDI');
    console.log('═'.repeat(50));
    
  } catch (error: any) {
    console.error('❌ Debug hatası:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Script çalıştır
debugStockIssue(); 