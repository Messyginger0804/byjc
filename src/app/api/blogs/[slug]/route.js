import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { FEATURED_SLOTS, isValidFeaturedSlot } from '@/lib/constants';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        const { rows } = await pool.query(
            `SELECT * FROM blogs WHERE slug = $1 AND is_published = true`,
            [slug]
        );
        if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(rows[0]);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const { slug } = await params;
        const { featured_slot } = await request.json();

        if (featured_slot !== undefined && !isValidFeaturedSlot(featured_slot)) {
            return NextResponse.json({ error: 'Invalid featured_slot. Must be null or one of: ' + FEATURED_SLOTS.join(', ') }, { status: 400 });
        }

        const existingRes = await pool.query(
            `SELECT id FROM blogs WHERE slug = $1`,
            [slug]
        );
        if (!existingRes.rows.length) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        const blogId = existingRes.rows[0].id;

        if (featured_slot) {
            await pool.query(
                `UPDATE blogs SET featured_slot = NULL WHERE featured_slot = $1 AND id != $2`,
                [featured_slot, blogId]
            );
        }

        await pool.query(
            `UPDATE blogs SET featured_slot = $1, updated_at = NOW() WHERE id = $2`,
            [featured_slot, blogId]
        );

        const { rows } = await pool.query(`SELECT * FROM blogs WHERE id = $1`, [blogId]);
        return NextResponse.json(rows[0]);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
