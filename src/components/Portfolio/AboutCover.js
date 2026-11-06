import React from 'react';
import Avator from './Avator';

const AboutCover = () => {
    return (
        <section className="relative overflow-hidden py-16 md:py-24">
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 dark:bg-accent-bright/10 blur-[140px]" />
            <div className="container-page flex flex-col items-center text-center">
                <p className="eyebrow reveal-up" style={{ '--i': 0 }}>Portfolio / Software engineer</p>
                <h1 className="display-xl mt-5 text-balance">
                    <span className="reveal-line"><span className="reveal-line-inner" style={{ '--i': 0 }}>Hey, I am</span></span>{' '}
                    <span className="reveal-line"><span className="reveal-line-inner text-gradient gradient-flow" style={{ '--i': 1 }}>JC</span></span>{' '}
                    <span className="reveal-up inline-block" style={{ '--i': 2 }} aria-hidden="true">😏</span>
                </h1>
                <p className="reveal-up mt-6 max-w-xl text-lg text-muted text-balance" style={{ '--i': 2 }}>
                    Full-stack builds, thoughtful UX, and systems that ship.
                </p>
                <div className="reveal-up mt-14" style={{ '--i': 2 }}>
                    <Avator />
                </div>
            </div>
        </section>
    )
}

export default AboutCover;
