import BlogLayoutThree from "@/components/Blog/BlogLayoutThree";
import Categories from "@/components/Blog/Categories";
import GithubSlugger, { slug } from "github-slugger";

export const dynamic = 'force-dynamic';

async function getBlogs() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/blogs`, { cache: 'no-store' });
    return res.json();
}

export async function generateMetadata({ params }) {
    return {
        title: `${params.slug.replaceAll("-", " ")} Blogs`,
        description: `Learn more about ${params.slug === "all" ? "web development" : params.slug} through my collection of blogs and tutorials`,
    };
}

export default async function CategoryPage({ params }) {
    const allBlogs = await getBlogs();
    const slugger = new GithubSlugger();

    const allCategories = ["all"];
    const blogs = allBlogs.filter((blog) => {
        return blog.tags.some((tag) => {
            const slugged = slug(tag);
            if (!allCategories.includes(slugged)) allCategories.push(slugged);
            if (params.slug === "all") return true;
            return slugged === params.slug;
        });
    });

    return (
        <article className="mt-12 flex flex-col text-dark dark:text-light">
            <div className="px-5 sm:px-10 md:px-24 sxl:px-32 flex flex-col">
                <h1 className="mt-6 font-semibold text-2xl md:text-4xl lg:text-5xl">#{params.slug}</h1>
                <span className="mt-2 inline-block">Discover more categories and expand your knowledge!</span>
            </div>
            <Categories categories={allCategories} currentSlug={params.slug} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-16 mt-5 sm:mt-10 md:mt-24 sxl:mt-32 px-5 sm:px-10 md:px-24 sxl:px-32">
                {blogs.map((blog, index) => (
                    <article key={index} className="col-span-1 row-span-1 relative">
                        <BlogLayoutThree blog={blog} />
                    </article>
                ))}
            </div>
        </article>
    );
}
