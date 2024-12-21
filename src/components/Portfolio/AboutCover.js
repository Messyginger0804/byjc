import React from 'react';
import Avator from './Avator';

const AboutCover = () => {
    return (
        <section className="w-full h-auto min-h-[50vh] border-b-2 border-solid border-dark dark:border-light flex flex-col items-center justify-center text-dark dark:text-light mt-20">
                <h2 className='font-bold capitalize mx-16 text-4xl xs:text-3xl xl:text-6xl text-center md:text-left'>
                        Hey I am JC 😏
                </h2>
            <Avator />
        </section>
    )
}

export default AboutCover;
