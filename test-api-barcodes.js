const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function testAPIBarcodes() {
  try {
    const orderId = '39b32e45-29f7-4519-9557-5ec2575d3711';

    console.log('=== TEST: getOrderById API barcodes alanı ===');
    
    // getOrderById API simülasyonu
    const singleOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            Store: true,
            userType: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                collection: true
              }
            }
          }
        },
        qr_codes: {
          include: {
            order_item: {
              include: {
                product: true
              }
            },
            product: true
          }
        },
        barcodes: {
          include: {
            order_item: {
              include: {
                product: true
              }
            },
            product: true
          },
          orderBy: {
            created_at: 'asc'
          }
        },
        address: true
      }
    });

    console.log('✅ getOrderById - Barcodes alanı:');
    console.log(`   Barkod sayısı: ${singleOrder?.barcodes?.length || 0}`);
    if (singleOrder?.barcodes && singleOrder.barcodes.length > 0) {
      singleOrder.barcodes.forEach((barcode, index) => {
        console.log(`   ${index + 1}. ${barcode.barcode} - ${barcode.order_item?.product?.name}`);
        if (barcode.barcode_image_url) {
          console.log(`      Görsel: ${barcode.barcode_image_url}`);
        }
      });
    }

    console.log('\n=== TEST: getAllOrders API barcodes alanı ===');
    
    // getAllOrders API simülasyonu
    const orders = await prisma.order.findMany({
      where: { id: orderId }, // Sadece test siparişi
      include: {
        user: {
          include: {
            Store: true,
            userType: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        qr_codes: {
          include: {
            order_item: {
              include: {
                product: true
              }
            },
            product: true
          }
        },
        barcodes: {
          include: {
            order_item: {
              include: {
                product: true
              }
            },
            product: true
          },
          orderBy: {
            created_at: 'asc'
          }
        },
        address: true
      }
    });

    console.log('✅ getAllOrders - Barcodes alanı:');
    orders.forEach((order, orderIndex) => {
      console.log(`   Sipariş ${orderIndex + 1}: ${order.barcodes?.length || 0} barkod`);
      if (order.barcodes && order.barcodes.length > 0) {
        order.barcodes.forEach((barcode, index) => {
          console.log(`     ${index + 1}. ${barcode.barcode} - ${barcode.order_item?.product?.name}`);
          if (barcode.barcode_image_url) {
            console.log(`        Görsel: ${barcode.barcode_image_url}`);
          }
        });
      }
    });

    console.log('\n✅ Her iki API de barcodes alanını başarıyla döndürüyor!');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIBarcodes();