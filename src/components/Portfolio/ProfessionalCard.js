'use client'

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { renderLinkedTechText } from '@/utils/jsxRenderers';
import TiltCard from '@/components/Motion/TiltCard';

export function ProfessionalCard({ job }) {
    const maxDescLength = 150;

    return (
        <TiltCard className="h-full rounded-3xl">
            <article className="glass-card group flex h-full min-h-[34rem] flex-col overflow-hidden rounded-3xl text-left">
                <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={job.link}
                    aria-label={`${job.title} website`}
                    className="relative flex h-40 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-accent/15 via-violet/10 to-amber/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent dark:focus-visible:ring-accent-bright"
                >
                    <Image
                        className="relative h-28 w-28 rounded-2xl object-contain shadow-sm transition-transform duration-700 ease-out group-hover:scale-110"
                        src={job.image}
                        width={112}
                        height={112}
                        alt={`${job.title} logo`}
                        sizes="112px"
                    />
                </Link>

                <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-2xl font-bold tracking-tight">{job.title}</h3>
                    {job.descTitle && <h4 className="mt-1 text-sm font-semibold text-accent dark:text-accent-bright">{job.descTitle}</h4>}
                    <p className="mt-3 text-sm leading-relaxed text-muted">{renderLinkedTechText(job.description, maxDescLength)}</p>

                    <div className="mt-auto border-t border-black/5 dark:border-white/10 pt-4">
                        {job.client && <p className="text-xs font-bold mb-1"><span className="text-muted">Client:</span> {job.client}</p>}
                        {job.phoneNumber && (
                            <a href={`tel:${job.phoneNumber}`} className="text-sm font-semibold text-accent dark:text-accent-bright hover:underline underline-offset-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright">
                                {job.phoneNumber}
                            </a>
                        )}
                    </div>
                </div>
            </article>
        </TiltCard>
    );
}

export default ProfessionalCard;
