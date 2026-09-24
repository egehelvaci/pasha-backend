// Static route/handler analysis: never starts the server or reads .env/database.
const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']);
const paths = {}, inventory = [], unresolved = [];
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const text = node => (node?.getText() || '').replace(/\r\n/g, '\n');
const walk = (node, visit) => { visit(node); ts.forEachChild(node, child => walk(child, visit)); };
const literal = node => {
  if (!node) return undefined;
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  return undefined;
};
function declaration(node) {
  let symbol = checker.getSymbolAtLocation(node);
  if (symbol?.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  return symbol?.valueDeclaration || symbol?.declarations?.[0];
}
function routerTarget(node, seen = new Set()) {
  if (!node || seen.has(node)) return null; seen.add(node);
  const decl = declaration(node);
  if (decl && ts.isExportAssignment(decl)) return routerTarget(decl.expression, seen);
  if (decl && ts.isVariableDeclaration(decl) && /(?:Router|express)\(/.test(text(decl.initializer))) {
    return { file: decl.getSourceFile(), name: text(decl.name) };
  }
  return null;
}
function handlers(node, seen = new Set()) {
  if (!node || seen.has(node)) return []; seen.add(node);
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
    const nested = [];
    if (node.body) walk(node.body, part => {
      if (ts.isCallExpression(part) && part.arguments.some(arg => ['req', 'res'].includes(text(arg)))) nested.push(...handlers(part.expression, seen));
    });
    return [node, ...nested];
  }
  if (ts.isCallExpression(node)) {
    if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'bind') return handlers(node.expression.expression, seen);
    const inline = node.arguments.flatMap(arg => handlers(arg, seen));
    if (inline.length) return inline;
    return handlers(node.expression, seen);
  }
  const decl = declaration(node);
  if (decl && ts.isVariableDeclaration(decl)) return handlers(decl.initializer, seen);
  if (decl && decl !== node) return handlers(decl, seen);
  return [];
}
function authOf(nodes, initial) {
  const result = { authenticated: initial.authenticated, roles: [...initial.roles] };
  for (const node of nodes) {
    if (/\bauthMiddleware\b/.test(text(node))) result.authenticated = true;
    const match = text(node).match(/authorizeRoles\(([^)]*)\)/);
    if (match) {
      const roles = [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
      result.roles = result.roles.length ? result.roles.filter(role => roles.includes(role)) : roles;
    }
  }
  return result;
}
function typeSchema(type, depth = 0, seen = new Set()) {
  if (!type || depth > 3 || seen.has(type)) return {};
  const next = new Set(seen).add(type);
  if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter)) return {};
  if (type.isUnion()) {
    const types = type.types.filter(t => !(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)));
    const nullable = types.length !== type.types.length && type.types.some(t => t.flags & ts.TypeFlags.Null);
    const schemas = types.map(t => typeSchema(t, depth, next));
    const unique = [...new Map(schemas.map(s => [JSON.stringify(s), s])).values()];
    if (!unique.length) return { nullable: true };
    const literals = types.every(t => t.isStringLiteral());
    if (literals) return { type: 'string', enum: types.map(t => t.value), ...(nullable ? { nullable: true } : {}) };
    if (unique.length === 1) return { ...unique[0], ...(nullable ? { nullable: true } : {}) };
    return { anyOf: unique, ...(nullable ? { nullable: true } : {}) };
  }
  if (type.flags & ts.TypeFlags.StringLike) return { type: 'string' };
  if (type.flags & ts.TypeFlags.NumberLike) return { type: 'number' };
  if (type.flags & ts.TypeFlags.BooleanLike) return { type: 'boolean' };
  const name = type.getSymbol()?.name;
  if (name === 'Date') return { type: 'string', format: 'date-time' };
  if (name === 'Decimal') return { type: 'string', description: 'Ondalık tutar (JSON metin).' };
  if (checker.isArrayType(type)) return { type: 'array', items: typeSchema(checker.getTypeArguments(type)[0], depth + 1, next) };
  const props = checker.getPropertiesOfType(type).filter(p => !p.name.startsWith('__')).slice(0, 45);
  if (!props.length || depth === 3) return { type: 'object', additionalProperties: true };
  const properties = {};
  for (const prop of props) {
    const decl = prop.valueDeclaration || prop.declarations?.[0];
    if (decl && !ts.isMethodDeclaration(decl)) properties[prop.name] = typeSchema(checker.getTypeOfSymbolAtLocation(prop, decl), depth + 1, next);
  }
  return { type: 'object', properties };
}
function inputSchema(name, defaultValue, context) {
  if (defaultValue !== undefined) return { type: typeof defaultValue === 'number' ? 'number' : typeof defaultValue, default: defaultValue };
  if (/password/i.test(name)) return { type: 'string', format: 'password', writeOnly: true };
  if (/^(is[A-Z_]|has[A-Z_]|can[A-Z_]|hide[A-Z]|only[A-Z]|include[A-Z])/.test(name) || /^(is_|has_|can_)/.test(name) || ['receipt_printed', 'limitsiz_acik_hesap'].includes(name)) return { type: 'boolean' };
  if (new RegExp(`Array\\.isArray\\(\\s*${name}\\s*\\)`).test(context) || ['items', 'barcodes', 'collectionPrices', 'cutTypeIds', 'orderIds', 'productIds', 'sizeOptions', 'priceListIds'].includes(name)) {
    return { type: 'array', items: /(Ids|barcodes)$/.test(name) ? { type: 'string' } : { type: 'object', additionalProperties: true } };
  }
  if (/(^|_)(quantity|width|height|price|amount|balance|rate|limit|page|stock|count|m2)(_|$)/i.test(name) || /^(pageSize|perPage|sortOrder|totalPrice|unitPrice|pricePerSquareMeter|exchangeRate)$/.test(name)) return { type: 'number' };
  if (/email|eposta/i.test(name)) return { type: 'string', format: 'email' };
  if (/(date|Date|_at)$/.test(name)) return { type: 'string', description: 'Tarih filtresi; endpoint tarafından kabul edilen ISO tarih.' };
  return { type: 'string' };
}
function describe(nodes) {
  const fields = { body: {}, query: {} }, required = { body: new Set(), query: new Set() }, responses = {};
  const context = nodes.map(text).join('\n');
  const aliases = new Map([['req.body', 'body'], ['req.query', 'query']]);
  const variables = new Map();
  const add = (kind, key, node, initial) => { if (key) { fields[kind][key] ||= inputSchema(key, literal(initial), context); if (node) variables.set(text(node), { kind, key }); } };
  for (const node of nodes) walk(node, part => {
    if (ts.isVariableDeclaration(part) && aliases.has(text(part.initializer))) {
      const kind = aliases.get(text(part.initializer));
      if (ts.isObjectBindingPattern(part.name)) {
        for (const element of part.name.elements) add(kind, text(element.propertyName || element.name), element.name, element.initializer);
      } else aliases.set(text(part.name), kind);
    }
    if (ts.isPropertyAccessExpression(part) && aliases.has(text(part.expression))) add(aliases.get(text(part.expression)), part.name.text, part);
  });
  function mandatory(condition) {
    if (ts.isParenthesizedExpression(condition)) return mandatory(condition.expression);
    if (ts.isPrefixUnaryExpression(condition) && condition.operator === ts.SyntaxKind.ExclamationToken) return variables.has(text(condition.operand)) ? [variables.get(text(condition.operand))] : [];
    if (ts.isBinaryExpression(condition) && condition.operatorToken.kind === ts.SyntaxKind.BarBarToken) return [...mandatory(condition.left), ...mandatory(condition.right)];
    return [];
  }
  for (const node of nodes) walk(node, part => {
    if (ts.isIfStatement(part) && /\.status\(400\)/.test(text(part.thenStatement))) {
      for (const field of mandatory(part.expression)) required[field.kind].add(field.key);
    }
    if (ts.isCallExpression(part) && ts.isPropertyAccessExpression(part.expression) && ['json', 'send', 'redirect'].includes(part.expression.name.text) && /^res\b/.test(text(part.expression.expression))) {
      const operation = part.expression.name.text;
      const match = text(part.expression.expression).match(/\.status\((\d+)\)/);
      const code = match?.[1] || (operation === 'redirect' ? '302' : '200');
      const schema = part.arguments[0] ? typeSchema(checker.getTypeAtLocation(part.arguments[0])) : {};
      let media = operation === 'json' ? 'application/json' : 'text/html';
      if (operation === 'send' && schema.type === 'object') media = 'application/json';
      responses[code] ||= { description: Number(code) < 400 ? 'Başarılı yanıt' : 'İşlem veya doğrulama hatası', ...(operation !== 'redirect' ? { content: {} } : {}) };
      if (operation !== 'redirect') responses[code].content[media] ||= { schema };
    }
  });
  return { fields, required, responses, context };
}
function join(prefix, suffix) { return ('/' + [prefix, suffix].join('/').split('/').filter(Boolean).join('/')); }
function expand(route) {
  const match = route.match(/\/(:\w+)\?/);
  return match ? [route.replace(match[0], ''), route.replace('?', '')] : [route];
}
function scan(file, routerName, prefix, inherited, stack = []) {
  const key = file.fileName + ':' + routerName + ':' + prefix;
  if (stack.includes(key)) throw Error('Router mount cycle');
  let auth = inherited;
  for (const statement of file.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isCallExpression(statement.expression)) continue;
    const call = statement.expression;
    if (!ts.isPropertyAccessExpression(call.expression) || text(call.expression.expression) !== routerName) continue;
    const method = call.expression.name.text;
    const route = literal(call.arguments[0]);
    if (method === 'use') {
      const args = typeof route === 'string' ? call.arguments.slice(1) : [...call.arguments];
      const nextAuth = authOf(args, auth);
      const target = args.map(arg => routerTarget(arg)).find(Boolean);
      if (target) scan(target.file, target.name, join(prefix, typeof route === 'string' ? route : ''), nextAuth, [...stack, key]);
      else if (typeof route !== 'string') auth = nextAuth;
      continue;
    }
    if (!methods.has(method) || typeof route !== 'string') continue;
    const handlerArg = call.arguments[call.arguments.length - 1];
    const nodes = handlers(handlerArg);
    if (!nodes.length) unresolved.push({ file: relative(file.fileName), handler: text(handlerArg) });
    const routeAuth = authOf(call.arguments.slice(1, -1), auth);
    const info = describe(nodes);
    if (/req\.headers\.authorization/.test(info.context)) routeAuth.authenticated = true;
    const comments = ts.getLeadingCommentRanges(file.text, statement.pos) || [];
    const comment = comments.map(c => file.text.slice(c.pos, c.end)).join(' ').replace(/\/\*\*?|\*\/|\/\/|\*/g, '').replace(/\s+/g, ' ').trim();
    for (const rawPath of expand(join(prefix, route))) {
      const apiPath = rawPath.replace(/:(\w+)/g, '{$1}');
      const operationId = method + '_' + apiPath.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
      if (paths[apiPath]?.[method]) throw Error(`Duplicate route ${method} ${apiPath}`);
      const tag = apiPath.startsWith('/api/admin/') ? 'Admin · ' + apiPath.split('/')[3] : apiPath.split('/')[2] || 'Sistem';
      const parameters = [...apiPath.matchAll(/\{([^}]+)\}/g)].map(match => ({ name: match[1], in: 'path', required: true, schema: { type: 'string' } }));
      for (const [name, schema] of Object.entries(info.fields.query)) parameters.push({ name, in: 'query', required: info.required.query.has(name), schema });
      const operation = {
        tags: [tag], operationId,
        summary: comment.replace(/@\w+.*$/, '').slice(0, 150) || `${method.toUpperCase()} ${apiPath}`,
        description: `${routeAuth.authenticated ? 'Bearer JWT gerektirir.' : 'Rota seviyesinde Bearer JWT zorunlu değildir.'}${routeAuth.roles.length ? ' Roller: ' + routeAuth.roles.join(', ') + '.' : ''}\n\nKaynak: ${relative(file.fileName)}; handler: ${text(handlerArg).split('\n')[0].slice(0, 100)}.`,
        security: routeAuth.authenticated ? [{ bearerAuth: [] }] : [],
        ...(parameters.length ? { parameters } : {}),
        responses: Object.keys(info.responses).length ? info.responses : { '200': { description: 'Başarılı yanıt', content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } } } },
        'x-source-file': relative(file.fileName), 'x-roles': routeAuth.roles
      };
      if (routeAuth.authenticated) operation.responses['401'] ||= { $ref: '#/components/responses/Unauthorized' };
      if (routeAuth.roles.length) operation.responses['403'] ||= { $ref: '#/components/responses/Forbidden' };
      operation.responses['500'] ||= { $ref: '#/components/responses/ServerError' };
      if (!['get', 'head'].includes(method) && Object.keys(info.fields.body).length) {
        operation.requestBody = { required: info.required.body.size > 0, content: { 'application/json': { schema: {
          type: 'object', properties: info.fields.body,
          ...(info.required.body.size ? { required: [...info.required.body] } : {})
        } } } };
      }
      paths[apiPath] ||= {}; paths[apiPath][method] = operation;
      inventory.push({ method, path: apiPath, source: relative(file.fileName), handler: text(handlerArg).split('\n')[0].slice(0, 100) });
    }
  }
}

