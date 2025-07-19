import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    console.log('🔧 Test siparişi oluşturuluyor...');
    
    // Test kullanıcısını bul
    const testUser = await prisma.user.findFirst({
      where: {
        name: 'Test Admin'
      },
      include: {
        Store: true
      }
    });
    
    if (!testUser) {
      console.log('❌ Test kullanıcısı bulunamadı!');
      return;
    }
    
    console.log(`👤 Test kullanıcısı: ${testUser.name} ${testUser.surname}`);
    console.log(`🏪 Mağaza: ${testUser.Store?.kurum_adi || 'Mağaza yok'}`);
    
    // DENEME ürününü bul
    const demoProduct = await prisma.product.findFirst({
      where: {
        name: 'DENEME'
      }
    });
    
    if (!demoProduct) {
      console.log('❌ DENEME ürünü bulunamadı!');
      return;
    }
    
    console.log(`📦 DENEME ürünü: ${demoProduct.productId}`);
    
    // Test sepeti oluştur
    const testCart = await prisma.carts.create({
      data: {
        user_id: testUser.userId,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log(`🛒 Test sepeti oluşturuldu: ${testCart.id}`);
    
    // Sepete ürün ekle
    const cartItem = await prisma.cart_items.create({
      data: {
        cart_id: testCart.id,
        product_id: demoProduct.productId,
        quantity: 3,
        unit_price: 504,
        total_price: 1512,
        has_fringe: true,
        width: 80,
        height: 100,
        cut_type: 'rectangle',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log(`📦 Sepete ürün eklendi: ${cartItem.id}`);
    console.log(`  - Adet: ${cartItem.quantity}`);
    console.log(`  - Boyut: ${cartItem.width}x${cartItem.height}`);
    console.log(`  - Saçak: ${cartItem.has_fringe ? 'Evet' : 'Hayır'}`);
    console.log(`  - Birim fiyat: ${cartItem.unit_price} TL`);
    console.log(`  - Toplam fiyat: ${cartItem.total_price} TL`);
    
    // Sipariş oluştur
    const testOrder = await prisma.order.create({
      data: {
        user_id: testUser.userId,
        cart_id: testCart.id,
        total_price: 1512,
        status: 'PENDING',
        delivery_address: testUser.Store?.adres || '',
        store_name: testUser.Store?.kurum_adi || '',
        store_tax_number: testUser.Store?.vergi_numarasi || '',
        store_tax_office: testUser.Store?.vergi_dairesi || '',
        store_phone: testUser.Store?.telefon || '',
        store_email: testUser.Store?.eposta || '',
        store_fax: testUser.Store?.faks_numarasi || '',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log(`📦 Test siparişi oluşturuldu: ${testOrder.id}`);
    
    // Sipariş öğesi oluştur
    const orderItem = await prisma.orderItem.create({
      data: {
        order_id: testOrder.id,
        product_id: demoProduct.productId,
        quantity: 3,
        unit_price: 504,
        total_price: 1512,
        has_fringe: true,
        width: 80,
        height: 100,
        cut_type: 'rectangle'
      }
    });
    
    console.log(`📋 Sipariş öğesi oluşturuldu: ${orderItem.id}`);
    
    // Sepeti pasif yap
    await prisma.carts.update({
      where: { id: testCart.id },
      data: { is_active: false }
    });
    
    console.log(`🛒 Sepet pasif yapıldı`);
    
    console.log('\\n✅ Test siparişi başarıyla oluşturuldu!');
    console.log(`📦 Sipariş ID: ${testOrder.id}`);
    console.log(`📋 Öğe ID: ${orderItem.id}`);
    console.log(`💰 Toplam tutar: ${testOrder.total_price} TL`);
    console.log(`📊 Durum: ${testOrder.status}`);
    
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder(); 