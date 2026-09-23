// Explicit integration test: all database writes are rolled back, including on failure.
// Run: node scripts/test-purchase-pricing.cjs --run
if (!process.argv.includes('--run')) throw new Error('Pass --run to execute the rollback integration test');
require('dotenv').config({ quiet: true });
require('ts-node/register/transpile-only');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const prismaModule = require('../src/utils/prisma');
const prisma = prismaModule.default;
const { CollectionService } = require('../src/collection-service');
const router = require('../src/routes/purchasePriceListRoutes').default;
const rollback = new Error('EXPECTED_TEST_ROLLBACK');
const marker = `pricing-test-${randomUUID()}`;
let server;
let assertions = 0;

async function main() {
  assert.ok(process.env.JWT_SECRET, 'JWT_SECRET must be configured');
  try {
    await prisma.$transaction(async tx => {
      prismaModule.default = new Proxy(tx, {
        get(target, key) { return key === '$transaction' ? callback => callback(tx) : target[key]; }
      });
      const userType = await tx.userType.findFirstOrThrow({ where: { name: 'admin' } });
      const user = await tx.user.create({ data: {
        username: marker, email: `${marker}@example.invalid`, name: marker,
        surname: 'Test', password: 'disabled-test-login', userTypeId: userType.id
      } });
      const supplier = await tx.supplier.findUniqueOrThrow({
        where: { id: '5f6c42ae-a4c9-47c6-a9c8-d8b02be4875f' }
      });
      const collection = await new CollectionService().createCollection({ name: marker, code: marker });
      const detail = await tx.purchasePriceListDetail.findFirstOrThrow({ where: { collection_id: collection.collectionId } });
      assert.equal(detail.price_per_square_meter.toString(), '1'); assertions++;
      const product = await tx.product.create({ data: { name: marker, description: marker, collectionId: collection.collectionId } });
      const app = express();
      app.use(express.json());
      app.use('/api/admin/purchase-management', router);
      server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
      const base = `http://127.0.0.1:${server.address().port}/api/admin/purchase-management`;
      const token = jwt.sign({ userId: user.userId, username: user.username, userType: 'admin' }, process.env.JWT_SECRET, { expiresIn: '5m' });
      async function request(path, method = 'GET', body, expected = 200) {
        const response = await fetch(base + path, {
          method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: body === undefined ? undefined : JSON.stringify(body)
        });
        const json = await response.json();
        assert.equal(response.status, expected, JSON.stringify(json)); assertions++;
        return json;
      }
      const path = `/suppliers/${supplier.id}/purchase-cart`;
      const input = { productId: product.productId, quantity: 2, width: 100, height: 200, hasFringe: false, cutType: 'rectangle' };
      const first = await request(path + '/items', 'POST', input, 201);
      assert.equal(Number(first.data.total_price), 4); assertions++;
      await request(`/purchase-price-lists/${detail.purchase_price_list_id}/collections/${collection.collectionId}`, 'PUT', { price_per_square_meter: 2.5 });
      const merged = await request(path + '/items', 'POST', input, 201);
      assert.equal(merged.data.id, first.data.id);
      assert.equal(merged.data.quantity, 4);
      assert.equal(Number(merged.data.unit_price), 2.5);
      assert.equal(Number(merged.data.total_price), 20); assertions += 4;
      const updated = await request(path + `/items/${first.data.id}`, 'PUT', { quantity: 3, width: 200, height: 300 });
      assert.equal(Number(updated.data.total_price), 45); assertions++;
      const cart = await request(path);
      assert.equal(cart.data.total.amount, 45); assertions++;
      await request(path + `/items/${first.data.id}`, 'DELETE');
      assert.equal((await request(path)).data.total.amount, 0); assertions++;

      const products = await tx.product.findMany({
        where: { collection: { code: { in: ['DB', 'VL', 'STİL', 'FL', 'SAL', 'SSP', 'NL', 'EL'] } } },
        distinct: ['collectionId'], select: { productId: true }
      });
      assert.equal(products.length, 8); assertions++;
      for (const item of products) {
        const added = await request(path + '/items', 'POST', { ...input, productId: item.productId }, 201);
        assert.ok(Number(added.data.unit_price) > 0); assertions++;
      }
      // An absent row is repaired once; repeated reads preserve an edited price.
      await tx.purchasePriceListDetail.delete({ where: { id: detail.id } });
      await request('/purchase-price-lists');
      const repaired = await tx.purchasePriceListDetail.findFirstOrThrow({ where: { collection_id: collection.collectionId } });
      assert.equal(Number(repaired.price_per_square_meter), 1); assertions++;
      await request(`/purchase-price-lists/${detail.purchase_price_list_id}/collections/${collection.collectionId}`, 'PUT', { price_per_square_meter: 3.75 });
      for (const listPath of ['/purchase-price-lists/default', `/purchase-price-lists/${detail.purchase_price_list_id}`]) {
        const list = await request(listPath);
        assert.equal(Number(list.data.details.find(d => d.collection_id === collection.collectionId).price_per_square_meter), 3.75); assertions++;
      }
      assert.equal((await tx.supplier.findUniqueOrThrow({ where: { id: supplier.id } })).balance.toString(), supplier.balance.toString()); assertions++;
      throw rollback;
    }, { timeout: 120000, maxWait: 10000 });
  } catch (error) {
    if (error !== rollback) throw error;
  } finally {
    prismaModule.default = prisma;
    if (server) await new Promise(resolve => server.close(resolve));
  }
  assert.equal(await prisma.user.count({ where: { username: marker } }), 0);
  assert.equal(await prisma.collection.count({ where: { code: marker } }), 0);
  assert.equal(await prisma.product.count({ where: { name: marker } }), 0);
  console.log(JSON.stringify({ assertions: assertions + 3, rollbackVerified: true, status: 'PASS' }));
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
