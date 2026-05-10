import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { signAdminToken, verifyAdminToken, requireAdminSession } from './adminAuth.js';

const TEST_SECRET = 'test-secret-32chars-at-minimum!!';

function makeRequest(token) {
    return { cookies: { get: () => (token ? { value: token } : undefined) } };
}

describe('adminAuth — env var guard', () => {
    it('throws if ADMIN_JWT_SECRET is not set', async () => {
        delete process.env.ADMIN_JWT_SECRET;
        await expect(signAdminToken()).rejects.toThrow('ADMIN_JWT_SECRET is not set');
    });
});

describe('signAdminToken', () => {
    beforeEach(() => { process.env.ADMIN_JWT_SECRET = TEST_SECRET; });
    afterEach(() => { delete process.env.ADMIN_JWT_SECRET; });

    it('returns a non-empty string', async () => {
        const token = await signAdminToken();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
    });

    it('produces a three-part dot-separated JWT', async () => {
        const token = await signAdminToken();
        expect(token.split('.')).toHaveLength(3);
    });
});

describe('verifyAdminToken', () => {
    beforeEach(() => { process.env.ADMIN_JWT_SECRET = TEST_SECRET; });
    afterEach(() => { delete process.env.ADMIN_JWT_SECRET; });

    it('round-trips — verified payload has role: admin', async () => {
        const token = await signAdminToken();
        const payload = await verifyAdminToken(token);
        expect(payload.role).toBe('admin');
    });

    it('throws on a tampered token', async () => {
        const token = await signAdminToken();
        const parts = token.split('.');
        parts[1] = Buffer.from(JSON.stringify({ role: 'superadmin' })).toString('base64url');
        await expect(verifyAdminToken(parts.join('.'))).rejects.toThrow();
    });

    it('throws on an arbitrary non-JWT string', async () => {
        await expect(verifyAdminToken('not.a.token')).rejects.toThrow();
    });

    it('throws on a token signed with a different secret', async () => {
        const token = await signAdminToken();
        process.env.ADMIN_JWT_SECRET = 'a-completely-different-secret-!!!';
        await expect(verifyAdminToken(token)).rejects.toThrow();
    });
});

describe('requireAdminSession', () => {
    beforeEach(() => { process.env.ADMIN_JWT_SECRET = TEST_SECRET; });
    afterEach(() => { delete process.env.ADMIN_JWT_SECRET; });

    it('returns null when a valid token is present in the cookie', async () => {
        const token = await signAdminToken();
        const result = await requireAdminSession(makeRequest(token));
        expect(result).toBeNull();
    });

    it('returns 401 when no cookie is present', async () => {
        const result = await requireAdminSession(makeRequest(null));
        expect(result.status).toBe(401);
        const body = await result.json();
        expect(body.error).toBe('Unauthorized');
    });

    it('returns 401 when cookie contains an invalid token', async () => {
        const result = await requireAdminSession(makeRequest('garbage.jwt.string'));
        expect(result.status).toBe(401);
        const body = await result.json();
        expect(body.error).toBe('Unauthorized');
    });

    it('returns 401 when cookie value is an empty string', async () => {
        const req = { cookies: { get: () => ({ value: '' }) } };
        const result = await requireAdminSession(req);
        expect(result.status).toBe(401);
        const body = await result.json();
        expect(body.error).toBe('Unauthorized');
    });
});
