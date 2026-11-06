import siteMetadata from "@/utils/metaData";
import { createPageMetadata, createWebSiteJsonLd } from "@/lib/metadata";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import HeroCanvas from "@/components/Three/HeroCanvas";
import { Magnetic } from "@/components/Motion";
import ServicesBento from "@/components/Home/ServicesBento";

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

export default function HomePage() {
    return (
        <>
            <JsonLd data={createWebSiteJsonLd()} />

            {/* Hero */}
            <section className="relative isolate overflow-hidden md:flex md:min-h-[calc(100svh-5rem)] md:items-center">
                <div className="relative h-[42svh] min-h-[15rem] max-h-[24rem] w-full md:absolute md:inset-y-0 md:-right-[2vw] md:h-auto md:max-h-none md:min-h-0 md:w-[76%]">
                    {/* Wide canvas, orb offset to the right half inside it, so particles/glow fade out softly instead of being clipped at a hard edge. */}
                    <HeroCanvas className="md:[--hero-fade:38%] md:[--orb-offset:0.14]" />
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

            <ServicesBento />
        </>
    );
}
