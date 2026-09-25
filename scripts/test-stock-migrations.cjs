require('dotenv').config();
const {Client}=require('pg');
const fs=require('fs');
const assert=require('node:assert/strict');
const {randomUUID}=require('crypto');
const connection=new URL(process.env.DATABASE_URL);
// Match the existing Prisma sslmode=require connection to this Railway DB.
const requireSsl=connection.searchParams.get('sslmode')==='require';
if(requireSsl) connection.searchParams.delete('sslmode');
const client=new Client({connectionString:connection.toString(), ...(requireSsl?{ssl:{rejectUnauthorized:false}}:{})});
(async()=>{
 await client.connect();await client.query('BEGIN');
 try {
  for(const name of ['20260924040000_product_aliases','20260924050000_cart_stock_reservations','20260924060000_cart_reservation_lock_order','20260924070000_reservation_alias_lock','20260924080000_width_based_product_stock','20260925070000_normalize_optional_height']) {
   const applied=await client.query('SELECT 1 FROM _prisma_migrations WHERE migration_name=$1 AND finished_at IS NOT NULL AND rolled_back_at IS NULL',[name]);
   if(applied.rowCount)continue;
   const sql=fs.readFileSync(`prisma/migrations/${name}/migration.sql`,'utf8').replace(/^BEGIN;\s*$/gm,'').replace(/^COMMIT;\s*$/gm,'');
   await client.query(sql);
  }
  assert.equal(Number((await client.query('SELECT count(*) count FROM productsizeoptions WHERE is_optional_height=TRUE AND height<>0')).rows[0].count),0);
  const user=(await client.query('SELECT user_id FROM "User" LIMIT 1')).rows[0];
  const product=(await client.query('SELECT ps.product_id,w.width FROM product_stocks ps JOIN product_stock_widths w ON w.product_stock_id=ps.id ORDER BY ps.product_id,w.width LIMIT 1')).rows[0];
  const stock=(await client.query('SELECT reserved_area_m2 FROM product_stocks WHERE product_id=$1',[product.product_id])).rows[0];
  const before=Number(stock.reserved_area_m2);
  const areaFor=quantity=>Number(product.width)*200*quantity/10000;
  const cart=(await client.query('INSERT INTO carts(user_id,is_active) VALUES($1,true) RETURNING id',[user.user_id])).rows[0];
  const item=(await client.query('INSERT INTO cart_items(cart_id,product_id,quantity,width,height,area_m2,unit_price,total_price) VALUES($1,$2,2,$3,200,2,1,4) RETURNING id',[cart.id,product.product_id,product.width])).rows[0];
  const reserved=async()=>Number((await client.query('SELECT reserved_area_m2 FROM product_stocks WHERE product_id=$1',[product.product_id])).rows[0].reserved_area_m2);
  assert.equal(await reserved(),before+areaFor(2));
  const widthReserved=async()=>Number((await client.query('SELECT w.reserved_area_m2 FROM product_stock_widths w JOIN product_stocks ps ON ps.id=w.product_stock_id WHERE ps.product_id=$1 AND w.width=$2',[product.product_id,product.width])).rows[0].reserved_area_m2);
  const widthBefore=await widthReserved()-areaFor(2);
  assert.equal(await widthReserved(),widthBefore+areaFor(2));
  await client.query('UPDATE cart_items SET quantity=3 WHERE id=$1',[item.id]);assert.equal(await reserved(),before+areaFor(3));assert.equal(await widthReserved(),widthBefore+areaFor(3));
  await client.query('UPDATE carts SET is_active=false WHERE id=$1',[cart.id]);assert.equal(await reserved(),before);assert.equal(await widthReserved(),widthBefore);
  await client.query('UPDATE carts SET is_active=true WHERE id=$1',[cart.id]);assert.equal(await reserved(),before+areaFor(3));assert.equal(await widthReserved(),widthBefore+areaFor(3));
  await client.query('DELETE FROM cart_items WHERE id=$1',[item.id]);assert.equal(await reserved(),before);assert.equal(await widthReserved(),widthBefore);
  console.log('PASS: migration dry-run, cart reservation insert/update/deactivate/reactivate/delete; all rolled back');
 } finally {await client.query('ROLLBACK');await client.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
