import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signAdminToken, setAdminCookie } from '@/lib/adminAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request) {
    // NOTE: checkRateLimit is an in-memory, per-instance bucket (see
    // src/lib/rateLimit.js). It stops a single attacker hammering one
    // serverless instance, but it does NOT stop a distributed brute force
    // spread across IPs or across cold-started instances — there's no
    // shared state between them. This is a known limitation, not an
    // oversight; a real fix needs a shared store (e.g. Upstash Redis).
    // Left as-is for now since this is a low-traffic personal site and a
    // full Redis-backed rewrite is out of scope for this pass.
    const ip = getClientIp(request);
    const limit = checkRateLimit(`login:${ip}`, { capacity: 5, refillPerSec: 1 / 30 });
    if (!limit.ok) {
        return NextResponse.json(
            { error: 'Too many login attempts. Please try again later.' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
        );
    }

    const { password } = await request.json();

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
