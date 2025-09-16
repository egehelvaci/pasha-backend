import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export async function createSampleSuppliers() {
  try {
    console.log('Örnek satıcılar oluşturuluyor...');
    
    // Örnek satıcılar
    const sampleSuppliers = [
      {
        name: 'ABC Halı Tedarik',
        company_name: 'ABC Halı Tedarik Ltd. Şti.',
        phone: '+90 212 555 0001',
        address: 'Merkez Mah. Sanayi Cad. No:15 Gaziosmanpaşa/İstanbul',
        balance: -1500.00, // Borçlu
        currency: 'USD' as const,
        notes: 'Ana tedarikçimiz, kaliteli ürünler'
      },
      {
        name: 'DEF Tekstil',
        company_name: 'DEF Tekstil San. Tic. A.Ş.',
        phone: '+90 216 444 0002',
        address: 'İkitelli OSB Mahallesi, Sümer Sokak No:8 Başakşehir/İstanbul',
        balance: 2300.50, // Alacaklı
        currency: 'USD' as const,
        notes: 'Premium kalite ürünler, hızlı teslimat'
      },
      {
        name: 'GHI İplik ve Dokuma',
        company_name: 'GHI İplik ve Dokuma Fab. Ltd.',
        phone: '+90 232 333 0003',
        address: 'Atatürk OSB, 10005 Sokak No:42 Çiğli/İzmir',
        balance: 0.00, // Nötr
        currency: 'USD' as const,
        notes: 'Yeni tedarikçi, test aşamasında'
      },
      {
        name: 'JKL Export',
        company_name: 'JKL Export Import Co.',
        phone: '+90 312 777 0004',
        address: 'Ostim OSB, Metalurji Cad. No:25 Yenimahalle/Ankara',
        balance: -850.75, // Borçlu
        currency: 'USD' as const,
        notes: 'İthalat odaklı, özel siparişler'
      }
    ];

    for (const supplierData of sampleSuppliers) {
      // Satıcıyı oluştur
      const supplier = await prisma.supplier.create({
        data: supplierData
      });

      // Eğer bakiye 0 değilse, transaction kaydı oluştur
      if (supplierData.balance !== 0) {
        await prisma.supplierBalanceTransaction.create({
          data: {
            supplier_id: supplier.id,
            transaction_type: 'INITIAL_BALANCE',
            amount: supplierData.balance,
            previous_balance: 0,
            new_balance: supplierData.balance,
            description: 'Sistem kurulumu - başlangıç bakiyesi',
            created_by: 'SYSTEM' // Sistem tarafından oluşturuldu
          }
        });
      }

      console.log(`✓ ${supplier.name} oluşturuldu (Bakiye: $${supplierData.balance})`);
    }

    console.log('\n📊 Özet Rapor:');
    
    // Özet istatistikleri göster
    const suppliers = await prisma.supplier.findMany({
      where: { is_active: true },
      select: {
        name: true,
        company_name: true,
        balance: true,
        currency: true
      },
      orderBy: { balance: 'asc' }
    });

    let totalDebt = 0;
    let totalCredit = 0;
    let debtCount = 0;
    let creditCount = 0;

    suppliers.forEach(supplier => {
      const balance = parseFloat(supplier.balance.toString());
      if (balance < 0) {
        totalDebt += Math.abs(balance);
        debtCount++;
      } else if (balance > 0) {
        totalCredit += balance;
        creditCount++;
      }
    });

    console.log(`Toplam Satıcı: ${suppliers.length}`);
    console.log(`Borçlu Satıcı: ${debtCount} (Toplam Borç: $${totalDebt.toFixed(2)})`);
    console.log(`Alacaklı Satıcı: ${creditCount} (Toplam Alacak: $${totalCredit.toFixed(2)})`);
    console.log(`Net Durum: $${(totalCredit - totalDebt).toFixed(2)}`);

    if (debtCount > 0) {
      console.log('\n🔴 Borçlu Satıcılar:');
      suppliers.filter(s => parseFloat(s.balance.toString()) < 0).forEach(s => {
        console.log(`  - ${s.name}: $${Math.abs(parseFloat(s.balance.toString())).toFixed(2)} borç`);
      });
    }

    if (creditCount > 0) {
      console.log('\n🟢 Alacaklı Satıcılar:');
      suppliers.filter(s => parseFloat(s.balance.toString()) > 0).forEach(s => {
        console.log(`  - ${s.name}: $${parseFloat(s.balance.toString()).toFixed(2)} alacak`);
      });
    }

    console.log('\nÖrnek satıcılar başarıyla oluşturuldu!');
    
  } catch (error) {
    console.error('Örnek satıcı oluşturma hatası:', error);
    throw error;
  }
}

// Script olarak çalıştırılırsa
if (require.main === module) {
  createSampleSuppliers()
    .then(() => {
      console.log('İşlem başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('İşlem başarısız:', error);
      process.exit(1);
    });
}
