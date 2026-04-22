import FeatuedPosts from '@/components/Home/FeatuedPosts';
import HomeCover from '@/components/Home/HomeCover';
import siteMetadata from '@/utils/metaData';
import pool from '@/lib/db';

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
    let blogs = [];
    try {
        const { rows } = await pool.query(
            `SELECT id, title, description, slug, author, tags, image_url, published_at, updated_at, is_published, featured_slot
             FROM blogs WHERE is_published = true AND published_at <= NOW() ORDER BY published_at DESC`
        );
        blogs = rows.map(row => ({
            ...row,
            tags: Array.isArray(row.tags) ? row.tags : [],
        }));
    } catch (err) {
        console.error('[BlogsList] Error fetching blogs:', err);
    }

    return (
        <main className="flex flex-col items-center justify-center">
            <HomeCover blogs={blogs} />
            <FeatuedPosts blogs={blogs} />
        </main>
    );
}
