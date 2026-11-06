import Link from "next/link";
import HeroCanvas from "@/components/Three/HeroCanvas";
import { Magnetic } from "@/components/Motion";
import { ghostCta, primaryCta } from "./styles";

// Each figure comes from the bullets in src/data/resumeData.js (Onix Media, iServiceWeb, DFW Software Consulting).
const STATS = [
    { value: "60 → 90+", label: "Lighthouse scores after performance work" },
    { value: "30–50%", label: "lower hosting costs on self-hosted infrastructure" },
    { value: "5+", label: "junior developers mentored" },
];

export default function Hero() {
    return (
        <section className="relative isolate overflow-hidden md:flex md:min-h-[calc(100svh-5rem)] md:items-center">
            <div className="relative h-[34svh] min-h-[13rem] max-h-[22rem] w-full md:absolute md:inset-y-0 md:-right-[2vw] md:h-auto md:max-h-none md:min-h-0 md:w-[76%]">
                {/* Wide canvas, orb offset to the right half inside it, so particles/glow fade out softly instead of being clipped at a hard edge. */}
                <HeroCanvas className="md:[--hero-fade:38%] md:[--orb-offset:0.14]" />
            </div>
            <div className="container-page relative z-10 pb-12 pt-4 md:py-24">
                <div className="reveal-up mb-6 flex flex-wrap items-center gap-x-4 gap-y-3" style={{ "--i": 0 }}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/25 bg-emerald-600/10 px-3.5 py-1.5 text-sm font-medium text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                        <span className="svc-status" aria-hidden="true" />
                        Available for new projects
                    </span>
                    <p className="eyebrow text-gradient">Software by JC</p>
                </div>
                <p className="reveal-up mb-4 max-w-xl text-sm leading-relaxed text-muted md:text-base" style={{ "--i": 0 }}>
                    JC Ashley &middot; Founder, DFW Software Consulting &middot; Full-stack engineer &middot; Dallas, TX
                </p>
                <h1 className="display-xl md:text-[clamp(3rem,4.9vw,5.5rem)] font-display md:max-w-[34rem] xl:max-w-4xl text-balance">
                    <span className="reveal-line">
                        <span className="reveal-line-inner" style={{ "--i": 0 }}>You run the business.</span>
                    </span>
                    <span className="reveal-line">
                        <span className="reveal-line-inner text-gradient" style={{ "--i": 1 }}>I build the software that keeps up.</span>
                    </span>
                </h1>
                <p className="reveal-up mt-6 md:mt-8 max-w-xl text-lg md:text-xl text-muted text-balance" style={{ "--i": 2 }}>
                    Landing pages, business apps, e-commerce and the backends behind them, built for small businesses and teams who need it done right and explained plainly.
                </p>
                <div className="reveal-up mt-9 flex flex-wrap items-center gap-4" style={{ "--i": 3 }}>
                    <Magnetic>
                        <Link href="/contact" className={primaryCta}>
                            Let&apos;s build together <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </Magnetic>
                    <Link href="/blogs" className={ghostCta}>Read the blog</Link>
                </div>
                <dl className="reveal-up mt-10 grid max-w-xl xl:max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3" style={{ "--i": 4 }}>
                    {STATS.map((s) => (
                        <div key={s.value} className="glass flex items-baseline gap-3 rounded-2xl px-4 py-3 sm:block">
                            <dt className="shrink-0 whitespace-nowrap font-display text-2xl font-semibold tracking-tight text-gradient min-w-[6.75rem] sm:min-w-0 sm:mb-1">{s.value}</dt>
                            <dd className="text-sm leading-snug text-muted">{s.label}</dd>
                        </div>
                    ))}
                </dl>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 eyebrow reveal-up" style={{ "--i": 4 }} aria-hidden="true">
                Scroll
                <span className="block h-10 w-px bg-gradient-to-b from-accent dark:from-accent-bright to-transparent animate-pulse" />
            </div>
        </section>
    );
}
