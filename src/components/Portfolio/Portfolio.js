'use client';

import React from 'react';
import ProfSlideShow from './ProfSlideShow';
import ProjectSlideShow from './ProjectSlideShow';
import { projects } from '../../data/projects';
import { contractedJobs } from '../../data/jobs';

function Portfolio() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 p-4">
            {/* Professional Work Slideshow */}
            <div className="p-4">
                <h3 className="text-center text-3xl py-1 text-accent dark:text-accentDark">
                    Professional Work
                </h3>
                <ProfSlideShow className='bg-blue-200' contractedJobs={contractedJobs} />
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
