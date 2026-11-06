import React from 'react';
import Avator from './Avator';

const AboutCover = () => {
    return (
        <section className="relative overflow-hidden py-16 md:py-24">
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 dark:bg-accent-bright/10 blur-[140px]" />
            <div className="container-page flex flex-col items-center text-center">
                <p className="eyebrow reveal-up" style={{ '--i': 0 }}>Portfolio / Senior full-stack AI engineer</p>
                <h1 className="display-xl mt-5 text-balance">
                    <span className="reveal-line"><span className="reveal-line-inner" style={{ '--i': 0 }}>Hey, I am</span></span>{' '}
                    <span className="reveal-line"><span className="reveal-line-inner text-gradient gradient-flow" style={{ '--i': 1 }}>JC</span></span>{' '}
                    <span className="reveal-up inline-block" style={{ '--i': 2 }} aria-hidden="true">😏</span>
                </h1>
                <p className="reveal-up mt-6 max-w-xl text-lg text-muted text-balance" style={{ '--i': 2 }}>
                    Senior full-stack AI engineer at Craft Digital. Founder of DFW Software Consulting.
                </p>
                <p className="reveal-up mt-4 max-w-2xl text-base text-muted text-balance md:text-lg" style={{ '--i': 2 }}>
                    I build custom applications, self-hosted and cloud infrastructure, LLM-powered features and agents, and the integrations that tie client systems together. Curiosity drives the work, much like a Star Trek crew: take a hard problem, then leave the system better than I found it.
                </p>
                <div className="reveal-up mt-14" style={{ '--i': 2 }}>
                    <Avator />
                </div>
            </div>
        </section>
    )
}

export default AboutCover;
