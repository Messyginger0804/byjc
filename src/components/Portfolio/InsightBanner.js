'use client'

import React, { useState } from 'react'

/**
 * Infinite marquee of one-liners; pure CSS animation (see .marquee-* in globals.css).
 * Pauses on hover/focus, has an explicit pause button, and is static under prefers-reduced-motion. The list is duplicated for a
 * seamless -50% loop; the duplicate is aria-hidden.
 */
function InsightBanner({ insights }) {
    const [paused, setPaused] = useState(false);
    if (!insights?.length) return null;

    const row = (hidden) => (
        <ul className="flex shrink-0 items-center motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center" aria-hidden={hidden || undefined}>
            {insights.map((text, index) => (
                <li key={index} className="flex items-center motion-reduce:whitespace-normal">
                    <span className="px-5">{text}</span>
                    <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rotate-45 rounded-[2px] bg-signal" />
                </li>
            ))}
        </ul>
    );

    return (
        <div className="relative">
            <div
                role="region"
                aria-label="Highlights"
                data-paused={paused || undefined}
                className="marquee-mask relative w-full overflow-hidden whitespace-nowrap border-y border-dark/10 py-3 font-mono-jb text-xs uppercase tracking-[0.18em] text-muted dark:border-white/10 sm:text-sm"
            >
                <div className="marquee-track flex motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:[&>ul:last-child]:hidden">
                    {row(false)}
                    {row(true)}
                </div>
            </div>
            <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                className="absolute right-2 top-full z-10 mt-1 rounded-full glass px-3 py-1 font-mono-jb text-[0.65rem] uppercase tracking-[0.14em] text-dark dark:text-white motion-reduce:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright"
            >
                {paused ? 'Play highlights' : 'Pause highlights'}
            </button>
        </div>
    )
}

export default InsightBanner
