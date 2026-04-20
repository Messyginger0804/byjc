import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { FEATURED_SLOTS, isValidFeaturedSlot } from '@/lib/constants';
import { requireBlogApiAuth } from '@/lib/blogApiAuth';

function parseCstToUtc(dateStr) {
    if (!dateStr) return null;

    const hasTimezone = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/.test(dateStr);
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

    let date;
    if (hasTimezone) {
        date = new Date(dateStr);
    } else if (isDateOnly) {
        date = new Date(dateStr + 'T00:00:00-06:00');
    } else {
        date = new Date(dateStr + '-06:00');
    }

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}

export async function GET() {
    try {
        const start = Date.now();
        const { rows } = await pool.query(
            `SELECT id, title, description, slug, author, tags, image_url, published_at, updated_at, is_published, featured_slot
             FROM blogs WHERE is_published = true AND published_at <= NOW() ORDER BY published_at DESC`
        );
        console.log(`[API] Fetched ${rows.length} blogs in ${Date.now() - start}ms`);

        if (rows.length === 0) {
            const debug = await pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_published = true) as published, COUNT(*) FILTER (WHERE published_at <= NOW()) as ready FROM blogs`);
            console.log(`[API] Debug - total:${debug.rows[0].total}, published:${debug.rows[0].published}, ready:${debug.rows[0].ready}`);
        }

        const blogs = rows.map(row => ({
            ...row,
            tags: Array.isArray(row.tags) ? row.tags : [],
            _fixed: true
        }));
        return NextResponse.json(blogs);
    } catch (err) {
        console.error('[API] Blog fetch error:', err);
        return NextResponse.json([]);
    }
}

export async function POST(request) {
    const authError = requireBlogApiAuth(request);
    if (authError) return authError;

    try {
        const { title, description, content, author, tags, image_url, slug, is_published, featured_slot, published_at } = await request.json();

        if (featured_slot !== undefined && !isValidFeaturedSlot(featured_slot)) {
            return NextResponse.json({ error: 'Invalid featured_slot. Must be null or one of: ' + FEATURED_SLOTS.join(', ') }, { status: 400 });
        }

        const publishTime = parseCstToUtc(published_at);

        const { rows } = await pool.query(
            `INSERT INTO blogs (title, description, content, author, tags, image_url, slug, is_published, featured_slot, published_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id, title, description, slug, author, tags, image_url, content, is_published, featured_slot, published_at, updated_at`,
            [title, description, content, author, tags, image_url, slug, is_published ?? true, featured_slot ?? null, publishTime ?? new Date().toISOString()]
        );

        if (featured_slot) {
            await pool.query(
                `UPDATE blogs SET featured_slot = NULL WHERE featured_slot = $1 AND id != $2`,
                [featured_slot, rows[0].id]
            );
        }

        const blog = {
            ...rows[0],
            tags: Array.isArray(rows[0].tags) ? rows[0].tags : []
        };
        return NextResponse.json(blog, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
