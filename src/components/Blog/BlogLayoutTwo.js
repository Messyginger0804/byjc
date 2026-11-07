import Link from 'next/link'
import ImageWithRetry from '@/components/UI/ImageWithRetry';
import React from 'react'
import { format } from 'date-fns'
import { getBlogCardData } from './getBlogCardData'

function BlogLayoutTwo({ blog }) {
    if (!blog) return null;
    const { imgSrc, primaryTag, blogUrl, publishedAt } = getBlogCardData(blog);

    return (
        <div className="group glass-card has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent dark:has-[a:focus-visible]:ring-accent-bright relative h-full p-3 flex flex-col sm:flex-row gap-5 items-stretch overflow-hidden">
            <div className="relative w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto sm:min-h-40 shrink-0 overflow-hidden rounded-2xl">
                <ImageWithRetry
                    src={imgSrc}
                    alt={blog.title}
                    fill
                    className="object-cover object-center transition-transform ease-out duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 20vw"
                    retries={3}
                    retryDelay={1000}
                />
            </div>
            <div className="flex flex-col justify-center py-2 pr-3 min-w-0">
                <span className="self-start rounded-full border border-accent/30 dark:border-accent-bright/30 px-3 py-1 font-mono-jb text-[0.7rem] uppercase tracking-[0.15em] text-accent dark:text-accent-bright">{primaryTag}</span>
                <h2 className="mt-3 font-display font-semibold text-lg sm:text-xl tracking-tight leading-snug text-balance">
                    <Link href={blogUrl} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                        {blog.title}
                    </Link>
                </h2>
                <time className="mt-2 font-mono-jb text-xs uppercase tracking-[0.15em] text-muted">
                    {format(new Date(publishedAt), "MMM dd, yyyy")}
                </time>
            </div>
        </div>
    )
}

export default BlogLayoutTwo
