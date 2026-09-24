import 'dotenv/config';
import { createHash } from 'crypto';
import { Prisma } from '../../generated/prisma';
import prisma from '../utils/prisma';
import assert from 'node:assert/strict';
import { commonStockService } from '../services/common-stock-service';

async function plan(db: Prisma.TransactionClient) {
  const products = await db.product.findMany({
    where: { canonicalProductId: null },
    include: { productStock: true, productvariations: true, productrules: { include: { productsizeoptions: true, productrulecuttypes: true } } },
    orderBy: { productId: 'asc' }
  });
  const groups = new Map<string, typeof products>();
  for (const p of products) {
    const name = p.name.trim().replace(/\s+/g, ' ');
    // Only explicit end-of-name stock form labels are matched. No fuzzy names.
    const base = name.replace(/\s+(?:KESME|HAZIR(?: EBAT)?)$/iu, '').trim();
    if (base === name) continue;
    const key = `${p.collectionId}:${base.toLocaleUpperCase('tr-TR')}`;
    groups.set(key, [...(groups.get(key) || []), p]);
  }
  return [...groups.values()].filter(g => g.length > 1).map(g => {
    const primary = g.find(p => /KESME$/iu.test(p.name.trim()));
    if (!primary || g.length !== 2 || !g.every(p => p.productStock && p.productrules)) {
      throw new Error(`Belirsiz ürün eşleştirmesi: ${g.map(p => p.name).join(', ')}`);
    }
    return { primary, aliases: g.filter(p => p.productId !== primary.productId), name: primary.name.trim().replace(/\s+KESME$/iu, '') };
  });
}

function digest(value: unknown) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }

async function main() {
  const rehearse = process.argv.includes('--rehearse');
  const apply = process.argv.includes('--apply') || rehearse;
  const rollback = new Error('REHEARSAL_ROLLBACK');
  const expectedHash = process.argv.find(a => a.startsWith('--expected-hash='))?.split('=')[1];
  if (apply && !expectedHash) throw new Error('Önce dry-run; --expected-hash zorunlu.');
  try { await prisma.$transaction(async tx => {
    if (apply) {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(724091)::text`;
      await tx.$executeRawUnsafe('LOCK TABLE "Product", productvariations, product_stocks, product_stock_lots, product_stock_movements, product_stock_reservations, productrules, productsizeoptions, productrulecuttypes IN SHARE ROW EXCLUSIVE MODE');
    }
    const groups = await plan(tx);
    const before = await tx.productStock.aggregate({ _sum: { availableAreaM2: true } });
    const hash = digest(groups);
    console.log(JSON.stringify({ apply, hash, groups: groups.map(g => ({ primary: g.primary.productId, name: g.name, aliases: g.aliases.map(p => ({ id: p.productId, name: p.name })), totalAreaM2: [g.primary, ...g.aliases].reduce((s,p)=>s+Number(p.productStock!.availableAreaM2),0) })) }, null, 2));
    if (!apply) return;
    if (expectedHash !== hash) throw new Error('Dry-run sonrası veri değişti; yeni rapor gerekli.');
    for (const g of groups) {
      const members = [g.primary, ...g.aliases];
      const sizes = new Map<string, {width:number; height:number; is_optional_height:boolean}>();
      const cuts = new Set<number>();
      for (const p of members) {
        for (const s of p.productrules!.productsizeoptions) sizes.set(`${s.width}:${s.height}:${!!s.is_optional_height}`, {width:s.width,height:s.height,is_optional_height:!!s.is_optional_height});
        for (const c of p.productrules!.productrulecuttypes) cuts.add(c.cut_type_id);
      }
      const rule = await tx.productrules.create({data:{
        name: `Ortak ürün ${g.primary.productId}`,
        description: `Hazır ebat ve özel kesim: ${g.name}`,
        can_have_fringe: members.some(p=>p.productrules!.can_have_fringe),
        is_active: true,
        productsizeoptions:{create:[...sizes.values()]},
        productrulecuttypes:{create:[...cuts].map(cut_type_id=>({cut_type_id}))}
      }});
      const target = g.primary.productStock!;
      for (const alias of g.aliases) {
        const source = alias.productStock!;
        await tx.productStock.update({where:{id:target.id},data:{availableAreaM2:{increment:source.availableAreaM2},reservedAreaM2:{increment:source.reservedAreaM2}}});
        await tx.productStockLot.updateMany({where:{productStockId:source.id},data:{productStockId:target.id}});
        await tx.productStockMovement.updateMany({where:{productStockId:source.id},data:{productStockId:target.id}});
        await tx.productStockReservation.updateMany({where:{productStockId:source.id},data:{productStockId:target.id}});
        await tx.productStock.update({where:{id:source.id},data:{availableAreaM2:0,reservedAreaM2:0}});
        await tx.product.update({where:{productId:alias.productId},data:{canonicalProductId:g.primary.productId}});
      }
      for (const s of sizes.values()) {
        if (!await tx.productvariations.findFirst({where:{product_id:g.primary.productId,width:s.width,height:s.height}})) {
          await tx.productvariations.create({data:{product_id:g.primary.productId,width:s.width,height:s.height,stock_quantity:0,stock_area_m2:0}});
        }
      }
      await tx.product.update({where:{productId:g.primary.productId},data:{name:g.name,rule_id:rule.id}});
      await tx.productStockMovement.create({data:{productStockId:target.id,productId:g.primary.productId,movementType:'PRODUCT_MERGE',areaM2:0,referenceKey:`product-merge:${g.primary.productId}`,metadata:{sourceProducts:members.map(p=>({id:p.productId,name:p.name,ruleId:p.rule_id,stockAreaM2:String(p.productStock!.availableAreaM2)}))}}});
      const primarySnapshot = await commonStockService.getSnapshot(g.primary.productId, tx);
      for (const alias of g.aliases) assert.deepEqual(await commonStockService.getSnapshot(alias.productId, tx), primarySnapshot);
    }
    const after = await tx.productStock.aggregate({ _sum: { availableAreaM2: true } });
    assert.equal(String(after._sum.availableAreaM2), String(before._sum.availableAreaM2));
    assert.equal((await plan(tx)).length, 0, 'Birleştirme tekrar stok eklememeli');
    if (rehearse) throw rollback;
  }, {maxWait:15000,timeout:180000}); }
  catch (error) { if(error !== rollback) throw error; console.log('PASS: merge rehearsal, shared aliases, stock conservation, idempotence; rolled back'); }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>prisma.$disconnect());
