import AboutCover from "@/components/About/AboutCover";
import Portfolio from "@/components/About/Portfolio";
import Professional from "@/components/About/Professional";
import Skills from "@/components/About/Skills";
import Link from "next/link";
import siteMetadata from "@/utils/metaData";
import Image from "next/image";

export async function generateMetadata() {
    // const imageList = [siteMetadata.portfolioImage];
    // const ogImages = imageList.map((img) => {
    //     return { url: img?.includes("http") ? img : siteMetadata.siteUrl + img };
    // });

    const headshot = [siteMetadata.porrfolioImage];

    return {
        title: "Jeremy Ashley's Portfolio",
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
            siteMetadata.twitter
        ],
        "jobTitle": "Software Engineer",
        "worksFor": {
            "@type": "Organization",
            "name": "iServiceWeb"
        },
        "image": siteMetadata.siteUrl + siteMetadata.portfolioImage // Professional headshot
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AboutCover />
            <Skills />
            <section id="portfolio">
                <Professional />
                <Portfolio />
            </section>
            <h2 className="mt-8 font-semibold text-lg md:text-2xl self-start mx-5 xs:mx-10 sm:mx-12 md:mx-16 lg:mx-20 text-dark dark:text-light dark:font-normal">
                Have a project in mind? Reach out to me <a href="tel:2149493126">📞</a> from <Link href="/contact" className="!underline underline-offset-2">here</Link> and let's make it happen.
            </h2>
        </>
    );
}
