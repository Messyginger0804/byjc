import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import siteMetadata from '@/utils/metaData';
import { Reveal } from '@/components/Motion';
import BackToTop from './BackToTop';
import LocalTime from './LocalTime';

// The footer is always a dark ink panel (both themes), so colours here are explicit rather than `dark:` variants.
const linkClass =
    'inline-block rounded-sm py-1 text-[0.95rem] text-white/80 transition-colors hover:text-white hover:underline decoration-[#6b9bff] decoration-2 underline-offset-4';

const SERVICES = ['Landing pages', 'Business apps', 'E-commerce', 'Backends'];

const COLUMNS = [
    {
        title: 'Explore',
        links: [
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
            { label: 'Blog', href: '/blogs' },
            { label: 'Portfolio', href: '/portfolio' },
            { label: 'Jokes', href: '/jokes' },
            { label: 'Resume', href: '/resume' },
        ],
    },
    {
        title: 'Writing',
        links: [
            { label: 'All posts', href: '/blogs' },
            { label: 'RSS feed', href: '/feed.xml', plain: true },
            { label: 'Privacy policy', href: '/privacy-policy' },
        ],
    },
    {
        title: 'Connect',
        links: [
            { label: 'Email', href: `mailto:${siteMetadata.email}`, plain: true },
            { label: 'LinkedIn', href: siteMetadata.linkedin, external: true },
            { label: 'GitHub', href: siteMetadata.github, external: true },
            { label: 'Discord', href: siteMetadata.discord, external: true },
        ],
    },
];

function FooterLink({ label, href, external, plain }) {
    if (external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {label} <span aria-hidden="true" className="text-white/50">&#8599;</span>
                <span className="sr-only"> (opens in a new tab)</span>
            </a>
        );
    }
    if (plain) {
        return <a href={href} className={linkClass}>{label}</a>;
    }
    return <Link href={href} className={linkClass}>{label}</Link>;
}

export default function Footer() {
    return (
        <footer className="footer-dark relative isolate mx-4 mb-24 mt-24 overflow-hidden rounded-[2rem] border border-white/10 bg-ink text-white shadow-modern sm:mx-8">
            {/* Aurora wash + top hairline (decorative) */}
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
                <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full bg-[#3568bd]/35 blur-[110px]" />
                <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-[#8b5cf6]/25 blur-[110px]" />
                <div className="absolute -bottom-40 left-1/3 h-80 w-[28rem] rounded-full bg-[#ff7a59]/10 blur-[120px]" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-signal opacity-80" aria-hidden="true" />

            {/* Sign-off: CSS reveal only (can be the LCP element on short pages) */}
            <div className="reveal-up px-6 pb-6 pt-14 sm:px-12 sm:pt-20">
                <p className="eyebrow mb-5 !text-[#a9afbd]">Thanks for stopping by</p>
                <p className="display-xl text-gradient footer-wordmark gradient-flow max-w-full pb-2">
                    Software <span className="block sm:inline">By JC.</span>
                </p>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
                    I write what I learn, build what clients need, and keep a few bad jokes on hand. If anything here
                    helped you, or you just want to talk shop, I&apos;d love to hear from you.
                </p>
            </div>

            <div className="grid gap-12 px-6 pb-12 pt-6 sm:px-12 lg:grid-cols-12 lg:gap-10">
                {/* DFWSC feature card */}
                <Reveal className="lg:col-span-5">
                    <div className="group relative h-full">
                        <div
                            className="pointer-events-none absolute -inset-px rounded-3xl bg-signal opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40 group-focus-within:opacity-40 motion-reduce:transition-none"
                            aria-hidden="true"
                        />
                        <div className="gradient-border relative flex h-full flex-col rounded-3xl bg-white/[0.05] p-6 backdrop-blur-xl sm:p-8">
                            <div className="flex items-center gap-4">
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5">
                                    <Image src="/assets/brands/dfwsc-logo.svg" alt="" width={48} height={37} className="h-auto w-full" />
                                </span>
                                <div>
                                    <p className="eyebrow !text-[#a9afbd]">The business side</p>
                                    <h2 className="font-display text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
                                        DFW Software Consulting
                                    </h2>
                                </div>
                            </div>
                            <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg">
                                Need a site, app, or backend built? That&apos;s what DFW Software Consulting does. I
                                founded it to ship reliable software for small businesses and teams.
                            </p>
                            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Services">
                                {SERVICES.map((s) => (
                                    <li
                                        key={s}
                                        className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 font-mono-jb text-xs text-white/85"
                                    >
                                        {s}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8">
                                <a
                                    href={siteMetadata.company}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full bg-signal-cta px-6 py-3 font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] motion-reduce:transform-none"
                                >
                                    Visit DFWSC <span aria-hidden="true">&#8599;</span>
                                    <span className="sr-only"> (opens in a new tab)</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Link columns */}
                <Reveal delay={0.1} className="lg:col-span-7">
                    <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
                        {COLUMNS.map((col, i) => (
                            <div key={col.title} className={i === 2 ? 'col-span-2 sm:col-span-1' : ''}>
                                <h2 className="eyebrow mb-4 !text-[#a9afbd]">{col.title}</h2>
                                <ul className="space-y-1.5">
                                    {col.links.map((l) => (
                                        <li key={l.label}>
                                            <FooterLink {...l} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </Reveal>
            </div>

            <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 px-6 py-6 text-sm text-[#a9afbd] sm:px-12 md:flex-row md:items-center">
                <p>
                    &copy; {new Date().getFullYear()} JC Ashley. <LocalTime className="ml-1 whitespace-nowrap" />
                </p>
                <p>Built with Next.js, Three.js &amp; Motion</p>
                <BackToTop className="rounded-full border border-white/20 px-4 py-2 font-medium text-white transition-colors hover:border-white/50 hover:bg-white/10" />
            </div>
        </footer>
    );
}
