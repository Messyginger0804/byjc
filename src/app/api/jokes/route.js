import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { jokes } from '../../../../db/schema.js';
import { desc, ilike, or, asc, sql } from 'drizzle-orm';
import { requireAdminSession } from '@/lib/adminAuth';
import { jokeSchema } from '@/lib/schemas';
import { rateLimitByIp, readValidatedBody, trustedClientIpErrorResponse } from '@/lib/apiRequest';
import { buildPaginationMeta, escapeLike, parsePagination } from '@/lib/jokesApi';
import { safeCompare } from '@/lib/safeCompare';

function hasApiSecret(request) {
    const secret = process.env.BLOG_API_SECRET;
    if (!secret) return false;
    const provided = request.headers.get('x-blog-secret');
    return safeCompare(provided, secret);
}

export async function GET(request) {
    try {
        const authError = await requireAdminSession(request);
        if (authError) return authError;

        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const { page, limit } = parsePagination(url.searchParams);

        const escapedSearch = escapeLike(search);
        const whereClause = search
            ? or(ilike(jokes.setup, `%${escapedSearch}%`), ilike(jokes.punchline, `%${escapedSearch}%`))
            : undefined;

        const [{ total }] = await db
            .select({ total: sql`count(*)::int` })
            .from(jokes)
            .where(whereClause);

        const rows = await db.select({
            id: jokes.id,
            setup: jokes.setup,
            punchline: jokes.punchline,
            jc_starred: jokes.jc_starred,
            top10_rank: jokes.top10_rank,
            created_at: jokes.created_at,
            updated_at: jokes.updated_at,
        }).from(jokes)
          .where(whereClause)
          .orderBy(
              sql`CASE WHEN ${jokes.top10_rank} IS NULL THEN 1 ELSE 0 END`,
              asc(jokes.top10_rank),
              desc(jokes.jc_starred),
              desc(jokes.created_at)
          )
          .limit(limit)
          .offset((page - 1) * limit);

        return NextResponse.json({
            data: rows,
            meta: buildPaginationMeta({ page, limit, total }),
        });
    } catch (err) {
        console.error('[API] Jokes GET error:', err);
        return NextResponse.json({ error: 'Failed to fetch jokes' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        if (!hasApiSecret(request)) {
            const authError = await requireAdminSession(request);
            if (authError) return authError;

            const limited = await rateLimitByIp(request, 'jokes');
            if (limited) return limited;
        }

        const body = await readValidatedBody(request, jokeSchema);
        if (!body.ok) return body.response;
        const { setup, punchline } = body.value;

        const [inserted] = await db.insert(jokes).values({
            setup,
            punchline,
        }).returning({
            id: jokes.id,
            setup: jokes.setup,
            punchline: jokes.punchline,
            jc_starred: jokes.jc_starred,
            top10_rank: jokes.top10_rank,
            created_at: jokes.created_at,
            updated_at: jokes.updated_at,
        });

        return NextResponse.json(inserted, { status: 201 });
    } catch (err) {
        const ipError = trustedClientIpErrorResponse(err);
        if (ipError) return ipError;
        console.error('[API] Jokes POST error:', err);
        return NextResponse.json({ error: 'Failed to create joke' }, { status: 500 });
    }
}
