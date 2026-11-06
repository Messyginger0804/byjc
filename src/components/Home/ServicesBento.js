import Image from "next/image";
import Link from "next/link";
import logoImage from "../../../public/assets/mes/waterCoolerMe.png";
import { Magnetic, Reveal, Stagger, StaggerItem } from "@/components/Motion";
import ServiceCard from "./ServiceCard";
import {
    IconApp,
    IconCart,
    IconDevices,
    IconLanding,
    IconServer,
    VisualApp,
    VisualBackend,
    VisualFrontend,
    VisualLanding,
    VisualShop,
} from "./ServiceVisuals";

// Grid (lg, 3 cols x 3 rows): avatar spans rows 1-2 on the left; 01 wide; 02, 03; 04; 05 wide. No holes.
// md (2 cols): avatar wide, 01 wide, then 02-05 as singles. Mobile: single column.
const SERVICES = [
    {
        n: "01",
        title: "Landing pages",
        text: "Design and develop landing pages that showcase your brand.",
        Icon: IconLanding,
        Visual: VisualLanding,
        wrap: "md:col-span-2 lg:col-start-2",
        row: "md:flex-row md:items-center",
    },
    {
        n: "02",
        title: "Business apps",
        text: "Create powerful applications to manage your business inventory.",
        Icon: IconApp,
        Visual: VisualApp,
        wrap: "",
        row: "",
    },
    {
        n: "03",
        title: "E-commerce",
        text: "Build e-commerce solutions for seamless online purchases.",
        Icon: IconCart,
        Visual: VisualShop,
        wrap: "",
        row: "",
    },
    {
        n: "04",
        title: "Backend systems",
        text: "Develop scalable, secure backend systems for your applications.",
        Icon: IconServer,
        Visual: VisualBackend,
        wrap: "lg:col-start-1",
        row: "",
    },
    {
        n: "05",
        title: "Frontend & UX",
        text: "Deliver intuitive, responsive frontends for exceptional UX.",
        Icon: IconDevices,
        Visual: VisualFrontend,
        wrap: "lg:col-span-2",
        row: "lg:flex-row lg:items-center",
    },
];

function ServiceItem({ s }) {
    const { Icon, Visual } = s;
    return (
        <StaggerItem className={s.wrap}>
            <ServiceCard className={`h-full p-5 md:p-6 flex flex-col gap-5 ${s.row}`}>
                <div className={`svc-vis-box relative order-first w-full shrink-0 ${s.row ? (s.n === "01" ? "md:order-last md:w-[48%]" : "lg:order-last lg:w-[66%] lg:self-stretch") : ""}`}>
                    <div className={`svc-vis-pane w-full ${s.n === "05" ? "aspect-[240/130] lg:aspect-auto lg:h-full lg:flex lg:items-center" : "aspect-[240/130]"}`}>
                        <Visual />
                    </div>
                </div>
                <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent dark:bg-accent-bright/15 dark:text-accent-bright">
                            <Icon />
                        </span>
                        <span className="font-mono-jb text-xs font-medium tracking-[0.2em] text-accent dark:text-accent-bright">{s.n}</span>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight">{s.title}</h3>
                    <p className="text-[0.95rem] leading-relaxed text-muted">{s.text}</p>
                </div>
            </ServiceCard>
        </StaggerItem>
    );
}

export default function ServicesBento() {
    return (
        <section className="container-page pb-24 md:pb-32" aria-labelledby="services-heading">
            <Reveal>
                <p className="eyebrow text-gradient mb-3">What I do</p>
                <h2 id="services-heading" className="display-lg font-display max-w-3xl text-balance">
                    Services built to <span className="text-gradient">ship</span>
                </h2>
                <p className="mt-5 max-w-2xl text-lg md:text-xl text-muted">
                    From crafting visually stunning websites to building robust software applications, I offer solutions tailored to your needs:
                </p>
            </Reveal>

            <Stagger className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <StaggerItem className="md:col-span-2 lg:col-span-1 lg:row-span-2">
                    <ServiceCard className="h-full">
                        <div className="svc-aurora" aria-hidden="true" />
                        <div className="relative z-10 flex h-full flex-col items-center justify-between gap-6 p-6 md:p-8">
                            <div className="relative flex w-full flex-1 items-center justify-center">
                                <Image
                                    src={logoImage}
                                    alt="JC leaning on a water cooler, holding a paper cup"
                                    width={350}
                                    height={350}
                                    sizes="(max-width: 768px) 70vw, 300px"
                                    className="relative h-auto w-full max-w-[17rem] drop-shadow-[0_18px_24px_rgba(20,20,50,0.18)]"
                                />
                            </div>
                            <div className="flex w-full flex-col items-center gap-4 text-center">
                                <div>
                                    <p className="font-display text-lg font-semibold tracking-tight text-balance">JC <span aria-hidden="true">&mdash;</span><span className="sr-only">,</span> Software engineer <span aria-hidden="true">&middot;</span><span className="sr-only">,</span> Dallas, TX</p>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/25 bg-emerald-600/10 px-3.5 py-1.5 text-sm font-medium text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                                    <span className="svc-status" aria-hidden="true" />
                                    Available for new projects
                                </span>
                                <Magnetic>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center gap-2 rounded-full bg-signal-cta px-7 py-3.5 font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2"
                                    >
                                        Start a project <span aria-hidden="true">&rarr;</span>
                                    </Link>
                                </Magnetic>
                            </div>
                        </div>
                    </ServiceCard>
                </StaggerItem>

                {SERVICES.map((s) => (
                    <ServiceItem key={s.n} s={s} />
                ))}

                <StaggerItem className="md:col-span-2 lg:col-span-3">
                    <div className="gradient-border rounded-3xl glass p-8 md:p-12">
                        <p className="display-md font-display text-gradient text-balance">
                            Whatever your vision, I have the tools and expertise to bring it to life.
                        </p>
                    </div>
                </StaggerItem>
            </Stagger>
        </section>
    );
}
