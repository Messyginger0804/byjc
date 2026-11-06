import BlogLayoutThree from "@/components/Blog/BlogLayoutThree";
import Categories from "@/components/Blog/Categories";
import { slug } from "github-slugger";
import { DEFAULT_BLOG_TAG } from "@/lib/blogPresentation";
import siteMetadata from "@/utils/metaData";
import db from "@/lib/drizzle";
import { blogs } from "../../../../db/schema.js";
import { eq, and, lte, desc, sql } from "drizzle-orm";
import JsonLd from "@/components/JsonLd";
import { Reveal } from "@/components/Motion";

export const revalidate = 60;
// PostgreSQL is a runtime dependency; do not require it while building an image.
export const dynamic = 'force-dynamic';

async function getBlogs() {
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

    return rows.map(row => ({
        ...row,
        tags: Array.isArray(row.tags) ? row.tags : [],
    }));
}

export async function generateMetadata({ params }) {
    const { slug: categorySlug } = await params;
    const categoryName = categorySlug.replaceAll("-", " ");
    const capitalizedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

    return {
        title: `${capitalizedName} Blogs`,
        description: `Learn more about ${categoryName === "all" ? "web development" : categoryName} through my collection of blogs and tutorials`,
        keywords: [
            categoryName,
            `${categoryName} blog`,
            `${categoryName} tutorial`,
            `${categoryName} web development`,
            "JC Ashley",
        ],
        openGraph: {
            title: `${capitalizedName} Blogs | By JC`,
            description: `Learn more about ${categoryName === "all" ? "web development" : categoryName} through my collection of blogs and tutorials`,
            url: `${siteMetadata.siteUrl}/categories/${categorySlug}`,
            siteName: siteMetadata.title,
            locale: "en_US",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${capitalizedName} Blogs | By JC`,
            description: `Learn more about ${categoryName === "all" ? "web development" : categoryName} through my collection of blogs and tutorials`,
        },
        alternates: {
            canonical: `${siteMetadata.siteUrl}/categories/${categorySlug}`,
        },
    };
}

export default async function CategoryPage({ params }) {
    const { slug: categorySlug } = await params;
    const allBlogs = await getBlogs();

    const allCategories = ["all"];
    const filteredBlogs = allBlogs.filter((blog) => {
        // Blogs without usable tags are shown under the same "General" fallback the cards use.
        const usableTags = blog.tags.filter((tag) => typeof tag === "string" && tag.trim());
        const tags = usableTags.length ? usableTags : [DEFAULT_BLOG_TAG];
        return tags.some((tag) => {
            const slugged = slug(tag);
            if (!allCategories.includes(slugged)) allCategories.push(slugged);
            if (categorySlug === "all") return true;
            return slugged === categorySlug;
        });
    });

    return (
        <div className="pb-24">
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": `${categorySlug === "all" ? "All" : categorySlug.replaceAll("-", " ")} Blogs`,
                    "url": `${siteMetadata.siteUrl}/categories/${categorySlug}`,
                    "description": `Learn more about ${categorySlug === "all" ? "web development" : categorySlug.replaceAll("-", " ")} through my collection of blogs and tutorials`,
                    "author": {
                        "@type": "Person",
                        "name": siteMetadata.author,
                        "url": siteMetadata.siteUrl + "/portfolio",
                    },
                }}
            />
            <header className="container-page pt-8 md:pt-12">
                <p className="eyebrow text-gradient reveal-up" style={{ "--i": 0 }}>Category</p>
                <h1 className="display-lg font-display mt-3 break-words reveal-up" style={{ "--i": 1 }}>#{categorySlug}</h1>
                <p className="mt-4 text-lg text-muted reveal-up" style={{ "--i": 2 }}>Discover more categories and expand your knowledge!</p>
            </header>
            <Categories categories={allCategories} currentSlug={categorySlug} />
            <div className="container-page grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-10 md:mt-14">
                {filteredBlogs.map((blog, i) =>
                    i < 6 ? (
                        // Above the fold: CSS entrance so content is visible before JS hydrates.
                        <div key={blog.id ?? blog.slug} className="reveal-up" style={{ "--i": i }}>
                            <BlogLayoutThree blog={blog} />
                        </div>
                    ) : (
                        <Reveal key={blog.id ?? blog.slug}>
                            <BlogLayoutThree blog={blog} />
                        </Reveal>
                    )
                )}
            </div>
        </div>
    );
}
