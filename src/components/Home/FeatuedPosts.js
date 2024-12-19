import { sortBlogs } from '@/utils';
import React from 'react'
import BlogLayoutOne from '../Blog/BlogLayoutOne';
import BlogLayoutTwo from '../Blog/BlogLayoutTwo';
import Link from 'next/link';
// import BlogLayoutThree from '../Blog/BlogLayoutThree';

function FeatuedPosts({ blogs }) {
    const sortedBlogs = sortBlogs(blogs);
    // console.log("------->", sortedBlogs[3])

    // console.log(sortBlogs.title)
    return (
        <section className="w-full mt-16 sm:mt-24  md:mt-32 px-5 sm:px-10 md:px-24  sxl:px-32 flex flex-col items-center justify-center">

            <h2 className="w-full inline-block font-bold capitalize text-2xl md:text-4xl dark:text-light">Featured Posts
            </h2>
            <Link
                className="flex font-medium mt-6 end-0 text-accent dark:text-accentDark underline hover:scale-150 duration-200 underline-offset-2 text-base md:text-lg"
                href='/categories/all'
            >
                view all
            </Link>

            <div className="grid grid-cols-2 grid-rows-2 gap-6  mt-10 sm:mt-16">
                <article className=" col-span-2 sxl:col-span-1 row-span-2 relative">
                    <BlogLayoutOne blog={sortedBlogs[2]} />
                </article>
                <article className=" col-span-2 sm:col-span-1 row-span-1 relative">
                    <BlogLayoutTwo blog={sortedBlogs[5]} />

                </article>
                <article className="col-span-2 sm:col-span-1 row-span-1 relative">
                    <BlogLayoutTwo blog={sortedBlogs[0]} />
                </article>

            </div>


        </section>

    )
}

export default FeatuedPosts