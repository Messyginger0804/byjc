import React from 'react';
import SlideShow from './SlideShow';
import ProjectCard from './ProjectCard';

export function ProjectSlideShow({ projects }) {
    return (
        <SlideShow
            items={projects}
            renderItem={(proj) => <ProjectCard key={proj.title} proj={proj} />}
        />
    );
}

export default ProjectSlideShow;
