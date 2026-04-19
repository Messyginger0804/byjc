
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
        <div className="transition-colors duration-300 px-6 sm:px-12 py-12 md:py-24">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center mb-12 md:mb-24">
                <h2 className="font-bold text-center capitalize text-4xl xs:text-5xl lg:text-7xl tracking-tight text-balance leading-tight">
                    Hey, I’m <span className="text-accent dark:text-accentDark">JC</span> 😏
                </h2>
                <div className="mt-8">
                    <Avator />
                </div>
            </div>

            {/* Sections */}
            <div className="max-w-7xl mx-auto space-y-12 md:space-y-20">
                {sections?.map((section, index) => (
                    <div
                        key={index}
                        className={`w-full flex flex-col ${
                            section.reverse ? "md:flex-row-reverse" : "md:flex-row"
                        } items-center justify-between px-4 sm:px-8 py-16 gap-12 glass rounded-[2.5rem] shadow-modern`}
                    >
                        <div className="w-full md:w-1/2 flex justify-center group">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accentDark rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                <Image
                                    src={section.image}
                                    alt={section.alt}
                                    width={500}
                                    height={500}
                                    className="relative rounded-2xl shadow-modern group-hover:shadow-modern-lg transition-all duration-500"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-1/2">
                            <h3 className="font-bold capitalize text-accent dark:text-accentDark text-2xl md:text-3xl lg:text-5xl mb-6 tracking-tight leading-tight">
                                <span
                                    className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50
                                    dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 pb-2"
                                >
                                    {section.title}
                                </span>
                            </h3>

                            <p className="text-lg md:text-xl tracking-tight leading-relaxed opacity-90 text-balance">{section.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
