"use client";
import React from 'react';
import siteMetadata from '@/utils/metaData';
import Socials from '../Socials/Index';

function Footer() {
    return (
        <footer className="mt-6 rounded-2xl bg-accent/90 dark:bg-accentDark/80 m-2 sm:m-10 flex flex-col items-center text-light dark:text-dark">
            <div className="mt-6 font-medium dark:font-bold text-center capitalize text-xs sm:text-lg px-4">
                <a href='/' className="hover:underline">Software By JC</a> |
                <a href='/about' className="hover:underline"> About JC</a> |
                <a href='/blogs' className="hover:underline"> Blogs By JC</a> |
                <a href='/portfolio' className="hover:underline"> Portfolio By JC</a> |
                <a href='/contact' className="hover:underline"> Contact JC</a>
            </div>
            <p className="mt-2 md:mt-5 px-4 text-center w-full sm:w-3/5 font-light dark:font-medium text-xs md:text-sm">
                Please connect with me on <a target='_blank' className='underline hover:underline' href={siteMetadata.linkedin}>LinkedIn</a> for updates on when the next blog post will be published. 🌚
            </p>

            <Socials />
            <div className="w-full mt-6 md:mt-10 relative font-medium border-t border-solid border-light dark:border-dark py-6 px-8 flex flex-col md:flex-row items-center justify-between">
                <span className="text-center">
                    © {new Date().getFullYear()} Software By JC. All rights reserved. 😜
                </span>
                <div className='text-center'>
                    Made with &hearts; by <a href={siteMetadata.portfolio} className='underline hover:underline hover:font-bold'>JC Ashley </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
