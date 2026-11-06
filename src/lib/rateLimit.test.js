import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('./db.js', () => ({ default: { query: mocks.query } }));

import { checkRateLimit, getClientIp, ipv6Prefix64, TrustedClientIpError } from './rateLimit.js';

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

describe('getClientIp escape hatch', () => {
    const request = (headers) => ({ headers: new Headers(headers) });

    it('uses one global bucket when production explicitly opts out of a trusted proxy', () => {
        const env = { NODE_ENV: 'production', TRUSTED_PROXY_PLATFORM: 'none' };
        expect(getClientIp(request({ 'x-forwarded-for': '203.0.113.2' }), env)).toBe('untrusted-proxy-global');
    });

    it('ignores none on Vercel and uses the platform client IP', () => {
        const env = { NODE_ENV: 'production', VERCEL: '1', TRUSTED_PROXY_PLATFORM: 'none' };
        expect(getClientIp(request({ 'x-vercel-forwarded-for': '203.0.113.4' }), env)).toBe('203.0.113.4');
        expect(() => getClientIp(request({}), env)).toThrow(TrustedClientIpError);
    });

    it('treats any non-zero VERCEL value as Vercel', () => {
        const env = { NODE_ENV: 'production', VERCEL: 'true', TRUSTED_PROXY_PLATFORM: 'none' };
        expect(getClientIp(request({ 'x-vercel-forwarded-for': '203.0.113.5' }), env)).toBe('203.0.113.5');
    });

    it('still works outside production with no proxy configuration', () => {
        expect(getClientIp(request({}), { NODE_ENV: 'development' })).toBe('local-development');
        expect(getClientIp(request({}), {})).toBe('local-development');
    });
});

describe('checkRateLimit', () => {
    beforeEach(() => mocks.query.mockReset());

    it('fails open when the rate_limit_buckets table has not been migrated yet', async () => {
        mocks.query.mockRejectedValueOnce(Object.assign(new Error('relation does not exist'), { code: '42P01' }));
        await expect(checkRateLimit('k', { capacity: 5, refillPerSec: 1 })).resolves.toEqual({ ok: true });
    });

    it('propagates a missing table when the caller opts out of failing open', async () => {
        mocks.query.mockRejectedValueOnce(Object.assign(new Error('relation does not exist'), { code: '42P01' }));
        await expect(checkRateLimit('login:k', { capacity: 5, refillPerSec: 1, failOpenOnMissingTable: false })).rejects.toThrow('relation does not exist');
    });

    it('uses one statement timestamp for every window decision', async () => {
        mocks.query.mockResolvedValueOnce({ rows: [{ request_count: 1, window_started_at: new Date() }] });
        await checkRateLimit('k', { capacity: 5, refillPerSec: 1 });
        expect(mocks.query.mock.calls[0][0].match(/clock_timestamp\(\)/g)).toHaveLength(1);
    });

    it('propagates other database errors', async () => {
        mocks.query.mockRejectedValueOnce(Object.assign(new Error('boom'), { code: '08006' }));
        await expect(checkRateLimit('k', { capacity: 5, refillPerSec: 1 })).rejects.toThrow('boom');
    });

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

    it('excludes the current key from expired-bucket cleanup', async () => {
        mocks.query.mockResolvedValueOnce({ rows: [{ request_count: 1, window_started_at: new Date() }] });
        await checkRateLimit('k', { capacity: 5, refillPerSec: 1 });
        expect(mocks.query.mock.calls[0][0]).toMatch(/expires_at <= \(SELECT ts FROM stmt_clock\)\s+AND key <> \$1/);
    });

    it('also limits IPv6 clients by shared /64 prefix, with a larger capacity', async () => {
        mocks.query.mockResolvedValue({ rows: [{ request_count: 1, window_started_at: new Date() }] });
        await checkRateLimit('login:2001:db8:1:2:aaaa::1', { capacity: 5, refillPerSec: 1 });

        expect(mocks.query).toHaveBeenCalledTimes(2);
        expect(mocks.query.mock.calls[1][1][0]).toBe('login:v6p:2001:db8:1:2');
        expect(mocks.query.mock.calls[1][1][4]).toBe(21);
    });

    it('does not consume a prefix bucket for IPv4 or non-IP keys, or after a per-IP denial', async () => {
        mocks.query.mockResolvedValue({ rows: [{ request_count: 1, window_started_at: new Date() }] });
        await checkRateLimit('login:203.0.113.4', { capacity: 5, refillPerSec: 1 });
        await checkRateLimit('login:untrusted-proxy-global', { capacity: 5, refillPerSec: 1 });
        expect(mocks.query).toHaveBeenCalledTimes(2);

        mocks.query.mockReset();
        mocks.query.mockResolvedValueOnce({ rows: [{ request_count: 6, window_started_at: new Date() }] });
        const result = await checkRateLimit('login:2001:db8::1', { capacity: 5, refillPerSec: 1 });
        expect(result.ok).toBe(false);
        expect(mocks.query).toHaveBeenCalledOnce();
    });

    it('denies when the shared prefix bucket is exhausted', async () => {
        mocks.query
            .mockResolvedValueOnce({ rows: [{ request_count: 1, window_started_at: new Date() }] })
            .mockResolvedValueOnce({ rows: [{ request_count: 21, window_started_at: new Date() }] });
        const result = await checkRateLimit('comments:2001:db8::7', { capacity: 5, refillPerSec: 5 / 60 });
        expect(result.ok).toBe(false);
    });
});

describe('ipv6Prefix64', () => {
    it('normalizes compressed and expanded forms to the same /64', () => {
        expect(ipv6Prefix64('2001:db8::1')).toBe('2001:db8:0:0');
        expect(ipv6Prefix64('2001:0DB8:0000:0000:ffff:0:0:1')).toBe('2001:db8:0:0');
        expect(ipv6Prefix64('2001:db8:0:0:1::')).toBe('2001:db8:0:0');
        expect(ipv6Prefix64('::1')).toBe('0:0:0:0');
        expect(ipv6Prefix64('fe80::1%eth0')).toBe('fe80:0:0:0');
    });

    it('returns null for IPv4, IPv4-mapped and invalid input', () => {
        expect(ipv6Prefix64('203.0.113.4')).toBeNull();
        expect(ipv6Prefix64('::ffff:203.0.113.4')).toBeNull();
        expect(ipv6Prefix64('nope')).toBeNull();
    });
});
