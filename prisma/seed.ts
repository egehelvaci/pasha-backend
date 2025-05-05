import { PrismaClient, UserType, Currency } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seed başlatılıyor...');

    // Kullanıcı tiplerini oluştur
    console.log('Kullanıcı tipleri oluşturuluyor...');
    const adminType = await prisma.userType.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin'
      }
    });

    const editorType = await prisma.userType.upsert({
      where: { name: 'editor' },
      update: {},
      create: {
        name: 'editor'
      }
    });

    const viewerType = await prisma.userType.upsert({
      where: { name: 'viewer' },
      update: {},
      create: {
        name: 'viewer'
      }
    });

    console.log('Kullanıcı tipleri oluşturuldu:', { adminType, editorType, viewerType });

    // Admin kullanıcısını oluştur
    console.log('Admin kullanıcısı oluşturuluyor...');
    const hashedPassword = await bcrypt.hash('gizli123', 10);
    const admin = await prisma.user.upsert({
      where: { username: 'testkullanici' },
      update: {},
      create: {
        username: 'testkullanici',
        password: hashedPassword,
        name: 'Test',
        surname: 'Admin',
        email: 'admin@example.com',
        phoneNumber: '+905551234567',
        userTypeId: adminType.id,
        avatar: 'https://ui-avatars.com/api/?name=Test+Admin'
      }
    });
    console.log('Admin kullanıcısı oluşturuldu:', admin);

    // Örnek koleksiyonlar oluştur
    console.log('Koleksiyonlar oluşturuluyor...');
    const summerCollection = await prisma.collection.upsert({
      where: { code: 'YAZ2024' },
      update: {},
      create: {
        name: 'Yaz Koleksiyonu 2024',
        description: 'Yaz sezonu için özel tasarımlar',
        code: 'YAZ2024',
        catalogOrder: 1,
        currency: Currency.TRY
      }
    });

    const winterCollection = await prisma.collection.upsert({
      where: { code: 'KIS2024' },
      update: {},
      create: {
        name: 'Kış Koleksiyonu 2024',
        description: 'Kış sezonu için özel tasarımlar',
        code: 'KIS2024',
        catalogOrder: 2,
        currency: Currency.TRY
      }
    });

    const specialCollection = await prisma.collection.upsert({
      where: { code: 'OZEL2024' },
      update: {},
      create: {
        name: 'Özel Koleksiyon 2024',
        description: 'Sınırlı sayıda üretim özel parçalar',
        code: 'OZEL2024',
        catalogOrder: 3,
        currency: Currency.USD
      }
    });

    console.log('Koleksiyonlar oluşturuldu:', { summerCollection, winterCollection, specialCollection });

    // Örnek ürünler oluştur
    console.log('Ürünler oluşturuluyor...');
    
    // Yaz koleksiyonu ürünleri
    const summerProducts = await Promise.all([
      prisma.product.upsert({
        where: { productId: '1' },
        update: {},
        create: {
          productId: '1',
          name: 'Pamuklu Yazlık Elbise',
          description: 'Havadar kumaşıyla sıcak yaz günleri için ideal',
          price: 299.99,
          stock: 50,
          barcode: 'YAZ001',
          quality: 'Premium',
          width: 120,
          height: 80,
          cut: false,
          productImage: 'https://example.com/images/yazlik-elbise.jpg',
          collectionId: summerCollection.collectionId
        }
      }),
      prisma.product.upsert({
        where: { productId: '2' },
        update: {},
        create: {
          productId: '2',
          name: 'Keten Gömlek',
          description: 'Doğal keten kumaştan yazlık gömlek',
          price: 199.99,
          stock: 75,
          barcode: 'YAZ002',
          quality: 'Premium',
          width: 90,
          height: 70,
          cut: true,
          productImage: 'https://example.com/images/keten-gomlek.jpg',
          collectionId: summerCollection.collectionId
        }
      })
    ]);

    // Kış koleksiyonu ürünleri
    const winterProducts = await Promise.all([
      prisma.product.upsert({
        where: { productId: '3' },
        update: {},
        create: {
          productId: '3',
          name: 'Yün Kazak',
          description: 'Sıcak tutan yün kazak',
          price: 349.99,
          stock: 40,
          barcode: 'KIS001',
          quality: 'Premium',
          width: 110,
          height: 70,
          cut: false,
          productImage: 'https://example.com/images/yun-kazak.jpg',
          collectionId: winterCollection.collectionId
        }
      }),
      prisma.product.upsert({
        where: { productId: '4' },
        update: {},
        create: {
          productId: '4',
          name: 'Polar Ceket',
          description: 'Soğuk günler için polar ceket',
          price: 449.99,
          stock: 30,
          barcode: 'KIS002',
          quality: 'Premium',
          width: 130,
          height: 85,
          cut: true,
          productImage: 'https://example.com/images/polar-ceket.jpg',
          collectionId: winterCollection.collectionId
        }
      })
    ]);

    // Özel koleksiyon ürünleri
    const specialProducts = await Promise.all([
      prisma.product.upsert({
        where: { productId: '5' },
        update: {},
        create: {
          productId: '5',
          name: 'Özel Tasarım Ceket',
          description: 'Sınırlı sayıda üretim lüks ceket',
          price: 99.99,
          stock: 10,
          barcode: 'OZEL001',
          quality: 'Lüks',
          width: 125,
          height: 80,
          cut: true,
          productImage: 'https://example.com/images/luks-ceket.jpg',
          collectionId: specialCollection.collectionId
        }
      }),
      prisma.product.upsert({
        where: { productId: '6' },
        update: {},
        create: {
          productId: '6',
          name: 'İpek Şal',
          description: 'El yapımı ipek şal',
          price: 59.99,
          stock: 15,
          barcode: 'OZEL002',
          quality: 'Lüks',
          width: 180,
          height: 60,
          cut: false,
          productImage: 'https://example.com/images/ipek-sal.jpg',
          collectionId: specialCollection.collectionId
        }
      })
    ]);

    console.log('Ürünler oluşturuldu:', {
      summerProducts,
      winterProducts,
      specialProducts
    });

    console.log('Seed işlemi başarıyla tamamlandı!');
  } catch (error) {
    console.error('Seed sırasında hata oluştu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main(); 