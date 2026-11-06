import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { blogs, comments } from '../../../../../db/schema.js';
import { eq, and, desc, gt, lte, sql } from 'drizzle-orm';
import { commentSchema } from '@/lib/schemas';
import { rateLimitByIp, readValidatedBody, trustedClientIpErrorResponse } from '@/lib/apiRequest';

export async function GET(request, { params }) {
    try {
        const { blogSlug } = await params;

        const rows = await db.select({
            id: comments.id,
            name: comments.name,
            body: comments.body,
            created_at: comments.created_at,
        })
            .from(comments)
            .innerJoin(blogs, eq(comments.blog_id, blogs.id))
            .where(and(
                eq(blogs.slug, blogSlug),
                eq(blogs.is_published, true),
                lte(blogs.published_at, sql`NOW()`)
            ))
            .orderBy(desc(comments.created_at), desc(comments.id))
            .limit(100);

        return NextResponse.json(rows.reverse());
    } catch (err) {
        console.error('[API] Comments GET error:', err);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const { blogSlug } = await params;

        const limited = await rateLimitByIp(request, 'comments');
        if (limited) return limited;

        const parsedBody = await readValidatedBody(request, commentSchema);
        if (!parsedBody.ok) return parsedBody.response;
        const { name, body } = parsedBody.value;

        const result = await db.transaction(async (tx) => {
            const blog = await tx.select({ id: blogs.id }).from(blogs).where(and(
                eq(blogs.slug, blogSlug),
                eq(blogs.is_published, true),
                lte(blogs.published_at, sql`NOW()`)
            )).for('share');
            if (!blog.length) return { kind: 'blog-not-found' };

            const blogId = blog[0].id;
            const duplicateKey = JSON.stringify([blogId, name, body]);
            await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${duplicateKey}, 0))`);
            const duplicate = await tx.select({ id: comments.id }).from(comments).where(
                and(
                    eq(comments.blog_id, blogId),
                    eq(comments.name, name),
                    eq(comments.body, body),
                    gt(comments.created_at, sql`NOW() - INTERVAL '60 seconds'`)
                )
            );
            if (duplicate.length) return { kind: 'duplicate' };

            const [created] = await tx.insert(comments).values({
                blog_id: blogId,
                name,
                body,
            }).returning({
                id: comments.id,
                name: comments.name,
                body: comments.body,
                created_at: comments.created_at,
            });
            return { kind: 'created', comment: created };
        });

        if (result.kind === 'blog-not-found') {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }
        if (result.kind === 'duplicate') {
            return NextResponse.json({ error: 'Duplicate comment' }, { status: 409 });
        }

        return NextResponse.json(result.comment, { status: 201 });
    } catch (err) {
        const ipError = trustedClientIpErrorResponse(err);
        if (ipError) return ipError;
        console.error('[API] Comments POST error:', err);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
