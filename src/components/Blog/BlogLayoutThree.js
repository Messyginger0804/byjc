import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const BlogLayoutThree = ({ blog }) => {
    const imgSrc = blog.image_url || blog.image?.filePath?.replace("../public", "");
    const blogUrl = blog.url || `/blogs/${blog.slug}`;
    const publishedAt = blog.publishedAt || blog.published_at;

    return (
        <div className="group flex flex-col items-center text-dark dark:text-light transition-all duration-300 hover:-translate-y-2">
            <Link href={blogUrl} className="w-full h-64 md:h-80 rounded-2xl overflow-hidden relative shadow-modern group-hover:shadow-modern-lg transition-all duration-500">
                <Image
                    src={imgSrc}
                    alt={blog.title}
                    fill
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-all ease duration-500"
                    sizes="(max-width: 640px) 100vw,(max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>

            <div className="flex flex-col w-full mt-6">
                <span className="uppercase text-accent dark:text-accentDark font-bold text-xs tracking-wider">
                    {blog.tags[0]}
                </span>
                <Link href={blogUrl} className="inline-block my-2">
                    <h2 className="font-bold capitalize text-lg sm:text-xl tracking-tight text-balance leading-snug">
                        <span className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50
                            dark:to-accentDark/50 bg-[length:0px_4px] group-hover:bg-[length:100%_4px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 pb-1">
                            {blog.title}
                        </span>
                    </h2>
                </Link>
                <span className="capitalize text-gray dark:text-light/50 font-medium text-sm">
                    {format(new Date(publishedAt), "MMMM dd, yyyy")}
                </span>
            </div>
        </div>
    );
};

export default BlogLayoutThree;
