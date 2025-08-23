import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function migrateUserAddresses() {
  try {
    console.log('🚀 Kullanıcı adreslerini StoreAddress tablosuna kopyalama işlemi başlatılıyor...')

    // Adresi olan kullanıcıları al
    const usersWithAddress = await prisma.user.findMany({
      where: {
        adres: {
          not: null
        },
        store_id: {
          not: null
        }
      },
      include: {
        Store: true
      }
    })

    console.log(`📊 ${usersWithAddress.length} kullanıcının adresi bulundu.`)

    let migratedCount = 0
    let skippedCount = 0

    for (const user of usersWithAddress) {
      if (!user.Store || !user.adres) {
        skippedCount++
        continue
      }

      // Bu mağaza için zaten varsayılan adres var mı kontrol et
      const existingDefaultAddress = await prisma.storeAddress.findFirst({
        where: {
          store_id: user.store_id!,
          is_default: true
        }
      })

      // Aynı adres zaten var mı kontrol et
      const existingAddress = await prisma.storeAddress.findFirst({
        where: {
          store_id: user.store_id!,
          address: user.adres
        }
      })

      if (existingAddress) {
        console.log(`⚠️  Mağaza ${user.Store.kurum_adi} için adres zaten mevcut, atlanıyor.`)
        skippedCount++
        continue
      }

      // Yeni StoreAddress kaydı oluştur
      await prisma.storeAddress.create({
        data: {
          store_id: user.store_id!,
          title: existingDefaultAddress ? `${user.Store.kurum_adi} - Adres ${migratedCount + 1}` : 'Ana Adres',
          address: user.adres,
          city: null, // Mevcut adresten şehir bilgisi çıkarılamaz
          district: null, // Mevcut adresten ilçe bilgisi çıkarılamaz
          postal_code: null, // Mevcut adresten posta kodu bilgisi çıkarılamaz
          is_default: !existingDefaultAddress, // İlk adres varsayılan olsun
          is_active: true
        }
      })

      console.log(`✅ ${user.Store.kurum_adi} mağazası için adres kopyalandı: "${user.adres}"`)
      migratedCount++
    }

    // Mağaza bazında özet göster
    const storeAddressCounts = await prisma.$queryRaw<Array<{store_id: string, kurum_adi: string, address_count: bigint}>>`
      SELECT 
        s.store_id,
        s.kurum_adi,
        COUNT(sa.id) as address_count
      FROM "Store" s
      LEFT JOIN "store_addresses" sa ON s.store_id = sa.store_id
      WHERE sa.id IS NOT NULL
      GROUP BY s.store_id, s.kurum_adi
      ORDER BY s.kurum_adi
    `

    console.log('\n📈 Mağaza Adres Özeti:')
    console.log('=' .repeat(50))
    for (const store of storeAddressCounts) {
      console.log(`${store.kurum_adi}: ${store.address_count} adres`)
    }

    console.log('\n🎉 Migration tamamlandı!')
    console.log(`✅ ${migratedCount} adres kopyalandı`)
    console.log(`⏭️  ${skippedCount} adres atlandı`)

  } catch (error) {
    console.error('❌ Migration hatası:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Script'i çalıştır
if (require.main === module) {
  migrateUserAddresses()
    .then(() => {
      console.log('Migration başarıyla tamamlandı!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration hatası:', error)
      process.exit(1)
    })
}

export { migrateUserAddresses }