import AboutCover from "@/components/Portfolio/AboutCover";
import Portfolio from "@/components/Portfolio/Portfolio";
import Professional from "@/components/Portfolio/Professional";
import Skills from "@/components/Portfolio/Skills";
import Link from "next/link";
import siteMetadata from "@/utils/metaData";
import Resume from "@/components/Portfolio/Resume";
import Recommendations from "@/components/recommendations";

export async function generateMetadata() {
    const headshot = `${siteMetadata.siteUrl}${siteMetadata.portfolioImage}`;

    return {
        title: "Portfolio | By JC",
        description: "Explore the portfolio of JC Ashley, showcasing projects, skills, and professional recommendations as a software engineer.",
        keywords: [
            "JC Ashley portfolio",
            "software engineer portfolio",
            "projects by JC Ashley",
            "web developer portfolio",
            "hire JC Ashley",
        ],
        author: "JC Ashley",
        openGraph: {
            title: "Portfolio | By JC",
            description: "Explore the portfolio of JC Ashley, showcasing projects, skills, and professional recommendations as a software engineer.",
            url: `${siteMetadata.siteUrl}/portfolio`,
            siteName: siteMetadata.title,
            locale: "en_US",
            type: "website",
            images: [
                {
                    url: headshot,
                    width: 1200,
                    height: 630,
                    alt: "JC Ashley - Software Engineer Portfolio",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: "Portfolio | JC Ashley - Software Engineer",
            description: "Explore the portfolio of JC Ashley, showcasing projects, skills, and professional recommendations as a software engineer.",
            image: headshot,
        },
        canonical: `${siteMetadata.siteUrl}/portfolio`,
    };
}

export default function PortfolioPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "JC Ashley",
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

            <section id="resume-skills" className="py-8 px-5 xs:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-8 border-b-2 border-solid border-dark dark:border-light">
                <Resume />
                <Skills />
            </section>

            <section>
                <Recommendations />
            </section>

            <section id="portfolio">
                <Professional />
                <Portfolio />
            </section>
        </>
    );
}
