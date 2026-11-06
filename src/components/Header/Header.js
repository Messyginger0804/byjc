import React from 'react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle';
import Socials from '../Socials/Index';
import MobileNav from './MobileNav';
import NavLinks from './NavLinks';
import HeaderShell from './HeaderShell';
import siteMetadata from '@/utils/metaData';

export default function Header() {
    const baseUrl = siteMetadata.siteUrl;
    return (
        <HeaderShell>
            <div className="pointer-events-auto justify-self-start">
                <Logo baseUrl={baseUrl} />
            </div>

            <nav
                aria-label="Primary"
                className="pointer-events-auto hidden items-center gap-1 rounded-full glass p-1.5 shadow-modern md:flex"
            >
                <NavLinks baseUrl={baseUrl} />
                <span aria-hidden="true" className="mx-1 h-5 w-px bg-dark/10 dark:bg-white/15" />
                <ThemeToggle />
            </nav>

            <div className="pointer-events-auto flex items-center justify-self-end">
                <div className="hidden md:block">
                    <Socials />
                </div>
                <MobileNav baseUrl={baseUrl} />
            </div>
        </HeaderShell>
    )
}
