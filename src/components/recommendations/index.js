import React from "react";
import Image from "next/image";
import recommendations from "@/data/recommendations";
import Reveal from "@/components/Motion/Reveal";

const linkFocus =
    "rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink";

const Recommendations = () => {
    return (
        <section className="container-page py-16 md:py-24">
            <Reveal className="max-w-3xl">
                <p className="eyebrow text-gradient">Kind words</p>
                <h2 className="display-lg mt-3 text-balance">Recommendations</h2>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {recommendations.map((recommendation, index) => (
                    <Reveal
                        as="figure"
                        key={index}
                        delay={(index % 2) * 0.08}
                        className="glass-card relative flex flex-col gap-6 overflow-hidden rounded-3xl p-7 md:p-9"
                    >
                        <span
                            aria-hidden="true"
                            className="font-display text-gradient pointer-events-none absolute right-6 top-2 select-none text-[8rem] leading-none opacity-30"
                        >
                            &ldquo;
                        </span>

                        <blockquote className="relative space-y-4 text-base leading-relaxed md:text-[1.05rem]">
                            {recommendation.text
                                .trim()
                                .split(/\n\s*\n/)
                                .map((para, i, arr) => (
                                    <p key={i}>
                                        {i === 0 && "\u201C"}
                                        {para.trim()}
                                        {i === arr.length - 1 && "\u201D"}
                                    </p>
                                ))}
                        </blockquote>

                        <figcaption className="mt-auto flex items-center gap-4 border-t border-black/5 dark:border-white/10 pt-5">
                            <a href={recommendation.linkedin} target="_blank" rel="noopener noreferrer" className={`shrink-0 ${linkFocus}`} tabIndex={-1} aria-hidden="true">
                                <Image
                                    src={recommendation.image}
                                    alt=""
                                    width={56}
                                    height={56}
                                    className="h-14 w-14 rounded-full object-cover ring-2 ring-accent dark:ring-accent-bright ring-offset-2 ring-offset-paper dark:ring-offset-ink"
                                />
                            </a>
                            <div className="min-w-0">
                                <a
                                    href={recommendation.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`font-display text-lg font-bold text-accent dark:text-accent-bright hover:underline underline-offset-4 ${linkFocus}`}
                                >
                                    {recommendation.name}
                                </a>
                                <p className="text-sm font-semibold">
                                    {recommendation.position}, {recommendation.company}
                                </p>
                                <p className="text-xs text-muted">
                                    {recommendation.relationship} | {recommendation.date}
                                </p>
                            </div>
                        </figcaption>
                    </Reveal>
                ))}
            </div>
        </section>
    );
};

export default Recommendations;
