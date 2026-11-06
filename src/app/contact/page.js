import ContactForm from "@/components/Contact/ContactForm";
import siteMetadata from "@/utils/metaData";
import Avator from "@/components/Portfolio/Avator";
import { createPageMetadata, createContactJsonLd } from "@/lib/metadata";
import JsonLd from "@/components/JsonLd";

export const metadata = createPageMetadata({
    title: "Contact Me",
    description: `Contact me through the form available on this page or email me at ${siteMetadata.email}`,
    keywords: [
        "contact",
        "hire developer",
        "Software by JC contact",
        "JC Ashley contact",
        "freelance developer",
    ],
    url: `${siteMetadata.siteUrl}/contact`,
    ogTitle: "Contact Me | By JC",
});

export default function Contact() {
    const jsonLd = createContactJsonLd();

    return (
        <>
            <JsonLd data={jsonLd} />
            <section className="relative overflow-hidden py-12 md:py-24">
                <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-1/4 -z-10 h-80 w-80 rounded-full bg-accent/15 dark:bg-accent-bright/10 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-violet/15 dark:bg-violet/10 blur-3xl" />

                <div className="container-page grid grid-cols-1 items-start gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-x-20 lg:gap-y-12">
                    {/* Left: intro + avatar */}
                    <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
                        <p className="eyebrow text-gradient reveal-up" style={{ "--i": 0 }}>Contact / Say hello</p>
                        <h1 className="display-xl mt-5 text-balance">
                            <span className="reveal-line"><span className="reveal-line-inner" style={{ "--i": 0 }}>Let&apos;s</span></span>{" "}
                            <span className="reveal-line"><span className="reveal-line-inner text-gradient gradient-flow" style={{ "--i": 1 }}>Connect!</span></span>
                        </h1>
                        <p className="reveal-up mt-6 max-w-lg text-lg text-muted text-balance md:text-xl" style={{ "--i": 2 }}>
                            Have a project in mind or just want to say hi? Feel free to reach out using the form below or book a quick chat.
                        </p>
                    </div>

                    {/* Right: form */}
                    <div className="reveal-up w-full min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1" style={{ "--i": 2 }}>
                        <ContactForm />
                    </div>

                    <div className="reveal-up flex min-w-0 flex-col items-center justify-center lg:col-start-1 lg:row-start-2 lg:items-start lg:justify-start" style={{ "--i": 2 }}>
                        <Avator />
                    </div>
                </div>
            </section>
        </>
    );
}
