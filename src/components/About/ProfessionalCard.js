'use client'

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export function ProfessionalCard({ job }) {
    return (
        <div className='text-center p-6 rounded-xl w-[280px] h-[390px] my-10 max-w-sm relative shadow-accent dark:shadow-accentDark
            hover:shadow-xl text-black bg-accent/60 dark:bg-accentDark dark:border-light dark:text-black border-2 border-black hover:scale-105 duration-200'>
            <h3 className='text-lg font-medium dark:text-black pt-8 pb-2'>{job.title}</h3>
            <p><span className='px-2'>client:</span>{job.client}</p>
            <a href={`tel:${job.phoneNumber}`} className='hover:underline'>{job.phoneNumber}</a>
            <Link href={job.link}>
                <div className='flex justify-center'>
                    <Image
                        className='flex justify-center fit object-center rounded h-28 w-28 rounded-xl'
                        src={job.image}
                        alt={`${job.title} 'logo'`}
                    />
                </div>
            </Link>
            <h4 className='py-4 text-black'>{job.description}</h4>
        </div>
    );
}

export default ProfessionalCard;
