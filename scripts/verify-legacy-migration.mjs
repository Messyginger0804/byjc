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

function assertEqual(actual, expected, label) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Unexpected ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

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
    const { rows: ranks } = await pool.query("SELECT top10_rank FROM jokes WHERE setup = 's3'");
    if (ranks.length !== 1 || ranks[0].top10_rank !== 2) {
        throw new Error(`Expected joke s3 to keep rank 2, got ${JSON.stringify(ranks)}`);
    }
    const { rows: slots } = await pool.query('SELECT slug, featured_slot FROM blogs ORDER BY slug');
    const slotBySlug = Object.fromEntries(slots.map((r) => [r.slug, r.featured_slot]));
    const expectedSlots = { a: null, b: 'featured-main', c: 'featured-secondary-1', d: null, e: null };
    assertEqual(slotBySlug, expectedSlots, 'featured slots after 0004');
    const { rows: audit } = await pool.query(
        'SELECT k.reason, k.featured_slot, b.slug FROM blogs_featured_slot_backup_0004 k JOIN blogs b ON b.id = k.id ORDER BY b.slug',
    );
    assertEqual(
        audit,
        [
            { reason: 'duplicate_slot', featured_slot: 'featured-main', slug: 'a' },
            { reason: 'invalid_slot', featured_slot: 'legacy-bogus', slug: 'd' },
        ],
        'featured slot audit rows',
    );
    console.log(`Legacy migration replay OK (${rows[0].n} blogs preserved)`);
} finally {
    rmSync(tmp, { recursive: true, force: true });
    await pool.end();
}
