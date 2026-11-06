// Short enough that a scheduled post is not stuck behind a cached 404 for long: a
// pre-publish visit caches notFound(), and nothing writes when `published_at` passes
// (API writes also revalidate this path explicitly), so the page self-heals within
// this window. App Router cannot vary `revalidate` per request.
export const revalidate = 300;

import { cache } from "react";
import BlogDetails from "@/components/Blog/BlogDetails";
import RenderMdx from "@/components/Blog/RenderMdx";
import Tag from "@/components/Elements/Tag";
import siteMetadata from "@/utils/metaData";
import { getPublishedBlogBySlug } from "@/lib/queries/blogs";
import { slug } from "github-slugger";
import GithubSlugger from "github-slugger";
import ImageWithRetry from "@/components/UI/ImageWithRetry";
import CommentsSection from "@/components/Comments/CommentsSection";
import readingTime from "reading-time";
import { notFound } from "next/navigation";
import { getBlogImage, getPrimaryBlogTag } from "@/lib/blogPresentation";
import JsonLd from "@/components/JsonLd";

// Opts the route into ISR: pages are rendered on first request and cached for
// `revalidate` seconds. Returning no params avoids touching the database at build time.
export async function generateStaticParams() {
    return [];
}

export const getBlog = cache(async function getBlog(slugParam) {
    return getPublishedBlogBySlug(slugParam);
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
    const ogImages = [{ url: getOgImageUrl(getBlogImage(blog)) }];

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

    const toc = computeToc(blog.content);
    const rt = readingTime(blog.content);
    const image = getBlogImage(blog);
    const primaryTag = getPrimaryBlogTag(blog);

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
        "image": [getOgImageUrl(image)],
        "datePublished": new Date(blog.published_at).toISOString(),
        "dateModified": new Date(blog.updated_at || blog.published_at).toISOString(),
        "author": [{ "@type": "Person", "name": blog.author || siteMetadata.author, "url": siteMetadata.portfolio }],
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <article>
                <div className="mb-8 text-center relative w-full h-[70vh] bg-dark overflow-hidden rounded-3xl">
                    <ImageWithRetry
                        src={image}
                        fallbackSrc={getBlogImage(null)}
                        alt={blog.title}
                        fill
                        className="w-full h-full object-cover object-center"
                        priority
                        sizes="100vw"
                        retries={3}
                        retryDelay={1500}
                    />
                    <div className="absolute top-0 left-0 right-0 bottom-0 z-10 bg-gradient-to-b from-transparent via-dark/30 to-dark/90" />
                    <div className="z-20 w-full flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Tag
                            name={primaryTag}
                            link={`/categories/${slug(primaryTag)}`}
                            className="px-6 text-sm py-2"
                        />
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
                    <RenderMdx source={blog.content} />
                </div>
                <CommentsSection slug={blogSlug} />
            </article>
        </>
    );
}
