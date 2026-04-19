import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const { rows } = await pool.query(
            `SELECT id, title, description, slug, author, tags, image_url, published_at, updated_at, is_published
             FROM blogs WHERE is_published = true ORDER BY published_at DESC`
        );
        return NextResponse.json(rows);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { title, description, content, author, tags, image_url, slug, is_published } = await request.json();

        const { rows } = await pool.query(
            `INSERT INTO blogs (title, description, content, author, tags, image_url, slug, is_published)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [title, description, content, author, tags, image_url, slug, is_published ?? true]
        );
        return NextResponse.json(rows[0], { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
