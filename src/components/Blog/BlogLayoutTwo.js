import Link from 'next/link'
import ImageWithRetry from '@/components/UI/ImageWithRetry';
import React from 'react'
import { format } from 'date-fns'

function BlogLayoutTwo({ blog }) {
    if (!blog) return null;
    const imgSrc = blog.image_url || blog.image?.filePath?.replace("../public", "");
    const blogUrl = `/blogs/${blog.slug}`;
    const publishedAt = blog.publishedAt || blog.published_at;

    return (
        <div className="group grid grid-cols-12 gap-6 items-center text-dark dark:text-light transition-all duration-300 hover:-translate-x-2">
            <Link
                className='col-span-4 h-full rounded-2xl overflow-hidden shadow-modern group-hover:shadow-modern-lg transition-all duration-500'
                href={blogUrl}
            >
                <ImageWithRetry
                    src={imgSrc}
                    alt={blog.title}
                    width={blog.image?.width || 400}
                    height={blog.image?.height || 400}
                    className="aspect-square w-full h-full object-cover object-center group-hover:scale-110 transition-all ease duration-500"
                    sizes="(max-width: 640px) 100vw,(max-width: 1024px) 50vw, 33vw"
                    retries={3}
                    retryDelay={1000}
                />
            </Link>
            <div className="col-span-12 lg:col-span-8 w-full">
                <span className="inline-block w-full uppercase text-accent dark:text-accentDark font-bold text-xs tracking-wider">{blog.tags[0]}</span>
                <Link href={blogUrl} className='inline-block my-2 '>
                    <h2 className="font-bold capitalize text-lg sm:text-xl tracking-tight leading-snug text-balance">
                        <span
                            className="bg-gradient-to-r from-accent/50 dark:from-accentDark/50 to-accent/50 dark:to-accentDark/50 bg-[length:0px_4px]
                group-hover:bg-[length:100%_4px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 pb-1"
                        >
                            {blog.title}
                        </span>
                    </h2>
                </Link>
                <span className="inline-block w-full capitalize text-gray dark:text-light/50 font-medium text-sm">
                    {format(new Date(publishedAt), "MMMM dd, yyyy")}
                </span>
            </div>
        </div>
    )
}


export default BlogLayoutTwo
