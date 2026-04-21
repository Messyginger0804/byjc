import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { FEATURED_SLOT_MAIN } from '@/lib/constants';

export async function GET() {
    try {
        const { rows } = await pool.query(
            `SELECT title, slug, description, image_url, tags
             FROM blogs
             WHERE featured_slot = $1 AND is_published = true AND published_at <= NOW()
             LIMIT 1`,
            [FEATURED_SLOT_MAIN]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'No blog of the month set' }, {
                status: 404,
                headers: corsHeaders(),
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
            { headers: corsHeaders() }
        );
    } catch (err) {
        console.error('[blog-of-the-month] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, {
            status: 500,
            headers: corsHeaders(),
        });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}
