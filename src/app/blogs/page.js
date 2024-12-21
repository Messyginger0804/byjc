import FeatuedPosts from '@/components/Home/FeatuedPosts';
import HomeCover from '@/components/Home/HomeCover';
import siteMetadata from '@/utils/metaData';
import { allBlogs } from 'contentlayer/generated';

export async function generateMetadata() {
    return {
        title: 'Blogs',
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

export default function Home() {
    console.log(allBlogs);

    return (
        <main className="flex flex-col items-center justify-center">
            <HomeCover blogs={allBlogs} />
            <FeatuedPosts blogs={allBlogs} />
            {/* <RecentPosts blogs={allBlogs} /> */}
        </main>
    );
}
