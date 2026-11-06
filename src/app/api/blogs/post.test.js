import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
    db: { select: vi.fn(), transaction: vi.fn() },
    auth: vi.fn(),
    checkRateLimit: vi.fn(),
    getClientIp: vi.fn(),
    runFeatured: vi.fn(),
    revalidate: vi.fn(),
    Trusted: class TrustedClientIpError extends Error {},
}));

vi.mock('../../../../db/schema.js', () => ({
    blogs: new Proxy({}, { get: (_, k) => `blogs.${String(k)}` }),
}));
vi.mock('drizzle-orm', () => ({
    eq: (l, r) => ({ op: 'eq', l, r }),
    and: (...c) => ({ op: 'and', c }),
    lte: (l, r) => ({ op: 'lte', l, r }),
    desc: (c) => ({ op: 'desc', c }),
    sql: (s, ...v) => ({ op: 'sql', s, v }),
}));
vi.mock('@/lib/drizzle', () => ({ default: m.db }));
vi.mock('@/lib/blogApiAuth', () => ({ requireBlogApiAuth: m.auth }));
vi.mock('@/lib/rateLimit', () => ({
    checkRateLimit: m.checkRateLimit,
    getClientIp: m.getClientIp,
    TrustedClientIpError: m.Trusted,
}));
vi.mock('@/lib/blogTransactions', () => ({ runFeaturedSlotTransaction: m.runFeatured }));
vi.mock('@/lib/revalidateBlogs', () => ({ revalidateBlogPaths: m.revalidate }));
vi.mock('@/lib/constants', () => ({
    FEATURED_SLOTS: ['featured-main', 'featured-side'],
    isValidFeaturedSlot: (s) => ['featured-main', 'featured-side'].includes(s),
}));

import { GET, POST } from './route.js';

const validBody = (over = {}) => ({
    title: 'Hello',
    description: 'A post',
    content: 'Body text',
    slug: 'hello-world',
    ...over,
});

const req = (body, { raw } = {}) =>
    new Request('https://example.test/api/blogs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: raw ?? JSON.stringify(body),
    });

// Builds a tx whose insert chain resolves to `row` and records calls.
function makeTx(row) {
    const calls = { updateSet: null, values: null };
    const tx = {
        update: vi.fn(() => ({
            set: (v) => {
                calls.updateSet = v;
                return { where: vi.fn().mockResolvedValue(undefined) };
            },
        })),
        insert: vi.fn(() => ({
            values: (v) => {
                calls.values = v;
                return { returning: vi.fn().mockResolvedValue([row]) };
            },
        })),
    };
    return { tx, calls };
}

beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    m.auth.mockReturnValue(null);
    m.getClientIp.mockReturnValue('203.0.113.1');
    m.checkRateLimit.mockResolvedValue({ ok: true });
});

