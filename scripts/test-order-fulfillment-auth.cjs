// Exercise the registered route and service authorization without database writes.
require('dotenv').config({ quiet: true });
require('ts-node/register/transpile-only');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const router = require('../src/admin/admin-routes').default;
const { createAdvanceOrderHandler } = require('../src/admin/order-fulfillment-controller');
const { OrderFulfillmentService } = require('../src/services/order-fulfillment-service');

async function main() {
  const route = router.stack.find(layer => layer.route?.path === '/orders/:orderId/advance' && layer.route.methods.post).route;
  const orderId = randomUUID(), actorId = randomUUID();
  const body = { requestId: randomUUID(), expectedStatus: 'PENDING', targetStatus: 'CONFIRMED' };
  let actor, reads = 0;
  const service = new OrderFulfillmentService({ db: {
    user: { findUnique: async () => actor },
    orderFulfillmentAction: { findUnique: async () => {
      reads++;
      return { orderId, actorId, fromStatus: body.expectedStatus, targetStatus: body.targetStatus, reason: null, result: { order: { id: orderId, status: 'CONFIRMED' } } };
    } }
  } });
  const handler = createAdvanceOrderHandler(service);
  async function request(tokenRole, dbRole, active = true, registeredHandler = false) {
    actor = dbRole ? { isActive: active, userType: { name: dbRole } } : null;
    const req = { params: { orderId }, body, ...(tokenRole ? { user: { userId: actorId, userType: tokenRole } } : {}) };
    const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(data) { this.body = data; return this; } };
    let allowed = false;
    route.stack[0].handle(req, res, () => { allowed = true; });
    if (allowed) {
      if (registeredHandler) {
        // Invalid input reaches validation only after the real route allows the role.
        await route.stack[1].handle({ ...req, body: {} }, res);
      } else await handler(req, res);
    }
    return res;
  }
  for (const role of ['admin', 'editor']) {
    assert.equal((await request(role, role, true, true)).statusCode, 400);
    const result = await request(role, role);
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.data.replayed, true);
    assert.equal((await request(role, role, false)).statusCode, 403);
    assert.equal((await request(role, 'customer')).statusCode, 403);
    assert.equal((await request(role, null)).statusCode, 403);
  }
  assert.equal((await request('customer', 'customer')).statusCode, 403);
  assert.equal((await request(null, null)).statusCode, 401);
  assert.equal(reads, 2, 'Rejected users must not access fulfillment actions');
  console.log('FULFILLMENT_AUTH_OK: admin/editor accepted; inactive, missing and unauthorized users rejected');
}
main().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
