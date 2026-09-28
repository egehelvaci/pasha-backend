// Offline regression: adding an existing item after a price-list change.
require('ts-node/register/transpile-only');
const assert = require('node:assert/strict');
function mock(path, exports) {
  const id = require.resolve(path);
  require.cache[id] = { id, filename: id, loaded: true, exports: { __esModule: true, ...exports } };
}
let rate = 8;
let row;
const itemTable = {
  findFirst: async () => row,
  update: async ({ data }) => { row = { ...row, ...data }; return row; }
};
mock('../src/utils/prisma', { default: {
  carts: { findFirst: async () => ({ id: 1 }) },
  admin_carts: { findFirst: async () => ({ id: 2 }) },
  cart_items: itemTable, admin_cart_items: itemTable
} });
mock('../src/product-service', { ProductService: class {
  async getProductById() { return {
    pricing: { price: rate }, cutTypes: [{ name: 'standart' }],
    sizeOptions: [{ width: 160, height: 6019, stockQuantity: 100 }]
  }; }
} });
mock('../src/utils/tebi-service', { TebiService: class {} });
mock('../src/services/common-stock-service', {
  commonStockService: { getSnapshot: async () => ({ enabled: false }) }
});
const { CartService } = require('../src/cart-service');
const service = new CartService();
const input = { userId: 'user', targetUserId: 'user', adminUserId: 'admin', storeId: 'store',
  productId: 'berlin', width: 160, height: 6019, quantity: 1, hasFringe: false, cutType: 'standart' };
(async () => {
  for (const method of ['addToCart', 'addToAdminCart']) {
    row = { id: 1, quantity: 1, unit_price: 5, total_price: 481.52 };
    for (const [nextRate, expectedTotal] of [[8, 1540.864], [0.08, 23.11296]]) {
      rate = nextRate;
      const result = await service[method](input);
      assert.equal(Number(result.unit_price), rate, `${method}: rate must match recalculated total`);
      assert.equal(Number(result.total_price), expectedTotal);
    }
    assert.equal(row.quantity, 3);
  }
  console.log('PASS: customer/admin cart price changes (4 cases)');
})().catch(error => { console.error(error); process.exitCode = 1; });