scan(program.getSourceFile(path.join(root, 'src/server.ts')), 'app', '', { authenticated: false, roles: [] });
if (unresolved.length) throw Error('Unresolved handlers: ' + JSON.stringify(unresolved));
const spec = {
  openapi: '3.0.3',
  info: { title: 'Pasha Backend API', version: '1.0.0', description: 'Mevcut Express rotalarının OpenAPI dokümanı. Authorize alanına JWT girin. Eski ve yeni API sürümleri birlikte listelenir. Route ve controller kaynaklarından üretilir; özel payload sözleşmeleri overrides dosyasında tutulur.' },
  servers: [{ url: '/', description: 'Bu Swagger arayüzünün çalıştığı sunucu' }],
  tags: [...new Set(Object.values(paths).flatMap(item => Object.values(item).flatMap(op => op.tags)))].sort().map(name => ({ name })),
  paths,
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: { Error: { type: 'object', properties: { success: { type: 'boolean', example: false }, message: { type: 'string' }, code: { type: 'string' } } } },
    responses: Object.fromEntries([['Unauthorized', 'Kimlik doğrulama gerekli'], ['Forbidden', 'Yetkiniz yok'], ['ServerError', 'Sunucu hatası']].map(([key, description]) => [key, { description, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }]))
  }
};
require('./openapi-overrides.cjs')(spec);
const json = JSON.stringify(spec, null, 2) + '\n';
const output = path.join(root, 'src/docs/openapi.json');
const manifest = path.join(root, 'docs/api-route-inventory.json');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8').replace(/\r\n/g, '\n') !== json) throw Error('OpenAPI güncel değil; npm run docs:generate çalıştırın');
  if (!fs.existsSync(manifest) || fs.readFileSync(manifest, 'utf8').replace(/\r\n/g, '\n') !== JSON.stringify(inventory, null, 2) + '\n') throw Error('API envanteri güncel değil; npm run docs:generate çalıştırın');
} else {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, json);
  fs.writeFileSync(manifest, JSON.stringify(inventory, null, 2) + '\n');
}
console.log(JSON.stringify({ operations: inventory.length, paths: Object.keys(paths).length, tags: spec.tags.length }));
