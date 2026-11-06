import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { blogs } from '../../../../db/schema.js';
import { eq, and, lte, desc, sql } from 'drizzle-orm';
import { requireBlogApiAuth } from '@/lib/blogApiAuth';
import { blogSchema, validateBody } from '@/lib/schemas';
import { checkRateLimit, getClientIp, TrustedClientIpError } from '@/lib/rateLimit';
import { featuredSlotError, uniqueViolationResponse, resolvePublishedAt, normalizeTags } from '@/lib/blogApi';
import { runFeaturedSlotTransaction } from '@/lib/blogTransactions';
import { revalidateBlogPaths } from '@/lib/revalidateBlogs';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const page = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit'), 10) || 20));

        const start = Date.now();

        const whereClause = and(eq(blogs.is_published, true), lte(blogs.published_at, sql`NOW()`));

        const [{ total }] = await db
            .select({ total: sql`count(*)::int` })
            .from(blogs)
            .where(whereClause);

        const rows = await db.select({
            id: blogs.id,
            title: blogs.title,
            description: blogs.description,
            slug: blogs.slug,
            author: blogs.author,
            tags: blogs.tags,
            image_url: blogs.image_url,
            published_at: blogs.published_at,
            updated_at: blogs.updated_at,
            is_published: blogs.is_published,
            is_featured: blogs.is_featured,
            featured_slot: blogs.featured_slot,
        }).from(blogs)
          .where(whereClause)
          .orderBy(desc(blogs.published_at))
          .limit(limit)
          .offset((page - 1) * limit);

        if (rows.length === 0 && page === 1) {
            const [debug] = await db.select({
                total: sql`count(*)`,
                published: sql`count(*) filter (where ${blogs.is_published} = true)`,
                ready: sql`count(*) filter (where ${blogs.published_at} <= NOW())`,
            }).from(blogs);
            console.warn(`[API] No blogs returned — total:${debug.total}, published:${debug.published}, ready:${debug.ready} (took ${Date.now() - start}ms)`);
        }

        const data = rows.map(row => ({
            ...row,
            tags: Array.isArray(row.tags) ? row.tags : [],
        }));

        return NextResponse.json(
            {
                data,
                meta: {
                    page,
                    limit,
                    total: total || 0,
                    pages: Math.ceil((total || 0) / limit),
                },
            },
            {
                headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
            }
        );
    } catch (err) {
        console.error('[API] Blog fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
}

export async function POST(request) {
    const authError = requireBlogApiAuth(request);
    if (authError) return authError;

    let clientIp;
    try {
        clientIp = getClientIp(request);
    } catch (err) {
        if (err instanceof TrustedClientIpError) {
            return NextResponse.json({ error: 'Unable to establish trusted client identity' }, { status: 503 });
        }
        throw err;
    }
    let limit;
    try {
        limit = await checkRateLimit(`blogs:${clientIp}`, { capacity: 30, refillPerSec: 30 / 60 });
    } catch (err) {
        console.error('[API] Blog rate limit error:', err);
        return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503, headers: { 'Retry-After': '5' } });
    }
    if (!limit.ok) {
        return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
        );
    }

    try {
        let payload;
        try {
            payload = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const validated = await validateBody(blogSchema, payload);
        if (!validated.ok) {
            return NextResponse.json({ error: 'Validation failed', errors: validated.errors }, { status: 400 });
        }
        const { title, description, content, author, tags, image_url, slug, is_published, is_featured, featured_slot, published_at } = validated.value;

        const slotError = featuredSlotError(featured_slot);
        if (slotError) {
            return NextResponse.json({ error: slotError }, { status: 400 });
        }

        const createBlog = async (tx) => {
            if (featured_slot) {
                await tx.update(blogs)
                    .set({ featured_slot: null })
                    .where(eq(blogs.featured_slot, featured_slot));
            }

            const [inserted] = await tx.insert(blogs).values({
                title,
                description,
                content,
                author,
                tags,
                image_url,
                slug,
                is_published: is_published ?? true,
                is_featured: is_featured ?? false,
                featured_slot: featured_slot ?? null,
                published_at: resolvePublishedAt(published_at),
            }).returning({
                id: blogs.id,
                title: blogs.title,
                description: blogs.description,
                slug: blogs.slug,
                author: blogs.author,
                tags: blogs.tags,
                image_url: blogs.image_url,
                content: blogs.content,
                is_published: blogs.is_published,
                is_featured: blogs.is_featured,
                featured_slot: blogs.featured_slot,
                published_at: blogs.published_at,
                updated_at: blogs.updated_at,
            });
            return inserted;
        };

        const inserted = featured_slot
            ? await runFeaturedSlotTransaction(db, createBlog)
            : await db.transaction(createBlog);

        revalidateBlogPaths(inserted.slug);
        const blog = {
            ...inserted,
            tags: normalizeTags(inserted.tags)
        };
        return NextResponse.json(blog, { status: 201 });
    } catch (err) {
        console.error('[API] Blog create error:', err);
        const conflict = uniqueViolationResponse(err);
        if (conflict) {
            return NextResponse.json({ error: conflict.error }, { status: conflict.status });
        }
        return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
    }
}
