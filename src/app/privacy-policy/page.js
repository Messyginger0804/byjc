import siteMetadata from "@/utils/metaData";
import Image from "next/image";
import privacy from "./water-cooler.png";

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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <section className="w-full min-h-screen px-6 sm:px-12 py-12 md:py-24">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-12">

                {/* Image */}
                <div className="w-full lg:w-1/3 flex justify-center items-start">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accentDark rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                        <Image
                            src={privacy}
                            alt="Privacy Policy"
                            className="relative rounded-2xl shadow-modern w-full max-w-sm lg:max-w-full h-auto"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-2/3 glass rounded-[2.5rem] shadow-modern p-8 sm:p-12 space-y-8">
                    <h1 className="font-bold capitalize text-3xl sm:text-4xl lg:text-5xl tracking-tight text-balance">
                        Privacy <span className="text-accent dark:text-accentDark">Policy</span>
                    </h1>

                    <p className="text-base sm:text-lg leading-relaxed opacity-90">
                        Welcome to the Privacy Policy page. Here, you will find information about how we collect, use, and protect your data when using this website and related tools, including the{" "}
                        <span className="text-accent dark:text-accentDark font-semibold">Jokes By JC Chrome extension</span>.
                    </p>

                    <div className="space-y-2">
                        <h2 className="font-bold text-xl sm:text-2xl text-accent dark:text-accentDark">Data Collection</h2>
                        <p className="text-sm sm:text-base leading-relaxed opacity-90">
                            We do not collect personal data. However, minimal browser storage may be used for preferences like joke frequency.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h2 className="font-bold text-xl sm:text-2xl text-accent dark:text-accentDark">Permissions</h2>
                        <p className="text-sm sm:text-base leading-relaxed opacity-90">
                            The Jokes By JC Chrome extension may request the following permissions:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-3 text-sm sm:text-base">
                                <span className="mt-1 w-2 h-2 rounded-full bg-accent dark:bg-accentDark shrink-0" />
                                <span><strong>Active Tab:</strong> To interact with the current tab for joke display.</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm sm:text-base">
                                <span className="mt-1 w-2 h-2 rounded-full bg-accent dark:bg-accentDark shrink-0" />
                                <span><strong>Storage:</strong> To save user preferences locally in your browser.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h2 className="font-bold text-xl sm:text-2xl text-accent dark:text-accentDark">Third-Party APIs</h2>
                        <p className="text-sm sm:text-base leading-relaxed opacity-90">
                            The Jokes By JC Chrome extension fetches jokes dynamically using trusted APIs, including:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-3 text-sm sm:text-base">
                                <span className="mt-1 w-2 h-2 rounded-full bg-accent dark:bg-accentDark shrink-0" />
                                <span><strong>Primary API:</strong> Fetches daily jokes.</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm sm:text-base">
                                <span className="mt-1 w-2 h-2 rounded-full bg-accent dark:bg-accentDark shrink-0" />
                                <span><strong>Backup API:</strong> A fallback if the primary API is unavailable.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h2 className="font-bold text-xl sm:text-2xl text-accent dark:text-accentDark">Contact</h2>
                        <p className="text-sm sm:text-base leading-relaxed opacity-90">
                            For questions or concerns, email us at{" "}
                            <a
                                href={`mailto:${siteMetadata.email}`}
                                className="text-accent dark:text-accentDark underline underline-offset-4 hover:opacity-80 transition-opacity"
                            >
                                {siteMetadata.email}
                            </a>.
                        </p>
                    </div>

                    <p className="text-xs text-gray pt-4 border-t border-white/10">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </section>
        </>
    );
}
