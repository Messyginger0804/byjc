import siteMetadata from '@/utils/metaData';
import React from 'react';
import Linkedin from '../Header/svgs/LinkedIn';
import GitHub from '../Header/svgs/GitHub';
import { SiDiscord } from 'react-icons/si';

const linkClass =
    'relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ' +
    'hover:-translate-y-0.5 hover:bg-dark/5 hover:shadow-[0_0_24px_-2px_rgba(107,155,255,0.55)] dark:hover:bg-white/10';

/**
 * Social icon links (LinkedIn, GitHub, Discord) with hover glow and a CSS-only tooltip.
 * Always renders; hide it responsively from the parent (e.g. `hidden sm:block`).
 * @param {{ className?: string }} props
 */
const Socials = ({ className = '' }) => {
    const items = [
        { name: 'LinkedIn', href: siteMetadata.linkedin, icon: <Linkedin className="!w-5" /> },
        { name: 'GitHub', href: siteMetadata.github, icon: <GitHub className="!w-5 dark:fill-light" /> },
        { name: 'Discord', href: siteMetadata.discord, icon: <SiDiscord size={20} className="fill-[#5865F2]" /> },
    ];

    return (
        <ul className={`flex items-center gap-1 ${className}`}>
            {items.map(({ name, href, icon }) => (
                <li key={name} className="group/social relative">
                    <a className={linkClass} target="_blank" rel="noopener noreferrer" href={href} aria-label={name}>
                        {icon}
                    </a>
                    <span
                        aria-hidden="true"
                        className="eyebrow pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-ink px-2 py-1 !text-[10px] !text-white opacity-0 transition-all duration-200 group-hover/social:translate-y-0 group-hover/social:opacity-100"
                    >
                        {name}
                    </span>
                </li>
            ))}
        </ul>
    );
};

export default Socials;
