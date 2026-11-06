import React from 'react'
import Link from 'next/link'
import { cssFunc } from '@/utils'

function Tag({ link = '#', name, ...props }) {
    const label = typeof name === 'string' && name.trim() ? name.trim() : 'General';
    return (
        <Link
            href={link}
            className={cssFunc(
                "inline-block py-2 sm:py-3 px-6 sm:px-10  bg-dark text-light rounded-full capitalize font-semibold border-2 border-solid border-light hover:scale-105 transition-all ease duration-200 text-sm sm:text-base",
                props.className)}
        >
            {label}
        </Link>
    )
}

export default Tag
