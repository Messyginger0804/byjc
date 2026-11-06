import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { contractedJobs } from "@/data/jobs";
import resumeData from "@/data/resumeData";
import { focusRing } from "./styles";

// Only title, link and image are read from the jobs data. Contact names and phone numbers are never rendered.
const CLIENTS = contractedJobs.map(({ title, link, image }) => ({ title, link, image }));

// Employers with no logo asset in the repo get a text-only tile. Anyone already listed as a client is skipped.
const EMPLOYER_LOGOS = {
    "Craft Digital": "/assets/brands/craft-digital-logo.jpeg",
    "DFW Software Consulting": "/assets/brands/dfwsc-logo.svg",
};
const EMPLOYERS = resumeData
    .map(({ company, website }) => ({ title: company, link: website, image: EMPLOYER_LOGOS[company], employer: true }))
    .filter((e) => e.link && !CLIENTS.some((c) => c.title === e.title));

const tileClass = `group glass flex h-full flex-col items-center gap-3 rounded-2xl p-4 text-center transition-colors hover:border-accent dark:hover:border-accent-bright ${focusRing}`;

export default function ClientStrip({ heading = "Teams and businesses I've built for", includeEmployers = false, className = "mt-16 md:mt-20" }) {
    const items = includeEmployers ? [...EMPLOYERS, ...CLIENTS] : CLIENTS;
    return (
        <div className={className} role="group" aria-labelledby="clients-heading">
            <Reveal>
                <p id="clients-heading" className="eyebrow mb-6 text-center">
                    {heading}
                </p>
            </Reveal>
            <Stagger as="ul" className="flex flex-wrap justify-center gap-3 md:gap-4" stagger={0.06}>
                {items.map((c) => (
                    <StaggerItem as="li" key={c.title} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)]">
                        <a href={c.link} target="_blank" rel="noopener noreferrer" className={tileClass}>
                            <span className="flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2.5 ring-1 ring-black/5">
                                {c.image ? (
                                    <Image
                                        src={c.image}
                                        alt={c.employer ? c.title : ""}
                                        width={160}
                                        height={80}
                                        className="h-full w-full object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0"
                                    />
                                ) : (
                                    <span className="font-display text-base font-semibold leading-tight tracking-tight text-neutral-700 transition-colors group-hover:text-neutral-950">
                                        {c.title}
                                    </span>
                                )}
                            </span>
                            <span className={c.employer ? "text-sm leading-snug text-muted" : "text-sm font-semibold leading-snug"}>
                                {c.employer ? "Employer" : c.title}
                                <span className="sr-only"> (opens in a new tab)</span>
                            </span>
                        </a>
                    </StaggerItem>
                ))}
            </Stagger>
        </div>
    );
}
