require('dotenv').config();
const {PrismaClient}=require('../generated/prisma');const db=new PrismaClient();
const fs=require('fs');const assert=require('node:assert/strict');
(async()=>{
 const tables=['User','Collection','Store','Order','OrderItem'];
 const protectedData={};
 for(const table of tables){
  const rows=await db.$queryRawUnsafe(`SELECT count(*)::int AS count, md5(COALESCE(string_agg(hash, '' ORDER BY hash),'')) AS fingerprint FROM (SELECT md5(to_jsonb(t)::text) AS hash FROM "${table}" t) q`);
  protectedData[table]=rows[0];
 }
 const total=await db.productStock.aggregate({_sum:{availableAreaM2:true}});
 const widthTable=await db.$queryRawUnsafe("SELECT to_regclass('public.product_stock_widths')::text AS name");
 const widthStockEnabled=Boolean(widthTable[0]?.name);
 const rows=await db.productStock.findMany({select:{
  productId:true,availableAreaM2:true,reservedAreaM2:true,
  ...(widthStockEnabled?{widthStocks:{select:{width:true,availableAreaM2:true,reservedAreaM2:true}}}:{}),
  lots:{select:{remainingAreaM2:true,...(widthStockEnabled?{width:true}:{})}},
  movements:{select:{areaM2:true}},
  reservations:{where:{status:'ACTIVE'},select:{areaM2:true,...(widthStockEnabled?{width:true}:{})}}
 }});
 const failures=[];
 for(const s of rows){
  const area=Number(s.availableAreaM2),ledger=s.movements.reduce((a,m)=>a+Number(m.areaM2),0),reserved=s.reservations.reduce((a,r)=>a+Number(r.areaM2),0);
  const widthStocks=s.widthStocks||[];
  const widthArea=widthStocks.reduce((a,w)=>a+Number(w.availableAreaM2),0),widthReserved=widthStocks.reduce((a,w)=>a+Number(w.reservedAreaM2),0);
  let invalidWidth=widthStockEnabled&&(Math.abs(area-widthArea)>0.0001||Math.abs(Number(s.reservedAreaM2)-widthReserved)>0.0001);
  for(const w of widthStocks){
   const width=Number(w.width),lots=s.lots.filter(l=>Number(l.width)===width).reduce((a,l)=>a+Number(l.remainingAreaM2),0),reservations=s.reservations.filter(r=>Number(r.width)===width).reduce((a,r)=>a+Number(r.areaM2),0);
   if(Math.abs(Math.max(0,Number(w.availableAreaM2))-lots)>0.0001||Math.abs(Number(w.reservedAreaM2)-reservations)>0.0001)invalidWidth=true;
  }
  if(Math.abs(area-ledger)>0.0001||Math.abs(Number(s.reservedAreaM2)-reserved)>0.0001||invalidWidth)failures.push(s.productId);
 }
 const report={protectedData,totalAreaM2:String(total._sum.availableAreaM2),productCount:await db.product.count(),visibleProducts:await db.product.count({where:{canonicalProductId:null}}),aliases:await db.product.count({where:{canonicalProductId:{not:null}}}),widthStockEnabled,failures};
 if(process.argv.includes('--baseline')){fs.mkdirSync('.tmp',{recursive:true});fs.writeFileSync('.tmp/common-rollout-baseline.json',JSON.stringify(report,null,2));}
 else if(process.argv.includes('--compare')){const before=JSON.parse(fs.readFileSync('.tmp/common-rollout-baseline.json','utf8'));assert.deepEqual(report.protectedData,before.protectedData);assert.equal(report.totalAreaM2,before.totalAreaM2);assert.equal(report.productCount,before.productCount);}
 console.log(JSON.stringify(report,null,2));assert.deepEqual(failures,[]);
})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>db.$disconnect());
