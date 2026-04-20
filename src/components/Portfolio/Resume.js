import React from "react";
import resumeData from "@/data/resumeData";
import { renderLinkedTechText } from "@/data/utilities";

function Resume() {
    return (
        <section id="experience" className="py-20 px-5 xs:px-10 lg:px-16">
            <h2 className="text-3xl md:text-5xl font-bold text-center text-accent dark:text-accentDark mb-16 tracking-tight">
                My Tech Experience
            </h2>
            <div className="space-y-12">
                {resumeData.map((job, index) => (
                    <div key={index} className="glass p-8 md:p-12 rounded-3xl shadow-modern hover:shadow-modern-lg transition-all duration-500 hover:-translate-y-1">
                        <h3 className="font-bold capitalize text-accent dark:text-accentDark text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2 tracking-tight">
                            <a
                                href={job.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 
                                dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 underline-offset-4"
                            >
                                {job.company}
                            </a>
                        </h3>
                        <p className="text-dark dark:text-light text-base sm:text-lg md:text-xl font-bold opacity-80 mb-6">
                            {job.role} <span className="mx-2 opacity-40">|</span> {job.duration}
                        </p>
                        <ul className="space-y-4 text-sm sm:text-base md:text-lg leading-relaxed text-dark/90 dark:text-light/90">
                            {job.accomplishments.map((accomplishment, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <span className="text-accent dark:text-accentDark mt-1.5 text-xs">✦</span>
                                    <span>{renderLinkedTechText(accomplishment)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Resume;
