'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function MobileNav({ baseUrl = '' }) {
    const [click, setClick] = useState(false);

    const closeMenu = () => setClick(false);
    const toggle = () => setClick((isOpen) => !isOpen);

    return (
        <>
            <button 
                type="button"
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

            {click && (
                <nav id="mobile-nav" className="w-max py-3 px-6 sm:px-8 border border-solid border-dark/20 dark:border-light/20 rounded-full font-medium capitalize items-center flex sm:hidden fixed top-4 right-1/2 translate-x-1/2 glass z-50">
                    <Link onClick={closeMenu} href={`${baseUrl}/`} className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">Home</Link>
                    <Link onClick={closeMenu} href={`${baseUrl}/about`} className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">About</Link>
                    <Link onClick={closeMenu} href={`${baseUrl}/blogs`} className="mr-2 hover:text-accent dark:hover:text-accentDark transition-colors">Blog</Link>
                    <Link onClick={closeMenu} href={`${baseUrl}/portfolio`} className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">Portfolio</Link>
                    <ThemeToggle />
                </nav>
            )}
        </>
    );
}
