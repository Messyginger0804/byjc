import db from '@/lib/drizzle';
import { blogs } from '../../../db/schema.js';
import { eq, and, lte, desc, sql } from 'drizzle-orm';

const baseBlogFields = {
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
    featured_slot: blogs.featured_slot,
};

function normalizeTags(row) {
    return {
        ...row,
        tags: Array.isArray(row.tags) ? row.tags : (row.tags ? [row.tags] : []),
    };
}

export async function getPublishedBlogs(limit = 50) {
    const rows = await db
        .select(baseBlogFields)
        .from(blogs)
        .where(and(eq(blogs.is_published, true), lte(blogs.published_at, sql`NOW()`)))
        .orderBy(desc(blogs.published_at))
        .limit(limit);

    return rows.map(normalizeTags);
}

export async function getPublishedBlogBySlug(slugParam) {
    const rows = await db
        .select({
            ...baseBlogFields,
            content: blogs.content,
        })
        .from(blogs)
        .where(
            and(
                eq(blogs.slug, slugParam),
                eq(blogs.is_published, true),
                lte(blogs.published_at, sql`NOW()`)
            )
        );

    if (!rows.length) return null;
    const row = rows[0];
    return {
        ...normalizeTags(row),
        content: row.content || '',
    };
}
