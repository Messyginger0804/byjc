import { format } from "date-fns";
import ImageWithRetry from "@/components/UI/ImageWithRetry";
import Link from "next/link";
import React from "react";
import { getBlogImage, getPrimaryBlogTag } from "@/lib/blogPresentation";

const BlogLayoutThree = ({ blog }) => {
    const imgSrc = getBlogImage(blog);
    const primaryTag = getPrimaryBlogTag(blog);
    const blogUrl = `/blogs/${blog.slug}`;
    const publishedAt = blog.publishedAt || blog.published_at;

    return (
        <div className="group glass-card has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent dark:has-[a:focus-visible]:ring-accent-bright relative h-full p-3 flex flex-col overflow-hidden">
            <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl">
                <ImageWithRetry
                    src={imgSrc}
                    alt={blog.title}
                    fill
                    className="object-cover object-center transition-transform ease-out duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw,(max-width: 1024px) 50vw, 33vw"
                />
            </div>
            <div className="flex flex-col flex-1 px-3 pt-5 pb-3">
                <span className="self-start rounded-full border border-accent/30 dark:border-accent-bright/30 px-3 py-1 font-mono-jb text-[0.7rem] uppercase tracking-[0.15em] text-accent dark:text-accent-bright">
                    {primaryTag}
                </span>
                <h2 className="mt-3 font-display font-semibold text-xl tracking-tight text-balance leading-snug">
                    <Link href={blogUrl} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                        {blog.title}
                    </Link>
                </h2>
                <time className="mt-auto pt-4 font-mono-jb text-xs uppercase tracking-[0.15em] text-muted">
                    {format(new Date(publishedAt), "MMM dd, yyyy")}
                </time>
            </div>
        </div>
    );
};

export default BlogLayoutThree;
