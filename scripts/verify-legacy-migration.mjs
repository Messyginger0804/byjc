// Applies migrations 0000-0001 (what main deploys), loads db/fixtures/legacy-shaped.sql,
// then applies every remaining migration. Run against an EMPTY throwaway database:
//   DATABASE_URL=postgres://postgres:pw@localhost:55432/legacy node scripts/verify-legacy-migration.mjs
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getDatabaseConfig } from '../src/lib/databaseConfig.js';

const LEGACY_MIGRATION_COUNT = 2;
const pool = new pg.Pool(getDatabaseConfig());
const tmp = mkdtempSync(path.join(tmpdir(), 'legacy-mig-'));

try {
    cpSync('db/migrations', tmp, { recursive: true });
    const journalPath = path.join(tmp, 'meta', '_journal.json');
    const full = JSON.parse(readFileSync(journalPath, 'utf8'));
    writeFileSync(journalPath, JSON.stringify({ ...full, entries: full.entries.slice(0, LEGACY_MIGRATION_COUNT) }));
    await migrate(drizzle(pool), { migrationsFolder: tmp });
    await pool.query(readFileSync('db/fixtures/legacy-shaped.sql', 'utf8'));
    await migrate(drizzle(pool), { migrationsFolder: 'db/migrations' });
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM blogs');
    console.log(`Legacy migration replay OK (${rows[0].n} blogs preserved)`);
} finally {
    rmSync(tmp, { recursive: true, force: true });
    await pool.end();
}
