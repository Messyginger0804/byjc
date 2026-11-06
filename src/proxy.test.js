import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import { proxy, config } from './proxy.js';

const SECRET = 'test-secret-test-secret-test-secret-1234';
const originalSecret = process.env.ADMIN_JWT_SECRET;

const req = (url, { host, cookie } = {}) => {
    const headers = {};
    if (host) headers.host = host;
    if (cookie) headers.cookie = cookie;
    return new NextRequest(url, { headers });
};

const sign = (secret = SECRET, exp = '1h') =>
    new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(exp).sign(new TextEncoder().encode(secret));

const isNext = (res) => res.headers.get('x-middleware-next') === '1';
const rewriteTarget = (res) => res.headers.get('x-middleware-rewrite');

beforeAll(() => { process.env.ADMIN_JWT_SECRET = SECRET; });
afterEach(() => { process.env.ADMIN_JWT_SECRET = SECRET; });
afterAll(() => {
    if (originalSecret === undefined) delete process.env.ADMIN_JWT_SECRET;
    else process.env.ADMIN_JWT_SECRET = originalSecret;
});

describe('proxy admin auth', () => {
    it('lets the login page through without a cookie', async () => {
        const res = await proxy(req('https://byjc.dev/admin/login'));
        expect(isNext(res)).toBe(true);
    });

    it('redirects to login when there is no session cookie', async () => {
        const res = await proxy(req('https://byjc.dev/admin/dashboard'));
        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toBe('https://byjc.dev/admin/login');
    });

    it('redirects the bare /admin path and nested paths to login', async () => {
        for (const path of ['/admin', '/admin/blogs/new', '/administrator']) {
            const res = await proxy(req(`https://byjc.dev${path}`));
            expect(res.headers.get('location')).toBe('https://byjc.dev/admin/login');
        }
    });

    it('redirects when the token is invalid', async () => {
        const res = await proxy(req('https://byjc.dev/admin', { cookie: 'admin_session=not-a-jwt' }));
        expect(res.status).toBe(307);
        expect(res.headers.get('location')).toBe('https://byjc.dev/admin/login');
    });

    it('redirects when the token is signed with a different secret', async () => {
        const token = await sign('another-secret-another-secret-12345');
        const res = await proxy(req('https://byjc.dev/admin', { cookie: `admin_session=${token}` }));
        expect(res.headers.get('location')).toBe('https://byjc.dev/admin/login');
    });

    it('redirects when the token is expired', async () => {
        const token = await sign(SECRET, '-1h');
        const res = await proxy(req('https://byjc.dev/admin', { cookie: `admin_session=${token}` }));
        expect(res.headers.get('location')).toBe('https://byjc.dev/admin/login');
    });

    it('redirects when the cookie is empty', async () => {
        const res = await proxy(req('https://byjc.dev/admin', { cookie: 'admin_session=' }));
        expect(res.headers.get('location')).toBe('https://byjc.dev/admin/login');
    });

    it('redirects (fails closed) when ADMIN_JWT_SECRET is not configured', async () => {
        const token = await sign();
        delete process.env.ADMIN_JWT_SECRET;
        const res = await proxy(req('https://byjc.dev/admin', { cookie: `admin_session=${token}` }));
        expect(res.headers.get('location')).toBe('https://byjc.dev/admin/login');
    });

    it('passes through with a valid token', async () => {
        const token = await sign();
        const res = await proxy(req('https://byjc.dev/admin/blogs', { cookie: `admin_session=${token}` }));
        expect(isNext(res)).toBe(true);
        expect(res.headers.get('location')).toBeNull();
    });

    it('enforces admin auth for /admin paths regardless of subdomain host', async () => {
        const res = await proxy(req('https://byjc.dev/admin', { host: 'github.byjc.dev' }));
        expect(res.headers.get('location')).toBe('https://byjc.dev/admin/login');
    });
});

describe('proxy non-admin routing', () => {
    it('passes plain requests through', async () => {
        for (const [url, host] of [['https://byjc.dev/blogs', 'byjc.dev'], ['https://byjc.dev/', undefined], ['https://www.byjc.dev/about', 'www.byjc.dev']]) {
            expect(isNext(await proxy(req(url, { host })))).toBe(true);
        }
    });

    it('passes assets through even on special subdomains', async () => {
        for (const path of ['/_next/static/a.js', '/api/jokes', '/favicon.ico', '/icons/a', '/images/a', '/logo.png']) {
            const res = await proxy(req(`https://x.byjc.dev${path}`, { host: 'github.byjc.dev' }));
            expect(isNext(res)).toBe(true);
        }
    });

    it('redirects resume subdomain root to /resume with 302 preserving the query', async () => {
        const res = await proxy(req('https://resume.byjc.dev/?a=1', { host: 'resume.byjc.dev' }));
        expect(res.status).toBe(302);
        expect(res.headers.get('location')).toBe('https://byjc.dev/resume?a=1');
    });

    it('redirects resume subdomain subpaths with 308', async () => {
        const res = await proxy(req('https://resume.byjc.dev/foo?b=2', { host: 'resume.byjc.dev' }));
        expect(res.status).toBe(308);
        expect(res.headers.get('location')).toBe('https://byjc.dev/foo?b=2');
    });

    it('redirects external subdomains with 308', async () => {
        const cases = { github: 'https://github.com/Messyginger0804', linkedin: 'https://www.linkedin.com/in/dev-jc/' };
        for (const [sub, dest] of Object.entries(cases)) {
            const res = await proxy(req(`https://${sub}.byjc.dev/`, { host: `${sub}.byjc.dev` }));
            expect(res.status).toBe(308);
            expect(res.headers.get('location')).toBe(dest);
        }
        const discord = await proxy(req('https://discord.byjc.dev/', { host: 'discord.byjc.dev' }));
        expect(discord.headers.get('location')).toContain('discordapp.com');
    });

    it('rewrites internal subdomain roots and redirects their subpaths', async () => {
        const root = await proxy(req('https://about.byjc.dev/', { host: 'about.byjc.dev' }));
        expect(rewriteTarget(root)).toContain('/about');
        const software = await proxy(req('https://software.byjc.dev/', { host: 'software.byjc.dev' }));
        expect(new URL(rewriteTarget(software)).pathname).toBe('/');
        const typo = await proxy(req('https://portfili.byjc.dev/', { host: 'portfili.byjc.dev' }));
        expect(new URL(rewriteTarget(typo)).pathname).toBe('/portfolio');

        const sub = await proxy(req('https://blogs.byjc.dev/post?x=1', { host: 'blogs.byjc.dev' }));
        expect(sub.status).toBe(308);
        expect(sub.headers.get('location')).toBe('https://byjc.dev/post?x=1');
    });

    it('ignores unknown subdomains and two-part hosts', async () => {
        expect(isNext(await proxy(req('https://foo.byjc.dev/', { host: 'foo.byjc.dev' })))).toBe(true);
        expect(isNext(await proxy(req('https://localhost:3000/', { host: 'localhost:3000' })))).toBe(true);
    });
});

describe('proxy config', () => {
    it('exposes a matcher that skips _next, api and file paths', () => {
        const re = new RegExp(`^${config.matcher[0]}$`);
        expect(re.test('/blogs')).toBe(true);
        expect(re.test('/admin/login')).toBe(true);
        expect(re.test('/_next/x')).toBe(false);
        expect(re.test('/api/x')).toBe(false);
        expect(re.test('/a.png')).toBe(false);
    });
});
