import React from 'react'

function Resume() {
    return (
        <section id="experience" className="py-12 px-5 xs:px-10 lg:px-16">
            <h2 className="font-semibold capitalize text-2xl md:text-3xl lg:text-5xl mb-8">
                My Tech Experience
            </h2>
            <div className="space-y-16">
                {/* DFW Software Consulting */}
                <div>
                    <h3 className="font-semibold capitalize text-accent dark:text-accentDark text-xl md:text-2xl lg:text-3xl mb-4">
                        <span
                            className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 
                    dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500"
                        >
                            DFW Software Consulting
                        </span>
                    </h3>
                    <p className="text-dark dark:text-light text-sm font-bold md:text-base lg:text-lg">
                        Freelance Developer | 2023 - 2024
                    </p>
                    <ul className="list-disc list-inside mt-4 space-y-2 text-lg md:text-xl leading-relaxed tracking-wide text-dark dark:text-light pl-6">
                        <li>
                            Designed and developed custom landing pages and web applications for local businesses, improving their online presence.
                        </li>
                        <li>
                            Built scalable backend solutions using Node.js and PostgreSQL to handle business operations efficiently.
                        </li>
                        <li>
                            Consulted clients on technical requirements and delivered tailored solutions to fit their unique needs.
                        </li>
                    </ul>
                </div>
                {/* iServiceWeb */}
                <div>
                    <h3 className="font-semibold capitalize text-accent dark:text-accentDark text-xl md:text-2xl lg:text-3xl mb-4">
                        <span
                            className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 
                    dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500"
                        >
                            iServiceWeb
                        </span>
                    </h3>
                    <p className="text-dark dark:text-light text-sm md:text-base lg:text-lg font-bold">
                        Lead Intern Engineer | 2023 - 2024
                    </p>
                    <ul className="list-disc list-inside mt-4 space-y-2 text-lg md:text-xl leading-relaxed tracking-wide text-dark dark:text-light pl-6">
                        <li>
                            Supervised a team of interns, assisting with project tasks, reviewing code, and managing GitHub pull requests.
                        </li>
                        <li>
                            Developed backend solutions using Node.js and MongoDB, implementing user authentication and subscription features.
                        </li>
                        <li>
                            Integrated third-party APIs (Mailchimp, Stripe, Calendly) to enhance application functionality.
                        </li>
                        <li>
                            Delivered features end-to-end, collaborating with frontend developers to ensure cohesive web experiences.
                        </li>
                    </ul>
                </div>
                {/* Onix Media */}
                <div>
                    <h3 className="font-semibold capitalize text-accent dark:text-accentDark text-xl md:text-2xl lg:text-3xl mb-4">
                        <span
                            className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 
                    dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500"
                        >
                            Onix Media
                        </span>
                    </h3>
                    <p className="text-dark dark:text-light text-sm md:text-base lg:text-lg font-bold">
                        Web Developer | 2024 - Present
                    </p>
                    <ul className="list-disc list-inside mt-4 space-y-2 text-lg md:text-xl leading-relaxed tracking-wide text-dark dark:text-light pl-6">
                        <li>
                            Spearheaded the automation of content publishing workflows, streamlining article uploads for websites.
                        </li>
                        <li>
                            Built RESTful APIs to manage dynamic website content and enable seamless client updates.
                        </li>
                        <li>
                            Collaborated with a creative team to integrate WordPress, Bootstrap, and custom PHP scripts into client projects.
                        </li>
                        <li>
                            Focused on SEO optimization and web performance enhancements, improving client site rankings and load times.
                        </li>
                    </ul>
                </div>
            </div>
        </section>

    )
}

export default Resume