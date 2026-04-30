import FeatuedPosts from '@/components/Home/FeatuedPosts';
import HomeCover from '@/components/Home/HomeCover';
import siteMetadata from '@/utils/metaData';
import db from '@/lib/drizzle';
import { blogs } from '../../../db/schema.js';
import { eq, and, lte, desc, sql } from 'drizzle-orm';

export const revalidate = 60;

export async function generateMetadata() {
    return {
        title: 'Blogs By JC',
        description: 'Explore insightful blogs, tech tips, and tutorials brought to you by JC. Discover solutions, ideas, and innovations in the tech world.',
        openGraph: {
            title: 'Blogs | By JC',
            description: 'Explore insightful blogs, tech tips, and tutorials brought to you by JC.',
            url: siteMetadata.siteUrl,
            siteName: 'By JC',
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Blogs | By JC',
            description: 'Explore insightful blogs, tech tips, and tutorials brought to you by JC.',
        },
    };
}

export default async function Home() {
    let blogList = [];
    try {
        const rows = await db.select({
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
        }).from(blogs).where(
            and(eq(blogs.is_published, true), lte(blogs.published_at, sql`NOW()`))
        ).orderBy(desc(blogs.published_at));

        blogList = rows.map(row => ({
            ...row,
            tags: Array.isArray(row.tags) ? row.tags : [],
        }));
    } catch (err) {
        console.error('[BlogsList] Error fetching blogs:', err);
    }

    return (
        <main className="flex flex-col items-center justify-center">
            <HomeCover blogs={blogList} />
            <FeatuedPosts blogs={blogList} />
        </main>
    );
}
