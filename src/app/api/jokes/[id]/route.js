import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { jokes } from '../../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminSession } from '@/lib/adminAuth';

export async function DELETE(request, { params }) {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    const { id } = await params;
    const deleted = await db.delete(jokes)
        .where(eq(jokes.id, parseInt(id)))
        .returning({ id: jokes.id });

    if (!deleted.length) {
        return NextResponse.json({ error: 'Joke not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
}
