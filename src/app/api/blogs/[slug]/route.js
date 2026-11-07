import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { blogs } from '../../../../../db/schema.js';
import { eq, and, lte, ne, sql } from 'drizzle-orm';
import { requireBlogApiAuth } from '@/lib/blogApiAuth';
import { featuredSlotError, uniqueViolationResponse, buildBlogUpdates, normalizeTags } from '@/lib/blogApi';
import { blogPatchSchema, validateBody } from '@/lib/schemas';
import { runFeaturedSlotTransaction } from '@/lib/blogTransactions';
import { revalidateBlogPaths } from '@/lib/revalidateBlogs';

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

        const validated = await validateBody(blogPatchSchema, body);
        if (!validated.ok) {
            return NextResponse.json({ error: 'Validation failed', errors: validated.errors }, { status: 400 });
        }

        const { featured_slot } = validated.value;

        const slotError = featuredSlotError(featured_slot);
        if (slotError) {
            return NextResponse.json({ error: slotError }, { status: 400 });
        }

        const updates = buildBlogUpdates(validated.value);

        const updateBlog = async (tx) => {
            const existing = await tx.select({ id: blogs.id })
                .from(blogs)
                .where(eq(blogs.slug, slug))
                .for('update');
            if (!existing.length) return null;

            const blogId = existing[0].id;
            if (featured_slot) {
                await tx.update(blogs)
                    .set({ featured_slot: null })
                    .where(and(eq(blogs.featured_slot, featured_slot), ne(blogs.id, blogId)));
            }

            await tx.update(blogs).set(updates).where(eq(blogs.id, blogId));

            const rows = await tx.select({
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
            return rows[0];
        };

        const updated = featured_slot
            ? await runFeaturedSlotTransaction(db, updateBlog)
            : await db.transaction(updateBlog);

        if (!updated) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        revalidateBlogPaths(slug, updated.slug);
        const blog = {
            ...updated,
            tags: normalizeTags(updated.tags)
        };
        return NextResponse.json(blog);
    } catch (err) {
        console.error('[API] Blog update error:', err);
        const conflict = uniqueViolationResponse(err);
        if (conflict) {
            return NextResponse.json({ error: conflict.error }, { status: conflict.status });
        }
        return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
    }
}
