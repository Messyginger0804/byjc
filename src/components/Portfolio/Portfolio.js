'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { projects } from '../../data/projects';
import { contractedJobs } from '../../data/jobs';

const ProfSlideShow = dynamic(() => import('./ProfSlideShow'), { ssr: false });
const ProjectSlideShow = dynamic(() => import('./ProjectSlideShow'), { ssr: false });

function Portfolio() {
    return (
        <div className="container-page py-16 md:py-24">
            <p className="eyebrow text-gradient">Selected work</p>
            <h2 className="display-lg mt-3 text-balance">Work &amp; projects</h2>
            <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Professional Work Slideshow */}
                <div className="min-h-[40rem]">
                    <h3 className="mb-6 text-center text-2xl font-bold text-accent dark:text-accent-bright">
                        Professional Work
                    </h3>
                    <ProfSlideShow contractedJobs={contractedJobs} />
                </div>

                {/* Projects Slideshow */}
                <div className="min-h-[40rem]">
                    <h3 className="mb-6 text-center text-2xl font-bold text-accent dark:text-accent-bright">
                        Projects
                    </h3>
                    <ProjectSlideShow projects={projects} />
                </div>
            </div>
        </div>
    );
}

export default Portfolio;
