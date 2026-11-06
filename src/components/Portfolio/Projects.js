import React from 'react';
import ProjectCard from './ProjectCard';

function Projects({ projects }) {
    return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((proj) => (
                <ProjectCard key={proj.title} proj={proj} />
            ))}
        </div>
    );
}

export default Projects;
