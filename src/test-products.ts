import { ProductService } from './product-service'
import { CollectionService } from './collection-service'

const productService = new ProductService()
const collectionService = new CollectionService()

async function testProductsWithCollections() {
  try {
    console.log('Ürün ve Koleksiyon İlişkisi Testi Başlatılıyor...')
    
    // Örnek bir koleksiyon oluştur
    const collection = await collectionService.createCollection({
      name: 'Test Koleksiyonu',
      description: 'Test koleksiyonu açıklaması',
      code: 'TEST-KOL'
    })
    console.log('Test koleksiyonu oluşturuldu:', collection)
    
    // Koleksiyona ait ürünler oluştur
    const product1 = await productService.createProduct({
      name: 'Ürün 1',
      description: 'Birinci test ürün açıklaması',
      price: 149.99,
      stock: 100,
      width: 10.5,
      height: 20.5,
      cut: true,
      productImage: 'https://example.com/urun1.jpg',
      collectionId: collection.collectionId,
      currency: 'TRY'
    })
    console.log('Ürün 1 oluşturuldu:', product1)
    
    const product2 = await productService.createProduct({
      name: 'Ürün 2',
      description: 'İkinci test ürün açıklaması',
      price: 249.99,
      stock: 50,
      width: 15.0,
      height: 25.0,
      cut: false,
      productImage: 'https://example.com/urun2.jpg',
      collectionId: collection.collectionId,
      currency: 'USD'
    })
    console.log('Ürün 2 oluşturuldu:', product2)
    
    // Koleksiyona ait tüm ürünleri getir
    console.log('\nKoleksiyona ait tüm ürünler:')
    const collectionProducts = await productService.getProductsByCollection(collection.collectionId)
    console.log(collectionProducts)
    
    // Seçilen bir ürünü güncelle
    console.log('\nÜrün 1 güncelleniyor:')
    const updatedProduct = await productService.updateProduct(product1.productId, {
      price: 159.99,
      stock: 95,
      productImage: 'https://example.com/urun1-updated.jpg'
    })
    console.log('Güncellenmiş ürün 1:', updatedProduct)
    
    // Ürün stoğunu güncelle
    console.log('\nÜrün 2 stoğu güncelleniyor:')
    const updatedStock = await productService.updateStock(product2.productId, -10) // 10 adet azalt
    console.log('Güncellenmiş stok:', updatedStock)
    
    // Bir ürünü farklı koleksiyona taşıma testi için yeni koleksiyon
    const newCollection = await collectionService.createCollection({
      name: 'Yeni Koleksiyon',
      description: 'Yeni test koleksiyonu',
      code: 'YENI-KOL'
    })
    console.log('\nYeni koleksiyon oluşturuldu:', newCollection)
    
    // Ürünü farklı koleksiyona taşı
    console.log('\nÜrün 2 yeni koleksiyona taşınıyor:')
    const movedProduct = await productService.updateProduct(product2.productId, {
      collectionId: newCollection.collectionId
    })
    console.log('Taşınan ürün 2:', movedProduct)
    
    // Tekrar koleksiyonlara ait ürünleri kontrol et
    console.log('\nİlk koleksiyona ait ürünler:')
    const firstCollectionProducts = await productService.getProductsByCollection(collection.collectionId)
    console.log(firstCollectionProducts)
    
    console.log('\nYeni koleksiyona ait ürünler:')
    const newCollectionProducts = await productService.getProductsByCollection(newCollection.collectionId)
    console.log(newCollectionProducts)
    
    // Ürün silme örneği
    console.log('\nÜrün silme:')
    const deletedProduct = await productService.deleteProduct(product1.productId)
    console.log('Silinen ürün:', deletedProduct)
    
    // Tüm ürünlerin son durumu
    console.log('\nTüm ürünlerin son durumu:')
    const allProducts = await productService.getAllProducts()
    console.log(allProducts)
    
  } catch (error) {
    console.error('Test sırasında hata oluştu:', error)
  }
}

testProductsWithCollections() 