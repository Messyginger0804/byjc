import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
});

describe('siteMetadata siteUrl', () => {
    const load = async (env) => {
        vi.resetModules();
        for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
        return (await import('../utils/metaData.js')).default.siteUrl;
    };

    it('uses NEXT_PUBLIC_PROD_URL in production, with a default fallback', async () => {
        expect(await load({ NODE_ENV: 'production', NEXT_PUBLIC_PROD_URL: 'https://x.example' })).toBe('https://x.example');
        expect(await load({ NODE_ENV: 'production', NEXT_PUBLIC_PROD_URL: '' })).toBe('https://www.byjc.dev');
    });

    it('uses NEXT_PUBLIC_SITE_URL outside production, with a localhost fallback', async () => {
        expect(await load({ NODE_ENV: 'development', NEXT_PUBLIC_SITE_URL: 'http://dev.test' })).toBe('http://dev.test');
        expect(await load({ NODE_ENV: 'development', NEXT_PUBLIC_SITE_URL: '' })).toBe('http://localhost:3000');
    });
});

describe('logger', () => {
    it('routes levels to the matching console method as JSON', async () => {
        const { log } = await import('./logger.js');
        const err = vi.spyOn(console, 'error').mockImplementation(() => {});
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const info = vi.spyOn(console, 'info').mockImplementation(() => {});

        log('error', 'e1');
        log('warn', 'w1');
        log('info', 'i1', { a: 1 });

        expect(JSON.parse(err.mock.calls[0][0])).toMatchObject({ level: 'error', event: 'e1' });
        expect(JSON.parse(warn.mock.calls[0][0])).toMatchObject({ level: 'warn', event: 'w1' });
        expect(JSON.parse(info.mock.calls[0][0])).toMatchObject({ level: 'info', event: 'i1', a: 1 });
    });

    it('serializes Error instances without stack, including code only when present', async () => {
        const { log } = await import('./logger.js');
        const err = vi.spyOn(console, 'error').mockImplementation(() => {});
        const e = Object.assign(new Error('boom'), { code: 'E42' });

        log('error', 'x', { error: e });
        log('error', 'y', { error: new TypeError('plain') });

        const first = JSON.parse(err.mock.calls[0][0]).error;
        const second = JSON.parse(err.mock.calls[1][0]).error;
        expect(first).toEqual({ name: 'Error', message: 'boom', code: 'E42' });
        expect(second).toEqual({ name: 'TypeError', message: 'plain' });
    });

    it('leaves non-Error error fields untouched', async () => {
        const { log } = await import('./logger.js');
        const err = vi.spyOn(console, 'error').mockImplementation(() => {});
        log('error', 'z', { error: 'just a string' });
        expect(JSON.parse(err.mock.calls[0][0]).error).toBe('just a string');
    });
});

describe('contentSecurityPolicy NODE_ENV=development', () => {
    it('allows unsafe-eval and omits upgrade-insecure-requests', async () => {
        vi.stubEnv('NODE_ENV', 'development');
        vi.stubEnv('VERCEL_ENV', '');
        const { contentSecurityPolicy } = await import('./contentSecurity.js');
        expect(contentSecurityPolicy).toContain("'unsafe-eval'");
        expect(contentSecurityPolicy).not.toContain('upgrade-insecure-requests');
    });
});
