import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const {
    OVERWRITE_FLAG,
    shouldOverwrite,
    migrate,
} = require('./migrate-json-to-pg.cjs');

const sourceBlogs = [{
    title: 'One', description: 'Description', content: 'Content', image: null,
    author: 'Author', tags: [], isPublished: true,
    publishedAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
}];

describe('migrate-json-to-pg', () => {
    it('only overwrites existing slugs when the explicit flag is passed', () => {
        expect(shouldOverwrite([])).toBe(false);
        expect(shouldOverwrite(['--yes'])).toBe(false);
        expect(shouldOverwrite([OVERWRITE_FLAG])).toBe(true);
    });

    it('refuses a remote database with TLS verification disabled instead of connecting', () => {
        const scriptPath = fileURLToPath(new URL('./migrate-json-to-pg.cjs', import.meta.url));
        const result = spawnSync(process.execPath, [scriptPath], {
            env: { ...process.env, DATABASE_URL: 'postgresql://u:p@db.example.com/x', DATABASE_SSL_MODE: 'no-verify' },
            encoding: 'utf8',
        });

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('TLS certificate verification cannot be disabled');
    });

    it('never deletes blogs (comments cascade) and skips existing slugs by default', async () => {
        const statements = [];
        const client = { query: vi.fn(async (text) => statements.push(String(text).trim())) };

        await migrate(client, sourceBlogs, { log: vi.fn() });
        expect(statements.some((s) => /DELETE\s+FROM/i.test(s))).toBe(false);
        const insert = statements.find((s) => s.startsWith('INSERT INTO blogs'));
        expect(insert).toContain('ON CONFLICT (slug) DO NOTHING');
    });

    it('updates in place with --overwrite so blog ids and comments survive', async () => {
        const statements = [];
        const client = { query: vi.fn(async (text) => statements.push(String(text).trim())) };

        await migrate(client, sourceBlogs, { log: vi.fn() }, { overwrite: true });
        const insert = statements.find((s) => s.startsWith('INSERT INTO blogs'));
        expect(insert).toContain('ON CONFLICT (slug) DO UPDATE');
        expect(statements.some((s) => /DELETE\s+FROM/i.test(s))).toBe(false);
    });

    it('rolls back the inserts when any insert fails', async () => {
        const statements = [];
        const client = {
            query: vi.fn(async (text) => {
                const statement = String(text).trim();
                statements.push(statement);
                if (statement.startsWith('INSERT INTO blogs')) throw new Error('insert failed');
            }),
        };

        await expect(migrate(client, sourceBlogs, { log: vi.fn() })).rejects.toThrow('insert failed');
        expect(statements).toContain('BEGIN');
        expect(statements).toContain('ROLLBACK');
        expect(statements).not.toContain('COMMIT');
    });

    it('commits only after every insert succeeds', async () => {
        const statements = [];
        const client = { query: vi.fn(async (text) => statements.push(String(text).trim())) };

        await migrate(client, sourceBlogs, { log: vi.fn() });
        expect(statements[0]).toBe('BEGIN');
        expect(statements.at(-1)).toBe('COMMIT');
        expect(statements).not.toContain('ROLLBACK');
    });
});
