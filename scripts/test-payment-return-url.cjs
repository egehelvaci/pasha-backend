// Pure URL regression tests; no payment calls or database access.
require('ts-node/register/transpile-only');
const assert = require('node:assert/strict');
const { getPaymentReturnUrl } = require('../src/utils/payment-return-url');
const original = process.env.PRODUCTION_FRONTEND_URL;
try {
  for (const configured of ['pasahome.com.tr', 'https://pasahome.com.tr', ' https://pasahome.com.tr/ ', '//pasahome.com.tr']) {
    process.env.PRODUCTION_FRONTEND_URL = configured;
    const destination = getPaymentReturnUrl();
    assert.equal(destination, 'https://pasahome.com.tr/dashboard/odemeler');
    assert.equal(new URL(destination, 'https://backend.example/api/payments/webhook/success?token=test').href, destination);
  }
  process.env.PRODUCTION_FRONTEND_URL = 'http://localhost:3000/';
  assert.equal(getPaymentReturnUrl(), 'http://localhost:3000/dashboard/odemeler');
  process.env.PRODUCTION_FRONTEND_URL = 'https://example.com/app/?foo=bar#section';
  assert.equal(getPaymentReturnUrl(), 'https://example.com/app/dashboard/odemeler');
  delete process.env.PRODUCTION_FRONTEND_URL;
  assert.equal(getPaymentReturnUrl(), 'http://localhost:3000/dashboard/odemeler');
  for (const configured of ['ftp://example.com', 'https://user:password@example.com', 'not a domain']) {
    process.env.PRODUCTION_FRONTEND_URL = configured;
    assert.throws(() => getPaymentReturnUrl());
  }
  console.log('Payment return URL regression tests passed.');
} finally {
  if (original === undefined) delete process.env.PRODUCTION_FRONTEND_URL;
  else process.env.PRODUCTION_FRONTEND_URL = original;
}
