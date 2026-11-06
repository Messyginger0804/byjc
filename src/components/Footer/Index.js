import React from 'react';
import Link from 'next/link';
import siteMetadata from '@/utils/metaData';
import Socials from '../Socials/Index';

const linkClass =
    'inline-block rounded-sm text-dark/80 transition-colors hover:text-accent dark:text-white/80 dark:hover:text-accent-bright';

export default function Footer() {
    const baseUrl = siteMetadata.siteUrl;
    const explore = [
        { label: 'Home', path: '/' },
        { label: 'About', path: '/about' },
        { label: 'Blogs', path: '/blogs' },
        { label: 'Portfolio', path: '/portfolio' },
        { label: 'Contact', path: '/contact' },
    ];

    return (
        <footer className="relative mx-4 mb-24 mt-24 overflow-hidden rounded-[2rem] glass shadow-modern sm:mx-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-signal opacity-70" aria-hidden="true" />

            <div className="reveal-up px-6 pb-4 pt-14 sm:px-12 sm:pt-20">
                <p className="eyebrow mb-4">Let&apos;s build something</p>
                <p className="display-xl text-gradient footer-wordmark gradient-flow max-w-full break-words pb-2">
                    Software
                    <br />
                    By JC.
                </p>
            </div>

            <div className="grid gap-10 px-6 py-10 sm:px-12 md:grid-cols-[1.4fr_1fr_1fr]">
                <p className="max-w-md text-base leading-relaxed text-muted">
                    Connecting creativity with code. Follow me on{' '}
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline decoration-2 underline-offset-4 transition-opacity hover:opacity-70 dark:text-accent-bright"
                        href={siteMetadata.linkedin}
                    >
                        LinkedIn
                    </a>{' '}
                    for the latest updates. 🌚
                </p>

                <nav aria-label="Footer">
                    <p className="eyebrow mb-4">Explore</p>
                    <ul className="space-y-2.5 font-medium">
                        {explore.map(({ label, path }) => (
                            <li key={path}>
                                <Link href={`${baseUrl}${path}`} className={linkClass}>{label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div>
                    <p className="eyebrow mb-4">Elsewhere</p>
                    <Socials className="-ml-2" />
                </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-dark/10 px-6 py-6 text-xs font-medium text-muted dark:border-white/10 sm:px-12 md:flex-row md:text-sm">
                <span className="text-center">
                    © {new Date().getFullYear()} Software By JC. All rights reserved. 😜
                </span>
                <div className="text-center">
                    Crafted with &hearts; by <a href={siteMetadata.portfolio} className="underline-offset-4 transition-colors hover:text-accent hover:underline dark:hover:text-accent-bright">JC Ashley</a>
                </div>
            </div>
        </footer>
    );
}
