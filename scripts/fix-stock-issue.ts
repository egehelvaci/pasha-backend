import { PrismaClient } from '../generated/prisma';
import { QRCodeService } from '../src/services/qr-code-service';

const prisma = new PrismaClient();
const qrCodeService = new QRCodeService();

async function fixStockIssue() {
  try {
    console.log('🔧 STOK DÜŞMEME SORUNU ÇÖZÜMÜ');
    console.log('═'.repeat(50));
    
    // 1. CONFIRMED ama stok düşmemiş siparişleri bul
    const confirmedOrders = await prisma.order.findMany({
      where: { status: 'CONFIRMED' },
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
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 10 // Son 10 CONFIRMED sipariş
    });
    
    console.log(`📦 ${confirmedOrders.length} CONFIRMED sipariş bulundu`);
    
    if (confirmedOrders.length === 0) {
      console.log('❌ CONFIRMED sipariş bulunamadı!');
      return;
    }
    
    // 2. Her sipariş için stok kontrol et
    const problematicOrders = [];
    
    for (const order of confirmedOrders) {
      console.log(`\n🔍 Sipariş ${order.id} kontrol ediliyor...`);
      let hasStockIssue = false;
      
      for (const item of order.items) {
        // Bu item için uygun varyasyon var mı?
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
          // Stok 1000'de kalmışsa düşmemiş demektir
          if (variation.stock_quantity >= 1000) {
            hasStockIssue = true;
            console.log(`   ⚠️  ${item.product.name}: Stok düşmemiş (${variation.stock_quantity})`);
          } else {
            console.log(`   ✅ ${item.product.name}: Stok düşmüş (${variation.stock_quantity})`);
          }
        } else {
          hasStockIssue = true;
          console.log(`   ❌ ${item.product.name}: Uygun varyasyon bulunamadı!`);
        }
      }
      
      if (hasStockIssue) {
        problematicOrders.push(order);
      }
    }
    
    console.log(`\n📊 SONUÇ: ${problematicOrders.length} sipariş de stok sorunu var`);
    
    if (problematicOrders.length === 0) {
      console.log('✅ Tüm CONFIRMED siparişlerde stok düzgün düşmüş!');
      return;
    }
    
    // 3. Sorunlu siparişleri listele
    console.log('\n🚨 SORUNLU SİPARİŞLER:');
    console.log('═'.repeat(50));
    
    problematicOrders.forEach((order, idx) => {
      console.log(`${idx + 1}. Sipariş: ${order.id}`);
      console.log(`   Tarih: ${order.created_at}`);
      console.log(`   Kullanıcı: ${order.user.name} ${order.user.surname}`);
      console.log(`   Mağaza: ${order.user.Store?.kurum_adi || 'Yok'}`);
      console.log(`   Tutar: ${order.total_price} TL`);
    });
    
    // 4. Düzeltme önerisi
    console.log('\n💡 ÇÖZÜM ÖNERİLERİ:');
    console.log('═'.repeat(50));
    
    const userInput = process.argv[2];
    
    if (userInput === '--fix') {
      console.log('🔄 OTOMATIK ÇÖZÜM UYGULANYOR...');
      
      for (const order of problematicOrders) {
        console.log(`\n🔧 ${order.id} sipariş için stok düşürülüyor...`);
        
        try {
          await qrCodeService.reduceStockForOrder(order.id);
          console.log(`✅ Stok düşürme başarılı`);
        } catch (error) {
          console.error(`❌ Stok düşürme hatası:`, error);
        }
      }
      
    } else if (userInput === '--reset-to-pending') {
      console.log('🔄 SİPARİŞLER PENDING DURUMUNA ALINIYOR...');
      
      for (const order of problematicOrders) {
        console.log(`\n🔧 ${order.id} sipariş PENDING yapılıyor...`);
        
        try {
          // QR kodları sil
          await prisma.qRCode.deleteMany({
            where: { order_id: order.id }
          });
          
          // Siparişi PENDING yap
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'PENDING' }
          });
          
          console.log(`✅ Sipariş PENDING yapıldı, QR kodlar silindi`);
        } catch (error) {
          console.error(`❌ Reset hatası:`, error);
        }
      }
      
    } else {
      console.log('1️⃣ Stok düşürme işlemini tekrar denemek için:');
      console.log('   npm run fix-stock -- --fix');
      console.log('');
      console.log('2️⃣ Siparişleri PENDING durumuna alıp tekrar onaylamak için:');
      console.log('   npm run fix-stock -- --reset-to-pending');
      console.log('');
      console.log('3️⃣ Sadece görüntüleme için:');
      console.log('   npm run fix-stock');
    }
    
    // 5. Varyasyon eksikliklerini kontrol et
    console.log('\n🔍 VARYASYON EKSİKLİKLERİNİ KONTROL EDİYOR...');
    console.log('═'.repeat(50));
    
    const missingVariations = [];
    
    for (const order of problematicOrders) {
      for (const item of order.items) {
        const hasExactMatch = await prisma.productvariations.count({
          where: {
            product_id: item.product_id,
            width: item.width ? Math.round(Number(item.width)) : undefined,
            height: item.height ? Math.round(Number(item.height)) : undefined,
            has_fringe: item.has_fringe || false
          }
        });
        
        if (hasExactMatch === 0) {
          missingVariations.push({
            productId: item.product_id,
            productName: item.product.name,
            width: item.width ? Math.round(Number(item.width)) : undefined,
            height: item.height ? Math.round(Number(item.height)) : undefined,
            hasFringe: item.has_fringe || false,
            orderId: order.id
          });
        }
      }
    }
    
    if (missingVariations.length > 0) {
      console.log(`❌ ${missingVariations.length} eksik varyasyon tespit edildi:`);
      missingVariations.forEach((mv, idx) => {
        console.log(`   ${idx + 1}. ${mv.productName} - ${mv.width}x${mv.height} - Saçak:${mv.hasFringe} (Sipariş: ${mv.orderId})`);
      });
      
      if (userInput === '--create-variations') {
        console.log('\n🔄 EKSİK VARYASYONLAR OLUŞTURULUYOR...');
        
        for (const mv of missingVariations) {
          try {
            await prisma.productvariations.create({
              data: {
                product_id: mv.productId,
                width: mv.width!,
                height: mv.height!,
                has_fringe: mv.hasFringe,
                stock_quantity: 1000, // Varsayılan stok
                list_price: 0, // Varsayılan fiyat
                sale_price: 0
              }
            });
            console.log(`✅ Varyasyon oluşturuldu: ${mv.productName} - ${mv.width}x${mv.height}`);
          } catch (error) {
            console.error(`❌ Varyasyon oluşturma hatası:`, error);
          }
        }
      } else {
        console.log('\n💡 Eksik varyasyonları oluşturmak için:');
        console.log('   npm run fix-stock -- --create-variations');
      }
    } else {
      console.log('✅ Tüm gerekli varyasyonlar mevcut');
    }
    
    console.log('\n🏁 ANALIZ TAMAMLANDI');
    console.log('═'.repeat(50));
    
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Script çalıştır
fixStockIssue(); 