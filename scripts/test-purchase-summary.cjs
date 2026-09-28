// Offline regression test: no database connection or writes.
require('ts-node/register/transpile-only');
const assert = require('node:assert/strict');
const prismaPath = require.resolve('../src/utils/prisma');
const transaction = {
  id: 'purchase', transaction_type: 'CART_PURCHASE',
  reference_number: 'CART-1704895470123', created_at: new Date(), amount: '-770.43'
};
let items = [];
let storedItems = true;
let cartReads = 0;
const prisma = {
  supplier: { findUnique: async () => ({ id: 'supplier' }) },
  supplierBalanceTransaction: {
    aggregate: async () => ({ _count: { id: 1 }, _sum: { amount: transaction.amount } }),
    findMany: async () => [transaction],
    groupBy: async () => []
  },
  purchaseCarts: { findMany: async () => { cartReads++; return [{ items }]; } },
  supplierPurchaseItems: { findMany: async () => storedItems ? items : [] }
};
require.cache[prismaPath] = { id: prismaPath, filename: prismaPath, loaded: true, exports: { __esModule: true, default: prisma } };
const { getSupplierPurchaseSummary } = require('../src/controllers/purchasePriceListController');

async function check({ width, height, quantity, rate, total }) {
  items = [{
    product_id: 'berlin', product: { name: 'BERLİN 01 ANTRASİT', collection: { name: 'BERLİN', code: 'BR' } },
    width, height, quantity, area_m2: Number((width * height / 10000).toFixed(2)),
    unit_price: rate, total_price: total, has_fringe: false, cut_type: 'rectangle'
  }];
  let response;
  await getSupplierPurchaseSummary({ params: { supplier_id: 'supplier' }, query: {} }, {
    json: value => { response = value; },
    status: code => { throw new Error(`Unexpected HTTP ${code}`); }
  });
  assert.equal(response.success, true);
  const result = response.data.all_transactions[0];
  if (storedItems) {
    assert.equal(result.items[0].m2_fiyati, rate);
    assert.equal(result.items[0].toplam_tutar, total);
    assert.equal(result.items[0].adet, quantity);
    assert.equal(result.total_value, total);
    assert.equal(cartReads, 0, 'Persisted purchases must not match unrelated nearby carts');
  } else {
    assert.equal(cartReads, 1, 'Legacy purchases retain the cart fallback');
  }
  assert.equal(response.data.items_summary.total_value, total);
  const expectedArea = width * height / 10000 * quantity;
  assert.equal(response.data.items_summary.total_area_m2, expectedArea);
  assert.equal(response.data.items_summary.average_price_per_m2,
    (expectedArea > 0 ? total / expectedArea : 0).toFixed(2));
}

(async () => {
  await check({ width: 160, height: 6019, quantity: 1, rate: 8, total: 770.43 });
  await check({ width: 160, height: 6019, quantity: 1, rate: 0.08, total: 7.70 });
  await check({ width: 80, height: 100, quantity: 3, rate: 8, total: 19.20 });
  await check({ width: 100, height: 100, quantity: 2, rate: 8, total: 16 });
  await check({ width: 0, height: 0, quantity: 1, rate: 8, total: 0 });
  await check({ width: 100, height: 100, quantity: 0, rate: 8, total: 0 });
  transaction.reference_number = null;
  await check({ width: 160, height: 6019, quantity: 1, rate: 8, total: 770.43 });
  transaction.reference_number = 'CART-1704895470123';
  storedItems = false;
  await check({ width: 160, height: 6019, quantity: 1, rate: 8, total: 770.43 });
  console.log('PASS: purchase-summary pricing, precision, persisted records and legacy fallback (8 cases)');
})().catch(error => { console.error(error); process.exitCode = 1; });
