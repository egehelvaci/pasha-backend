// Isolated HTTP regression tests; never connects to a database.
require('ts-node/register/transpile-only');
process.env.JWT_SECRET = 'isolated-order-list-test-secret';
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const prismaModule = require('../src/utils/prisma');
const original = prismaModule.default;
let queries = [];
const fixtures = Array.from({ length: 25 }, (_, i) => ({
  id: String(25 - i), status: 'READY', user_id: 'test-user',
  user: { Store: null }, items: [{ cut_type: 'rectangle' }]
}));
prismaModule.default = {
  order: {
    findMany: async args => {
      queries.push(args);
      assert.equal(args.include.user.select.password, undefined);
      assert.deepEqual(args.orderBy, [{ created_at: 'desc' }, { id: 'desc' }]);
      return fixtures.filter(x => x.status === args.where.status && (!args.where.user_id || x.user_id === args.where.user_id)).slice(args.skip, args.skip + args.take);
    },
    count: async ({ where }) => fixtures.filter(x => x.status === where.status && (!where.user_id || x.user_id === where.user_id)).length,
    groupBy: async () => [{ status: 'READY', _count: { id: 25 } }]
  },
  $transaction: async queries => Promise.all(queries)
};
const { authMiddleware } = require('../src/auth/auth-middleware');
const router = require('../src/admin/order-list-v2-routes').default;
const app = express();
app.use('/api/admin/orders-v2', authMiddleware, router);
let server;
let checks = 0;
async function run() {
  server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  async function request(query, expected = 200, role = 'admin') {
    const headers = role ? { Authorization: `Bearer ${jwt.sign({ userId: 'test-user', userType: role }, process.env.JWT_SECRET)}` } : {};
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/orders-v2${query}`, { headers });
    assert.equal(response.status, expected); checks++;
    return response.json();
  }
  await request('?status=READY', 401, null);
  await request('?status=READY', 403, 'customer');
  for (const query of ['', '?status=ALL', '?status=ready', '?status=READY&status=PENDING', '?status=READY&page=0', '?status=READY&page=-1', '?status=READY&page=1.5', '?status=READY&page=9007199254740991', '?status=READY&limit=101', '?status=READY&limit=0', '?status=READY&limit=abc', '?status=READY&userId=']) {
    await request(query, 400);
  }
  assert.equal(queries.length, 0); checks++;
  const first = await request('?status=READY');
  assert.equal(first.data.orders.length, 20);
  assert.deepEqual(first.data.pagination, { page: 1, limit: 20, totalCount: 25, totalPages: 2, hasNext: true, hasPrev: false });
  assert.equal(first.data.orders[0].items[0].cut_type, 'standart'); checks += 3;
  const second = await request('?status=READY&page=2', 200, 'editor');
  assert.equal(second.data.orders.length, 5);
  assert.ok(!second.data.orders.some(x => first.data.orders.some(y => y.id === x.id))); checks += 2;
  const empty = await request('?status=PENDING');
  assert.equal(empty.data.pagination.totalCount, 0);
  assert.deepEqual(empty.data.orders, []); checks += 2;
  assert.equal((await request('?status=READY&userId=another-user')).data.pagination.totalCount, 0); checks++;
  assert.equal((await request('?status=READY&page=3')).data.orders.length, 0); checks++;
  const statuses = await request('/statuses');
  assert.equal(statuses.data.length, 6);
  assert.equal(statuses.data.find(x => x.status === 'READY').count, 25);
  assert.equal(statuses.data.find(x => x.status === 'PENDING').count, 0); checks += 3;
  console.log(JSON.stringify({ status: 'PASS', checks, databaseWrites: 0 }));
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  prismaModule.default = original;
  if (server) await new Promise(resolve => server.close(resolve));
  await original.$disconnect();
});
