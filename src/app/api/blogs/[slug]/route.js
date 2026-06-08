import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { blogs } from '../../../../../db/schema.js';
import { eq, and, lte, ne, sql } from 'drizzle-orm';
import { FEATURED_SLOTS, isValidFeaturedSlot } from '@/lib/constants';
import { requireBlogApiAuth } from '@/lib/blogApiAuth';
import { parseCstToUtc } from '@/lib/dateUtils';
import { blogSchema, validateBody } from '@/lib/schemas';

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

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const existing = await db.select({ id: blogs.id }).from(blogs).where(eq(blogs.slug, slug));
        if (!existing.length) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        const blogId = existing[0].id;

        const validated = await validateBody(blogSchema, body);
        if (!validated.ok) {
            return NextResponse.json({ error: 'Validation failed', errors: validated.errors }, { status: 400 });
        }

        const { title, description, content, author, tags, image_url, slug: newSlug, is_published, is_featured, featured_slot, published_at } = validated.value;

        if (featured_slot !== undefined && featured_slot !== null && !isValidFeaturedSlot(featured_slot)) {
            return NextResponse.json({ error: 'Invalid featured_slot. Must be null or one of: ' + FEATURED_SLOTS.join(', ') }, { status: 400 });
        }

        if (newSlug && newSlug !== slug) {
            const slugConflict = await db.select({ id: blogs.id }).from(blogs).where(eq(blogs.slug, newSlug));
            if (slugConflict.length) {
                return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
            }
        }

        if (featured_slot) {
            await db.update(blogs)
                .set({ featured_slot: null })
                .where(and(eq(blogs.featured_slot, featured_slot), ne(blogs.id, blogId)));
        }

        const updates = { updated_at: sql`NOW()` };

        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (content !== undefined) updates.content = content;
        if (author !== undefined) updates.author = author;
        if (tags !== undefined) updates.tags = tags;
        if (image_url !== undefined) updates.image_url = image_url;
        if (newSlug !== undefined) updates.slug = newSlug;
        if (is_published !== undefined) updates.is_published = is_published;
        if (is_featured !== undefined) updates.is_featured = is_featured;
        if (featured_slot !== undefined) updates.featured_slot = featured_slot;

        if (published_at !== undefined) {
            const parsedDate = parseCstToUtc(published_at);
            if (parsedDate) {
                updates.published_at = new Date(parsedDate);
            }
        }

        await db.update(blogs)
            .set(updates)
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
        console.error('[API] Blog update error:', err);
        return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
    }
}
