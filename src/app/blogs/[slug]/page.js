export const revalidate = 3600;

import { cache } from "react";
import BlogDetails from "@/components/Blog/BlogDetails";
import RenderMdx from "@/components/Blog/RenderMdx";
import Tag from "@/components/Elements/Tag";
import siteMetadata from "@/utils/metaData";
import { getPublishedBlogBySlug } from "@/lib/queries/blogs";
import db from "@/lib/drizzle";
import { blogs as blogsTable, comments } from "../../../../db/schema.js";
import { eq, and, asc } from "drizzle-orm";
import { slug } from "github-slugger";
import GithubSlugger from "github-slugger";
import ImageWithRetry from "@/components/UI/ImageWithRetry";
import { serialize } from "next-mdx-remote/serialize";
import CommentsSection from "@/components/Comments/CommentsSection";
import readingTime from "reading-time";
import { notFound } from "next/navigation";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

const codeOptions = { theme: 'github-dark', grid: false };

const getBlog = cache(async function getBlog(slugParam) {
    try {
        return await getPublishedBlogBySlug(slugParam);
    } catch (err) {
        console.error(`[BlogPage] Error fetching blog "${slugParam}":`, err);
        return null;
    }
});

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
        keywords: blog.tags || [],
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
        alternates: {
            canonical: `${siteMetadata.siteUrl}/blogs/${blog.slug}`,
        },
    };
}

export default async function BlogPage({ params }) {
    const { slug: blogSlug } = await params;
    const blog = await getBlog(blogSlug);

    if (!blog) {
        notFound();
    }

    let initialComments = [];
    try {
        initialComments = await db.select({
            id: comments.id,
            name: comments.name,
            body: comments.body,
            created_at: comments.created_at,
        })
            .from(comments)
            .innerJoin(blogsTable, eq(comments.blog_id, blogsTable.id))
            .where(and(eq(blogsTable.slug, blogSlug), eq(blogsTable.is_published, true)))
            .orderBy(asc(comments.created_at))
            .limit(100);
    } catch (err) {
        console.error('[BlogPage] Error fetching comments:', err);
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
        publishedAt: new Date(blog.published_at).toISOString(),
        readingTime: rt,
        toc,
    };

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
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
                <div className="mb-8 text-center relative w-full h-[70vh] bg-dark overflow-hidden rounded-3xl">
                    {blog.image_url && (
                        <ImageWithRetry
                            src={blog.image_url}
                            alt={blog.title}
                            fill
                            className="w-full h-full object-cover object-center"
                            priority
                            sizes="100vw"
                            retries={3}
                            retryDelay={1500}
                        />
                    )}
                    <div className="absolute top-0 left-0 right-0 bottom-0 z-10 bg-gradient-to-b from-transparent via-dark/30 to-dark/90" />
                    <div className="z-20 w-full flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
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
                <CommentsSection slug={blogSlug} initialComments={initialComments} />
            </article>
        </>
    );
}
