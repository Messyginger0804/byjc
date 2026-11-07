import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import recommendations from "@/data/recommendations";
import { focusRing } from "./styles";

// Short excerpts, quoted verbatim from each LinkedIn recommendation in src/data/recommendations.js.
const EXCERPTS = {
    "Osvaldo X": "Jeremy is skilled, reliable, and a solid team player.",
    "Mohamed El Omary": "His contributions earned him the position of Lead Intern Engineer, where he excelled in mentoring others.",
    "Neel Yadav": "He has a unique talent for breaking down complex problems and providing clear, actionable guidance.",
};

export default function Testimonials() {
    const items = recommendations.filter((r) => EXCERPTS[r.name]);
    return (
        <section className="container-page pb-20 md:pb-28" aria-labelledby="testimonials-heading">
            <Reveal className="max-w-3xl">
                <p className="eyebrow text-gradient mb-3">From my teammates</p>
                <h2 id="testimonials-heading" className="display-lg font-display text-balance">
                    What the people <span className="text-gradient">beside me</span> say
                </h2>
            </Reveal>
            <Stagger as="ul" className="mt-10 grid gap-4 md:mt-12 md:gap-6 lg:grid-cols-3">
                {items.map((r) => (
                    <StaggerItem as="li" key={r.name} className="h-full">
                        <figure className="glass-card relative flex h-full flex-col p-6 md:p-8">
                            <span className="block h-10 font-display text-6xl leading-[0.95] text-gradient select-none" aria-hidden="true">&ldquo;</span>
                            <blockquote className="mt-2 flex-1 font-display text-xl font-medium leading-snug tracking-tight text-balance md:text-2xl">
                                {EXCERPTS[r.name]}
                            </blockquote>
                            <figcaption className="mt-8 flex items-center gap-4">
                                <Image
                                    src={r.image}
                                    alt=""
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/60 dark:ring-white/10"
                                />
                                <div className="min-w-0">
                                    <a
                                        href={r.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`rounded font-semibold hover:underline underline-offset-4 ${focusRing}`}
                                    >
                                        {r.name}
                                        <span className="sr-only"> on LinkedIn (opens in a new tab)</span>
                                    </a>
                                    <p className="text-sm text-muted">{r.position}, {r.company}</p>
                                </div>
                            </figcaption>
                        </figure>
                    </StaggerItem>
                ))}
            </Stagger>
        </section>
    );
}
