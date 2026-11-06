import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const rows = vi.hoisted(() => ({ value: [] }));
const chain = vi.hoisted(() => {
    const c = {};
    c.select = vi.fn(() => c);
    c.from = vi.fn(() => c);
    c.where = vi.fn(() => c);
    c.orderBy = vi.fn(async () => rows.value);
    return c;
});

vi.mock('./drizzle.js', () => ({ default: chain }));

import config from '../../next-sitemap.config.mjs';

describe('next-sitemap config', () => {
    beforeEach(() => {
        vi.stubEnv('POSTGRES_URL', '');
        vi.stubEnv('DATABASE_URL', '');
        rows.value = [];
        chain.orderBy.mockClear();
    });
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('keeps admin and api routes out of the sitemap and robots allow list', () => {
        expect(config.exclude).toEqual(['/admin/*', '/api/*']);
        expect(config.generateRobotsTxt).toBe(true);
        expect(config.robotsTxtOptions.policies[0]).toMatchObject({
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/'],
        });
    });

    it('returns no paths and does not query when no database is configured', async () => {
        vi.stubEnv('NODE_ENV', 'test');
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(await config.additionalPaths({})).toEqual([]);
        expect(warn).not.toHaveBeenCalled();
        expect(chain.select).not.toHaveBeenCalled();
    });

    it('warns in production when database credentials are missing', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(await config.additionalPaths({})).toEqual([]);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('No database credentials'));
    });

    it('maps published blogs to weekly entries using updated_at, else published_at', async () => {
        vi.stubEnv('DATABASE_URL', 'postgresql://u:p@localhost/x');
        rows.value = [
            { slug: 'a', updated_at: '2026-02-01T00:00:00Z', published_at: '2026-01-01T00:00:00Z' },
            { slug: 'b', updated_at: null, published_at: '2026-01-05T00:00:00Z' },
        ];

        const paths = await config.additionalPaths({});

        expect(paths).toEqual([
            { loc: '/blogs/a', lastmod: '2026-02-01T00:00:00.000Z', changefreq: 'weekly', priority: 0.7 },
            { loc: '/blogs/b', lastmod: '2026-01-05T00:00:00.000Z', changefreq: 'weekly', priority: 0.7 },
        ]);
    });

    it('works with POSTGRES_URL alone and returns [] for no blogs', async () => {
        vi.stubEnv('POSTGRES_URL', 'postgresql://u:p@localhost/x');
        expect(await config.additionalPaths({})).toEqual([]);
        expect(chain.orderBy).toHaveBeenCalledOnce();
    });

    it('propagates database errors so a broken sitemap build fails loudly', async () => {
        vi.stubEnv('DATABASE_URL', 'postgresql://u:p@localhost/x');
        chain.orderBy.mockRejectedValueOnce(new Error('db down'));
        await expect(config.additionalPaths({})).rejects.toThrow('db down');
    });
});
