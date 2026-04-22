import FeatuedPosts from '@/components/Home/FeatuedPosts';
import HomeCover from '@/components/Home/HomeCover';
import siteMetadata from '@/utils/metaData';
import siteUrl from '@/utils/siteUrl';

export const dynamic = 'force-dynamic';

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
const res = await fetch(`${siteUrl}/api/blogs`, {
            cache: 'no-store',
        });
        if (!res.ok) {
            console.error(`[BlogsList] Failed to fetch blogs: ${res.status} ${res.statusText}`);
        } else {
            const data = await res.json();
            blogs = Array.isArray(data) ? data : [];
        }
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
