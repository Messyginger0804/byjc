import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { blogs, comments } from '../../../../../db/schema.js';
import { eq, and, asc, gt, sql } from 'drizzle-orm';

export async function GET(request, { params }) {
    const { blogSlug } = await params;

    const blog = await db.select({ id: blogs.id }).from(blogs).where(
        and(eq(blogs.slug, blogSlug), eq(blogs.is_published, true))
    );
    if (!blog.length) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const rows = await db.select({
        id: comments.id,
        name: comments.name,
        body: comments.body,
        created_at: comments.created_at,
    }).from(comments).where(eq(comments.blog_id, blog[0].id)).orderBy(asc(comments.created_at));

    return NextResponse.json(rows);
}

export async function POST(request, { params }) {
    const { blogSlug } = await params;
    const { name, body } = await request.json();

    if (!name?.trim() || !body?.trim()) {
        return NextResponse.json({ error: 'Name and body are required' }, { status: 400 });
    }

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
            eq(comments.name, name.trim()),
            eq(comments.body, body.trim()),
            gt(comments.created_at, sql`NOW() - INTERVAL '60 seconds'`)
        )
    );
    if (duplicate.length) {
        return NextResponse.json({ error: 'Duplicate comment' }, { status: 429 });
    }

    const [inserted] = await db.insert(comments).values({
        blog_id: blogId,
        name: name.trim(),
        body: body.trim(),
    }).returning({
        id: comments.id,
        name: comments.name,
        body: comments.body,
        created_at: comments.created_at,
    });

    return NextResponse.json(inserted, { status: 201 });
}
