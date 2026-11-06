import Link from "next/link";
import HeroCanvas from "@/components/Three/HeroCanvas";
import { Magnetic } from "@/components/Motion";
import siteMetadata from "@/utils/metaData";
import { focusRing, ghostCta, primaryCta } from "./styles";

// Personal facts from src/data/about.js, src/data/utilities.js and src/data/resumeData.js.
const CHIPS = ["Dad of three", "15 years in the service industry before code", "Dallas dev community regular", "Commit Your Code, twice"];

export default function Hero() {
    return (
        <section className="relative isolate overflow-hidden md:flex md:min-h-[calc(100svh-5rem)] md:items-center">
            <div className="relative h-[34svh] min-h-[13rem] max-h-[22rem] w-full md:absolute md:inset-y-0 md:-right-[2vw] md:h-auto md:max-h-none md:min-h-0 md:w-[76%]">
                {/* Wide canvas, orb offset to the right half inside it, so particles/glow fade out softly instead of being clipped at a hard edge. */}
                <HeroCanvas photo={{ src: "/assets/home/jc-cutout.webp", alt: "Photo of JC Ashley" }} className="md:[--hero-fade:38%] md:[--orb-offset:0.2]" />
            </div>
            <div className="container-page relative z-10 pb-12 pt-4 md:py-24">
                <div className="reveal-up mb-6 flex flex-wrap items-center gap-x-4 gap-y-3" style={{ "--i": 0 }}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/25 bg-emerald-600/10 px-3.5 py-1.5 text-sm font-medium text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                        <span className="svc-status" aria-hidden="true" />
                        Now: Senior full-stack AI engineer at Craft Digital &middot; running DFWSC
                    </span>
                    <p className="eyebrow text-gradient">Hey, I&apos;m JC <span aria-hidden="true">&#128075;</span></p>
                </div>
                <p className="reveal-up mb-4 max-w-xl text-sm leading-relaxed text-muted md:text-base" style={{ "--i": 0 }}>
                    JC Ashley &middot; Senior full-stack AI engineer at Craft Digital &middot; Founder, DFW Software Consulting &middot; Dallas, TX
                </p>
                <h1 className="display-xl md:text-[clamp(2.75rem,4.5vw,5.25rem)] font-display md:max-w-[34rem] xl:max-w-3xl text-balance">
                    <span className="reveal-line">
                        <span className="reveal-line-inner" style={{ "--i": 0 }}>I build software,</span>
                    </span>
                    <span className="reveal-line">
                        <span className="reveal-line-inner" style={{ "--i": 1 }}>write about it,</span>
                    </span>
                    <span className="reveal-line">
                        <span className="reveal-line-inner text-gradient" style={{ "--i": 2 }}>and bring people along.</span>
                    </span>
                </h1>
                <p className="reveal-up mt-6 md:mt-8 max-w-xl text-lg md:text-xl text-muted text-balance" style={{ "--i": 2 }}>
                    Dad of three, 15 years in the service industry before I wrote a line of code, and now a senior full-stack AI engineer who shows up for the Dallas dev community.
                </p>
                <div className="reveal-up mt-9 flex flex-wrap items-center gap-4" style={{ "--i": 3 }}>
                    <Magnetic>
                        <Link href="/blogs" className={primaryCta}>
                            Read the blog <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </Magnetic>
                    <Link href="/about" className={ghostCta}>My story</Link>
                </div>
                <p className="reveal-up mt-5 text-sm text-muted" style={{ "--i": 3 }}>
                    Hiring?{" "}
                    <a href={siteMetadata.company} target="_blank" rel="noopener noreferrer" className={`rounded font-medium text-accent underline decoration-2 underline-offset-4 hover:opacity-70 dark:text-accent-bright ${focusRing}`}>
                        Work with me at DFW Software Consulting <span aria-hidden="true">&#8599;</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                </p>
                <ul className="reveal-up mt-9 flex max-w-xl flex-wrap gap-2.5 xl:max-w-2xl" style={{ "--i": 4 }} aria-label="A bit about me">
                    {CHIPS.map((c) => (
                        <li key={c} className="glass rounded-full px-4 py-2 text-sm font-medium">{c}</li>
                    ))}
                </ul>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 eyebrow reveal-up" style={{ "--i": 4 }} aria-hidden="true">
                Scroll
                <span className="block h-10 w-px bg-gradient-to-b from-accent dark:from-accent-bright to-transparent animate-pulse" />
            </div>
        </section>
    );
}
