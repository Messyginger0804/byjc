import FeatuedPosts from '@/components/Home/FeatuedPosts';
import HomeCover from '@/components/Home/HomeCover';
import siteMetadata from '@/utils/metaData';

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
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/blogs`, {
        cache: 'no-store',
    });
    const blogs = await res.json();

    return (
        <main className="flex flex-col items-center justify-center">
            <HomeCover blogs={blogs} />
            <FeatuedPosts blogs={blogs} />
        </main>
    );
}
