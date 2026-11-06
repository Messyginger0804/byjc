import ImageWithRetry from '@/components/UI/ImageWithRetry';
import React from 'react'
import Tag from '../Elements/Tag'
import Link from 'next/link'
import { slug } from 'github-slugger'
import { format } from 'date-fns'
import { getBlogImage, getPrimaryBlogTag } from '@/lib/blogPresentation'

function BlogLayoutOne({ blog }) {
    if (!blog) return null;
    const imgSrc = getBlogImage(blog);
    const primaryTag = getPrimaryBlogTag(blog);
    const blogUrl = `/blogs/${blog.slug}`;
    const publishedAt = blog.publishedAt || blog.published_at;

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
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 z-10 text-white">
                <Tag
                    link={`/categories/${slug(primaryTag)}`}
                    name={primaryTag}
                    className="relative z-20"
                />
                <h2 className="mt-4 font-display font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-balance leading-[1.05]">
                    <Link href={blogUrl} className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none">
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
