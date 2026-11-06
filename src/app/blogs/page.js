import FeaturedPosts from '@/components/Home/FeaturedPosts';
import HomeCover from '@/components/Home/HomeCover';
import siteMetadata from '@/utils/metaData';
import { unstable_cache } from 'next/cache';
import { getPublishedBlogs } from '@/lib/queries/blogs';
import { BLOG_CACHE_TAG } from '@/lib/revalidateBlogs';
import { createPageMetadata, createBlogJsonLd } from '@/lib/metadata';
import JsonLd from '@/components/JsonLd';

// PostgreSQL is a runtime dependency; do not require it while building an image.
// force-dynamic ignores route-level `revalidate`, so the list is cached explicitly
// (lazily, at request time) for 60 seconds.
export const dynamic = 'force-dynamic';

const getCachedBlogs = unstable_cache(() => getPublishedBlogs(50), ['blogs-page-list'], { revalidate: 60, tags: [BLOG_CACHE_TAG] });

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
    const blogList = await getCachedBlogs();

    return (
        <div className="pb-24">
            <JsonLd data={createBlogJsonLd()} />
            <HomeCover blogs={blogList} />
            <FeaturedPosts blogs={blogList} />
        </div>
    );
}
