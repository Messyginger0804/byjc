import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { blogs } from '../../../../../db/schema.js';
import { eq, and, lte, ne, sql } from 'drizzle-orm';
import { FEATURED_SLOTS, isValidFeaturedSlot } from '@/lib/constants';
import { requireBlogApiAuth } from '@/lib/blogApiAuth';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        if (!slug || typeof slug !== 'string') {
            return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
        }

        const rows = await db.select({
            id: blogs.id,
            title: blogs.title,
            description: blogs.description,
            slug: blogs.slug,
            author: blogs.author,
            tags: blogs.tags,
            image_url: blogs.image_url,
            content: blogs.content,
            published_at: blogs.published_at,
            updated_at: blogs.updated_at,
            is_published: blogs.is_published,
            is_featured: blogs.is_featured,
            featured_slot: blogs.featured_slot,
        }).from(blogs).where(
            and(eq(blogs.slug, slug), eq(blogs.is_published, true), lte(blogs.published_at, sql`NOW()`))
        );

        if (!rows.length) {
            const check = await db.select({
                is_published: blogs.is_published,
                published_at: blogs.published_at,
            }).from(blogs).where(eq(blogs.slug, slug));

            if (check.length) {
                const r = check[0];
                console.warn(`[API] Blog '${slug}' found but not visible: is_published=${r.is_published}, published_at=${r.published_at}`);
            }
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const blog = {
            ...rows[0],
            tags: Array.isArray(rows[0].tags) ? rows[0].tags : (rows[0].tags ? [rows[0].tags] : []),
            content: rows[0].content || ''
        };
        return NextResponse.json(blog);
    } catch (err) {
        console.error('[API] Blog fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    const authError = requireBlogApiAuth(request);
    if (authError) return authError;

    try {
        const { slug } = await params;
        const { featured_slot } = await request.json();

        if (featured_slot !== undefined && !isValidFeaturedSlot(featured_slot)) {
            return NextResponse.json({ error: 'Invalid featured_slot. Must be null or one of: ' + FEATURED_SLOTS.join(', ') }, { status: 400 });
        }

        const existing = await db.select({ id: blogs.id }).from(blogs).where(eq(blogs.slug, slug));
        if (!existing.length) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        const blogId = existing[0].id;

        if (featured_slot) {
            await db.update(blogs)
                .set({ featured_slot: null })
                .where(and(eq(blogs.featured_slot, featured_slot), ne(blogs.id, blogId)));
        }

        await db.update(blogs)
            .set({ featured_slot, updated_at: sql`NOW()` })
            .where(eq(blogs.id, blogId));

        const rows = await db.select({
            id: blogs.id,
            title: blogs.title,
            description: blogs.description,
            slug: blogs.slug,
            author: blogs.author,
            tags: blogs.tags,
            image_url: blogs.image_url,
            content: blogs.content,
            published_at: blogs.published_at,
            updated_at: blogs.updated_at,
            is_published: blogs.is_published,
            is_featured: blogs.is_featured,
            featured_slot: blogs.featured_slot,
        }).from(blogs).where(eq(blogs.id, blogId));

        const blog = {
            ...rows[0],
            tags: Array.isArray(rows[0].tags) ? rows[0].tags : []
        };
        return NextResponse.json(blog);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
