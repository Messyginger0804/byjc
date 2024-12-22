import React from 'react'
import { ProfessionalCard } from './ProfessionalCard';


function Professional({ contractedJobs }) {
    return (

        <div className=' flex justify-center flex-wrap lg:flex gap-10'>
            {contractedJobs?.map((job) => (
                // eslint-disable-next-line react/jsx-key
                <div className='flex justify-center gap-3'>
                    <ProfessionalCard
                        key={job.title}
                        job={job}
                    />
                </div>
            ))}
        </div>
    )
}

export default Professional