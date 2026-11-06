import React from 'react'
import MdxImageWithRetry from '@/components/UI/MdxImageWithRetry'
import { renderSafeMarkdown } from '@/lib/safeMarkdown'

// Must match images.remotePatterns in next.config.js; next/image throws for other hosts.
const ALLOWED_IMAGE_HOSTS = ['framerusercontent.com'];

function isAllowedImageSrc(src) {
    if (typeof src !== 'string' || !/^https?:/i.test(src.trim())) return true;
    try {
        return ALLOWED_IMAGE_HOSTS.includes(new URL(src.trim()).hostname);
    } catch {
        return false;
    }
}

function MarkdownImage({ node, src, ...props }) {
    void node;
    return (
        <MdxImageWithRetry
            {...props}
            src={isAllowedImageSrc(src) ? src : undefined}
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
        <div className='article-prose col-span-12 lg:col-span-8 prose prose-lg dark:prose-invert max-w-[68ch] w-full'>
            {markdown}
        </div>
    )
}

export default RenderMdx
