import ImageWithRetry from '@/components/UI/ImageWithRetry';
import React from 'react'
import Tag from '../Elements/Tag'
import Link from 'next/link'
import { slug } from 'github-slugger'
import { format } from 'date-fns'
import { getBlogCardData } from './getBlogCardData'

function BlogLayoutOne({ blog }) {
    if (!blog) return null;
    const { imgSrc, primaryTag, blogUrl, publishedAt } = getBlogCardData(blog);

    return (
        <div className="group glass-card has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent dark:has-[a:focus-visible]:ring-accent-bright relative overflow-hidden h-full min-h-[22rem] bg-ink">
            <ImageWithRetry
                src={imgSrc}
                alt={blog.title}
                fill
                className="object-cover object-center transition-transform ease-out duration-700 group-hover:scale-105"
                sizes="(max-width: 1180px) 100vw, 50vw"
                retries={3}
                retryDelay={1000}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
            {/* Whole-card click target; the title link below is the single keyboard/AT tab stop. */}
            <Link href={blogUrl} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 z-10 text-white pointer-events-none">
                <Tag
                    link={`/categories/${slug(primaryTag)}`}
                    name={primaryTag}
                    className="relative z-20 pointer-events-auto"
                />
                <h2 className="mt-4 font-display font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-balance leading-[1.05]">
                    <Link href={blogUrl} className="pointer-events-auto focus-visible:outline-none">
                        {blog.title}
                    </Link>
                </h2>
                <time className="block mt-3 font-mono-jb text-xs uppercase tracking-[0.15em] text-white/75">
                    {format(new Date(publishedAt), "MMM dd, yyyy")}
                </time>
            </div>
        </div>
    )
}

export default BlogLayoutOne
