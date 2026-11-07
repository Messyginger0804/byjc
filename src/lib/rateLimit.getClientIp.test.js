import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ log: vi.fn() }));
vi.mock('./db.js', () => ({ default: { query: vi.fn() } }));
vi.mock('./logger.js', () => ({ log: mocks.log }));

import { getClientIp, TrustedClientIpError } from './rateLimit.js';

const request = (headers) => ({ headers: new Headers(headers) });

describe('getClientIp header handling', () => {
    beforeEach(() => mocks.log.mockClear());

    it('never trusts x-forwarded-for or x-real-ip, even with whitespace or multiple hops', () => {
        const headers = { 'x-forwarded-for': ' 198.51.100.9 , 203.0.113.2', 'x-real-ip': '198.51.100.10' };
        expect(getClientIp(request(headers), { NODE_ENV: 'development' })).toBe('local-development');
        expect(getClientIp(request(headers), {})).toBe('local-development');
    });

    it('does not let spoofed forwarding headers override the Vercel header', () => {
        const req = request({
            'x-forwarded-for': '198.51.100.9',
            'x-real-ip': '198.51.100.10',
            'x-vercel-forwarded-for': '203.0.113.4',
        });
        expect(getClientIp(req, { VERCEL: '1' })).toBe('203.0.113.4');
    });

    it('throws on Vercel when only spoofable headers are present', () => {
        const req = request({ 'x-forwarded-for': '198.51.100.9', 'x-real-ip': '198.51.100.10' });
        expect(() => getClientIp(req, { VERCEL: '1' })).toThrow(TrustedClientIpError);
    });

    it('takes the first entry of x-vercel-forwarded-for and trims whitespace', () => {
        expect(getClientIp(request({ 'x-vercel-forwarded-for': '  203.0.113.4  , 10.0.0.1' }), { VERCEL: '1' })).toBe('203.0.113.4');
        expect(getClientIp(request({ 'x-vercel-forwarded-for': '2001:db8::5' }), { VERCEL: '1' })).toBe('2001:db8::5');
    });

    it('rejects empty, blank or invalid Vercel values', () => {
        for (const value of ['', '   ', ',203.0.113.4', 'abc', '203.0.113.999', '203.0.113.4:80']) {
            expect(() => getClientIp(request({ 'x-vercel-forwarded-for': value }), { VERCEL: '1' })).toThrow(TrustedClientIpError);
        }
    });

    it('treats VERCEL=0 or empty as not on Vercel', () => {
        const req = request({ 'x-vercel-forwarded-for': '203.0.113.4' });
        expect(getClientIp(req, { VERCEL: '0' })).toBe('local-development');
        expect(getClientIp(req, { VERCEL: '' })).toBe('local-development');
        expect(() => getClientIp(req, { VERCEL: '0', NODE_ENV: 'production' })).toThrow('No trusted proxy platform is configured');
    });

    it('reads cf-connecting-ip on Cloudflare, trimmed, and ignores x-forwarded-for', () => {
        const env = { TRUSTED_PROXY_PLATFORM: 'cloudflare' };
        expect(getClientIp(request({ 'cf-connecting-ip': ' 203.0.113.7 ', 'x-forwarded-for': '198.51.100.9' }), env)).toBe('203.0.113.7');
        expect(() => getClientIp(request({ 'x-forwarded-for': '198.51.100.9' }), env)).toThrow(TrustedClientIpError);
        expect(() => getClientIp(request({ 'cf-connecting-ip': 'nope' }), env)).toThrow('Trusted proxy did not provide a valid client IP');
    });

    it('uses the Cloudflare header when both platforms are set', () => {
        const req = request({ 'x-vercel-forwarded-for': '203.0.113.4', 'cf-connecting-ip': '203.0.113.8' });
        expect(getClientIp(req, { VERCEL: '1', TRUSTED_PROXY_PLATFORM: 'cloudflare' })).toBe('203.0.113.8');
    });

    it('reports a missing platform in production with the configuration error message', () => {
        expect(() => getClientIp(request({}), { NODE_ENV: 'production' })).toThrow('No trusted proxy platform is configured');
        expect(mocks.log).toHaveBeenCalledWith('error', 'rate_limit.proxy_unconfigured', expect.any(Object));
    });
});
