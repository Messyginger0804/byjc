import React from 'react'
import Logo from './Logo'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle';
import Socials from '../Socials/Index';
import MobileNav from './MobileNav';
import { getBaseUrl } from '@/utils/baseUrl';

export default async function Header() {
    const baseUrl = await getBaseUrl();

    return (
        <header className="w-full p-4 px-5 sm:px-10 flex items-center justify-between">
            <Logo baseUrl={baseUrl} />

            <nav className="w-max py-3 px-8 border border-solid border-dark/20 dark:border-light/20 rounded-full font-medium capitalize items-center hidden sm:flex
                fixed top-6 right-1/2 translate-x-1/2 glass z-50 shadow-modern">
                <Link href={`${baseUrl}/`} className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">Home</Link>
                <Link href={`${baseUrl}/about`} className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">About</Link>
                <Link href={`${baseUrl}/blogs`} className="mr-2 hover:text-accent dark:hover:text-accentDark transition-colors">Blog</Link>
                <Link href={`${baseUrl}/portfolio`} className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">Portfolio</Link>
                <ThemeToggle />
            </nav>

            <MobileNav baseUrl={baseUrl} />
            <Socials/>
        </header>
    )
}
