import BlogLayoutThree from "@/components/Blog/BlogLayoutThree";
import Categories from "@/components/Blog/Categories";
import { slug } from "github-slugger";
import siteMetadata from "@/utils/metaData";
import db from "@/lib/drizzle";
import { blogs } from "../../../../db/schema.js";
import { eq, and, lte, desc, sql } from "drizzle-orm";

export const revalidate = 60;

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
        return blog.tags.some((tag) => {
            const slugged = slug(tag);
            if (!allCategories.includes(slugged)) allCategories.push(slugged);
            if (categorySlug === "all") return true;
            return slugged === categorySlug;
        });
    });

    return (
        <article className="mt-12 flex flex-col text-dark dark:text-light">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify({
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
                }) }}
            />
            <div className="px-5 sm:px-10 md:px-24 sxl:px-32 flex flex-col">
                <h1 className="mt-6 font-semibold text-2xl md:text-4xl lg:text-5xl">#{categorySlug}</h1>
                <span className="mt-2 inline-block">Discover more categories and expand your knowledge!</span>
            </div>
            <Categories categories={allCategories} currentSlug={categorySlug} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-16 mt-5 sm:mt-10 md:mt-24 sxl:mt-32 px-5 sm:px-10 md:px-24 sxl:px-32">
                {filteredBlogs.map((blog, index) => (
                    <article key={index} className="col-span-1 row-span-1 relative">
                        <BlogLayoutThree blog={blog} />
                    </article>
                ))}
            </div>
        </article>
    );
}
