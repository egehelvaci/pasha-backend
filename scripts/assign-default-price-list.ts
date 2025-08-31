import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function assignDefaultPriceListToStores() {
  try {
    console.log('🔍 Fiyat listesi olmayan mağazalar tespit ediliyor...')
    
    // Fiyat listesi olmayan mağazaları bul
    const storesWithoutPriceList = await prisma.store.findMany({
      where: {
        is_active: true,
        StorePriceList: {
          none: {}
        }
      },
      select: {
        store_id: true,
        kurum_adi: true
      }
    })

    console.log(`📊 Fiyat listesi olmayan mağaza sayısı: ${storesWithoutPriceList.length}`)
    
    if (storesWithoutPriceList.length === 0) {
      console.log('✅ Tüm mağazalarda fiyat listesi mevcut!')
      return
    }

    // Varsayılan fiyat listesini bul
    console.log('🔍 Varsayılan fiyat listesi aranıyor...')
    const defaultPriceList = await prisma.priceList.findFirst({
      where: { 
        is_default: true,
        is_active: true 
      }
    })

    if (!defaultPriceList) {
      console.error('❌ Varsayılan fiyat listesi bulunamadı!')
      console.log('💡 Önce bir fiyat listesini varsayılan olarak işaretleyin (is_default: true)')
      return
    }

    console.log(`📋 Varsayılan fiyat listesi bulundu: ${defaultPriceList.name}`)
    console.log(`🔄 ${storesWithoutPriceList.length} mağazaya fiyat listesi atanıyor...`)

    // Toplu atama işlemi
    const assignments = storesWithoutPriceList.map(store => ({
      store_id: store.store_id,
      price_list_id: defaultPriceList.price_list_id
    }))

    const result = await prisma.storePriceList.createMany({
      data: assignments,
      skipDuplicates: true // Duplicate kayıtları atla
    })

    console.log(`✅ ${result.count} mağazaya varsayılan fiyat listesi başarıyla atandı!`)
    
    // Atanan mağazaları listele
    console.log('\n📋 Fiyat listesi atanan mağazalar:')
    storesWithoutPriceList.forEach((store, index) => {
      console.log(`${index + 1}. ${store.kurum_adi} (${store.store_id})`)
    })

  } catch (error) {
    console.error('❌ Hata oluştu:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Script çalıştır
assignDefaultPriceListToStores()
  .then(() => {
    console.log('\n🎉 İşlem tamamlandı!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script hatası:', error)
    process.exit(1)
  })