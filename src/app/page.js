import Image from "next/image";
import logoImage from "../../public/assets/mes/waterCoolerMe.png";
import siteMetadata from "@/utils/metaData";
import { createPageMetadata, createWebSiteJsonLd } from "@/lib/metadata";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import HeroCanvas from "@/components/Three/HeroCanvas";
import { Magnetic, Reveal, Stagger, StaggerItem, TiltCard } from "@/components/Motion";

export async function generateMetadata() {
    return createPageMetadata({
        title: "Home | Software by JC",
        description: "Welcome to Software by JC. Crafting innovative software solutions for businesses of all sizes.",
        keywords: [
            "Software by JC",
            "JC Ashley",
            "software development",
            "web development",
            "hire developer",
            "byjc.dev",
        ],
        url: siteMetadata.siteUrl,
    });
}

const SERVICES = [
    { n: "01", text: "Design and develop landing pages that showcase your brand.", span: "md:col-span-2" },
    { n: "02", text: "Create powerful applications to manage your business inventory.", span: "" },
    { n: "03", text: "Build e-commerce solutions for seamless online purchases.", span: "" },
    { n: "04", text: "Develop scalable, secure backend systems for your applications.", span: "" },
    { n: "05", text: "Deliver intuitive, responsive frontends for exceptional UX.", span: "md:col-span-2" },
];

export default function HomePage() {
    return (
        <>
            <JsonLd data={createWebSiteJsonLd()} />

            {/* Hero */}
            <section className="relative isolate overflow-hidden md:flex md:min-h-[calc(100svh-5rem)] md:items-center">
                <div className="relative h-[42svh] min-h-[15rem] max-h-[24rem] w-full md:absolute md:inset-y-0 md:-right-[2vw] md:h-auto md:max-h-none md:min-h-0 md:w-[50%]">
                    <HeroCanvas />
                </div>
                <div className="container-page relative z-10 pb-12 pt-4 md:py-24">
                    <p className="eyebrow text-gradient reveal-up mb-6" style={{ "--i": 0 }}>
                        Software by JC / Dallas, TX
                    </p>
                    <h1 className="display-xl md:text-[clamp(3rem,5.4vw,6rem)] font-display max-w-4xl text-balance">
                        <span className="reveal-line">
                            <span className="reveal-line-inner" style={{ "--i": 0 }}>Welcome to</span>
                        </span>
                        <span className="reveal-line">
                            <span className="reveal-line-inner text-gradient" style={{ "--i": 1 }}>Software by JC</span>
                        </span>
                    </h1>
                    <p className="reveal-up mt-6 md:mt-8 max-w-xl text-xl md:text-2xl text-muted text-balance" style={{ "--i": 2 }}>
                        Innovative solutions for your business needs.
                    </p>
                    <div className="reveal-up mt-10 flex flex-wrap items-center gap-4" style={{ "--i": 3 }}>
                        <Magnetic>
                            <Link
                                href="/blogs"
                                className="inline-flex items-center gap-2 rounded-full bg-signal-cta px-7 py-3.5 font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2"
                            >
                                Read the blog <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </Magnetic>
                        <Link
                            href="/portfolio"
                            className="glass inline-flex items-center rounded-full px-7 py-3.5 font-semibold transition-colors hover:border-accent dark:hover:border-accent-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2"
                        >
                            View portfolio
                        </Link>
                    </div>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 eyebrow reveal-up" style={{ "--i": 4 }} aria-hidden="true">
                    Scroll
                    <span className="block h-10 w-px bg-gradient-to-b from-accent dark:from-accent-bright to-transparent animate-pulse" />
                </div>
            </section>

            {/* Bento */}
            <section className="container-page pb-24 md:pb-32">
                <Reveal>
                    <p className="eyebrow mb-3">Services</p>
                    <h2 className="display-lg font-display max-w-3xl text-balance">
                        What I Can Do for You <span aria-hidden="true">🫵</span>
                    </h2>
                    <p className="mt-5 max-w-2xl text-lg md:text-xl text-muted">
                        From crafting visually stunning websites to building robust software applications, I offer solutions tailored to your needs:
                    </p>
                </Reveal>

                <Stagger className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                    <StaggerItem className="md:col-span-2 md:row-span-2">
                        <TiltCard className="glass-card h-full p-6 md:p-8 flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute -inset-3 bg-signal rounded-3xl blur-2xl opacity-30" aria-hidden="true" />
                                <Image
                                    src={logoImage}
                                    alt="Software by JC Logo"
                                    width={350}
                                    height={350}
                                    sizes="(max-width: 768px) 80vw, 350px"
                                    className="relative rounded-2xl"
                                />
                            </div>
                        </TiltCard>
                    </StaggerItem>
                    {SERVICES.map((s) => (
                        <StaggerItem key={s.n} className={s.span}>
                            <div className="glass-card h-full p-6 md:p-7 flex flex-col gap-4">
                                <span className="eyebrow text-gradient">{s.n}</span>
                                <p className="text-lg font-medium leading-snug">{s.text}</p>
                            </div>
                        </StaggerItem>
                    ))}
                    <StaggerItem className="md:col-span-4">
                        <div className="gradient-border rounded-3xl glass p-8 md:p-12">
                            <p className="display-md font-display text-gradient text-balance">
                                Whatever your vision, I have the tools and expertise to bring it to life.
                            </p>
                        </div>
                    </StaggerItem>
                </Stagger>
            </section>
        </>
    );
}
