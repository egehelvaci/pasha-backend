require('dotenv').config();
const assert=require('node:assert/strict');
const {randomUUID}=require('crypto');
const db=require('../dist/utils/prisma').default;
const {commonStockService:stock}=require('../dist/services/common-stock-service');
const {OrderService}=require('../dist/order-service');
const productId=randomUUID(), aliasId=randomUUID(), rollbackId=randomUUID();
const name=`INTEGRATION-STOCK-${productId}`;
let ruleId;
(async()=>{
 const collection=await db.collection.findFirst();assert.ok(collection);
 try {
  await db.$transaction(async tx=>{
   const rule=await tx.productrules.create({data:{name:`RULE-${productId}`,can_have_fringe:false,productsizeoptions:{create:[{width:80,height:100,is_optional_height:false},{width:80,height:0,is_optional_height:true},{width:120,height:0,is_optional_height:true}]}}});ruleId=rule.id;
   await tx.product.create({data:{productId,name,description:'Temporary integration fixture',collectionId:collection.collectionId,rule_id:rule.id}});
   await tx.product.create({data:{productId:aliasId,name:`${name}-alias`,description:'Temporary integration fixture',collectionId:collection.collectionId,canonicalProductId:productId}});
   await stock.ensureProductStock(productId,tx);
  });
  const balance=async(width=80)=>(await stock.getSnapshot(productId,db,width)).availableAreaM2;
  const consume=(area,ref,width=80)=>stock.consumeProductArea({productId,width,areaM2:area,movementType:'ORDER_CONSUMPTION',referenceKey:ref,orderItemId:ref});
  await consume(5,'fixture-shortage');assert.equal(await balance(),-5);
  await consume(5,'fixture-shortage');assert.equal(await balance(),-5);
  await stock.addStock({productId:aliasId,width:80,areaM2:10,movementType:'PURCHASE_RECEIPT',referenceKey:'fixture-receipt-'+productId});assert.equal(await balance(),5);
  await stock.addStock({productId,width:120,areaM2:7,movementType:'PURCHASE_RECEIPT',referenceKey:'fixture-width-120-'+productId});assert.equal(await balance(120),7);assert.equal(await balance(),5);
  await consume(5,'fixture-shortage');assert.equal(await balance(),5);
  const concurrent=await Promise.allSettled([consume(4,'fixture-concurrent-a'),consume(4,'fixture-concurrent-b')]);
  for(const r of concurrent) if(r.status==='rejected') throw r.reason;
  assert.equal(await balance(),-3);
  await stock.addStock({productId,width:80,areaM2:99,movementType:'ORDER_RETURN',orderItemId:'fixture-concurrent-a',referenceKey:'fixture-return-'+productId});
  assert.equal(await balance(),1); // exact recorded consumption, not caller's 99
  await stock.addStock({productId,width:80,areaM2:99,movementType:'ORDER_RETURN',orderItemId:'fixture-concurrent-a',referenceKey:'fixture-return-'+productId});assert.equal(await balance(),1);
  const lots=await db.productStockLot.aggregate({where:{productStock:{productId},width:80},_sum:{remainingAreaM2:true}});assert.equal(Number(lots._sum.remainingAreaM2),1);
  assert.equal((await stock.getSnapshot(aliasId,db,80)).availableAreaM2,1);
  assert.equal((await stock.getSnapshot(aliasId)).availableAreaM2,8);
  // Fault after a database mutation must roll the entire service transaction back.
  const result=await new OrderService().atomic(async service=>{
   await service.db.product.create({data:{productId:rollbackId,name:`${name}-rollback`,description:'Rollback fixture',collectionId:collection.collectionId}});
   return {success:false,message:'Injected failure'};
  });
  assert.equal(result.success,false);assert.equal(await db.product.count({where:{productId:rollbackId}}),0);
  console.log('PASS: shortage replay before/after receipt, alias stock, concurrent consumption, exact/idempotent FIFO return, transaction rollback');
 } finally {
  // Exact generated IDs only; never delete real business products.
  await db.product.deleteMany({where:{productId:aliasId,name:`${name}-alias`}});
  await db.product.deleteMany({where:{productId,name}});
  if(ruleId) await db.productrules.deleteMany({where:{id:ruleId,name:`RULE-${productId}`}});
  await db.product.deleteMany({where:{productId:rollbackId,name:`${name}-rollback`}});
  await db.$disconnect();
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
