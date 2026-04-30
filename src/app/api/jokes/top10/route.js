import { NextResponse } from 'next/server';
import { inArray, sql } from 'drizzle-orm';
import db from '@/lib/drizzle';
import { jokes } from '../../../../../db/schema.js';
import { requireAdminSession } from '@/lib/adminAuth';

export async function PATCH(request) {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    const body = await request.json().catch(() => ({}));
    const incomingIds = Array.isArray(body?.jokeIds) ? body.jokeIds : [];

    if (incomingIds.length > 15) {
        return NextResponse.json({ error: 'You can only stage up to 15 jokes before saving.' }, { status: 400 });
    }

    const dedupedIds = [];
    const seen = new Set();
    for (const value of incomingIds) {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isInteger(parsed) || parsed <= 0) {
            return NextResponse.json({ error: 'jokeIds must contain valid positive integers.' }, { status: 400 });
        }
        if (seen.has(parsed)) continue;
        seen.add(parsed);
        dedupedIds.push(parsed);
    }

    if (dedupedIds.length > 0) {
        const foundRows = await db.select({ id: jokes.id }).from(jokes).where(inArray(jokes.id, dedupedIds));
        if (foundRows.length !== dedupedIds.length) {
            return NextResponse.json({ error: 'One or more joke IDs were not found.' }, { status: 400 });
        }
    }

    const topTenIds = dedupedIds.slice(0, 10);

    await db.transaction(async (tx) => {
        await tx.update(jokes).set({ top10_rank: null, updated_at: sql`NOW()` });

        for (let index = 0; index < topTenIds.length; index += 1) {
            await tx
                .update(jokes)
                .set({ top10_rank: index + 1, updated_at: sql`NOW()` })
                .where(sql`${jokes.id} = ${topTenIds[index]}`);
        }
    });

    return NextResponse.json({
        savedCount: topTenIds.length,
        droppedCount: Math.max(0, dedupedIds.length - topTenIds.length),
        savedIds: topTenIds,
    });
}
