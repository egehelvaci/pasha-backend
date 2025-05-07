import { CollectionService } from './collection-service'

const collectionService = new CollectionService()

async function testCollectionService() {
  try {
    console.log('Koleksiyon Servisi Testi Başlatılıyor...')
    
    // Örnek koleksiyonlar oluştur
    const collection1 = await collectionService.createCollection({
      name: 'Yaz Koleksiyonu 2025',
      description: 'Yaz mevsimi için özel tasarımlar',
      code: 'YAZ2025'
    })
    console.log('Koleksiyon 1 oluşturuldu:', collection1)
    
    const collection2 = await collectionService.createCollection({
      name: 'Kış Koleksiyonu 2025',
      description: 'Kış mevsimi için özel tasarımlar',
      code: 'KIS2025'
    })
    console.log('Koleksiyon 2 oluşturuldu:', collection2)
    
    // Tüm koleksiyonları listele
    console.log('\nTüm koleksiyonlar:')
    const allCollections = await collectionService.getAllCollections()
    console.log(allCollections)
    
    // ID ile koleksiyon getir
    console.log('\nID ile koleksiyon getirme:')
    const collectionById = await collectionService.getCollectionById(collection1.collectionId)
    console.log(collectionById)
    
    // Kod ile koleksiyon getir
    console.log('\nKod ile koleksiyon getirme:')
    const collectionByCode = await collectionService.getCollectionByCode('KIS2025')
    console.log(collectionByCode)
    
    // Koleksiyon güncelle
    console.log('\nKoleksiyon güncelleme:')
    const updatedCollection = await collectionService.updateCollection(collection1.collectionId, {
      description: 'Yaz mevsimi için yenilenen özel tasarımlar'
    })
    console.log(updatedCollection)
    
    // Güncellenmiş koleksiyon listesi
    console.log('\nGüncellenmiş koleksiyon listesi:')
    const updatedCollections = await collectionService.getAllCollections()
    console.log(updatedCollections)
    
    // Bir koleksiyonu deaktif et
    console.log('\nKoleksiyon deaktif etme:')
    const deactivatedCollection = await collectionService.deactivateCollection(collection2.collectionId)
    console.log(deactivatedCollection)
    
    // Sadece aktif koleksiyonları listele
    console.log('\nSadece aktif koleksiyonlar:')
    const activeCollections = await collectionService.getAllCollections(true)
    console.log(activeCollections)
    
  } catch (error) {
    console.error('Test sırasında hata oluştu:', error)
  }
}

testCollectionService() 