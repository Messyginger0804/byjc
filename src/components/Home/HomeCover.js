import ImageWithRetry from '@/components/UI/ImageWithRetry';
import Link from 'next/link';
import React from 'react'
import { format } from 'date-fns'
import Tag from '../Elements/Tag';
import { slug } from 'github-slugger';
import { sortBlogs } from '@/utils'
import { getBlogImage, getPrimaryBlogTag } from '@/lib/blogPresentation';

function HomeCover({ blogs }) {
    const sortedBlogs = sortBlogs(blogs);
    const blog = sortedBlogs[0];

    if (!blog) return null;

    const imgSrc = getBlogImage(blog);
    const primaryTag = getPrimaryBlogTag(blog);
    const blogUrl = `/blogs/${blog.slug}`;
    const publishedAt = blog.publishedAt || blog.published_at;

    return (
        <section className='container-page pt-4 md:pt-8'>
            <p className="eyebrow text-gradient reveal-up mb-4" style={{ '--i': 0 }}>Latest / Featured</p>
            <article className='group relative isolate overflow-hidden rounded-3xl bg-ink min-h-[26rem] sm:min-h-[30rem] md:min-h-[34rem] max-h-[44rem] text-white flex items-end shadow-glow has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent-bright has-[a:focus-visible]:ring-offset-2'>
                <ImageWithRetry
                    src={imgSrc}
                    alt={blog.title}
                    fill
                    className='object-center object-cover -z-20 transition-transform duration-[1200ms] ease-out group-hover:scale-105'
                    sizes='(min-width: 1280px) 1280px, 100vw'
                    priority
                    retries={3}
                    retryDelay={1500}
                />
                {/* Legibility scrim: dark gradient plus a feathered backdrop blur behind the text block. */}
                <div className='absolute inset-0 -z-10 bg-gradient-to-t from-ink from-10% via-ink/80 via-45% to-ink/10' />
                <div className='absolute inset-0 -z-10 bg-gradient-to-r from-ink/60 via-ink/10 to-transparent' />
                <div
                    aria-hidden='true'
                    className='absolute inset-x-0 bottom-0 -z-10 h-3/4 backdrop-blur-md'
                    style={{
                        WebkitMaskImage: 'linear-gradient(to top, #000 0%, #000 40%, transparent 100%)',
                        maskImage: 'linear-gradient(to top, #000 0%, #000 40%, transparent 100%)',
                    }}
                />

                <div className='w-full lg:w-3/4 px-6 pb-8 pt-40 sm:px-10 sm:pb-10 md:px-14 md:pb-14 md:pt-48 flex flex-col items-start'>
                    <div className='flex flex-wrap items-center gap-3 reveal-up' style={{ '--i': 1 }}>
                        <Tag link={`/categories/${slug(primaryTag)}`} name={primaryTag} className="relative z-20" />
                        {publishedAt && (
                            <time className="font-mono-jb text-xs uppercase tracking-[0.15em] text-white/75">
                                {format(new Date(publishedAt), 'MMM dd, yyyy')}
                            </time>
                        )}
                    </div>
                    {/* The reveal transform lives on the inner span, not the h1/Link, so the Link's ::after overlay anchors to the card. */}
                    <h1 className='mt-5 display-lg font-display text-balance [text-shadow:0_2px_24px_rgb(0_0_0/0.45)]'>
                        <Link href={blogUrl} className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none">
                            <span className='reveal-up inline-block' style={{ '--i': 2 }}>{blog.title}</span>
                        </Link>
                    </h1>
                    <p className='hidden sm:block mt-4 max-w-2xl text-lg text-white/80 line-clamp-3 reveal-up' style={{ '--i': 2 }}>
                        {blog.description}
                    </p>
                    <span className="hidden sm:inline-flex mt-6 items-center gap-2 font-mono-jb text-xs uppercase tracking-[0.2em] text-amber" aria-hidden="true">
                        Read the story <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                    </span>
                </div>
            </article>
        </section>
    )
}

export default HomeCover
