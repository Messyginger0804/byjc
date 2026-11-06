import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import ServicesBento from "./ServicesBento";

// Each figure comes from the bullets in src/data/resumeData.js (Onix Media, iServiceWeb, DFW Software Consulting).
const STATS = [
    { value: "60 → 90+", label: "Lighthouse scores after performance work" },
    { value: "30–50%", label: "lower hosting costs on self-hosted infrastructure" },
    { value: "3", label: "interns led at iServiceWeb" },
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
            <Stagger as="dl" className="mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
                {STATS.map((s) => (
                    <StaggerItem key={s.value} className="glass flex items-baseline gap-3 rounded-2xl px-4 py-3 sm:block">
                        <dt className="shrink-0 whitespace-nowrap font-display text-2xl font-semibold tracking-tight text-gradient min-w-[6.75rem] sm:min-w-0 sm:mb-1">{s.value}</dt>
                        <dd className="text-sm leading-snug text-muted">{s.label}</dd>
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
