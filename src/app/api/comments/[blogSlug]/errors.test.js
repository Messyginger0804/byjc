import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
    db: { select: vi.fn(), transaction: vi.fn() },
    checkRateLimit: vi.fn(),
    getClientIp: vi.fn(),
}));

vi.mock('../../../../../db/schema.js', () => ({
    blogs: new Proxy({}, { get: (_, k) => `blogs.${String(k)}` }),
    comments: new Proxy({}, { get: (_, k) => `comments.${String(k)}` }),
}));
vi.mock('drizzle-orm', () => ({
    eq: () => ({}), and: () => ({}), desc: () => ({}), gt: () => ({}), lte: () => ({}),
    sql: () => ({}),
}));
vi.mock('@/lib/drizzle', () => ({ default: m.db }));
vi.mock('@/lib/schemas', async () => import('../../../../lib/schemas.js'));
vi.mock('@/lib/rateLimit', () => ({
    checkRateLimit: m.checkRateLimit,
    getClientIp: m.getClientIp,
    TrustedClientIpError: class extends Error {},
}));

import { GET, POST } from './route.js';

const params = Promise.resolve({ blogSlug: 'some-post' });
const post = (raw) => new Request('https://example.test/api/comments/some-post', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: raw,
});

beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    m.getClientIp.mockReturnValue('203.0.113.5');
    m.checkRateLimit.mockResolvedValue({ ok: true });
});

describe('comments route error paths', () => {
    it('GET returns 500 when the query throws', async () => {
        m.db.select.mockImplementation(() => { throw new Error('db down'); });
        const res = await GET(new Request('https://example.test/x'), { params });
        expect(res.status).toBe(500);
        expect((await res.json()).error).toBe('Failed to fetch comments');
    });

    it('POST returns 429 with Retry-After and skips the DB when rate limited', async () => {
        m.checkRateLimit.mockResolvedValue({ ok: false, retryAfter: 9 });
        const res = await POST(post(JSON.stringify({ name: 'a', body: 'b' })), { params });
        expect(res.status).toBe(429);
        expect(res.headers.get('Retry-After')).toBe('9');
        expect(m.checkRateLimit).toHaveBeenCalledWith('comments:203.0.113.5', expect.any(Object));
        expect(m.db.transaction).not.toHaveBeenCalled();
    });

    it('POST returns 400 for malformed JSON', async () => {
        const res = await POST(post('{oops'), { params });
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('Invalid JSON');
    });

    it('POST returns 400 with errors for an invalid comment', async () => {
        const res = await POST(post(JSON.stringify({ name: '', body: 'x'.repeat(2001) })), { params });
        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.errors.length).toBeGreaterThan(0);
        expect(m.db.transaction).not.toHaveBeenCalled();
    });

    it('POST returns 500 when the transaction fails', async () => {
        m.db.transaction.mockRejectedValue(new Error('deadlock'));
        const res = await POST(post(JSON.stringify({ name: 'a', body: 'b' })), { params });
        expect(res.status).toBe(500);
        expect((await res.json()).error).toBe('Failed to create comment');
    });

    it('POST returns 500 when the rate limiter itself throws', async () => {
        m.checkRateLimit.mockRejectedValue(new Error('limiter down'));
        const res = await POST(post(JSON.stringify({ name: 'a', body: 'b' })), { params });
        expect(res.status).toBe(500);
    });
});
