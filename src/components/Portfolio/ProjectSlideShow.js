'use client';

import React from 'react';
import SlideShow from './SlideShow';
import ProjectCard from './ProjectCard';

function ProjectSlideShow({ projects }) {
    return (
        <SlideShow
            label="Projects slideshow"
            items={projects}
            renderItem={(proj) => <ProjectCard key={proj.title} proj={proj} />}
        />
    );
}

export default ProjectSlideShow;
