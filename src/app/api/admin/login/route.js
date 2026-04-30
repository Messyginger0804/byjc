import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signAdminToken, setAdminCookie } from '@/lib/adminAuth';

export async function POST(request) {
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
