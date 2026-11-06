import Image from 'next/image'
import React from 'react'
import profileCharacter from "@/components/Portfolio/assets/justme.png";
import { AiFillGithub, AiFillLinkedin } from 'react-icons/ai';
import { GrContact } from "react-icons/gr";
import siteMetadata from '@/utils/metaData';

const socialClass =
    "grid h-12 w-12 place-items-center rounded-full glass text-2xl text-accent dark:text-accent-bright transition-all duration-300 hover:-translate-y-1 hover:bg-accent hover:text-white dark:hover:bg-accent-bright dark:hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink";

function Avator() {
    return (
        <>
            {/* Animated gradient ring + glow (CSS only) */}
            <div className="relative mx-auto h-72 w-72 md:h-80 md:w-80 lg:h-96 lg:w-96">
                <div aria-hidden="true" className="absolute -inset-6 rounded-full bg-signal opacity-30 blur-3xl motion-safe:animate-pulse" />
                {/* The spinning square's rotated bounds would widen the page; clip them to the ring. */}
                <div aria-hidden="true" className="absolute -inset-[6px] overflow-hidden rounded-full">
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#3568bd,#8b5cf6,#ffdb4d,#ff7a59,#3568bd)] motion-safe:animate-[spin_9s_linear_infinite]" />
                </div>
                <div className="absolute inset-0 overflow-hidden rounded-full bg-paper dark:bg-ink ring-4 ring-paper dark:ring-ink">
                    <Image
                        src={profileCharacter}
                        className="object-cover"
                        alt="Profile Character"
                        priority
                        fill
                        sizes="(min-width: 1024px) 384px, (min-width: 768px) 320px, 288px"
                    />
                </div>
            </div>
            <div className="flex justify-center gap-4 pt-8">
                <a href={siteMetadata.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={socialClass}>
                    <AiFillLinkedin aria-hidden="true" />
                </a>
                <a href={siteMetadata.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={socialClass}>
                    <AiFillGithub aria-hidden="true" />
                </a>
                <a href={siteMetadata.contact} target="_blank" rel="noopener noreferrer" aria-label="Contact" className={socialClass}>
                    <GrContact aria-hidden="true" className="dark:invert" />
                </a>
            </div>
        </>
    )
}

export default Avator
