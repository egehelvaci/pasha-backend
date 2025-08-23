import { PrismaClient } from '../generated/prisma'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function runRestoreAddresses() {
  try {
    console.log('🚀 Mağaza adreslerini geri yükleme işlemi başlatılıyor...')

    // SQL dosyasını oku
    const sqlPath = path.join(__dirname, 'restore-addresses.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // SQL komutlarını ayır ve çalıştır
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    for (const statement of sqlStatements) {
      if (statement.toLowerCase().includes('select')) {
        // SELECT sorguları için sonuç göster
        const result = await prisma.$queryRawUnsafe(statement)
        console.log('📊 Sorgu sonucu:', result)
      } else if (statement.toLowerCase().includes('insert')) {
        // INSERT sorguları çalıştır
        await prisma.$executeRawUnsafe(statement)
        console.log('✅ INSERT işlemi tamamlandı')
      }
    }

    // Son durum kontrolü
    const totalAddresses = await prisma.storeAddress.count()
    const storesWithAddresses = await prisma.store.findMany({
      include: {
        addresses: true
      }
    })

    console.log('\n📈 Adres Geri Yükleme Özeti:')
    console.log('=' .repeat(50))
    console.log(`Toplam adres sayısı: ${totalAddresses}`)
    
    console.log('\nMağaza bazında adresler:')
    for (const store of storesWithAddresses) {
      console.log(`${store.kurum_adi}: ${store.addresses.length} adres`)
      if (store.addresses.length > 0) {
        for (const addr of store.addresses) {
          console.log(`  - ${addr.title}: ${addr.address.substring(0, 50)}${addr.address.length > 50 ? '...' : ''}`)
        }
      }
    }

    console.log('\n🎉 Adres geri yükleme işlemi tamamlandı!')

  } catch (error) {
    console.error('❌ Adres geri yükleme hatası:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Script'i çalıştır
if (require.main === module) {
  runRestoreAddresses()
    .then(() => {
      console.log('Adres geri yükleme başarıyla tamamlandı!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Adres geri yükleme hatası:', error)
      process.exit(1)
    })
}

export { runRestoreAddresses }