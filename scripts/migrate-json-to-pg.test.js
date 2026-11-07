import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

describe('makeSlug', () => {
    const { makeSlug } = require('./migrate-json-to-pg.cjs');

    it('lowercases, strips punctuation/emoji and hyphenates whitespace', () => {
        expect(makeSlug('Welcome to Blogs By JC')).toBe('welcome-to-blogs-by-jc');
        expect(makeSlug('🚀A Shift In Developers Online Tools')).toBe('a-shift-in-developers-online-tools');
        expect(makeSlug("  What's  new?  ")).toBe('whats-new');
    });
});

describe('migrate edge cases', () => {
    it('with no blogs creates the table and commits without inserting', async () => {
        const statements = [];
        const client = { query: vi.fn(async (t) => statements.push(String(t).trim())) };
        await migrate(client, [], { log: vi.fn() });
        expect(statements.some((s) => s.startsWith('INSERT'))).toBe(false);
        expect(statements.at(-1)).toBe('COMMIT');
    });

    it('passes slug and blog fields as parameters, never interpolated', async () => {
        const client = { query: vi.fn(async () => {}) };
        const evil = { ...sourceBlogs[0], title: "Robert'); DROP TABLE blogs;--" };
        await migrate(client, [evil], { log: vi.fn() });
        const call = client.query.mock.calls.find(([t]) => String(t).trim().startsWith('INSERT'));
        expect(call[0]).not.toContain('DROP TABLE');
        expect(call[1][0]).toBe(evil.title);
        expect(call[1][6]).toBe('robert-drop-table-blogs--');
    });

    it('logs each insert', async () => {
        const logger = { log: vi.fn() };
        await migrate({ query: vi.fn(async () => {}) }, sourceBlogs, logger);
        expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('Inserted: One'));
    });

    it('defaults to the bundled blogs and console logger', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const client = { query: vi.fn(async () => {}) };
        await migrate(client);
        expect(client.query.mock.calls.filter(([t]) => String(t).trim().startsWith('INSERT')).length).toBeGreaterThan(0);
        log.mockRestore();
    });

    it('records a failed rollback on the original error and rethrows the original', async () => {
        const rollbackError = new Error('rollback failed');
        const client = {
            query: vi.fn(async (text) => {
                const s = String(text).trim();
                if (s.startsWith('INSERT')) throw new Error('insert failed');
                if (s === 'ROLLBACK') throw rollbackError;
            }),
        };
        const error = await migrate(client, sourceBlogs, { log: vi.fn() }).catch((e) => e);
        expect(error.message).toBe('insert failed');
        expect(error.rollbackError).toBe(rollbackError);
    });
});

describe('main', () => {
    const scriptPath = fileURLToPath(new URL('./migrate-json-to-pg.cjs', import.meta.url));

    // Load a fresh copy of the script with pg.Pool replaced by a fake.
    function loadWithFakePool(fakePool) {
        const pg = require('pg');
        const originalPool = pg.Pool;
        pg.Pool = vi.fn(function Pool() { return fakePool; });
        delete require.cache[scriptPath];
        const mod = require(scriptPath);
        pg.Pool = originalPool;
        delete require.cache[scriptPath];
        return mod;
    }

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('rejects without touching the pool when no database URL is set', async () => {
        vi.stubEnv('DATABASE_URL', '');
        vi.stubEnv('POSTGRES_URL', '');
        const pool = { connect: vi.fn(), end: vi.fn() };
        const { main } = loadWithFakePool(pool);
        await expect(main([])).rejects.toThrow('Missing DATABASE_URL');
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it('migrates, releases the client and ends the pool', async () => {
        vi.stubEnv('DATABASE_URL', 'postgresql://u:p@localhost/x');
        vi.stubEnv('POSTGRES_URL', '');
        vi.spyOn(console, 'log').mockImplementation(() => {});
        const client = { query: vi.fn(async () => {}), release: vi.fn() };
        const pool = { connect: vi.fn(async () => client), end: vi.fn(async () => {}) };
        const { main } = loadWithFakePool(pool);

        await main(['--overwrite']);

        const insert = client.query.mock.calls.find(([t]) => String(t).trim().startsWith('INSERT'));
        expect(insert[0]).toContain('DO UPDATE');
        expect(client.release).toHaveBeenCalledOnce();
        expect(pool.end).toHaveBeenCalledOnce();
        vi.restoreAllMocks();
    });

    it('still ends the pool when connecting fails (no client to release)', async () => {
        vi.stubEnv('DATABASE_URL', 'postgresql://u:p@localhost/x');
        vi.stubEnv('POSTGRES_URL', '');
        const pool = { connect: vi.fn(async () => { throw new Error('refused'); }), end: vi.fn(async () => {}) };
        const { main } = loadWithFakePool(pool);

        await expect(main([])).rejects.toThrow('refused');
        expect(pool.end).toHaveBeenCalledOnce();
    });

    it('releases the client and ends the pool when the migration fails', async () => {
        vi.stubEnv('DATABASE_URL', 'postgresql://u:p@localhost/x');
        vi.stubEnv('POSTGRES_URL', '');
        vi.spyOn(console, 'log').mockImplementation(() => {});
        const client = {
            query: vi.fn(async (t) => { if (String(t).trim().startsWith('INSERT')) throw new Error('bad insert'); }),
            release: vi.fn(),
        };
        const pool = { connect: vi.fn(async () => client), end: vi.fn(async () => {}) };
        const { main } = loadWithFakePool(pool);

        await expect(main([])).rejects.toThrow('bad insert');
        expect(client.release).toHaveBeenCalledOnce();
        expect(pool.end).toHaveBeenCalledOnce();
        vi.restoreAllMocks();
    });
});

describe('CLI entrypoint', () => {
    const scriptPath = fileURLToPath(new URL('./migrate-json-to-pg.cjs', import.meta.url));
    const Module = require('node:module');

    afterEach(() => {
        delete process.mainModule;
        delete require.cache[scriptPath];
        process.exitCode = undefined;
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('reports the failure and sets a non-zero exit code when run as the main module', async () => {
        vi.stubEnv('DATABASE_URL', '');
        vi.stubEnv('POSTGRES_URL', '');
        const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
        // Make the script believe it is the entrypoint (require.main === module).
        Object.defineProperty(process, 'mainModule', {
            configurable: true,
            get: () => Module._cache[scriptPath],
        });
        delete require.cache[scriptPath];

        require(scriptPath);
        await vi.waitFor(() => expect(errors).toHaveBeenCalled());

        expect(errors).toHaveBeenCalledWith('Migration failed:', 'Missing DATABASE_URL environment variable.');
        expect(process.exitCode).toBe(1);
    });
});
