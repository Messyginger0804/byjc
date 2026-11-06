import React from 'react';
import Image from 'next/image';
import { heading, renderLinkedTechText } from '@/utils/jsxRenderers';
import TiltCard from '@/components/Motion/TiltCard';

const TECH_TAGS = [
    'Next.js', 'React', 'Tailwind CSS', 'Vite', 'Java Spring Boot', 'MongoDB', 'MDX', 'Redux Toolkit',
    'Firebase', 'FastAPI', 'Node.js', 'Docker', 'Stripe', 'vanilla JavaScript', 'JavaScript', 'WordPress',
];

function getTags(text = '') {
    const tags = TECH_TAGS.filter((t) => text.includes(t));
    // Drop generic names already covered by a more specific tag.
    return tags.filter((t) => !(t === 'JavaScript' && tags.includes('vanilla JavaScript'))).slice(0, 4);
}

const btnBase =
    "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink";

export function ProjectCard({ proj }) {
    const maxDescLength = 150;
    const tags = getTags(proj.desc);

    return (
        <TiltCard className="h-full rounded-3xl">
            <article className="glass-card group flex h-[34rem] flex-col overflow-hidden rounded-3xl text-left">
                <div className="relative flex h-40 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-accent/15 via-violet/10 to-amber/15">
                    <Image
                        className="relative h-28 w-28 rounded-2xl object-contain shadow-sm transition-transform duration-700 ease-out group-hover:scale-110"
                        src={proj.image}
                        width={112}
                        height={112}
                        alt={proj.title}
                        sizes="112px"
                    />
                    {proj.inProgress && <div className="absolute right-3 top-3 z-20">{heading(proj.inProgress)}</div>}
                </div>

                <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-2xl font-bold tracking-tight">{proj.title}</h3>
                    <h4 className="mt-1 text-sm font-semibold text-accent dark:text-accent-bright">{proj.descTitle}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{renderLinkedTechText(proj.desc, maxDescLength)}</p>

                    {tags.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
                            {tags.map((t) => (
                                <li key={t} className="eyebrow rounded-full border border-black/10 dark:border-white/15 px-2.5 py-1 !text-[0.65rem] !tracking-wider">
                                    {t}
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-auto flex gap-3 pt-5">
                        <a
                            href={proj.repo}
                            className={`${btnBase} border border-dark/20 dark:border-white/25 hover:bg-dark hover:text-white dark:hover:bg-white dark:hover:text-ink`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                        {proj.isPublished ? (
                            <a
                                href={proj.live}
                                className={`${btnBase} bg-signal-cta text-white hover:brightness-110`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Live Site
                            </a>
                        ) : (
                            <span aria-disabled="true" className={`${btnBase} cursor-not-allowed border border-dark/10 dark:border-white/10 text-muted opacity-60`}>
                                Live Site
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </TiltCard>
    );
}

export default ProjectCard;
