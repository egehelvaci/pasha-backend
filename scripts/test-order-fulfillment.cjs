// Creates a unique isolated PostgreSQL schema, exercises real transactions and
// concurrent HTTP requests, then removes only that test schema. No CDN writes.
if (!process.argv.includes('--run')) throw new Error('Pass --run to execute the isolated integration test');
require('dotenv').config({ quiet: true });
require('ts-node/register/transpile-only');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');
const { OrderFulfillmentService, createFulfillmentImage } = require('../src/services/order-fulfillment-service');
const { createAdvanceOrderHandler } = require('../src/admin/order-fulfillment-controller');
const { authMiddleware, authorizeRoles } = require('../src/auth/auth-middleware');
const { UploadService } = require('../src/utils/upload-service');
const globalDb = require('../src/utils/prisma').default;
const schema = 'fulfillment_test_' + randomUUID().replaceAll('-', '');
const url = new URL(process.env.DATABASE_URL);
url.searchParams.set('schema', schema);
const client = new PrismaClient({ datasources: { db: { url: url.toString() } } });
const db = new Proxy(client, { get(target, key) {
  if (key !== '$transaction') return target[key];
  return (callback, options) => target.$transaction(async tx => {
    await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schema}"`);
    return callback(tx);
  }, options);
} });
let server, created = false, checks = 0, imageCalls = 0;
let failImage = false, failReceipt = false;
let gate = null;
const service = new OrderFulfillmentService({ db, image: async () => {
  imageCalls++;
  if (gate) { const currentGate = gate; gate = null; currentGate.enter(); await currentGate.wait; }
  if (failImage) throw Error('Simulated CDN failure');
  return `https://example.invalid/${randomUUID()}.png`;
} });
const goodReceipt = service.receipt;
service.receipt = async (...args) => { if (failReceipt) throw Error('Simulated receipt failure'); return goodReceipt(...args); };

