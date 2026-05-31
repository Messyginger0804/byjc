'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function MobileNav({ baseUrl }) {
    const [click, setClick] = useState(false);

    const toggle = () => setClick(!click);

    return (
        <>
            <button 
                className="inline-block sm:hidden z-50" 
                onClick={toggle} 
                aria-label="Hamburger Menu"
                aria-expanded={click}
                aria-controls="mobile-nav"
            >
                <div className="w-6 cursor-pointer transition-all ease duration-300">
                    <div className="relative">
                        <span className={`absolute top-0 inline-block w-full h-0.5 bg-dark dark:bg-light rounded transition-all ease duration-200 ${click ? "[transform:rotate(-45deg)_translateY(0)]" : "[transform:rotate(0deg)_translateY(6px)]"}`}
                        >&nbsp;</span>
                        <span className={`absolute top-0 inline-block w-full h-0.5 bg-dark dark:bg-light rounded transition-all ease duration-200 ${click ? "opacity-0" : "opacity-100"}`}
                        >&nbsp;</span>
                        <span className={`absolute top-0 inline-block w-full h-0.5 bg-dark dark:bg-light rounded transition-all ease duration-200 ${click ? "[transform:rotate(45deg)_translateY(0)]" : "[transform:rotate(0deg)_translateY(-6px)]"}`}
                        >&nbsp;</span>
                    </div>
                </div>
            </button>

            <nav id="mobile-nav" className={`w-max py-3 px-6 sm:px-8 border border-solid border-dark/20 dark:border-light/20 rounded-full font-medium capitalize items-center flex sm:hidden
                fixed right-1/2 translate-x-1/2 glass z-50 transition-all ease duration-300 ${click ? "top-4" : "-top-20"}`}
            >
                <Link href={`${baseUrl}/`} className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">Home</Link>
                <Link href={`${baseUrl}/about`} className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">About</Link>
                <Link href={`${baseUrl}/blogs`} className="mr-2 hover:text-accent dark:hover:text-accentDark transition-colors">Blog</Link>
                <Link href={`${baseUrl}/portfolio`} className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">Portfolio</Link>
                <ThemeToggle />
            </nav>
        </>
    );
}
