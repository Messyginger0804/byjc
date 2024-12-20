import React from "react";
import resumeData from "@/data/resumeData";

function Resume() {
    return (
        <section id="experience" className="py-12 px-5 xs:px-10 lg:px-16">
            <h2 className="font-semibold capitalize text-2xl md:text-3xl lg:text-5xl mb-8">
                My Tech Experience
            </h2>
            <div className="space-y-16">
                {resumeData.map((job, index) => (
                    <div key={index}>
                        <h3 className="font-semibold capitalize text-accent dark:text-accentDark text-xl md:text-2xl lg:text-3xl mb-4">
                            <a
                                href={job.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 
                                dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 underline-offset-2 hover:underline"
                            >
                                {job.company}
                            </a>
                        </h3>
                        <p className="text-dark dark:text-light text-sm md:text-base lg:text-lg font-bold pl-6">
                            {job.role} | {job.duration}
                        </p>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-lg md:text-xl leading-relaxed tracking-wide text-dark dark:text-light pl-12">
                            {job.accomplishments.map((accomplishment, idx) => (
                                <li key={idx}>{accomplishment}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Resume;
