const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function analyzeSerhatStore() {
  try {
    const storeId = 'dc3301dd-2ed2-421d-8afb-70c3a0a4740b';
    
    console.log('🔍 Serhat Halı Mağazası Detaylı Analiz\n');
    
    // 1. Mağaza bilgileri
    const store = await prisma.store.findUnique({
      where: { store_id: storeId },
      select: {
        store_id: true,
        kurum_adi: true,
        bakiye: true,
        currency: true,
        is_active: true,
        created_at: true,
        updated_at: true
      }
    });
    
    console.log('📋 1. MAĞAZA BİLGİLERİ:');
    console.log('─'.repeat(60));
    console.log(`Mağaza Adı: ${store.kurum_adi}`);
    console.log(`Store ID: ${store.store_id}`);
    console.log(`Mevcut Bakiye: ${store.bakiye} ${store.currency}`);
    console.log(`Currency: ${store.currency}`);
    console.log(`Aktif: ${store.is_active}`);
    console.log(`Oluşturma: ${store.created_at}`);
    console.log(`Son Güncelleme: ${store.updated_at}`);
    
    // 2. TÜM muhasebe hareketleri
    const allHareketler = await prisma.muhasebeHareketleri.findMany({
      where: { storeId: storeId },
      orderBy: { createdAt: 'asc' }, // Kronolojik sıra
      select: {
        id: true,
        islemTuru: true,
        tutar: true,
        harcama: true,
        tarih: true,
        aciklama: true,
        createdAt: true,
        currency: true,
        original_currency: true,
        original_amount: true,
        exchange_rate: true
      }
    });
    
    console.log('\n📝 2. TÜM MUHASEBE HAREKETLERİ (Kronolojik):');
    console.log('─'.repeat(100));
    
    let theoreticalBalance = 0;
    
    allHareketler.forEach((hareket, index) => {
      const isGelir = !hareket.harcama; // false = gelir, true = gider
      const etkiTutari = Number(hareket.tutar);
      
      // Bakiye hesaplama mantığı
      let bakiyeEtkisi = 0;
      if (hareket.islemTuru === 'Borç Tahsilatı') {
        bakiyeEtkisi = etkiTutari; // Borç tahsilatı bakiyeyi artırır
      } else if (hareket.islemTuru === 'Borç Verme') {
        bakiyeEtkisi = -etkiTutari; // Borç verme bakiyeyi azaltır
      } else {
        // Diğer işlemler için normal mantık
        bakiyeEtkisi = isGelir ? -etkiTutari : etkiTutari;
      }
      
      theoreticalBalance += bakiyeEtkisi;
      
      console.log(`\n${index + 1}. Hareket (ID: ${hareket.id})`);
      console.log(`   İşlem Türü: ${hareket.islemTuru}`);
      console.log(`   Tutar: ${hareket.tutar} ${hareket.currency || 'TRY'}`);
      if (hareket.original_amount && hareket.original_currency) {
        console.log(`   Orijinal: ${hareket.original_amount} ${hareket.original_currency}`);
      }
      console.log(`   Tip: ${isGelir ? 'GELİR' : 'GİDER'} (harcama: ${hareket.harcama})`);
      console.log(`   Bakiye Etkisi: ${bakiyeEtkisi > 0 ? '+' : ''}${bakiyeEtkisi}`);
      console.log(`   Teorik Bakiye: ${theoreticalBalance}`);
      console.log(`   Tarih: ${hareket.tarih}`);
      console.log(`   Oluşturma: ${hareket.createdAt}`);
      console.log(`   Açıklama: ${hareket.aciklama || 'Yok'}`);
    });
    
    // 3. Bakiye analizi
    console.log('\n📊 3. BAKİYE ANALİZİ:');
    console.log('─'.repeat(50));
    console.log(`Mevcut Veritabanı Bakiyesi: ${store.bakiye} ${store.currency}`);
    console.log(`Teorik Hesaplanan Bakiye: ${theoreticalBalance} ${store.currency}`);
    console.log(`Fark: ${Number(store.bakiye) - theoreticalBalance} ${store.currency}`);
    
    if (Number(store.bakiye) !== theoreticalBalance) {
      console.log('\n⚠️  BAKİYE UYUMSUZLUĞU TESPİT EDİLDİ!');
      console.log('Muhtemel sebepler:');
      console.log('- Bazı hareketlerin bakiyeye yansımaması');
      console.log('- Manuel bakiye değişiklikleri');
      console.log('- Transaction rollback\'leri');
      console.log('- Eski kod ile eklenen hareketler');
    } else {
      console.log('\n✅ Bakiye tutarlı görünüyor');
    }
    
    // 4. Özel durum kontrolleri
    console.log('\n🔍 4. ÖZEL DURUM KONTROLLERİ:');
    console.log('─'.repeat(50));
    
    const borcTahsilatlari = allHareketler.filter(h => h.islemTuru === 'Borç Tahsilatı');
    const toplamBorcTahsilati = borcTahsilatlari.reduce((sum, h) => sum + Number(h.tutar), 0);
    
    console.log(`Toplam Borç Tahsilatı Sayısı: ${borcTahsilatlari.length}`);
    console.log(`Toplam Borç Tahsilatı Tutarı: ${toplamBorcTahsilati} ${store.currency}`);
    
    borcTahsilatlari.forEach((hareket, index) => {
      console.log(`  ${index + 1}. ${hareket.tutar} ${hareket.currency} - ${hareket.aciklama} (${hareket.createdAt})`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeSerhatStore();
