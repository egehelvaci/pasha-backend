// Isolated controller regression test; no database connection or writes.
require('ts-node/register/transpile-only');
const assert = require('node:assert/strict');
const prismaModule = require('../src/utils/prisma');
const original = prismaModule.default;
const deliveryAddress = { address: 'Müşterinin teslimat adresi' };
let order = {
  id: 'order-id', address: deliveryAddress,
  user: { Store: { store_id: 'customer-store', kurum_adi: 'BABUR HOME' } },
  items: [{ cut_type: 'rectangle' }]
};
let senderAddress = {
  id: '81de204a-5902-4c93-bb2d-bc055ab512d9',
  store_id: '4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5',
  title: 'Ana Mağaza',
  address: 'Güneşli, Mahmutbey Cd. No:145 D:147, 34212 Bağcılar/İstanbul',
  city: 'İSTANBUL', district: 'BAĞCILAR', postal_code: null,
  store: { kurum_adi: 'Gönderici mağaza', telefon: 'test-phone', eposta: 'test@example.invalid' }
};
let senderQueries = 0;
prismaModule.default = {
  order: { findUnique: async () => order },
  storeAddress: { findFirst: async args => {
    senderQueries++;
    assert.deepEqual(args.where, {
      store_id: '4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5',
      is_default: true, is_active: true, store: { is_active: true }
    });
    return senderAddress;
  } }
};
const { AdminOrderController } = require('../src/admin/admin-order-controller');
const controller = new AdminOrderController();
async function request(expectedStatus = 200) {
  let payload;
  await controller.getOrderById({ params: { orderId: 'order-id' } }, {
    status(code) { assert.equal(code, expectedStatus); return this; },
    json(body) { payload = body; return this; }
  });
  return payload;
}
async function run() {
  const first = await request();
  assert.equal(first.data.sender_info.address, senderAddress.address);
  assert.equal(first.data.sender_info.address_id, senderAddress.id);
  assert.equal(first.data.sender_info.kurum_adi, senderAddress.store.kurum_adi);
  assert.equal(first.data.sender_info.postal_code, null);
  assert.deepEqual(first.data.address, deliveryAddress);
  assert.equal(first.data.store_info.store_id, 'customer-store');
  assert.equal(first.data.items[0].cut_type, 'standart');
  senderAddress.address = 'Güncellenmiş ana mağaza adresi';
  assert.equal((await request()).data.sender_info.address, senderAddress.address);
  senderAddress = null;
  assert.equal((await request()).data.sender_info, null);
  order = null;
  assert.equal((await request(404)).success, false);
  assert.equal(senderQueries, 3);
  console.log('Order sender info regression tests passed.');
}
run().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => { prismaModule.default = original; });
