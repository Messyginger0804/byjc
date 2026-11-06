import FeaturedPosts from '@/components/Home/FeaturedPosts';
import HomeCover from '@/components/Home/HomeCover';
import siteMetadata from '@/utils/metaData';
import { getPublishedBlogs } from '@/lib/queries/blogs';
import { createPageMetadata, createBlogJsonLd } from '@/lib/metadata';
import JsonLd from '@/components/JsonLd';

export const revalidate = 60;
// PostgreSQL is a runtime dependency; do not require it while building an image.
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
    return createPageMetadata({
        title: 'Blogs By JC',
        description: 'Explore insightful blogs, tech tips, and tutorials brought to you by JC. Discover solutions, ideas, and innovations in the tech world.',
        keywords: [
            "blog",
            "tech blog",
            "software development blog",
            "tutorials",
            "web development articles",
            "JC Ashley blog",
        ],
        url: `${siteMetadata.siteUrl}/blogs`,
        ogTitle: 'Blogs | By JC',
    });
}

export default async function Home() {
    const blogList = await getPublishedBlogs(50);

    return (
        <div className="pb-24">
            <JsonLd data={createBlogJsonLd()} />
            <HomeCover blogs={blogList} />
            <FeaturedPosts blogs={blogList} />
        </div>
    );
}
