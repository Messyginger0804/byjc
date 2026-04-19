import React from 'react';
import Avator from './Avator';

const AboutCover = () => {
    return (
        <section className="w-full h-auto min-h-[50vh] border-b border-solid border-dark/10 dark:border-light/10 flex flex-col items-center justify-center text-dark dark:text-light mt-16 md:mt-24 py-20 relative overflow-hidden bg-gradient-to-b from-accent/5 dark:from-accentDark/5 to-transparent">
            <h2 className="font-bold capitalize mx-8 md:mx-16 text-4xl xs:text-5xl lg:text-7xl text-center text-balance tracking-tight leading-tight z-10">
                Hey, I am <span className="text-accent dark:text-accentDark">JC</span> 😏
            </h2>
            <div className="mt-8 z-10">
                <Avator />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 dark:bg-accentDark/5 blur-[120px] rounded-full pointer-events-none" />
        </section>
    )
}

export default AboutCover;
