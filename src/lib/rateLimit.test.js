import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('./db.js', () => ({ default: { query: mocks.query } }));

import { checkRateLimit, getClientIp, TrustedClientIpError } from './rateLimit.js';

describe('getClientIp', () => {
    const request = (headers) => ({ headers: new Headers(headers) });

    it('ignores client-spoofable forwarding headers without a trusted platform', () => {
        expect(getClientIp(request({ 'x-forwarded-for': '203.0.113.2', 'x-real-ip': '203.0.113.3' }), { NODE_ENV: 'test' })).toBe('local-development');
    });

    it('accepts only valid Vercel or explicitly configured Cloudflare addresses', () => {
        expect(getClientIp(request({ 'x-vercel-forwarded-for': '203.0.113.4, 10.0.0.1' }), { VERCEL: '1' })).toBe('203.0.113.4');
        expect(getClientIp(request({ 'cf-connecting-ip': '2001:db8::1' }), { TRUSTED_PROXY_PLATFORM: 'cloudflare' })).toBe('2001:db8::1');
        expect(() => getClientIp(request({ 'x-vercel-forwarded-for': 'not-an-ip' }), { VERCEL: '1' })).toThrow(TrustedClientIpError);
    });

    it('fails closed in production when trusted proxy identity is absent or unconfigured', () => {
        expect(() => getClientIp(request({}), { VERCEL: '1', NODE_ENV: 'production' })).toThrow(TrustedClientIpError);
        expect(() => getClientIp(request({ 'x-forwarded-for': '203.0.113.2' }), { NODE_ENV: 'production' })).toThrow(TrustedClientIpError);
    });
});

describe('checkRateLimit', () => {
    it('uses shared SQL storage and bounds keys and counters', async () => {
        mocks.query.mockResolvedValueOnce({ rows: [{ request_count: 2, window_started_at: new Date() }] });
        await expect(checkRateLimit('x'.repeat(300), { capacity: 5, refillPerSec: 5 / 60 })).resolves.toEqual({ ok: true });

        expect(mocks.query).toHaveBeenCalledOnce();
        const [, params] = mocks.query.mock.calls[0];
        expect(params[0]).toHaveLength(255);
        expect(params[4]).toBe(6);
    });

    it('returns a stable retry contract after the fixed-window capacity', async () => {
        mocks.query.mockResolvedValueOnce({
            rows: [{ request_count: 6, window_started_at: new Date(Date.now() - 10_000) }],
        });
        const result = await checkRateLimit('comments:203.0.113.4', { capacity: 5, refillPerSec: 5 / 60 });
        expect(result.ok).toBe(false);
        expect(result.retryAfter).toBeGreaterThan(0);
        expect(result.retryAfter).toBeLessThanOrEqual(60);
    });
});
