import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function createDefaultAddresses() {
  try {
    console.log('🚀 Varsayılan mağaza adreslerini oluşturma işlemi başlatılıyor...')

    // Tüm mağazaları al
    const stores = await prisma.store.findMany({
      include: {
        addresses: true
      }
    })

    console.log(`📊 ${stores.length} mağaza bulundu.`)

    let createdCount = 0
    let skippedCount = 0

    for (const store of stores) {
      // Bu mağazanın zaten adresi var mı?
      if (store.addresses.length > 0) {
        console.log(`⏭️  ${store.kurum_adi} mağazasının zaten ${store.addresses.length} adresi var, atlanıyor.`)
        skippedCount++
        continue
      }

      // Store tablosundaki adres bilgisini kullan, yoksa varsayılan adres oluştur
      const address = store.adres && store.adres.trim() !== '' 
        ? store.adres 
        : 'Adres bilgisi güncellenmesi gerekiyor'

      const title = store.adres && store.adres.trim() !== ''
        ? `${store.kurum_adi} - Ana Adres`
        : `${store.kurum_adi} - Varsayılan Adres`

      // Yeni StoreAddress kaydı oluştur
      await prisma.storeAddress.create({
        data: {
          store_id: store.store_id,
          title: title,
          address: address,
          city: null,
          district: null,
          postal_code: null,
          is_default: true, // İlk adres her zaman varsayılan
          is_active: true
        }
      })

      console.log(`✅ ${store.kurum_adi} için adres oluşturuldu: "${address.substring(0, 50)}${address.length > 50 ? '...' : ''}"`)
      createdCount++
    }

    // Son durum kontrolü
    const storesWithAddresses = await prisma.store.findMany({
      include: {
        addresses: true
      }
    })

    console.log('\n📈 Adres Oluşturma Özeti:')
    console.log('=' .repeat(50))
    console.log(`✅ ${createdCount} yeni adres oluşturuldu`)
    console.log(`⏭️  ${skippedCount} mağaza atlandı`)
    
    console.log('\nMağaza bazında adresler:')
    for (const store of storesWithAddresses) {
      console.log(`${store.kurum_adi}: ${store.addresses.length} adres`)
      if (store.addresses.length > 0) {
        for (const addr of store.addresses) {
          const isDefault = addr.is_default ? ' (Varsayılan)' : ''
          console.log(`  - ${addr.title}${isDefault}: ${addr.address.substring(0, 60)}${addr.address.length > 60 ? '...' : ''}`)
        }
      }
    }

    console.log('\n🎉 Varsayılan adres oluşturma işlemi tamamlandı!')

  } catch (error) {
    console.error('❌ Varsayılan adres oluşturma hatası:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Script'i çalıştır
if (require.main === module) {
  createDefaultAddresses()
    .then(() => {
      console.log('Varsayılan adres oluşturma başarıyla tamamlandı!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Varsayılan adres oluşturma hatası:', error)
      process.exit(1)
    })
}

export { createDefaultAddresses }