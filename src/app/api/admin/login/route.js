import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signAdminToken, setAdminCookie } from '@/lib/adminAuth';
import { log } from '@/lib/logger';
import { checkRateLimit, getClientIp, TrustedClientIpError } from '@/lib/rateLimit';

export async function POST(request) {
    let ip;
    try {
        ip = getClientIp(request);
    } catch (err) {
        if (err instanceof TrustedClientIpError) {
            return NextResponse.json({ error: 'Unable to establish trusted client identity' }, { status: 503 });
        }
        throw err;
    }
    let limit;
    try {
        limit = await checkRateLimit(`login:${ip}`, { capacity: 5, refillPerSec: 1 / 30, failOpenOnMissingTable: false });
    } catch (err) {
        // Fail closed for login: without a working limiter we cannot throttle guesses.
        log('error', 'login.rate_limit_unavailable', { error: err });
        return NextResponse.json({ error: 'Login temporarily unavailable' }, { status: 503 });
    }
    if (!limit.ok) {
        return NextResponse.json(
            { error: 'Too many login attempts. Please try again later.' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
        );
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { password } = payload;

    const stored = process.env.ADMIN_PASSWORD;
    if (!stored || !process.env.ADMIN_JWT_SECRET) {
        return NextResponse.json({ error: 'Admin auth not configured' }, { status: 500 });
    }

    const valid = await bcrypt.compare(password ?? '', stored);
    if (!valid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = await signAdminToken();
    const response = NextResponse.json({ success: true });
    setAdminCookie(response, token);
    return response;
}
