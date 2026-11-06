import { sortBlogs } from '@/utils';
import { FEATURED_SLOT_MAIN, FEATURED_SLOT_SECONDARY_1, FEATURED_SLOT_SECONDARY_2 } from '@/lib/constants';
import React from 'react'
import BlogLayoutOne from '../Blog/BlogLayoutOne';
import BlogLayoutTwo from '../Blog/BlogLayoutTwo';
import Link from 'next/link';
import { Reveal, Stagger, StaggerItem } from '../Motion';

function FeaturedPosts({ blogs }) {
    const sortedBlogs = Array.isArray(blogs) ? sortBlogs(blogs) : [];

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
        <section className="container-page mt-20 md:mt-28">
            <Reveal className="flex items-end justify-between gap-4">
                <div>
                    <p className="eyebrow mb-2">Handpicked</p>
                    <h2 className="display-md font-display">Featured Posts</h2>
                </div>
                <Link
                    className="font-mono-jb text-xs uppercase tracking-[0.2em] text-accent dark:text-accent-bright hover:underline underline-offset-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2"
                    href='/categories/all'
                >
                    View all &rarr;
                </Link>
            </Reveal>

            <Stagger className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mt-8 md:mt-10">
                {slotMap[FEATURED_SLOT_MAIN] && (
                    <StaggerItem className="lg:row-span-2 min-h-[24rem]">
                        <BlogLayoutOne blog={slotMap[FEATURED_SLOT_MAIN]} />
                    </StaggerItem>
                )}
                {slotMap[FEATURED_SLOT_SECONDARY_1] && (
                    <StaggerItem>
                        <BlogLayoutTwo blog={slotMap[FEATURED_SLOT_SECONDARY_1]} />
                    </StaggerItem>
                )}
                {slotMap[FEATURED_SLOT_SECONDARY_2] && (
                    <StaggerItem>
                        <BlogLayoutTwo blog={slotMap[FEATURED_SLOT_SECONDARY_2]} />
                    </StaggerItem>
                )}
            </Stagger>
        </section>
    )
}

export default FeaturedPosts
