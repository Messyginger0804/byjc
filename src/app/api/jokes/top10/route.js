import { NextResponse } from 'next/server';
import { inArray, sql } from 'drizzle-orm';
import db from '@/lib/drizzle';
import { jokes } from '../../../../../db/schema.js';
import { requireAdminSession } from '@/lib/adminAuth';
import { errorResponse, readJsonBody } from '@/lib/apiRequest';
import { parseTopTenIds, TOP_TEN_SIZE } from '@/lib/jokesApi';

export async function PATCH(request) {
    try {
        const authError = await requireAdminSession(request);
        if (authError) return authError;

        const parsedBody = await readJsonBody(request);
        if (!parsedBody.ok) return parsedBody.response;

        const parsedIds = parseTopTenIds(parsedBody.value);
        if (!parsedIds.ok) return errorResponse(parsedIds.error, 400);
        const dedupedIds = parsedIds.ids;

        if (dedupedIds.length > 0) {
            const foundRows = await db.select({ id: jokes.id }).from(jokes).where(inArray(jokes.id, dedupedIds));
            if (foundRows.length !== dedupedIds.length) {
                return errorResponse('One or more joke IDs were not found.', 400);
            }
        }

        const topTenIds = dedupedIds.slice(0, TOP_TEN_SIZE);

        await db.transaction(async (tx) => {
            // Only clear rows that currently have a rank (avoids touching the entire table)
            await tx.update(jokes)
                .set({ top10_rank: null })
                .where(sql`${jokes.top10_rank} IS NOT NULL`);

            // Batch update using a CASE statement instead of N individual UPDATEs
            if (topTenIds.length > 0) {
                const caseParts = topTenIds.map(
                    (id, index) => sql`WHEN ${jokes.id} = ${id} THEN ${index + 1}`
                );
                await tx.update(jokes)
                    .set({
                        top10_rank: sql`CASE ${sql.join(caseParts, sql` `)} END`,
                    })
                    .where(inArray(jokes.id, topTenIds));
            }
        });

        return NextResponse.json({
            savedCount: topTenIds.length,
            droppedCount: Math.max(0, dedupedIds.length - topTenIds.length),
            savedIds: topTenIds,
        });
    } catch (err) {
        console.error('[API] Top10 PATCH error:', err);
        return NextResponse.json({ error: 'Failed to update top 10' }, { status: 500 });
    }
}
