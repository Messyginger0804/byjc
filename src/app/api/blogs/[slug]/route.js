import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { FEATURED_SLOTS, isValidFeaturedSlot } from '@/lib/constants';
import { requireBlogApiAuth } from '@/lib/blogApiAuth';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        if (!slug || typeof slug !== 'string') {
            return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
        }

        const { rows } = await pool.query(
            `SELECT id, title, description, slug, author, tags, image_url, content, published_at, updated_at, is_published, featured_slot
             FROM blogs WHERE slug = $1 AND is_published = true AND published_at <= NOW()`,
            [slug]
        );

        if (!rows.length) {
            const check = await pool.query(`SELECT is_published, published_at FROM blogs WHERE slug = $1`, [slug]);
            if (check.rows.length) {
                const r = check.rows[0];
                console.log(`[API] Blog '${slug}' found but not visible: is_published=${r.is_published}, published_at=${r.published_at}`);
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

        const { rows } = await pool.query(
            `SELECT id, title, description, slug, author, tags, image_url, content, published_at, updated_at, is_published, featured_slot
             FROM blogs WHERE id = $1`, [blogId]
        );
        const blog = {
            ...rows[0],
            tags: Array.isArray(rows[0].tags) ? rows[0].tags : []
        };
        return NextResponse.json(blog);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
