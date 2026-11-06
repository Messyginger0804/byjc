import React from 'react'

/**
 * Infinite marquee of one-liners. Server component; pure CSS (see .marquee-* in globals.css).
 * Pauses on hover/focus and is static under prefers-reduced-motion. The list is duplicated for a
 * seamless -50% loop; the duplicate is aria-hidden.
 */
function InsightBanner({ insights }) {
    if (!insights?.length) return null;

    const row = (hidden) => (
        <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
            {insights.map((text, index) => (
                <li key={index} className="flex items-center">
                    <span className="px-5">{text}</span>
                    <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rotate-45 rounded-[2px] bg-signal" />
                </li>
            ))}
        </ul>
    );

    return (
        <div
            role="region"
            aria-label="Highlights"
            className="marquee-mask relative w-full overflow-hidden whitespace-nowrap border-y border-dark/10 py-3 font-mono-jb text-xs uppercase tracking-[0.18em] text-muted dark:border-white/10 sm:text-sm"
        >
            <div className="marquee-track flex motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:[&>ul:last-child]:hidden">
                {row(false)}
                {row(true)}
            </div>
        </div>
    )
}

export default InsightBanner
