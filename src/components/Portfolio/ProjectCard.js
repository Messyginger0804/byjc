import React from 'react';
import Image from 'next/image';
import { button, heading, truncateText } from '../../data/utilities';

export function ProjectCard({ proj }) {
    const maxDescLength = 150;

    return (
        <div className='text-center p-8 rounded-3xl w-[300px] h-[450px] my-6 max-w-sm relative glass 
         shadow-modern hover:shadow-modern-lg text-dark dark:text-light border border-dark/10 dark:border-light/10 
         hover:-translate-y-2 transition-all duration-500 group flex flex-col'>

            <h3 className='text-xl font-bold text-accent dark:text-accentDark mb-6 tracking-tight'>{proj.title}</h3>

            <div className='flex flex-col flex-1'>
                <div className='flex justify-center h-[120px] mb-4 relative'>
                    <div className="relative group-hover:scale-110 transition-transform duration-500">
                        <div className="absolute inset-0 bg-accent/20 dark:bg-accentDark/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Image
                            className='fit object-center rounded-2xl relative z-10 shadow-sm'
                            src={proj.image}
                            width={110}
                            height={110}
                            alt={proj.title}
                        />
                    </div>
                    <div className="absolute -top-2 -right-2 z-20">
                        {heading(proj.inProgress)}
                    </div>
                </div>

                {/* Description container */}
                <div className='flex-1 mb-6'>
                    <h4 className='text-lg font-bold mb-2'>{proj.descTitle}</h4>
                    <p className='text-sm opacity-80 leading-relaxed text-balance'>{truncateText(proj.desc, maxDescLength)}</p>
                </div>

                {/* Buttons container */}
                <div className='flex justify-evenly mt-auto pt-6 border-t border-dark/5 dark:border-light/5'>
                    <a href={proj.rep} className='px-4 py-2 text-sm font-bold rounded-xl border border-dark/20 dark:border-light/20 hover:bg-dark hover:text-light dark:hover:bg-light dark:hover:text-dark transition-all duration-300 shadow-sm' target='_blank'>
                        GitHub
                    </a>
                    {button(proj.isPublished, proj.live)}
                </div>
            </div>
        </div>
    );
}

export default ProjectCard;
