require('dotenv').config();
const assert=require('node:assert/strict');
const {randomUUID}=require('crypto');
const db=require('../dist/utils/prisma').default;
const {OrderService}=require('../dist/order-service');
const {commonStockService:stock}=require('../dist/services/common-stock-service');
const rollback=new Error('TEST_ROLLBACK');
(async()=>{
 try {
  await db.$transaction(async tx=>{
   const tag=randomUUID();
   const store=await tx.store.create({data:{kurum_adi:`TEST-${tag}`,bakiye:1000,currency:'TRY',limitsiz_acik_hesap:true,is_active:true}});
   const userType=await tx.userType.findFirst();
   const user=await tx.user.create({data:{email:`${tag}@example.invalid`,username:tag,password:'unused-test-only',name:'TEST',surname:'TEST',store_id:store.store_id,userTypeId:userType.id}});
   const collection=await tx.collection.create({data:{name:`TEST-${tag}`,code:tag}});
   const rule=await tx.productrules.create({data:{name:`TEST-${tag}`,can_have_fringe:false,productsizeoptions:{create:{width:100,height:0,is_optional_height:true}}}});
   const product=await tx.product.create({data:{name:`TEST-${tag}`,description:'rollback-only fixture',collectionId:collection.collectionId,rule_id:rule.id}});
   await stock.ensureProductStock(product.productId,tx);
   const list=await tx.priceList.create({data:{name:`TEST-${tag}`,currency:'TRY'}});
   await tx.priceListDetail.create({data:{price_list_id:list.price_list_id,collection_id:collection.collectionId,price_per_square_meter:10}});
   await tx.storePriceList.create({data:{store_id:store.store_id,price_list_id:list.price_list_id}});
   const service=new OrderService(tx,true);
   const line={product_id:product.productId,quantity:2,width:100,height:200,area_m2:2,unit_price:10,total_price:40};
   for(const flow of ['direct','cart','adminCart']) {
    let result;
    if(flow==='direct') result=await service.createAdminOrder({user_id:user.userId,store_id:store.store_id,items:[line]});
    else if(flow==='cart') {
     const cart=await tx.carts.create({data:{user_id:user.userId,cart_items:{create:line}}});
     assert.equal((await stock.getSnapshot(product.productId,tx,100)).reservedAreaM2,4);
     result=await service.createOrderFromCart({user_id:user.userId,cart_id:cart.id});
    } else {
     const cart=await tx.admin_carts.create({data:{admin_user_id:user.userId,target_user_id:user.userId,store_id:store.store_id,admin_cart_items:{create:line}}});
     assert.equal((await stock.getSnapshot(product.productId,tx,100)).reservedAreaM2,4);
     result=await service.createOrderFromAdminCart({user_id:user.userId,admin_cart_id:cart.id});
    }
    assert.equal(result.success,true,result.message);
    assert.equal((await stock.getSnapshot(product.productId,tx)).availableAreaM2,-4);
    assert.equal((await stock.getSnapshot(product.productId,tx,100)).availableAreaM2,-4);
    assert.equal((await stock.getSnapshot(product.productId,tx)).reservedAreaM2,0);
    assert.equal(Number((await tx.store.findUnique({where:{store_id:store.store_id}})).bakiye),960);
    const canceled=await service.cancelOrder(result.order.id,user.userId,'integration test',true);
    assert.equal(canceled.success,true,canceled.message);
    assert.equal((await stock.getSnapshot(product.productId,tx)).availableAreaM2,0);
    assert.equal(Number((await tx.store.findUnique({where:{store_id:store.store_id}})).bakiye),1000);
    const repeat=await service.cancelOrder(result.order.id,user.userId,'repeat',true);assert.equal(repeat.success,false);
    assert.equal((await stock.getSnapshot(product.productId,tx)).availableAreaM2,0);
    console.log(`PASS: ${flow}, negative stock, ledger balance, reservation release, cancel/repeated cancel`);
   }
   throw rollback;
  },{maxWait:15000,timeout:180000});
 } catch(e){if(e!==rollback)throw e;console.log('PASS: all order fixtures rolled back');}
 finally {await db.$disconnect();}
})().catch(e=>{console.error(e);process.exitCode=1;});
