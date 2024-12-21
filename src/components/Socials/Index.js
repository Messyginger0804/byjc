import siteMetadata from '@/utils/metaData';
import React from 'react';
import Linkedin from '../Header/svgs/LinkedIn';
import GitHub from '../Header/svgs/GitHub';
import { MdCorporateFare } from 'react-icons/md';
import { SiDiscord } from 'react-icons/si';

const Socials = () => {
    return (
        <>
            <div className="hidden sm:flex items-center">
                <div className="relative group">
                    <a className='w-6 h-6 mr-4 inline-block' target='_blank' href={siteMetadata.linkedin}>
                        <Linkedin className="hover:scale-125 transition-all ease duration-200" />
                    </a>
                    <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 bg-black text-white text-xs font-medium py-1 px-2 rounded opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out pointer-events-none">
                        LinkedIn
                    </span>
                </div>

                <div className="relative group">
                    <a className="inline-block w-6 h-6 mr-4" target='_blank' href={siteMetadata.github}>
                        <GitHub className="hover:scale-125 transition-all ease duration-200 dark:fill-light" />
                    </a>
                    <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 bg-black text-white text-xs font-medium py-1 px-2 rounded opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out pointer-events-none">
                        GitHub
                    </span>
                </div>

                <div className="relative group">
                    <a className="inline-block w-6 h-6 mr-4" target='_blank' href={siteMetadata.discord}>
                        <SiDiscord size={28} className="hover:scale-125 transition-all ease duration-200 fill-blue-700" />
                    </a>
                    <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 bg-black text-white text-xs font-medium py-1 px-2 rounded opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out pointer-events-none">
                        Discord
                    </span>
                </div>
            </div>
        </>
    )
}

export default Socials;
