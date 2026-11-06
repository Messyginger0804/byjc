import Link from "next/link";
import siteMetadata from "@/utils/metaData";
import { Magnetic, Reveal } from "@/components/Motion";
import { focusRing, ghostCta, primaryCta } from "./styles";


export default function SayHi() {
    const sub = `inline-flex rounded font-medium text-accent underline decoration-2 underline-offset-4 transition-opacity hover:opacity-70 dark:text-accent-bright ${focusRing}`;
    const channels = [
        { label: "LinkedIn", href: siteMetadata.linkedin, external: true },
        { label: "GitHub", href: siteMetadata.github, external: true },
        { label: "Discord", href: siteMetadata.discord, external: true },
        { label: "RSS", href: "/feed.xml" },
    ];
    return (
        <section className="container-page" aria-labelledby="hi-heading">
            <Reveal>
                <div className="gradient-border glass relative overflow-hidden rounded-[2rem] p-8 md:p-14">
                    <div className="svc-aurora" aria-hidden="true" />
                    <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                        <div>
                            <p className="eyebrow text-gradient mb-3">Say hi</p>
                            <h2 id="hi-heading" className="display-lg font-display text-balance">
                                Come say <span className="text-gradient">hi</span>
                            </h2>
                            <p className="mt-5 max-w-xl text-lg text-dark/75 dark:text-white/75">
                                Talk shop, swap a meetup story, tell me what you thought of a post, or just send a joke. I read everything.
                            </p>
                            <p className="mt-6 text-sm text-dark/80 dark:text-white/80">
                                Looking to hire someone?{" "}
                                <a href={siteMetadata.company} target="_blank" rel="noopener noreferrer" className={sub}>
                                    For client work, head to DFWSC <span aria-hidden="true">&#8599;</span>
                                    <span className="sr-only"> (opens in a new tab)</span>
                                </a>
                            </p>
                        </div>
                        <div className="flex flex-col items-start gap-4">
                            <Magnetic>
                                <Link href={siteMetadata.contact} className={primaryCta}>
                                    Send me a note <span aria-hidden="true">&rarr;</span>
                                </Link>
                            </Magnetic>
                            <a href={`mailto:${siteMetadata.email}`} className={ghostCta}>{siteMetadata.email}</a>
                            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Find me elsewhere">
                                {channels.map((c) => (
                                    <li key={c.label}>
                                        {c.external ? (
                                            <a href={c.href} target="_blank" rel="noopener noreferrer" className={sub}>
                                                {c.label}<span className="sr-only"> (opens in a new tab)</span>
                                            </a>
                                        ) : (
                                            <Link href={c.href} className={sub}>{c.label}</Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}
