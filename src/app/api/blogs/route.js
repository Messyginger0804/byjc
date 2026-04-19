import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { FEATURED_SLOTS, isValidFeaturedSlot } from '@/lib/constants';

export async function GET() {
    try {
        const { rows } = await pool.query(
            `SELECT id, title, description, slug, author, tags, image_url, published_at, updated_at, is_published, featured_slot
             FROM blogs WHERE is_published = true ORDER BY published_at DESC`
        );
        return NextResponse.json(rows);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { title, description, content, author, tags, image_url, slug, is_published, featured_slot } = await request.json();

        if (featured_slot !== undefined && !isValidFeaturedSlot(featured_slot)) {
            return NextResponse.json({ error: 'Invalid featured_slot. Must be null or one of: ' + FEATURED_SLOTS.join(', ') }, { status: 400 });
        }

        const { rows } = await pool.query(
            `INSERT INTO blogs (title, description, content, author, tags, image_url, slug, is_published, featured_slot)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [title, description, content, author, tags, image_url, slug, is_published ?? true, featured_slot ?? null]
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
