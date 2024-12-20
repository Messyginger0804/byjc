import React from 'react';
import Image from 'next/image';
import { button, heading, truncateText } from '../../data/utilities';

export function ProjectCard({ proj }) {
    const maxDescLength = 150;

    return (
        <div className='text-center p-6 rounded-xl w-[280px] h-[400px] my-6 max-w-sm relative shadow-accent dark:shadow-accentDark
         hover:shadow-xl text-black bg-accent/60 dark:bg-accentDark dark:border-light dark:text-black border-2 border-black hover:scale-105 duration-200'>

            <h3 className='text-lg font-medium dark:text-black absolute top-4 left-0 right-0'>{proj.title}</h3>

            <div className='flex flex-col justify-between h-full pt-12'>
                <div className='flex justify-center h-[100px]'>
                    <Image
                        className='fit object-center rounded'
                        src={proj.image}
                        width={100}
                        height={100}
                        alt={proj.title}
                    />
                    {heading(proj.inProgress)}
                </div>

                {/* Description container */}
                <div className='h-[150px] my-2'>
                    <h3 className='text-lg font-medium pt-1 pb-1'>{proj.descTitle}</h3>
                    <p className='text-xs'>{truncateText(proj.desc, maxDescLength)}</p>
                </div>

                {/* Buttons container */}
                <div className='flex justify-evenly mt-auto'>
                    <a href={proj.rep} className='hover:bg-sky-400 bg-slate-50 hover:text-white p-2 text-black dark:hover:bg-accentDark dark:bg-black dark:text-accentDark dark:hover:text-black border-2 border-sky-400 hover:dark:border-black cursor-pointer dark:border-white rounded-lg transition duration-200' target='_blank'>
                        GitHub
                    </a>
                    {button(proj.isPublished, proj.live)}
                </div>
            </div>
        </div>
    );
}

export default ProjectCard;
