import { sortBlogs } from '@/utils';
import Link from 'next/link';
import React from 'react'
import BlogLayoutThree from '../Blog/BlogLayoutThree';
import { Reveal, Stagger, StaggerItem } from '../Motion';

function RecentPosts({ blogs }) {
    const sortedBlogs = sortBlogs(blogs);

    return (
        <section className="container-page mt-20 md:mt-28">
            <Reveal className="flex items-end justify-between gap-4">
                <div>
                    <p className="eyebrow mb-2">Fresh</p>
                    <h2 className="display-md font-display">Recent Posts</h2>
                </div>
                <Link
                    className="font-mono-jb text-xs uppercase tracking-[0.2em] text-accent dark:text-accent-bright hover:underline underline-offset-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2"
                    href='/categories/all'
                >View all &rarr;</Link>
            </Reveal>
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-8 md:mt-10">
                {sortedBlogs.slice(4, 10).map((blog) => (
                    <StaggerItem key={blog.id ?? blog.slug}>
                        <BlogLayoutThree blog={blog} />
                    </StaggerItem>
                ))}
            </Stagger>
        </section>
    )
}

export default RecentPosts
