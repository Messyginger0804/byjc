'use client'

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { truncateText } from '../../data/utilities';

export function ProfessionalCard({ job }) {
    const maxDescLength = 150;

    return (
        <div className='text-center p-6 rounded-xl w-[280px] h-[400px] my-6 max-w-sm relative shadow-accent dark:shadow-accentDark
         hover:shadow-xl text-black bg-accent/90 dark:bg-accentDark dark:border-light dark:text-black border-2 border-black hover:scale-105 duration-200'>

            <h3 className='text-lg font-medium dark:text-black absolute top-4 left-0 right-0'>{job.title}</h3>

            <div className='flex flex-col justify-between h-full pt-12'>
                <div className='flex justify-center h-[100px]'>
                    <Link target='_blank' href={job.link}>
                        <Image
                            className='fit object-center rounded'
                            src={job.image}
                            width={100}
                            height={100}
                            alt={`${job.title} logo`}
                        />
                    </Link>
                </div>

                {/* Description container */}
                <div className='h-[150px] my-2 '>
                    <h3 className='text-lg font-medium pt-1 pb-1'>{job.descTitle}</h3>
                    <p className='text-xs'>{truncateText(job.description, maxDescLength)}</p>
                </div>

                {/* Contact Info */}
                {job.client && <p className='text-xs'><span className='px-2'>Client:</span>{job.client}</p>}
                {job.phoneNumber && (
                    <a target='_blank' href={`tel:${job.phoneNumber}`} className='text-xs hover:underline'>{job.phoneNumber}</a>
                )}
            </div>
        </div>
    );
}

export default ProfessionalCard;
