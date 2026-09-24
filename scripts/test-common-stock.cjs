require('dotenv').config();
const assert=require('node:assert/strict');
const {randomUUID}=require('crypto');
const db=require('../dist/utils/prisma').default;
const {commonStockService:stock}=require('../dist/services/common-stock-service');
const {OrderService}=require('../dist/order-service');
const productId=randomUUID(), aliasId=randomUUID(), rollbackId=randomUUID();
const name=`INTEGRATION-STOCK-${productId}`;
(async()=>{
 const collection=await db.collection.findFirst();assert.ok(collection);
 try {
  await db.$transaction(async tx=>{
   await tx.product.create({data:{productId,name,description:'Temporary integration fixture',collectionId:collection.collectionId}});
   await tx.product.create({data:{productId:aliasId,name:`${name}-alias`,description:'Temporary integration fixture',collectionId:collection.collectionId,canonicalProductId:productId}});
   await stock.ensureProductStock(productId,tx);
  });
  const balance=async()=>Number((await db.productStock.findUnique({where:{productId}})).availableAreaM2);
  const consume=(area,ref)=>stock.consumeProductArea({productId,areaM2:area,movementType:'ORDER_CONSUMPTION',referenceKey:ref,orderItemId:ref});
  await consume(5,'fixture-shortage');assert.equal(await balance(),-5);
  await consume(5,'fixture-shortage');assert.equal(await balance(),-5);
  await stock.addStock({productId:aliasId,areaM2:10,movementType:'PURCHASE_RECEIPT',referenceKey:'fixture-receipt-'+productId});assert.equal(await balance(),5);
  await consume(5,'fixture-shortage');assert.equal(await balance(),5);
  const concurrent=await Promise.allSettled([consume(4,'fixture-concurrent-a'),consume(4,'fixture-concurrent-b')]);
  for(const r of concurrent) if(r.status==='rejected') throw r.reason;
  assert.equal(await balance(),-3);
  await stock.addStock({productId,areaM2:99,movementType:'ORDER_RETURN',orderItemId:'fixture-concurrent-a',referenceKey:'fixture-return-'+productId});
  assert.equal(await balance(),1); // exact recorded consumption, not caller's 99
  await stock.addStock({productId,areaM2:99,movementType:'ORDER_RETURN',orderItemId:'fixture-concurrent-a',referenceKey:'fixture-return-'+productId});assert.equal(await balance(),1);
  const lots=await db.productStockLot.aggregate({where:{productStock:{productId}},_sum:{remainingAreaM2:true}});assert.equal(Number(lots._sum.remainingAreaM2),1);
  assert.equal((await stock.getSnapshot(aliasId)).availableAreaM2,1);
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
  await db.product.deleteMany({where:{productId:rollbackId,name:`${name}-rollback`}});
  await db.$disconnect();
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
