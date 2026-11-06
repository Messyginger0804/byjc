import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const {
    CONFIRMATION_FLAG,
    hasDestructiveConfirmation,
    migrate,
} = require('./migrate-json-to-pg.cjs');

const sourceBlogs = [{
    title: 'One', description: 'Description', content: 'Content', image: null,
    author: 'Author', tags: [], isPublished: true,
    publishedAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
}];

describe('migrate-json-to-pg', () => {
    it('requires the exact automation-friendly destructive confirmation flag', () => {
        expect(hasDestructiveConfirmation([])).toBe(false);
        expect(hasDestructiveConfirmation(['--yes'])).toBe(false);
        expect(hasDestructiveConfirmation([CONFIRMATION_FLAG])).toBe(true);
    });

    it('fails closed with a nonzero exit before connecting when confirmation is absent', () => {
        const scriptPath = fileURLToPath(new URL('./migrate-json-to-pg.cjs', import.meta.url));
        const result = spawnSync(process.execPath, [scriptPath], {
            env: { ...process.env, DATABASE_URL: 'postgresql://unused' },
            encoding: 'utf8',
        });

        expect(result.status).toBe(1);
        expect(result.stderr).toContain(`without ${CONFIRMATION_FLAG}`);
    });

    it('rolls back the delete and inserts when any insert fails', async () => {
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
        expect(statements).toContain('DELETE FROM blogs');
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
