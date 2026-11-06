import Link from 'next/link'
import React from 'react'
import profileImg from '@/public/profile.png'
import Image from 'next/image'

const Logo = ({ baseUrl = '' }) => {
    return (
        <Link href={`${baseUrl}/`} className='group/logo flex items-center gap-3 rounded-full text-dark dark:text-light'>
            <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full bg-signal p-[2px] transition-all duration-500 group-data-[compact=true]/header:h-9 group-data-[compact=true]/header:w-9 md:h-12 md:w-12">
                <Image
                    src={profileImg}
                    alt='JC'
                    className='h-full w-full rounded-full bg-paper object-cover dark:bg-ink'
                    sizes='48px'
                    priority
                />
            </span>
            <span className='font-display text-lg font-semibold tracking-tight md:text-xl'>
                Software By <span className="text-gradient">JC</span>
            </span>
        </Link>
    )
}

export default Logo
