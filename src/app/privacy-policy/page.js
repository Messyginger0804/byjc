import siteMetadata from "@/utils/metaData";
import Image from "next/image";
import privacy from "./water-cooler.png";
import JsonLd from "@/components/JsonLd";

export const metadata = {
    title: "Privacy Policy",
    description: "Learn about how we collect, use, and protect your data.",
    keywords: [
        "privacy policy",
        "data protection",
        "Jokes by JC",
        "Chrome extension privacy",
        "Software by JC privacy",
    ],
    openGraph: {
        title: "Privacy Policy | By JC",
        description: "Learn about how we collect, use, and protect your data.",
        url: `${siteMetadata.siteUrl}/privacy-policy`,
        siteName: siteMetadata.title,
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Privacy Policy | By JC",
        description: "Learn about how we collect, use, and protect your data.",
    },
    alternates: {
        canonical: `${siteMetadata.siteUrl}/privacy-policy`,
    },
};

export default function PrivacyPolicy() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Privacy Policy",
        "url": `${siteMetadata.siteUrl}/privacy-policy`,
        "description": "Learn about how we collect, use, and protect your data.",
        "author": {
            "@type": "Person",
            "name": siteMetadata.author,
            "url": siteMetadata.siteUrl + "/portfolio",
        },
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <section className="container-page py-12 md:py-24">
            <div className="mx-auto flex max-w-6xl flex-col items-start gap-12 lg:flex-row lg:gap-16">

                {/* Image */}
                <div className="flex w-full items-start justify-center lg:sticky lg:top-28 lg:w-1/3">
                    <div className="relative group">
                        <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] bg-signal opacity-20 blur-2xl transition-opacity duration-700 group-hover:opacity-40" />
                        <Image
                            src={privacy}
                            alt="Privacy Policy"
                            className="relative h-auto w-full max-w-sm rounded-[2rem] lg:max-w-full"
                            sizes="(min-width: 1024px) 380px, 90vw"
                            priority
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="w-full space-y-8 glass rounded-[2.5rem] p-8 sm:p-12 lg:w-2/3">
                    <div>
                        <p className="eyebrow text-gradient reveal-up" style={{ "--i": 0 }}>Legal / Your data</p>
                        <h1 className="display-lg mt-3 text-balance">
                            <span className="reveal-line"><span className="reveal-line-inner" style={{ "--i": 0 }}>Privacy</span></span>{" "}
                            <span className="reveal-line"><span className="reveal-line-inner text-gradient" style={{ "--i": 1 }}>Policy</span></span>
                        </h1>
                    </div>

                    <p className="text-base sm:text-lg leading-relaxed">
                        Welcome to the Privacy Policy page. Here, you will find information about how we collect, use, and protect your data when using this website and related tools, including the{" "}
                        <span className="text-accent dark:text-accent-bright font-semibold">Jokes By JC Chrome extension</span>.
                    </p>

                    <div className="space-y-2">
                        <h2 className="font-bold text-xl sm:text-2xl tracking-tight text-accent dark:text-accent-bright">Data Collection</h2>
                        <p className="text-base leading-relaxed">
                            We do not collect personal data. However, minimal browser storage may be used for preferences like joke frequency.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h2 className="font-bold text-xl sm:text-2xl tracking-tight text-accent dark:text-accent-bright">Permissions</h2>
                        <p className="text-base leading-relaxed">
                            The Jokes By JC Chrome extension may request the following permissions:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-3 text-base">
                                <span className="mt-1 w-2 h-2 rounded-full bg-signal shrink-0" />
                                <span><strong>Active Tab:</strong> To interact with the current tab for joke display.</span>
                            </li>
                            <li className="flex items-start gap-3 text-base">
                                <span className="mt-1 w-2 h-2 rounded-full bg-signal shrink-0" />
                                <span><strong>Storage:</strong> To save user preferences locally in your browser.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h2 className="font-bold text-xl sm:text-2xl tracking-tight text-accent dark:text-accent-bright">Third-Party APIs</h2>
                        <p className="text-base leading-relaxed">
                            The Jokes By JC Chrome extension fetches jokes dynamically using trusted APIs, including:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-3 text-base">
                                <span className="mt-1 w-2 h-2 rounded-full bg-signal shrink-0" />
                                <span><strong>Primary API:</strong> Fetches daily jokes.</span>
                            </li>
                            <li className="flex items-start gap-3 text-base">
                                <span className="mt-1 w-2 h-2 rounded-full bg-signal shrink-0" />
                                <span><strong>Backup API:</strong> A fallback if the primary API is unavailable.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h2 className="font-bold text-xl sm:text-2xl tracking-tight text-accent dark:text-accent-bright">Contact</h2>
                        <p className="text-base leading-relaxed">
                            For questions or concerns, email us at{" "}
                            <a
                                href={`mailto:${siteMetadata.email}`}
                                className="rounded text-accent dark:text-accent-bright underline underline-offset-4 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2"
                            >
                                {siteMetadata.email}
                            </a>.
                        </p>
                    </div>

                    <p className="text-xs text-muted pt-4 border-t border-black/10 dark:border-white/10">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </section>
        </>
    );
}
