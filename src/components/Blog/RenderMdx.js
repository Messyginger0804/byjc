"use client"
import React from 'react'
import { MDXRemote } from 'next-mdx-remote'
import Image from 'next/image'

const mdxComponents = {
    Image
}

function RenderMdx({ source }) {
    return (
        <div className='col-span-12 lg:col-span-8 font-in prose sm:prose-base md:prose-lg max-w-none
    prose-headings:text-balance prose-headings:tracking-tight prose-headings:font-bold
    
    prose-blockquote:bg-accent/5 
    prose-blockquote:py-4
    prose-blockquote:px-8
    prose-blockquote:border-l-4
    prose-blockquote:border-accent
    prose-blockquote:not-italic
    prose-blockquote:rounded-r-2xl
    prose-blockquote:shadow-sm

    prose-li:marker:text-accent
    prose-li:marker:font-bold

    dark:prose-invert
    dark:prose-blockquote:border-accentDark
    dark:prose-blockquote:bg-accentDark/5
    dark:prose-li:marker:text-accentDark

    prose-img:rounded-3xl
    prose-img:shadow-modern

    first-letter:text-4xl
    first-letter:font-bold
    first-letter:mr-2
    sm:first-letter:text-6xl
    '>
            <MDXRemote {...source} components={mdxComponents} />
        </div>
    )
}

export default RenderMdx
