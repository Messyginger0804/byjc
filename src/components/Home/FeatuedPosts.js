import { sortBlogs } from '@/utils';
import { FEATURED_SLOTS, FEATURED_SLOT_MAIN, FEATURED_SLOT_SECONDARY_1, FEATURED_SLOT_SECONDARY_2 } from '@/lib/constants';
import React from 'react'
import BlogLayoutOne from '../Blog/BlogLayoutOne';
import BlogLayoutTwo from '../Blog/BlogLayoutTwo';
import Link from 'next/link';

function FeatuedPosts({ blogs }) {
    const sortedBlogs = sortBlogs(blogs);

    const heroPost = sortedBlogs[0];
    const usedBlogIds = new Set(heroPost ? [heroPost.id] : []);

    const slotMap = {
        [FEATURED_SLOT_MAIN]: null,
        [FEATURED_SLOT_SECONDARY_1]: null,
        [FEATURED_SLOT_SECONDARY_2]: null,
    };

    for (const blog of sortedBlogs) {
        if (blog.featured_slot && slotMap.hasOwnProperty(blog.featured_slot) && !usedBlogIds.has(blog.id)) {
            slotMap[blog.featured_slot] = blog;
            usedBlogIds.add(blog.id);
        }
    }

    const fallbackPool = sortedBlogs.filter(b => !usedBlogIds.has(b.id));

    if (!slotMap[FEATURED_SLOT_MAIN] && fallbackPool.length > 0) {
        slotMap[FEATURED_SLOT_MAIN] = fallbackPool.shift();
        usedBlogIds.add(slotMap[FEATURED_SLOT_MAIN].id);
    }
    if (!slotMap[FEATURED_SLOT_SECONDARY_1] && fallbackPool.length > 0) {
        slotMap[FEATURED_SLOT_SECONDARY_1] = fallbackPool.shift();
        usedBlogIds.add(slotMap[FEATURED_SLOT_SECONDARY_1].id);
    }
    if (!slotMap[FEATURED_SLOT_SECONDARY_2] && fallbackPool.length > 0) {
        slotMap[FEATURED_SLOT_SECONDARY_2] = fallbackPool.shift();
    }

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
                    <BlogLayoutOne blog={slotMap[FEATURED_SLOT_MAIN]} />
                </article>
                <article className=" col-span-2 sm:col-span-1 row-span-1 relative">
                    <BlogLayoutTwo blog={slotMap[FEATURED_SLOT_SECONDARY_1]} />

                </article>
                <article className="col-span-2 sm:col-span-1 row-span-1 relative">
                    <BlogLayoutTwo blog={slotMap[FEATURED_SLOT_SECONDARY_2]} />
                </article>

            </div>


        </section>

    )
}

export default FeatuedPosts