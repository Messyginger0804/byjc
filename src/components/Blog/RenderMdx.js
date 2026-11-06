import React from 'react'
import MdxImageWithRetry from '@/components/UI/MdxImageWithRetry'
import { renderSafeMarkdown } from '@/lib/safeMarkdown'

function MarkdownImage({ node, ...props }) {
    void node;
    return (
        <MdxImageWithRetry
            {...props}
            width={1200}
            height={675}
            sizes="(min-width: 1024px) 66vw, 100vw"
        />
    );
}

const markdownComponents = {
    img: MarkdownImage,
}

async function RenderMdx({ source }) {
    const markdown = await renderSafeMarkdown(source, markdownComponents);

    return (
        <div className='article-prose col-span-12 lg:col-span-8 prose prose-lg dark:prose-invert max-w-[68ch] w-full'>
            {markdown}
        </div>
    )
}

export default RenderMdx
