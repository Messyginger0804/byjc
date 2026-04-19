'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { projects } from '../../data/projects';
import { contractedJobs } from '../../data/jobs';
import backgroundImage from '../../../public/assets/mes/ridingKeyboard.png';

const ProfSlideShow = dynamic(() => import('./ProfSlideShow'), { ssr: false });
const ProjectSlideShow = dynamic(() => import('./ProjectSlideShow'), { ssr: false });

function Portfolio() {
    return (
        <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-0 p-4 bg-[image:var(--bg)] bg-[length:500px] bg-center bg-no-repeat"
            style={{ '--bg': `url(${backgroundImage.src})` }}
        >
            {/* Professional Work Slideshow */}
            <div className="p-4">
                <h3 className="text-center text-3xl py-1 text-accent dark:text-accentDark">
                    Professional Work
                </h3>
                <ProfSlideShow contractedJobs={contractedJobs} />
            </div>

            {/* Projects Slideshow */}
            <div className="p-4">
                <h3 className="text-center text-3xl py-1 text-accent dark:text-accentDark">
                    Projects
                </h3>
                <ProjectSlideShow projects={projects} />
            </div>
        </div>
    );
}

export default Portfolio;
