import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signAdminToken, setAdminCookie } from '@/lib/adminAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request) {
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
