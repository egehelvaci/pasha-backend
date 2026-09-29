// Isolated controller regression tests; no database queries or writes.
require('ts-node/register/transpile-only');
const assert = require('node:assert/strict');
const prismaModule = require('../src/utils/prisma');
const original = prismaModule.default;
const storeId = '4fdd87dd-f52a-4f6a-b532-5d707b5eb5e5';
const otherStoreId = '11111111-1111-1111-1111-111111111111';
const fixtures = Array.from({ length: 65 }, (_, i) => ({
  id: String(i), status: i < 40 ? 'DELIVERED' : 'READY',
  user_id: i < 25 ? 'customer' : 'other-customer',
  user: { store_id: i < 25 || i >= 40 ? storeId : otherStoreId, Store: null },
  items: [{ cut_type: 'rectangle' }]
}));
let queries = [];
const matching = where => fixtures.filter(order =>
  (!where.status || order.status === where.status) &&
  (!where.user_id || order.user_id === where.user_id) &&
  (!where.user || order.user.store_id === where.user.store_id));
prismaModule.default = { order: {
  findMany: async args => {
    queries.push(args);
    return matching(args.where).slice(args.skip, args.skip + args.take);
  },
  count: async ({ where }) => {
    assert.deepEqual(where, queries.at(-1).where);
    return matching(where).length;
  },
  groupBy: async args => {
    assert.equal(args.where, undefined);
    return [{ status: 'DELIVERED', _count: { id: 40 } }, { status: 'READY', _count: { id: 25 } }];
  }
} };
const { AdminOrderController } = require('../src/admin/admin-order-controller');
const controller = new AdminOrderController();
async function request(query, expected = 200) {
  let code, payload;
  await controller.getAllOrders({ query }, {
    status(value) { code = value; return this; },
    json(body) { payload = body; return this; }
  });
  assert.equal(code, expected, JSON.stringify(payload));
  return payload.data;
}
async function run() {
  const filters = { page: '1', limit: '20', store_id: storeId, order_statu: 'delivered' };
  const first = await request(filters);
  assert.equal(first.orders.length, 20);
  assert.deepEqual(first.pagination, { page: 1, limit: 20, totalCount: 25, totalPages: 2, hasNext: true, hasPrev: false });
  assert.ok(first.orders.every(order => order.status === 'DELIVERED' && order.user.store_id === storeId));
  assert.equal(first.orders[0].items[0].cut_type, 'standart');
  assert.equal(first.statistics.totalOrders, 65);
  const second = await request({ ...filters, page: '2' });
  assert.equal(second.orders.length, 5);
  assert.equal(second.pagination.hasNext, false);
  assert.ok(second.orders.every(order => !first.orders.some(previous => previous.id === order.id)));
  assert.equal((await request({ ...filters, page: '3' })).orders.length, 0);
  assert.equal((await request({ store_id: storeId })).pagination.totalCount, 50);
  assert.equal((await request({ order_statu: 'DeLiVeReD' })).pagination.totalCount, 40);
  assert.equal((await request({ status: 'DELIVERED' })).pagination.totalCount, 40);
  assert.equal((await request({ status: 'delivered', order_statu: 'DELIVERED' })).pagination.totalCount, 40);
  assert.equal((await request({ ...filters, userId: 'customer' })).pagination.totalCount, 25);
  const empty = await request({ ...filters, userId: 'other-customer' });
  assert.deepEqual(empty.orders, []);
  assert.equal(empty.pagination.totalCount, 0);
  assert.equal(empty.pagination.totalPages, 0);
  assert.equal((await request({ page: '1', limit: '20' })).pagination.totalCount, 65);
  const before = queries.length;
  for (const query of [
    { order_statu: 'unknown' }, { order_statu: '' }, { order_statu: ['delivered', 'ready'] },
    { status: { value: 'DELIVERED' } }, { status: 'READY', order_statu: 'delivered' },
    { store_id: '1234' }, { store_id: '' }, { store_id: [storeId] }, { store_id: { id: storeId } },
    { userId: ['customer'] }
  ]) await request(query, 400);
  assert.equal(queries.length, before);
  console.log('Admin order filter regression tests passed (no database access).');
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  prismaModule.default = original;
  await original.$disconnect();
});
