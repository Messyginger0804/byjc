import { NextResponse } from 'next/server';
import db from '@/lib/drizzle';
import { blogs } from '../../../../db/schema.js';
import { eq, and, lte, sql } from 'drizzle-orm';
import { FEATURED_SLOT_MAIN } from '@/lib/constants';
import { resolveCorsOrigin } from '@/lib/cors';

export async function GET(request) {
    const origin = resolveCorsOrigin(request.headers.get('origin'));
    try {
        const rows = await db.select({
            title: blogs.title,
            slug: blogs.slug,
            description: blogs.description,
            image_url: blogs.image_url,
            tags: blogs.tags,
        }).from(blogs).where(
            and(
                eq(blogs.featured_slot, FEATURED_SLOT_MAIN),
                eq(blogs.is_published, true),
                lte(blogs.published_at, sql`NOW()`)
            )
        ).limit(1);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'No blog of the month set' }, {
                status: 404,
                headers: corsHeaders(origin),
            });
        }

        const blog = rows[0];
        return NextResponse.json(
            {
                title: blog.title,
                url: `https://www.byjc.dev/blogs/${blog.slug}`,
                snippet: blog.description,
                image: blog.image_url,
                tags: Array.isArray(blog.tags) ? blog.tags : [],
            },
            { headers: corsHeaders(origin) }
        );
    } catch (err) {
        console.error('[blog-of-the-month] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, {
            status: 500,
            headers: corsHeaders(origin),
        });
    }
}

export async function OPTIONS(request) {
    const origin = resolveCorsOrigin(request.headers.get('origin'));
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

function corsHeaders(origin) {
    return {
        ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}
