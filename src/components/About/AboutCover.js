import React from 'react';
import Avator from './Avator';

const AboutCover = () => {
    return (
        <section className="w-full h-auto min-h-[50vh] border-b-2 border-solid border-dark dark:border-light flex flex-col items-center justify-center text-dark dark:text-light mt-20">
            <Avator />
            <div className='w-full flex flex-col text-left items-start justify-center px-5 xs:px-10 pb-10 lg:px-16 min-h-[50vh]'>
                <div className='h-full overflow-y-auto'>
                    <h2 className='font-bold capitalize mx-16 text-4xl xs:text-3xl xl:text-6xl text-center md:text-left'>
                        Hey I am JC 😏
                    </h2>
                    <p className='font-medium mt-4 md:mx-12 text-xs md:text-lg tracking-tight leading-2 md:leading-8'>
                        I'm a dedicated and committed Software Engineer, passionate about delivering high-quality solutions. As a father of three, I believe in bringing fun and positivity into challenging situations. With a strong track record of success as a freelance developer and Lead Intern Engineer at iServiceWeb, I've developed a thirst for continuous learning and self-improvement. I aggressively seek out opportunities to enhance my skills and expertise, always looking for ways to improve myself and those around me. My passion lies in the process of creation, and I find joy in the journey of building innovative solutions. With a proven ability to lead teams and deliver results, I'm excited to continue growing as a professional and making meaningful contributions to the tech community.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default AboutCover;
