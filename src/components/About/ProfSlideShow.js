'use client';

import React from 'react';
import SlideShow from './SlideShow';
import ProfessionalCard from './ProfessionalCard';

function ProfSlideShow({ contractedJobs }) {
    return (
        <SlideShow
            items={contractedJobs}
            renderItem={(job) => <ProfessionalCard key={job.title} job={job} />}
        />
    );
}

export default ProfSlideShow;
