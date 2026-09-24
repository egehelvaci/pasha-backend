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
 const rows=await db.productStock.findMany({include:{lots:true,movements:true,reservations:{where:{status:'ACTIVE'}}}});
 const failures=[];
 for(const s of rows){
  const area=Number(s.availableAreaM2),ledger=s.movements.reduce((a,m)=>a+Number(m.areaM2),0),lots=s.lots.reduce((a,l)=>a+Number(l.remainingAreaM2),0),reserved=s.reservations.reduce((a,r)=>a+Number(r.areaM2),0);
  if(Math.abs(area-ledger)>0.0001||Math.abs(Math.max(0,area)-lots)>0.0001||Math.abs(Number(s.reservedAreaM2)-reserved)>0.0001)failures.push(s.productId);
 }
 const report={protectedData,totalAreaM2:String(total._sum.availableAreaM2),productCount:await db.product.count(),visibleProducts:await db.product.count({where:{canonicalProductId:null}}),aliases:await db.product.count({where:{canonicalProductId:{not:null}}}),failures};
 if(process.argv.includes('--baseline')){fs.mkdirSync('.tmp',{recursive:true});fs.writeFileSync('.tmp/common-rollout-baseline.json',JSON.stringify(report,null,2));}
 else if(process.argv.includes('--compare')){const before=JSON.parse(fs.readFileSync('.tmp/common-rollout-baseline.json','utf8'));assert.deepEqual(report.protectedData,before.protectedData);assert.equal(report.totalAreaM2,before.totalAreaM2);assert.equal(report.productCount,before.productCount);}
 console.log(JSON.stringify(report,null,2));assert.deepEqual(failures,[]);
})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>db.$disconnect());
