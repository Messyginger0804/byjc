"use client";
import React from 'react';
import Link from 'next/link';
import siteMetadata from '@/utils/metaData';
import Socials from '../Socials/Index';
import { useBaseUrl } from '@/utils/links';

function Footer() {
    const baseUrl = useBaseUrl();

    return (
        <footer className="mt-16 mx-4 sm:mx-10 mb-8 rounded-3xl glass flex flex-col items-center text-dark dark:text-light overflow-hidden shadow-modern">
            <div className="w-full bg-accent/10 dark:bg-accentDark/10 py-10 px-6 flex flex-col items-center">
                <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 font-bold text-sm sm:text-lg uppercase tracking-wider">
                    <Link href={`${baseUrl}/`} className="hover:text-accent dark:hover:text-accentDark transition-colors">Home</Link>
                    <Link href={`${baseUrl}/about`} className="hover:text-accent dark:hover:text-accentDark transition-colors">About</Link>
                    <Link href={`${baseUrl}/blogs`} className="hover:text-accent dark:hover:text-accentDark transition-colors">Blogs</Link>
                    <Link href={`${baseUrl}/portfolio`} className="hover:text-accent dark:hover:text-accentDark transition-colors">Portfolio</Link>
                    <Link href={`${baseUrl}/contact`} className="hover:text-accent dark:hover:text-accentDark transition-colors">Contact</Link>
                </nav>
                <p className="mt-8 px-4 text-center w-full sm:w-3/5 font-medium text-sm md:text-base opacity-80 leading-relaxed">
                    Connecting creativity with code. Follow me on <a target='_blank' className='text-accent dark:text-accentDark underline decoration-2 underline-offset-4 hover:opacity-70 transition-opacity' href={siteMetadata.linkedin}>LinkedIn</a> for the latest updates. 🌚
                </p>

                <div className="mt-8">
                    <Socials />
                </div>
            </div>

            <div className="w-full py-6 px-8 flex flex-col md:flex-row items-center justify-between text-xs md:text-sm font-medium opacity-60 border-t border-dark/10 dark:border-light/10">
                <span className="text-center mb-4 md:mb-0">
                    © {new Date().getFullYear()} Software By JC. All rights reserved. 😜
                </span>
                <div className='text-center'>
                    Crafted with &hearts; by <a href={siteMetadata.portfolio} className='hover:text-accent dark:hover:text-accentDark transition-colors'>JC Ashley </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
