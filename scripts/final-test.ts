import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function testPaymentSystem() {
  console.log('🚀 DBYE Ödeme Sistemi Kapsamlı Testi Başlıyor...\n');

  try {
    // 1. Store bilgilerini kontrol et
    console.log('📊 Store bilgileri kontrol ediliyor...');
    const store = await prisma.store.findFirst({
      where: { store_id: '4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5' }
    });
    
    if (!store) {
      console.log('❌ Store bulunamadı!');
      return;
    }
    
    console.log(`✅ Store bulundu: ${store.kurum_adi}`);
    console.log(`💰 Mevcut bakiye: ${store.bakiye} TL\n`);

    // 2. Payment request testi
    console.log('🔄 Payment request oluşturuluyor...');
    
    const paymentData = {
      storeId: '4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5',
      amount: 75.50,
      aciklama: 'Test ödeme - Final test'
    };

    const response = await fetch('http://localhost:1337/api/payments/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status}`);
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return;
    }

    const result = await response.json();
    
    console.log('📋 Payment Response:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    if (result.success && result.data) {
      // 3. Transaction kontrolü
      console.log('🔍 Transaction veritabanından kontrol ediliyor...');
      const transaction = await prisma.paymentTransaction.findFirst({
        where: {
          sellerReference: result.data.sellerReference
        }
      });

      if (transaction) {
        console.log('✅ Transaction veritabanında bulundu:');
        console.log(`- ID: ${transaction.id}`);
        console.log(`- Store ID: ${transaction.storeId}`);
        console.log(`- Amount: ${transaction.amount} TL`);
        console.log(`- Status: ${transaction.status}`);
        console.log(`- Webhook Token: ${transaction.webhookToken}`);
        console.log('');

        // 4. Webhook URL'lerini göster
        console.log('🔗 Webhook URL\'leri:');
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:1337';
        console.log(`✅ Success: ${baseUrl}/api/payments/webhook/success?token=${transaction.webhookToken}`);
        console.log(`❌ Failure: ${baseUrl}/api/payments/webhook/failure?token=${transaction.webhookToken}`);
        console.log('');

        // 5. Webhook simülasyonu (başarılı ödeme)
        console.log('🎯 Webhook simülasyonu (başarılı ödeme) yapılıyor...');
        
        const webhookResponse = await fetch(`http://localhost:1337/api/payments/webhook/success?token=${transaction.webhookToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: 'TEST_PAYMENT_' + Date.now(),
            amount: transaction.amount,
            status: 'SUCCESS'
          })
        });

        if (webhookResponse.ok) {
          console.log('✅ Webhook başarıyla işlendi');
          
          // 6. Güncellenmiş durumları kontrol et
          console.log('🔄 Güncellenmiş durumlar kontrol ediliyor...');
          
          const updatedTransaction = await prisma.paymentTransaction.findFirst({
            where: { id: transaction.id }
          });
          
          const updatedStore = await prisma.store.findFirst({
            where: { store_id: '4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5' }
          });

          console.log('📊 Güncellenmiş Transaction:');
          console.log(`- Status: ${updatedTransaction?.status}`);
          console.log(`- Payment Date: ${updatedTransaction?.paymentDate}`);
          console.log(`- Octet Payment ID: ${updatedTransaction?.octetPaymentId}`);
          console.log('');

          console.log('💰 Güncellenmiş Store Bakiyesi:');
          console.log(`- Önceki: ${store.bakiye} TL`);
          console.log(`- Şimdiki: ${updatedStore?.bakiye} TL`);
          console.log(`- Artış: +${transaction.amount} TL`);
          console.log('');

          // 7. Muhasebe hareketini kontrol et
          const muhasebeHareket = await prisma.muhasebeHareketleri.findFirst({
            where: {
              storeId: '4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5',
              tutar: transaction.amount,
              islemTuru: 'ÖDEME'
            },
            orderBy: { createdAt: 'desc' }
          });

          if (muhasebeHareket) {
            console.log('📈 Muhasebe Hareketi Oluşturuldu:');
            console.log(`- Tip: ${muhasebeHareket.islemTuru}`);
            console.log(`- Tutar: ${muhasebeHareket.tutar} TL`);
            console.log(`- Harcama: ${muhasebeHareket.harcama}`);
            console.log(`- Tarih: ${muhasebeHareket.createdAt}`);
            console.log('');
          }

          console.log('🎉 Test başarıyla tamamlandı!');
          
        } else {
          console.log('❌ Webhook test başarısız');
          const webhookError = await webhookResponse.text();
          console.log('Webhook error:', webhookError);
        }

      } else {
        console.log('❌ Transaction veritabanında bulunamadı');
      }

    } else {
      console.log('❌ Payment request başarısız');
    }

  } catch (error) {
    console.error('❌ Test sırasında hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPaymentSystem(); 