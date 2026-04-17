
import siteMetadata from "@/utils/metaData";
import Image from "next/image";
import Avator from "@/components/Portfolio/Avator";

import { sections } from "@/data/about";


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
                    url: `${siteMetadata.siteUrl}/public/about-images/justme.png`,
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
            image: `${siteMetadata.siteUrl}/public/about-images/justme.png`,
        },
        canonical: `${siteMetadata.siteUrl}/about`,
    };
}


export default function AboutPage() {

    return (
        <div className="transition-colors duration-300 px-8 py-20">
            {/* Hero Section */}
            <h2 className="font-bold text-center capitalize mx-16 text-4xl xs:text-3xl xl:text-6xl">
                Hey, I’m JC 😏
            </h2>
                <Avator />

            {/* Sections */}
            {sections?.map((section, index) => (
                <div
                    key={index}
                    className={`w-full flex flex-col ${
                        section.reverse ? "md:flex-row-reverse" : "md:flex-row"
                    } items-center justify-between px-5 xs:px-10 lg:px-16 py-12 gap-8 border-b border-accent dark:border-accentDark`}
                >
                    <div className="w-full md:w-1/2 flex justify-center">
                        <Image
                            src={section.image}
                            alt={section.alt}
                            width={500}
                            height={500}
                            className="rounded-lg shadow-lg"
                            priority
                        />
                    </div>
                    <div className="w-full md:w-1/2">
                    <h3 className="font-semibold capitalize text-accent dark:text-accentDark text-2xl md:text-3xl lg:text-5xl mb-4">
                        <span
                            className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50
                            dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500"
                        >
                            {section.title}
                        </span>
                    </h3>

                        <p className="text-lg tracking-wide leading-loose">{section.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
