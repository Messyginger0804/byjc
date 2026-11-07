import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import ServicesBento from "./ServicesBento";

// Each figure comes from the bullets in src/data/resumeData.js; `source` names the role it is from.
const STATS = [
    { value: "30–50%", label: "lower hosting costs on self-hosted infrastructure", source: "At DFW Software Consulting" },
    { value: "60 → 90+", label: "Lighthouse scores after SEO and performance work", source: "At Onix Media" },
    { value: "3", label: "interns led, with code reviews and standards", source: "At iServiceWeb" },
];

export default function Hire() {
    return (
        <section className="container-page pb-20 md:pb-28" aria-labelledby="hire-heading">
            <Reveal>
                <p className="eyebrow text-gradient mb-3">The business side</p>
                <h2 id="hire-heading" className="display-lg font-display max-w-4xl text-balance">
                    Need something built? That&apos;s what <span className="text-gradient">DFW Software Consulting</span> is for.
                </h2>
                <p className="mt-5 max-w-2xl text-lg text-muted md:text-xl">
                    It&apos;s the consultancy I founded in 2023. Landing pages, business apps, e-commerce and the backends behind them, for small businesses and teams.
                </p>
            </Reveal>
            <p className="mt-8 font-mono-jb text-xs uppercase tracking-[0.15em] text-muted">Career highlights</p>
            <Stagger as="dl" className="mt-3 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
                {STATS.map((s) => (
                    <StaggerItem key={s.value} className="glass flex items-baseline gap-3 rounded-2xl px-4 py-3 sm:block">
                        <dt className="shrink-0 whitespace-nowrap font-display text-2xl font-semibold tracking-tight text-gradient min-w-[6.75rem] sm:min-w-0 sm:mb-1">{s.value}</dt>
                        <dd className="text-sm leading-snug text-muted">
                            {s.label}
                            <span className="mt-1 block font-mono-jb text-[0.65rem] uppercase tracking-[0.14em] opacity-80">{s.source}</span>
                        </dd>
                    </StaggerItem>
                ))}
            </Stagger>
            <div className="mt-10 md:mt-12">
                <ServicesBento />
            </div>
            {/* Client logo strip hidden for now — component kept in ClientStrip.js */}
        </section>
    );
}
