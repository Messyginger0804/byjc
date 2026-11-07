import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { projects } from "@/data/projects";
import { textLink } from "./styles";

// One-line blurbs for the cards, written from each entry's description in src/data/projects.js.
const BLURBS = {
    "FreeCodeCamp": "Where it started: vanilla JS and Tailwind, plus my first routing without a framework.",
    "Poopie Review": "Movie reviews from Braylee and Ruby, and my first Java project (Spring Boot, MongoDB, React).",
    "Blogs by JC": "The first version of this blog, my first time with MDX and Next.js dynamic routing.",
    "Tias.com": "A full-stack store with Stripe checkout, my first run at Redux Toolkit.",
    "Google-Clone": "A Google clone on Next.js and Firebase that taught me to wrangle APIs and JSON.",
    "My 1st Portfolio Site": "My first Next.js site, styled with Tailwind.",
};

const ITEMS = projects.filter((p) => p.isPublished && BLURBS[p.title]);

export default function Projects() {
    return (
        <section className="container-page pb-20 md:pb-28" aria-labelledby="projects-heading">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-3xl">
                    <p className="eyebrow text-gradient mb-3">Side projects</p>
                    <h2 id="projects-heading" className="display-lg font-display text-balance">
                        Things I&apos;ve <span className="text-gradient">built</span> to learn
                    </h2>
                </div>
                <Link href="/portfolio" className={textLink}>More on my portfolio &rarr;</Link>
            </Reveal>
            <Stagger as="ul" className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 md:gap-6 lg:grid-cols-3">
                {ITEMS.map((p) => (
                    <StaggerItem as="li" key={p.title} className="h-full">
                        <article className="group glass-card flex h-full flex-col overflow-hidden p-3">
                            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-white/60 dark:bg-white/5">
                                <Image
                                    src={p.image}
                                    alt=""
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                            </div>
                            <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                                <h3 className="font-display text-xl font-semibold tracking-tight">{p.title}</h3>
                                <p className="mt-2 leading-relaxed text-muted">{BLURBS[p.title]}</p>
                                <div className="mt-auto flex gap-5 pt-5">
                                    <a href={p.live} target="_blank" rel="noopener noreferrer" className={textLink}>
                                        Live <span aria-hidden="true">&#8599;</span>
                                        <span className="sr-only"> demo of {p.title} (opens in a new tab)</span>
                                    </a>
                                    <a href={p.repo} target="_blank" rel="noopener noreferrer" className={textLink}>
                                        Code <span aria-hidden="true">&#8599;</span>
                                        <span className="sr-only"> for {p.title} on GitHub (opens in a new tab)</span>
                                    </a>
                                </div>
                            </div>
                        </article>
                    </StaggerItem>
                ))}
            </Stagger>
        </section>
    );
}
