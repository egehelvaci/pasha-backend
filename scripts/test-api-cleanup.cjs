// Compatibility baseline captured before removing unused routes. No database access.
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const baseline = require('../docs/api-cleanup-contract.json');
const spec = require('../src/docs/openapi.json');
const inventory = require('../docs/api-route-inventory.json');
const key = r => `${r.method} ${r.path}`;
assert.deepEqual(inventory.map(key).sort(), baseline.retained.map(key).sort());
for (const row of baseline.retained) {
  const current = inventory.find(r => key(r) === key(row));
  assert.equal(current.source, row.source, `Source changed: ${key(row)}`);
  assert.equal(current.handler, row.handler, `Handler changed: ${key(row)}`);
  const op = spec.paths[row.path][row.method];
  const fields = Object.fromEntries(['security', 'x-roles', 'parameters', 'requestBody', 'responses'].filter(k => op[k] !== undefined).map(k => [k, op[k]]));
  assert.equal(createHash('sha256').update(JSON.stringify(fields)).digest('hex'), row.contractHash, `Contract changed: ${key(row)}`);
}
for (const row of baseline.removed) assert(!spec.paths[row.path]?.[row.method], `Removed endpoint still documented: ${key(row)}`);
console.log(`API_CLEANUP_OK: ${baseline.retained.length} preserved contracts; ${baseline.removed.length} removed operations`);
