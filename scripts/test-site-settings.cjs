// Integration test in a unique PostgreSQL schema, rolled back even on failure.
// No existing tables are modified and no CDN files are uploaded.
// Run explicitly: node scripts/test-site-settings.cjs --run
if (!process.argv.includes('--run')) throw new Error('Pass --run to execute the isolated rollback test');
require('dotenv').config({ quiet: true });
require('ts-node/register/transpile-only');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');
const prismaModule = require('../src/utils/prisma');
const original = prismaModule.default;
const schema = 'site_test_' + randomUUID().replaceAll('-', '');
const url = new URL(process.env.DATABASE_URL);
url.searchParams.set('schema', schema);
const client = new PrismaClient({ datasources: { db: { url: url.toString() } } });
const { publicSiteSettingsRouter, adminSiteSettingsRouter } = require('../src/routes/siteSettingsRoutes');
const { UploadService } = require('../src/utils/upload-service');
const originalUpload = UploadService.prototype.uploadFile;
let uploads = 0;
UploadService.prototype.uploadFile = async (_buffer, mime, name, folder) => {
  assert.equal(mime, 'image/png');
  assert.equal(name, 'banner.png');
  assert.equal(folder, 'banners');
  uploads++;
  return 'https://example.invalid/banner.png';
};
const rollback = new Error('EXPECTED_ROLLBACK');
let checks = 0;
let server;

async function test() {
  assert.ok(process.env.JWT_SECRET, 'JWT_SECRET must be configured');
  try {
    await client.$transaction(async tx => {
      await tx.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
      await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schema}"`);
      const sql = fs.readFileSync(path.join(__dirname, '../prisma/migrations/20260924000000_site_settings/migration.sql'), 'utf8');
      for (const statement of sql.split(';').filter(s => s.trim())) await tx.$executeRawUnsafe(statement);
      prismaModule.default = new Proxy(tx, { get(target, key) {
        return key === '$transaction' ? queries => Promise.all(queries) : target[key];
      } });
      const app = express();
      app.use(express.json());
      app.use('/api/site-settings', publicSiteSettingsRouter);
      app.use('/api/admin/site-settings', adminSiteSettingsRouter);
      server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
      async function request(route, method = 'GET', body, expected = 200, role = 'admin') {
        const headers = {};
        if (role) headers.Authorization = 'Bearer ' + jwt.sign({ userId: 'test', userType: role }, process.env.JWT_SECRET, { expiresIn: '5m' });
        const multipart = body instanceof FormData;
        if (body !== undefined && !multipart) headers['Content-Type'] = 'application/json';
        const res = await fetch(`http://127.0.0.1:${server.address().port}/api${route}`, {
          method, headers, body: body === undefined ? undefined : multipart ? body : JSON.stringify(body)
        });
        const payload = await res.json();
        assert.equal(res.status, expected, JSON.stringify(payload)); checks++;
        return { ...payload, cacheControl: res.headers.get('cache-control') };
      }
      const admin = '/admin/site-settings';
      await request(admin, 'GET', undefined, 401, null);
      await request(admin, 'PATCH', { hideBalance: true }, 403, 'editor');
      await request(admin + '/banners', 'POST', { title: 'No', imageUrl: 'https://example.invalid/no.png' }, 403, 'customer');
      const initial = await request('/site-settings', 'GET', undefined, 200, null);
      assert.deepEqual(initial.data, { hideBalance: false, hideStock: false, banners: [] }); checks++;
      assert.equal(initial.cacheControl, 'no-store'); checks++;
      assert.equal(await tx.siteSettings.count(), 0); checks++;
      for (const body of [{}, { hideBalance: 'true' }, { hideStock: 1 }, { arbitrary: true }, { hideStock: null }]) {
        await request(admin, 'PATCH', body, 400);
      }
      await request(admin, 'PATCH', { hideBalance: true });
      const updated = await request(admin, 'PATCH', { hideStock: true });
      assert.equal(updated.data.hideBalance, true); checks++;
      await request(admin, 'PATCH', { hideBalance: false });
      const visible = await request('/site-settings', 'GET', undefined, 200, null);
      assert.equal(visible.data.hideBalance, false);
      assert.equal(visible.data.hideStock, true); checks += 2;
      await request(admin + '/banners', 'POST', { title: 'Missing image' }, 400);
      for (const body of [
        { imageUrl: 'javascript:alert(1)' }, { linkUrl: '//evil.invalid' },
        { linkUrl: 'javascript:alert(1)' }, { isActive: 'false' },
        { sortOrder: -1 }, { id: 'unexpected' }, { mobileImageUrl: 'invalid' }
      ]) {
        await request(admin + '/banners', 'POST', { title: 'Invalid', imageUrl: 'https://example.invalid/test.png', ...body }, 400);
      }
      const first = (await request(admin + '/banners', 'POST', { title: 'First', imageUrl: 'https://example.invalid/a.png', sortOrder: 2, linkUrl: '/collections' }, 201)).data;
      const second = (await request(admin + '/banners', 'POST', { title: 'Second', imageUrl: 'https://example.invalid/b.png', sortOrder: 1, isActive: false }, 201)).data;
      assert.equal((await request('/site-settings')).data.banners.length, 1); checks++;
      assert.equal((await request(admin + '/banners')).data.length, 2); checks++;
      await request(admin + '/banners/' + second.id, 'PATCH', { isActive: true, mobileImageUrl: 'https://example.invalid/mobile.png' });
      const publicBanners = (await request('/site-settings')).data.banners;
      assert.deepEqual(publicBanners.map(b => b.id), [second.id, first.id]); checks++;
      assert.ok(!('isActive' in publicBanners[0])); checks++;
      const cleared = (await request(admin + '/banners/' + first.id, 'PATCH', { linkUrl: null, altText: 'New text' })).data;
      assert.equal(cleared.linkUrl, null); checks++;
      assert.equal(cleared.imageUrl, first.imageUrl); checks++;
      await request(admin + '/banners/does-not-exist', 'PATCH', { title: 'Test' }, 404);
      await request(admin + '/banners/' + first.id, 'DELETE');
      await request(admin + '/banners/' + first.id, 'DELETE', undefined, 404);
      assert.equal((await request('/site-settings')).data.banners.length, 1); checks++;
      await request(admin + '/banner-image', 'POST', undefined, 400);
      const bad = new FormData(); bad.append('image', new Blob(['<svg>not an image</svg>']), 'bad.svg');
      await request(admin + '/banner-image', 'POST', bad, 400);
      const tooBig = new FormData(); tooBig.append('image', new Blob([Buffer.alloc(5 * 1024 * 1024 + 1)]), 'big.png');
      await request(admin + '/banner-image', 'POST', tooBig, 413);
      const good = new FormData(); good.append('image', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAuoAAAAASUVORK5CYII=', 'base64')]), 'untrusted.html');
      await request(admin + '/banner-image', 'POST', good, 201);
      assert.equal(uploads, 1); checks++;
      throw rollback;
    }, { timeout: 120000, maxWait: 10000 });
  } catch (error) { if (error !== rollback) throw error; }
  finally {
    prismaModule.default = original;
    UploadService.prototype.uploadFile = originalUpload;
    if (server) await new Promise(resolve => server.close(resolve));
  }
  const result = await client.$queryRaw`SELECT schema_name FROM information_schema.schemata WHERE schema_name = ${schema}`;
  assert.equal(result.length, 0); checks++;
  console.log(JSON.stringify({ status: 'PASS', checks, schemaRolledBack: true, externalUploads: 0 }));
}
test().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await client.$disconnect(); await original.$disconnect();
});
