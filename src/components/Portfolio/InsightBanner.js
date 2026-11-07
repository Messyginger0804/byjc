'use client'

import React, { useState } from 'react'

/**
 * Infinite marquee of one-liners on a glass/gradient band; pure CSS animation (see .ticker-* in globals.css).
 * Pauses on hover/focus, has an explicit pause pill inside the band's right edge, and is static under
 * prefers-reduced-motion. The list is duplicated for a seamless -50% loop; the duplicate is aria-hidden.
 */
function InsightBanner({ insights }) {
    const [paused, setPaused] = useState(false);
    if (!insights?.length) return null;

    const row = (hidden) => (
        <ul className="flex shrink-0 items-center motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center" aria-hidden={hidden || undefined}>
            {insights.map((text, index) => (
                <li key={index} className="flex items-center motion-reduce:whitespace-normal">
                    <span className="px-6">{text}</span>
                    <span aria-hidden="true" className="inline-block h-2 w-2 rotate-45 rounded-[2px] bg-signal" />
                </li>
            ))}
        </ul>
    );

    return (
        <div
            role="region"
            aria-label="Highlights"
            data-paused={paused || undefined}
            className="ticker-band relative w-full overflow-hidden whitespace-nowrap border-y border-dark/10 font-display text-base font-bold uppercase leading-[1.5] tracking-[0.06em] text-dark dark:border-white/10 dark:text-[#e8e9ee] sm:text-lg"
        >
            <div className="ticker-mask overflow-hidden py-2 sm:py-2.5">
                <div className="marquee-track flex motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:[&>ul:last-child]:hidden">
                    {row(false)}
                    {row(true)}
                </div>
            </div>
            <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                className="absolute right-2 top-1/2 z-10 inline-flex h-8 -translate-y-1/2 items-center gap-1.5 rounded-full glass px-2.5 font-mono-jb text-[0.65rem] font-medium uppercase tracking-[0.14em] text-dark dark:text-white sm:right-4 sm:px-3.5 motion-reduce:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright"
            >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
                    {paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M3.5 2h3v12h-3zM9.5 2h3v12h-3z" />}
                </svg>
                <span className="sr-only sm:not-sr-only">Pause highlights</span>
            </button>
        </div>
    )
}

export default InsightBanner
