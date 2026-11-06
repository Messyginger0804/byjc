import React from "react";
import Link from "next/link";
import resumeData from "@/data/resumeData";
import { renderLinkedTechText } from "@/utils/jsxRenderers";
import Reveal from "@/components/Motion/Reveal";
import Magnetic from "@/components/Motion/Magnetic";

function Resume() {
    return (
        <section id="experience" className="container-page py-16 md:py-24">
            <Reveal className="mb-14 md:mb-20 max-w-3xl">
                <p className="eyebrow text-gradient">Experience</p>
                <h2 className="display-lg mt-3 text-balance">My Tech Experience</h2>
            </Reveal>

            <ol className="relative ml-3 md:ml-0 space-y-10 md:space-y-14 border-l-0">
                {/* gradient rail */}
                <span
                    aria-hidden="true"
                    className="absolute left-0 md:left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-accent via-violet to-amber opacity-70"
                />
                {resumeData.map((job, index) => (
                    <Reveal as="li" key={index} className="relative pl-8 md:pl-14">
                        <span
                            aria-hidden="true"
                            className="absolute -left-[5px] md:left-[6px] top-3 h-[11px] w-[11px] rounded-full bg-signal ring-4 ring-paper dark:ring-ink shadow-glow"
                        />
                        <div className="glass-card rounded-3xl p-6 md:p-10">
                            <p className="eyebrow">{job.duration}</p>
                            <h3 className="display-md mt-2">
                                <a
                                    href={job.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-md underline decoration-accent/40 dark:decoration-accent-bright/40 underline-offset-8 transition-colors hover:decoration-accent dark:hover:decoration-accent-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2"
                                >
                                    {job.company}
                                </a>
                            </h3>
                            <p className="mt-2 text-lg font-semibold text-accent dark:text-accent-bright">{job.role}</p>
                            <ul className="mt-6 space-y-3 text-base md:text-lg leading-relaxed">
                                {job.accomplishments.map((accomplishment, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                                        <span>{renderLinkedTechText(accomplishment)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>
                ))}
            </ol>

            <Reveal className="mt-16 flex justify-center">
                <Magnetic strength={0.25}>
                    <Link
                        href="/resume"
                        className="group inline-flex items-center gap-3 rounded-full bg-signal-cta px-8 py-4 text-base font-semibold text-white shadow-glow transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink"
                    >
                        View full resume
                        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </Link>
                </Magnetic>
            </Reveal>
        </section>
    );
}

export default Resume;
