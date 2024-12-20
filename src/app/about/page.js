import Link from "next/link";
import siteMetadata from "@/utils/metaData";
import Image from "next/image";
import Avator from "@/components/Portfolio/Avator";

import fam from "../../../public/about-images/ma-and-fam.jpg";
import service from "../../../public/about-images/service.jpg";
import cyc from "../../../public/about-images/cyc.avif";
import dsd from "../../../public/about-images/dsd.avif";

export async function generateMetadata() {
    return {
        title: "About Me | Software by JC",
        description: "Get to know more about Jeremy Ashley, the person behind Software by JC.",
        openGraph: {
            title: "About Me | Software by JC",
            description: "Get to know more about Jeremy Ashley, the person behind Software by JC.",
            url: `${siteMetadata.siteUrl}/about`,
            siteName: siteMetadata.title,
            locale: "en_US",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: "About Me | Software by JC",
            description: "Get to know more about Jeremy Ashley, the person behind Software by JC.",
        },
    };
}

export default function AboutPage() {
    const sections = [
        {
            title: "Family Man",
            text: `As a proud father of three, my family is at the heart of everything I do. They inspire me to push boundaries and strive for excellence in all aspects of life. Whether it’s late-night coding or weekend adventures, I cherish every moment spent with them and work to create a better future for us all.`,
            image: fam,
            alt: "Me with my family",
            reverse: false,
        },
        {
            title: "Service Industry Roots",
            text: `Before diving into software development, I spent 7 years in the service industry as a manager. This experience taught me the importance of communication, leadership, and adaptability—skills that continue to serve me well in my tech career.`,
            image: service,
            alt: "Service industry work",
            reverse: true,
        },
        {
            title: "Commit Your Code Conference 2024",
            text: `Attending the Commit Your Code Conference in 2024 was an incredible experience. It was my first-ever tech conference, and it opened my eyes to the endless possibilities in our industry. From inspiring talks to networking with other developers, every moment was unforgettable. I’m already looking forward to potentially volunteering at next year’s event and giving back to this amazing community.`,
            image: cyc,
            alt: "Commit Your Code Conference",
            reverse: false,
        },
        {
            title: "Dallas Software Developer",
            text: `As an active member of the Dallas Software Developer Meetups, I’ve had the opportunity to share my knowledge and learn from an incredible community of tech enthusiasts. Giving talks and collaborating with fellow developers has been both rewarding and enriching. I’m excited for future opportunities to engage with this vibrant community.`,
            image: dsd,
            alt: "Dallas Software Developer Meetup",
            reverse: true,
        },
    ];

    return (
        <div className="bg-light text-dark dark:bg-dark dark:text-light transition-colors duration-300 px-8 py-20">
            {/* Hero Section */}
            <h2 className="font-bold text-center capitalize mx-16 text-4xl xs:text-3xl xl:text-6xl">
                Hey, I’m JC 😏
            </h2>
            {/* <div className="border-b border-accent dark:border-accentDark"> */}
                <Avator />
            {/* </div> */}

            {/* Sections */}
            {sections.map((section, index) => (
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

                        <p className="text-lg leading-relaxed">{section.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
