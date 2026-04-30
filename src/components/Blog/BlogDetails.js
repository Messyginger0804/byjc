import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import React from 'react'
import { slug } from 'github-slugger'

const BlogDetails = ({ blog, slug: blogSlug }) => {
    const publishedAt = blog.publishedAt || blog.published_at;
    return (
        <div className="mx-5 md:mx-10 mt-8 py-4 px-6 md:px-10 glass text-dark dark:text-light flex items-center justify-around flex-wrap text-base sm:text-lg font-bold rounded-2xl shadow-modern border border-dark/10 dark:border-light/10">
            <time className="flex items-center gap-2">
                <span className="opacity-60 font-medium">Published:</span>
                {format(parseISO(publishedAt), "LLLL d, yyyy")}
            </time>
            <div className="flex items-center gap-2">
                <span className="opacity-60 font-medium">Read:</span>
                {blog.readingTime?.text || blog.reading_time}
            </div>
            <Link href={`/categories/${slug(blog.tags[0])}`} className="text-accent dark:text-accentDark hover:underline underline-offset-4 decoration-2">
                #{blog.tags[0]}
            </Link>
            <a
                href="#comments"
                className="btn-primary text-sm sm:text-base py-2 px-5"
            >
                Add Comment
            </a>
        </div>
    )
}

export default BlogDetails
