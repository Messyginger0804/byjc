import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
    checkRateLimit: vi.fn(),
    getClientIp: vi.fn(),
    compare: vi.fn(),
    signAdminToken: vi.fn(),
    setAdminCookie: vi.fn(),
    Trusted: class TrustedClientIpError extends Error {},
}));

vi.mock('@/lib/rateLimit', () => ({
    checkRateLimit: m.checkRateLimit,
    getClientIp: m.getClientIp,
    TrustedClientIpError: m.Trusted,
}));
vi.mock('@/lib/adminAuth', () => ({ signAdminToken: m.signAdminToken, setAdminCookie: m.setAdminCookie }));
vi.mock('@/lib/logger', () => ({ log: vi.fn() }));
vi.mock('bcryptjs', () => ({ default: { compare: m.compare } }));

import { POST } from './route.js';

const req = (body) => new Request('https://example.test/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
});

const saved = { ...process.env };

beforeEach(() => {
    vi.resetAllMocks();
    process.env.ADMIN_PASSWORD = '$2a$hash';
    process.env.ADMIN_JWT_SECRET = 'secret';
    m.getClientIp.mockReturnValue('203.0.113.9');
    m.checkRateLimit.mockResolvedValue({ ok: true });
});

afterEach(() => {
    process.env.ADMIN_PASSWORD = saved.ADMIN_PASSWORD;
    process.env.ADMIN_JWT_SECRET = saved.ADMIN_JWT_SECRET;
    if (saved.ADMIN_PASSWORD === undefined) delete process.env.ADMIN_PASSWORD;
    if (saved.ADMIN_JWT_SECRET === undefined) delete process.env.ADMIN_JWT_SECRET;
});

describe('POST /api/admin/login', () => {
    it('returns 503 when trusted client IP cannot be determined', async () => {
        m.getClientIp.mockImplementation(() => { throw new m.Trusted('no ip'); });
        const res = await POST(req({ password: 'x' }));
        expect(res.status).toBe(503);
        expect(m.checkRateLimit).not.toHaveBeenCalled();
    });

    it('rethrows unexpected errors from getClientIp', async () => {
        m.getClientIp.mockImplementation(() => { throw new RangeError('weird'); });
        await expect(POST(req({ password: 'x' }))).rejects.toThrow('weird');
    });

    it('returns 429 with Retry-After when throttled and never checks the password', async () => {
        m.checkRateLimit.mockResolvedValue({ ok: false, retryAfter: 17 });
        const res = await POST(req({ password: 'x' }));
        expect(res.status).toBe(429);
        expect(res.headers.get('Retry-After')).toBe('17');
        expect(m.compare).not.toHaveBeenCalled();
    });

    it('returns 500 when ADMIN_PASSWORD is not configured', async () => {
        delete process.env.ADMIN_PASSWORD;
        const res = await POST(req({ password: 'x' }));
        expect(res.status).toBe(500);
        expect(m.compare).not.toHaveBeenCalled();
    });

    it('returns 500 when ADMIN_JWT_SECRET is not configured', async () => {
        delete process.env.ADMIN_JWT_SECRET;
        const res = await POST(req({ password: 'x' }));
        expect(res.status).toBe(500);
    });

    it('returns 401 for a wrong password and issues no cookie', async () => {
        m.compare.mockResolvedValue(false);
        const res = await POST(req({ password: 'wrong' }));
        expect(res.status).toBe(401);
        expect(m.compare).toHaveBeenCalledWith('wrong', '$2a$hash');
        expect(m.signAdminToken).not.toHaveBeenCalled();
        expect(m.setAdminCookie).not.toHaveBeenCalled();
    });

    it('returns 401 without calling bcrypt when the password is missing', async () => {
        const res = await POST(req({}));
        expect(res.status).toBe(401);
        expect(m.compare).not.toHaveBeenCalled();
        expect(m.setAdminCookie).not.toHaveBeenCalled();
    });

    it.each([
        ['number', 123],
        ['object', { a: 1 }],
        ['array', ['x']],
        ['boolean', true],
        ['empty string', ''],
    ])('returns 401 without calling bcrypt for a %s password', async (_name, password) => {
        const res = await POST(req({ password }));
        expect(res.status).toBe(401);
        expect(m.compare).not.toHaveBeenCalled();
        expect(m.signAdminToken).not.toHaveBeenCalled();
        expect(m.setAdminCookie).not.toHaveBeenCalled();
        expect(res.headers.get('set-cookie')).toBeNull();
    });

    it('signs a token and sets the cookie on success', async () => {
        m.compare.mockResolvedValue(true);
        m.signAdminToken.mockResolvedValue('jwt-token');
        const res = await POST(req({ password: 'right' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ success: true });
        expect(m.setAdminCookie).toHaveBeenCalledWith(expect.anything(), 'jwt-token');
    });

    it('returns 400 for a malformed JSON body and sets no cookie', async () => {
        const bad = new Request('https://example.test/api/admin/login', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '{not json',
        });
        const res = await POST(bad);
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: 'Invalid JSON' });
        expect(res.headers.get('set-cookie')).toBeNull();
        expect(m.compare).not.toHaveBeenCalled();
        expect(m.setAdminCookie).not.toHaveBeenCalled();
    });

    it.each([null, 'secret', 42, ['x']])('returns 400 for non-object body %j', async (body) => {
        const res = await POST(req(body));
        expect(res.status).toBe(400);
        expect(m.compare).not.toHaveBeenCalled();
        expect(m.setAdminCookie).not.toHaveBeenCalled();
    });

    it('still rate limits before parsing a malformed body', async () => {
        m.checkRateLimit.mockResolvedValue({ ok: false, retryAfter: 3 });
        const bad = new Request('https://example.test/api/admin/login', { method: 'POST', body: '{nope' });
        const res = await POST(bad);
        expect(res.status).toBe(429);
    });
});
