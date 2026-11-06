import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkRateLimit = vi.hoisted(() => vi.fn());

vi.mock('@/lib/rateLimit', () => {
    class TrustedClientIpError extends Error {}
    return { checkRateLimit, getClientIp: () => '203.0.113.10', TrustedClientIpError };
});
vi.mock('@/lib/adminAuth', () => ({ signAdminToken: vi.fn(), setAdminCookie: vi.fn() }));
vi.mock('@/lib/logger', () => ({ log: vi.fn() }));

import { POST } from './route.js';

const request = () => new Request('https://example.test/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'x' }),
});

beforeEach(() => vi.clearAllMocks());

describe('admin login rate limiting', () => {
    it('opts out of failing open when the limiter table is missing', async () => {
        checkRateLimit.mockResolvedValue({ ok: false, retryAfter: 5 });
        await POST(request());
        expect(checkRateLimit).toHaveBeenCalledWith(
            'login:203.0.113.10',
            expect.objectContaining({ failOpenOnMissingTable: false })
        );
    });

    it('returns 503 when the limiter is unavailable', async () => {
        checkRateLimit.mockRejectedValue(Object.assign(new Error('missing'), { code: '42P01' }));
        const response = await POST(request());
        expect(response.status).toBe(503);
    });
});
