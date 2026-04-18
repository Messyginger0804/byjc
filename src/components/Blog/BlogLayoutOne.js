import Image from 'next/image'
import React from 'react'
import Tag from '../Elements/Tag'
import Link from 'next/link'
import { slug } from 'github-slugger'
import { format } from 'date-fns'

function BlogLayoutOne({ blog }) {
    const imgSrc = blog.image_url || blog.image?.filePath?.replace("../public", "");
    const blogUrl = blog.url || `/blogs/${blog.slug}`;
    const publishedAt = blog.publishedAt || blog.published_at;

    return (
        <div className="group inline-block overflow-hidden rounded-xl h-full">
            <div
                className="absolute top-0 left-0 bottom-0 right-0 h-full bg-gradient-to-b from-transparent from-0% to-dark/90 rounded-xl z-10"
            />
            <Image
                src={imgSrc}
                alt={blog.title}
                width={blog.image?.width || 800}
                height={blog.image?.height || 600}
                className="w-full h-full object-center object-cover rounded-xl group-hover:scale-105 transition-all ease duration-300"
                sizes="(max-width: 1180px) 100vw, 50vw"
            />
            <div className="w-full absolute bottom-0 p-4 xs:p-6 sm:p-10 z-20">
                <Tag
                    link={`/categories/${slug(blog.tags[0])}`}
                    name={blog.tags[0]}
                    className="px-6 text-xs  sm:text-sm py-1 sm:py-2 !border "
                />
                <Link href={blogUrl} className='mt-6'>
                    <h2 className="font-bold capitalize text-sm xs:text-base sm:text-xl md:text-2xl text-light mt-2 sm:mt-4">
                        <span
                            className="bg-gradient-to-r from-accent to-accent bg-[length:0px_6px]
                             dark:from-accentDark/50 group-hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat
                              transition-[background-size] duration-500 "
                        >
                            {blog.title}
                        </span>
                        <span className="inline-block w-full capitalize text-gray dark:text-light/50 font-semibold  text-xs sm:text-base">
                            {format(new Date(publishedAt), "MMMM dd, yyyy")}
                        </span>
                    </h2>
                </Link>
            </div>
        </div>
    )
}

export default BlogLayoutOne
