import prisma from '../src/utils/prisma'

/**
 * Mevcut muhasebe hareketlerindeki eksik order_id'leri düzelt
 * Açıklama alanındaki sipariş ID'lerini kullanarak order_id'yi set et
 */
async function fixMissingOrderIds() {
  try {
    console.log('🔧 Eksik order_id\'leri düzeltme işlemi başlatılıyor...')
    
    // order_id'si null olan ve açıklamasında sipariş ID'si bulunan hareketleri bul
    const hareketler = await prisma.muhasebeHareketleri.findMany({
      where: {
        order_id: null,
        OR: [
          {
            aciklama: {
              contains: 'Sipariş #'
            }
          },
          {
            aciklama: {
              contains: 'Admin Siparişi #'
            }
          }
        ]
      },
      select: {
        id: true,
        aciklama: true,
        storeId: true,
        tarih: true
      }
    })
    
    console.log(`📋 Düzeltilecek ${hareketler.length} muhasebe hareketi bulundu`)
    
    let fixedCount = 0
    let notFoundCount = 0
    
    for (const hareket of hareketler) {
      try {
        // Açıklamadan sipariş ID'sini çıkar (hem normal hem admin siparişleri)
        const siparisIdMatch = hareket.aciklama?.match(/(?:Sipariş|Admin Siparişi) #([a-f0-9-]+)/i)
        
        if (siparisIdMatch && siparisIdMatch[1]) {
          const siparisId = siparisIdMatch[1]
          
          // Bu sipariş ID'si gerçekten var mı kontrol et
          const order = await prisma.order.findUnique({
            where: { id: siparisId },
            select: { id: true, user_id: true }
          })
          
          if (order) {
            // order_id'yi güncelle
            await prisma.muhasebeHareketleri.update({
              where: { id: hareket.id },
              data: { order_id: siparisId }
            })
            
            console.log(`✅ Hareket ID ${hareket.id} → Sipariş ID ${siparisId} bağlandı`)
            fixedCount++
          } else {
            console.log(`❌ Sipariş ID ${siparisId} bulunamadı (Hareket ID: ${hareket.id})`)
            notFoundCount++
          }
        } else {
          console.log(`⚠️ Sipariş ID çıkarılamadı: ${hareket.aciklama}`)
        }
      } catch (error) {
        console.error(`❌ Hareket ID ${hareket.id} düzeltme hatası:`, error)
      }
    }
    
    console.log('\n📊 Düzeltme İstatistikleri:')
    console.log(`✅ Başarıyla düzeltilen: ${fixedCount}`)
    console.log(`❌ Sipariş bulunamayan: ${notFoundCount}`)
    console.log(`📋 Toplam işlenen: ${hareketler.length}`)
    
    console.log('\n🎉 Eksik order_id düzeltme işlemi tamamlandı!')
    
  } catch (error) {
    console.error('❌ Düzeltme işlemi hatası:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Script'i çalıştır
fixMissingOrderIds()
