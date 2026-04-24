import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { jokes } from '../../../../../../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { requireAdminSession } from '@/lib/adminAuth';

export async function PATCH(request, { params }) {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    const { id } = await params;
    const rows = await db.update(jokes)
        .set({ jc_starred: sql`NOT ${jokes.jc_starred}`, updated_at: sql`NOW()` })
        .where(eq(jokes.id, parseInt(id)))
        .returning({
            id: jokes.id,
            setup: jokes.setup,
            punchline: jokes.punchline,
            jc_starred: jokes.jc_starred,
            created_at: jokes.created_at,
            updated_at: jokes.updated_at,
        });

    if (!rows.length) {
        return NextResponse.json({ error: 'Joke not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
}