describe('POST /api/blogs', () => {
    it('returns the auth error response without touching anything else', async () => {
        const denied = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        m.auth.mockReturnValue(denied);
        const res = await POST(req(validBody()));
        expect(res.status).toBe(401);
        expect(m.checkRateLimit).not.toHaveBeenCalled();
        expect(m.db.transaction).not.toHaveBeenCalled();
    });

    it('returns 503 when the client identity cannot be established', async () => {
        m.getClientIp.mockImplementation(() => { throw new m.Trusted('x'); });
        const res = await POST(req(validBody()));
        expect(res.status).toBe(503);
        expect((await res.json()).error).toMatch(/trusted client identity/);
    });

    it('rethrows unexpected getClientIp errors', async () => {
        m.getClientIp.mockImplementation(() => { throw new TypeError('boom'); });
        await expect(POST(req(validBody()))).rejects.toThrow('boom');
    });

    it('returns 503 with Retry-After when the rate limiter fails', async () => {
        m.checkRateLimit.mockRejectedValue(new Error('db down'));
        const res = await POST(req(validBody()));
        expect(res.status).toBe(503);
        expect(res.headers.get('Retry-After')).toBe('5');
    });

    it('returns 429 with Retry-After when rate limited, keyed by client IP', async () => {
        m.checkRateLimit.mockResolvedValue({ ok: false, retryAfter: 12 });
        const res = await POST(req(validBody()));
        expect(res.status).toBe(429);
        expect(res.headers.get('Retry-After')).toBe('12');
        expect(m.checkRateLimit).toHaveBeenCalledWith('blogs:203.0.113.1', expect.any(Object));
        expect(m.db.transaction).not.toHaveBeenCalled();
    });

    it('returns 400 for malformed JSON', async () => {
        const res = await POST(req(null, { raw: '{not json' }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('Invalid JSON');
    });

    it('returns 400 with field errors for an invalid body', async () => {
        const res = await POST(req({ title: '', slug: 'Bad Slug' }));
        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toBe('Validation failed');
        expect(json.errors.length).toBeGreaterThan(0);
        expect(m.db.transaction).not.toHaveBeenCalled();
    });

    it('returns 400 for a JSON array body', async () => {
        const res = await POST(req([1, 2]));
        expect(res.status).toBe(400);
    });

    it('rejects an unknown featured_slot', async () => {
        const res = await POST(req(validBody({ featured_slot: 'nope' })));
        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toMatch(/Invalid featured_slot/);
        expect(json.error).toContain('featured-main');
    });

    it('creates a blog with defaults and returns 201', async () => {
        const row = { id: 1, slug: 'hello-world', tags: null };
        const { tx, calls } = makeTx(row);
        m.db.transaction.mockImplementation((fn) => fn(tx));

        const res = await POST(req(validBody()));
        const json = await res.json();

        expect(res.status).toBe(201);
        expect(json.tags).toEqual([]);
        expect(calls.values).toMatchObject({
            slug: 'hello-world',
            is_published: true,
            is_featured: false,
            featured_slot: null,
        });
        expect(calls.values.published_at).toBeInstanceOf(Date);
        expect(tx.update).not.toHaveBeenCalled();
        expect(m.runFeatured).not.toHaveBeenCalled();
        expect(m.revalidate).toHaveBeenCalledWith('hello-world');
    });

    it('honours explicit flags, tags and published_at', async () => {
        const row = { id: 2, slug: 'hello-world', tags: ['a', 'b'] };
        const { tx, calls } = makeTx(row);
        m.db.transaction.mockImplementation((fn) => fn(tx));

        const res = await POST(req(validBody({
            is_published: false,
            is_featured: true,
            tags: ['a', 'b'],
            published_at: '2030-01-02T03:04:05Z',
        })));

        expect(res.status).toBe(201);
        expect((await res.json()).tags).toEqual(['a', 'b']);
        expect(calls.values.is_published).toBe(false);
        expect(calls.values.is_featured).toBe(true);
        expect(calls.values.published_at.toISOString()).toBe('2030-01-02T03:04:05.000Z');
    });

    it('clears the slot holder first and uses the featured-slot transaction', async () => {
        const row = { id: 3, slug: 'hello-world', tags: [], featured_slot: 'featured-main' };
        const { tx, calls } = makeTx(row);
        m.runFeatured.mockImplementation((_db, fn) => fn(tx));

        const res = await POST(req(validBody({ featured_slot: 'featured-main' })));

        expect(res.status).toBe(201);
        expect(m.runFeatured).toHaveBeenCalledTimes(1);
        expect(m.db.transaction).not.toHaveBeenCalled();
        expect(calls.updateSet).toEqual({ featured_slot: null });
        expect(calls.values.featured_slot).toBe('featured-main');
    });

    it('returns 409 on a duplicate slug (unique violation)', async () => {
        m.db.transaction.mockRejectedValue(Object.assign(new Error('dup'), { code: '23505', constraint: 'blogs_slug_key' }));
        const res = await POST(req(validBody()));
        expect(res.status).toBe(409);
        expect((await res.json()).error).toBe('Blog slug already in use');
    });

    it('returns 409 retry message on a featured slot conflict, unwrapping err.cause', async () => {
        const cause = Object.assign(new Error('dup'), { code: '23505', constraint: 'blogs_featured_slot_unique' });
        m.runFeatured.mockRejectedValue(new Error('wrapped', { cause }));
        const res = await POST(req(validBody({ featured_slot: 'featured-side' })));
        expect(res.status).toBe(409);
        expect((await res.json()).error).toMatch(/retry/);
    });

    it('returns 500 for other database errors', async () => {
        m.db.transaction.mockRejectedValue(new Error('connection lost'));
        const res = await POST(req(validBody()));
        expect(res.status).toBe(500);
        expect((await res.json()).error).toBe('Failed to create blog');
        expect(m.revalidate).not.toHaveBeenCalled();
    });
});

describe('GET /api/blogs', () => {
    function mockSelects({ total, rows, debug, failOn }) {
        m.db.select.mockImplementation((sel) => {
            if (failOn === 'count' && 'total' in sel && !('published' in sel)) throw new Error('db');
            if ('published' in sel) {
                return { from: () => Promise.resolve([debug]) };
            }
            if ('total' in sel) {
                return { from: () => ({ where: () => Promise.resolve([{ total }]) }) };
            }
            return {
                from: () => ({
                    where: () => ({
                        orderBy: () => ({ limit: () => ({ offset: () => Promise.resolve(rows) }) }),
                    }),
                }),
            };
        });
    }

    it('normalises non-array tags and reports pagination meta with cache headers', async () => {
        mockSelects({ total: 45, rows: [{ id: 1, tags: null }, { id: 2, tags: ['x'] }] });
        const res = await GET(new Request('https://example.test/api/blogs?page=2&limit=10'));
        const json = await res.json();
        expect(res.headers.get('Cache-Control')).toContain('s-maxage=60');
        expect(json.data.map((d) => d.tags)).toEqual([[], ['x']]);
        expect(json.meta).toEqual({ page: 2, limit: 10, total: 45, pages: 5 });
    });

    it('clamps page and limit and falls back to defaults on junk input', async () => {
        mockSelects({ total: 0, rows: [{ id: 1, tags: [] }] });
        const res = await GET(new Request('https://example.test/api/blogs?page=-3&limit=9999'));
        expect((await res.json()).meta).toMatchObject({ page: 1, limit: 100 });
        const res2 = await GET(new Request('https://example.test/api/blogs?page=abc&limit=abc'));
        expect((await res2.json()).meta).toMatchObject({ page: 1, limit: 20, total: 0, pages: 0 });
    });

    it('logs diagnostics when the first page is empty', async () => {
        mockSelects({ total: 0, rows: [], debug: { total: 3, published: 2, ready: 1 } });
        const res = await GET(new Request('https://example.test/api/blogs'));
        expect(res.status).toBe(200);
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('total:3, published:2, ready:1'));
    });

    it('returns 500 when the query fails', async () => {
        mockSelects({ failOn: 'count' });
        const res = await GET(new Request('https://example.test/api/blogs'));
        expect(res.status).toBe(500);
        expect((await res.json()).error).toBe('Failed to fetch blogs');
    });
});
