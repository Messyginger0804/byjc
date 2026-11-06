import Link from "next/link";
import siteMetadata from "@/utils/metaData";
import { Magnetic, Reveal } from "@/components/Motion";
import { focusRing, ghostCta, primaryCta } from "./styles";

const TRUST = [
    "Based in Dallas, works with teams anywhere",
    "Clear scope before code",
    "You own your code and your hosting",
];

function Check() {
    return (
        <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-accent dark:text-accent-bright" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="10" cy="10" r="8.25" opacity="0.35" />
            <path d="m6.5 10.2 2.3 2.3 4.7-5" />
        </svg>
    );
}

export default function ContactPanel() {
    const sub = `inline-flex rounded font-medium text-accent underline decoration-2 underline-offset-4 transition-opacity hover:opacity-70 dark:text-accent-bright ${focusRing}`;
    return (
        <section className="container-page" aria-labelledby="contact-heading">
            <Reveal>
                <div className="gradient-border glass relative overflow-hidden rounded-[2rem] p-8 md:p-14">
                    <div className="svc-aurora" aria-hidden="true" />
                    <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                        <div>
                            <p className="eyebrow text-gradient mb-3">Work with me</p>
                            <h2 id="contact-heading" className="display-lg font-display text-balance">
                                Tell me what you&apos;re <span className="text-gradient">trying to build</span>
                            </h2>
                            <p className="mt-5 max-w-xl text-lg text-dark/75 dark:text-white/75">
                                Send a few lines or grab a time on my calendar. We&apos;ll talk it through and I&apos;ll tell you plainly whether I&apos;m the right fit.
                            </p>
                            <ul className="mt-6 space-y-3">
                                {TRUST.map((t) => (
                                    <li key={t} className="flex items-start gap-3">
                                        <Check />
                                        <span>{t}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex flex-col items-start gap-4">
                            <Magnetic>
                                <Link href={siteMetadata.contact} className={primaryCta}>
                                    Start a project <span aria-hidden="true">&rarr;</span>
                                </Link>
                            </Magnetic>
                            <a href={siteMetadata.booking} target="_blank" rel="noopener noreferrer" className={ghostCta}>
                                Book a call<span className="sr-only"> (opens in a new tab)</span>
                            </a>
                            <p className="text-sm text-dark/80 dark:text-white/80">
                                Prefer email?{" "}
                                <a href={`mailto:${siteMetadata.email}`} className={sub}>{siteMetadata.email}</a>
                            </p>
                            <p className="text-sm text-dark/80 dark:text-white/80">
                                Or follow along via{" "}
                                <Link href="/feed.xml" className={sub}>RSS</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}
