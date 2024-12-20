import AboutCover from "@/components/Portfolio/AboutCover";
import Portfolio from "@/components/Portfolio/Portfolio";
import Professional from "@/components/Portfolio/Professional";
import Skills from "@/components/Portfolio/Skills";
import Link from "next/link";
import siteMetadata from "@/utils/metaData";
import Resume from "@/components/Portfolio/Resume";

export async function generateMetadata() {
    const headshot = [siteMetadata.porrfolioImage];

    return {
        title: "Portfolio",
        description: "Showcasing my work and projects as a software engineer.",
        openGraph: {
            title: "Jeremy Ashley's Portfolio",
            description: "Showcasing my work and projects as a software engineer.",
            url: siteMetadata.siteUrl + "/portfolio",
            siteName: siteMetadata.title,
            locale: "en_US",
            type: "website",
            images: headshot,
        },
        twitter: {
            card: "summary_large_image",
            title: "Jeremy Ashley's Portfolio",
            description: "Showcasing my work and projects as a software engineer.",
            images: headshot,
        },
    };
}

export default function PortfolioPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Jeremy Ashley",
        "url": siteMetadata.siteUrl + "/portfolio",
        "sameAs": [
            siteMetadata.linkedin,
            siteMetadata.github,
            siteMetadata.twitter,
        ],
        "jobTitle": "Software Engineer",
        "worksFor": {
            "@type": "Organization",
            "name": "Onix Media",
        },
        "image": siteMetadata.siteUrl + siteMetadata.portfolioImage,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AboutCover />
            <Resume />
            <Skills />
            <section id="portfolio">
                <Professional />
                <Portfolio />
            </section>
            <h2 className="text-center mt-8 font-semibold text-lg md:text-2xl self-start mx-5 xs:mx-10 sm:mx-12 md:mx-16 lg:mx-20 text-dark dark:text-light dark:font-normal">
                Have a project in mind? Reach out to me <a href="tel:2149493126">📞</a> from{" "}
                <Link href="/contact" className="!underline underline-offset-2">
                    here
                </Link>{" "}
                and let's make it happen.
            </h2>
        </>
    );
}
