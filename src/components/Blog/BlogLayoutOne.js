import ImageWithRetry from '@/components/UI/ImageWithRetry';
import React from 'react'
import Tag from '../Elements/Tag'
import Link from 'next/link'
import { slug } from 'github-slugger'
import { format } from 'date-fns'

function BlogLayoutOne({ blog }) {
    if (!blog) return null;
    const imgSrc = blog.image_url || blog.image?.filePath?.replace("../public", "");
    const blogUrl = `/blogs/${blog.slug}`;
    const publishedAt = blog.publishedAt || blog.published_at;

    return (
        <div className="group relative overflow-hidden rounded-3xl h-full shadow-modern hover:shadow-modern-lg transition-all duration-500 hover:-translate-y-2">
            <div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-dark/30 to-dark/90 z-10 transition-opacity duration-500 group-hover:opacity-90"
            />
            <ImageWithRetry
                src={imgSrc}
                alt={blog.title}
                width={blog.image?.width || 800}
                height={blog.image?.height || 600}
                className="w-full h-full object-center object-cover rounded-3xl group-hover:scale-110 transition-all ease duration-700"
                sizes="(max-width: 1180px) 100vw, 50vw"
                retries={3}
                retryDelay={1000}
            />
            <div className="w-full absolute bottom-0 p-6 xs:p-8 sm:p-10 z-20">
                <Tag
                    link={`/categories/${slug(blog.tags[0])}`}
                    name={blog.tags[0]}
                    className="!px-4 !py-1 text-xs font-bold uppercase tracking-wider !border-white/20 glass"
                />
                <Link href={blogUrl} className='block mt-4 group/title'>
                    <h2 className="font-bold capitalize text-lg xs:text-xl sm:text-2xl md:text-3xl text-light tracking-tight text-balance leading-tight">
                        <span
                            className="bg-gradient-to-r from-accent to-accent dark:from-accentDark/50 bg-[length:0px_4px] group-hover:bg-[length:100%_4px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 pb-1"
                        >
                            {blog.title}
                        </span>
                    </h2>
                    <span className="inline-block w-full mt-2 capitalize text-light/70 font-medium text-xs sm:text-sm tracking-wide">
                        {format(new Date(publishedAt), "MMMM dd, yyyy")}
                    </span>
                </Link>
            </div>
        </div>
    )
}

export default BlogLayoutOne
