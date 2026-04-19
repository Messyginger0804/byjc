"use client"
import React, { useState } from 'react'
import Logo from './Logo'
import Link from 'next/link'
import { MdLightMode, MdDarkMode, MdCorporateFare } from 'react-icons/md';
import Linkedin from './svgs/LinkedIn';
import GitHub from './svgs/GitHub';
import siteMetadata from '@/utils/metaData';
import { useThemeSwitch } from '../Hooks/useThemeSwitch';
import { cssFunc } from '@/utils';
import Socials from '../Socials/Index';


const Header = () => {

    const [mode, setMode] = useThemeSwitch();
    const [click, setClick] = useState(false);

    const toggle = () => {
        setClick(!click)
    }

    return (
        <header className="w-full p-4  px-5 sm:px-10 flex items-center justify-between">
            <Logo />

            <button className="inline-block sm:hidden z-50" onClick={toggle} aria-label="Hamburger Menu">
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

            <nav className={`w-max py-3 px-6 sm:px-8 border border-solid border-dark/20 dark:border-light/20 rounded-full font-medium capitalize items-center flex sm:hidden
                fixed right-1/2 translate-x-1/2 glass z-50 transition-all ease duration-300 ${click ? "top-4" : "-top-20"}`}
            >
                <Link href="/" className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">Home</Link>
                <Link href="/about" className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">About</Link>
                <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/blogs`} className="mr-2 hover:text-accent dark:hover:text-accentDark transition-colors">Blog</Link>
                <Link href="/portfolio" className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">Portfolio</Link>
                <button onClick={() => setMode(mode === "light" ? "dark" : "light")}
                    className={cssFunc("w-6 h-6 ease ml-2 flex items-center justify-center rounded-full p-1 shadow-sm", mode === "light" ? "bg-dark text-light" :
                        "bg-light text-dark")}
                    aria-label="theme-switcher"
                >
                    {
                        mode === "light" ? <MdDarkMode className={"fill-light"} /> : <MdLightMode className={"fill-dark"} />
                    }
                </button>
            </nav>

            <nav className="w-max py-3 px-8 border border-solid border-dark/20 dark:border-light/20 rounded-full font-medium capitalize items-center hidden sm:flex
                fixed top-6 right-1/2 translate-x-1/2 glass z-50 shadow-modern">
                <Link href="/" className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">Home</Link>
                <Link href="/about" className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">About</Link>
                <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/blogs`} className="mr-2 hover:text-accent dark:hover:text-accentDark transition-colors">Blog</Link>
                <Link href="/portfolio" className="mx-2 hover:text-accent dark:hover:text-accentDark transition-colors">Portfolio</Link>
                <button onClick={() => setMode(mode === "light" ? "dark" : "light")}
                    className={cssFunc("w-6 h-6 ease ml-2 flex items-center justify-center rounded-full p-1 shadow-sm hover:scale-110 transition-transform", mode === "light" ? "bg-dark text-light" :
                        "bg-light text-dark")}
                    aria-label="theme-switcher"
                >
                    {
                        mode === "light" ? <MdDarkMode className={"fill-light"} /> : <MdLightMode className={"fill-dark"} />
                    }
                </button>
            </nav>

        <Socials/>
        </header>
    )
}

export default Header;
