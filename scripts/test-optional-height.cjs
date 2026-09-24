const assert = require('node:assert/strict');
const { mock } = require('node:test');
const { normalizeSizeOption } = require('../dist/utils/product-size-option');
const prisma = {
  productrules: { findUnique: async()=>null },
  productsizeoptions: { findFirst: async()=>null, create: async()=>null, update: async()=>null },
  $transaction: async()=>null,
  $disconnect: async()=>{}
};
require.cache[require.resolve('../dist/utils/prisma')] = { loaded: true, exports: { __esModule: true, default: prisma } };
const { ProductRulesController } = require('../dist/admin/product-rules-controller');

(async () => {
  assert.deepEqual(normalizeSizeOption({width: 100, isOptionalHeight: true}), {width:100,height:0,is_optional_height:true});
  assert.equal(normalizeSizeOption({width:100,height:1000,isOptionalHeight:true}).height,0);
  assert.throws(()=>normalizeSizeOption({width:100}));
  assert.throws(()=>normalizeSizeOption({width:100,height:-1}));
  assert.throws(()=>normalizeSizeOption({width:100.5,isOptionalHeight:true}));
  assert.throws(()=>normalizeSizeOption({isOptionalHeight:false},{width:100,height:1000,is_optional_height:true}));
  assert.equal(normalizeSizeOption({height:200,isOptionalHeight:false},{width:100,height:0,is_optional_height:true}).height,200);
  const saved=[];
  mock.method(prisma.productrules,'findUnique',async()=>null);
  mock.method(prisma,'$transaction',async fn=>fn({
    productrules:{create:async()=>({id:123})},
    productsizeoptions:{create:async({data})=>{saved.push(data);return data;}}
  }));
  const controller=new ProductRulesController();
  const invoke=async(method,body,params={})=>{
    const res={code:200,status(code){this.code=code;return this},json(value){this.body=value;return this}};
    await controller[method]({body,params},res);return res;
  };
  let res=await invoke('createProductRule',{name:'Test',sizeOptions:[{width:100,isOptionalHeight:true},{width:100,height:200}]});
  assert.equal(res.code,201);assert.equal(saved.length,2);assert.equal(saved[0].height,0);assert.equal(saved[1].height,200);
  res=await invoke('createProductRule',{name:'Test',sizeOptions:[{width:100}]});
  assert.equal(res.code,400);assert.equal(saved.length,2,'Invalid option must not silently create a rule');
  mock.method(prisma.productrules,'findUnique',async()=>({id:123}));
  mock.method(prisma.productsizeoptions,'findFirst',async()=>null);
  mock.method(prisma.productsizeoptions,'create',async({data})=>data);
  res=await invoke('addSizeOption',{width:80,isOptionalHeight:true},{ruleId:'123'});
  assert.equal(res.code,201);assert.equal(res.body.data.height,0);
  mock.method(prisma.productsizeoptions,'findFirst',async({where})=>where.id===5 ? {id:5,width:80,height:200,is_optional_height:false} : null);
  mock.method(prisma.productsizeoptions,'update',async({data})=>data);
  res=await invoke('updateSizeOption',{isOptionalHeight:true},{ruleId:'123',sizeId:'5'});
  assert.equal(res.code,200);assert.equal(res.body.data.height,0);
  const {ProductService}=require('../dist/product-service');
  const {CartService}=require('../dist/cart-service');
  const {commonStockService}=require('../dist/services/common-stock-service');
  const cart=new CartService();
  mock.method(cart,'getOrCreateCart',async()=>({id:1}));
  mock.method(commonStockService,'getSnapshot',async()=>({enabled:true,consumableAreaM2:0}));
  prisma.cart_items={findFirst:async()=>null,create:async({data})=>data};
  for(const storedHeight of [0,1000]) {
    mock.method(ProductService.prototype,'getProductById',async()=>({sizeOptions:[{width:100,height:storedHeight,is_optional_height:true}],cutTypes:[{name:'standart'}],pricing:{price:10}}));
    const item=await cart.addToCart({userId:'test',productId:'test',quantity:2,width:100,height:2000,hasFringe:false,cutType:'standart'});
    assert.equal(Number(item.area_m2),20);assert.equal(Number(item.total_price),400);
  }
  console.log('PASS: create/add/update custom height without height; fixed dimensions; invalid input; legacy upper bound ignored. Database untouched.');
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>{mock.restoreAll();await prisma.$disconnect()});
