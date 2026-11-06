
import siteMetadata from "@/utils/metaData";
import Image from "next/image";
import Avator from "@/components/Portfolio/Avator";

import { sections } from "@/data/about";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Motion/Reveal";
import { Stagger, StaggerItem } from "@/components/Motion/Stagger";


export async function generateMetadata() {
    return {
        title: "About Me | by JC",
        description: "Learn more about JC Ashley, the developer behind Software by JC. Discover his journey, expertise, and passion for creating innovative software solutions.",
        keywords: [
            "About JC",
            "Jeremy Ashley",
            "Software by JC",
            "about software developer",
            "web developer background",
            "hire software developer"
        ],
        author: "JC Ashley",
        openGraph: {
            title: "About Me | by JC",
            description: "Learn more about Jeremy Ashley, the developer behind Software by JC. Discover his journey, expertise, and passion for creating innovative software solutions.",
            url: `${siteMetadata.siteUrl}/about`,
            siteName: siteMetadata.title,
            locale: "en_US",
            type: "website",
            images: [
                {
                    url: `${siteMetadata.siteUrl}/about-images/justme.png`,
                    width: 1200,
                    height: 630,
                    alt: "Jeremy Ashley - Software by JC",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: "About Me | Software by JC",
            description: "Learn more about Jeremy Ashley, the developer behind Software by JC. Discover his journey, expertise, and passion for creating innovative software solutions.",
            image: `${siteMetadata.siteUrl}/about-images/justme.png`,
        },
        alternates: {
            canonical: `${siteMetadata.siteUrl}/about`,
        },
    };
}


export default function AboutPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About JC Ashley",
        "url": `${siteMetadata.siteUrl}/about`,
        "description": "Learn more about JC Ashley, the developer behind Software by JC.",
        "mainEntity": {
            "@type": "Person",
            "name": siteMetadata.author,
            "url": siteMetadata.siteUrl + "/portfolio",
            "sameAs": [
                siteMetadata.linkedin,
                siteMetadata.github,
                siteMetadata.twitter,
            ],
            "jobTitle": "Software Engineer",
        },
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <div className="container-page py-12 md:py-24">
                {/* Hero: editorial two-column */}
                <header className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
                    <div>
                        <p className="eyebrow text-gradient reveal-up" style={{ "--i": 0 }}>About / The person behind the code</p>
                        <h1 className="display-xl lg:text-[clamp(3rem,5.2vw,5rem)] mt-5 flex flex-wrap items-baseline gap-x-[0.25em]">
                            <span className="reveal-line"><span className="reveal-line-inner" style={{ "--i": 0 }}>Hey, I&rsquo;m</span></span>
                            <span className="inline-flex items-baseline gap-x-[0.25em] whitespace-nowrap">
                                <span className="reveal-line"><span className="reveal-line-inner text-gradient gradient-flow" style={{ "--i": 1 }}>JC</span></span>
                                <span className="reveal-up inline-block" style={{ "--i": 2 }} aria-hidden="true">😏</span>
                            </span>
                        </h1>
                        <blockquote className="reveal-up mt-10 border-l-2 border-accent dark:border-accent-bright pl-6" style={{ "--i": 2 }}>
                            <p className="font-display text-2xl md:text-3xl font-semibold leading-snug tracking-tight text-balance">
                                &ldquo;My family is at the heart of everything I do.&rdquo;
                            </p>
                        </blockquote>

                        <Stagger as="ul" className="mt-10 flex flex-wrap gap-2.5" aria-label="Facts about JC">
                            {sections?.map((section, index) => (
                                <StaggerItem as="li" y={12} key={index}>
                                    <a
                                        href={`#story-${index}`}
                                        className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white dark:hover:bg-accent-bright dark:hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink"
                                    >
                                        <span className="eyebrow !tracking-wider !text-current opacity-70">0{index + 1}</span>
                                        {section.title}
                                    </a>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                    <div className="reveal-up flex flex-col items-center" style={{ "--i": 2 }}>
                        <Avator />
                    </div>
                </header>

                {/* Story */}
                <div className="mt-24 space-y-24 md:mt-36 md:space-y-36">
                    {sections?.map((section, index) => (
                        <section
                            key={index}
                            id={`story-${index}`}
                            aria-labelledby={`story-title-${index}`}
                            className={`grid scroll-mt-28 items-center gap-10 lg:grid-cols-2 lg:gap-20 ${section.reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
                        >
                            <Reveal className="group relative">
                                <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] bg-signal opacity-20 blur-2xl transition-opacity duration-700 group-hover:opacity-40" />
                                <div className="relative overflow-hidden rounded-[2rem] glass p-2">
                                    <Image
                                        src={section.image}
                                        alt={section.alt}
                                        width={640}
                                        height={640}
                                        sizes="(max-width: 1024px) 90vw, 560px"
                                        className="h-auto w-full rounded-[1.6rem] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                    />
                                </div>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <p className="eyebrow text-gradient">0{index + 1} / 0{sections.length}</p>
                                <h2 id={`story-title-${index}`} className="display-md mt-3 text-balance">
                                    {section.title}
                                </h2>
                                <p className="mt-6 text-lg leading-relaxed text-muted md:text-xl">{section.text}</p>
                            </Reveal>
                        </section>
                    ))}
                </div>
            </div>
        </>
    );
}
