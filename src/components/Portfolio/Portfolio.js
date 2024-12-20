'use client';

import React from 'react';
import Projects from './Projects';
import Professional from './Professional';
import { projects } from '../../data/projects';
import { contractedJobs } from '../../data/jobs';
import ProfSlideShow from './ProfSlideShow';
import ProjectSlideShow from './ProjectSlideShow';

function Portfolio() {
    return (
        <div>
            <div className='p-4'>
                <h3 className='text-center text-3xl py-1 text-accent dark:text-accentDark'>Professional Work</h3>
                <div className='hidden md:block'>
                    <Professional contractedJobs={contractedJobs} />
                </div>
                <div className='block md:hidden'>
                    <ProfSlideShow contractedJobs={contractedJobs} />
                </div>
            </div>
            <div className='p-4'>
                <h3 className='text-center text-3xl py-1 text-accent dark:text-accentDark'>Projects</h3>
                <div className='hidden md:block'>
                    <Projects projects={projects} />
                </div>
                <div className='block md:hidden'>
                    <ProjectSlideShow projects={projects} />
                </div>
            </div>
        </div>
    );
}

export default Portfolio;
