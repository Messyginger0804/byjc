import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { blogs, comments } from '../../../../../db/schema.js';
import { eq, and, asc, gt, sql } from 'drizzle-orm';
import { commentSchema, validateBody } from '@/lib/schemas';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

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
            .where(and(eq(blogs.slug, blogSlug), eq(blogs.is_published, true)))
            .orderBy(asc(comments.created_at))
            .limit(100);

        return NextResponse.json(rows);
    } catch (err) {
        console.error('[API] Comments GET error:', err);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const { blogSlug } = await params;

        const limit = checkRateLimit(`comments:${getClientIp(request)}`, { capacity: 5, refillPerSec: 5 / 60 });
        if (!limit.ok) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
            );
        }

        let payload;
        try {
            payload = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const validated = await validateBody(commentSchema, payload);
        if (!validated.ok) {
            return NextResponse.json({ error: 'Validation failed', errors: validated.errors }, { status: 400 });
        }
        const { name, body } = validated.value;

        const blog = await db.select({ id: blogs.id }).from(blogs).where(
            and(eq(blogs.slug, blogSlug), eq(blogs.is_published, true))
        );
        if (!blog.length) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        const blogId = blog[0].id;

        const duplicate = await db.select({ id: comments.id }).from(comments).where(
            and(
                eq(comments.blog_id, blogId),
                eq(comments.name, name),
                eq(comments.body, body),
                gt(comments.created_at, sql`NOW() - INTERVAL '60 seconds'`)
            )
        );
        if (duplicate.length) {
            return NextResponse.json({ error: 'Duplicate comment' }, { status: 429 });
        }

        const [inserted] = await db.insert(comments).values({
            blog_id: blogId,
            name,
            body,
        }).returning({
            id: comments.id,
            name: comments.name,
            body: comments.body,
            created_at: comments.created_at,
        });

        return NextResponse.json(inserted, { status: 201 });
    } catch (err) {
        console.error('[API] Comments POST error:', err);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
