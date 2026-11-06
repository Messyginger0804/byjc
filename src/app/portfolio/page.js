import AboutCover from "@/components/Portfolio/AboutCover";
import Portfolio from "@/components/Portfolio/Portfolio";
import Professional from "@/components/Portfolio/Professional";
import Skills from "@/components/Portfolio/Skills";
import siteMetadata from "@/utils/metaData";
import Resume from "@/components/Portfolio/Resume";
import Recommendations from "@/components/recommendations";
import ClientStrip from "@/components/Home/ClientStrip";
import JsonLd from "@/components/JsonLd";

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
        alternates: {
            canonical: `${siteMetadata.siteUrl}/portfolio`,
        },
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
        "jobTitle": "Senior Software Engineer",
        "worksFor": {
            "@type": "Organization",
            "name": "Craft Digital",
        },
        "image": siteMetadata.siteUrl + siteMetadata.portfolioImage,
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <AboutCover />

            <section className="container-page pb-4 md:pb-8" aria-label="Companies and brands">
                <ClientStrip heading="Companies & brands I've worked with" includeEmployers className="" />
            </section>

            <div id="resume-skills">
                <Resume />
                <Skills />
            </div>

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
