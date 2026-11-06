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
import ParallaxMedia from "@/components/Blog/ParallaxMedia";
import ScrollProgress from "@/components/Motion/ScrollProgress";

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
            <ScrollProgress />
            <article className="container-page pb-16">
                <div className="relative isolate w-full h-[70vh] min-h-[26rem] mt-4 overflow-hidden rounded-3xl bg-ink">
                    <ParallaxMedia className="absolute inset-0">
                        <ImageWithRetry
                            src={image}
                            fallbackSrc={getBlogImage(null)}
                            alt={blog.title}
                            fill
                            className="object-cover object-center"
                            priority
                            sizes="(min-width: 1280px) 1280px, 100vw"
                            retries={3}
                            retryDelay={1500}
                        />
                    </ParallaxMedia>
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
                    <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-10 md:p-14 text-white">
                        <div className="reveal-up" style={{ "--i": 0 }}>
                            <Tag
                                name={primaryTag}
                                link={`/categories/${slug(primaryTag)}`}
                            />
                        </div>
                        <h1 className="display-lg font-display mt-5 max-w-4xl text-balance reveal-up" style={{ "--i": 1 }}>
                            {blog.title}
                        </h1>
                    </div>
                </div>
                <BlogDetails blog={enrichedBlog} slug={blogSlug} />

                <div className="grid grid-cols-12 gap-y-8 lg:gap-12 mt-12">
                    <div className="col-span-12 lg:col-span-4 order-first">
                        <details
                            className="glass rounded-2xl p-5 sticky top-24 max-h-[80vh] overflow-y-auto"
                            open
                        >
                            <summary className="eyebrow cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright">
                                Table of contents
                            </summary>
                            <ul className="mt-4 text-sm">
                                {toc.map((heading) => (
                                    <li key={`#${heading.slug}`} className="py-1">
                                        <a
                                            href={`#${heading.slug}`}
                                            data-level={heading.level}
                                            className="flex items-center justify-start rounded text-muted hover:text-accent dark:hover:text-accent-bright transition-colors data-[level=one]:font-semibold data-[level=two]:pl-0 data-[level=three]:pl-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright"
                                        >
                                            {heading.level === "three" && (
                                                <span className="flex w-1 h-1 rounded-full bg-accent dark:bg-accent-bright mr-2" aria-hidden="true" />
                                            )}
                                            <span>{heading.text}</span>
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
