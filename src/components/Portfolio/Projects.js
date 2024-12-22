import React from 'react';
import ProjectCard from './ProjectCard';

function Projects({ projects }) {
    return (
        <div className='relative z-10'>
            <div className='flex justify-center flex-wrap lg:flex md:mx-12 gap-5'>
                {projects?.map((proj) => (
                    // eslint-disable-next-line react/jsx-key
                    <div className='flex justify-center gap-3'>
                        <ProjectCard
                            key={proj.title}
                            proj={proj}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Projects;
