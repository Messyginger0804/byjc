import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import React from 'react'
import { slug } from 'github-slugger'
import { getPrimaryBlogTag } from '@/lib/blogPresentation'

const BlogDetails = ({ blog }) => {
    const publishedAt = blog.publishedAt || blog.published_at;
    const primaryTag = getPrimaryBlogTag(blog);
    const mono = "font-mono-jb text-xs uppercase tracking-[0.15em]";
    return (
        <div className="glass mt-6 py-4 px-6 md:px-8 flex items-center justify-between gap-x-8 gap-y-3 flex-wrap rounded-2xl">
            <div className={`flex items-center gap-x-8 gap-y-2 flex-wrap ${mono}`}>
                <time className="flex items-center gap-2" dateTime={publishedAt}>
                    <span className="text-muted">Published</span>
                    {format(parseISO(publishedAt), "MMM d, yyyy")}
                </time>
                <div className="flex items-center gap-2">
                    <span className="text-muted">Read</span>
                    {blog.readingTime?.text || blog.reading_time}
                </div>
                <Link href={`/categories/${slug(primaryTag)}`} className="text-accent dark:text-accent-bright hover:underline underline-offset-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright">
                    #{primaryTag}
                </Link>
            </div>
            <a
                href="#comments"
                className="rounded-full bg-signal-cta px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2"
            >
                Add Comment
            </a>
        </div>
    )
}

export default BlogDetails
