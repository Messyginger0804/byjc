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

// Legacy MDX posts used <Image src="..." alt="..." />; convert to Markdown images
// (JSX stays disabled, so the sanitizer never sees raw HTML).
export function normalizeLegacyImages(source) {
    if (typeof source !== 'string') return source;
    return source.replace(/<Image\b([^>]*?)\/?>/g, (match, attrs) => {
        const attr = (name) => attrs.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{\\s*["']([^"']*)["']\\s*\\})`));
        const pick = (m) => (m ? (m[1] ?? m[2] ?? m[3] ?? '') : '');
        const src = pick(attr('src')).trim();
        if (!src) return match;
        const alt = pick(attr('alt')).replace(/[[\]\\]/g, '\\$&');
        const url = src.replace(/[\s()]/g, (c) => encodeURIComponent(c));
        return `![${alt}](${url})`;
    });
}

const markdownComponents = {
    img: MarkdownImage,
}

async function RenderMdx({ source }) {
    const markdown = await renderSafeMarkdown(normalizeLegacyImages(source), markdownComponents);

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
            {markdown}
        </div>
    )
}

export default RenderMdx
