// Explicit contracts for dynamic bodies, multipart uploads and important workflows.
module.exports = function applyOverrides(spec) {
  const object = (properties, required = []) => ({ type: 'object', properties, ...(required.length ? { required } : {}) });
  const string = { type: 'string' }, number = { type: 'number' }, boolean = { type: 'boolean' };
  const array = items => ({ type: 'array', items });
  const statuses = ['PENDING', 'CONFIRMED', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELED'];
  const status = { type: 'string', enum: statuses };
  const response = (schema, description = 'Başarılı yanıt') => ({ description, content: { 'application/json': { schema } } });
  const envelope = data => object({ success: boolean, data });
  function get(path, method) { const op = spec.paths[path]?.[method]; if (!op) throw Error(`Unknown override ${method} ${path}`); return op; }
  function body(path, method, schema, example, media = 'application/json') {
    get(path, method).requestBody = { required: true, content: { [media]: { schema, ...(example ? { example } : {}) } } };
  }
  const item = object({ productId: string, quantity: { type: 'integer', minimum: 1 }, width: number, height: number, hasFringe: boolean, cutType: string, notes: string }, ['productId', 'quantity', 'width', 'height', 'hasFringe', 'cutType']);
  spec.components.schemas.OrderStatus = status;
  spec.components.schemas.CartItemInput = item;
  const sizeDimension = { type: 'integer', minimum: 1, maximum: 2147483647 };
  const ruleSize = { oneOf: [
    object({ width: sizeDimension, isOptionalHeight: { type: 'boolean', enum: [true] }, height: { type: 'integer', description: 'Özel yükseklikte gönderilmez; eski istemciler gönderirse yok sayılır.' } }, ['width', 'isOptionalHeight']),
    object({ width: sizeDimension, height: sizeDimension, isOptionalHeight: { type: 'boolean', enum: [false], default: false } }, ['width', 'height'])
  ] };
  body('/api/admin/product-rules', 'post', object({ name: string, description: string, canHaveFringe: boolean, sizeOptions: array(ruleSize), cutTypeIds: array({ type: 'integer' }) }, ['name']), { name: 'Hazır ve özel kesim', sizeOptions: [{ width: 100, height: 200, isOptionalHeight: false }, { width: 100, isOptionalHeight: true }] });
  body('/api/admin/product-rules/{ruleId}/size-options', 'post', ruleSize, { width: 100, isOptionalHeight: true });
  body('/api/admin/product-rules/{ruleId}/size-options/{sizeId}', 'put', object({ width: sizeDimension, height: sizeDimension, isOptionalHeight: boolean }), { isOptionalHeight: true });
  for (const [path, method] of [['/api/admin/product-rules', 'post'], ['/api/admin/product-rules/{ruleId}/size-options', 'post'], ['/api/admin/product-rules/{ruleId}/size-options/{sizeId}', 'put']]) {
    get(path, method).description += '\n\nisOptionalHeight=true olduğunda yalnızca genişlik tanımlanır; height gönderilmez ve üst sınır uygulanmaz. Yanıtta height=0 depolama göstergesidir. Sabit ebata geçerken pozitif height gönderin. Siparişte gerçek boy zorunludur.';
  }
  const banner = object({ title: { type: 'string', maxLength: 200 }, imageUrl: { type: 'string', format: 'uri' }, mobileImageUrl: { type: 'string', nullable: true }, linkUrl: { type: 'string', nullable: true }, altText: { type: 'string', maxLength: 300 }, sortOrder: { type: 'integer', minimum: 0, default: 0 }, isActive: { type: 'boolean', default: true } });
  spec.components.schemas.BannerInput = banner;
  body('/api/admin/site-settings', 'patch', { ...object({ hideBalance: boolean, hideStock: boolean }), minProperties: 1, additionalProperties: false }, { hideBalance: true, hideStock: false });
  body('/api/admin/site-settings/banners', 'post', { ...banner, required: ['title', 'imageUrl'] }, { title: 'Yeni koleksiyon', imageUrl: 'https://cdn.example.com/banner.png', sortOrder: 0, isActive: true });
  body('/api/admin/site-settings/banners/{id}', 'patch', { ...banner, minProperties: 1 });
  body('/api/admin/site-settings/banner-image', 'post', object({ image: { type: 'string', format: 'binary', description: 'PNG/JPEG/WebP; en fazla 5 MB' } }, ['image']), undefined, 'multipart/form-data');
  const fulfillment = object({ requestId: { type: 'string', format: 'uuid' }, expectedStatus: status, targetStatus: { type: 'string', enum: ['CONFIRMED', 'READY', 'SHIPPED', 'DELIVERED'] }, reason: { type: 'string', maxLength: 500 } }, ['requestId', 'expectedStatus', 'targetStatus']);
  body('/api/admin/orders/{orderId}/advance', 'post', { ...fulfillment, additionalProperties: false }, { requestId: 'c6b52d54-9e57-4b26-a4cd-7199fe33a7d9', expectedStatus: 'PENDING', targetStatus: 'DELIVERED', reason: 'Admin teslim onayı' });
  Object.assign(get('/api/admin/orders/{orderId}/advance', 'post'), {
    summary: 'Siparişi admin onayıyla ilerlet / teslim et',
    description: 'Aktif admin gerektirir. Eksik QR/barkod ve görseller hazırlanır, fiş verisi döner. Stok/bakiye yeniden değiştirilmez. Aynı requestId ve gövde tekrar gönderilirse önceki sonuç döner. Fiş fiziksel olarak yazdırılmış sayılmaz. İşlem tablosu migration gerektirir. Ayrıntı: docs/order-fulfillment.md.',
    responses: {
      200: response(envelope(object({ requestId: string, previousStatus: status, manualCompletion: boolean, stockChanged: boolean, replayed: boolean, order: object({ id: string, status, receipt_printed: boolean, receipt_printed_at: { type: 'string', format: 'date-time', nullable: true }, qr_codes: array({ type: 'object' }), barcodes: array({ type: 'object' }) }), receipt: { type: 'object', additionalProperties: true } }))),
      ...Object.fromEntries([400, 401, 403, 404, 409, 500, 502].map(code => [code, response({ $ref: '#/components/schemas/Error' }, code === 409 ? 'Statü/idempotency/eşzamanlılık veya etiket tutarlılığı hatası' : 'İşlem hatası')]))
    }
  });
  get('/api/admin/orders-v2', 'get').parameters = [
    { name: 'status', in: 'query', required: true, schema: status },
    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
    { name: 'userId', in: 'query', schema: string }
  ];
  body('/api/admin/orders/{orderId}/status', 'put', object({ status: { type: 'string', enum: statuses.filter(value => value !== 'READY') } }, ['status']));
  body('/api/admin/barcode/scan', 'post', object({ barcode: string }, ['barcode']));
  body('/api/admin/barcode/scan-multiple', 'post', object({ barcodes: array(string) }, ['barcodes']));
  body('/api/admin/scan-qr', 'post', object({ qrCode: string, selectedEmployeeId: string }, ['qrCode']));
  get('/api/admin/scan-qr', 'get').parameters = [
    { name: 'qrCode', in: 'query', required: true, schema: string },
    { name: 'selectedEmployeeId', in: 'query', schema: string }
  ];
  body('/api/auth/login', 'post', object({ username: string, password: { type: 'string', format: 'password', writeOnly: true } }, ['username', 'password']));
  body('/api/admin/purchase-management/suppliers/{supplier_id}/purchase-cart/items', 'post', item);
  body('/api/admin/purchase-management/suppliers/{supplier_id}/purchase-product', 'post', object({
    product_id: string,
    width: { type: 'number', minimum: 0, exclusiveMinimum: true, description: 'Ürün kuralında tanımlı en (cm). Stok bu en havuzuna eklenir.' },
    quantity_m2: { type: 'number', minimum: 0, exclusiveMinimum: true },
    description: string,
    reference_number: string
  }, ['product_id', 'width', 'quantity_m2']), { product_id: 'product-uuid', width: 80, quantity_m2: 25, description: 'Ürün alımı' });
  body('/api/products/{id}/stock-area', 'patch', object({
    width: { type: 'integer', minimum: 1, description: 'Ürün kuralında tanımlı en (cm). Yalnızca bu en havuzunun hedef stoğunu değiştirir.' },
    height: { type: 'integer', minimum: 0, deprecated: true, description: 'Uyumluluk alanı. Özel boy için gönderilmeyebilir veya 0 olabilir; stok havuzu seçiminde kullanılmaz.' },
    areaM2: { type: 'number', minimum: 0, description: 'Seçilen en havuzunun yeni toplam m² değeri.' }
  }, ['width', 'areaM2']), { width: 80, areaM2: 25 });
  get('/api/products/{id}/stock-area', 'patch').description += '\n\nStok en bazlıdır. Aynı ene sahip hazır ebat ve özel boy aynı m² havuzunu paylaşır; farklı enler bağımsızdır. En değeri ürünün productsizeoptions kuralında bulunmalıdır.';
  for (const method of ['post', 'put']) {
    const route = method === 'post' ? '/api/products' : '/api/products/{id}';
    const op = get(route, method);
    const schema = op.requestBody?.content?.['application/json']?.schema || object({});
    schema.properties ||= {};
    schema.properties.productImage = { type: 'string', format: 'binary' };
    op.requestBody = { required: true, content: { 'multipart/form-data': { schema } } };
  }
  get('/healthz', 'get').responses = { 200: { description: 'Sunucu ayakta', content: { 'text/plain': { schema: { type: 'string', example: 'OK' } } } } };
  for (const [path, entry] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(entry)) {
      if (path.startsWith('/api/payments/') && /webhook|callback/.test(path)) {
        op.description += '\n\nÖdeme sağlayıcı callback/webhook endpoint’i. Canlı ödeme işlemi dışında elle çağrılmamalıdır.';
        if (method === 'post') {
          const schema = op.requestBody?.content?.['application/json']?.schema || { type: 'object', additionalProperties: true };
          op.requestBody = { required: true, content: { 'application/json': { schema }, 'application/x-www-form-urlencoded': { schema } } };
        }
      }
    }
  }
};
