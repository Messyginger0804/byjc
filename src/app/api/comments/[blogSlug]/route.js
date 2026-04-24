import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
    const { blogSlug } = await params;

    const blog = await pool.query(`SELECT id FROM blogs WHERE slug = $1 AND is_published = true`, [blogSlug]);
    if (!blog.rows.length) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const { rows } = await pool.query(
        `SELECT id, name, body, created_at FROM comments WHERE blog_id = $1 ORDER BY created_at ASC`,
        [blog.rows[0].id]
    );
    return NextResponse.json(rows);
}

export async function POST(request, { params }) {
    const { blogSlug } = await params;
    const { name, body } = await request.json();

    if (!name?.trim() || !body?.trim()) {
        return NextResponse.json({ error: 'Name and body are required' }, { status: 400 });
    }

    const blog = await pool.query(`SELECT id FROM blogs WHERE slug = $1 AND is_published = true`, [blogSlug]);
    if (!blog.rows.length) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const blogId = blog.rows[0].id;

    // Duplicate check: same name+body on this blog within 60s
    const duplicate = await pool.query(
        `SELECT id FROM comments WHERE blog_id = $1 AND name = $2 AND body = $3 AND created_at > NOW() - INTERVAL '60 seconds'`,
        [blogId, name.trim(), body.trim()]
    );
    if (duplicate.rows.length) {
        return NextResponse.json({ error: 'Duplicate comment' }, { status: 429 });
    }

    const { rows } = await pool.query(
        `INSERT INTO comments (blog_id, name, body) VALUES ($1, $2, $3) RETURNING id, name, body, created_at`,
        [blogId, name.trim(), body.trim()]
    );
    return NextResponse.json(rows[0], { status: 201 });
}
