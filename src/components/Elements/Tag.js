import React from 'react'
import Link from 'next/link'
import { cssFunc } from '@/utils'

function Tag({ link = '#', name, ...props }) {
    const label = typeof name === 'string' && name.trim() ? name.trim() : 'General';
    return (
        <Link
            href={link}
            className={cssFunc(
                "inline-block rounded-full px-4 py-1.5 bg-ink/70 text-white backdrop-blur-md border border-white/20 font-mono-jb text-xs uppercase tracking-[0.15em] hover:bg-accent hover:border-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright focus-visible:ring-offset-2",
                props.className)}
        >
            {label}
        </Link>
    )
}

export default Tag
