const assert = require('node:assert/strict');
const parser = require('@apidevtools/swagger-parser');
const express = require('express');
const spec = require('../src/docs/openapi.json');
require('ts-node/register/transpile-only');

async function main() {
  await parser.validate(JSON.parse(JSON.stringify(spec)));
  const ids = new Set();
  const documented = [];
  for (const [path, entry] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(entry)) {
      assert(!ids.has(op.operationId), `Duplicate operation: ${op.operationId}`);
      ids.add(op.operationId);
      documented.push(`${method} ${path}`);
      for (const [, name] of path.matchAll(/\{([^}]+)\}/g)) {
        assert(op.parameters?.some(p => p.in === 'path' && p.name === name && p.required));
      }
    }
  }
  assert.deepEqual(spec.paths['/api/auth/login'].post.security, []);
  assert(spec.paths['/api/admin/orders/{orderId}/advance'].post['x-roles'].includes('admin'));
  assert(spec.paths['/api/admin/site-settings/banner-image'].post.requestBody.content['multipart/form-data']);
  assert(spec.paths['/api/products'].post.requestBody.content['multipart/form-data']);

  // Independently compare the actual Express registrations, without listening or calling business APIs.
  function instrumentUse(target) {
    const original = target.use;
    target.use = function (...args) {
      const before = (this.stack || this._router?.stack || []).length;
      const result = original.apply(this, args);
      const prefix = typeof args[0] === 'string' ? args[0] : '';
      for (const layer of (this.stack || this._router.stack).slice(before)) layer.testMountPath = prefix;
      return result;
    };
  }
  const originalRouter = express.Router;
  express.Router = function (...args) {
    const router = originalRouter(...args);
    instrumentUse(router);
    return router;
  };
  instrumentUse(express.application);
  const originalListen = express.application.listen;
  express.application.listen = () => ({ close() {} });
  let app;
  try { app = require('../src/server').default; }
  finally { express.application.listen = originalListen; }
  const actual = [];
  const dispatchRouter = express.Router();
  function expand(path) {
    if (!path.includes('?')) return [path];
    const match = path.match(/\/(:\w+)\?/);
    assert(match, `Unsupported optional path: ${path}`);
    return [...expand(path.replace(match[0], '')), ...expand(path.replace('?', ''))];
  }
  function walk(stack, prefix = '') {
    for (const layer of stack) {
      if (layer.route) {
        for (const route of expand(prefix + (layer.route.path === '/' ? '' : layer.route.path))) {
          const path = (route || '/').replace(/\/{2,}/g, '/').replace(/:(\w+)/g, '{$1}');
          if (path === '/api/openapi.json') continue;
          for (const method of Object.keys(layer.route.methods)) {
            actual.push(`${method} ${path}`);
            dispatchRouter[method](path.replace(/\{([^}]+)\}/g, ':$1'), (_req, res) => res.end());
          }
        }
      } else if (layer.handle?.stack) walk(layer.handle.stack, prefix + (layer.testMountPath || ''));
    }
  }
  walk(app._router.stack);
  assert.deepEqual([...new Set(actual)].sort(), documented.sort(), 'Runtime routes differ from OpenAPI');
  // Check actual registration order for shadowing without invoking business handlers.
  for (const operation of actual) {
    const [method, pattern] = operation.split(' ');
    const concrete = pattern.replace(/\{[^}]+\}/g, '00000000-0000-4000-8000-000000000001');
    const selected = dispatchRouter.stack.find(layer => layer.route.methods[method] && layer.match(concrete));
    assert(selected, `Unreachable route: ${operation}`);
    assert.equal(selected.route.path, pattern.replace(/\{([^}]+)\}/g, ':$1'), `Shadowed route: ${operation}`);
  }

  const server = originalListen.call(app, 0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const json = await fetch(base + '/api/openapi.json');
    assert.equal(json.status, 200);
    assert.equal(Object.keys((await json.json()).paths).length, Object.keys(spec.paths).length);
    const ui = await fetch(base + '/api/docs/');
    assert.equal(ui.status, 200);
    assert((await ui.text()).includes('swagger-ui'));
    assert.equal((await fetch(base + '/api/docs/swagger-ui-bundle.js')).status, 200);
  } finally { await new Promise(resolve => server.close(resolve)); }
  console.log(`OPENAPI_OK: ${documented.length} operations; runtime coverage and Swagger HTTP checks passed`);
}
main().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
