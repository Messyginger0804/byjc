import FeaturedPosts from '@/components/Home/FeaturedPosts';
import HomeCover from '@/components/Home/HomeCover';
import siteMetadata from '@/utils/metaData';
import { getPublishedBlogs } from '@/lib/queries/blogs';
import { createPageMetadata, createBlogJsonLd } from '@/lib/metadata';

export const revalidate = 60;

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
    let blogList = [];
    try {
        blogList = await getPublishedBlogs(50);
    } catch (err) {
        console.error('[BlogsList] Error fetching blogs:', err);
    }

    return (
        <main className="flex flex-col items-center justify-center">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(createBlogJsonLd()) }}
            />
            <HomeCover blogs={blogList} />
            <FeaturedPosts blogs={blogList} />
        </main>
    );
}
