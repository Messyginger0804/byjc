import React from 'react'
import { ProfessionalCard } from './ProfessionalCard';


function Professional({ contractedJobs }) {
    return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {contractedJobs?.map((job) => (
                <ProfessionalCard key={job.title} job={job} />
            ))}
        </div>
    )
}

export default Professional
