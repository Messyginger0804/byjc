export const dynamic = 'force-dynamic';

import BlogDetails from "@/components/Blog/BlogDetails";
import RenderMdx from "@/components/Blog/RenderMdx";
import Tag from "@/components/Elements/Tag";
import siteMetadata from "@/utils/metaData";
import { slug } from "github-slugger";
import GithubSlugger from "github-slugger";
import Image from "next/image";
import { serialize } from "next-mdx-remote/serialize";
import readingTime from "reading-time";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

const codeOptions = { theme: 'github-dark', grid: false };

async function getBlog(slugParam) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/blogs/${slugParam}`,
        { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return res.json();
}

function computeToc(rawContent) {
    const slugger = new GithubSlugger();
    const headingRegex = /^(?<flag>#{1,6})\s+(?<content>.+)$/gm;
    return Array.from(rawContent.matchAll(headingRegex)).map(({ groups }) => ({
        level: groups.flag.length === 1 ? "one" : groups.flag.length === 2 ? "two" : "three",
        text: groups.content,
        slug: groups.content ? slugger.slug(groups.content) : undefined,
    }));
}

function getOgImageUrl(imageUrl) {
    if (!imageUrl) {
        return `${siteMetadata.siteUrl}${siteMetadata.socialBanner}`;
    }

    return imageUrl.includes('http') ? imageUrl : `${siteMetadata.siteUrl}${imageUrl}`;
}

export async function generateMetadata({ params }) {
    const { slug: blogSlug } = await params;
    const blog = await getBlog(blogSlug);
    if (!blog) return {};

    const publishedAt = new Date(blog.published_at).toISOString();
    const modifiedAt = new Date(blog.updated_at || blog.published_at).toISOString();
    const ogImages = [{ url: getOgImageUrl(blog.image_url) }];

    return {
        title: blog.title,
        description: blog.description,
        openGraph: {
            title: blog.title,
            description: blog.description,
            url: `${siteMetadata.siteUrl}/blogs/${blog.slug}`,
            siteName: siteMetadata.title,
            locale: "en_US",
            type: "article",
            publishedTime: publishedAt,
            modifiedTime: modifiedAt,
            images: ogImages,
            authors: [blog.author || siteMetadata.author],
        },
        twitter: {
            card: "summary_large_image",
            title: blog.title,
            description: blog.description,
            images: ogImages,
        },
    };
}

export default async function BlogPage({ params }) {
    const { slug: blogSlug } = await params;
    const blog = await getBlog(blogSlug);

    if (!blog) {
        return (
            <div className="w-full h-[50vh] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-dark dark:text-light mb-4">Blog Not Found</h1>
                    <p className="text-dark/70 dark:text-light/70">The blog post you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    const mdxSource = await serialize(blog.content, {
        mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: "append" }],
                [rehypePrettyCode, codeOptions],
            ],
        },
    });

    const toc = computeToc(blog.content);
    const rt = readingTime(blog.content);

    const enrichedBlog = {
        ...blog,
        publishedAt: blog.published_at,
        readingTime: rt,
        toc,
    };

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": blog.title,
        "description": blog.description,
        "image": [getOgImageUrl(blog.image_url)],
        "datePublished": new Date(blog.published_at).toISOString(),
        "dateModified": new Date(blog.updated_at || blog.published_at).toISOString(),
        "author": [{ "@type": "Person", "name": blog.author || siteMetadata.author, "url": siteMetadata.portfolio }],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <article>
                <div className="mb-8 text-center relative w-full h-[70vh] bg-dark">
                    <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        {blog.tags?.length > 0 && (
                            <Tag
                                name={blog.tags[0]}
                                link={`/categories/${slug(blog.tags[0])}`}
                                className="px-6 text-sm py-2"
                            />
                        )}
                        <h1 className="inline-block mt-12 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6">
                            {blog.title}
                        </h1>
                    </div>
                    <div className="absolute top-0 left-0 rounded-3xl right-0 bottom-0 h-full bg-dark/60 dark:bg-dark/70" />
                    {blog.image_url && (
                        <Image
                            src={blog.image_url}
                            alt={blog.title}
                            fill
                            className="aspect-square w-full h-full rounded-3xl object-cover object-center"
                            priority
                            sizes="100vw"
                        />
                    )}
                </div>
                <BlogDetails blog={enrichedBlog} slug={blogSlug} />

                <div className="grid grid-cols-12 gap-y-8 lg:gap-8 sxl:gap-16 mt-8 px-5 md:px-10">
                    <div className="col-span-12 lg:col-span-4">
                        <details
                            className="border-[1px] border-solid border-dark dark:border-light text-dark dark:text-light rounded-lg p-4 sticky top-6 max-h-[80vh] overflow-hidden overflow-y-auto"
                            open
                        >
                            <summary className="text-lg font-semibold capitalize cursor-pointer">
                                Table Of Content
                            </summary>
                            <ul className="mt-4 font-in text-base">
                                {toc.map((heading) => (
                                    <li key={`#${heading.slug}`} className="py-1">
                                        <a
                                            href={`#${heading.slug}`}
                                            data-level={heading.level}
                                            className="
                                                data-[level=two]:pl-0  
                                                data-[level=two]:pt-2
                                                data-[level=two]:border-t border-solid border-dark/40
                                                data-[level=three]:pl-4
                                                sm:data-[level=three]:pl-6
                                                flex items-center justify-start
                                            "
                                        >
                                            {heading.level === "three" && (
                                                <span className="flex w-1 h-1 rounded-full bg-dark mr-2">&nbsp;</span>
                                            )}
                                            <span className="hover:underline">{heading.text}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    </div>
                    <RenderMdx source={mdxSource} />
                </div>
            </article>
        </>
    );
}
