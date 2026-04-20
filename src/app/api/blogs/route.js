import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { FEATURED_SLOTS, isValidFeaturedSlot } from '@/lib/constants';
import { requireBlogApiAuth } from '@/lib/blogApiAuth';

export async function GET() {
    try {
        const { rows } = await pool.query(
            `SELECT id, title, description, slug, author, tags, image_url, published_at, updated_at, is_published, featured_slot
             FROM blogs WHERE is_published = true AND published_at <= NOW() ORDER BY published_at DESC`
        );
        return NextResponse.json(rows);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

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
    
    if (isNaN(date.getTime())) {
        return null;
    }
    
    return date.toISOString();
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
             RETURNING *`,
            [title, description, content, author, tags, image_url, slug, is_published ?? true, featured_slot ?? null, publishTime ?? new Date().toISOString()]
        );

        if (featured_slot) {
            await pool.query(
                `UPDATE blogs SET featured_slot = NULL WHERE featured_slot = $1 AND id != $2`,
                [featured_slot, rows[0].id]
            );
        }

        return NextResponse.json(rows[0], { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
