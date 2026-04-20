'use client'

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { renderLinkedTechText } from '../../data/utilities';

export function ProfessionalCard({ job }) {
    const maxDescLength = 150;

    return (
        <div className='text-center p-8 rounded-3xl w-[300px] h-[450px] my-6 max-w-sm relative glass 
         shadow-modern hover:shadow-modern-lg text-dark dark:text-light border border-dark/10 dark:border-light/10 
         hover:-translate-y-2 transition-all duration-500 group flex flex-col'>

            <h3 className='text-xl font-bold text-accent dark:text-accentDark mb-6 tracking-tight'>{job.title}</h3>

            <div className='flex flex-col flex-1'>
                <div className='flex justify-center h-[120px] mb-4'>
                    <Link target='_blank' href={job.link} className="relative group-hover:scale-110 transition-transform duration-500">
                        <div className="absolute inset-0 bg-accent/20 dark:bg-accentDark/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Image
                            className='fit object-center rounded-2xl relative z-10 shadow-sm'
                            src={job.image}
                            width={110}
                            height={110}
                            alt={`${job.title} logo`}
                            sizes="110px"
                        />
                    </Link>
                </div>

                {/* Description container */}
                <div className='flex-1 mb-6'>
                    <h4 className='text-lg font-bold mb-2'>{job.descTitle}</h4>
                    <p className='text-sm opacity-80 leading-relaxed text-balance'>{renderLinkedTechText(job.description, maxDescLength)}</p>
                </div>

                {/* Contact Info */}
                <div className="mt-auto pt-4 border-t border-dark/5 dark:border-light/5">
                    {job.client && <p className='text-xs font-bold mb-1'><span className='opacity-60'>Client:</span> {job.client}</p>}
                    {job.phoneNumber && (
                        <a target='_blank' href={`tel:${job.phoneNumber}`} className='text-xs font-bold text-accent dark:text-accentDark hover:underline'>{job.phoneNumber}</a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfessionalCard;
