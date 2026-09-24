// Applies only this additive migration; never resets or replays historical migrations.
require('dotenv').config();
const { PrismaClient } = require('../generated/prisma');
const fs = require('node:fs');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const name = '20260924010000_order_fulfillment';
const sql = fs.readFileSync(path.join(__dirname, '../prisma/migrations', name, 'migration.sql'), 'utf8').replace(/\r\n/g, '\n');
async function main() {
  const db = new PrismaClient();
  try {
    await db.$transaction(async tx => {
    const client = { query: async (statement, values = []) => {
      if (statement.startsWith('SELECT')) {
        const rows = await tx.$queryRawUnsafe(statement, ...values);
        return { rows, rowCount: rows.length };
      }
      return tx.$executeRawUnsafe(statement, ...values);
    } };
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL search_path = public");
    await tx.$executeRawUnsafe("SELECT pg_advisory_xact_lock(hashtext('pasha_order_fulfillment_migration'))");
    const applied = await client.query('SELECT finished_at, rolled_back_at FROM "_prisma_migrations" WHERE migration_name = $1', [name]);
    const exists = await client.query("SELECT to_regclass('public.order_fulfillment_actions')::text AS table_name");
    if (applied.rows.some(row => row.finished_at && !row.rolled_back_at) && exists.rows[0].table_name) {
      console.log('MIGRATION_ALREADY_APPLIED');
    } else {
      if (applied.rowCount || exists.rows[0].table_name) throw Error('Inconsistent migration state; manual inspection required');
      if (!process.argv.includes('--apply')) {
        console.log('MIGRATION_PENDING: additive table and index only; use --apply');
      } else {
        for (const statement of sql.split(';').map(value => value.trim()).filter(Boolean)) await client.query(statement);
        await client.query('INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, started_at, applied_steps_count) VALUES ($1, $2, NOW(), $3, NOW(), 1)', [randomUUID(), createHash('sha256').update(sql).digest('hex'), name]);
        console.log('MIGRATION_APPLIED: order_fulfillment_actions');
      }
    }
    }, { timeout: 30000 });
  } finally { await db.$disconnect(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
