import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireAdminSession = vi.hoisted(() => vi.fn());
const selectChain = vi.hoisted(() => {
    const chain = {};
    chain.from = vi.fn(() => chain);
    chain.where = vi.fn(() => chain);
    chain.orderBy = vi.fn(() => chain);
    chain.limit = vi.fn(() => chain);
    chain.offset = vi.fn(async () => [{ id: 1, setup: 's', punchline: 'p' }]);
    chain.then = (resolve) => resolve([{ total: 1 }]);
    return chain;
});

vi.mock('@/lib/drizzle', () => ({ default: { select: vi.fn(() => selectChain) } }));
vi.mock('@/lib/adminAuth', () => ({ requireAdminSession }));

import { NextResponse } from 'next/server';
import { GET } from './route.js';

const get = (headers = {}) => new Request('https://example.test/api/jokes?page=1&limit=200', { headers });

beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOG_API_SECRET = 'test-secret';
    requireAdminSession.mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
});

describe('jokes GET auth', () => {
    it('lets the API secret list jokes without an admin session', async () => {
        const res = await GET(get({ 'x-blog-secret': 'test-secret' }));
        expect(res.status).toBe(200);
        expect(requireAdminSession).not.toHaveBeenCalled();
        const body = await res.json();
        expect(body.data).toHaveLength(1);
        expect(body.meta).toMatchObject({ page: 1, limit: 200, total: 1, pages: 1 });
    });

    it('rejects a wrong secret and falls back to the admin session check', async () => {
        const res = await GET(get({ 'x-blog-secret': 'nope' }));
        expect(res.status).toBe(401);
        expect(requireAdminSession).toHaveBeenCalled();
    });
});