async function run() {
  assert.ok(process.env.JWT_SECRET);
  const output = path.resolve(__dirname, '../.tmp/fulfillment-test-schema.sql');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const generated = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'diff', '--from-empty', '--to-schema-datamodel', path.resolve(__dirname, '../prisma/schema.prisma'), '--script', '--output', output], { encoding: 'utf8' });
  assert.equal(generated.status, 0, generated.stderr);
  const statements = fs.readFileSync(output, 'utf8').split(';').filter(statement => statement.trim());
  await client.$transaction(async tx => {
    await tx.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schema}"`);
    // Exercise the actual additive migration, not just Prisma's generated table.
    for (const sql of statements.filter(sql => !sql.includes('order_fulfillment_actions'))) await tx.$executeRawUnsafe(sql);
    const migration = fs.readFileSync(path.resolve(__dirname, '../prisma/migrations/20260924010000_order_fulfillment/migration.sql'), 'utf8');
    for (const sql of migration.split(';').filter(sql => sql.trim())) await tx.$executeRawUnsafe(sql);
  }, { timeout: 120000 });
  created = true;
  const type = await client.userType.create({ data: { name: 'admin' } });
  const store = await client.store.create({ data: { kurum_adi: 'Isolated test', bakiye: 1234 } });
  const user = await client.user.create({ data: { username: randomUUID(), email: `${randomUUID()}@example.invalid`, name: 'Test', surname: 'Admin', password: 'disabled', userTypeId: type.id, store_id: store.store_id } });
  const collection = await client.collection.create({ data: { name: 'Test', code: randomUUID() } });
  const product = await client.product.create({ data: { name: 'Test product', description: 'Test', collectionId: collection.collectionId } });
  const stock = await client.productvariations.create({ data: { product_id: product.productId, width: 100, height: 200, stock_quantity: 20, stock_area_m2: 40 } });
  const newOrder = async (status = 'PENDING', printed = false) => client.order.create({ data: {
    user_id: user.userId, total_price: 100, status, receipt_printed: printed,
    items: { create: [
      { product_id: product.productId, quantity: 2, unit_price: 10, total_price: 20, width: 100, height: 200 },
      { product_id: product.productId, quantity: 4, unit_price: 20, total_price: 80, width: 80, height: 100 }
    ] }
  }, include: { items: true } });
  const app = express(); app.use(express.json());
  app.post('/api/admin/orders/:orderId/advance', authMiddleware, authorizeRoles('admin'), createAdvanceOrderHandler(service));
  server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  async function request(orderId, body, expected = 200, role = 'admin') {
    const headers = { 'Content-Type': 'application/json' };
    if (role) headers.Authorization = 'Bearer ' + jwt.sign({ userId: user.userId, userType: role }, process.env.JWT_SECRET);
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/orders/${orderId}/advance`, { method: 'POST', headers, body: JSON.stringify(body) });
    const result = await response.json(); assert.equal(response.status, expected, JSON.stringify(result)); checks++;
    return result;
  }
  const payload = (expectedStatus = 'PENDING', targetStatus = 'DELIVERED') => ({ requestId: randomUUID(), expectedStatus, targetStatus, reason: 'Admin completion test' });
  const order = await newOrder(); const body = payload();
  await request(order.id, body, 401, null);
  await request(order.id, body, 403, 'editor');
  await request(order.id, { targetStatus: 'DELIVERED' }, 400);
  await request(order.id, { ...body, targetStatus: 'CANCELED' }, 400);
  const completed = (await request(order.id, body)).data;
  assert.equal(completed.order.status, 'DELIVERED'); checks++;
  assert.equal(completed.order.receipt_printed, false); checks++;
  assert.equal(completed.receipt.siparis.durum, 'DELIVERED'); checks++;
  assert.equal(completed.order.qr_codes.length, 2); assert.equal(completed.order.barcodes.length, 2); checks += 2;
  for (const label of [...completed.order.qr_codes, ...completed.order.barcodes]) {
    assert.equal(label.scan_count, order.items.find(item => item.id === label.order_item_id).quantity);
    assert.equal(label.is_scanned, true); assert.ok(label.qrCodeImageUrl || label.barcode_image_url); checks += 3;
  }
  const callsAfterFirst = imageCalls;
  const replay = (await request(order.id, body)).data;
  assert.equal(replay.replayed, true); assert.equal(imageCalls, callsAfterFirst); checks += 2;
  assert.equal(await client.orderFulfillmentAction.count({ where: { orderId: order.id } }), 1); checks++;
  await request(order.id, { ...body, reason: 'Changed payload' }, 409);
  await request(order.id, payload('DELIVERED', 'CONFIRMED'), 409);
  await request(order.id, payload(), 409);
  const canceled = await newOrder('CANCELED'); await request(canceled.id, payload('CANCELED'), 409);
  await request(randomUUID(), payload(), 404);
  const staged = await newOrder();
  for (const [from, to] of [['PENDING', 'CONFIRMED'], ['CONFIRMED', 'READY'], ['READY', 'SHIPPED'], ['SHIPPED', 'DELIVERED']]) {
    const result = (await request(staged.id, payload(from, to))).data;
    assert.equal(result.order.status, to); checks++;
    if (to === 'READY') { assert.ok(result.order.qr_codes.every(label => label.first_scan_at)); assert.ok(result.order.barcodes.every(label => !label.is_scanned)); checks += 2; }
  }
  const partial = await newOrder('CONFIRMED');
  const preserved = await client.qRCode.create({ data: { order_id: partial.id, order_item_id: partial.items[0].id, product_id: product.productId, qr_code: 'PASHA-EXISTING', qrCodeImageUrl: 'https://example.invalid/existing.png' } });
  const repaired = (await request(partial.id, payload('CONFIRMED'))).data;
  assert.equal(repaired.order.qr_codes.length, 2);
  assert.equal(repaired.order.qr_codes.find(label => label.id === preserved.id).qr_code, 'PASHA-EXISTING'); checks += 2;
  const printed = await newOrder('DELIVERED', true);
  assert.equal((await request(printed.id, payload('DELIVERED'))).data.order.receipt_printed, true); checks++;
  const ambiguous = await newOrder('CONFIRMED');
  await client.qRCode.create({ data: { order_id: ambiguous.id, qr_code: randomUUID() } });
  await request(ambiguous.id, payload('CONFIRMED'), 409);
  const uploadFailure = await newOrder(); failImage = true;
  await request(uploadFailure.id, payload(), 502); failImage = false;
  assert.equal((await client.order.findUnique({ where: { id: uploadFailure.id } })).status, 'PENDING');
  assert.equal(await client.qRCode.count({ where: { order_id: uploadFailure.id } }), 0); checks += 2;
  const receiptFailure = await newOrder(); failReceipt = true;
  await request(receiptFailure.id, payload(), 500); failReceipt = false;
  assert.equal((await client.order.findUnique({ where: { id: receiptFailure.id } })).status, 'PENDING');
  assert.equal(await client.qRCode.count({ where: { order_id: receiptFailure.id } }), 0);
  assert.equal(await client.barcode.count({ where: { order_id: receiptFailure.id } }), 0);
  assert.equal(await client.orderFulfillmentAction.count({ where: { orderId: receiptFailure.id } }), 0); checks += 4;
  const concurrent = await newOrder(); const concurrentBody = payload();
  const concurrentResults = await Promise.all([request(concurrent.id, concurrentBody), request(concurrent.id, concurrentBody)]);
  assert.equal(concurrentResults.filter(result => result.data.replayed).length, 1);
  assert.equal(await client.qRCode.count({ where: { order_id: concurrent.id } }), 2);
  assert.equal(await client.orderFulfillmentAction.count({ where: { orderId: concurrent.id } }), 1); checks += 3;
  // Change an order while label preparation is outside the transaction.
  const changed = await newOrder(); let enter, release;
  const entered = new Promise(resolve => { enter = resolve; });
  gate = { enter, wait: new Promise(resolve => { release = resolve; }) };
  const inFlight = request(changed.id, payload(), 409);
  await entered; await client.order.update({ where: { id: changed.id }, data: { status: 'CANCELED' } }); release(); await inFlight;
  assert.equal(await client.qRCode.count({ where: { order_id: changed.id } }), 0); checks++;
  assert.equal((await client.productvariations.findUnique({ where: { id: stock.id } })).stock_quantity, 20);
  assert.equal((await client.productvariations.findUnique({ where: { id: stock.id } })).stock_area_m2.toString(), '40');
  assert.equal((await client.store.findUnique({ where: { store_id: store.store_id } })).bakiye.toString(), '1234'); checks += 3;
  // Exercise actual QR/barcode raster generation while replacing only CDN upload.
  const originalUpload = UploadService.prototype.uploadFile;
  UploadService.prototype.uploadFile = async buffer => {
    assert.ok(buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))); checks++;
    return 'https://example.invalid/rendered.png';
  };
  try {
    await createFulfillmentImage({ kind: 'qr', value: 'https://example.invalid/PASHA-test' });
    await createFulfillmentImage({ kind: 'barcode', value: completed.order.barcodes[0].barcode, barcodeType: 'EAN13' });
  } finally { UploadService.prototype.uploadFile = originalUpload; }
  console.log(JSON.stringify({ status: 'PASS', checks, concurrentReplayVerified: true, stockAndBalanceUnchanged: true, externalUploads: 0 }));
}

run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (created) {
    if (!/^fulfillment_test_[a-f0-9]{32}$/.test(schema)) throw Error('Unsafe test schema');
    await client.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
    const remains = await client.$queryRaw`SELECT schema_name FROM information_schema.schemata WHERE schema_name = ${schema}`;
    assert.equal(remains.length, 0); console.log('ISOLATED_TEST_SCHEMA_REMOVED');
  }
  await client.$disconnect(); await globalDb.$disconnect();
});
